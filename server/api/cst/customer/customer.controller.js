'use strict'

const Customer = require('./customer.model')
const Rest = requireComponent('rest')

class CustomerController extends Rest {
  constructor() {
    super({ model: Customer })
  }
}

module.exports = Rest.routes(new CustomerController())
