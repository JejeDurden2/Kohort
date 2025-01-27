import { formatSearch } from './search'

describe('formatSearch', () => {
  it('should return an empty object if query is undefined', () => {
    const result = formatSearch({})
    expect(result).toEqual({})
  })

  it('should correctly parse a single condition', () => {
    const query = 'status:"active"'
    const result = formatSearch({ status: true }, query)
    expect(result).toEqual({ status: 'active' })
  })
  it('should correctly handle conditions combined with AND', () => {
    const query = 'amount>100 AND amount<200'
    const result = formatSearch({ amount: true }, query)
    expect(result).toEqual({
      AND: [{ amount: { gt: 100 } }, { amount: { lt: 200 } }],
    })
  })

  it('should correctly handle conditions combined with OR', () => {
    const query = 'currency:"usd" OR currency:"eur"'
    const result = formatSearch({ currency: true }, query)
    expect(result).toEqual({ OR: [{ currency: 'usd' }, { currency: 'eur' }] })
  })

  it('should correctly handle mixed AND and OR conditions', () => {
    const query = 'status:"active",amount>100 OR amount<50'
    const result = formatSearch({ status: true, amount: true }, query)
    expect(result).toEqual({
      status: 'active',
      OR: [{ amount: { gt: 100 } }, { amount: { lt: 50 } }],
    })
  })

  it('should correctly parse conditions with boolean values', () => {
    const query = 'isActive:true'
    const result = formatSearch({ isActive: true }, query)
    expect(result).toEqual({ isActive: true })
  })

  // Test 7: Handling Date values
  it('should correctly parse conditions with date values', () => {
    const query = 'createdAt>="2021-01-01"'
    const result = formatSearch({ createdAt: true }, query)
    expect(result).toEqual({ createdAt: { gte: new Date('2021-01-01') } })
  })

  // Test 8: Handling Number values
  it('should correctly parse conditions with numeric values', () => {
    const query = 'amount>=500'
    const result = formatSearch({ amount: true }, query)
    expect(result).toEqual({ amount: { gte: 500 } })
  })

  // Test 9: Invalid Field
  it('should ignore conditions with fields not listed in objectFields', () => {
    const query = 'unknownField:123'
    const result = formatSearch({ status: true, amount: true }, query)
    expect(result).toEqual({})
  })

  // Test 10: Complex Query with Multiple Types of Conditions
  it('should correctly handle complex queries with multiple types of conditions', () => {
    const query = 'status:"active" AND amount>=100,createdAt<="2021-12-31"'
    const result = formatSearch(
      { status: true, amount: true, createdAt: true },
      query
    )
    expect(result).toEqual({
      AND: [{ status: 'active' }, { amount: { gte: 100 } }],
      createdAt: { lte: new Date('2021-12-31') },
    })
  })
})
