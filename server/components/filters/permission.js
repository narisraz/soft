'use strict'

const orm = requireComponent('orm')
const Forbidden = require('./forbidden')
const P = require('bluebird')
const co = P.coroutine
const logger = require('log4js').getLogger()

module.exports = (permission) => {
  return (req, res, next) => {
    return co(function*() {
      var User = orm.getModel('prm.User')

      if (process.env.NODE_ENV === 'test') {
        return next()
      }
      if (process.env.NODE_ENV === 'development' && (process.env.DEBUG_ALLOW || +req.query.debugAllow)) {
        return next()
      }

      if (!req.user || !req.user.idUser) {
        logger.info('Unauthentified user forbidden access', {
          url: req.url,
          permission
        })
        return next(new Forbidden(true))
      }

      User.hasPermission(req.user.idUser, permission).then((res) => {
        if (res[0] && res[0].hasPermission) {
          return next()
        } else {
          logger.info('Forbidden access', {
            user: req.user.login,
            url: req.url,
            permission
          })
          return next(new Forbidden())
        }
      }).catch((err) => {
        logger.error('Error while checking access', {
          user: req.user.login,
          url: req.url,
          permission
        })
        return next(new Forbidden())
      })
    })()
  }
}
