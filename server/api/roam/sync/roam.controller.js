const _ = require('lodash')

const Rest = requireComponent('rest')
const orm = requireComponent('orm')

const Tour = orm.getModel('tour.Tour')
const ReadingBook = orm.getModel('tour.ReadingBook')
const ReadingBookEntry = orm.getModel('tour.ReadingBookEntry')
const ReadingBookTableView = orm.getModel('tour.ReadingBookTableView')
const Customer = orm.getModel('cst.Customer')
const Unit = orm.getModel('cst.Unit')
const Contract = orm.getModel('cst.Contract')
const ContractTableView = orm.getModel('cst.ContractTableView')
const GlobalSettings = orm.getModel('core.GlobalSettings')
const Order = orm.getModel('ordr.Order')
const OrderType = orm.getModel('ordr.Type')
const OrderStatus = orm.getModel('ordr.Status')
const OrderReason = orm.getModel('ordr.Reason')
const Col = orm.Col

class SyncController {
  _getRelevantTours(req) {
    return q =>
      q.whereRelationship('users', Col('uuid', 'Prm_User'), req.user.uuid)
  }

  _getRelevantReadingBooks(req) {
    return q =>
      q
        .where('isLocked', true)
        .whereNotNull('readingDate')
        .whereNotNull('billingDate')
        .where('isClosed', false)
        .whereRelationship('tour', this._getRelevantTours(req))
  }

  _getRelevantReadingbookEntries(req) {
    return q =>
      q.whereRelationship('readingBook', this._getRelevantReadingBooks(req))
  }

  async sync(req, res, next) {
    try {
      const tour = (await this._getRelevantTours(req)(Tour).get()).toArray()
      const readingBook = (await this._getRelevantReadingBooks(req)(
        ReadingBook
      ).get()).toArray()
      const readingBookEntry = (await this._getRelevantReadingbookEntries(req)(
        ReadingBookEntry
      ).get()).toArray()
      const readingBookTableView = (await this._getRelevantReadingbookEntries(
        req
      )(ReadingBookTableView).get()).toArray()
      const customer = (await Customer.get()).toArray()
      const unit = (await Unit.get()).toArray()
      const contract = (await Contract.get()).toArray()
      const order = (await Order.where('status', 1).get()).toArray()
      const orderType = (await OrderType.get()).toArray()
      const orderStatus = (await OrderStatus.get()).toArray()
      const orderReason = (await OrderReason.get()).toArray()

      const contractTableView = (await ContractTableView.get()).toArray()
      const globalSettings = (await GlobalSettings.first()).toArray()

      res.json({
        globalSettings: _.pick(globalSettings, [
          'currencySymbol',
          'currencyDescription',
          'operator',
          'header',
          'address',
          'phone'
        ]),
        tour,
        readingBook,
        readingBookEntry,
        readingBookTableView,
        customer,
        unit,
        contract,
        contractTableView,
        order,
        orderType,
        orderStatus,
        orderReason
      })
    } catch (e) {
      next(e)
    }
  }
}

module.exports = Rest.routes(new SyncController())
