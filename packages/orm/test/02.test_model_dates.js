import assert from 'assert'
import {getConnection} from 'dibiconn'
import {getModel} from '../src/index'
import config from './config'

const TEST_RECORDS= [
  {name: 'Peter', description: 'A simple man', counter: 91},
  {name: 'Harry', description: 'A dirty man' , counter: 99},
  {name: 'James', description: 'A golden man', counter: 99},
  {name: 'Jonny', description: 'A rocker man', counter: 46},
]

const MODEL_OPTIONS= {

}

let pgConn= undefined, TestModel= undefined

/*
DO SOMETHING HERE USING DATES OPTIONS

THEN ON ANOTHER TEST TRY CUSTOM HOOKS
--- MAYBE INSTEAD OF HOOKS CALL THEM TRIGERS
*/

describe('DibiOrm', function() {

  describe('Connection open', function() {
    it('should create the database connection', function() {
      pgConn = getConnection(config.db)
    })
  }),
  
  describe('clean', function() {
    it('should drop test_01 table if exists', async function() {
      const query = `DROP TABLE IF EXISTS test_01`
      await pgConn.execute(query)
    })
  }),

  describe('Create', function() {
    it('should create test_01 table', async function() {
      const query = `
        CREATE TABLE test_01 (
          id           serial,
          name         TEXT NOT NULL,
          description  TEXT NULL,
          counter      INTEGER
        )`
      await pgConn.execute(query)
    })
  }),

  describe('TestModel', function() {
    it('should create a DibiOrm model', async function() {
      TestModel = await getModel(pgConn, 'test_01', MODEL_OPTIONS)
    })
  }),
  describe('Insert', function() {
    it('should insert several records', async function() {
      for (const rec of TEST_RECORDS) {
        await TestModel.insert(rec) //.catch((e) => {})
      }
    })
  }),
  describe('Update', function() {
    it('should update one record', async function() {
      const count= await TestModel.update({description: 'A not so simple man'}, {name: 'Peter'})
      assert.strictEqual(count, '1')
    })
  }),
  describe('Update', function() {
    it('should update several records', async function() {
      const count= await TestModel.update({name: 'Frederic'}, {counter: 99})
      assert.strictEqual(count, '2')
    })
  }),
  describe('Delete', function() {
    it('should delete one record', async function() {
      const count= await TestModel.delete( {name: 'Jonny'})
      assert.strictEqual(count, '1')
    })
  }),
  describe('Count', function() {
    it('should count 3 records', async function() {
      const count= await TestModel.count( {})
      assert.strictEqual(count, '3')
    })
  }),
  describe('Count', function() {
    it('should count 2 records with name Frederic', async function() {
      const count= await TestModel.count( {name: 'Frederic'})
      assert.strictEqual(count, '2')
    })
  }),
  describe('Count', function() {
    it('should count 2 distinct names, Frederic and Peter', async function() {
      const count= await TestModel.count( {}, {distinct: 'name'})
      assert.strictEqual(count, '2')
    })
  }),
  describe('Distinct', function() {
    it('should return distinct names, Frederic and Peter', async function() {
      const names= await TestModel.distinct( 'name', {})
      assert.strictEqual(names.length, 2)
    })
  }),
  describe('Delete', function() {
    it('should delete other records', async function() {
      const count= await TestModel.delete( {})
      assert.strictEqual(count, '3')
    })
  }),
  describe('clean', function() {
    it('should drop test_01', async function() {
      const query = `DROP TABLE test_01`
      await pgConn.execute(query)
    })
  })
})



