import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'
import { Ambassador } from '@prisma/client'

import { createOrganization } from '../../test/factories/organization.factory'
import { AmbassadorService } from './ambassador.service'
import { AmbassadorController } from './internal-ambassador.controller'

describe('AmbassadorController', () => {
  let controller: AmbassadorController
  let service: jest.Mocked<AmbassadorService>

  const mockAmbassador: Ambassador = {
    id: 'amb_123',
    email: 'test@example.com',
    phoneNumber: '+33123456789',
    referralCode: 'REF123',
    metadata: null,
    createdAt: new Date(),
    createdBy: 'system',
    updatedAt: new Date(),
    updatedBy: 'system',
    deletedAt: null,
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AmbassadorController],
      providers: [
        {
          provide: AmbassadorService,
          useValue: createMock<AmbassadorService>(),
        },
      ],
    }).compile()

    controller = module.get<AmbassadorController>(AmbassadorController)
    service = module.get(AmbassadorService)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('create', () => {
    it('should create an ambassador', async () => {
      const createAmbassadorDto = {
        phoneNumber: '+33123456789',
      }

      service.create.mockResolvedValue(mockAmbassador)

      const result = await controller.create(createAmbassadorDto)

      expect(result).toBe(mockAmbassador)
      expect(service.create).toHaveBeenCalledWith(createAmbassadorDto)
    })
  })

  describe('update', () => {
    it('should update an ambassador', async () => {
      const updateAmbassadorDto = {
        email: 'new@example.com',
        organizationIds: ['org_123'],
      }

      const mockOrganization = createOrganization()

      service.update.mockResolvedValue({
        ...mockAmbassador,
        email: updateAmbassadorDto.email,
        organizations: [mockOrganization],
      })

      const result = await controller.update(
        mockAmbassador.id,
        updateAmbassadorDto
      )

      expect(result.email).toBe(updateAmbassadorDto.email)
      expect(service.update).toHaveBeenCalledWith(
        mockAmbassador.id,
        updateAmbassadorDto
      )
    })
  })

  describe('findOne', () => {
    it('should return an ambassador', async () => {
      service.findOne.mockResolvedValue(mockAmbassador)

      const result = await controller.findOne(mockAmbassador.id, {})

      expect(result).toBe(mockAmbassador)
      expect(service.findOne).toHaveBeenCalledWith(mockAmbassador.id, {})
    })
  })

  describe('findAll', () => {
    it('should return ambassadors with count', async () => {
      const mockResponse = {
        data: [mockAmbassador],
        count: 1,
      }

      service.findAll.mockResolvedValue(mockResponse)

      const result = await controller.findAll({})

      expect(result).toBe(mockResponse)
      expect(service.findAll).toHaveBeenCalledWith({})
    })
  })
})
