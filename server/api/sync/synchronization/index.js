'use strict'

const express = require('express')
const controller = require('./synchronization.controller')
const permission = requireComponent('filters').permission
const router = express.Router()

router.get('/', controller.index)
router.post('/', permission('prm.server.insert'), controller.create)
router.post('/:id/test', permission('prm.server.insert'), controller.test)
router.post('/:id', permission('prm.server.update'), controller.update)
router.get('/:id', controller.show)
router.delete('/:id', permission('prm.server.delete'), controller.destroy)

module.exports = router
