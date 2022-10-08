'use strict'

/*
The MIT License (MIT)

Copyright (c) 2015 Sanders DeNardi

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

/*
 * Modified to allow the nextstream function to return promises
 */

const Transform = require('stream').Transform,
    util = require('util'),
    P = require('bluebird')

const StreamConcat = function(streams, options) {
  Transform.call(this, options)
  this.streams = streams
  this.canAddStream = true
  this.streamIndex = 0
  let currentStream

  const nextStream = () => {
    currentStream = null
    if (this.streams.constructor === Array && this.streamIndex < this.streams.length) {
      currentStream = this.streams[this.streamIndex++]
    } else if (typeof this.streams === 'function') {
      this.canAddStream = false
      currentStream = this.streams()
    }

    if (currentStream === null) {
      this.canAddStream = false
      this.push(null)
    } else {
      P.resolve(currentStream).then(currentStream => {
        currentStream.pipe(this, {end: false})
        currentStream.on('end', nextStream)
      })
    }
  }

  nextStream()
}

util.inherits(StreamConcat, Transform)

StreamConcat.prototype._transform = function(chunk, encoding, callback) {
  callback(null, chunk)
}

StreamConcat.prototype.addStream = function(newStream) {
  if (this.canAddStream)
    this.streams.push(newStream)
  else
    this.emit('error', new Error('Can\'t add stream.'))
}

module.exports = StreamConcat
