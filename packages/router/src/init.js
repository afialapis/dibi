import {createDb} from './db/createDb'
import {setDb, setModel, setDibiRouter} from './cache'
import createModel from './objects/createModel'
import createDibiRouter from './objects/createDibiRouter'

const initDibiRouter = async (dbOrConfig, tables= '*', schema= 'public') => {
  // Init db object and cache it
  const db= createDb(dbOrConfig)
  setDb(db)
  

  // Build tableList depending on tables param
  let tableList = []
  if (tables==='*') {
    const readFromDb= await db.getTableNames(schema)
    tableList= readFromDb.map((t) => {
      return {
        name: t,
        options: {}
      }
    })
  } else if (typeof tables == 'string') {
    tableList.push({name: tables, options: {}})
  } else {
    for (let tab of tables) {
      if (typeof tab == 'string') {
        tableList.push({name: tab, options: {}})
      } else {
        tableList.push(tab)
      }
    }
  }
  
  // Init models and dibirouters, and cache them
  for (let tab of tableList) {
    const model= await createModel(db, tab.name, tab.options)
    setModel(tab.name, model)

    const dibirouter= createDibiRouter(model)
    setDibiRouter(tab.name, dibirouter)
  }

  
  return tableList

}

export default initDibiRouter