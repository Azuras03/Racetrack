import { defineConfig } from 'vite'

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