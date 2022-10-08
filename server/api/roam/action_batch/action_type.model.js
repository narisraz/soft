'use strict'

const Model = requireComponent('orm').Model

module.exports = new Model({
  name: 'roam.ActionType',
  table: 'Roam_ActionType',
  primaryKey: 'idActionType',
  attributes: {
    idActionType: 'int',
    description: 'string',
  }
})
