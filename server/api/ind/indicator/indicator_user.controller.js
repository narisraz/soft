'use strict'

const IndicatorUser = require('./indicator_user.model')
const IndicatorUserSecurity = require('./indicator_user.security')
const Rest = requireComponent('rest')

class IndicatorUserController extends Rest {
  constructor() {
    super({
      model: IndicatorUser,
      modelSecurity: new IndicatorUserSecurity(),
      expand: ['user']
    })
  }

  *getWhere(req) {
    return {
      idIndicator: req.params.indicator
    }
  }
}

module.exports = Rest.routes(new IndicatorUserController())
