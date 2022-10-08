const logger = require('log4js').getLogger()
const executeReadingAction = require('./reading-action')
const executePaymentAction = require('./payment-action')
const executeWorkOrderCompleteAction = require('./work-order-complete-action')

const READING = 1
const COORDINATES = 2
const ANOMALY = 3
const PAYMENT = 4
const WORK_ORDER_COMPLETE = 5

async function executeAction(user, action) {
  try {
    const payload = JSON.parse(action.payload)
    switch (action.idActionType) {
      case READING:
        return await executeReadingAction(user, action, payload)
      case COORDINATES:
        break
      case ANOMALY:
        break
      case PAYMENT:
        return await executePaymentAction(user, action, payload)
      case WORK_ORDER_COMPLETE:
        return await executeWorkOrderCompleteAction(user, action, payload)
    }
  } catch (e) {
    logger.error(`Error executing action ${action && action.idAction}`, e)
    return {
      success: false,
      statusDescription: e.message
    }
  }
}

async function executeActions(user, actions) {
  logger.info(`Executing ${actions.length} actions`)
  for (const action of actions) {
    const { success, statusDescription } = await executeAction(user, action)
    action.executedDate = new Date()
    action.success = success
    action.statusDescription = statusDescription
    await action.save()
  }
}

exports.executeActions = executeActions
