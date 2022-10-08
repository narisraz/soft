'use strict'

const express = require('express')
const controller = require('./permission.controller')
const router = express.Router()

router.get('/', controller.index)
router.get('/:id', controller.show)

module.exports = router
