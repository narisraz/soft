/**
 * Error responses
 */

'use strict'

function getError(code) {
  return (req, res) => {
    const viewFilePath = ''+code
    const statusCode = code
    const result = {
      status: statusCode
    }

    res.status(result.status)

    if (req.accepts('application/json')) {
      res.json(result, result.status)
    } else {
      res.render(viewFilePath, (err) => {
        if (err) { return res.json(result, result.status) }

        res.render(viewFilePath)
      })
    }
  }
}

module.exports[403] = getError(403)
module.exports[404] = getError(404)
