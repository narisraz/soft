'use strict'

const PermissionBypassModelSecurity = requireComponent('orm-security').PermissionBypassModelSecurity
const DomainModelSecurity = requireComponent('orm-security').DomainModelSecurity
const UnionModelSecurity = requireComponent('orm-security').UnionModelSecurity
const UserTypeModelSecurity = requireComponent('orm-security').UserTypeModelSecurity
const IdServerModelSecurity = requireComponent('orm-security').IdServerModelSecurity

const dbConfig = requireComponent('db-config')

const Server = require('./server.model')

/**
 * Security for the server object.
 *
 * Servers that are visible are:
 *  * The current server (global server)
 *  * Servers which are on a domain accessible to us
 */
class ServerSecurity extends UserTypeModelSecurity {
  constructor() {
    super(
      new PermissionBypassModelSecurity(
        'prm.domains.all',
        new UnionModelSecurity([
          new DomainModelSecurity(Server),
          {
            filterQuery(req, query) {
              query.where('idServer', dbConfig.idServer)
            },
            *hasPermission(req, document, updatedDocument, permission) {
              return document.idServer === dbConfig.idServer
            }
          }
        ])
      ),
      new IdServerModelSecurity(Server)
    )
  }
}

module.exports = ServerSecurity
