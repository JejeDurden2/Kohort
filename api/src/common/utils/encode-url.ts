import { Locale } from '@prisma/client'

export default function encodeUrlParams(
  language: Locale,
  shareId: string,
  inviteMode: boolean,
  shareWhatsapp: boolean = false
) {
  const livemode = !shareId.includes('test')

  const uniqueId = shareId.split('-').pop() || ''

  // Map each parameter to bits
  const langBit = language === Locale.fr_FR ? 0 : 1
  const modeBit = livemode ? 0 : 1
  const inviteBit = inviteMode ? 1 : 0
  const whatsappBit = shareWhatsapp ? 1 : 0

  const binaryString = `${whatsappBit}${inviteBit}${modeBit}${langBit}`

  // Convert binary string to a decimal value and then to base-36
  const decimalValue = parseInt(binaryString, 2)
  const encodedParams = decimalValue.toString(36)

  return `${encodedParams}${uniqueId}`
}
