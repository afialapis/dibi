"use strict";

import {getConnection} from 'dibiconn'


function createDb(dbOrConfig) {
  if (dbOrConfig.constructor.name.indexOf('DibiConn')>=0) {
    return dbOrConfig
  }

  const dibiDB= getConnection(dbOrConfig)
  return dibiDB
}

export {createDb}