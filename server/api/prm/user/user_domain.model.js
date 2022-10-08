'use strict'

const Model = requireComponent('orm').Model
const SyncableMixin = requireComponent('mixins/syncable')

module.exports = new Model({
  name: 'prm.UserDomain',
  table: 'Prm_UserDomain',
  primaryKey: 'idUserDomain',
  attributes: {
    idUserDomain: 'uuid',
    idUser: 'uuid',
    idDomain: 'uuid',

    user: { model: 'prm.User', relationship: 'BelongsTo', localKey: 'idUser', remoteKey: 'uuid' },
    group: { model: 'prm.Domain', relationship: 'BelongsTo', localKey: 'idDomain' },
  },

  mixins: [
    SyncableMixin
  ]
})
