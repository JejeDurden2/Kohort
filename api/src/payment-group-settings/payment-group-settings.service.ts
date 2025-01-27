import { BadRequestException, Inject, Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { CustomPrismaService } from 'nestjs-prisma'

import {
  DISCOUNT_LEVEL_DATABASE_PREFIX,
  PAYMENT_GROUP_SETTINGS_DATABASE_PREFIX,
} from '../common/constants/database-prefixes.constants'
import { PAYMENT_GROUP_SETTINGS_RELATIONS } from '../common/constants/database-relation-fields.constants'
import { SYSTEM } from '../common/constants/miscellaneous.constants'
import {
  DEFAULT_TEST_MODE_PAYMENT_GROUP_DURATION_IN_MINUTES,
  MAXIMUM_PAYMENT_GROUP_DURATION_IN_MINUTES,
  MINIMUM_PURCHASE_VALUE,
} from '../common/constants/payment-group.constants'
import { QueryDto } from '../common/dto/query.dto'
import { formatExpand } from '../common/endpoint-features/expand'
import { IdsService } from '../common/ids/ids.service'
import { extendedPrismaClient } from '../prisma.extension'
import { CreateDiscountLevelDto } from './dto/create-discount-level.dto'
import { UpdatePaymentGroupSettingsDto } from './dto/update-payment-group-setting.dto'

@Injectable()
export class PaymentGroupSettingsService {
  constructor(
    @Inject('PrismaService')
    private prisma: CustomPrismaService<extendedPrismaClient>,
    private readonly idsService: IdsService
  ) {}

  async create(organizationId: string, livemode: boolean, createdBy: string) {
    const id = this.idsService.createId(PAYMENT_GROUP_SETTINGS_DATABASE_PREFIX)
    return await this.prisma.client.paymentGroupSettings.create({
      data: {
        id,
        organizationId,
        livemode,
        minPurchaseValue: MINIMUM_PURCHASE_VALUE,
        minutesDuration: livemode
          ? MAXIMUM_PAYMENT_GROUP_DURATION_IN_MINUTES
          : DEFAULT_TEST_MODE_PAYMENT_GROUP_DURATION_IN_MINUTES,
        discountLevels: {
          create: [
            // set default discount levels
            {
              id: this.idsService.createId(DISCOUNT_LEVEL_DATABASE_PREFIX),
              level: 1,
              participantsToUnlock: 2,
              value: 5,
            },
            {
              id: this.idsService.createId(DISCOUNT_LEVEL_DATABASE_PREFIX),
              level: 2,
              participantsToUnlock: 5,
              value: 10,
            },
            {
              id: this.idsService.createId(DISCOUNT_LEVEL_DATABASE_PREFIX),
              level: 3,
              participantsToUnlock: 10,
              value: 15,
            },
          ],
        },
        createdBy,
        updatedBy: createdBy,
      },
    })
  }

  async duplicateToPaymentGroup(
    id: string,
    paymentGroupId: string,
    livemode: boolean
  ) {
    const paymentGroupSettings = (await this.findOne(id, livemode, {
      expand: ['discountLevels'],
    })) as Prisma.PaymentGroupSettingsGetPayload<{
      include: {
        discountLevels: true
      }
    }>
    const newId = this.idsService.createId(
      PAYMENT_GROUP_SETTINGS_DATABASE_PREFIX
    )

    return await this.prisma.client.paymentGroupSettings.create({
      data: {
        ...paymentGroupSettings,
        id: newId,
        organizationId: null,
        paymentGroupId,
        updatedBy: SYSTEM,
        createdAt: new Date(),
        createdBy: SYSTEM,
        updatedAt: new Date(),
        discountLevels: {
          create: paymentGroupSettings.discountLevels.map((discountLevel) => ({
            id: this.idsService.createId(DISCOUNT_LEVEL_DATABASE_PREFIX),
            level: discountLevel.level,
            participantsToUnlock: discountLevel.participantsToUnlock,
            value: discountLevel.value,
          })),
        },
      },
    })
  }

  async findOne(id: string, livemode: boolean, query?: QueryDto) {
    const include = formatExpand(
      PAYMENT_GROUP_SETTINGS_RELATIONS,
      query?.expand
    )

    return await this.prisma.client.paymentGroupSettings.findUnique({
      where: {
        id,
        livemode,
      },
      include,
    })
  }

  async findOneByOrganizationIdAndLivemode(
    organizationId: string,
    livemode: boolean,
    query?: QueryDto
  ) {
    const include = formatExpand(
      PAYMENT_GROUP_SETTINGS_RELATIONS,
      query?.expand
    )
    return await this.prisma.client.paymentGroupSettings.findFirst({
      where: {
        organizationId,
        livemode,
      },
      include,
    })
  }

  async findOneByPaymentGroupIdAndLivemode(
    paymentGroupId: string,
    livemode: boolean,
    query?: QueryDto
  ) {
    const include = formatExpand(
      PAYMENT_GROUP_SETTINGS_RELATIONS,
      query?.expand
    )
    return await this.prisma.client.paymentGroupSettings.findFirst({
      where: {
        paymentGroupId,
        livemode,
      },
      include,
    })
  }

  async update(
    id: string,
    livemode: boolean,
    updatePaymentGroupSettingDto: UpdatePaymentGroupSettingsDto,
    updatedBy: string = SYSTEM
  ) {
    const {
      ['discountLevels']: discountLevels,
      ...updatePaymentGroupSettingDtoWithoutDiscountLevels
    } = updatePaymentGroupSettingDto
    if (discountLevels) {
      this.validateDiscountLevels(discountLevels)
      await this.prisma.client.discountLevel.deleteMany({
        where: {
          paymentGroupSettingsId: id,
        },
      })
    }
    return await this.prisma.client.paymentGroupSettings.update({
      where: {
        id,
        livemode,
      },
      data: {
        ...updatePaymentGroupSettingDtoWithoutDiscountLevels,
        discountLevels: {
          create: discountLevels?.map(
            (createDiscountLevelDto: CreateDiscountLevelDto) => ({
              ...createDiscountLevelDto,
              id: this.idsService.createId(DISCOUNT_LEVEL_DATABASE_PREFIX),
            })
          ),
        },
        updatedBy,
      },
      include: {
        discountLevels: true,
      },
    })
  }

  validateDiscountLevels(discountlevels: CreateDiscountLevelDto[]) {
    if (discountlevels.length >= 1) {
      const sortedDiscountLevels = discountlevels.sort(
        (a, b) => a.level - b.level
      )
      if (sortedDiscountLevels[0].level !== 1) {
        throw new BadRequestException('First discount level must be 1.')
      }
      if (sortedDiscountLevels[0].participantsToUnlock !== 2) {
        throw new BadRequestException(
          'The first discount level must be unlocked with 2 participants.'
        )
      }

      for (let i = 1; i < sortedDiscountLevels.length; i++) {
        const currentDiscountLevel = sortedDiscountLevels[i]
        const previousDiscountLevel = sortedDiscountLevels[i - 1]
        if (previousDiscountLevel.level + 1 !== currentDiscountLevel.level) {
          throw new BadRequestException('Discount levels must be sequential.')
        }
        if (
          previousDiscountLevel.participantsToUnlock >=
          currentDiscountLevel.participantsToUnlock
        ) {
          throw new BadRequestException(
            'Discount levels must have participantsToUnlock in ascending order.'
          )
        }
        if (previousDiscountLevel.value >= currentDiscountLevel.value) {
          throw new BadRequestException(
            'Discount levels must have values in ascending order.'
          )
        }
      }
    }
  }
}
