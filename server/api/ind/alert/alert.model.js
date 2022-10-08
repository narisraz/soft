'use strict'

const Model = requireComponent('orm').Model
const SyncableMixin = requireComponent('mixins/syncable')
const ServerMixin = requireComponent('mixins/server')
const dbConfig = requireComponent('db-config')

function alertServersValidator(idServer, document, allAttributes) {
  if (!dbConfig.syncConfig.server) {
    // If we are a client, forbid any set_servers.
    if (allAttributes.set_servers && allAttributes.set_servers.length)
      return false
  } else {
    // If we are a server:
    // set_servers is either empty, or with 2 or more elements
    // idServer must be null if there are 2 or more elements in set_servers
    if (allAttributes.set_servers) {
      if (allAttributes.set_servers.length === 1)
        return false
      if (allAttributes.set_servers.length >= 2 && idServer)
        return false
    }
  }
  return true
}

module.exports = new Model({
  name: 'ind.Alert',
  table: 'Ind_Alert',
  primaryKey: 'idAlert',
  attributes: {
    idAlert: 'uuid',
    title: { type: 'string', size: 200 },
    alertType: 'int',

    sendDateType: 'int',
    sendMonthDay: 'int',
    sendWeekDay: 'int',
    sendWeekDayNumber: 'int',
    sendFixedDate: 'date',

    eventDateType: 'int',
    eventMonthDay: 'int',
    eventWeekDay: 'int',
    eventWeekDayNumber: 'int',
    eventFixedDate: 'date',

    period: 'int',

    sendToIndicatorOwners: 'boolean',

    emails: {
      model: 'ind.AlertEmail',
      relationship: 'HasMany',
      remoteKey: 'idAlert'
    },

    idServer: { validators: [ alertServersValidator ] },

    servers: {
      model: 'prm.Server',
      relationship: 'BelongsToMany',
      joinModel: 'ind.AlertServer',
      joinLocalKey: 'idAlert',
      joinRemoteKey: 'idServer',
    },

    sentAlerts: {
      model: 'ind.SentAlert',
      relationship: 'HasMany',
      remoteKey: 'idAlert'
    }
  },
  mixins: [
    SyncableMixin,
    ServerMixin
  ]
})
