'use strict'

const P = require('bluebird')

/*
 * Returns a promise that resolves to the content of a given text stream
 */
function streamTextReader(strm) {
  return new P((resolve, reject) => {
    let data = ''

    strm.setEncoding('utf8')
    strm.on('data', chunk => data += chunk)
    strm.on('error', err => reject(err))
    strm.on('end', () => resolve(data))
  })
}

module.exports = streamTextReader
