import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { EmailType, Locale, Organization, Prisma } from '@prisma/client'
import { CustomPrismaService } from 'nestjs-prisma'

import { TRANSACTIONAL_EMAIL_DATABASE_PREFIX } from '../common/constants/database-prefixes.constants'
import { TRANSACTION_EMAIL_RELATIONS } from '../common/constants/database-relation-fields.constants'
import { SYSTEM } from '../common/constants/miscellaneous.constants'
import { QueryDto } from '../common/dto/query.dto'
import { formatExpand } from '../common/endpoint-features/expand'
import { formatOrderBy } from '../common/endpoint-features/order-by'
import { formatSearch } from '../common/endpoint-features/search'
import { IdsService } from '../common/ids/ids.service'
import { EmailsService } from '../email/emails.service'
import { DefaultScopedLoggerService } from '../logger/logger.service'
import { extendedPrismaClient } from '../prisma.extension'
import { TestTransactionalEmailDto } from './dto/test-transactional-email.dto'
import { UpdateTransactionalEmailDto } from './dto/update-transactional-email.dto'

@Injectable()
export class TransactionalEmailsService {
  constructor(
    @Inject('PrismaService')
    private prisma: CustomPrismaService<extendedPrismaClient>,
    private readonly idsService: IdsService,
    private readonly loggerService: DefaultScopedLoggerService,
    private readonly emailsService: EmailsService,
    private readonly configService: ConfigService
  ) {}

  async create(
    organizationId: string,
    livemode: boolean,
    EmailSystemId: string,
    createdBy: string = SYSTEM
  ) {
    const id = this.idsService.createId(TRANSACTIONAL_EMAIL_DATABASE_PREFIX)
    const systemTransactionalEmail = await this.findOne(EmailSystemId)

    if (!systemTransactionalEmail) {
      throw new NotFoundException(
        `The default (system) transactional email with the ID ${EmailSystemId} does not exist.`
      )
    }
    if (systemTransactionalEmail.organizationId !== null) {
      throw new BadRequestException(
        `You can not create a new custom transactional email from a non-default (system) transactional email.`
      )
    }

    return await this.prisma.client.transactionalEmail.create({
      data: {
        id,
        fromEmail: systemTransactionalEmail.fromEmail,
        type: systemTransactionalEmail.type,
        subject: systemTransactionalEmail.subject,
        preheaderText: systemTransactionalEmail.preheaderText,
        locale: systemTransactionalEmail.locale,
        body: systemTransactionalEmail.body,
        variables: systemTransactionalEmail.variables as Prisma.JsonObject,
        organization: { connect: { id: organizationId } },
        livemode,
        createdBy,
        updatedBy: createdBy,
      },
    })
  }

  async findOneByOrganizationIdAndLivemode(
    id: string,
    organizationId: string,
    livemode: boolean,
    query?: QueryDto,
    isInternal?: boolean
  ) {
    const include = formatExpand(TRANSACTION_EMAIL_RELATIONS, query?.expand)

    return await this.prisma.client.transactionalEmail.findFirst({
      include,
      where: {
        OR: [
          { id, organizationId, livemode },
          { id, organizationId: null, livemode },
        ],
        ...(typeof isInternal === 'boolean' && { isInternal }),
      },
    })
  }

  async findOneByorganizationIdAndLivemodeAndTypeAndLocale(
    organizationId: string | undefined,
    livemode: boolean,
    type: EmailType,
    locale: Locale
  ) {
    return await this.prisma.client.transactionalEmail.findFirst({
      orderBy: {
        organizationId: 'desc',
      },
      where: {
        OR: [
          {
            organizationId: organizationId ?? undefined,
            livemode,
            type,
            locale,
          },
          { organizationId: null, livemode, type, locale },
        ],
      },
    })
  }

  async findOne(id: string, query?: QueryDto) {
    const include = formatExpand(TRANSACTION_EMAIL_RELATIONS, query?.expand)
    return await this.prisma.client.transactionalEmail.findUnique({
      include,
      where: { id },
    })
  }

