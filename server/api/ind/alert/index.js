'use strict'

const express = require('express')
const controller = require('./alert.controller')
const emailController = require('./alert_email.controller')
const permission = requireComponent('filters').permission
const router = express.Router()

router.get('/', controller.index)
router.post('/', permission('ind.alert.insert'), controller.create)
router.get('/:id', controller.show)
router.put('/:id', permission('ind.alert.update'), controller.update)
router.post('/:id', permission('ind.alert.update'), controller.update)
router.delete('/:id', permission('ind.alert.delete'), controller.destroy)

router.get('/:alert/email', permission('ind.alert.update'), emailController.index)
router.post('/:alert/email', permission('ind.alert.update'), emailController.create)
router.get('/:alert/email/:id', permission('ind.alert.update'), emailController.show)
router.put('/:alert/email/:id', permission('ind.alert.update'), emailController.update)
router.post('/:alert/email/:id', permission('ind.alert.update'), emailController.update)
router.delete('/:alert/email/:id', permission('ind.alert.update'), emailController.destroy)

module.exports = router
