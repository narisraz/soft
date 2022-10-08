'use strict'

module.exports = {
  attributes: {
    deleted: { type: 'boolean', defaulted: true, protected: true }
  },
  document: {
    _guardedDelete: function() {
      this.deleted = true
      return this._guardedSave()
    }
  },
  defaultWheres: {
    deleted: false
  }
}
