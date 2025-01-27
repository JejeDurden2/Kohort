import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator'

import {
  HUBSPOT_IS_DASHBOARD_USER,
  HUBSPOT_LEAD_STATUS,
  HUBSPOT_LYFE_CYCLE_STAGE,
} from '../../common/constants/miscellaneous.constants'

export class CreateHubspotContactDto {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string

  @IsOptional()
  @IsString()
  firstname?: string | null

  @IsOptional()
  @IsString()
  lastname?: string | null

  @IsOptional()
  @IsString()
  @IsPhoneNumber()
  phone?: string | null

  kht_is_dashboard_user = HUBSPOT_IS_DASHBOARD_USER

  lifecyclestage = HUBSPOT_LYFE_CYCLE_STAGE

  hs_lead_status = HUBSPOT_LEAD_STATUS
}
