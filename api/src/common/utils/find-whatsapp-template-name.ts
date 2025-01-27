import { WHATSAPP_TEMPLATES } from '../constants/templates-whatsapp'

export function getTemplateName(
  type: 'intro' | 'forward' | 'reminder' | 'ambassador',
  isProduction: boolean
): string {
  const environment = isProduction ? 'production' : 'staging'
  const template = WHATSAPP_TEMPLATES[environment][type]
  return `${template.name}`
}
