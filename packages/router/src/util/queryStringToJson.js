export function queryStringToJson(url) {     
  let search= url.indexOf('?')>=0 ? url.substr(url.indexOf('?')) : ''
  if (search && search!='?') {
    let pairs = search.slice(1).split('&')
    
    let result = {}
    pairs.forEach(function(pair) {
        pair = pair.split('=')
        const name= pair[0]
        const value= pair[1]

        result[name] = decodeURIComponent(value || '')
    })
    return JSON.parse(JSON.stringify(result))
  }
  return {}
}


export default queryStringToJson