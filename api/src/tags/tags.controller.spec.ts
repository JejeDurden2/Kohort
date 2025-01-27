import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'
import { Tag, User } from '@prisma/client'
import { mockDeep } from 'jest-mock-extended'
import { CustomPrismaService } from 'nestjs-prisma'

import { createTag } from '../../test/factories/tag.factory'
import { createUser } from '../../test/factories/user.factory'
import { IdsService } from '../common/ids/ids.service'
import { extendedPrismaClient } from '../prisma.extension'
import { TagsController } from './tags.controller'
import { TagsService } from './tags.service'

describe('TagsController', () => {
  let controller: TagsController
  let service: TagsService
  let tag: Tag
  let user: User

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TagsController],
      providers: [
        TagsService,
        {
          provide: 'PrismaService',
          useValue: mockDeep<CustomPrismaService<extendedPrismaClient>>(),
        },
        {
          provide: IdsService,
          useValue: createMock<IdsService>({
            createId: jest.fn().mockReturnValue('tag_123'),
          }),
        },
      ],
    }).compile()

    controller = module.get<TagsController>(TagsController)
    service = module.get<TagsService>(TagsService)
    tag = createTag()
    user = createUser()
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('create', () => {
    it('should create a tag', async () => {
      const createTagDto = { name: tag.name }
      jest.spyOn(service, 'create').mockResolvedValue(tag)

      const result = await controller.create(createTagDto)
      expect(result).toBe(tag)
      expect(service.create).toHaveBeenCalledWith(createTagDto, undefined)
    })

    it('should create a tag with user', async () => {
      const createTagDto = { name: tag.name }
      jest.spyOn(service, 'create').mockResolvedValue(tag)

      const result = await controller.create(createTagDto, user)
      expect(result).toBe(tag)
      expect(service.create).toHaveBeenCalledWith(createTagDto, user.id)
    })
  })

  describe('findAll', () => {
    it('should return array of tags', async () => {
      const tags = [tag]
      jest.spyOn(service, 'findAll').mockResolvedValue(tags)

      const result = await controller.findAll()
      expect(result).toBe(tags)
      expect(service.findAll).toHaveBeenCalled()
    })
  })
})
