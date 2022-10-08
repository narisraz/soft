'use strict'

const express = require('express')
const controller = require('./domain.controller')
const permission = requireComponent('filters').permission
const router = express.Router()

router.get('/', controller.index)
router.post('/', permission('prm.domain.create'), controller.create)
router.get('/:id', controller.show)
router.put('/:id', permission('prm.domain.edit'), controller.update)
router.post('/:id', permission('prm.domain.edit'), controller.update)
router.delete('/:id', permission('prm.domain.delete'), controller.destroy)

module.exports = router
