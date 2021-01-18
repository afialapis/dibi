import assert from 'assert'
import config from './config'
import {getConnection} from '../src'

let pgConn= undefined

describe('Postgres: Test inspectors', function() {

  describe('Connection open', function() {
    it('should create the database connection', function() {
      pgConn = getConnection(config.db)
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

  describe('Create', function() {
    it('should create test_02 table', async function() {
      const query = `
        CREATE TABLE test_02 (
          id           serial,
          foo          INTEGER,
          bar          TEXT
        )`
      await pgConn.execute(query)
    })
  }),  

  describe('get table names', function() {
    it('should list table names', async function() {
      const res= await pgConn.getTableNames()
      assert.deepStrictEqual(res, ['test_01', 'test_02'])
    })
  }),  


  describe('clean', function() {
    it('should drop test_01', async function() {
      const query = `DROP TABLE test_01`
      await pgConn.execute(query)
    })
  }),

  describe('clean', function() {
    it('should drop test_02', async function() {
      const query = `DROP TABLE test_02`
      await pgConn.execute(query)
    })
  })  
  
})



