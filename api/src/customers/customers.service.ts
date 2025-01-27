import { BadRequestException, Inject, Injectable } from '@nestjs/common'
import { Customer, Prisma } from '@prisma/client'
import { CustomPrismaService } from 'nestjs-prisma'

import { CUSTOMER_DATABASE_PREFIX } from '../common/constants/database-prefixes.constants'
import { CUSTOMER_RELATIONS } from '../common/constants/database-relation-fields.constants'
import { SYSTEM } from '../common/constants/miscellaneous.constants'
import { QueryDto } from '../common/dto/query.dto'
import { formatExpand } from '../common/endpoint-features/expand'
import { formatOrderBy } from '../common/endpoint-features/order-by'
import { formatSearch } from '../common/endpoint-features/search'
import { CheckoutSessionValidationErrors } from '../common/enums/errors'
import { IdsService } from '../common/ids/ids.service'
import { extendedPrismaClient } from '../prisma.extension'
import { CreateCustomerDto } from './dto/create-customer.dto'
import { UpdateCustomerDto } from './dto/update-customer.dto'

@Injectable()
export class CustomersService {
  constructor(
    @Inject('PrismaService')
    private prisma: CustomPrismaService<extendedPrismaClient>,
    private readonly idsService: IdsService
  ) {}

  async create(
    organizationId: string,
    livemode: boolean,
    createCustomerDto: CreateCustomerDto,
    createdBy: string = SYSTEM
  ) {
    if (createCustomerDto.clientReferenceId) {
      const customer =
        await this.findOneByClientReferenceIdOrganizationIdAndLivemode(
          createCustomerDto.clientReferenceId,
          organizationId,
          livemode
        )

      if (customer) {
        throw new BadRequestException(
          `Customer with client reference id ${createCustomerDto.clientReferenceId} already exists.`
        )
      }
    }
    const id = this.idsService.createId(CUSTOMER_DATABASE_PREFIX)
    return await this.prisma.client.customer.create({
      data: {
        id,
        organization: { connect: { id: organizationId } },
        livemode,
        createdBy,
        updatedBy: createdBy,
        ...createCustomerDto,
      },
    })
  }

  async findOneByClientReferenceIdOrganizationIdAndLivemode(
    clientReferenceId: string,
    organizationId: string,
    livemode: boolean
  ) {
    return await this.prisma.client.customer.findFirst({
      where: { clientReferenceId, organizationId, livemode, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findOneByOrganizationIdAndLivemode(
    id: string,
    organizationId: string,
    livemode: boolean,
    query?: QueryDto
  ) {
    const include = formatExpand(CUSTOMER_RELATIONS, query?.expand)
    return await this.prisma.client.customer.findUnique({
      include,
      where: { id, organizationId, livemode, deletedAt: null },
    })
  }

  async findOne(id: string, query?: QueryDto) {
    const include = formatExpand(CUSTOMER_RELATIONS, query?.expand)
    return await this.prisma.client.customer.findUnique({
      include,
      where: { id, deletedAt: null },
    })
  }

  async findOneByEmailAndOrganizationIdAndLivemodeWithDeleted(
    emailAddress: string,
    organizationId: string,
    livemode: boolean,
    query?: QueryDto
  ) {
    const include = formatExpand(CUSTOMER_RELATIONS, query?.expand)
    return await this.prisma.client.customer.findFirst({
      where: {
        emailAddress,
        organizationId,
        livemode,
      },
      include,
    })
  }

  async findOneWithDeleted(id: string, query?: QueryDto) {
    const include = formatExpand(CUSTOMER_RELATIONS, query?.expand)
    return await this.prisma.client.customer.findUnique({
      include,
      where: { id },
    })
  }

  async findByOrganizationIdAndLivemode(
    organizationId: string,
    livemode: boolean,
    query?: QueryDto
  ) {
    const include = formatExpand(CUSTOMER_RELATIONS, query?.expand)
    const orderBy = formatOrderBy(
      Prisma.CustomerScalarFieldEnum,
      query?.orderBy
    )
    const search = formatSearch(Prisma.CustomerScalarFieldEnum, query?.search)
    const [data, count] = await this.prisma.client.$transaction([
      this.prisma.client.customer.findMany({
        skip: query?.skip,
        take: query?.take,
        orderBy,
        include,
        where: { organizationId, livemode, deletedAt: null, ...search },
      }),
      this.prisma.client.customer.count({
        where: { organizationId, livemode, deletedAt: null, ...search },
      }),
    ])
    return { data, count }
  }

  async update(
    id: string,
    organizationId: string,
    livemode: boolean,
    updateCustomerDto: UpdateCustomerDto,
    updatedBy: string = SYSTEM
  ) {
    return await this.prisma.client.customer.update({
      data: {
        ...updateCustomerDto,
        updatedBy,
      },
      where: { id, organizationId, livemode },
    })
  }

  async block(
    id: string,
    organizationId: string,
    livemode: boolean,
    updatedBy: string = SYSTEM
  ) {
    return await this.prisma.client.customer.update({
      data: {
        isBlocked: true,
        blockedAt: new Date(),
        blockedBy: updatedBy,
        updatedBy,
      },
      where: { id, organizationId, livemode },
    })
  }

  async unblock(
    id: string,
    organizationId: string,
    livemode: boolean,
    updatedBy: string = SYSTEM
  ) {
    return await this.prisma.client.customer.update({
      data: {
        isBlocked: false,
        blockedAt: null,
        blockedBy: null,
        updatedBy,
      },
      where: { id, organizationId, livemode },
    })
  }

  async validate(
    customerEmail: string | null,
    customerId: string | null,
    organizationId: string,
    livemode: boolean
  ) {
    let customer: Customer | null = null
    if (!customerEmail && !customerId) {
      throw new BadRequestException(
        'Either customer email or customer id must be provided.'
      )
    }

    if (customerEmail) {
      customer =
        await this.findOneByEmailAndOrganizationIdAndLivemodeWithDeleted(
          customerEmail,
          organizationId,
          livemode
        )
      if (!customer && customerId) {
        customer = await this.findOneByOrganizationIdAndLivemode(
          customerId,
          organizationId,
          livemode
        )
      }
    }

    if (customer) {
      if (customer.isBlocked) {
        throw new BadRequestException(
          `Customer ${customer.id} is blocked.`,
          CheckoutSessionValidationErrors.CUSTOMER_BLOCKED
        )
      }
    }
  }

  async remove(
    id: string,
    organizationId: string,
    livemode: boolean,
    updatedBy: string = SYSTEM
  ) {
    const deleted = await this.findOneWithDeleted(id)
    if (deleted)
      throw new BadRequestException(
        `Customer with id ${id} is already deleted.`
      )
    return await this.update(
      id,
      organizationId,
      livemode,
      {
        deletedAt: new Date(),
      },
      updatedBy
    )
  }
}
