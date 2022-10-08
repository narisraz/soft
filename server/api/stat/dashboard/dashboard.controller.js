'use strict'

const Dashboard = require('./dashboard.model')
const Rest = requireComponent('rest')

class DashboardController extends Rest {
  constructor() {
    super({
      model: Dashboard,
      expand: [ 'indicators' ],
    })
  }
}

module.exports = Rest.routes(new DashboardController())
