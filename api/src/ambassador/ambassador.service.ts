import { organizations } from '@clerk/clerk-sdk-node'
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { EmailType, Locale, Prisma } from '@prisma/client'
import { CustomPrismaService } from 'nestjs-prisma'

import { AMBASSADOR_DATABASE_PREFIX } from '../common/constants/database-prefixes.constants'
import { AMBASSADOR_RELATIONS } from '../common/constants/database-relation-fields.constants'
import { QueryDto } from '../common/dto/query.dto'
import { formatExpand } from '../common/endpoint-features/expand'
import { formatOrderBy } from '../common/endpoint-features/order-by'
import { formatSearch } from '../common/endpoint-features/search'
import { IdsService } from '../common/ids/ids.service'
import { getTemplateName } from '../common/utils/find-whatsapp-template-name'
import { formatLink } from '../common/utils/format-link'
import { EmailsService } from '../email/emails.service'
import { extendedPrismaClient } from '../prisma.extension'
import { SlackService } from '../slack/slack.service'
import { TransactionalEmailsService } from '../transactional-emails/transactional-emails.service'
import { WhatsappService } from '../whatsapp/whatsapp.service'
import { CreateAmbassadorDto } from './dto/create-ambassador.dto'
import {
  UpdateAmbassadorDto,
  UpdateAmbassadorPostImageDto,
} from './dto/update-ambassador.dto'

@Injectable()
export class AmbassadorService {
  constructor(
    @Inject('PrismaService')
    private prisma: CustomPrismaService<extendedPrismaClient>,
    private readonly idsService: IdsService,
    private readonly emailsService: EmailsService,
    private readonly transactionalEmailsService: TransactionalEmailsService,
    private readonly slackService: SlackService,
    private readonly whatsappService: WhatsappService
  ) {}

  async create(createAmbassadorDto: CreateAmbassadorDto) {
    const existingAmbassadorByPhone =
      await this.prisma.client.ambassador.findUnique({
        where: { phoneNumber: createAmbassadorDto.phoneNumber },
      })

    if (existingAmbassadorByPhone) {
      if (existingAmbassadorByPhone.referralCode) {
        throw new BadRequestException(
          `Ambassador with phone number ${createAmbassadorDto.phoneNumber} has already been onboarded`
        )
      } else {
        return existingAmbassadorByPhone
      }
    }

    const id = this.idsService.createId(AMBASSADOR_DATABASE_PREFIX)

    const ambassador = await this.prisma.client.ambassador.create({
      data: {
        id,
        phoneNumber: createAmbassadorDto.phoneNumber,
      },
    })

    const text = `:fire: Ambassador \`${ambassador.id}\` created ! :tada:`
    await this.slackService.enqueue({
      text,
      webhook: 'SLACK_LIVE_NOTIFICATIONS_WEBHOOK_URL',
    })

    return ambassador
  }

  async postImage(
    id: string,
    updateAmbassadorPostImageDto: UpdateAmbassadorPostImageDto
  ) {
    const { organizationId, postedImageUrl } = updateAmbassadorPostImageDto

    const organization = await this.prisma.client.organization.findUnique({
      where: { id: organizationId },
    })

    if (!organization) {
      throw new NotFoundException(
        `Organization with id ${organizationId} not found`
      )
    }

    const ambassador = await this.prisma.client.ambassador.findUnique({
      where: { id },
    })

    if (!ambassador) {
      throw new NotFoundException(`Ambassador with id ${id} not found`)
    }

    // connect the ambassador to the organization
    await this.prisma.client.ambassador.update({
      where: { id },
      data: {
        organizations: {
          connect: { id: organizationId },
        },
      },
    })

    // text that he posted the image check instagram to validate it

    const text = `:muscle: Ambassador \`${ambassador.id}\` has posted the image check instagram to validate it image Url: ${postedImageUrl}`
    await this.slackService.enqueue({
      text,
      webhook: 'SLACK_LIVE_NOTIFICATIONS_WEBHOOK_URL',
    })

    return ambassador
  }

