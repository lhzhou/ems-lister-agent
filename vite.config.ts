import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  // 加载 env 目录中的环境变量
  const env = loadEnv(mode, path.resolve(__dirname, 'env'), '');

  // 自定义 host: 优先读取环境变量 VITE_HOST / HOST，默认 '0.0.0.0' 以同时输出 Local 与 Network 局域网访问地址
  const host = process.env.VITE_HOST || env.VITE_HOST || process.env.HOST || '0.0.0.0';

  // 自定义 port: 优先读取环境变量 VITE_PORT / PORT，默认 9081
  const port = Number(process.env.VITE_PORT || env.VITE_PORT || process.env.PORT || 9081);

  // 严格端口检查与自动打开配置
  const strictPort = (process.env.VITE_STRICT_PORT || env.VITE_STRICT_PORT) === 'true';
  const open = (process.env.VITE_OPEN || env.VITE_OPEN) === 'true';

  // 后端代理目标地址 (默认指向公司端真实接口服务 8902)
  const backendTarget = process.env.VITE_API_BASE_URL || env.VITE_API_BASE_URL || 'http://39.107.75.132:8902';

  return {
    envDir: 'env',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      host: host === 'true' ? true : host,
      port,
      strictPort,
      open,
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      // 本地开发代理：转发 /v1 接口至实际公司端后端服务器
      proxy: {
        '/v1': {
          target: backendTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    preview: {
      host: host === 'true' ? true : host,
      port,
      strictPort,
      open,
    },
  };
});
