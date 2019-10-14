import typescript from 'rollup-plugin-typescript2'

export default {
  input: 'src/index.ts',
  output: {
    format: 'es', //Type of output (amd, cjs, esm, iife, umd)
    dir: 'dist' //Directory for chunks (if absent, prints to stdout)
  },
  plugins: [typescript()],
  external: ['mobx-state-tree', 'mobx']
}
