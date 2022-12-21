import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import postcss from 'rollup-plugin-postcss';
import copyStatic from '@axel669/rollup-copy-static';
import $path from '@axel669/rollup-dollar-path';


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
      $path({
        root: ".",
        paths: {
          $components: "src/client/components/index.js",
        },
        extensions: [".js", ".mjs", ".svelte", ".jsx"]
      }),
      commonjs(),
      resolve({ browser: true }),
      postcss(),
      copyStatic("static")
    ],
  },
  {
    input: 'src/client/api/api.js',
    output: {
      file: `www/omphalos-api.js`,
      format: 'iife',
      name: 'omphalos'
    },
    plugins: [
      commonjs(),
      resolve({ browser: true }),
    ]
  }
]
