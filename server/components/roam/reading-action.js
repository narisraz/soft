const logger = require('log4js').getLogger()

async function executeReadingAction(user, action, payload) {
  if (!user.cachedPermissions['roam.actions.reading']) {
    logger.error('User not allowed for action', { user, action, payload })
    return {
      sucess: false,
      statusDescription: 'Not allowed'
    }
  }

  if (!payload || !payload.idReadingBookEntry) {
    logger.error('Invalid action parameters', { action, payload })
    return {
      success: false,
      statusDescription: 'Paramètres invalides'
    }
  } else {
    await action.db.exec('Tour_SetIndex', [
      user.idUser,
      payload.idReadingBookEntry,
      payload.reading,
      true
    ])

    return {
      success: true
    }
  }
}

module.exports = executeReadingAction
