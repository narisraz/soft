'use strict'

var P = require('bluebird')
var _ = require('lodash')
var builder = require('./builder')
var ConnectionPool = require('tedious-connection-pool')
var tedious = require('tedious')
const logger = require('log4js').getLogger()

var config
var pool

module.exports.config = function config_(c) {
  config = c
  pool = new ConnectionPool(c.pool, c.connection)

  pool.on('error', function(err) {
    logger.error(err)
  })
}

var getConnection = module.exports.getConnection = function () {
  return new P(function(resolve, reject) {
      pool.acquire(function (err, connection) {
        if (err) {
          reject(err)
        } else {
          resolve(connection)
        }
      })
    })
}

/**
 *
 * @param query Object
 *          sql: sql string
 */
var runQuery = module.exports.runQuery = function (query) {
  return new P(function(resolve, reject) {
    getConnection().then(function(connection) {
      try {
        var res = []
        if (config.logAllQueries) {
          logger.debug(query.sql)
          logger.debug(query.params)
        }
        var req = new tedious.Request(query.sql, function(err, rowcount) {
          if (err) {
            err.message += ' ' + query.sql + ' [' + query.params.join(', ') + ']'
            reject(err)
          } else {
            resolve(res)
          }

          connection.close()
        })

        query.params.forEach(function(value, parameter) {
          if (value instanceof Date) {
            req.addParameter(parameter, tedious.TYPES.DateTime, value)
          } else if (_.isFunction(value.toDate)) {
            req.addParameter(parameter, tedious.TYPES.DateTime, value.toDate())
          } else if (_.isBoolean(value)) {
            req.addParameter(parameter, tedious.TYPES.Bit, value)
          } else if (_.isNumber(value)) {
            req.addParameter(parameter, tedious.TYPES.Float, value)
          } else {
            req.addParameter(parameter, tedious.TYPES.NVarChar, value)
          }
        })

        req.on('row', function(columns) {
          var row = {}
          columns.forEach(function(col) {
            row[col.metadata.colName] = col.value
          })
          res.push(row)
        })

        connection.execSql(req)
      } catch (e) {
        reject(e)
      }
    })
  })
}

/*
 * Attach all properties of the query builder
 */
Object.getOwnPropertyNames(builder).forEach(function(val) {
  module.exports[val] = function() {
    var query = builder[val].apply(builder, arguments)

    return runQuery(query)
  }
})
