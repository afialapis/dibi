import config from './config'
import {getConnection} from 'dibiconn'

let pgConn= undefined


describe('DiBiRouter: Clean things for testing', function() {
  
  describe('Connection open', function() {
    it('should create the database connection', function() {
      pgConn = getConnection(config.db)
    })
  }),
  describe('clean', function() {
    it('should drop test_01', async function() {
      const query = `DROP TABLE test_01`
      await pgConn.execute(query)
    })
  })    

})



