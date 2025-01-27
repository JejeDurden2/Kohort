import { Transform } from 'class-transformer'

// I created this to handle boolean values from urlencoded forms. See https://github.com/typestack/class-transformer/issues/550
export const ToBoolean = () => {
  const toPlain = Transform(
    ({ value }) => {
      return value
    },
    {
      toPlainOnly: true,
    }
  )
  const toClass = (target: object, key: string) => {
    return Transform(
      ({ obj }) => {
        return valueToBoolean(obj[key])
      },
      {
        toClassOnly: true,
      }
    )(target, key)
  }
  return function (target: object, key: string) {
    toPlain(target, key)
    toClass(target, key)
  }
}

const valueToBoolean = (value: string) => {
  if (typeof value === 'boolean') {
    return value
  }
  if (['true', 'on', 'yes', '1'].includes(value.toLowerCase())) {
    return true
  }
  if (['false', 'off', 'no', '0'].includes(value.toLowerCase())) {
    return false
  }
  return undefined
}
