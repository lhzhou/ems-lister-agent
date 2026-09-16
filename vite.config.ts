import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { defineConfig, loadEnv } from "vite";

/**
 * 环境变量分层加载与覆盖机制：
 * 1. 首先读取默认基础配置：env/.env
 * 2. 接着依次读取扩展与当前模式配置：env/.env.local, env/.env.[mode], env/env.[mode], env/.env.[mode].local
 * 3. 若后续配置文件中存在与 .env 重复的键，则直接覆盖基础 .env 中的同名配置
 */
function loadLayeredEnv(mode: string, envDir: string): Record<string, string> {
  const mergedEnv: Record<string, string> = {};
  const loadTrace: string[] = [];

  // 1. 先读取基础默认配置 .env
  const baseEnvPath = path.join(envDir, ".env");
  if (fs.existsSync(baseEnvPath) && fs.statSync(baseEnvPath).isFile()) {
    try {
      const baseParsed = dotenv.parse(fs.readFileSync(baseEnvPath, "utf-8"));
      Object.assign(mergedEnv, baseParsed);
      loadTrace.push(`.env (${Object.keys(baseParsed).length} 个变量)`);
    } catch (err: any) {
      console.warn(`[Env] 解析基础配置文件 .env 失败:`, err.message);
    }
  }

  // 2. 依次读取其他配置，用于覆盖基础配置中的重复项
  const overrideFiles = [
    path.join(envDir, ".env.local"),
    path.join(envDir, `.env.${mode}`),
    path.join(envDir, `env.${mode}`),
    path.join(envDir, `.env.${mode}.local`),
  ];

  for (const filePath of overrideFiles) {
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      try {
        const parsed = dotenv.parse(fs.readFileSync(filePath, "utf-8"));
        const overwrittenKeys = Object.keys(parsed).filter((k) => k in mergedEnv);
        Object.assign(mergedEnv, parsed);
        const fileName = path.basename(filePath);
        loadTrace.push(
          `${fileName} (共 ${Object.keys(parsed).length} 项${
            overwrittenKeys.length ? `，覆盖基础配置: ${overwrittenKeys.join(", ")}` : ""
          })`,
        );
      } catch (err: any) {
        console.warn(`[Env] 解析扩展配置文件 ${path.basename(filePath)} 失败:`, err.message);
      }
    }
  }

  console.log(`\n[Env 配置加载流程]`);
  console.log(`  加载顺序: ${loadTrace.join(" ➔ ")}`);

  return mergedEnv;
}

export default defineConfig(({ mode }) => {
  const envDir = path.resolve(__dirname, "env");

  // 1. 执行用户指定的层级加载：基础 .env 先读，其他配置覆盖基础配置
  const customEnv = loadLayeredEnv(mode, envDir);

  // 2. 结合 Vite 原生 loadEnv，确保所有 VITE_ 前缀环境变量完整就绪
  const viteEnv = loadEnv(mode, envDir, "");
  const env = { ...customEnv, ...viteEnv };

  // 同步覆盖至 process.env，方便 Node 运行时与 Vite 插件随时读取
  for (const [key, value] of Object.entries(env)) {
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }

  // 自定义 host: 优先读取环境变量 VITE_HOST / HOST，默认 '0.0.0.0' 以同时输出 Local 与 Network 局域网访问地址
  const host = process.env.VITE_HOST || env.VITE_HOST || process.env.HOST || "0.0.0.0";

  // 自定义 port: 优先读取环境变量 VITE_PORT / PORT，默认 9081
  const port = Number(process.env.VITE_PORT || env.VITE_PORT || process.env.PORT || 9081);

  // 严格端口检查与自动打开配置
  const strictPort = (process.env.VITE_STRICT_PORT || env.VITE_STRICT_PORT) === "true";
  const open = (process.env.VITE_OPEN || env.VITE_OPEN) === "true";

  // 后端代理目标地址 (默认指向公司端真实接口服务 8902)
  const backendTarget =
    process.env.VITE_API_BASE_URL || env.VITE_API_BASE_URL || "http://39.107.75.132:8902";

  return {
    envDir: "env",
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
      },
    },
    server: {
      host: host === "true" ? true : host,
      port,
      strictPort,
      open,
      hmr: process.env.DISABLE_HMR !== "true",
      watch: process.env.DISABLE_HMR === "true" ? null : {},
      // 本地开发代理：转发 /v1 接口至实际公司端后端服务器
      proxy: {
        "/v1": {
          target: backendTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    preview: {
      host: host === "true" ? true : host,
      port,
      strictPort,
      open,
    },
  };
});
