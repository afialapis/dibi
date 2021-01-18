import DibiConnPG from './postgres/connection'

function getConnection (config) {

  if (config.dialect == 'postgres') {
    const conn= new DibiConnPG(config)
    return conn
  }

  throw `getConnection: ${config.dialect} is not a supported dialect`
}


export default getConnection