'use strict'

const Model = requireComponent('orm').Model
const TimestampMixin = requireComponent('mixins/timestamps')

module.exports = new Model({
  name: 'cf.Period',
  table: 'Cf_Period',
  attributes: {
    idPeriod: 'id',
    balance: 'float',
    date: 'date'
  },
  mixins: [
    TimestampMixin
  ]
}, {
  next: function next() {
    return this.model.order('date').where('date', '>', this.date).first()
  }
})
