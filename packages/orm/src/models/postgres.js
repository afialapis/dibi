/*eslint no-unused-vars: ["warn", { "argsIgnorePattern": "opt|filter|params" }]*/
import {epoch} from 'afi-util/lib/dates'

class ModelPG {
  constructor(db, tablename, definition, options) {
    this.db         = db
    this.tablename  = tablename
    this.definition = definition
    this.config     = {}

    this.config.customHooks= options?.customHooks || {}
    this.config.useDates= options?.useDates === true
    this.config.checkBeforeDelete= options?.checkBeforeDelete
  }

  

  get fields() {
    return Object.keys(this.definition)
  }

  _objToTuple(obj) {
    let fields = [], values = []
    for (const fld in obj) {
      if (this.fields.indexOf(fld) >= 0) {
        fields.push(fld)
        values.push(obj[fld])
      }
    }
    return [fields, values]
  }

  ensureDefs(data) {
    data.map((record) => {
      this.fields.map((fld) => {
        if (record[fld]===null) {
          const fdef= this.definition[fld]
          if (Object.prototype.hasOwnProperty.call(fdef, 'default')) {
            record[fld]= fdef.default
          }
        }
      })
    })
  }

  prepareQuery(filter, options) {

    const sselect = options?.fields != undefined 
                    ? options.fields.join(',') 
                    : '*'

    const [wfields, wvalues] = this._objToTuple(filter)
    
    let swhere= ''
    if (wfields.length > 0)
      swhere= ' WHERE ' + wfields.map((f, i) => {
        if (typeof wvalues[i] == 'object' && wvalues[i].constructor.name=='Array') {
          return f + ' IN ($' + (i + 1) + ':csv)'
        }
        else if (wvalues[i] === null || wvalues[i] === undefined) {
          return f + ' IS NULL'
        }
        else {
          return f + ' = $' + (i + 1)
        }
      }).join(' AND ')
    
    let query = `SELECT ${sselect} FROM ${this.tablename} ${swhere}`

    if (options?.sortby) {
      let name= '', dir= 1
      if (typeof options.sortby == 'object') {
        name= options.sortby[0]
        dir=options.sortby[1]
      } else {
        name= options.sortby
      }
      query+= ` SORT BY ${name} ${!dir ? 'DESC' : 'ASC'}`
    }

    if (! isNaN(options?.limit)) {
      query += ` LIMIT ${options.limit} `
    }
    
    if (! isNaN(options?.offset)) {
      query += ` OFFSET ${options.offset}`
    }

    return [query, wvalues]
  }

  async beforeRead(filter, options) {
    return Promise.resolve([
      filter, options, true
    ])
  }

  async afterRead(data, filter, options) {
    return Promise.resolve(
      data
    )
  }    

  async read(pfilter, poptions) {
    const [filter, options, goon] = await this.beforeRead(pfilter, poptions)

    if (! goon)
      return []

    const [query, values] = this.prepareQuery(filter, options)

    let data= await this.db.select(query, values, options)

    this.ensureDefs(data)

    data= await this.afterRead(data, filter, options)
    
    return data
  }



  async keyList(filt, options) {    
    
    let data = await this.read(filt, {fields: ['id', 'name'], transaction: options?.transaction})
    this.ensureDefs(data)

    let res= {}
    data.map((d) => {res[d.id]= d.name})
    return res
  }

  async distinct(field, filt, options) {    
    const data = await this.read(filt, {fields: [`DISTINCT ${field}`], transaction: options?.transaction})
    const res= data.map((d) => d[field])
    return res
  }

  async count(filt, options) {    
    let field
    if (options?.distinct!=undefined) {
      field= `COUNT(DISTINCT ${options.distinct}) AS cnt`
    } else {
      field= 'COUNT(1) AS cnt'
    }
    const data = await this.read(filt, {fields: [field], transaction: options?.transaction})
    try {
      return data[0].cnt
    } catch(error) {
      this.db.log.error(`${this.tablename} ERROR:`)
      this.db.log.error(error.constructor.name)
      this.db.log.error(error.stack)      
    }

    return 0
  }


  async find(id, options) {
    if (isNaN(id) || id <= 0) {    
      const msg = this.tablename + ': cannot find, invalid Id <' + id + '>'
      this.db.log.error(msg)
      throw new Error(msg)
    }

    const data= await this.read({id: id}, options)
    
    let odata= {}
    if (Array.isArray(data)) {
      this.ensureDefs(data)
      odata= data[0]
    } else {
      this.db.log.warn(`${this.tablename}: Id ${id} does not exist`)
    }

    return odata
  }

  prepareObj(obj) {
    let out = {}
    
    Object.keys(obj)
      .filter((k) => this.fields.indexOf(k) >=0)
      .map((k) => {
        out[k] = obj[k]
      })

    return out
  }

  async beforeInsert(params, options) {
    if (this.config.useDates) {
      const now= epoch()
      params.created_at= now
    }


    let allow= true
    if (this.config.customHooks.beforeInsert != undefined) {
      [params, options, allow]= await this.config.customHooks.beforeInsert(params, options)
    }

    return Promise.resolve([
      params, options, allow
    ])
  }

  async afterInsert(id, params, options) {
    if (this.config.customHooks.afterInsert != undefined) {
      id= await this.config.customHooks.afterInsert(id, params, options)
    }

    return Promise.resolve(
      id
    )
  }


