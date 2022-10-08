const orm = requireComponent('orm')
const Contract = orm.getModel('cst.Contract')
const moment = require('moment')
const logger = require('log4js').getLogger()

async function executePaymentAction(user, action, payload) {
  if (!user.cachedPermissions['roam.actions.pay']) {
    logger.error('User not allowed for action', { user, action, payload })
    return {
      sucess: false,
      statusDescription: 'Not allowed'
    }
  }

  if (!payload || !payload.idContract || !payload.account) {
    logger.error('Invalid action parameters', { action, payload })
    return {
      success: false,
      statusDescription: 'Paramètres invalides'
    }
  } else {
    const contract = await Contract.find(payload.idContract)

    let idAccount
    switch (payload.account) {
      case 1:
      default:
        idAccount = contract.idCurrentAccount
        break
      case 2:
        idAccount = contract.idSetupInstallmentAccount
        break
      case 3:
        idAccount = contract.idDebtRefinancingAccount
        break
    }

    if (+payload.value > 0) {
      await action.db.exec('Acct_InsertPayment', [
        user.idUser,
        idAccount,
        +payload.value,
        1,
        moment(payload.date),
        null,
        1
      ])
    }

    const phone = payload.phone && payload.phone.trim()
    if (phone && user.cachedPermissions['roam.actions.pay.phone']) {
      await contract.expand('unit')
      await contract.unit.expand('customer')
      contract.unit.customer.lastModificationDate = new Date()
      contract.unit.customer.lastModificationUser = user.idUser
      contract.unit.customer.phone1 = phone
      await contract.unit.customer.save()
    }

    return {
      success: true
    }
  }
}

module.exports = executePaymentAction
