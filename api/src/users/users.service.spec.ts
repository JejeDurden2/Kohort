import { createMock } from '@golevelup/ts-jest'
import { BadRequestException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { User } from '@prisma/client'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'
import { CustomPrismaService } from 'nestjs-prisma'

import { createUser } from '../../test/factories/user.factory'
import { IdsService } from '../common/ids/ids.service'
import { HubspotService } from '../hubspot/hubspot.service'
import { extendedPrismaClient } from '../prisma.extension'
import { UsersService } from './users.service'

describe('UsersService', () => {
  let service: UsersService
  let user: User
  let prisma: DeepMockProxy<CustomPrismaService<extendedPrismaClient>>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: 'PrismaService',
          useValue: mockDeep<CustomPrismaService<extendedPrismaClient>>(),
        },
        { provide: IdsService, useValue: createMock<IdsService>() },
        {
          provide: HubspotService,
          useValue: createMock<HubspotService>(),
        },
      ],
    }).compile()

    service = module.get<UsersService>(UsersService)
    prisma = module.get('PrismaService')
    user = createUser()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('findOne', () => {
    it('should return one user', async () => {
      const result = user
      prisma.client.user.findUnique.mockResolvedValueOnce(result)

      expect(await service.findOne(user.id)).toBe(result)
    })
  })

  describe('findByClerkId', () => {
    it('should return one user', async () => {
      const result = user
      prisma.client.user.findUnique.mockResolvedValueOnce(result)

      expect(await service.findByClerkId(user.clerkId)).toBe(result)
    })
  })

  describe('findOneWithDeleted', () => {
    it('should return one user', async () => {
      user.deletedAt = new Date()
      const result = user
      prisma.client.user.findUnique.mockResolvedValueOnce(result)

      expect(await service.findOne(user.id)).toBe(result)
    })
  })

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const result = [user]
      prisma.client.user.findMany.mockResolvedValueOnce(result)

      expect(await service.findAll()).toBe(result)
    })
  })

  describe('update', () => {
    it('should update an user', async () => {
      const result = user
      prisma.client.user.update.mockResolvedValueOnce(result)

      expect(
        await service.update(user.id, {
          firstName: user.firstName,
        })
      ).toBe(result)
    })
  })

  describe('remove', () => {
    it('should soft remove an user', async () => {
      user.deletedAt = new Date()
      const result = user

      jest
        .spyOn(service, 'findOneWithDeleted')
        .mockImplementation(async () => null)

      jest.spyOn(service, 'update').mockImplementation(async () => result)

      expect(await service.remove(user.id)).toBe(result)
    })

    it('should throw an error if already deleted', async () => {
      user.deletedAt = new Date()
      const result = user
      jest
        .spyOn(service, 'findOneWithDeleted')
        .mockImplementation(async () => result)

      await expect(service.remove(user.id)).rejects.toThrowError(
        BadRequestException
      )
    })
  })

  describe('hardRemove', () => {
    it('should hard remove an user', async () => {
      const result = user
      prisma.client.user.delete.mockResolvedValueOnce(result)

      expect(await service.hardRemove(user.id)).toBe(result)
    })
  })
})
