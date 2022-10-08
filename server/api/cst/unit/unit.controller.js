'use strict'

const Unit = require('./unit.model')
const Rest = requireComponent('rest')

class UnitController extends Rest {
  constructor() {
    super({ model: Unit })
  }
}

module.exports = Rest.routes(new UnitController())
