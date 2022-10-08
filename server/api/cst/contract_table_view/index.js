'use strict'

const express = require('express')
const controller = require('./contract_table_view.controller')
const permission = requireComponent('filters').permission
const router = express.Router()

router.get('/', controller.index)
router.get('/:id', controller.show)

module.exports = router
