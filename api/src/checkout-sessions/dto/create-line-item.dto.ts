import { LineItemType } from '@prisma/client'
import { Type } from 'class-transformer'
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator'

export class CreateLineItemDto {
  @IsNotEmpty()
  @IsString()
  name: string

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  price: number

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  quantity: number

  @IsOptional()
  @IsString()
  imageUrl?: string | null

  @IsOptional()
  @IsString()
  description?: string | null

  @IsOptional()
  @IsString()
  @IsEnum(LineItemType)
  type?: LineItemType = LineItemType.PRODUCT
}
