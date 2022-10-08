'use strict'

var _ = require('lodash')
var P = require('bluebird')
var errors = require('./errors')

var operationCounter = 0

function convertAttribute(descriptor, value) {
  var res

  if (_.isNull(value)) {
    return value
  }

  switch (descriptor.type) {
  case 'string':
    res = ''+value
    if (descriptor.size) {
      res = res.substr(0, descriptor.size)
    }
    return res
  case 'uuid':
    res = ''+value
    if (!res.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
      return null
    }
    return res
  case 'float':
    return +value || 0
  case 'int':
  case 'model':
  case 'id':
    return ~~value
  case 'bool':
  case 'boolean':
    return !!+value// jshint ignore:line
  case 'date':
    return new Date(value)
  case 'object':
    // Guaranteed never to convert anything
    return value
  default:
    return value
  }
}

var Document = module.exports = function Document(givenAttributes) {
  var that = this

  that._attributes = {}
  that._relationships = {}
  that._dirty = true
  that._new = true

  if (_.isObject(givenAttributes))
    Document.prototype.set.call(this, givenAttributes)
}

Document.createAccessors = function createAccessors(subclass) {
  var model = subclass.prototype.model

  var attributes = _.union(
    _.values(_.keys(model.computedAttributes)),
    _.values(_.keys(model.attributes))
  )

  _.forEach(attributes, function (attribute) {
    if (!(attribute in subclass.prototype)) {
      Object.defineProperty(subclass.prototype, attribute, {
        get: function () { return subclass.prototype.get.call(this, attribute) },
        set: function (newValue) { subclass.prototype.set.call(this, attribute, newValue) },
        enumerable: true
      })
    }
  })
}

Document.prototype._applyHooks = function(returnPromise, hookList) {
  var that = this

  if (hookList) {
    return returnPromise.then(function () {
      return P.all(_.map(hookList, function (hook) {
        return hook.apply(that)
      }))
    })
  }

  return returnPromise
}

Document.prototype.getId = function getId() {
  return this._attributes[this.model.primary()]
}

Document.prototype.isNew = function isNew() {
  return this._new
}

Document.prototype.getAttribute = function getAttribute(attribute) {
  var descriptor = this.model.attributes[attribute]

  if (_.isUndefined(descriptor)) {
    return undefined
  }

  if (_.isFunction(descriptor.get)) {
    return descriptor.get.call(this)
  } else if (!_.isUndefined(descriptor.type)) {
    return this._attributes[attribute]
  }
  return undefined
}

Document.prototype.relationship = function relationship(relationship) {
  if (_.isUndefined(this._relationships[relationship])) {
    if (this.model.relationships[relationship]) {
      this._relationships[relationship] = this.model.relationships[relationship].getRelationship(this)
    }
  }

  return this._relationships[relationship]
}

Document.prototype.get = function get(attribute) {
  var descriptor = this.model.attributes[attribute]

  if (_.isUndefined(descriptor)) {
    return undefined
  }

  if (!_.isUndefined(descriptor.model)) {
    var res = this.relationship(attribute) && this.relationship(attribute).get()
    return _.isUndefined(res) ? this.getAttribute(attribute) : res
  } else {
    return this.getAttribute(attribute)
  }

  return undefined
}

Document.prototype.setAttribute = function setAttribute(attribute, value) {
  var descriptor = this.model.attributes[attribute]
  if (!_.isUndefined(descriptor)) {
    this._attributes[attribute] = convertAttribute(descriptor, value)
  }
  return this
}

