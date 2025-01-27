import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'
import { Tag } from '@prisma/client'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'
import { CustomPrismaService } from 'nestjs-prisma'

import { createTag } from '../../test/factories/tag.factory'
import { IdsService } from '../common/ids/ids.service'
import { extendedPrismaClient } from '../prisma.extension'
import { TagsService } from './tags.service'

describe('TagsService', () => {
  let service: TagsService
  let prisma: DeepMockProxy<CustomPrismaService<extendedPrismaClient>>
  let tag: Tag

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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

    service = module.get<TagsService>(TagsService)
    prisma = module.get('PrismaService')
    tag = createTag()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('create', () => {
    it('should create a tag', async () => {
      const createTagDto = { name: tag.name }
      const result = tag
      prisma.client.tag.create.mockResolvedValue(result)

      const created = await service.create(createTagDto, 'userId')

      expect(created).toBe(result)
      expect(prisma.client.tag.create).toHaveBeenCalledWith({
        data: {
          id: expect.any(String),
          name: tag.name,
          createdBy: 'userId',
        },
      })
    })

    it('should create a tag with system as creator if no userId provided', async () => {
      const createTagDto = { name: tag.name }
      const result = tag
      prisma.client.tag.create.mockResolvedValue(result)

      const created = await service.create(createTagDto)

      expect(created).toBe(result)
      expect(prisma.client.tag.create).toHaveBeenCalledWith({
        data: {
          id: expect.any(String),
          name: tag.name,
          createdBy: 'system',
        },
      })
    })
  })

  describe('findAll', () => {
    it('should return an array of tags', async () => {
      const result = [tag]
      prisma.client.tag.findMany.mockResolvedValue(result)

      const found = await service.findAll()

      expect(found).toBe(result)
      expect(prisma.client.tag.findMany).toHaveBeenCalled()
    })
  })
})
