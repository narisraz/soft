'use strict'

const P = require('bluebird')
const co = P.coroutine
const _ = require('lodash')
const stream = require('stream')
const streamChunker = require('./stream-chunker')
const streamTextReader = require('./stream-text-reader')
const StreamConcat = require('./stream-concat')

class Storage {
  constructor(config) {
    config = config || {}
    if (_.isObject(config.driver)) {
      this.driver = config.driver
    } else {
      let driver = config.driver || 'filesystem'
      const Driver = require('./drivers/' + driver)
      this.driver = new Driver(config[driver])
    }
    this.chunkSize = config.chunkSize || 64 * 1024
  }

  /**
   * Returns whether the file corresponding to a given hash is complete (and
   * can therefore be retrieved using getFile() or not.)
   *
   * @return {boolean}
   */
  *isComplete(hash) {
    const missingChunks = yield* this.getMissingChunks(hash)
    return !missingChunks.length
  }

  /**
   * Returns a strm to the file identified by the given hash, or null if the
   * file does not exist or is not complete.
   */
  *getFile(hash) {
    const contentChunks = yield* this.getContentChunks(hash)
    if (!contentChunks)
      return null
    for (let chunk of contentChunks) {
      let hasChunk = yield* this.driver.hasChunk(chunk)
      if (!hasChunk)
        return null
    }
    const chunkIterator = contentChunks[Symbol.iterator]()
    const that = this
    const combinedstrm = new StreamConcat(() => {
      const hash = chunkIterator.next()
      if (!hash.done) {
        return co(function*() {
          return yield* that.driver.getChunk(hash.value)
        })()
      } else {
        return null
      }
    })

    return combinedstrm
  }

  /**
   * Imports the file, and returns a hash to it
   *
   * @return {string} The hash to the file
   */
  *setFile(strm, options) {
    options = options || {}
    const chunker = streamChunker(strm, this.chunkSize)
    const hashes = []
    for (let substrmP of chunker) {
      let substrm = yield substrmP
      let hash = yield* this.driver.setChunk(substrm)
      hashes.push(hash)
    }
    options.content = options.content || {}
    options.content.chunks = hashes
    const optionsString = JSON.stringify(options)
    const optionsStream = new stream.Readable({ read: () => {} })
    optionsStream.push(optionsString)
    optionsStream.push(null)
    let mainHash = yield* this.driver.setChunk(optionsStream)
    return mainHash
  }

  /**
   * Returns the contents of the "file descriptor" file associated with the
   * given hash.
   */
  *getFileDescriptor(hash) {
    const mainChunk = yield* this.driver.getChunk(hash)
    if (!mainChunk)
      return null
    const mainChunkContents = yield streamTextReader(mainChunk)
    try {
      return JSON.parse(mainChunkContents)
    } catch (e) {
      return null
    }
  }

  /**
   * Returns a list of content chunks corresponding to the file descriptor
   * identified by the given hash.
   */
  *getContentChunks(hash) {
    const fileDescriptor = yield* this.getFileDescriptor(hash)

    if (!fileDescriptor || !fileDescriptor.content || !_.isArray(fileDescriptor.content.chunks))
      return null
    return fileDescriptor.content.chunks
  }

  /**
   * Returns an array of the hashes of the missing chunks needed to acquire
   * this file.
   */
  *getMissingChunks(hash) {
    const contentChunks = yield* this.getContentChunks(hash)
    if (!contentChunks) {
      return [hash]
    }

    let res = []
    for (let chunk of contentChunks) {
      let hasChunk = yield* this.driver.hasChunk(chunk)
      if (!hasChunk) {
        res.push(chunk)
      }
    }
    return res
  }

  /**
   * Returns whether a given chunk exists
   */
  *hasChunk(hash) {
    return yield* this.driver.hasChunk(hash)
  }

  /**
   * Returns a stream for a given chunk. Returns null if the chunk does not exist
   */
  *getChunk(hash) {
    return yield* this.driver.getChunk(hash)
  }

  /**
   * Sets the contents of a chunk, from a stream.
   *
   * Return the hash of the stream
   */
  *setChunk(strm) {
    return yield* this.driver.setChunk(strm)
  }
}

module.exports = Storage
