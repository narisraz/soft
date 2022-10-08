'use strict'

const express = require('express')
const app = express()
app.use('/all_billing_periods', require('./all_billing_periods'))
app.use('/tour', require('./tour'))
app.use('/reading_book', require('./reading_book'))
app.use('/reading_book_entry', require('./reading_book_entry'))
app.use('/reading_book_table_view', require('./reading_book_entry'))
module.exports = app
