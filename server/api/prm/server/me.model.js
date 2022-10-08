'use strict'

const Model = requireComponent('orm').Model
const TimestampMixin = requireComponent('mixins/timestamps')

module.exports = new Model({
  name: 'prm.Me',
  table: 'Prm_Me',
  attributes: {
    idMe: 'id',
    idServer: 'uuid',
    server: { model: 'prm.Server', relationship: 'BelongsTo', localKey: 'idServer' },
  },
  mixins: [
    TimestampMixin
  ]
})
