
/**
 * Main application file
 */

'use strict'

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development'
global.requireComponent = function(component) {
  return require(__dirname + '/components/' + component)
}

const express = require('express')
const config = require('./config/environment')
const app = express()
const server = require('http').createServer(app)
const requireDirectory = require('require-directory')
const logger = require('log4js').getLogger()

require('./config/log')
require('./config/express')(app)
require('./config/components')(app)

/*
 * Pre-loads all models in the routes directory
 */
requireDirectory(module, './api', { include: /\.model\.js$/ })

/*
 * Passport must be loaded after the user model is loaded
 */
require('./config/passport')(app)

/**
 * Defer the following after loading the part of the config which is in
 * the database.
 */
requireComponent('db-config').load().then(() => {
  requireComponent('sync').run(app)
  require('./routes')(app)

  requireComponent('indicator-updater')(app)
  if (config.alerts.enabled)
    requireComponent('alerts')(app, config.alerts.interval)
  server.listen(config.port, config.ip, () => {
    logger.info(
      'Express server listening on %d, in %s mode (database %s)',
      config.port,
      app.get('env'),
      config.sql.mssql.connection.options.database
    )
  })
})

exports = module.exports = app
