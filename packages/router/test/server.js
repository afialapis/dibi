import Koa from 'koa'
import config from './config'

const app = new Koa()
let server

const start = (routes) => {
  
  if (routes!=undefined) {
    app.use(routes)
  }

  server= app.listen(config.server.port, function () {
    console.info('Listening on port ' + config.server.port)

  })

  return server
}

const stop = () => {
  server.close()
}

export {start, stop}