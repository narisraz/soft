'use strict'

const express = require('express')
const controller = require('./action_batch.controller')
const permission = requireComponent('filters').permission
const router = express.Router()

router.get('/', controller.index)
router.post('/', permission('roam'), controller.create)

module.exports = router
