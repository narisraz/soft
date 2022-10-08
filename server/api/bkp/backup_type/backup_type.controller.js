'use strict'

const BackupType = require('./backup_type.model')
const Rest = requireComponent('rest')

class BackupTypeController extends Rest {
  constructor() {
    super({ model: BackupType })
  }
}

module.exports = Rest.routes(new BackupTypeController())
