'use strict'

const Model = requireComponent('orm').Model
const TimestampMixin = requireComponent('mixins/timestamps')

module.exports = new Model({
  name: 'cf.Prediction',
  table: 'Cf_Prediction',
  attributes: {
    idPrediction: 'id',
    idPeriod: 'int',
    period: { model: 'cf.Period', relationship: 'BelongsTo', localKey: 'idPeriod' },
    description: { type:'string', size: 400 },
    predictedAmount: 'float',
    realAmount: 'float',
    predictedDate: 'date',
    realDate: 'date',
    canceled: 'boolean',
    idDelayedTo: 'int',
    periodicity: 'int',
    periodicityType: 'int',
    seriesEnd: 'date',
    seriesIdPrediction: 'int',
    seriesOrder: 'int',
    series: { model: 'cf.Prediction', relationship: 'BelongsTo', localKey: 'seriesIdPrediction' },

    delayedTo: { model: 'cf.Prediction', relationship: 'BelongsTo', localKey: 'idDelayedTo' },
    delayedFrom: { model: 'cf.Prediction', relationship: 'HasOne', remoteKey: 'idDelayedTo' }
  },
  mixins: [
    TimestampMixin
  ]
})
