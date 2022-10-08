/**
 * Express configuration
 */

'use strict'

const express = require('express')
const session = require('express-session')
const cors = require('cors')
const favicon = require('serve-favicon')
const morgan = require('morgan')
const compression = require('compression')
const bodyParser = require('body-parser')
const busboy = require('connect-busboy')
const methodOverride = require('method-override')
const cookieParser = require('cookie-parser')
const errorHandler = require('errorhandler')
const path = require('path')
const config = require('./environment')
const moment = require('moment')
const log4js = require('log4js')

module.exports = (app) => {
  const env = app.get('env')

  moment.locale('fr')

  const logger = log4js.getLogger()
  const webLogger = morgan({
    "format": "default",
    "stream": {
      write: function(str) { logger.debug(str) }
    }
  })

  app.set('views', config.root + '/server/views')
  app.engine('html', require('ejs').renderFile)
  app.set('view engine', 'html')
  app.use(compression())
  app.use(busboy())
  app.use(bodyParser.urlencoded({ extended: false, limit: '50mb' }))
  app.use(bodyParser.json({ limit: '50mb' }))
  app.use(methodOverride())
  app.use(cookieParser())
  app.use(session(config.session))
  app.use(cors())

  if ('production' === env) {
    app.use(favicon(path.join(config.root, 'public', 'favicon.ico')))
    app.use(express.static(path.join(config.root, 'public')))
    app.set('appPath', path.join(config.root, 'public'))
    app.use(webLogger)
  }

  if ('development' === env || 'test' === env) {
    app.use(require('connect-livereload')({
      ignore: [
        /\.js(\?.*)?$/, /\.css(\?.*)?$/, /\.svg(\?.*)?$/, /\.ico(\?.*)?$/, /\.woff(\?.*)?$/,
        /\.png(\?.*)?$/, /\.jpg(\?.*)?$/, /\.jpeg(\?.*)?$/, /\.gif(\?.*)?$/, /\.pdf(\?.*)?$/,
        /^\/api\/(.*)/, /^\/sync-backend\/(.*)/
      ]
    }))
    app.use(express.static(path.join(config.root, '.tmp')))
    app.use(express.static(path.join(config.root, 'client')))
    app.set('appPath', 'client')
    app.use(webLogger)
    app.use(errorHandler()) // Error handler - has to be last
  }
}
