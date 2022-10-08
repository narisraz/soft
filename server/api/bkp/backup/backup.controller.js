'use strict'

const Backup = require('./backup.model')
const Rest = requireComponent('rest')

class BackupController extends Rest {
  constructor() {
    super({ model: Backup })
  }
}

module.exports = Rest.routes(new BackupController())
