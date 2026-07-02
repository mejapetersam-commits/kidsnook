import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  nitro: true,
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: {
    build: {
      rollupOptions: {
        output: {
          chunkFileNames: `assets/[name]-[hash]-${Date.now()}.js`,
          entryFileNames: `assets/[name]-[hash]-${Date.now()}.js`,
        },
      },
    },
  },
});
