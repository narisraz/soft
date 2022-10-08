'use strict'

var util = require('util')
var _ = require('lodash')
var ModelQuery = require('./model_query')
var Document = require('./document')
var relationships = require('./relationships')
var errors = require('./errors')
var modelRegistry = {}
var P = require('bluebird')

/**
Indicator = new Model({
  name: 'blah'
  table: 'Ind_Indicators',
  attributes: {
    id: 'id',
    name: { type: 'string', size: 100 },
    code: { type: 'string', size: 50, defaulted: true },
    unit: { type: 'string', size: 30, computed: true },
    type: {
      model: 'IndicatorType',
      relationship: 'belongsTo',
      localKey: 'type'
    },
    values: {
      model: 'IndicatorValue',
      relationship: 'hasMany',
      remoteKey: 'idIndicator'
    },
    password: { type: 'string', hidden: true },
    decimals: 'int',
    limitMin: 'float',
    limitMax: 'float',
    alertMin: 'float',
    alertMax: 'float',
    baseline: 'int',
    blah: function () {

    },
    blah2: {
      get: function () {

      },
      set: function () {

      }
    }
  },
  hooks: {
    beforeSave: function() {},
    afterSave: function() {},

    beforeInsert: function() {},
    insteadOfInsert: function() {},
    afterInsert: function() {},

    beforeUpdate: function() {},
    insteadOfUpdate: function() {},
    afterUpdate: function() {},

    beforeDelete: function() {},
    insteadOfDelete: function() {},
    afterDelete: function() {},

    afterLoad: function() {}
  },
  scopes: {

  },
  views: {
    view2: []
  },
  mixins: {

  },
  document: {

  }
});

*/
var Model = module.exports = function Model(modelProperties, documentProperties) {
  var that = this
  _.merge(this, {
    hooks: {
      beforeSave: [],
      afterSave: [],
      beforeInsert: [],
      insteadOfInsert: [],
      afterInsert: [],
      beforeUpdate: [],
      insteadOfUpdate: [],
      afterUpdate: [],
      beforeDelete: [],
      insteadOfDelete: [],
      afterDelete: [],
      afterLoad: [],
    }
  }, modelProperties)

  _.forOwn(this.hooks, function (value, key) {
    if (!_.isArray(value)) {
      that.hooks[key] = [ value ]
    }
  })

  if (this.mixins) {
    _.forEach(this.mixins, function (mixin) {
      _.forOwn(mixin.hooks, function (value, key) {
        if (!_.isArray(value)) {
          mixin.hooks[key] = [ value ]
        }
      })

      _.mergeWith(that, mixin, function customizer(objValue, srcValue) {
        if (_.isArray(objValue)) {
          return objValue.concat(srcValue)
        }
      })
    })
  }

  this.relationships = {}

  this.attributes = _.mapValues(this.attributes || {}, function (descriptor, name) {
    var res
    if (_.isString(descriptor)) {
      res = {
        type: descriptor
      }
    } else if (_.isFunction(descriptor)) {
      res = {
        get: descriptor
      }
    } else if (!_.isUndefined(descriptor.model)) {
      var relationshipType = descriptor.relationship || 'BelongsTo'
      that.relationships[name] = new relationships[relationshipType](that, descriptor, name)

      res = descriptor
    } else {
      res = descriptor
    }
    var validators = descriptor.validator || descriptor.validators
    if (validators) {
      if (!_.isArray(validators))
        validators = [validators]
      res.validators = validators
    } else {
      res.validators = []
    }

    return res
  })

  this.table = this.table || this.name
  this.actions = this.actions || {}
  this.scopes = this.scopes || {}
  this.views = this.views || {}
  this.hooks = this.hooks || {}

  this.primaryKey = this.primaryKey || _.findKey(this.attributes, function (value) {
    return value.type === 'id'
  })

  this.Document = function ModelDocument() {
    Document.apply(this, arguments)
  }
  util.inherits(this.Document, Document)
  this.Document.prototype.model = this
  this.Document.prototype.Model = Model
  _.merge(this.Document.prototype, documentProperties || {})
  _.merge(this.Document.prototype, this.document || {})
  Document.createAccessors(this.Document)

  this.Query = function Query() {
    ModelQuery.apply(this, arguments)
  }
  util.inherits(this.Query, ModelQuery)
  this.Query.prototype.model = this

  if (this.name) {
    modelRegistry[this.name] = this
  }
}

