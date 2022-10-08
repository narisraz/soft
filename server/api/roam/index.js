'use strict'

const express = require('express')
const app = express()
app.use('/sync', require('./sync'))
app.use('/action_batch', require('./action_batch'))

module.exports = app
