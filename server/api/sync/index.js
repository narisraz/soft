'use strict'

const express = require('express')
const app = express()
app.use('/synchronization', require('./synchronization'))
app.use('/config', require('./config'))
module.exports = app
