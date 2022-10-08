'use strict'

const express = require('express')
const permission = requireComponent('filters').permission
const app = express()
const router = express.Router()
const userController = require('./prm/user/user.controller')
const passport = require('passport')
const cors = require('cors')

/*
 * Enable CORS for all routes
 */
app.all('*', cors())

/*
 * Login and logout all unprotected
 */
router.get('/login', userController.login)
router.post('/login', userController.login)
router.post('/logout', userController.logout)

router.post(
  '/token',
  passport.authenticate(['jwt', 'local', 'session']),
  permission('roam'),
  userController.getJwtToken
)
app.use(router)

/*
 * The routes below require authentication
 */
app.use(passport.authenticate(['jwt', 'session']))

/*
 * The roam interface has its own set of permissions
 */
app.use('/roam', require('./roam'))

/*
 * All other toutes require at least a valid user, which is allowed to login
 * on the web app.
 */
app.use(permission('prm.web.login'))
app.use('/cst', require('./cst'))
app.use('/file', require('./file'))
app.use('/ind', require('./ind'))
app.use('/mtr', require('./mtr'))
app.use('/prm', require('./prm'))
app.use('/stat', require('./stat'))
app.use('/sync', require('./sync'))
app.use('/tour', require('./tour'))

module.exports = app
