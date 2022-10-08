'use strict'

const express = require('express')
const app = express()
app.use('/file', require('./file'))
module.exports = app
