'use strict'

const Model = requireComponent('orm').Model

module.exports = new Model({
  name: 'roam.Action',
  table: 'Roam_Action',
  primaryKey: 'idAction',
  attributes: {
    idAction: 'uuid',

    idActionType: 'int',
    idActionBatch: 'uuid',
    payload: 'string',
    clientCreatedDate: 'date',
    executedDate: 'date',
    pending: { type: 'boolean', computed: true },
    success: { type: 'boolean', defaulted: true },
    statusDescription: { type: 'string', defaulted: true }
  },
})