  async update(id: string, updateAmbassadorDto: UpdateAmbassadorDto) {
    const ambassador = await this.prisma.client.ambassador.findUnique({
      where: { id },
    })

    if (!ambassador) {
      throw new NotFoundException(`Ambassador with id ${id} not found`)
    }

    if (updateAmbassadorDto.organizationIds?.length) {
      const organizations = await this.prisma.client.organization.findMany({
        where: {
          id: {
            in: updateAmbassadorDto.organizationIds,
          },
        },
      })

      const foundOrgIds = organizations.map((org) => org.id)
      const missingOrgIds = updateAmbassadorDto.organizationIds.filter(
        (id) => !foundOrgIds.includes(id)
      )

      if (missingOrgIds.length > 0) {
        throw new NotFoundException(
          `Organizations not found with ids: ${missingOrgIds.join(', ')}`
        )
      }
    }

    const referralCode = this.idsService.createAmbassadorReferralCode()
    const respone = await this.prisma.client.ambassador.update({
      where: { id },
      data: {
        email: updateAmbassadorDto.email,
        referralCode,
        organizations: updateAmbassadorDto.organizationIds
          ? {
              connect: updateAmbassadorDto.organizationIds.map((id) => ({
                id,
              })),
            }
          : undefined,
      },
      include: {
        organizations: true,
      },
    })
    await this.sendOnboardingEmail(id)

    const text = `:muscle: Ambassador \`${ambassador.id}\` has completed onboarding. => ${referralCode}`
    await this.slackService.enqueue({
      text,
      webhook: 'SLACK_LIVE_NOTIFICATIONS_WEBHOOK_URL',
    })
    console.log('organizations', organizations)
    this.whatsappService.enqueue({
      recipientPhoneNumber: ambassador.phoneNumber,
      templateName: getTemplateName('ambassador', true),
      locale: Locale.fr_FR,
      variables: [
        referralCode,
        ambassador.id,
        organizations[0]?.name,
        formatLink(organizations[0]?.websiteUrl || ''),
      ],
    })

    return respone
  }

  async findOne(id: string, query?: QueryDto) {
    const include = formatExpand(AMBASSADOR_RELATIONS, query?.expand)

    return await this.prisma.client.ambassador.findUnique({
      where: { id },
      include,
    })
  }

  async findOneByCode(referralCode: string, query?: QueryDto) {
    const include = formatExpand(AMBASSADOR_RELATIONS, query?.expand)

    return await this.prisma.client.ambassador.findUnique({
      where: { referralCode, deletedAt: null },
      include,
    })
  }

  async findAll(query?: QueryDto) {
    const include = formatExpand(AMBASSADOR_RELATIONS, query?.expand)
    const orderBy = formatOrderBy(
      Prisma.AmbassadorScalarFieldEnum,
      query?.orderBy
    )
    const search = formatSearch(Prisma.AmbassadorScalarFieldEnum, query?.search)

    const [data, count] = await this.prisma.client.$transaction([
      this.prisma.client.ambassador.findMany({
        skip: query?.skip,
        take: query?.take,
        orderBy,
        include,
        where: {
          ...search,
          deletedAt: null,
        },
      }),
      this.prisma.client.ambassador.count({
        where: {
          ...search,
          deletedAt: null,
        },
      }),
    ])

    return { data, count }
  }

  private async sendOnboardingEmail(id: string) {
    const ambassador = (await this.findOne(id, {
      expand: ['organizations'],
    })) as Prisma.AmbassadorGetPayload<{
      include: { organizations: true }
    }>

    if (!ambassador.email) {
      return
    }

    const transactionalEmail =
      await this.transactionalEmailsService.findOneByorganizationIdAndLivemodeAndTypeAndLocale(
        undefined,
        true,
        EmailType.ONBOARDING_AMBASSADOR,
        Locale.fr_FR
      )

    const organizationsWebsites =
      ambassador.organizations?.map((org) =>
        org.websiteUrl?.replace(/^https?:\/\//, '')
      ) || []
    const websites = organizationsWebsites.join(', ')

    if (transactionalEmail) {
      await this.emailsService.enqueue({
        subject: transactionalEmail.subject,
        fromEmail: transactionalEmail.fromEmail,
        html: transactionalEmail.body,
        to: ambassador.email,
        dynamicTemplateData: {
          ambassador: {
            id: ambassador.id,
            phoneNumber: ambassador.phoneNumber,
            referralCode: ambassador.referralCode,
          },
          organizationsWebsites: websites,
        },
      })
    }
  }
}
