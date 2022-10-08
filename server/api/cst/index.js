'use strict'

const express = require('express')
const app = express()

app.use('/customer', require('./customer'))
app.use('/unit', require('./unit'))
app.use('/contract', require('./contract'))
app.use('/contract_table_view', require('./contract_table_view'))

module.exports = app

