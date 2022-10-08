'use strict'

const Alert = require('./alert.model')
const AlertSecurity = require('./alert.security')

const Rest = requireComponent('rest')

class AlertController extends Rest {
  constructor() {
    super({
      model: Alert,
      modelSecurity: new AlertSecurity(),
      expand: [{
        expands: 'emails',
        queryFilter: q => q.expand('user')
      }, 'server', 'servers' ],
      relationships: [ 'servers' ]
    })
  }
}

module.exports = Rest.routes(new AlertController())
