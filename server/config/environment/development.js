'use strict'

// Development specific configuration
// ==================================
module.exports = {
  // MongoDB connection options
  mongo: {
    uri: 'mongodb://localhost/lysasoftserver-dev'
  },

  alerts: {
    interval: 5000
  },

  sql: {
    mssql: {
      logAllQueries: false
    }
  }
}
