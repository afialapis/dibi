import autoExternal from 'rollup-plugin-node-externals'
import replace from '@rollup/plugin-replace'
import babel from '@rollup/plugin-babel'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import nodePolyfills from 'rollup-plugin-node-polyfills'

const NODE_ENV = 'development'

export default {
  input: 'test/index.js',
  output: {
    file: 'test/bundle.js',
    format: 'cjs',
    name: 'DibiOrm' 
  },
  plugins: [
    autoExternal(),
    replace({
      'process.env.NODE_ENV': JSON.stringify(NODE_ENV)
    }),
    babel({
      exclude: 'node_modules/**',
      /*https://github.com/rollup/plugins/tree/master/packages/babel#babelhelpers*/
      babelHelpers: 'bundled'
    }),
    resolve(/*{
      browser: true,
      preferBuiltins: false
    }*/),
    commonjs(/*{
      esmExternals: ['pg-promise'],
      include: 'node_modules/**',
    }*/),
    nodePolyfills()
  ],
  //external: ['dibiorm', 'koa-router']
}
