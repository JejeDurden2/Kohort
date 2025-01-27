import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
} from 'class-validator'

import { MAXIMUM_QUERY_LIMIT } from '../constants/database.constants'

export class QueryDto {
  @IsOptional()
  @IsArray()
  @ApiPropertyOptional({
    description:
      'Fields to expand related entities. For example, ["organization"].',
    example: ['organization'],
  })
  expand?: string[]

  @IsOptional()
  @IsPositive()
  @Max(MAXIMUM_QUERY_LIMIT)
  @Type(() => Number)
  @ApiPropertyOptional({
    description: `Maximum number of items to retrieve. Default is ${MAXIMUM_QUERY_LIMIT}.`,
    example: 10,
  })
  take?: number = MAXIMUM_QUERY_LIMIT

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @ApiPropertyOptional({
    description:
      'Number of items to skip before starting to collect the result set.',
    example: 0,
  })
  skip?: number

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description:
      'Field to order the results by, followed by ":asc" or ":desc". For example, "createdAt:desc".',
    example: 'createdAt:desc',
  })
  orderBy?: string

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description:
      'Search term to filter the results. Supports multiple terms with "~" for partial matches.',
    example: 'customer@example.com',
  })
  search?: string
}
