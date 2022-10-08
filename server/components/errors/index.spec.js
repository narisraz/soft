'use strict'

var should = require('should')
var sinon = require('sinon')
var _ = require('lodash')
var errors = require('./index')

describe('components/errors', function () {
  describe('404', function () {
    it('should exist', function () {
      (typeof errors[404]).should.not.equal('undefined')
    })

    it('should set the status to 404', function () {
      var res = {
        status: sinon.spy(),
        json: sinon.spy(),
        render: function (view, options, callback) {
          if (_.isFunction(options))
            callback = options

          if (_.isFunction(callback))
            callback()
        }
      }
      sinon.spy(res, 'render')

      errors[404]({ accepts: function() { return false }}, res)

      res.status.calledWith(404).should.be.true
      res.render.called.should.be.true
    })

    it('should send json if the view render fails', function () {
      var res = {
        status: sinon.spy(),
        json: sinon.spy(),
        render: function (view, options, callback) {
          if (_.isFunction(options))
            callback = options

          if (_.isFunction(callback))
            callback(new Error())
        }
      }
      sinon.spy(res, 'render')

      errors[404]({ accepts: function() { return false }}, res)

      res.status.calledWith(404).should.be.true
      res.render.called.should.be.true
      res.json.called.should.be.true
    })
  })
})
