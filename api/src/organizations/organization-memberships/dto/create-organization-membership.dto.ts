import { OrganizationMembershipRole } from '@clerk/clerk-sdk-node'
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class CreateOrganizationMembershipDto {
  @ApiProperty({ description: 'The ID of the organization.' })
  @IsNotEmpty()
  @IsString()
  organizationId: string

  @ApiProperty({ description: 'The ID of the user.' })
  @IsNotEmpty()
  @IsString()
  userId: string

  @ApiProperty({
    description: 'The role to be assigned to the user.',
  })
  @IsNotEmpty()
  @IsString()
  role: OrganizationMembershipRole
}
