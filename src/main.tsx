import { App as AntApp, ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { CONTROL_SIZE } from "@/src/app/control-size";
import { antdTheme } from "@/src/app/theme";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ConfigProvider
      locale={zhCN}
      componentSize={CONTROL_SIZE}
      input={{ allowClear: true }}
      select={{ allowClear: true }}
      form={{ requiredMark: true }}
      theme={antdTheme}
    >
      <AntApp>
        <App />
      </AntApp>
    </ConfigProvider>
  </StrictMode>,
);
