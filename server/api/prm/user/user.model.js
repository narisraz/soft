'use strict'

const orm = requireComponent('orm')
const Model = orm.Model

const dbConfig = requireComponent('db-config')
const SoftDeleteMixin = requireComponent('mixins/soft-delete')
const ServerMixin = requireComponent('mixins/server')
const SyncableMixin = requireComponent('mixins/syncable')

function userGroupsValidator(attribute, document, allAttributes) {
  return !(document && document.isLocked && allAttributes.set_groups)
}

function userDomainsValidator(attribute, document, allAttributes, user) {
  // Only a central server has the concept of domains
  if (document && document.set_domains && !dbConfig.syncConfig.server)
    return false
  // Only server users can be linked to domains
  if (
    (allAttributes.set_domains && allAttributes.set_domains.length > 0) &&
    allAttributes.idServer !== dbConfig.idServer
  )
    return false

  return !(document && document.isLocked && allAttributes.set_domains)
}

function isValidValidator(attribute, document, allAttributes) {
  return !(document && document.isLocked && allAttributes.isValid !== true)
}

module.exports = new Model({
  name: 'prm.User',
  table: 'Prm_User',
  attributes: {
    idUser: 'id',
    uuid: 'uuid',
    rev: 'uuid',

    isLocked: { type: 'boolean', protected: true },
    login: { type: 'string', size: 100 },
    passwordHash: { type: 'string', size: 60, hidden: true },
    passwordSalt: { type: 'string', size: 20, hidden: true },
    firstName: { type: 'string', size: 100 },
    lastName: { type: 'string', size: 100 },
    isValid: { type: 'boolean', validator: isValidValidator },

    phone1: { type: 'string', size: 20 },
    phone2: { type: 'string', size: 20 },
    phone3: { type: 'string', size: 20 },
    phone4: { type: 'string', size: 20 },

    email: { type: 'string', size: 100 },

    password: {
      get: function () {
        return this._password
      },
      set: function (user) {
        this._password = user
      }
    },

    groups: {
      validator: userGroupsValidator,
      model: 'prm.Group',
      relationship: 'BelongsToMany',
      localKey: 'uuid',
      joinModel: 'prm.UserGroup',
      joinLocalKey: 'idUser',
      joinRemoteKey: 'idGroup',
    },

    domains: {
      validator: userDomainsValidator,
      model: 'prm.Domain',
      relationship: 'BelongsToMany',
      localKey: 'uuid',
      joinModel: 'prm.UserDomain',
      joinLocalKey: 'idUser',
      joinRemoteKey: 'idDomain',
    },
  },

  views: {
    sync: [
      'uuid', 'isLocked', 'login', 'passwordHash', 'passwordSalt', 'firstName',
      'lastName', 'isValid', 'phone1', 'phone2', 'phone3', 'phone4', 'email',
      'idServer', 'deleted',
      'createdDate', 'creatingUser',
      'lastModificationDate', 'lastModificationUser', 'lastModificationServer'
    ]
  },

  hooks: {
    beforeUpdate: [
      function() {
        if (this.deleted) {
          this.login = this.uuid
        }
      }
    ]
  },

  validators: [
    (data, document) => !(!data && document && document.isLocked)
  ],

  mixins: [
    SyncableMixin,
    ServerMixin,
    SoftDeleteMixin
  ],

  login: function(login, server, password, token) {
    return this.db.exec('Prm_ServerLogin', [ login, server, password, token || null ])
      .then(res => {
        return this.findOrFail(res[0].idUser)
      })
  },

  hasPermission: function(idUser, permission) {
    return this.db.exec('Prm_GetHasPermission', [ idUser, permission ])
  }
}, {
  setPassword: function (loggedUser, password) {
    return this.db.exec('Prm_SetPassword', [ loggedUser, this.id, password ])
  },

  allPermissions: function () {
    return this.db.exec('Prm_GetUserPermissions', [ this.idUser ])
  },

  save: function () {
    let res

    if (this.isNew()) {
      res = this.db.exec('Prm_InsertUser', [
        this.user && this.user.idUser,
        this.login,
        this.password,
        this.firstName,
        this.lastName,
        !!this.isValid,
        this.phone1,
        this.phone2,
        this.phone3,
        this.phone4,
        this.email,
        this.idServer
      ])
    } else {
      res = this.db.exec('Prm_UpdateUser', [
        this.user && this.user.idUser,
        this.uuid,
        this.login,
        this.password,
        this.firstName,
        this.lastName,
        !!this.isValid,
        this.phone1,
        this.phone2,
        this.phone3,
        this.phone4,
        this.email,
        this.idServer
      ])
    }
    return res.then(values => {
      if (!values.length) {
        throw new orm.NotFound()
      }
      return this.import(values[0])
    })
  }
})
