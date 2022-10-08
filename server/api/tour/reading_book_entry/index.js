'use strict'

const express = require('express')
const controller = require('./reading_book_entry.controller')
const router = express.Router()

router.get('/', controller.index)
router.get('/:id', controller.show)
module.exports = router
