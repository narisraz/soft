'use strict'

const express = require('express')
const controller = require('./unit.controller')
const router = express.Router()

router.get('/', controller.index)
router.get('/:id', controller.show)

module.exports = router
