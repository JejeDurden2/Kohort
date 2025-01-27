import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'
import { Organization, TransactionalEmail } from '@prisma/client'

import { createOrganization } from '../../test/factories/organization.factory'
import { createTransactionalEmail } from '../../test/factories/transactional-email.factory'
import { paginated } from '../../test/utils/paginated-format'
import { TransactionalEmailsController } from './transactional-emails.controller'
import { TransactionalEmailsService } from './transactional-emails.service'

describe('TransactionalEmailsController', () => {
  let controller: TransactionalEmailsController
  let service: TransactionalEmailsService
  let transactionalEmail: TransactionalEmail
  let organization: Organization

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionalEmailsController],
      providers: [
        {
          provide: TransactionalEmailsService,
          useValue: createMock<TransactionalEmailsService>(),
        },
      ],
    }).compile()

    controller = module.get<TransactionalEmailsController>(
      TransactionalEmailsController
    )
    service = module.get<TransactionalEmailsService>(TransactionalEmailsService)
    transactionalEmail = createTransactionalEmail()
    organization = createOrganization()
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('create', () => {
    it('should create one transactionalEmail', async () => {
      const result = transactionalEmail
      jest.spyOn(service, 'create').mockResolvedValue(result)

      expect(
        await controller.create(transactionalEmail.id, organization, true)
      ).toBe(result)
    })
  })

  describe('findOne', () => {
    it('should return one transactionalEmail', async () => {
      const result = transactionalEmail
      jest
        .spyOn(service, 'findOneByOrganizationIdAndLivemode')
        .mockImplementation(async () => result)

      expect(
        await controller.findOne(transactionalEmail.id, organization, true, {})
      ).toBe(result)
    })
  })

  describe('findAll', () => {
    it('should return all transactionalEmails', async () => {
      const result = paginated([transactionalEmail])
      jest
        .spyOn(service, 'findByOrganizationIdAndLivemode')
        .mockImplementation(async () => result)

      expect(await controller.findAll(organization, true, {})).toBe(result)
    })
  })

  describe('update', () => {
    it('should update one transactionalEmail', async () => {
      const result = transactionalEmail
      jest.spyOn(service, 'update').mockImplementation(async () => result)

      expect(
        await controller.update(transactionalEmail.id, organization, true, {
          subject: 'subject',
          preheaderText: 'preheaderText',
          body: 'body',
          variables: { name: 'John Doe' },
        })
      ).toBe(result)
    })
  })

  describe('remove', () => {
    it('should remove one transactionalEmail', async () => {
      const result = transactionalEmail
      jest.spyOn(service, 'remove').mockImplementation(async () => result)

      expect(
        await controller.remove(transactionalEmail.id, organization, true)
      ).toBe(result)
    })
  })
})