  async findByOrganizationIdAndLivemode(
    organizationId: string,
    livemode: boolean,
    query?: QueryDto,
    isInternal?: boolean
  ) {
    const include = formatExpand(TRANSACTION_EMAIL_RELATIONS, query?.expand)
    const orderBy = formatOrderBy(
      Prisma.CustomerScalarFieldEnum,
      query?.orderBy
    )
    const search = formatSearch(Prisma.CustomerScalarFieldEnum, query?.search)

    const [data, count] = await this.prisma.client.$transaction([
      this.prisma.client.transactionalEmail.findMany({
        distinct: ['type', 'locale', 'organizationId'],
        skip: query?.skip,
        take: query?.take,
        orderBy: [
          { type: 'asc' },
          { organizationId: isInternal ? 'asc' : 'desc' },
          { locale: 'asc' },
          { ...orderBy },
        ],
        include,
        where: {
          OR: [
            { organizationId, livemode, ...search },
            { organizationId: null, livemode, ...search },
          ],
          ...(typeof isInternal === 'boolean' && { isInternal }),
        },
      }),
      this.prisma.client.transactionalEmail.count({
        where: {
          OR: [
            { organizationId, livemode, ...search },
            { organizationId: null, livemode, ...search },
          ],
          ...(typeof isInternal === 'boolean' && { isInternal }),
        },
      }),
    ])
    return { data, count }
  }

  async update(
    id: string,
    livemode: boolean,
    updateTransactionalEmailDto: UpdateTransactionalEmailDto,
    updatedBy: string = SYSTEM
  ) {
    return await this.prisma.client.transactionalEmail.update({
      data: {
        ...updateTransactionalEmailDto,
        updatedBy,
      },
      where: {
        id,
        livemode,
      },
    })
  }

  async remove(id: string, organizationId: string, livemode: boolean) {
    const transactionalEmailToRemove =
      await this.findOneByOrganizationIdAndLivemode(
        id,
        organizationId,
        livemode
      )

    if (!transactionalEmailToRemove) {
      throw new NotFoundException(`Transactional email with id ${id} not found`)
    }

    if (transactionalEmailToRemove.organizationId === null) {
      throw new BadRequestException(
        `You can not remove a default (system) transactional email.`
      )
    }

    return await this.prisma.client.transactionalEmail.delete({ where: { id } })
  }

  async sendTransactionalEmail(
    id: string,
    organization: Organization,
    livemode: boolean,
    testTransactionalEmailDto: TestTransactionalEmailDto
  ) {
    const transactionalEmail = await this.findOneByOrganizationIdAndLivemode(
      id,
      organization.id,
      livemode
    )

    if (!transactionalEmail) {
      throw new NotFoundException(`Transactional email with id ${id} not found`)
    }
    this.loggerService.log(
      `Sending test ${transactionalEmail.type} email to ${testTransactionalEmailDto.email}`,
      {
        service: TransactionalEmailsService.name,
        method: this.sendTransactionalEmail.name,
        object: transactionalEmail,
      }
    )
    try {
      const response = await this.emailsService.send({
        to: testTransactionalEmailDto.email,
        fromEmail: transactionalEmail.fromEmail,
        fromName: organization.fromEmailName || undefined,
        subject: testTransactionalEmailDto.body || transactionalEmail.subject,
        html: testTransactionalEmailDto.body || transactionalEmail.body,
        dynamicTemplateData:
          testTransactionalEmailDto.variables ||
          testTransactionalEmailDto.variables ||
          {},
      })
      this.loggerService.log(
        `Successfully sent test ${transactionalEmail.type} email to ${testTransactionalEmailDto.email}`,
        {
          service: TransactionalEmailsService.name,
          method: this.sendTransactionalEmail.name,
          object: response,
        }
      )
      return response
    } catch (error) {
      this.loggerService.error(
        `Failed to send test ${transactionalEmail.type} email to ${testTransactionalEmailDto.email}`,
        error.stack,
        {
          service: TransactionalEmailsService.name,
          method: this.sendTransactionalEmail.name,
          object: error,
        }
      )
      throw new BadRequestException(`Failed to send email: ${error.message}`)
    }
  }
}
