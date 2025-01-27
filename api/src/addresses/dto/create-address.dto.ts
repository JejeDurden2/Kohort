import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsNotEmpty, IsOptional, IsPostalCode, IsString } from 'class-validator'

export class CreateAddressDto {
  @ApiProperty({
    description:
      'The first line of the address, typically including the street name and number.',
    example: 'Avenue des Champs-Élysées',
    type: String,
    maxLength: 255,
  })
  @IsNotEmpty()
  @IsString()
  addressLine1: string

  @ApiPropertyOptional({
    description:
      'The second line of the address, such as an apartment or suite number.',
    example: 'Appartement 4B',
    nullable: true,
    type: String,
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  addressLine2?: string | null

  @ApiProperty({
    description: 'The city in which the address is located.',
    example: 'Paris',
    type: String,
    maxLength: 255,
  })
  @IsNotEmpty()
  @IsString()
  city: string

  @ApiProperty({
    description:
      'The postal code of the address. Must be a valid postal code format for the given country.',
    example: '75014',
    type: String,
    maxLength: 20,
  })
  @IsNotEmpty()
  @IsString()
  @IsPostalCode()
  postalCode: string

  @ApiProperty({
    description: 'The country in which the address is located.',
    example: 'France',
    type: String,
    maxLength: 100,
  })
  @IsNotEmpty()
  @IsString()
  country: string

  @ApiPropertyOptional({
    description: 'The state or region in which the address is located.',
    example: 'Île-de-France',
    nullable: true,
    type: String,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  state?: string | null

  @ApiPropertyOptional({
    description: 'The company name associated with the address, if applicable.',
    example: 'Google LLC',
    nullable: true,
    type: String,
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  companyName?: string | null

  @ApiPropertyOptional({
    description:
      'The VAT number of the company associated with the address, if applicable.',
    example: 'FR123456789',
    nullable: true,
    type: String,
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  vatNumber?: string | null

  @ApiPropertyOptional({
    description:
      'The registration number of the company associated with the address, if applicable.',
    example: '123456789',
    nullable: true,
    type: String,
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  registrationNumber?: string | null
}
