'use strict'

const Model = requireComponent('orm').Model

module.exports = new Model(
  {
    name: 'tour.AllBillingPeriods',
    table: 'Tour_AllBillingPeriods',
    attributes: {
      billingPeriod: 'int',
      referenceDate: 'date'
    }
  }
)
