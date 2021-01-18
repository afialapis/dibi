import dibirouterCache from './dibirouterCache'

const getDb = () => {
  const db= dibirouterCache.getValue('db')
  if (db == undefined) {
    console.error(`DibiRouter database NOT FOUND!`)
  }

  return db 
}

const setDb = (db) => {
  dibirouterCache.setValue('db', db)
}

const getModel = (tableName) => {
  return dibirouterCache.getValueFromMap('models', tableName)
}

const setModel = (tableName, model) => {
  return dibirouterCache.setValueToMap('models', tableName, model)
}

/*const getDibiRouter = (tableName) => {
  return dibirouterCache.getValueFromMap('dibirouters', tableName)
}*/

const getDibiRouters = () => {
  return dibirouterCache.getValue('dibirouters')
}

const setDibiRouter = (tableName, model) => {
  return dibirouterCache.setValueToMap('dibirouters', tableName, model)
}

export {getDb, setDb, getModel, setModel, /*getDibiRouter,*/ getDibiRouters, setDibiRouter}