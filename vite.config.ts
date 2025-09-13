import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      // 配置路径别名
      "@": resolve(__dirname, "src"),
    },
  },
  build: {
    // 生产构建配置
    outDir: "dist", // 输出目录
    assetsDir: "assets", // 静态资源目录
    sourcemap: true, // 生成 sourcemap
    minify: "esbuild", // 压缩方式
  },
  server: {
    port: 3000,
  },
  define: {
    __API_URL__: JSON.stringify("https://cloud-service.seave.top"),
  },
});
