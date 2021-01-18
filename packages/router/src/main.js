import Router    from 'koa-router'
import {getDibiRouters} from './cache'
import initDibiRouter from './init'


async function DibiRouter(dbOrConfig, tables= '*', prefix= '/api', schema= 'public') {


  // Init dibirouter objects and cache them
  const tableList= await initDibiRouter(dbOrConfig, tables, schema)

  // Init the Koa Router
  const router = new Router()

  // Get the recently created dibirouters
  const dibirouterMap= getDibiRouters()

  // Attach them to the router
  Object.keys(dibirouterMap).map((name) => {
    const dibirouter= dibirouterMap[name]
    let route= '', myurl= ''
    tableList.map((t) => {
      if (t.name==name) {
        if (t.route!=undefined) {
          route= t.route
        }
      }
    })
    if (route) {
      myurl= `${prefix}/${route}`
    } else {
      myurl= `${prefix}/${name}`
    }
    
    dibirouter.attachTo(router,  myurl /*, ['find', 'key_list', 'remove']*/)
  })


  // Return the routes
  return router.routes()
}


export default DibiRouter