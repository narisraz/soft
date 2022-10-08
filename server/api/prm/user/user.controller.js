'use strict'

const User = require('./user.model')
const UserSecurity = require('./user.security')
const Rest = requireComponent('rest')
const dbConfig = requireComponent('db-config')
const passport = require('passport')
const jwtComponent = requireComponent('jwt')

class UserController extends Rest {
  constructor() {
    super({
      model: User,
      modelSecurity: new UserSecurity(),
      expand: [ 'server', 'groups', 'domains' ],
      relationships: [ 'groups', 'domains' ]
    })
  }

  *getQuery(req) {
    const query = yield* super.getQuery(req)

    if (req.query.active) {
      query.where('isValid', true)
    }

    if (req.query.permission) {
      query.whereRelationship(
        'groups',
        group => group.whereEither([
          q => q.where('isAdmin', true),
          q => q.whereRelationship(
            'permissions',
            permission => permission.where('permissionKey', req.query.permission)
          )
        ])
      )
    }

    if (req.query.server) {
      query.whereEither([
        q => q.where('idServer', req.query.server),
        q => q
          .where('idServer', dbConfig.idServer)
          .whereRelationship(
            'domains',
            domain => domain.whereRelationship('servers', 'idServer', req.query.server)
          )
      ])
    }

    return query
  }

  logged(req, res, next) {
    res.json(req.user && {
      user: req.user,
      permissions: req.user.cachedPermissions,
      domains: req.user.cachedDomains,
      isSiteUser: req.user.idServer !== dbConfig.idServer
    })
  }

  login(req, res, next) {
    passport.authenticate('local', (err, user, info) => {
      if (err) { return next(err) }
      if (!user) { return next({ status: 401, message: 'User not found' }) }

      req.login(user, err => {
        if (err) { return next(err); }
        return res.json({
          user,
          permissions: user.cachedPermissions
        });
      });
    })(req, res, next);
  }

  logout(req, res, next) {
    return this.wrap(function* (req, res, next) {
      req.logout()
      return { success: true }
    })(req, res, next)
  }

  getJwtToken(req, res, next) {
    return this.wrap(function* (req, res, next) {
      if (!req.user) { return next({ status: 401, message: 'Invalid user' }) }
      return {
        user: req.user,
        token: yield jwtComponent.getToken(req.user)
      }
    })(req, res, next)
  }
}

module.exports = Rest.routes(new UserController())
