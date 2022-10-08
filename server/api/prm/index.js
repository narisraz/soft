'use strict'

const express = require('express')
const app = express()
app.use('/domain', require('./domain'))
app.use('/group', require('./group'))
app.use('/permission', require('./permission'))
app.use('/server', require('./server'))
app.use('/user', require('./user'))
module.exports = app
