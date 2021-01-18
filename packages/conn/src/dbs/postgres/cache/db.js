import pgPromise  from  'pg-promise'
import makeConfig from '../defaults/config'

let cached_dbs= {}

function getDb (config) {
  const cache_key= JSON.stringify(config)

  if (cached_dbs[cache_key]!=undefined) {
    return cached_dbs[cache_key] 
  }

  const mconfig = makeConfig(config)
  const pgp     = pgPromise()
  const db      = pgp(mconfig)
  
  cached_dbs[cache_key] = db

  return db
}


export {getDb}