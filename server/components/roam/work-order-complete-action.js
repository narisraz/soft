const logger = require('log4js').getLogger()

async function executeWorkOrderCompleteAction(user, action, payload) {
  if (!user.cachedPermissions['roam.actions.workOrder']) {
    logger.error('User not allowed for action', { user, action, payload })
    return {
      sucess: false,
      statusDescription: 'Not allowed'
    }
  }

  if (!payload || !payload.idOrder) {
    logger.error('Invalid action parameters', { action, payload })
    return {
      success: false,
      statusDescription: 'Paramètres invalides'
    }
  } else {
    await action.db.exec('Ordr_CompleteOrder', [
      user.idUser,
      payload.idOrder, // @idOrder int,
      payload.completionDate, // @completionDate datetime,
      payload.plumber, // @plumber nvarchar(100),
      payload.diggers, // @diggers nvarchar(100),
      payload.dimension, // @dimension nvarchar(100),
      payload.workDescription, // @workDescription nvarchar(200),
      payload.material, // @material nvarchar(100),
      payload.observations, // @observations nvarchar(200),
      payload.durationMinutes, // @durationMinutes int,
      true, // @generateClosingBill bit,
      null, // @installedMeterSerial nvarchar(20),
      null, // @indexRemovedMeter decimal(10, 2),
      null, // @indexInstalledMeter decimal(10, 2),
      false // @isDraft bit,
    ])

    return {
      success: true
    }
  }
}

module.exports = executeWorkOrderCompleteAction
