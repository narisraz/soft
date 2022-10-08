'use strict'

const Model = requireComponent('orm').Model

module.exports = new Model({
  name: 'bkp.BackupType',
  table: 'Bkp_BackupType',
  attributes: {
    idBackupType: 'id',
    suffix: { type: 'string', size: 20 },
    description: { type: 'string', size: 50 }
  }
})
