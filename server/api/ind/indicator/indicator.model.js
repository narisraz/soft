'use strict'

const Model = requireComponent('orm').Model
const SyncableMixin = requireComponent('mixins/syncable')
const ServerMixin = requireComponent('mixins/server')
const LastIndicatorValue  = require('./last_indicator_value.model')
const orm = requireComponent('orm')

 module.exports = new Model({
  name: 'ind.Indicator',
  table: 'Ind_Indicator',
  primaryKey: 'idIndicator',
  attributes: {
    idIndicator: 'uuid',
    name: { type: 'string', size: 100 },
    code: { type: 'string', size: 50 },
    unit: { type: 'string', size: 30 },

    ordering: { type: 'int', protected: true },
    idIndicatorType: 'int',
    indicatorType: {
      model: 'stat.IndicatorType',
      relationship: 'BelongsTo',
      localKey: 'idIndicatorType'
    },

    decimals: 'int',
    limitMin: 'float',
    limitMax: 'float',
    alertMin: 'float',
    alertMax: 'float',
    baseline: 'float',

    values: {
      model: 'ind.IndicatorValue',
      relationship: 'HasMany',
      remoteKey: 'idIndicator'
    },
    attachments: {
      model: 'ind.Attachment',
      relationship: 'HasMany',
      remoteKey: 'idIndicator'
    },
    lastValues: {
      model: 'ind.LastIndicatorValue',
      relationship: 'HasMany',
      remoteKey: 'idIndicator',
      autoDelete: false
    },
    objectives: {
      model: 'ind.IndicatorObjective',
      relationship: 'HasMany',
      remoteKey: 'idIndicator'
    },
    users: {
      model: 'prm.User',
      relationship: 'BelongsToMany',
      joinModel: 'ind.IndicatorUser',
      joinLocalKey: 'idIndicator',
      remoteKey: 'uuid',
      joinRemoteKey: 'idUser',
    },
  },
  mixins: [
    SyncableMixin,
    ServerMixin
  ],
  hooks: {
    afterInsert: [
      function() {
        return this.db.exec('Ind_UpdateOrdering', [ this.idIndicator ])
      }
    ]
  },
  move: function (loggedUser, from, to, position) {
    return this.db.exec('Ind_Move', [ loggedUser, from, to, position ])
  },
}, {
  setValue: function (loggedUser, idServer, billingPeriod, value, manual) {
    if (typeof manual === 'undefined')
      manual = true

    return orm.db.exec('Ind_SetIndicatorValue', [
      loggedUser,
      this.idIndicator,
      idServer,
      billingPeriod,
      value,
      manual
    ])
    .then(data => data = data && LastIndicatorValue.create().import(data[0]))
  }

})
