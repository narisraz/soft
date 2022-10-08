'use strict'

module.exports = {
  attributes: {
    createdDate: { type: 'date', defaulted: true, protected: true },
    creatingUser: { type: 'uuid', model: 'prm.User', relationship: 'BelongsTo', remoteKey: 'uuid', protected: true },
    lastModificationDate: { type: 'date', defaulted: true, protected: true },
    lastModificationUser:  { type: 'uuid', model: 'prm.User', relationship: 'BelongsTo', remoteKey: 'uuid', protected: true },

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
        if (!this._user) return
        this.set('creatingUser', this._user.uuid)
      }
    ],
    beforeSave: [
      function () {
        if (!this._user) return
        this.set('lastModificationUser', this._user.uuid)
        this.set('lastModificationDate', new Date())
      }
    ]
  }
}
