import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common'
import { ApiKeyType, Prisma } from '@prisma/client'
import * as bcrypt from 'bcrypt'
import { CustomPrismaService } from 'nestjs-prisma'
import { uid } from 'uid'

import {
  API_KEY_DATABASE_PREFIX,
  DATABASE_PREFIX_SEPARATOR,
  LIVEMODE_DATABASE_PREFIX,
  ORGANIZATION_DATABASE_PREFIX,
  PUBLIC_KEY_DATABASE_PREFIX,
  SECRET_KEY_DATABASE_PREFIX,
  TESTMODE_DATABASE_PREFIX,
} from '../common/constants/database-prefixes.constants'
import {
  API_KEY_RANDOM_PART_LENGTH,
  SALT_ROUNDS,
} from '../common/constants/encryption'
import { SYSTEM } from '../common/constants/miscellaneous.constants'
import { IdsService } from '../common/ids/ids.service'
import { DefaultScopedLoggerService } from '../logger/logger.service'
import { OrganizationsService } from '../organizations/organizations.service'
import { extendedPrismaClient } from '../prisma.extension'
import { CreateApiKeyDto } from './dto/create-api-key.dto'
import { UpdateApiKeyDto } from './dto/update-api-key.dto'

@Injectable()
export class ApiKeysService {
  constructor(
    @Inject('PrismaService')
    private prisma: CustomPrismaService<extendedPrismaClient>,
    private readonly idsService: IdsService,
    @Inject(forwardRef(() => OrganizationsService))
    private readonly organizationsService: OrganizationsService,
    private readonly loggerService: DefaultScopedLoggerService
  ) {}

  async getCreateData(
    organizationId: string,
    livemode: boolean,
    createApiKeyDto: CreateApiKeyDto,
    createdBy: string = SYSTEM
  ) {
    const id = this.idsService.createId(API_KEY_DATABASE_PREFIX)
    const typePrefix =
      createApiKeyDto.type === ApiKeyType.SECRET
        ? SECRET_KEY_DATABASE_PREFIX
        : PUBLIC_KEY_DATABASE_PREFIX
    const mode =
      livemode === true ? LIVEMODE_DATABASE_PREFIX : TESTMODE_DATABASE_PREFIX
    const organizationIdWithoutPrefix = organizationId.replace(
      `${ORGANIZATION_DATABASE_PREFIX}${DATABASE_PREFIX_SEPARATOR}`,
      ''
    )
    const prefix = `${typePrefix}${DATABASE_PREFIX_SEPARATOR}${mode}${DATABASE_PREFIX_SEPARATOR}`
    // OrgId is hidden in the key
    const key = `${prefix}${organizationIdWithoutPrefix}${uid(
      API_KEY_RANDOM_PART_LENGTH
    )}`
    const hashedKey = await bcrypt.hash(key, SALT_ROUNDS)
    const data: Prisma.ApiKeyCreateInput = {
      id,
      organization: { connect: { id: organizationId } },
      livemode,
      key,
      hashedKey,
      name: createApiKeyDto.name,
      type: createApiKeyDto.type,
      createdBy,
      updatedBy: createdBy,
    }

    // If we are creating an sk_live key, we do not want to store it in DB. Instead we store a preview ('sk_live_...XXXXXX') and a hash.
    if (createApiKeyDto.type === ApiKeyType.SECRET && livemode === true) {
      data.key = `${prefix}...${key.slice(-4)}`
    }

    return { data, key }
  }

  async create(
    organizationId: string,
    livemode: boolean,
    createApiKeyDto: CreateApiKeyDto,
    createdBy: string = SYSTEM
  ) {
    const { data, key } = await this.getCreateData(
      organizationId,
      livemode,
      createApiKeyDto,
      createdBy
    )

    const databaseKey = await this.prisma.client.apiKey.create({
      data,
    })
    // We still want to return the real key to the frontend, meaning that sk_live keys can be shown only once
    return { ...databaseKey, ...{ key } }
  }

  async update(
    id: string,
    updateApiKeyDto: UpdateApiKeyDto,
    updatedBy: string = SYSTEM
  ) {
    return await this.prisma.client.apiKey.update({
      data: {
        ...updateApiKeyDto,
        updatedBy,
      },
      where: { id },
    })
  }

