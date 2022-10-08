'use strict'

const express = require('express')
const periodController = require('./period.controller')
const predictionController = require('./prediction.controller')
const recurringPredictionController = require('./recurring_prediction.controller')

const router = express.Router()

router.get('/', periodController.index)
router.get('/:id', periodController.show)
router.post('/:id/close', periodController.close)
router.post('/:id/reopen', periodController.reopen)

router.get('/:period/predictions', predictionController.index)
router.get('/:period/predictions/:id', predictionController.show)
router.post('/:period/predictions', predictionController.create)
router.put('/:period/predictions/:id', predictionController.update)
router.post('/:period/predictions/:id', predictionController.update)
router.delete('/:period/predictions/:id', predictionController.destroy)

router.get('/:period/recurring_predictions', recurringPredictionController.index)
router.get('/:period/recurring_predictions/:date', recurringPredictionController.index)

module.exports = router
