import { formatExpand } from './expand'

describe('formatExpand', () => {
  it('should return null if expand is not in relations', () => {
    const relations = ['customer', 'checkoutSession.lineItems']
    const expand = ['order']
    const result = formatExpand(relations, expand)
    expect(result).toEqual({})
  })

  it('should return include with a normal relation', () => {
    const relations = ['customer', 'checkoutSession.lineItems']
    const expand = ['customer']
    const result = formatExpand(relations, expand)
    expect(result).toEqual({
      customer: true,
    })
  })

  it('should return include with a nested relation', () => {
    const relations = ['customer', 'checkoutSession.lineItems']
    const expand = ['checkoutSession.lineItems']
    const result = formatExpand(relations, expand)
    expect(result).toEqual({
      checkoutSession: {
        include: {
          lineItems: true,
        },
      },
    })
  })
})