  async roll(
    keyToRollId: string,
    organizationId: string,
    livemode: boolean,
    createApiKeyDto: CreateApiKeyDto,
    createdBy: string = SYSTEM
  ) {
    return await this.prisma.client.$transaction(
      async () => {
        const newKey = await this.create(
          organizationId,
          livemode,
          createApiKeyDto,
          createdBy
        )
        this.loggerService.log('New apiKey created', {
          controller: ApiKeysService.name,
          function: this.roll.name,
          objectId: newKey.id,
        })

        await this.hardRemove(keyToRollId, organizationId, livemode)
        this.loggerService.log('Old apiKey removed', {
          controller: ApiKeysService.name,
          function: this.roll.name,
          objectId: keyToRollId,
        })

        return newKey
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      }
    )
  }

  async getOrganizationFromKey(key: string) {
    const splittedKey = key.split(DATABASE_PREFIX_SEPARATOR)
    if (splittedKey.length !== 3) {
      throw new BadRequestException('Key has wrong format.')
    }

    // The organization id is hidden between the last '_' and the random part at the end of the key
    const organizationId = `${ORGANIZATION_DATABASE_PREFIX}${DATABASE_PREFIX_SEPARATOR}${splittedKey[2].slice(
      0,
      splittedKey[2].length - API_KEY_RANDOM_PART_LENGTH
    )}`
    return await this.organizationsService.findOne(organizationId)
  }

  getLivemodeFromKey(key: string) {
    const splittedKey = key.split(DATABASE_PREFIX_SEPARATOR)
    if (splittedKey.length !== 3) {
      throw new BadRequestException('Key has wrong format.')
    }

    return splittedKey[1] === LIVEMODE_DATABASE_PREFIX
  }

  async findOne(id: string) {
    return await this.prisma.client.apiKey.findUnique({
      where: { id },
    })
  }

  async findOneByOrganizationIdAndLivemode(
    id: string,
    organizationId: string,
    livemode: boolean
  ) {
    return await this.prisma.client.apiKey.findUnique({
      where: { id, organizationId, livemode },
    })
  }

  async findByOrganizationId(organizationId: string, livemode: boolean) {
    return await this.prisma.client.apiKey.findMany({
      where: { organizationId, livemode },
    })
  }

  async findByKey(key: string) {
    // If the key is a live secret key, we need to check the hashed value in the database
    const splittedKey = key.split(DATABASE_PREFIX_SEPARATOR)
    if (
      splittedKey[0] === SECRET_KEY_DATABASE_PREFIX &&
      splittedKey[1] === LIVEMODE_DATABASE_PREFIX
    ) {
      const organization = await this.getOrganizationFromKey(key)
      const secretKeys = await this.prisma.client.apiKey.findMany({
        where: {
          organizationId: organization?.id,
          livemode: true,
          type: ApiKeyType.SECRET,
        },
      })
      for (const secretKey of secretKeys) {
        if (bcrypt.compareSync(key, secretKey.hashedKey)) {
          return secretKey
        }
      }
    }

    // Otherwise we can just query directly the database with the key value
    return await this.prisma.client.apiKey.findFirst({
      where: { key },
    })
  }

  async findLiveSecretKeysByOrganizationId(organizationId: string) {
    return await this.prisma.client.apiKey.findMany({
      where: { organizationId, type: ApiKeyType.SECRET, livemode: true },
    })
  }

  async hardRemove(id: string, organizationId: string, livemode: boolean) {
    const key = await this.findOneByOrganizationIdAndLivemode(
      id,
      organizationId,
      livemode
    )
    if (!key) {
      throw new NotFoundException(`Api key with id ${id} not found.`)
    }

    return await this.prisma.client.$transaction(
      async () => {
        const remainingKeysCount = await this.prisma.client.apiKey.count({
          where: { livemode, type: key.type, organizationId },
        })

        if (remainingKeysCount === 1) {
          throw new BadRequestException(
            `Cannot delete the last ${key.type} key.`
          )
        }

        return await this.prisma.client.apiKey.delete({ where: { id } })
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      }
    )
  }
}
