'use strict'

const ContractTableView = require('./contract_table_view.model')
const Rest = requireComponent('rest')

class ContractTableViewController extends Rest {
  constructor() {
    super({ model: ContractTableView })
  }
}

module.exports = Rest.routes(new ContractTableViewController())
