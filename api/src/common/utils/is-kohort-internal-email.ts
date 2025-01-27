export const isKohortInternalEmail = (email?: string): boolean => {
  if (!email) {
    return false
  }
  return email.includes('kohort.eu') || email.includes('kohortpay.com')
}
