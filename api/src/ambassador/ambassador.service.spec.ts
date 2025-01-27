import { createMock } from '@golevelup/ts-jest'
import { BadRequestException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { Ambassador, Prisma } from '@prisma/client'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'
import { CustomPrismaService } from 'nestjs-prisma'

import { createAmbassador } from '../../test/factories/ambassador.factory'
import { createOrganization } from '../../test/factories/organization.factory'
import { IdsService } from '../common/ids/ids.service'
import { EmailsService } from '../email/emails.service'
import { extendedPrismaClient } from '../prisma.extension'
import { SlackService } from '../slack/slack.service'
import { TransactionalEmailsService } from '../transactional-emails/transactional-emails.service'
import { WhatsappService } from '../whatsapp/whatsapp.service'
import { AmbassadorService } from './ambassador.service'

describe('AmbassadorService', () => {
  let service: AmbassadorService
  let prisma: DeepMockProxy<CustomPrismaService<extendedPrismaClient>>
  let ambassador: Ambassador

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AmbassadorService,
        {
          provide: 'PrismaService',
          useValue: mockDeep<CustomPrismaService<extendedPrismaClient>>(),
        },
        {
          provide: IdsService,
          useValue: createMock<IdsService>({
            createId: jest.fn().mockReturnValue('amb_123'),
            createAmbassadorReferralCode: jest.fn().mockReturnValue('REF123'),
          }),
        },
        {
          provide: EmailsService,
          useValue: createMock<EmailsService>({
            enqueue: jest.fn().mockResolvedValue(undefined),
          }),
        },
        {
          provide: TransactionalEmailsService,
          useValue: createMock<TransactionalEmailsService>({
            findOneByorganizationIdAndLivemodeAndTypeAndLocale: jest
              .fn()
              .mockResolvedValue({
                subject: 'Welcome',
                fromEmail: 'noreply@kohortpay.com',
                body: 'Welcome email body',
              }),
          }),
        },
        {
          provide: SlackService,
          useValue: createMock<SlackService>(),
        },
        {
          provide: WhatsappService,
          useValue: createMock<WhatsappService>(),
        },
      ],
    }).compile()

    service = module.get<AmbassadorService>(AmbassadorService)
    prisma = module.get('PrismaService')
    ambassador = createAmbassador()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('create', () => {
    it('should create an ambassador', async () => {
      const createAmbassadorDto = {
        phoneNumber: ambassador.phoneNumber,
      }

      prisma.client.ambassador.findFirst.mockResolvedValue(null)
      prisma.client.ambassador.create.mockResolvedValue(ambassador)

      const result = await service.create(createAmbassadorDto)

      expect(result).toEqual(ambassador)
      expect(prisma.client.ambassador.create).toHaveBeenCalledWith({
        data: {
          id: expect.any(String),
          phoneNumber: createAmbassadorDto.phoneNumber,
        },
      })
    })

    it('should throw if phone number already exists', async () => {
      const createAmbassadorDto = {
        phoneNumber: ambassador.phoneNumber,
      }

      prisma.client.ambassador.findUnique.mockResolvedValue(ambassador)

      await expect(service.create(createAmbassadorDto)).rejects.toThrow(
        BadRequestException
      )
    })

    describe('update', () => {
      it('should update an ambassador', async () => {
        const mockOrganization = createOrganization()
        const updateAmbassadorDto = {
          email: 'new@example.com',
          organizationIds: [mockOrganization.id],
        }

        type AmbassadorWithOrganizations = Prisma.AmbassadorGetPayload<{
          include: { organizations: true }
        }>

        const mockAmbassadorWithOrgs: AmbassadorWithOrganizations = {
          ...ambassador,
          email: updateAmbassadorDto.email,
          organizations: [mockOrganization],
        }

        prisma.client.ambassador.findUnique.mockResolvedValue(ambassador)
        prisma.client.ambassador.findFirst.mockResolvedValue(null)
        prisma.client.organization.findMany.mockResolvedValue([
          mockOrganization,
        ])
        prisma.client.ambassador.update.mockResolvedValue(
          mockAmbassadorWithOrgs
        )

        const result = await service.update(ambassador.id, updateAmbassadorDto)

        expect(result.email).toBe(updateAmbassadorDto.email)
        expect(result.organizations).toEqual([mockOrganization])
        expect(prisma.client.ambassador.update).toHaveBeenCalledWith({
          where: { id: ambassador.id },
          data: {
            email: updateAmbassadorDto.email,
            referralCode: expect.any(String),
            organizations: {
              connect: [{ id: mockOrganization.id }],
            },
          },
          include: {
            organizations: true,
          },
        })
      })
    })

    describe('findOne', () => {
      it('should return an ambassador', async () => {
        prisma.client.ambassador.findUnique.mockResolvedValue(ambassador)

        const result = await service.findOne(ambassador.id)
        expect(result).toEqual(ambassador)
      })
    })

    describe('findAll', () => {
      it('should return ambassadors with count', async () => {
        const mockAmbassadors = [ambassador]
        prisma.client.$transaction.mockResolvedValue([mockAmbassadors, 1])

        const result = await service.findAll()

        expect(result).toEqual({
          data: mockAmbassadors,
          count: 1,
        })
      })
    })
  })
})
