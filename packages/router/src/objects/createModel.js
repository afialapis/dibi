import {getModel} from 'dibiorm'

const createModel = async (db, tablename, options) => {

  const model= await getModel(db, tablename, options)
  return model

}

export default createModel