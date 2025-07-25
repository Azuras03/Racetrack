import { defineConfig } from 'vite'
import {
  dirname
  , resolve
} from 'node:path'
import {
  fileURLToPath
} from 'node:url'

export default defineConfig({
  server: {
    host: true,
    strictPort: true,
    port: 5174,
  },
  build: {
    minify: 'esbuild',
    sourcemap: false,
    cssCodeSplit: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        creator: resolve(__dirname, 'creator.html'),
      },
      output: {
        manualChunks: undefined,
      },
    },
    outDir: 'www',
    emptyOutDir: true,
  },
  base: './',
  optimizeDeps: {
  },
})