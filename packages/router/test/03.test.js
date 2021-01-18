import assert from 'assert'
import fetch from 'node-fetch'
import config from './config'


describe('DiBiRouter: Test', function() {
  
  describe('Test routes', function() {
    it('should fetch test_01 from api (READ)', async function() {
      const response = await fetch(`http://localhost:${config.server.port}${config.server.url}/test_01/read`)
      const data = await response.json()
      console.log(data.result)
      assert.strictEqual(data.result.length, config.data.length)

    })
  })  
})



