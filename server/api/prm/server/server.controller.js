'use strict'

const Server = require('./server.model')
const Permission = require('../permission/permission.model')
const Me = require('./me.model')
const Rest = requireComponent('rest')
const dbConfig = requireComponent('db-config')

const ServerSecurity = require('./server.security')

class ServerController extends Rest {
  constructor() {
    super({
      model: Server,
      modelSecurity: new ServerSecurity(),
      expand: [ 'synchronization' ]
    })
  }

  me(req, res, next) {
    Me.expand('server').find(1).then(function (me) {
      res.json(me.server.toArray())
    })
  }

  create(req, res, next) {
    var that = this
    return that.wrap(function*(req, res, next) {
      const server = yield* that.createGenerator(req, res, next)

      const permissions = yield Permission
        .where('idServer', dbConfig.idServer)
        .where('webGroup', true)
        .get()

      for (let permission of permissions) {
        yield Permission.create({
          permissionKey: permission.permissionKey,
          description: permission.description,
          webGroup: true,
          transferable: permission.transferable,
          idServer: server.idServer
        }).save()
      }

      return server
    })(req, res, next)
  }
}

module.exports = Rest.routes(new ServerController())
