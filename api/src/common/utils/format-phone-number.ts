export function formatPhoneNumber(phoneNumber: string) {
  let formattedNumber = phoneNumber
    .replace(/\s+/g, '') // Remove all spaces
    .replace(/^\+/, '') // Remove the plus sign at the beginning

  if (formattedNumber.startsWith('0')) {
    formattedNumber = '33' + formattedNumber.slice(1) // Replace starting '0' with '33'
  }

  return formattedNumber
}
