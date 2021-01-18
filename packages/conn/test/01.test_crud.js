import assert from 'assert'
import config from './config'
import {getConnection} from '../src'

let pgConn= undefined

const TEST_RECORDS= [
  {name: 'Peter', description: 'A simple man', counter: 91},
  {name: 'Harry', description: 'A dirty man' , counter: 99},
  {name: 'James', description: 'A golden man', counter: 99},
  {name: 'Jonny', description: 'A rocker man', counter: 46},
]


describe('Postgres: Test some queries', function() {
  
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

  describe('Insert', function() {
    it('should create test records', async function() {
      for (const rec of TEST_RECORDS) {
        const query= `
          INSERT INTO test_01
            (name, description, counter)
          VALUES
            ($1, $2, $3)
        `
        await pgConn.execute(query, [rec.name, rec.description, rec.counter])
      }
    })
  }),    

  describe('Update', function() {
    it('should update one record', async function() {

      const query = `
        WITH rows as (
          UPDATE test_01
              SET description = $1
            WHERE name = $2
          RETURNING 1
        ) SELECT count(*) AS cnt FROM rows`
      const res= await pgConn.select_one(query, ['A not so simple man', 'Peter'])

      assert.strictEqual(res.cnt, '1')

    })
  }),

  describe('Update', function() {
    it('should update several records', async function() {
      const query = `
        WITH rows as (
          UPDATE test_01
              SET name = $1
            WHERE counter = $2
          RETURNING 1
        ) SELECT count(*) AS cnt FROM rows`
      const res= await pgConn.select_one(query, ['Frederic', 99])

      assert.strictEqual(res.cnt, '2')
    })
  }),
  describe('Delete', function() {
    it('should delete one record', async function() {
      const query = `
        WITH rows as (
          DELETE
            FROM test_01
            WHERE name = $1
          RETURNING 1
        ) SELECT count(*) AS cnt FROM rows`
        const res= await pgConn.select_one(query, ['Jonny'])

      assert.strictEqual(res.cnt, '1')
    })
  }),

  describe('Count', function() {
    it('should count 3 records', async function() {
      const query = `
        SELECT COUNT(1) as cnt
          FROM test_01`
      const res= await pgConn.select_one(query)

      assert.strictEqual(res.cnt, '3')
    })
  }),
  describe('Count', function() {
    it('should count 2 records with name Frederic', async function() {
      const query = `
        SELECT COUNT(1) as cnt
          FROM test_01
          WHERE name = $1`
      const res= await pgConn.select_one(query, ['Frederic'])

      assert.strictEqual(res.cnt, '2')
    })
  }),
  describe('Count', function() {
    it('should count 2 distinct names, Frederic and Peter', async function() {
      const query = `
        SELECT COUNT(DISTINCT name) as cnt
          FROM test_01`
      const res= await pgConn.select_one(query)

      assert.strictEqual(res.cnt, '2')
    })
  }),

  describe('Distinct', function() {
    it('should return distinct names, Frederic and Peter', async function() {
      const query = `
        SELECT DISTINCT name as cnt
          FROM test_01`
      const res= await pgConn.select(query)

      assert.strictEqual(res.length, 2)
    })
  }),

  describe('Delete', function() {
    it('should delete other records', async function() {

      const query = `
        WITH rows as (
          DELETE
            FROM test_01
          RETURNING 1
        ) SELECT count(*) AS cnt FROM rows`
        const res= await pgConn.select_one(query)

      assert.strictEqual(res.cnt , '3')
    })
  }),

  describe('clean', function() {
    it('should drop test_01', async function() {
      const query = `DROP TABLE test_01`
      await pgConn.execute(query)
    })
  })    

})



