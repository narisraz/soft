'use strict'

const express = require('express')
const controller = require('./indicator_type.controller')
const router = express.Router()

router.get('/', controller.index)
router.get('/:id', controller.show)
router.get('/:id/value/:billingPeriod', controller.value)

module.exports = router
