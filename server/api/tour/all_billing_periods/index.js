'use strict'

const express = require('express')
const controller = require('./all_billing_periods.controller')
const router = express.Router()

router.get('/', controller.index)
router.get('/last', controller.last)
router.get('/:id', controller.show)
module.exports = router