Document.prototype.set = function set(key, val) {
  var givenAttributes
  var singleAttribution = false
  var that = this

  this._dirty = true

  if (_.isUndefined(val) && _.isObject(key)) {
    givenAttributes = key
  } else {
    givenAttributes = {}
    givenAttributes[key] = val
    singleAttribution = true
  }

  _.forOwn(givenAttributes, function (value, attribute) {
    var descriptor = that.model.attributes[attribute]

    if (!_.isUndefined(descriptor)) {
      const isProtected = descriptor.protected ||
        descriptor.type === 'id' ||
        !_.isUndefined(descriptor.model)

      if (_.isFunction(descriptor.set)) {
        descriptor.set.call(that, value)
      } else if (
        (
          !_.isUndefined(descriptor.type) ||
          !_.isUndefined(descriptor.model)
        ) &&
        !_.isUndefined(value) && (singleAttribution || !isProtected)
      ) {

        // When directly setting a key that is the localKey of a relationship:
        // remove said relationship from the relationship cache
        _.forOwn(that._relationships, function (relationship) {
          if (relationship.model.localKey === attribute)
            relationship.clearCache()
        })

        if (!_.isUndefined(descriptor.model)) {
          that.relationship(attribute).set(value)
        } else {
          that.setAttribute(attribute, value)
        }
      }
    }
  })

  return this
}

/**
 * Imports a document from the raw column data
 * Returns either this, or a promise if there are hooks on the model
 */
Document.prototype.import = function import_(columns, isNew, isDirty) {
  var that = this
  that._attributes = {}
  that._relationships = {}
  that._dirty = isDirty || false
  that._new = isNew || false

  _.forOwn(that.model.attributes, function (descriptor, attribute) {
    var value = columns[attribute]
    if (!_.isUndefined(descriptor.type) && !_.isUndefined(value)) {
      that._attributes[attribute] = convertAttribute(descriptor, value)
    }
  })

  if (that.model.hooks.afterLoad) {
    return that._applyHooks(P.resolve(), that.model.hooks.afterLoad).return(that)
  }

  return that
}

Document.prototype.refresh = function refresh() {
  var that = this
  if (_.isUndefined(that.getId()))
    return P.resolve(that)

  return that.model.where(that.model.primary(), '=', that.getId())
    .getRaw()
    .then(function (results) {
      if (results.length) {
        that.import(results[0], false, false)
      }
      return that
    })
}

Document.prototype.rawSave = function rawSave() {
  var res
  var that = this
  var newDocument = that._new
  var dirty = that._dirty

  if (dirty) {
    var query = new that.model.Query()

    // Filter the attributes: the incrementally generated id columns, and the ones marked
    // as "computed" are not to be saved.
    var columns = _.pickBy(that._attributes, function (value, attribute) {
      return !_.isUndefined(that.model.attributes[attribute].type) &&
        that.model.attributes[attribute].type !== 'id' &&
        !that.model.attributes[attribute].computed
    })

    if (newDocument) {
      // Remove the defaulted attributes on insert
      columns = _.pickBy(columns, function (value, attribute) {
        return !that.model.attributes[attribute].defaulted
      })

      res = query
        ._insert(columns)
        .then(function (values) {
          if (!values.length) {
            throw new errors.NotFound()
          }
          return that.import(values[0])
        })
    } else {
      res = query
        .where(that.model.primary(), that.getId())
        ._update(columns)
        .then(function (values) {
          if (!values.length) {
            throw new errors.NotFound()
          }
          return that.import(values[0])
        })
    }

  } else {
    res = P.resolve(that)
  }

  return res
}

