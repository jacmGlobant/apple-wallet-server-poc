'use strict'

const { test } = require('tap')
const { build } = require('../helper')

test('example is loaded', async (t) => {
  const app = await build(t)

  const res = await app.inject({
    method: 'POST',
    url: '/loyaltycard/8287871182',
    body: {
      name: 'John Wick',
      accountNumber: '9876543210',
      tier: 'X'
    }
  })
  t.equal(res.statusCode, 200)
})
