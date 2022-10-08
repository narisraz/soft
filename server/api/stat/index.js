'use strict'

const express = require('express')
const app = express()
app.use('/dashboard', require('./dashboard'))
app.use('/indicator_type', require('./indicator_type'))
app.use('/indicator_unit', require('./indicator_unit'))
module.exports = app
