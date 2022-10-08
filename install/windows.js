const nodeWindows = require('node-windows')
const args = process.argv.slice(2)
const shellescape = require('shell-escape');

nodeWindows.elevate(`node ${__dirname}/windows-service-installer ${shellescape(args)}`)
