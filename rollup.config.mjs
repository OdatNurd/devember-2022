import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import postcss from 'rollup-plugin-postcss';
import copyStatic from '@axel669/rollup-copy-static';


export default [
  {
    input: 'src/client/app.js',
    output: {
      file: `www/app.js`,
      format: 'iife',
      name: 'app',
    },
    plugins: [
      svelte({}),
      commonjs(),
      resolve({ browser: true }),
      postcss(),
      copyStatic("static")
    ],
  },
]
