'use strict'

const express = require('express')
const controller = require('./dashboard.controller')
const indicatorController = require('./indicator.controller')
const permission = requireComponent('filters').permission
const router = express.Router()

router.get('/', controller.index)
router.post('/', permission('stat.dashboard.edit'), controller.create)
router.get('/:id', controller.show)
router.put('/:id', permission('stat.dashboard.edit'), controller.update)
router.post('/:id', permission('stat.dashboard.edit'), controller.update)
router.delete('/:id', permission('stat.dashboard.edit'), controller.destroy)

router.get('/:dashboard/indicators', permission('stat.dashboard.edit'), indicatorController.index)
router.get('/:dashboard/indicators/:billingPeriod', permission('stat.dashboard.edit'), indicatorController.show)
router.put('/:dashboard/indicators/:billingPeriod', permission('stat.dashboard.edit'), indicatorController.update)
router.post('/:dashboard/indicators/:billingPeriod', permission('stat.dashboard.edit'), indicatorController.update)
router.delete('/:dashboard/indicators/:billingPeriod', permission('stat.dashboard.edit'), indicatorController.destroy)

module.exports = router
