'use strict'

var P = require('bluebird')
var orm = requireComponent('orm')

const res = {
  load() {
    return P.all([
      orm.getModel('prm.Me').expand('server').first().then(data => {
        res.idServer = data.idServer
        res.server = data.server
      }),
      orm.getModel('sync.Config').first().then(data => {
        res.syncConfig = data
      })
    ])
  }
}

module.exports = res
