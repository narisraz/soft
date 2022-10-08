'use strict'

const Model = requireComponent('orm').Model
const TimestampsMixin = requireComponent('mixins/timestamps')

module.exports = new Model({
  name: 'prm.Domain',
  table: 'Prm_Domain',
  primaryKey: 'idDomain',
  attributes: {
    idDomain: 'uuid',
    name: { type: 'string', size: 200 },
    servers: {
      model: 'prm.Server',
      relationship: 'HasMany',
      remoteKey: 'idDomain'
    },
  },
  mixins: [
    TimestampsMixin,
  ]
})
