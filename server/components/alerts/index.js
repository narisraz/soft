'use strict'

const Runner = require('./runner')

module.exports = (app, interval) => {
  ;(new Runner()).run(app, interval)
}

