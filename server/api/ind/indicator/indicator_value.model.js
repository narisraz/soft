'use strict'

const Model = requireComponent('orm').Model
const SyncableMixin = requireComponent('mixins/syncable')
const xml2js = require('xml2js')
const P = require('bluebird')
const _ = require('lodash')
const ServerMixin = requireComponent('mixins/server')

function expandExtra(extra) {
  if (!extra)
    return P.resolve(null)

  return new P((resolve, reject) => {
    (new xml2js.Parser({ explicitRoot: false }))
    .parseString(`<x>${extra}</x>`, (err, data) => {
      if (err) reject(err)
      else resolve(data)
    })
  }).then(data => {
    if (!data.line) return
    return _(data.line).keyBy('subIndicator').mapValues(line => {
      return {
        header: line.shortHeader && line.shortHeader[0],
        value: line.value && +line.value[0]
      }
    }).value()
  })
}

module.exports = new Model({
  name: 'ind.IndicatorValue',
  table: 'Ind_IndicatorValue',
  primaryKey: 'idIndicatorValue',
  expandExtra: expandExtra,
  attributes: {
    idIndicatorValue: 'uuid',
    idIndicator: 'uuid',
    indicator: { model: 'ind.Indicator', relationship: 'BelongsTo', localKey: 'idIndicator' },
    billingPeriod: 'int',
    manual: 'boolean',
    value: 'float',
    extra: { type: 'string' },
    graph: { type: 'object', computed: true }
  },
  hooks: {
    afterLoad: function() {
      return expandExtra(this.extra).then(res => this.graph = res)
    },
    afterSave: function() {
      return expandExtra(this.extra).then(res => this.graph = res)
    },
  },
  mixins: [
    SyncableMixin,
    ServerMixin
  ]
})
