'use strict'

const should = require('should')
const sinon = require('sinon')
const P = require('bluebird')
const co = P.coroutine
const stream = require('stream')
const streamTextReader = require('./stream-text-reader')
const streamChunker = require('./stream-chunker')

describe('components/storage/stream-chunker', () => {
  before(() => {
  })

  it('should work with a single, large buffer', () => {
    let strm = stream.Readable({ read: () => {
      const b = new Buffer(1000)
      b.fill('A')
      strm.push(b)
      strm.push(null)
    }})

    return co(function*() {
      const chunker = streamChunker(strm, 100)
      let counter = 0

      for (let substrmP of chunker) {
        let substrm = yield substrmP
        let streamContents = yield streamTextReader(substrm)
        streamContents.length.should.equal(100)
        ++counter
      }
      counter.should.equal(10)
    })()
  })

  it('should work with buffer pushes of varying sizes', () => {
    const sizes = [300, 600, 100]
    let strm

    let push = () => {
      if (!sizes.length)
        return
      const b = new Buffer(sizes.shift())
      b.fill('A')
      strm.push(b)
      if (sizes.length) {
        setTimeout(push, 2)
      } else {
        strm.push(null)
      }
    }

    strm = stream.Readable({ read: () => {
      setTimeout(push, 2)
    }})

    return co(function*() {
      const chunker = streamChunker(strm, 250)
      let counter = 0

      for (let substrmP of chunker) {
        let substrm = yield substrmP
        let streamContents = yield streamTextReader(substrm)
        streamContents.length.should.equal(250)
        ++counter
      }
      counter.should.equal(4)
    })()
  })
})
