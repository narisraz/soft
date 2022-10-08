'use strict'

const should = require('should')
const mockery = require('mockery')
const sinon = require('sinon')
const P = require('bluebird')
const co = P.coroutine

describe('components/sync/client', () => {
  before(() => {
    mockery.enable({ useCleanCache: true })
    mockery.registerAllowable('lodash')
    mockery.registerAllowable('bluebird')
    mockery.warnOnUnregistered(false)

    global.requireComponent = (component) => {
      switch (component) {
      case 'db-config':
        return { idServer: 'AAAAAA-AAAA-AAAA-AAAAAAAA' }
      case 'storage':
        return {}
      default:
        return require(__dirname + '/components/' + component)
      }
    }
  })

  describe('doSync method', () => {
    it('should call the post method', () => {
      const Util = {
        syncables: [ 'prm.Server' ],
        getSyncableValues: function* () {
          return []
        },
        setSyncableValues: function* () {
          yield P.resolve(1)
          return null
        },
        getMissingChunks: function* () {
          return []
        },
        flagCompletedFiles: function* () {
        },
        processDeletion: function* () {
        },
      }

      mockery.registerMock('./util', Util)

      const rp = {
        post: (url, options) => {
          if (url.match(/\/testurl\/pull$/)) {
            return P.resolve({
              data: {

              }
            })
          } else if (url.match(/\/testurl\/last$/)) {
            return P.resolve({
              date: new Date()
            })
          } else if (url.match(/\/testurl\/push$/)) {
            return P.resolve({
              ok: true
            })
          } else if (url.match(/\/testurl\/chunks\/missing$/)) {
            return P.resolve({
              chunks: []
            })
          }

          return P.resolve([])
        }
      }

      sinon.spy(rp, 'post')

      mockery.registerMock('request-promise', rp)

      const Client = require('./client')
      const client = new Client()

      return co(client.doSync.bind(client))({
        pushUrl: 'http://testurl',
        psk: 'test',
        lastSync: null,
        save: () => P.resolve([]),
        rawSave: () => P.resolve([]),
      }).then(() => {
        rp.post.called.should.be.true
      })
    })
  })
})
