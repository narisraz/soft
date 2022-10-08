'use strict'

const express = require('express')
const controller = require('./file.controller')
const permission = requireComponent('filters').permission
const router = express.Router()

router.get('/:id', controller.redirect)
router.get('/:id/:name', controller.show)

router.post('/', permission('file.upload'), controller.create)

module.exports = router
