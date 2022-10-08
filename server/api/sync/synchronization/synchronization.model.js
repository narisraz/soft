'use strict'

const Model = requireComponent('orm').Model
const TimestampMixin = requireComponent('mixins/timestamps')
const crypto = require('crypto')
const P = require('bluebird')

module.exports = new Model({
  name: 'sync.Synchronization',
  table: 'Sync_Synchronization',
  primaryKey: 'idSynchronization',
  attributes: {
    idSynchronization: 'uuid',

    push: 'boolean',
    pushUrl: { 
      type: 'string', size: 200,
      set: function(val) {
        this.lastSync = null
        this.version = null
        this.setAttribute('pushUrl', val)
      }
    },
    pushFrequency: 'int',
    psk: { 
      type: 'string', size: 200,
      set: function(val) {
        this.lastSync = null
        this.version = null
        this.setAttribute('psk', val)
      }
    },
    lastSync: { type: 'date', protected: true },
    version: { type: 'int', protected: true },
    idServer: { type: 'uuid', protected: true },
    server: {
      model: 'prm.Server',
      relationship: 'BelongsTo',
      localKey: 'idServer'
    },
  },
  hooks: {
    beforeInsert: function () {
      return new P((resolve, reject) => {
        crypto.randomBytes(24, (err, buffer) => {
          this.set('psk', buffer.toString('hex'))
          resolve()
        })
      })
    }
  },
  mixins: [
    TimestampMixin
  ]
})
