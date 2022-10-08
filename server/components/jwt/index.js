const jwt = require('jsonwebtoken')
const orm = requireComponent('orm')

const GlobalSettings = orm.getModel('core.GlobalSettings')
const User = orm.getModel('prm.User')

/**
 * Returns the server jwt secret
 *
 * @return a promise which resolves to the server jwt Secret
 */
exports.getServerJwtSecret = async () => (await GlobalSettings.firstOrFail()).jwtSecret

/**
 * Returns the jwt token for a given user
 *
 * @param {User} user a user
 */
exports.getToken = async user => jwt.sign(
  { sub: user.uuid, rev: user.rev },
  await exports.getServerJwtSecret(),
  { expiresIn: '7 days' }
);

/**
 * Verifies that the payloa@d correspond to a valid user, and returns said user
 *
 * @param {Object} payload jwt payload
 */
exports.verify = payload => User
  .where('uuid', payload.sub)
  .where('rev', payload.rev)
  .first();
