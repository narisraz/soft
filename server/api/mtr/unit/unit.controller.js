'use strict'

const Unit = require('./unit.model')
const Rest = requireComponent('rest')
const orm = requireComponent('orm')

class UnitController extends Rest {
  constructor() {
    super({ model: Unit })
  }
}

module.exports = Rest.routes(new UnitController())
