'use strict'

const Model = requireComponent('orm').Model

module.exports = new Model({
  name: 'bkp.Backup',
  table: 'Bkp_Backup',
  attributes: {
    idBackup: 'id',
    idBackupType: 'int',
    backupType: { model: 'bkp.BackupType', relationship: 'BelongsTo', localKey: 'idBackupType' },
    wd1: 'bool',
    wd2: 'bool',
    wd3: 'bool',
    wd4: 'bool',
    wd5: 'bool',
    wd6: 'bool',
    wd7: 'bool',
    time: 'date'
  }
})
