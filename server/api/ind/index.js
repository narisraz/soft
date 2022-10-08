'use strict'

const express = require('express')
const app = express()
app.use('/indicator', require('./indicator'))
app.use('/alert', require('./alert'))
app.use('/sent_alert', require('./sent_alert'))
module.exports = app
