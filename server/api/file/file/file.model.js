'use strict'

const Model = requireComponent('orm').Model
const SyncableMixin = requireComponent('mixins/syncable')
const ServerMixin = requireComponent('mixins/server')

 module.exports = new Model({
  name: 'file.File',
  table: 'File_File',
  primaryKey: 'idFile',
  attributes: {
    idFile: 'uuid',
    name: { type: 'string', size: 512 },
    type: { type: 'string', size: 64 },
    hash: { type: 'string', size: 128 },
    complete: { type: 'boolean', protected: true },
  },
  views: {
    sync: [
      'idFile', 'name', 'type', 'hash', 'idServer',
      'createdDate', 'creatingUser',
      'lastModificationDate', 'lastModificationUser', 'lastModificationServer'
    ]
  },
  mixins: [
    SyncableMixin,
    ServerMixin
  ]
})
