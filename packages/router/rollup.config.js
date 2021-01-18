import autoExternal from 'rollup-plugin-node-externals'
import replace from '@rollup/plugin-replace'
import babel from '@rollup/plugin-babel'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import { terser } from 'rollup-plugin-terser'

import packageJSON from './package.json'

const NODE_ENV = 'production'
const minifyExtension = pathToFile => pathToFile.replace(/\.js$/, '.min.js');
const input = './src/index.js';


const baseCfg= (output, withReplace, withTerser) => {
  let plugins= [
    autoExternal(),
  ]
  if (withReplace) {
    plugins.push(
      replace({
        'process.env.NODE_ENV': JSON.stringify(NODE_ENV)
      })      
    )
  }
  plugins= plugins.concat([
    babel({
      exclude: 'node_modules/**',
      /*https://github.com/rollup/plugins/tree/master/packages/babel#babelhelpers*/
      babelHelpers: 'bundled'
    }),
    resolve(),
    commonjs()  
  ])
  if (withTerser) {
    plugins.push(
      terser()
    )
  }

  return {
    input: input,
    output: output,
    //external: ['dibiorm', 'koa-router'],
    plugins: plugins  
  }
}

module.exports = [
  //
  // CommonJs
  //
  baseCfg({
    file: packageJSON.cjs,
    format: 'cjs',
    exports: 'named'
  }, false, false),
  baseCfg({
    file: minifyExtension(packageJSON.cjs),
    format: 'cjs',
    exports: 'named'
  }, false, true),
  //
  // ES modules
  //
  baseCfg({
    file: packageJSON.module,
    format: 'es',
    exports: 'named'
  }, true, false),
  baseCfg({
    file: minifyExtension(packageJSON.module),
    format: 'es',
    exports: 'named'
  }, true, true)
]
