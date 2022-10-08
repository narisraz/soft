'use strict'

const express = require('express')
const controller = require('./roam.controller')
const router = express.Router()

router.get('/', controller.sync)

module.exports = router
