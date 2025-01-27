import * as humps from 'humps'

import { alwaysStringFields } from '../constants/always-string-fields.constants'
import {
  operators,
  operatorsMap,
} from '../constants/operators-search.constants'

export function formatSearch(objectFields: object, query?: string) {
  const formattedQuery: {
    OR?: Array<Record<string, unknown>>
    AND?: Array<Record<string, unknown>>
    [key: string]: unknown
  } = { OR: [], AND: [] }
  if (!query) {
    return {}
  }
  query = decodeURIComponent(query)
  const conditions = query?.split(',')
  conditions?.forEach((condition) => {
    const isOrCondition = condition.includes(' OR ')
    const splitCondition = condition.split(isOrCondition ? ' OR ' : ' AND ')
    const conditionType = isOrCondition ? 'OR' : 'AND'
    if (splitCondition.length > 1) {
      splitCondition.forEach((cond) => {
        const { field, operator, value } = extractConditionParts(cond.trim())
        if (
          value &&
          field &&
          operator &&
          Object.keys(objectFields).includes(field)
        ) {
          if (operator === ':') {
            formattedQuery[conditionType]?.push({ [field]: value })
          } else {
            formattedQuery[conditionType]?.push({
              [field]: { [operatorsMap[operator]]: value },
            })
          }
        }
      })
    } else {
      const { field, operator, value } = extractConditionParts(condition)

      if (
        value !== undefined &&
        field &&
        operator &&
        Object.keys(objectFields).includes(field)
      ) {
        if (operator.includes(':')) {
          formattedQuery[field] = value
        } else {
          formattedQuery[field] = {
            [operatorsMap[operator]]: value,
          }
        }
      }
    }
  })
  if (formattedQuery.OR && formattedQuery.OR.length === 0) {
    delete formattedQuery.OR
  }
  if (formattedQuery.AND && formattedQuery.AND.length === 0) {
    delete formattedQuery.AND
  }
  return formattedQuery
}

type Operator = string | undefined | null

type Value = string | number | boolean | Date | null | undefined

export function extractConditionParts(condition: string) {
  let field: string | undefined | null, operator: Operator, value: Value

  // Find the operator and split the condition into parts
  const operatorFound = operators.find((op) => condition.includes(op))

  if (operatorFound) {
    const parts = condition.split(operatorFound)
    field = humps.camelize(parts[0]?.trim())
    value = parts[1]?.trim().replace(/^"|"$/g, '')
    if (field && !alwaysStringFields.includes(field)) {
      if (!isNaN(Number(value))) {
        value = parseFloat(value)
      } else if (Date.parse(value)) {
        value = new Date(value)
      } else if (
        value.toLowerCase() === 'true' ||
        value.toLowerCase() === 'false'
      ) {
        value = value.toLowerCase() === 'true'
      }
    }

    operator = operatorFound
  }

  return { field, operator, value }
}
