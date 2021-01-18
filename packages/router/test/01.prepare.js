import config from './config'
import {getConnection} from 'dibiconn'

let pgConn= undefined




describe('DiBiRouter: Prepare things for testing', function() {
  
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
      for (const rec of config.data) {
        const query= `
          INSERT INTO test_01
            (name, description, counter)
          VALUES
            ($1, $2, $3)
        `
        await pgConn.execute(query, [rec.name, rec.description, rec.counter])
      }
    })
  })
})