Document.prototype._guardedSave = function _guardedSave() {
  var that = this

  if (that._currentOperation === operationCounter)
    return
  that._currentOperation = operationCounter

  var savePromise
  var returnPromise = P.resolve()
  var newDocument = that._new

  returnPromise = this._applyHooks(returnPromise, this.model.hooks.beforeSave)

  if (newDocument) {
    returnPromise = this._applyHooks(returnPromise, this.model.hooks.beforeInsert)
  } else {
    returnPromise = this._applyHooks(returnPromise, this.model.hooks.beforeUpdate)
  }

  returnPromise = returnPromise.then(function () {
    return P.all(_.values(that._relationships).map(function(relationship) {
      return relationship.beforeSave()
    }))
  })

  returnPromise = returnPromise.then(function () {
    savePromise = that.rawSave()
    return savePromise
  })

  // Save relationships, as they are reset in the object, after save
  var relationships = that._relationships
  returnPromise = returnPromise.then(function () {
    return P.all(_.values(relationships).map(function(relationship) {
      return relationship.afterSave()
    }))
  })

  if (newDocument) {
    returnPromise = this._applyHooks(returnPromise, this.model.hooks.afterInsert)
  } else {
    returnPromise = this._applyHooks(returnPromise, this.model.hooks.afterUpdate)
  }

  returnPromise = this._applyHooks(returnPromise, this.model.hooks.afterSave)

  returnPromise = returnPromise.then(function () {
    return that
  })

  return returnPromise
}

Document.prototype.save = function save() {
  operationCounter++
  return this._guardedSave()
}

Document.prototype._guardedDelete = function _guardedDelete() {
  var that = this

  if (that._currentOperation === operationCounter)
    return P.resolve(that)
  that._currentOperation = operationCounter

  var returnPromise = P.resolve()

  if (!_.isUndefined(this.getId())) {
    returnPromise = this._applyHooks(returnPromise, this.model.hooks.beforeDelete)

    returnPromise = returnPromise.then(function () {
      return P.all(_.keys(that.model.relationships).map(function (relationship) {
        return that.relationship(relationship).beforeDelete()
      }))
    })

    returnPromise = returnPromise.then(function () {
      return (new that.model.Query())
        .where(that.model.primary(), that.getId())
        ._delete()
        .then(function (values) {
          if (!values.length) {
            throw new errors.NotFound()
          }
          return that.import(values[0])
        })
    })

    returnPromise = this._applyHooks(returnPromise, this.model.hooks.afterDelete)
  }

  returnPromise = returnPromise.then(function () {
    return that
  })

  return returnPromise
}

Document.prototype.delete = function delete_() {
  operationCounter++
  return this._guardedDelete()
}

/**
 * Expands this documents relationships. Returns a promise
 */
Document.prototype.expand = function expand(expands, queryFilter) {
  var that = this
  var promises = []

  if (!_.isArray(expands)) {
    expands = [expands]
  }

  _.forOwn(expands, function (toExpand) {
    var attributes, expandQueryFilter

    if (_.isString(toExpand)) {
      attributes = [toExpand]
      expandQueryFilter = queryFilter
    }
    if (_.isObject(toExpand)) {
      attributes = _.isArray(toExpand.expands) ? toExpand.expands : [toExpand.expands ]
      expandQueryFilter = toExpand.queryFilter || queryFilter
    }

    _.forOwn(attributes, function (attribute) {
      promises.push(that.relationship(attribute).expand(expandQueryFilter))
    })
  })

  return P.all(promises).then(function () { return that })
}

/**
 * Converts the document to a plain Javascript object
 *
 * @param {string} view - undefined to include all attributes except those
 * marked as hidden.
 * If set to a string other than '*': use the corresponding "view" from the
 * model, representing a list of attributes to include.
 * If set to '*', include all attributes, including hidden ones.
 *
 */
Document.prototype.toArray = function toArray(view) {
  var res = {}
  var attributes
  var that = this

  if (_.isUndefined(view)) {
    attributes = _.filter(_.keys(this.model.attributes), function (key) {
      return !that.model.attributes[key].hidden
    })
  } else if (view === '*') {
    attributes = that.model.attributes
  } else {
    attributes = this.model.views[view]
  }
  _.forEach(attributes, function (attribute) {
    var attributeValue = that.get(attribute)

    if (!_.isUndefined(attributeValue)) {
      if (attributeValue === null) {
        res[attribute] = null
      } else {
        res[attribute] = _.isFunction(attributeValue.toArray) ?
          attributeValue.toArray() :
          attributeValue
      }
    }
  })

  return res
}
