'use strict'

const express = require('express')
const controller = require('./indicator.controller')
const valueController = require('./indicator_value.controller')
const objectiveController = require('./indicator_objective.controller')
const userController = require('./indicator_user.controller')
const attachmentController = require('./attachment.controller')
const permission = requireComponent('filters').permission
const router = express.Router()

router.get('/', controller.index)

router.get('/export.xlsx', permission('ind.indicator.export'), controller.xls)
router.post('/move', permission('ind.indicator.update'), controller.move)

router.post('/', permission('ind.indicator.insert'), controller.create)
router.get('/:id', controller.show)
router.put('/:id', permission('ind.indicator.update'), controller.update)
router.post('/:id', permission('ind.indicator.update'), controller.update)
router.delete('/:id', permission('ind.indicator.delete'), controller.destroy)

router.get('/:indicator/period/:billingPeriod/value', valueController.index)
router.get('/:indicator/period/:billingPeriod/value/:id', valueController.show)
router.put('/:indicator/period/:billingPeriod/value', permission('ind.indicator.value'), valueController.update)
router.post('/:indicator/period/:billingPeriod/value', permission('ind.indicator.value'), valueController.update)

router.get('/:indicator/objective', objectiveController.index)
router.post('/:indicator/objective', permission('ind.indicator.update'), objectiveController.create)
router.get('/:indicator/objective/:id', objectiveController.show)
router.put('/:indicator/objective/:id', permission('ind.indicator.update'), objectiveController.update)
router.post('/:indicator/objective/:id', permission('ind.indicator.update'), objectiveController.update)
router.delete('/:indicator/objective/:id', permission('ind.indicator.update'), objectiveController.destroy)

router.get('/:indicator/user', userController.index)
router.post('/:indicator/user', permission('ind.indicator.update'), userController.create)
router.get('/:indicator/user/:id', userController.show)
router.put('/:indicator/user/:id', permission('ind.indicator.update'), userController.update)
router.post('/:indicator/user/:id', permission('ind.indicator.update'), userController.update)
router.delete('/:indicator/user/:id', permission('ind.indicator.update'), userController.destroy)

router.get('/:indicator/period/:billingPeriod/attachment', attachmentController.index)
router.get('/:indicator/period/:billingPeriod/attachment/:id', attachmentController.show)
router.post('/:indicator/period/:billingPeriod/attachment', permission('ind.indicator.attachment'), attachmentController.create)
router.put('/:indicator/period/:billingPeriod/attachment/:id', permission('ind.indicator.attachment'), attachmentController.update)
router.post('/:indicator/period/:billingPeriod/attachment/:id', permission('ind.indicator.attachment'), attachmentController.update)
router.delete('/:indicator/period/:billingPeriod/attachment/:id', permission('ind.indicator.attachment'), attachmentController.destroy)

module.exports = router
