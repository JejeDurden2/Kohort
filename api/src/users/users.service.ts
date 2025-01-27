import { BadRequestException, Inject, Injectable } from '@nestjs/common'
import { CustomPrismaService } from 'nestjs-prisma'

import { USER_DATABASE_PREFIX } from '../common/constants/database-prefixes.constants'
import {
  HUBSPOT_IS_DASHBOARD_USER,
  HUBSPOT_LEAD_STATUS,
  HUBSPOT_LYFE_CYCLE_STAGE,
} from '../common/constants/miscellaneous.constants'
import { IdsService } from '../common/ids/ids.service'
import { HubspotService } from '../hubspot/hubspot.service'
import { extendedPrismaClient } from '../prisma.extension'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'

@Injectable()
export class UsersService {
  constructor(
    @Inject('PrismaService')
    private prisma: CustomPrismaService<extendedPrismaClient>,
    private readonly idsService: IdsService,
    private readonly hubspotService: HubspotService
  ) {}

  async create(createUserDto: CreateUserDto) {
    const id = this.idsService.createId(USER_DATABASE_PREFIX)
    const user = await this.prisma.client.user.create({
      data: {
        id,
        ...createUserDto,
      },
    })

    //TODO: this should be event based
    this.hubspotService.enqueue({
      email: user.primaryEmailAddress,
      firstname: user.firstName,
      lastname: user.lastName,
      phone: user.primaryPhoneNumber,
      kht_is_dashboard_user: HUBSPOT_IS_DASHBOARD_USER,
      lifecyclestage: HUBSPOT_LYFE_CYCLE_STAGE,
      hs_lead_status: HUBSPOT_LEAD_STATUS,
    })

    return user
  }

  async findOne(id: string) {
    return await this.prisma.client.user.findUnique({
      where: { id, deletedAt: null },
    })
  }

  async findByClerkId(clerkId: string) {
    return await this.prisma.client.user.findUnique({
      where: { clerkId, deletedAt: null },
    })
  }

  async findAll() {
    return await this.prisma.client.user.findMany({
      where: { deletedAt: null },
    })
  }

  async findOneWithDeleted(id: string) {
    return await this.prisma.client.user.findUnique({
      where: { id, deletedAt: { not: null } },
    })
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.client.user.update({
      data: { ...updateUserDto },
      where: { id, deletedAt: null },
    })

    //TODO: this should be event based
    this.hubspotService.enqueue({
      email: user.primaryEmailAddress,
      firstname: user.firstName,
      lastname: user.lastName,
      phone: user.primaryPhoneNumber,
      kht_is_dashboard_user: HUBSPOT_IS_DASHBOARD_USER,
      lifecyclestage: HUBSPOT_LYFE_CYCLE_STAGE,
      hs_lead_status: HUBSPOT_LEAD_STATUS,
    })

    return user
  }

  async remove(id: string) {
    const deleted = await this.findOneWithDeleted(id)
    if (deleted)
      throw new BadRequestException(`User with id ${id} is already deleted.`)
    return await this.update(id, { deletedAt: new Date() })
  }

  async hardRemove(id: string) {
    return await this.prisma.client.user.delete({ where: { id } })
  }
}
