/*eslint no-unused-vars: ["warn", { "argsIgnorePattern": "query|value|options|schema|tableName" }]*/

import fmtQuery   from '../../util/format'
import Logger     from '../../util/logger'

class DibiConnBase {
 
  constructor (config, options) {
    if (options?.log==undefined || typeof options?.log == 'string') {
      this.log= new Logger(options?.log)
    } else {
      this.log = options.log
    }       
  }

  get dialect() {
    throw 'DibiConnBase: get dialect() not implemented"'
  }

  openTransaction() {
    throw 'DibiConnBase: openTransaction() not implemented"'
  }  


  formatQuery (query, values) {
    return fmtQuery(query, values)
  }

  async doQuery (query, values, options, runCallback, okMessage) {

    const started = Date.now()

    const trx = options?.transaction!=undefined 
      ? options?.transaction 
      : this.openTransaction()
    
    try {

      const data= await runCallback(trx)

      if (options?.log!==false) {
        const elapsed = parseFloat( (Date.now() - started) / 1000.0 ).toFixed(2)
        this.log.debug(fmtQuery(query, values))
        const msg= okMessage(data)
        this.log.debug(`${msg} (time: ${elapsed})`)
      }

      return data
    } catch (error) {
      this.log.error(fmtQuery(query, values))
      this.log.error(error.constructor.name)
      this.log.error(error.stack)
    }

    return undefined

  }



  close () {
    throw 'DibiConnBase: close() not implemented"'
  }

  async execute (query, values, options) {
    throw 'DibiConnBase: execute() not implemented"'
  }

  async select (query, values, options) {
    throw 'DibiConnBase: select() not implemented"'
  }

  async select_one (query, values, options) {
    throw 'DibiConnBase: select_one() not implemented"'
  }

  async getTableNames(schema= 'public') {
    throw 'DibiConnBase: getTableNames() not implemented"'
  }  

  async getTableDetails(tableName, schema= 'public') {
    throw 'DibiConnBase: getTableDetails() not implemented"'
  }    

}

export default DibiConnBase