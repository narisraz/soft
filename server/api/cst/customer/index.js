'use strict'

const express = require('express')
const controller = require('./customer.controller')
const permission = requireComponent('filters').permission
const router = express.Router()

router.get('/', controller.index)
router.post('/', permission('cst.customer.insert'), controller.create)
router.get('/:id', controller.show)
router.put('/:id', permission('cst.customer.update'), controller.update)
router.post('/:id', permission('cst.customer.update'), controller.update)
router.delete('/:id', permission('cst.customer.delete'), controller.destroy)

module.exports = router
