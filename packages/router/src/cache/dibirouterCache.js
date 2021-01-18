"use strict";

//
// TODO A real cache
//

const DIBIROUTER_CACHE = {
  'db'      : undefined,
  'models'  : {},
  'dibirouters': {},
}

class DibiRouterCache {

  getValue(key)  {
    return DIBIROUTER_CACHE[key]
  }

  setValue(key, value) {
    DIBIROUTER_CACHE[key]= value
  }

  getValueFromMap(key, name) {
    const source= DIBIROUTER_CACHE[key]

    if (Object.keys(source).length==0 || source[name]==undefined) {
      console.error(`${key}.${name} NOT FOUND!`)
      return undefined
    }
  
    const out= source[name]    
    return out
  }

  setValueToMap(key, name, value) {
    const source= DIBIROUTER_CACHE[key]
    source[name]= value
  }

}

const dibirouterCache= new DibiRouterCache()

export default dibirouterCache