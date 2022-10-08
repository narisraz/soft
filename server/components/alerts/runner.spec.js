'use strict'

const should = require('should')
const mockery = require('mockery')
const sinon = require('sinon')
const P = require('bluebird')
const moment = require('moment')

describe('components/alerts/runner', () => {
  before(() => {
    mockery.enable({ useCleanCache: true })
    mockery.registerAllowable('lodash')
    mockery.registerAllowable('bluebird')
    mockery.warnOnUnregistered(false)
  })

  describe('getNthXday method', () => {
    let runner

    before(() => {
      const Runner = require('./runner')
      runner = new Runner()
    })

    it('should correctly parse: second friday of January 2016', () => {
      runner.getNthXday(2016, 0, 5, 2).toString().should.equal(moment([2016, 0, 8]).toDate().toString())
    })
    it('should correctly parse: second thursday of January 2016', () => {
      runner.getNthXday(2016, 0, 4, 2).toString().should.equal(moment([2016, 0, 14]).toDate().toString())
    })
    it('should correctly parse: fifth monday of February 2016', () => {
      runner.getNthXday(2016, 1, 1, 5).toString().should.equal(moment([2016, 1, 29]).toDate().toString())
    })
    it('should correctly parse: last friday of February 2016', () => {
      runner.getNthXday(2016, 1, 5, -1).toString().should.equal(moment([2016, 1, 26]).toDate().toString())
    })
    it('should correctly parse: last monday of February 2016', () => {
      runner.getNthXday(2016, 1, 1, -1).toString().should.equal(moment([2016, 1, 29]).toDate().toString())
    })
  })
})
