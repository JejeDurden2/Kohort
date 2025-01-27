import * as humps from 'humps'

export function formatOrderBy(objectFields: object, field?: string) {
  const orderBy = {}
  const splitField = field?.split(':')

  if (splitField?.length) {
    splitField[0] = humps.camelize(splitField[0])
    if (
      Object.keys(objectFields).includes(splitField[0]) &&
      ['asc', 'desc'].includes(splitField[1])
    ) {
      orderBy[splitField[0]] = splitField[1]
      return orderBy
    }
  }
  return { createdAt: 'desc' } // default to reverse chronological order like Stripe
}