  async insert(data, poptions) {

    data= this.prepareObj(data)

    let [params, options, goon] = await this.beforeInsert(data, poptions)

    if (! goon)
      return []

    const ituple = this._objToTuple(params)
    const ifields = ituple[0]
    const ivalues = ituple[1]

    const sfields = ifields.join(',')
    const sinsert = ifields.map((f, i) => '$' + (i + 1)).join(',')
    
    const query = `INSERT INTO ${this.tablename} (${sfields}) VALUES (${sinsert}) RETURNING id`

    const ndata = await this.db.select_one(query, ivalues, options)
    
    const id= await this.afterInsert(ndata.id, params, options)
    
    if (id == null) {
      const msg = this.tablename + ': cannot save ' + JSON.stringify(data)
      this.db.log.error(msg)
    } else {
      if (options?.log!==false) {
        this.db.log.debug(`Created with Id ${id}`)
      }
    }

    return id
  }


  async beforeUpdate(params, filter, options) {
    if (this.config.useDates) {
      const now= epoch()
      params.last_update_at= now
    }

    let allow= true
    if (this.config.customHooks.beforeUpdate != undefined) {
      [params, filter, options, allow]= await this.config.customHooks.beforeUpdate(params, filter, options)
    }

    return Promise.resolve([
      params, filter, options, allow
    ])
    
  }

  async afterUpdate(rows, params, filter, options) {
    if (this.config.customHooks.afterUpdate != undefined) {
      rows= await this.config.ustomHooks.afterUpdate(rows, params, filter, options)
    }    

    return Promise.resolve(
      rows
    )
  }


  async update(data, filt, poptions) {

    data= this.prepareObj(data)
    delete data.id

    let [params, filter, options, goon] = await this.beforeUpdate(data, filt, poptions)

    if (! goon)
      return []

    const utuple = this._objToTuple(params)
    const ufields = utuple[0]
    const uvalues = utuple[1]

    if (ufields.length == 0) {
      this.db.log.error(`${this.tablename} ERROR: Nothing to update`)
      return 0
    }

    const sfields = 'SET ' + ufields.map((f, i) => f + ' = $' + (i + 1)).join(',')


    const wtuple = this._objToTuple(filter)
    const wfields = wtuple[0]
    const wvalues = wtuple[1]

    let swhere = ''
    if (wfields.length > 0)
      swhere = ' WHERE ' + wfields.map((f, i) => f + ' = $' + (i + 1 + ufields.length)).join(' AND ')    

    const allvalues= uvalues.concat(wvalues)
    const query = `WITH rows as (UPDATE ${this.tablename} ${sfields} ${swhere} RETURNING 1) SELECT count(*) as cnt FROM rows`

    const ndata= await this.db.select_one(query, allvalues, options)

    const count= await this.afterUpdate(ndata.cnt, params, filter, options)

    if (count == 0) {
      const msg = this.tablename + ': no record updated with filter ' + JSON.stringify(filt) + ' -- ' + JSON.stringify(data)
      this.db.log.warn(msg)
    } else {
      if (options?.log!==false) {
        this.db.log.debug(`Updated ${count} records`)
      }
    }

    return count
  }  


  async beforeDelete(filter, options) {
    let allow= true

    if (this.config.checkBeforeDelete!=undefined) {
      try {
        if (filter.id != undefined) {
          let found= 0

          for (const check of this.config.checkBeforeDelete) {
            const [checkTable, checkField]= check.split('.')
            const qry= `SELECT COUNT(1) as cnt FROM ${checkTable} WHERE ${checkField} = $1`
            const filt= [filter.id]
            const res= await this.db.select_one(qry, filt, options)
            found += res.cnt
          }

          allow= found==0
        }
      } catch(e) {}
    }

    if (this.config.customHooks.beforeDelete != undefined) {
      [filter, options, allow] = await this.config.customHooks.beforeDelete(filter, options)
    }

    return Promise.resolve([
      filter, options, allow
    ])
  }

  async afterDelete(rows, filter, options) {
    if (this.config.customHooks.afterDelete != undefined) {
      rows = await this.config.customHooks.afterDelete(rows, filter, options)
    }


    return Promise.resolve(
      rows
    )
  }


  async delete(filt, poptions) {
    let [filter, options, goon] = await this.beforeDelete(filt, poptions)

    if (! goon) {
      const msg = this.tablename + ': Cannot delete for filter ' + JSON.stringify(filt)
      this.db.log.warn(msg)
      return 0
    }  

    const wtuple = this._objToTuple(filter)
    const wfields = wtuple[0]
    const wvalues = wtuple[1]


    let swhere = ''
    if (wfields.length > 0)
      swhere = ' WHERE ' + wfields.map((f, i) => f + ' = $' + (i + 1)).join(' AND ')


    const query = `WITH rows as (DELETE FROM ${this.tablename} ${swhere} RETURNING 1) SELECT count(*) AS cnt FROM rows`

    const ndata= await this.db.select_one(query, wvalues, options)

    const count= await this.afterDelete(ndata.cnt, filter, options)

    if (options?.log!==false) {
      this.db.log.debug(`Deleted ${count} records`)
    }    

    return count
  }  
}

export default ModelPG