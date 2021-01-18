import DibiConnBase from '../base/connection'
import {getDb} from './cache/db'

class DibiConnPG extends DibiConnBase {

  constructor (config, options) {
    super(config, options)
    this.db       = getDb(config)
  }

  get dialect() {
    return 'postgres'
  }


  openTransaction() {
    return this.db.tx  
  }  

  close () {
    // Gotta do nothing if we use .query() ?
  }

  async execute (query, values, options) {
    return this.doQuery (query, values, options, 

      async (transaction) => {

        const action = (t) => {
          return t.oneOrNone(query, values)
        }

        const data = await transaction(action)
        let ret = null

        if (data!=null) {
          const ks= Object.keys(data)
          ret= data[ks[0]]
          if (ks.length>1) {
            this.log.error(`dibiorm.execute() Returned more than one field. Just ${ks[0]} will be returned. Fields are ${JSON.stringify(ks)}`)
          }
        }
        
        return ret

      }, 
      (_data) => 'Query done') 
  }

  async select (query, values, options) {
    return this.doQuery (query, values, options, 
      
      async (transaction) => {

        const action = (t) => {
          return t.any(query, values)
        }

        const data = await transaction(action)
        
        return data

      }, 
      (data) => `Returned ${data.length} rows`) 

  }

  async select_one (query, values, options) {
    const data = await this.select(query, values, options)

    const omitWarning = options!=undefined
      ? options.omitWarning===true ? true : false
      : false
  
    if (data == undefined) {
      return undefined
    }

    if (data.length>1 && !omitWarning) {
      this.log.warn('Returned ' + data.length + ' rows, but expected just 1')
    }
  
    if (data.length>0)
      return data[0]
    
    return {}
  }  

  async getTableNames(schema= 'public') {
    const query= 
        `SELECT DISTINCT c.relname AS name
          FROM pg_class c
          JOIN pg_namespace n ON n.oid = c.relnamespace  
          WHERE c.relkind = 'r'::char
            AND n.nspname = $1
      ORDER BY 1`
    
    const res = await this.select(query, [schema])

    const out = res.map((r) => r.name)

    return out
      
  }  

  async getTableDetails(tableName, schema= 'public') {
    const query= 
      `SELECT f.attnum AS number, f.attname AS name, f.attnum,  
              f.attnotnull AS notnull, 
              f.atttypid as type_id,
              -- pg_catalog.format_type(f.atttypid,f.atttypmod) AS type,  
              CASE  
                  WHEN p.contype = 'p' THEN 't'  
                  ELSE 'f'  
              END AS primarykey,  
              CASE  
                  WHEN p.contype = 'u' THEN 't'  
                  ELSE 'f'
              END AS uniquekey
              -- CASE
              --     WHEN p.contype = 'f' THEN g.relname
              -- END AS foreignkey,
              -- CASE
              --     WHEN p.contype = 'f' THEN p.confkey
              -- END AS foreignkey_fieldnum,
              -- CASE
              --     WHEN p.contype = 'f' THEN g.relname
              -- END AS foreignkey,
              -- CASE
              --     WHEN p.contype = 'f' THEN p.conkey
              -- END AS foreignkey_connnum,
              -- CASE
              --     WHEN f.atthasdef = 't' THEN d.adsrc
              -- END AS default
          FROM pg_attribute f  
          JOIN pg_class c ON c.oid = f.attrelid  
          JOIN pg_type t ON t.oid = f.atttypid  
    LEFT JOIN pg_attrdef d ON d.adrelid = c.oid AND d.adnum = f.attnum  
    LEFT JOIN pg_namespace n ON n.oid = c.relnamespace  
    LEFT JOIN pg_constraint p ON p.conrelid = c.oid AND f.attnum = ANY (p.conkey)  
    LEFT JOIN pg_class AS g ON p.confrelid = g.oid  
        WHERE c.relkind = 'r'::char  
          AND n.nspname = $1
          AND c.relname = $2
          AND f.attnum > 0 
      ORDER BY number`    

    const res = await this.select(query, [schema, tableName])

    let tableDef = {}
    
    res.map((r) => {
      const fieldName= r.name
      const fieldProps= {
        type     : r.type_id,
        key      : r.name=='id',  // Review me. See how to trust query for this
        nullable : ! r.notnull,
        default  : undefined, // And me ?
  
      }
      tableDef[fieldName]= fieldProps
    })

    return tableDef
    
  }  

}

export default DibiConnPG