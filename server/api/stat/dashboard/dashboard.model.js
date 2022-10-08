'use strict'

const Model = requireComponent('orm').Model

module.exports = new Model({
  name: 'stat.Dashboard',
  table: 'Stat_Dashboard',
  attributes: {
    idDashboard: 'id',
    indicators: { model: 'stat.Indicator', relationship: 'HasMany', remoteKey: 'idDashboard' },
    name: { type: 'string', size: 500 },
    description: 'text'
  }
})
