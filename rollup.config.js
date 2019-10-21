import babel from 'rollup-plugin-babel'

export default {
  input: 'src/index.js',
  output: {
    format: 'es', //Type of output (amd, cjs, esm, iife, umd)
    dir: 'dist' //Directory for chunks (if absent, prints to stdout)
  },
  plugins: [babel()],
  external: ['mobx-state-tree', 'mobx']
}
