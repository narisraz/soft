'use strict'

const Tour = require('./tour.model')
const Rest = requireComponent('rest')
const orm = requireComponent('orm')

class TourController extends Rest {
  constructor() {
    super({ model: Tour })
  }
}

module.exports = Rest.routes(new TourController())
