'use strict'

const path = require('path')
const _ = require('lodash')
const rootPath = path.normalize(__dirname + '/../../..')

// All configurations will extend these options
// ============================================
var all = {
  env: process.env.NODE_ENV,

  // Root path of server
  root: rootPath,

  // Server port
  port: process.env.PORT || 9000,

  session: {
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {

    }
  },

  sql: {
    driver: 'mssql',

    mssql: {
      connection: {
        server: process.env.DATABASE_HOST || 'localhost',
        userName: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,

        options: {
          database: process.env.DATABASE,
          port: process.env.DATABASE_PORT || undefined,
          instanceName: process.env.INSTANCE_NAME,
          encrypt: !!(+process.env.DATABASE_ENCRYPT)// jshint ignore:line
        }
      },
      pool: {
        max: 1000,
        min: 10,
        idleTimeoutMillis: 30000
      }
    }
  },

  alerts: {
    interval: 60 * 1000,
    enabled: !!+process.env.ALERTS_ENABLED || false // jshint ignore:line
  },

  email: {
    driver: 'sendgrid',

    calendarDomain: 'lysagroup.com',
    calendarName: 'Alertes Lysasoft',

    smtp: {
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      secure: !!+process.env.MAIL_SECURE, // jshint ignore:line
      auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASSWORD
      }
    },
    mandrill: {
      fromName: 'Lysasoft',
      fromEmail: process.env.ALERTS_FROM_EMAIL,
      apiKey: process.env.MANDRILL_API_KEY
    },

    sendgrid: {
      fromName: 'Lysasoft',
      fromEmail: process.env.ALERTS_FROM_EMAIL,
      apiKey: process.env.SENDGRID_API_KEY
    }
  },

  storage: {
    driver: 'filesystem',

    filesystem: {
      path: process.env.STORAGE_PATH || path.normalize(__dirname + '/../../../storage'),
    }
  },

  log: {
    appenders: [
      { type: 'console' },
      {
        type: 'file',
        filename: rootPath + '/log/lss.log',
        maxLogSize: 1000000,
        backups: 10,
      }
    ]
  }
}

// Export the config object based on the NODE_ENV
// ==============================================
module.exports = _.merge(
  all,
  require('./' + process.env.NODE_ENV + '.js') || {})
