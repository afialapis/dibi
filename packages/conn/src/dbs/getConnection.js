import DibiConnPG from './postgres/connection'

function getConnection (config, options) {

  if (config.dialect == 'postgres') {
    const conn= new DibiConnPG(config, options)
    return conn
  }

  throw `getConnection: ${config.dialect} is not a supported dialect`
}


export default getConnection