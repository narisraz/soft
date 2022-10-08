'use strict'

const express = require('express')
const controller = require('./server.controller')
const permission = requireComponent('filters').permission
const router = express.Router()

router.get('/', controller.index)
router.get('/me', controller.me)

router.get('/:id', controller.show)
router.post('/', permission('prm.server.create'), controller.create)
router.post('/:id', permission('prm.server.update'), controller.update)

module.exports = router
