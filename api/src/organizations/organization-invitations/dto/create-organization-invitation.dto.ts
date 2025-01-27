import {
  OrganizationInvitationStatus,
  OrganizationMembershipRole,
} from '@clerk/clerk-sdk-node'
import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsString } from 'class-validator'

export class CreateOrganizationInvitationDto {
  @ApiProperty({ description: 'The ID of the organization.' })
  @IsNotEmpty()
  @IsString()
  organizationId: string

  @ApiProperty({
    description: 'The email address to which the invitation will be sent.',
  })
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  emailAddress: string

  @ApiProperty({
    description: 'The role to be assigned to the invitee.',
  })
  @IsNotEmpty()
  @IsString()
  role: OrganizationMembershipRole

  @ApiProperty({
    description: 'The status of the invitation.',
  })
  @IsNotEmpty()
  @IsString()
  status: OrganizationInvitationStatus
}
