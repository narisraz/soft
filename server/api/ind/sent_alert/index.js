'use strict'

const express = require('express')
const controller = require('./sent_alert.controller')
const emailController = require('./sent_alert_email.controller')

const router = express.Router()

router.get('/', controller.index)
router.post('/viewed', controller.viewed)

//router.post('/', controller.create)
router.get('/:id', controller.show)
//router.put('/:id', controller.update)
//router.post('/:id', controller.update)
//router.delete('/:id', controller.destroy)

router.get('/:sentAlert/email', emailController.index)
//router.post('/:sentAlert/email', emailController.create)
router.get('/:sentAlert/email/:id', emailController.show)
//router.put('/:sentAlert/email/:id', emailController.update)
//router.post('/:sentAlert/email/:id', emailController.update)
//router.delete('/:sentAlert/email/:id', emailController.destroy)

module.exports = router
