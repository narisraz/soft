/**
 * Main application routes
 */

'use strict'

const errors = requireComponent('errors')
const env = process.env.NODE_ENV || 'development'
const logger = require('log4js').getLogger()

module.exports = (app) => {

  // Insert routes below
  app.use('/api', require('./api'))

  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets)/*')
   .get(errors[404])

  // All other routes should redirect to the index.html
  app.route('/*')
    .get((req, res) => {
      res.sendfile(app.get('appPath') + '/index.html')
    })

  // Catch-all error handler
  app.use((err, req, res, next) => {
    var accept = req.headers.accept || ''
    res.statusCode = err.status

    if (!res.statusCode) {
      res.statusCode = 500
      logger.error(err)
    } else {
      if (res.statusCode >= 500) logger.warn(err)
      else if (res.statusCode >= 400) logger.info(err)
    }
    var json = {
      error: err.message,
      redirect: err.redirect
    }
    if (env === 'development') {
      json.stack = err.stack
    }
    if (~accept.indexOf('json')) {
      res.json(json)
    } else {
      res.set('Content-Type', 'text/plain')
      res.send(json.error + "\n" + (json.stack || ''))
    }
  })
}
