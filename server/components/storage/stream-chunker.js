'use strict'

const stream = require('stream')
const P = require('bluebird')

function streamChunkerBase(strm, size, readableCallback) {
  let chunks = []
  let isEnd = false
  let currentReadable = null
  let currentReadableTotal = 0
  let canPush = true

  function pushEnd() {
    if (!chunks.length && isEnd) {
      currentReadable.push(null)
      readableCallback(null, null, true)
    }
  }

  function pushChunk() {
    let chunk = chunks[0]
    let toPush
    if (currentReadableTotal === 0) {
      newReadable()
    }

    if (currentReadableTotal + chunk.length > size) {
      toPush = chunk.slice(0, size - currentReadableTotal)
      chunks[0] = chunk.slice(size - currentReadableTotal)
    } else {
      toPush = chunk
      chunks.shift()
    }

    currentReadableTotal += toPush.length
    canPush = currentReadable.push(toPush)

    if (currentReadableTotal >= size) {
      currentReadableTotal = 0
    }
  }

  function pushData() {
    while (chunks.length && canPush) {
      pushChunk()
    }

    pushEnd()

    if (!canPush) {
      strm.pause()
    } else {
      strm.resume()
    }
  }

  function newReadable() {
    if (currentReadable) {
      currentReadable.push(null)
    }
    currentReadableTotal = 0
    currentReadable = stream.Readable({
      read(size) {
        canPush = true
        strm.resume()
        pushData()
      }
    })
    readableCallback(null, currentReadable, false)
  }

  strm.on('data', chunk => {
    chunks.push(chunk)
    pushData()
  })

  strm.on('error', err => readableCallback(err))
  strm.on('end', () => { isEnd = true; pushEnd() })
}

function streamChunker(strm, size) {
  let resolved = []
  let deferred = []
  let error = null
  let isDone = false

  streamChunkerBase(strm, size, (err, currentReadable, done) => {
    if (err) {
      error = err
      return
    }
    if (currentReadable) {
      if (deferred.length) {
        var promise = deferred.shift()
        promise.resolve(currentReadable)
      } else {
        resolved.push(currentReadable)
      }
    }
    if (done) {
      isDone = true
    }
  })

  return {
    [Symbol.iterator]: () => {
      return {
        next() {
          let value
          if (resolved.length) {
            value = P.resolve(resolved.shift())
          } else {
            if (error) {
              return {
                value: P.reject(error),
                done: true
              }
            }
            if (isDone) {
              return {
                done: true
              }
            }
            value = new P((resolve, reject) => deferred.push({resolve, reject}))
          }

          return {
            value: value,
            done: false
          }
        }
      }
    }
  }
}

module.exports = streamChunker
