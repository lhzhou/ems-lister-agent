import { ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ConfigProvider
      locale={zhCN}
      input={{ allowClear: true }}
      select={{ allowClear: true }}
      theme={{
        token: {
          colorPrimary: "#00703C",
          borderRadius: 8,
        },
        components: {
          Table: {
            headerBg: "#fafaf9",
            headerColor: "#78716c",
            headerSplitColor: "#e7e5e4",
            rowHoverBg: "#fafaf9",
            borderColor: "#f5f5f4",
            cellPaddingBlockSM: 10,
            cellPaddingInlineSM: 12,
            fontSize: 12,
          },
        },
      }}
    >
      <App />
    </ConfigProvider>
  </StrictMode>,
);
