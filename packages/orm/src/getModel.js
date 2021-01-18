import ModelPG from './models/postgres'

const getModel = async (db, tableName, options) => {

  if (db.dialect == 'postgres') {
    const definition= await db.getTableDetails(tableName /*, 'public'*/ )

    const model = new ModelPG(db, tableName, definition, options)
    return model
  }

  throw `getModel: ${db.dialect} is not a supported dialect`

}

export default getModel