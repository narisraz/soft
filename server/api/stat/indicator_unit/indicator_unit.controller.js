'use strict'

const IndicatorUnit = require('./indicator_unit.model')
const Rest = requireComponent('rest')

class IndicatorUnitController extends Rest {
  constructor() {
    super({ model: IndicatorUnit })
  }
}

module.exports = Rest.routes(new IndicatorUnitController())
