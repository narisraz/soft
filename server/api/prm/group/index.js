'use strict'

const express = require('express')
const controller = require('./group.controller')
const permission = requireComponent('filters').permission
const router = express.Router()

router.get('/', controller.index)
router.post('/', permission('prm.group.insert'), controller.create)
router.get('/:id', controller.show)
router.put('/:id', permission('prm.group.update'), controller.update)
router.post('/:id', permission('prm.group.update'), controller.update)
router.delete('/:id', permission('prm.group.delete'), controller.destroy)

module.exports = router
