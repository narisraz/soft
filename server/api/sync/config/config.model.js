'use strict'

const Model = requireComponent('orm').Model

module.exports = new Model({
  name: 'sync.Config',
  table: 'Sync_Config',
  attributes: {
    idConfig: 'id',
    server: 'boolean',
    version: 'int',
  }
})
