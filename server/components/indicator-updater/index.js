'use strict'

const Updater = require('./updater')

module.exports = (app) => {
  ;(new Updater()).run(app)
}

