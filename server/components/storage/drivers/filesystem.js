'use strict'

const P = require('bluebird')
const mkdirp = P.promisify(require('mkdirp'))
const path = require('path')
const fs = P.promisifyAll(require('fs'))
const crypto = P.promisifyAll(require('crypto'))

class Filesystem {
  constructor(config) {
    config = config || {}
    if (!config.path)
      throw new Error('Must specify storage path when using a filesystem-based storage!')
    this.path = config.path
  }

  isValidHash(hash) {
    return hash.match(/^[a-f0-9]{128}$/)
  }

  getChunkPath(hash) {
    if (!this.isValidHash(hash))
      return null
    return this.path + hash.replace(/^(..)(..)(.*)$/, '/$1/$2/$3')
  }

  /**
   * Returns whether a given chunk exists
   */
  *hasChunk(hash) {
    const chunkPath = this.getChunkPath(hash)
    yield mkdirp(path.dirname(chunkPath))
    let fileStats
    try {
      fileStats = yield fs.statAsync(chunkPath)
    } catch (e) {
      return null
    }

    return fileStats.isFile()
  }

  /**
   * Returns a stream for a given chunk. Returns null if the chunk does not exist
   */
  *getChunk(hash) {
    const chunkPath = this.getChunkPath(hash)
    let fileStats
    try {
      fileStats = yield fs.statAsync(chunkPath)
    } catch (e) {
      return null
    }
    if (!fileStats.isFile())
      return null
    return fs.createReadStream(chunkPath)
  }

  /**
   * Sets the contents of a chunk, from a stream.
   */
  *setChunk(stream) {
    stream.pause()
    const tempPath = this.path + '/tmp'
    yield mkdirp(tempPath)
    const randomBytes = yield crypto.randomBytesAsync(32)
    const hashStream = crypto.createHash('sha512')
    const tempName = tempPath + '/' + randomBytes.toString('hex')
    const writeStream = fs.createWriteStream(tempName)

    stream.on('data', d => hashStream.write(d))
    stream.on('end', () => hashStream.end())

    //stream.pipe(hashStream)
    stream.pipe(writeStream)

    let p = new P((resolve, reject) => {
      writeStream.on('finish', resolve)
      writeStream.on('error', reject)
    })
    stream.resume()
    yield p

    const hash = hashStream.read().toString('hex')
    const chunkPath = this.getChunkPath(hash)
    yield mkdirp(path.dirname(chunkPath))
    yield fs.renameAsync(tempName, chunkPath)
    return hash
  }
}

module.exports = Filesystem
