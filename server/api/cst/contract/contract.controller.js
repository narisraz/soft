'use strict'

const Contract = require('./contract.model')
const Rest = requireComponent('rest')

class ContractController extends Rest {
  constructor() {
    super({ model: Contract })
  }
}

module.exports = Rest.routes(new ContractController())
