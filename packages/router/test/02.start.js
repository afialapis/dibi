import config from './config'
import DibiRouter from '../src'
import {start} from './server'


describe('DiBiRouter: Start', function() {
  
  describe('Start server', function() {
    it('should init test_01 routes and server them', async function() {
      const routes= await DibiRouter(config.db, /*tables*/ '*', /*prefix*/ config.server.url, /*schema*/ 'public')
      start(routes)
    })
  })  
})



