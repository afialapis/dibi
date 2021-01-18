import queryStringToJson from '../util/queryStringToJson'


const createDibiRouter = (model) => {

  class DibiRouter {  
    constructor() {
      this.name= model.name
      this.model= model
    }

    async read(ctx) {
      const params = queryStringToJson(ctx.request.url)
      // TODO : handle transactions
      const options= {transaction: undefined}
      const data = await this.model.read(params, options)
      ctx.body = { result: data }
    }
    
    async key_list(ctx) {
      // TODO : handle transactions
      const params = queryStringToJson(ctx.request.url)
      const options= {transaction: undefined}
      const data = await this.model.keyList(params, options)    
      ctx.body = { result: data }
    }
    
    async find(ctx) {    
      const params = queryStringToJson(ctx.request.url)
      // TODO : handle transactions
      const options= {transaction: undefined}    
      const data = await this.model.find(params.id, options)
      ctx.body = { result: data }
    }

    async distinct(ctx) {
      const params = queryStringToJson(ctx.request.url)
      // TODO : handle transactions
      const options= {transaction: undefined}
      const data = await this.model.distinct(params.distinct_field, params, options)
      ctx.body = { result: data }
    }
    
    async save(ctx) {
      const uid = ctx.headers['user-id']
      const params = ctx.request.fields
      params.created_by = uid
      // TODO : handle transactions
      const options= {transaction: undefined}
      const data = await this.model.insert(params, options)
      ctx.body= { result: data }
    }
    
    async update(ctx) {
      const uid = ctx.headers['user-id']
      const params = ctx.request.fields
      params.last_update_by = uid
      // TODO : handle transactions
      const options= {transaction: undefined}    
      const data = await this.model.update(params, {id: params.id}, options)
      ctx.body= { result: data }
    }
    
    async remove(ctx) {
      //const uid = ctx.headers['user-id']
      const params = ctx.request.fields
      // TODO : handle transactions
      const options= {transaction: undefined}    
      const data = await this.model.delete({id: params.id}, options)
      ctx.body = { result: data }
    }

    attachTo(router, path, avoid) {
      if (avoid==undefined)
        avoid= []
      
      if (avoid.indexOf('find')<0) 
        router.get (`${path}/find`     , ctx => this.find(ctx))
      if (avoid.indexOf('read')<0)
        router.get (`${path}/read`     , ctx => this.read(ctx))
      if (avoid.indexOf('distinct')<0)
        router.get (`${path}/distinct` , ctx => this.distinct(ctx))
      if (avoid.indexOf('save')<0)
        router.post(`${path}/save`     , ctx => this.save(ctx))
      if (avoid.indexOf('update')<0)
        router.post(`${path}/update`   , ctx => this.update(ctx))
      if (avoid.indexOf('remove')<0)
        router.post(`${path}/remove`   , (ctx) => this.remove(ctx))
      if (avoid.indexOf('key_list')<0)
        router.get (`${path}/key_list` , (ctx) => this.key_list(ctx))    
    }
    
  }
  
  return new DibiRouter()
}

export default createDibiRouter