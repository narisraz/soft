'use strict'

const Model = requireComponent('orm').Model
const dbConfig = requireComponent('db-config')

function serverDomainsValidator(data, document, user) {
  if (data && document && data.idDomain !== document.idDomain) {
    // Only a central server has the concept of domains
    if (!dbConfig.syncConfig.server) {
      return false
    }
    // The server itself cannot be lined to a domain
    if (document.idServer === dbConfig.idServer)
      return false
    // Requires permissions to link users to domains
    if (!user.cachedPermissions['prm.domains.set_servers'])
      return false
  }
  return true
}

module.exports = new Model({
  name: 'prm.Server',
  table: 'Prm_Server',
  primaryKey: 'idServer',
  attributes: {
    idServer: 'uuid',
    idDomain: 'uuid',
    domain: { model: 'prm.Domain', relationship: 'BelongsTo', localKey: 'idDomain' },
    name: { type: 'string', size: 200 },
    identifier: { type: 'string', size: 100 },
    location: { type: 'string', size: 500 },
    idFile: 'uuid',
    file: { model: 'file.File', relationship: 'BelongsTo', localKey: 'idFile' },
    dashboardOnly: 'boolean',
    customers: 'int',
    lastSync: 'date',
    me: { model: 'prm.Me', relationship: 'HasOne', remoteKey: 'idServer' },
    synchronization: { model: 'sync.Synchronization', relationship: 'HasOne', remoteKey: 'idServer' },

    createdDate: { type: 'date', defaulted: true, protected: true },
    lastModificationDate: { type: 'date', defaulted: true, protected: true },
    lastModificationServer: { type: 'uuid', model: 'prm.Server', relationship: 'BelongsTo', remoteKey: 'idServer', protected: true },
  },
  views: {
    sync: [
      'idServer', 'name', 'location', 'idFile', 'dashboardOnly', 'customers', 'lastSync',
      'createdDate', 'lastModificationDate', 'lastModificationServer'
    ]
  },
  validators: [
    serverDomainsValidator
  ],
  hooks: {
    beforeSave: [
      function () {
        this.set('lastModificationDate', new Date())
        this.set('lastModificationServer', dbConfig.idServer)
      }
    ]
  }
})
