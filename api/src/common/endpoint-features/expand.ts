import * as humps from 'humps'

export function formatExpand(relations: string[], expand?: string[]) {
  if (!expand) return null

  const camelizedExpand = expand.map((field) => humps.camelize(field))
  const include: null | object = {}

  camelizedExpand.forEach((field) => {
    const parts = field.split('.')
    // we check if the expand field or its parent is in the relations
    if (relations.includes(parts[0]) || relations.includes(field)) {
      if (parts.length === 1) {
        //we check if it's a simple relation
        include[parts[0]] = true
      } else if (parts.length === 2) {
        //we check if it's a nested relation
        if (!include[parts[0]]) {
          include[parts[0]] = { include: {} }
        }
        include[parts[0]].include[parts[1]] = true
      }
      // Extend further if needed
    }
  })

  return include
}
