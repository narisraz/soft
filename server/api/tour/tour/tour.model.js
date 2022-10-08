'use strict'

const Model = requireComponent('orm').Model

module.exports = new Model(
  {
    name: 'tour.Tour',
    table: 'Tour_Tour',
    attributes: {
      idTour: 'id',
      code: 'string',
      isInitiallyBillable: 'boolean',
      creationPeriod: 'int',
      deletionPeriod: 'int',

      users: {
        model: 'prm.User',
        relationship: 'BelongsToMany',
        joinTable: 'Tour_Tour_User',
        joinLocalKey: 'idTour',
        localKey: 'idTour',
        remoteKey: 'uuid',
        joinRemoteKey: 'idUser',
      },
    }
  }
)
