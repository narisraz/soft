'use strict'

const express = require('express')
const controller = require('./contract.controller')
const permission = requireComponent('filters').permission
const router = express.Router()

router.get('/', controller.index)
router.post('/', permission('cst.contract.insert'), controller.create)
router.get('/:id', controller.show)
router.put('/:id', permission('cst.contract.update'), controller.update)
router.post('/:id', permission('cst.contract.update'), controller.update)
router.delete('/:id', permission('cst.contract.delete'), controller.destroy)

module.exports = router
