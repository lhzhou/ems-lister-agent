# 工作台 V2 迁移记录

| 能力                 | 状态        | 说明                                                                                             |
| -------------------- | ----------- | ------------------------------------------------------------------------------------------------ |
| Bun/Vite 基线        | in-progress | 已声明 Bun 1.4、质量脚本；依赖已安装，待完成构建验证。                                           |
| V2 目录与适配器边界  | verified    | 已创建 `types`、`apis`、`interceptors`、`layouts`、`pages`、`routers`、`stores` 与 shared 契约。 |
| 路由注册与 Hash 路由 | in-progress | 已提供受控注册表及 tab ID 规范化；现有 EMS App 尚未切换到文件路由。                              |
| 多标签工作区         | in-progress | 已提供持久化 Zustand Store、schema 版本、上限和纯逻辑测试；现有组件仍在兼容实现上运行。          |
| 页面迁移             | planned     | 按 EMS 业务页面逐页迁移，迁移后再删除旧目录。                                                    |
| 真实认证/API/OSS     | in-progress | 保留现有项目适配；未改变契约、未发布。                                                           |

## 旧目录映射

| 当前路径                         | V2 目标                                | 处理方式                                                          |
| -------------------------------- | -------------------------------------- | ----------------------------------------------------------------- |
| `src/api`                        | `src/apis` + `src/shared/request`      | `src/apis/index.ts` 提供兼容出口；待领域接口分批移动。            |
| `src/utils`                      | `src/shared/lib` / `src/shared/config` | 先保留存储和声音实现，避免认证与本地数据回归。                    |
| `src/types`                      | 根目录 `types` / 页面 `model`          | 新增跨模块 `types/workspace.ts`；EMS 领域类型等待页面迁移后拆分。 |
| `src/components/*View.tsx`       | `src/pages/<page>/`                    | 逐页迁移，迁移期间不删除原文件。                                  |
| `src/components/MultiTabBar.tsx` | `src/layouts/PageTabs.tsx`             | 现有组件继续服务，下一阶段迁移并接入 Store。                      |

## 质量门禁迁移边界

`oxlint` 当前只检查 V2 核心和未归档区域。`src/App.tsx`、`src/components`、`src/api`、`src/utils`、`src/data`、`src/types` 及 `server.ts` 是既有兼容实现，包含与本次迁移无关的历史警告；它们仍由全项目 `tsc --noEmit` 检查。页面逐步迁移后，应从 `.oxlintrc.json` 移除对应豁免，直至全仓库严格检查。
