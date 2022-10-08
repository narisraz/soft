'use strict'

var should = require('should')
var builder = require('./builder')
var argument = require('../../argument')

// /SELECT *TOP *10 *\* *FROM *\[table\] *WHERE *\[c1\] *= *@0 *AND *\[c2\] *= *@1 *ORDER *BY *\[c1\],\[c2\],\[c3\]/

describe('components/orm/builder', function () {
  describe('select', function () {
    it('should return a correct simple select statement', function () {
      var query = builder.select(
        'table',
        null, // columns
        null, // joins
        null, // conditions
        null, // order
        null, // limit
        null //offset
      )

      query.sql.should.match(/SELECT *\* *FROM *\[table\]/)
    })

    it('should return a correct simple select statement with an empty array', function () {
      var query = builder.select(
        'table',
        [], // columns
        null, // joins
        null, // conditions
        null, // order
        null, // limit
        null //offset
      )

      query.sql.should.match(/SELECT *\* *FROM *\[table\]/)
    })

    it('should return a correct select statement with columns', function () {
      var query = builder.select(
        'table',
        ['c1', 'c2'], // columns
        null, // joins
        null, // conditions
        null, // order
        null, // limit
        null //offset
      )

      query.sql.should.match(/SELECT *\[c1\],\[c2\] *FROM *\[table\]/)
    })

    it('should return a correct select statement with inner joins', function () {
      var query = builder.select(
        'table',
        null, // columns
        {
          type: 'inner',
          table: 'table2',
          on: [
            {
              column1: 'table.c1',
              operation: '=',
              column2: 'table2.c1'
            },
            {
              column1: 'table2.c2',
              operation: '=',
              column2: argument.Val(2)
            }
          ]
        }, // joins
        null, // conditions
        null, // order
        null, // limit
        null //offset
      )

      query.sql.should.match(/SELECT *\* *FROM *\[table\] *INNER JOIN *\[table2\] *ON \[table\].\[c1\] *= *\[table2\].\[c1\] AND \[table2\].\[c2\] *= *@1*/)
    })

    it('should return a correct select statement with cross joins', function () {
      var query = builder.select(
        'table',
        null, // columns
        {
          type: 'cross',
          table: 'table2'
        }, // joins
        null, // conditions
        null, // order
        null, // limit
        null //offset
      )

      query.sql.should.match(/SELECT *\* *FROM *\[table\] *CROSS JOIN *\[table2\] *$/)
    })

    it('should return a correct select statement with conditions', function () {
      var query = builder.select(
        'table',
        null, // columns
        null, // joins
        [{column:'c1', operation:'=', value:1}, {column:'c2', operation:'=', value:2}], // conditions
        null, // order
        null, // limit
        null //offset
      )

      query.sql.should.match(/SELECT *\* *FROM *\[table\] *WHERE *\[c1\] *= *@0 *AND *\[c2\] *= *@1/)
      query.params.length.should.equal(2)
      query.params[0].should.equal(1)
      query.params[1].should.equal(2)
    })

    it('should return a correct select statement with OR conditions', function () {
      var query = builder.select(
        'table',
        null, // columns
        null, // joins
        [
          {
            operation: 'or',
            conditions: [{
              conditions: () => [{column:'c1', operation:'=', value:1}, {column:'c2', operation:'=', value:2}]
            }, {
              conditions: () => [{column:'c3', operation:'=', value:3}]
            }]
          },
          {column:'c4', operation:'=', value:4}
        ], // conditions
        null, // order
        null, // limit
        null //offset
      )

      query.sql.should.match(/SELECT *\* *FROM *\[table\] *WHERE *\( *\[c1\] *= *@0 *AND *\[c2\] *= *@1 *OR *\[c3\] *= *@2 *\) *AND \[c4\] *= *@3*/)
      query.params.length.should.equal(4)
      query.params[0].should.equal(1)
      query.params[1].should.equal(2)
      query.params[2].should.equal(3)
      query.params[3].should.equal(4)
    })

    it('should return a correct select statement with suquery conditions', function () {
      var query = builder.select(
        'table',
        null, // columns
        null, // joins
        [
          {
            operation: 'subquery',
            subquery: {
              getDbQuery: function() {
                return {
                   sql: 'SELECT id FROM table2 WHERE table2.a = table.b',
                   params: [1, 2]
                }
              }
            }
          }
        ], // conditions
        null, // order
        null, // limit
        null //offset
      )

      query.sql.should.match(/SELECT *\* *FROM *\[table\] *WHERE EXISTS\( *SELECT id FROM table2 WHERE table2.a = table.b *\)/)
      query.params.length.should.equal(2)
      query.params[0].should.equal(1)
      query.params[1].should.equal(2)
    })

    it('should return a correct select statement with IS NULL conditions', function () {
      var query = builder.select(
        'table',
        null, // columns
        null, // joins
        [{column:'c1', operation:'IS NULL'}, {column:'c2', operation:'IS NOT NULL'}], // conditions
        null, // order
        null, // limit
        null //offset
      )

      query.sql.should.match(/SELECT *\* *FROM *\[table\] *WHERE *\[c1\] *IS NULL *AND *\[c2\] IS NOT NULL/)
      query.params.length.should.equal(0)
    })

    it('should return a correct select statement with column comparison conditions', function () {
      var query = builder.select(
        'table',
        null, // columns
        null, // joins
        [{column:'c2', operation:'=', value: argument.Col('c1')}], // conditions
        null, // order
        null, // limit
        null //offset
      )

      query.sql.should.match(/SELECT *\* *FROM *\[table\] *WHERE *\[c2\] *= *\[c1\]/)
      query.params.length.should.equal(0)
    })

    it('should return a correct select statement with raw conditions', function () {
      var query = builder.select(
        'table',
        null, // columns
        null, // joins
        [{column:'c2', operation:'=', value: argument.Raw('c1')}], // conditions
        null, // order
        null, // limit
        null //offset
      )

      query.sql.should.match(/SELECT *\* *FROM *\[table\] *WHERE *\[c2\] *= *c1/)
    })

    it('should return a correct select statement with multi-part column conditions', function () {
      var query = builder.select(
        'table',
        null, // columns
        null, // joins
        [{column:'c2', operation:'=', value: argument.Col('dbo.c1')}], // conditions
        null, // order
        null, // limit
        null //offset
      )

      query.sql.should.match(/SELECT *\* *FROM *\[table\] *WHERE *\[c2\] *= *\[dbo\]\.\[c1\]/)
    })

    it('should return a correct select statement with in conditions', function () {
      var query = builder.select(
        'table',
        null, // columns
        null, // joins
        [{column:'c2', operation:'IN', value: [1, 2, 3]}], // conditions
        null, // order
        null, // limit
        null //offset
      )

      query.sql.should.match(/SELECT *\* *FROM *\[table\] *WHERE *\[c2\] *IN *\( *@0 *, *@1 *, *@2 *\)/)
      query.params[0].should.equal(1)
      query.params[1].should.equal(2)
      query.params[2].should.equal(3)
    })

    it('should return a correct select statement with order', function () {
      var query = builder.select(
        'table',
        null, // columns
        null, // joins
        null, // conditions
        ['c1', 'c2 DESC', 'c3 ASC'], // order
        null, // limit
        null //offset
      )

      query.sql.should.match(/SELECT *\* *FROM *\[table\] *ORDER *BY *\[c1\],\[c2\] DESC,\[c3\] ASC/)
    })

    it('should return a correct select statement with limit', function () {
      var query = builder.select(
        'table',
        null, // columns
        null, // joins
        null, // conditions
        null, // order
        10, // limit
        null //offset
      )

      query.sql.should.match(/SELECT *TOP *10 *\* *FROM *\[table\]/)
    })

    it('should return a correct select statement with offset', function () {
      var query = builder.select(
        'table',
        null, // columns
        null, // joins
        null, // conditions
        'c1', // order
        null, // limit
        10 //offset
      )

      query.sql.should.match(/SELECT *\* *FROM *\(SELECT \*, ROW_NUMBER\(\) *OVER\(ORDER *BY *\[c1\]\) *AS *__rownum *FROM *\[table\]\) *WHERE *__rownum *>= *@0/)
      query.params.length.should.equal(1)
      query.params[0].should.equal(10)
    })

    it('should return a correct select statement with limit and offset', function () {
      var query = builder.select(
        'table',
        null, // columns
        null, // joins
        null, // conditions
        'c1', // order
        10, // limit
        10 //offset
      )

      query.sql.should.match(/SELECT *\* *FROM *\(SELECT \*, ROW_NUMBER\(\) *OVER\(ORDER *BY *\[c1\]\) *AS *__rownum *FROM *\[table\]\) *WHERE *__rownum *BETWEEN *@0 *AND *@1/)
      query.params.length.should.equal(2)
      query.params[0].should.equal(10)
      query.params[1].should.equal(19)
    })
  })

  describe('insert', function () {
    it('should return a correct simple insert statement', function () {
      var query = builder.insert(
        'table',
        {
          c1: 1,
          c2: 2
        } // values
      )

      query.sql.should.match(/INSERT INTO *\[table\] *\(\[c1\],\[c2\]\) *OUTPUT INSERTED.\* *VALUES\(@0, *@1\)/)
      query.params.length.should.equal(2)
      query.params[0].should.equal(1)
      query.params[1].should.equal(2)
    })

    it('should return a correct simple insert statement with default values', function () {
      var query = builder.insert(
        'table',
        {
        } // values
      )

      query.sql.should.match(/INSERT INTO *\[table\] *OUTPUT INSERTED.\* *DEFAULT VALUES/)
      query.params.length.should.equal(0)
    })

    it('should return a correct insert statement with raw parameters', function () {
      var query = builder.insert(
        'table',
        {
          c1: 1,
          c2: argument.Raw('GetDate()')
        } // values
      )

      query.sql.should.match(/INSERT INTO *\[table\] *\(\[c1\],\[c2\]\) *OUTPUT INSERTED.\* *VALUES\(@0, *GetDate\(\)\)/)
      query.params.length.should.equal(1)
      query.params[0].should.equal(1)
    })

    it('should return a correct insert statement with NULL parameters', function () {
      var query = builder.insert(
        'table',
        {
          c1: 1,
          c2: null
        } // values
      )

      query.sql.should.match(/INSERT INTO *\[table\] *\(\[c1\],\[c2\]\) *OUTPUT INSERTED.\* *VALUES\(@0, *NULL\)/)
      query.params.length.should.equal(1)
      query.params[0].should.equal(1)
    })

    it('should return a correct simple insert statement with inserted output', function () {
      var query = builder.insert(
        'table',
        {
          c1: 1,
          c2: 2
        }
      )

      query.sql.should.match(/INSERT INTO *\[table\] *\(\[c1\],\[c2\]\) *OUTPUT INSERTED.\* *VALUES\(@0, *@1\)/)
      query.params.length.should.equal(2)
      query.params[0].should.equal(1)
      query.params[1].should.equal(2)
    })
  })

  describe('update', function () {
    it('should return a correct simple update statement', function () {
      var query = builder.update(
        'table',
        { c1: 1, c2: 2 } // values
      )

      query.sql.should.match(/UPDATE *\[table\] SET \[c1\] *= *@0, *\[c2\] *= *@1 *OUTPUT INSERTED.\* */)
      query.params.length.should.equal(2)
      query.params[0].should.equal(1)
      query.params[1].should.equal(2)
    })

    it('should return a correct simple update statement with NULL values', function () {
      var query = builder.update(
        'table',
        { c1: 1, c2: null } // values
      )

      query.sql.should.match(/UPDATE *\[table\] SET \[c1\] *= *@0, *\[c2\] *= *NULL *OUTPUT INSERTED.\* */)
      query.params.length.should.equal(1)
      query.params[0].should.equal(1)
    })

    it('should return a correct update statement with conditions', function () {
      var query = builder.update(
        'table',
        { c1: 1, c2: 2 }, // values
        [{column:'c1', operation:'=', value:3}, {column:'c2', operation:'=', value:4}] // conditions
      )

      query.sql.should.match(/UPDATE *\[table\] SET \[c1\] *= *@0, *\[c2\] *= *@1 *OUTPUT INSERTED.\* *WHERE *\[c1\] *= *@2 *AND *\[c2\] *= *@3/)
      query.params.length.should.equal(4)
      query.params[0].should.equal(1)
      query.params[1].should.equal(2)
      query.params[2].should.equal(3)
      query.params[3].should.equal(4)
    })
  })

  describe('delete', function () {
    it('should return a correct simple delete statement', function () {
      var query = builder.delete(
        'table'
      )

      query.sql.should.match(/DELETE FROM *\[table\] *OUTPUT DELETED.\*/)
      query.params.length.should.equal(0)
    })

    it('should return a correct delete statement with conditions', function () {
      var query = builder.delete(
        'table',
        [{column:'c1', operation:'=', value:1}, {column:'c2', operation:'=', value:2}] // conditions
      )

      query.sql.should.match(/DELETE FROM *\[table\] *OUTPUT DELETED.\* * WHERE *\[c1\] *= *@0 *AND *\[c2\] *= *@1/)
      query.params.length.should.equal(2)
      query.params[0].should.equal(1)
      query.params[1].should.equal(2)
    })
  })

  describe('exec', function () {
    it('should return a correct exec statement', function () {
      var query = builder.exec(
        'procedure',
        [
          1,
          'param2',
          3
        ]
      )

      query.sql.should.match(/EXEC \[procedure\] @0,@1,@2/)
      query.params.length.should.equal(3)
      query.params[0].should.equal(1)
      query.params[1].should.equal('param2')
      query.params[2].should.equal(3)
    })
  })
})
