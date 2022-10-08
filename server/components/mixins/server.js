'use strict'

const dbConfig = requireComponent('db-config')

module.exports = {
  attributes: {
    idServer: {
      type: 'uuid',
      validators: [function (idServer, document) {
        // If we are changing an existing document, idServer cannot change
        if (document) {
          if (idServer !== document.idServer)
            return false
        }
        if (dbConfig.syncConfig.server || idServer === dbConfig.idServer)
          return true
        return 'Invalid server ID'
      }]
    },
    server: {
      model: 'prm.Server',
      relationship: 'BelongsTo',
      localKey: 'idServer'
    },
  },
  validators: [function(data, document) {
    if (!data) {
      // We are trying to delete the document
      if (dbConfig.syncConfig.server || document.idServer === dbConfig.idServer)
        return true
      return 'Cannot delete a document we do not own'
    }
    return true
  }],
}
