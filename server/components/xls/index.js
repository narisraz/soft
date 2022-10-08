'use strict'

const _ = require('lodash')
const XLSX = require('xlsx')

const Workbook = exports.Workbook = class Workbook {
  constructor(value) {
    if (!(this instanceof Workbook))
      return new Workbook()
    this.SheetNames = []
    this.Sheets = {}
  }
}

function datenum(v, date1904) {
  if (date1904)
    v += 1462
  const epoch = Date.parse(v)
  return (epoch - new Date(Date.UTC(1899, 11, 30))) / (24 * 60 * 60 * 1000)
}

const Cell = exports.Cell = class Cell {
  constructor(value) {
    this.v = value === null ? 0 : value
    if (typeof this.v === 'number') {
      this.t = 'n'
    } else if (typeof this.v === 'boolean') {
      this.t = 'b'
    } else if (this.v instanceof Date) {
      this.t = 'n'
      this.z = XLSX.SSF._table[14]
      this.v = datenum(this.v)
    } else {
      this.t = 's'
    }
  }
}

/**
 * Creates a workbook from a collection.
 *
 * Options:
 *
 * sheetName,
 * rowHeaderField,
 * row
 * columnCollectionField,
 * columnHeaderFormatter, (function)
 * columnHeaderField,
 * columnValueField
 */
exports.fromCollection = (collection, options) => {
  const wb = new Workbook()

  if (options.columnHeaderFormat) {
    XLSX.SSF.load(options.columnHeaderFormat, 165)
  }

  // Create the sheet
  wb.SheetNames.push(options.sheetName)
  const ws = wb.Sheets[options.sheetName] = {}

  // Gets the list of columns
  const columns = new Set()
  collection.forEach(line => {
    const values = line[options.columnCollectionField]
    for (let column of values)
      columns.add(column[options.columnHeaderField])
  })
  const orderedColumns = Array.from(columns).sort()

  const headerFields = _.isArray(options.rowHeaderField) ?
    options.rowHeaderField : [ options.rowHeaderField ]

  const headerCount = headerFields.length + 1

  // Creates the main headers
  orderedColumns.forEach((column, index) => {
    const cellRef = XLSX.utils.encode_cell({c: index + headerCount, r: 0})
    ws[cellRef] = new Cell(options.columnHeaderFormatter(column))
    if (options.columnHeaderFormat)
      ws[cellRef].z = options.columnHeaderFormat
  })

  // Adds the column contents
  let lineIndex = 1
  collection.forEach(line => {
    const fillLine = filter => {
      let headerCols = 0

      headerFields.forEach((field, index) => {
        const cellRef = XLSX.utils.encode_cell({c: headerCols++, r: lineIndex})
        ws[cellRef] = new Cell(line[field])
      })
      if (filter) {
        const cellRef = XLSX.utils.encode_cell({c: headerCols++, r: lineIndex})
        ws[cellRef] = new Cell(filter.header)
      }

      const values = line[options.columnCollectionField]
      values.forEach(column => {
        if (filter && column[filter.field] !== filter.value)
          return
        const columnIndex = orderedColumns.indexOf(column[options.columnHeaderField])
        const columnCellRef = XLSX.utils.encode_cell({
          c: columnIndex + headerCount, r: lineIndex
        })
        ws[columnCellRef] = new Cell(column[options.columnValueField])
      })

      lineIndex++
    }

    if (!options.filters) {
      fillLine(null)
    } else {
      options.filters.forEach(filter => fillLine(filter))
    }
  })

  var range = {
    s: {c:0, r:0},
    e: {
      c: orderedColumns.length + headerCount, 
      r: collection.length * (options.filters ? options.filters.length : 1)
    }
  }

  ws['!ref'] = XLSX.utils.encode_range(range)

  return wb
}

/**
 * Writes a workbook to a stream
 */
exports.toStream = (workbook, stream) => {
  const options = { bookType: 'xlsx', bookSST: false, type:'binary' }
  const excelData = XLSX.write(workbook, options)
  stream.end(excelData, 'binary')
}