Model.getModel = function getModel(name) {
  if (modelRegistry[name])
    return modelRegistry[name]
  throw new errors.InvalidModel(name)
}

/**
 * Convenience alias for the static function Model.getModel
 */
Model.prototype.getModel = Model.getModel

Model.prototype.primary = function primary() {
  return this.primaryKey
}

/**
 * Create a new instance of the model
 */
Model.prototype.create = function create(attributes) {
  return new this.Document(attributes)
}

function pushMessage(messages, key, value) {
  if (messages) {
    if (!messages[key]) {
      messages[key] = []
    }

    messages[key].push(value)
  }
}


/**
 * Validates a single value for a single attribute
 *
 * @param {string} attributeName
 * @param {*} value
 * @param {Object} [messages] - An optional object into which the validation messages will be inserted
 * @param {Object} [allAttributes] - An optional array containing all attributes to validate
 *
 * @return {Promise} A promise which resolevs to a boolean, indicating the
 *    validation result
 */
Model.prototype.validateAttribute = function validateAttribute(
  attributeName, value, messages, document, allAttributes, user
) {
  var that = this
  var attribute = this.attributes[attributeName]
  if (!attribute.validators)
    return true
  return P.all(
    attribute.validators.map(function (validator) {
      return P.resolve(validator.call(that, value, document, allAttributes, user))
        .then(function (validationResult) {
          if (validationResult === true)
            return true
          pushMessage(messages, attributeName, validationResult || false)
          return false
        })
    })
  ).then(function (results) {
    return results.reduce(function (a, b) {return a && b}, true)
  })
}

/**
 * Validates a whole array of data against all attribute validators
 *
 * @param {object} data The data to validate
 * @param {Object} [messages] - An optional object into which the validation messages will be inserted
 * @param {Document} [document]
 */
Model.prototype.validateAttributes = function validateAttributes(data, messages, document, user) {
  var that = this
  if (!data)
    return P.resolve(true)
  return P.all(_(this.attributes).mapValues(function (attribute, attributeName) {
    return that.validateAttribute(
      attributeName, data[attributeName], messages, document, data, user
    ) || false
  }).values().value()).then(function (results) {
    return results.reduce(function (a, b) {return a && b}, true)
  })
}

Model.prototype.validateModel = function validateModel(data, messages, document, user) {
  var that = this
  if (!that.validators)
    return P.resolve(true)
  return P.all(that.validators.map(function (validator) {
    return P.resolve(validator.call(that, data, document, user))
      .then(function (validationResult) {
        if (validationResult === true) return true
        pushMessage(messages, '', validationResult || false)
        return false
      })
  })).then(function (results) {
    return results.reduce(function (a, b) {return a && b}, true)
  })
}

Model.prototype.validate = function validate(data, messages, document, user) {
  return P.all([
    this.validateModel(data, messages, document, user),
    this.validateAttributes(data, messages, document, user)
  ]).then(function (res) {
    return res[0] && res[1]
  })
}

/*
 * Make all the methods in Query be usable in Model
 */
_.functionsIn(ModelQuery.prototype).forEach(function (val) {
  if (val[0] === '_')
    return
  if (Model.prototype[val])
    return
  Model.prototype[val] = function () {
    var res = (new this.Query())
    return ModelQuery.prototype[val].apply(res, arguments)
  }
})
