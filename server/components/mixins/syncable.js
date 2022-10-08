'use strict'

let serverId = null
const orm = require('../orm')

module.exports = {
  attributes: {
    createdDate: { type: 'date', defaulted: true, protected: true },
    creatingUser: { type: 'uuid', model: 'prm.User', relationship: 'BelongsTo', remoteKey: 'uuid', protected: true },
    lastModificationDate: { type: 'date', defaulted: true, protected: true },
    lastModificationUser:  { type: 'uuid', model: 'prm.User', relationship: 'BelongsTo', remoteKey: 'uuid', protected: true },
    lastModificationServer:  { type: 'uuid', model: 'prm.Server', relationship: 'BelongsTo', remoteKey: 'idServer', protected: true },

    user: {
      get: function () {
        return this._user
      },
      set: function (user) {
        this._user = user
      }
    }
  },

  hooks: {
    beforeInsert: [
      function () {
        this.set('creatingUser', this._user && this._user.uuid)
      }
    ],
    beforeSave: [
      function () {
        this.set('lastModificationUser',  this._user && this._user.uuid)
        this.set('lastModificationDate', new Date())

        if (serverId) {
          this.set('lastModificationServer', serverId)
        } else {
          return orm.getModel('prm.Me').find(1).then((me) => {
            serverId = me.idServer
            this.set('lastModificationServer', serverId)
          })
        }
      }
    ],
    afterDelete: [
      function() {
        const Deletion = orm.getModel('sync.Deletion')
        let key
        if (this.model.attributes[this.model.primary()].type === 'uuid') {
          key = this.model.primary()
        } else {
          key = 'uuid'
        }

        return Deletion.create({
          table: this.model.table,
          key,
          value: this.get(key),
          processed: 1
        }).set('user', this._user).save()
      }
    ]
  }
}
