'use strict'

const express = require('express')
const controller = require('./user.controller')
const router = express.Router()
const permission = requireComponent('filters').permission

router.get('/logged', controller.logged)

router.get('/', controller.index)
router.post('/', permission('prm.create_user'), controller.create)
router.get('/:id', controller.show)
router.put('/:id', permission('prm.edit_user'), controller.update)
router.post('/:id', permission('prm.edit_user'), controller.update)
router.delete('/:id', permission('prm.delete_user'), controller.destroy)

module.exports = router
