'use strict'

const express = require('express')
const controller = require('./unit.controller')
const permission = requireComponent('filters').permission
const router = express.Router()

router.get('/', controller.index)
router.post('/', permission('cst.unit.insert'), controller.create)
router.get('/:id', controller.show)
router.put('/:id', permission('cst.unit.update'), controller.update)
router.post('/:id', permission('cst.unit.update'), controller.update)
router.delete('/:id', permission('cst.unit.delete'), controller.destroy)

module.exports = router
