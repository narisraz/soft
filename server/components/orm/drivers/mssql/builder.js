'use strict'

var _ = require('lodash')
var argument = require('../../argument')

var q = function(name, defaultType, params) {
  if (typeof name === 'undefined')
    return ''

  if (!(name instanceof argument.Argument)) {
    name = defaultType(name)
  }

  if (name instanceof argument.Col) {
    var col
    if (!_.isUndefined(name.table)) {
      col = name.table + '.' + name.val
    } else {
      col = name.val
    }

    return col.split(/\./).map(function(val) { 
      return (val === '' || val === '*') ? val : '[' + val + ']'
    }).join('.')

  } else if (name instanceof argument.Table) {
    var res = name.val.split(/\./).map(function(val) { 
      return '[' + val + ']'
    }).join('.')

    if (name.params) {
      res += '(' + name.params.map(function (param) {
        return q(param, argument.Val, params)
      }).join(',') + ')'
    }

    return res
  } else if (name instanceof argument.Val) {
    if (_.isNull(name.val)) {
      return 'NULL'
    } else if (_.isArray(name.val)) {
      return '(' + name.val.map(function(val) {
        params.push(val)
        return '@' + (params.length - 1)
      }).join(',') + ')'
    } else {
      params.push(name.val)
      return '@' + (params.length - 1)
    }
  } else if (name instanceof argument.Raw) {
    return name.val
  } else {
    return ''
  }
}

var convertArgumentToArray = function(arg, def) {
  if (typeof arg === 'undefined' || arg === null) {
      arg = []
  }

  if (!_.isArray(arg)) {
    arg = [arg]
  } else {
    if (arg.length === 0 && typeof def !== 'undefined')  {
      arg = [def]
    }
  }

  return arg
}

function whereSql(conditions, params) {
  conditions = convertArgumentToArray(conditions)

  return conditions.map(function(condition) {
    switch (condition.operation) {
    case 'subquery':
      var dbQuery = condition.subquery.getDbQuery(params)
      return [
        'EXISTS(',
        dbQuery.sql,
        ')'
      ].join(' ')
    case 'or':
      return '(' +
        condition.conditions.map(function (where) {
          return whereSql(where.conditions(), params)
        }).join(' OR ') +
        ')'
    default:
      return [
        q(condition.column, argument.Col, params),
        condition.operation,
        q(condition.value, argument.Val, params)
      ].join(' ')
    }
  }).join(' AND ')
}

function joinSql(joins, params) {
  return joins.map(function(join) {
    var res

    switch (join.type) {
    case 'inner':
      res = ' INNER JOIN '
      break
    case 'left':
      res = ' LEFT OUTER JOIN '
      break
    case 'right':
      res = ' RIGHT OUTER JOIN '
      break
    case 'cross':
      res = ' CROSS JOIN '
      break
    }
    res += q(join.table, argument.Col, params)

    if (join.type !== 'cross') {
      res += ' ON '
      res += join.on.map(function(condition) {
        return q(condition.column1, argument.Col, params) +
          condition.operation +
          q(condition.column2, argument.Col, params)
      }).join(' AND ')
    }

    return res
  }).join(' ')
}

function columnSql(columns, params) {
  return columns.map(function(col) { return q(col, argument.Col, params) }).join(',')
}

function orderSql(columns, params) {
  return columns.map(function(col) {
    var parts = col.split(/\s+(DESC|ASC)$/i)
    return q(parts[0], argument.Col, params) + (parts.length > 1 ? ' ' + parts[1] : '')
  }).join(',')
}

var Builder = module.exports

Builder.select = function(table, columns, joins, conditions, order, limit, offset, params) {
  params = params || []
  var sql = 'SELECT '

  columns = convertArgumentToArray(columns, '*')
  order = convertArgumentToArray(order)
  conditions = convertArgumentToArray(conditions)
  joins = convertArgumentToArray(joins)

  if (limit && !offset) {
    sql += ' TOP ' + (+limit) + ' '
  }

  sql += columnSql(columns)
  sql += ' FROM '

  if (offset) {
    sql += ' (SELECT ' + columnSql(columns) + ', ROW_NUMBER() '
    if (order.length) {
      sql += 'OVER(ORDER BY ' + orderSql(order, params) + ') '
    }
    sql += 'AS __rownum'
    sql += ' FROM '
    sql += q(table, argument.Table, params)
  } else {
    sql += q(table, argument.Table, params)
  }

  if (joins.length) {
    sql += joinSql(joins, params)
  }

  if (conditions.length) {
    sql += ' WHERE ' + whereSql(conditions, params)
  }

  if (offset) {
    if (limit) {
      sql += ') WHERE __rownum BETWEEN ' +
        q(offset, argument.Val, params) +
        ' AND ' +
        q(offset + limit - 1, argument.Val, params)
    } else {
      sql += ') WHERE __rownum >= ' + q(offset, argument.Val, params)
    }
  }

  if (order.length) {
    sql += ' ORDER BY ' + orderSql(order, params)
  }

  return {
    sql: sql,
    params: params
  }
}

Builder.count = function(table, joins, conditions) {
  return Builder.select(table, argument.Raw('COUNT(*) AS [c]'), joins, conditions)
}

Builder.insert = function(table, values) {
  var params = []
  var sql = 'INSERT INTO '

  var keys = _.keys(values)

  sql += q(table, argument.Col, params)

  if (keys.length) {
    sql +=
      ' (' +
      keys.map(function(key) {
        return q(key, argument.Col, params)
      }).join(',') +
      ')'
  }

  sql += ' OUTPUT INSERTED.* '

  if (keys.length) {
    sql += ' VALUES(' +
      keys.map(function(key) {
        return q(values[key], argument.Val, params)
      }).join(',') +
      ')'
  } else {
    sql += ' DEFAULT VALUES'
  }

  return {
    sql: sql,
    params: params
  }
}

Builder.update = function(table, values, conditions) {
  var params = []
  var sql = 'UPDATE '
  var keys = _.keys(values)

  conditions = convertArgumentToArray(conditions)

  sql += q(table, argument.Col, params)
  sql += ' SET ' +
    keys.map(function(key) {
      return q(key, argument.Col, params) + '=' + q(values[key], argument.Val, params)
    }).join(',')

  sql += ' OUTPUT INSERTED.* '

  if (conditions.length) {
    sql += ' WHERE ' + whereSql(conditions, params)
  }

  return {
    sql: sql,
    params: params
  }
}

Builder.delete = function(table, conditions) {
  var params = []
  var sql = 'DELETE FROM '

  conditions = convertArgumentToArray(conditions)

  sql += q(table, argument.Col, params)
  sql += ' OUTPUT DELETED.* '

  if (conditions.length) {
    sql += ' WHERE ' + whereSql(conditions, params)
  }

  return {
    sql: sql,
    params: params
  }
}

Builder.exec = function(procedure, values) {
  var params = []
  var sql = 'EXEC '

  sql += q(procedure, argument.Col, params) + ' '
  sql += values.map(function(value) {
    return q(typeof value === 'undefined' ? null : value, argument.Val, params)
  }).join(',')

  return {
    sql: sql,
    params: params
  }
}
