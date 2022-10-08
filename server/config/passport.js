const orm = requireComponent('orm')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const User = orm.getModel('prm.User')
const logger = require('log4js').getLogger()
const _ = require('lodash')
const config = require('./environment')
const jwtComponent = requireComponent('jwt')

async function expandUser(user) {
  await user.expand('domains')
  await user.expand('server')
  const res = user.toArray()
  res.cachedPermissions = _(await user.allPermissions())
    .keyBy('permissionKey')
    .mapValues('hasPermission').value()
  res.cachedDomains = _.map(user.domains, 'idDomain')
  return res
}

module.exports = app => {
  /*
   * Configuring the local, user/password strategy, used for the login page
   */
  passport.use(new LocalStrategy(
    async (username, password, done) => {
      try {
        logger.info('User %s trying to login', username)
        const [ login, server ] = username.split('@')
        const user = await User.login(login, server, password, null)
        const expandedUser = await expandUser(user)
        logger.info('User %s logged in', username)
        return done(null, expandedUser)
      } catch (err) {
        logger.warn('User %s failed logging in', username, err)
        return done(null, false)
      }
    }
  ))

  /*
   * All API endpoints can also use the JWT strategy for sessionless authentication
   */
  passport.use(
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKeyProvider: async (request, rawJwtToken, done) => {
          return done(null, await jwtComponent.getServerJwtSecret())
        }
      },
      async (jwtPayload, done) => {
        try {
          logger.info('Verifying JWT token')
          const user = await jwtComponent.verify(jwtPayload)
          return user == null
            ? done(null, false)
            : done(null, await expandUser(user))
        } catch (err) {
          return done(err)
        }
      }
    )
  )

  passport.serializeUser((user, done) => done(null, user.uuid))

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.where('uuid', id).firstOrFail()
      const expandedUser = await expandUser(user)
      return done(null, expandedUser)
    } catch (err) {
      return done(err)
    }
  });

  app.use(passport.initialize());
  app.use(passport.session());
}
