# 平台端 corporation 开发规范（V2）

本文件只约束 `corporation/`（9082 平台端）。不约束 `admin/`、`client/`、`api/`。用户当前指令优先。

运行事实写在工作区 [`.codex/memory.md`](../.codex/memory.md)。本文件写：**这个项目怎么组织、页面怎么写、以后按什么阶段做。**

## 当前项目

- 产品：邮政重点邮件平台端。Vite + React + Tailwind + Zustand + Bun。开发入口 `bun`/`pnpm` 脚本，Express `server.ts` 托管前端。
- 浏览器直连 corporation API `8082`（`VITE_API_BASE_URL`），不经 9082 代理。
- 认证走 `/v1/auth/*`。生产菜单走 `GET /v1/menus`（`server=corporation`），禁止再写死侧栏数组。
- 已注册业务页：看板 `/dashboard`、订单管理 `/orders`。动态菜单 `href` 必须命中 `src/routers/route-registry.ts`，未注册不生成页面。
- 列表/详情契约以 8082 OpenAPI 为准，不凭空造接口。当前稳定接口：`GET /v1/dashboard`、`GET /v1/waybills`、`GET /v1/waybills/{id}/detail`、`GET /v1/stagnant-waybills`、`GET /v1/anomalies`、`GET /v1/menus`。

## 目标

把现有 `App.tsx` 壳层升级成可复用工作台：侧栏、顶栏、页面容器、多标签、主题、认证/菜单适配器。业务页进 `src/pages`，业务请求进 `src/api`，HTTP 客户端进 `src/lib/request.ts`。参考 Ant Design Pro 的布局和路由元数据思路，实现仍用本仓库技术栈，不引入 Umi / Ant Design Pro。

工程：Vite 构建；Bun 跑脚本和测试；Oxc（`oxfmt` / `oxlint --deny-warnings`）管格式和静态检查。UI 库：Ant Design（`antd`），入口已接 `ConfigProvider` 中文与主色 `#00703C`。可选：`nprogress`、`ali-oss`、Markdown 编辑器。密钥只来自本地 env，不用 `VITE_` 暴露秘密。

非目标：假登录、假接口成功、行业模型进 shared、菜单字符串直接当组件、把本规范抄到其他端。

## 以后目录怎么写

```text
types/
src/
  app/            入口、Provider、品牌
  api/           按领域拆的业务 API（auth / dashboard / waybills / menus）
  assets/
  components/
    Layout/       顶栏、侧栏、标签栏、页面壳
    Form/         全局表单控件（Input、Select、Table、Pagination 等）
    Waybill/      跨页运单详情
  constants/
  hooks/
  interceptors/   请求拦截事件（不写业务规则）
  layouts/        壳层导出入口；实现在 components/Layout
  pages/<name>/
    index.tsx     页面主体，不要再套一层 *-page.tsx
    components/   <page>-search.tsx / <page>-table.tsx / <page>-form.tsx（按需）
    model/        types.ts / data.ts（按需）
    hooks/        仅复杂页
  routers/        route-registry、文件路由、鉴权边界
  stores/         Zustand，含 workspace-store
  lib/            通用工具：HTTP 客户端、本地存储、声音、轨迹计算
  shared/         仅跨模块底层契约（暂未接入）
env/
scripts/
test/           全部测试，按源码目录镜像
```

落地：

- 跨模块导入用 `@/`（`@` 指向仓库根）：`import type { WorkspaceTab } from "@/types/workspace"`。同目录/同模块内部仍用 `./`。
- 页面不得 `fetch`、不得直接读写 Token、不得拼接业务 URL。
- 跨页类型进 `types/`，跨页 Hook 进 `src/hooks`，跨页状态进 `src/stores`。页面 Hook 不进 `model/`。

## 架构

```text
main.tsx → AppProviders
  Theme / AuthAdapter / NavigationAdapter / WorkspaceStore
  → DashboardShell（Sidebar + Topbar + PageTabs + PageContainer）
      → 当前路由页面
```

路由负责渲染哪一页；工作区负责哪些页以标签打开。侧栏、前进后退、直接 URL 必须走同一套同步，避免标签和地址栏分叉。

路由逐步切 `vite-plugin-pages`。页面用 YAML route block 声明布局/标题/权限/标签；复杂转换只放 `src/routers`。只保留这一套文件路由。

```ts
type RouteMeta = {
  title: string
  icon?: React.ComponentType
  permission?: string
  tab?: { closable?: boolean; keepAlive?: boolean }
}
```

`permission` 只做前端展示；真实权限在 8082。`keepAlive` 默认关。

## 页面怎么写

1. 先对 8082 契约，不造登录/菜单/业务接口。
2. 新页：`bun run page:create <name> --dry-run`，确认后再生成；覆盖必须 `--force`。
3. 列表：搜索 Card + 表格 Card；表格必须用 `src/components/Form/Table.tsx`（封装 Ant Design Table），页面只填列和数据。查看/编辑默认右侧 Drawer；短确认才用 Dialog。
4. 必须有 loading / empty / error / retry。
5. Demo 只在数据层切换，页面不维护两套请求。
6. 认证只用适配器。菜单只用数据库，映射已注册路由。

当前页对照：

| 菜单 code | 路由 | 页面职责 |
| --- | --- | --- |
| `portal.dashboard` | `/dashboard` | 看板 |
| `portal.orders` | `/orders` | 订单索引，对齐管理端 `GET /v1/waybills` |

## 多标签（壳层能力，不是业务页）

- 打开已注册页建标签；再进同一页只激活。
- 关当前：先右后左；可关闭标签都关完回看板（`closable: false`）。
- 操作：关当前 / 其他 / 右侧 / 全部、刷新当前（只重挂当前路由）。
- Store：`src/stores/workspace-store.ts`，persist 只存 `tabs` + `activeId`，带版本号。禁止存 Token、业务响应、表单敏感字段。登录/权限变化清空或重校验。
- 标签 ID = 规范化 pathname + 页面声明过的 search。未注册 href → 不可用，不执行组件。
- 第一阶段路由切换即卸载。列表状态用现有 GET 去重或后续 React Query，不要为标签复制请求。

## 视觉

64px 顶栏 + 其下 40px 标签栏。当前标签用主色或指示线。标题来自元数据，过长截断 + Tooltip。WCAG AA：`role="tablist"/"tab"`、`aria-selected`、可见焦点。

## 阶段（按序做，不要一次做完）

1. **壳层**：补齐 registry、`PageContainer`、`PageTabs`、`workspace-store`；看板和订单保持可用。
2. **交互**：打开/关闭/批量关闭/刷新、前进后退、404、权限变化、移动端、键盘。
3. **工程**：`page:create` 带元数据；页面状态和测试；Oxc 门禁。
4. **可选**：少量 `keepAlive`、拖拽、固定标签——基础关闭/恢复稳定后再做。

## 门禁（在 corporation/ 执行）

```bash
bun run format
bun run format:check
bun test test
bun run lint
bun run build
git diff --check
```

构建通过 ≠ 浏览器/API/库/OSS 验收通过。CI 只检查、不改文件。

## 工作方式

改前看 git status，保留无关改动。一次一个任务。未经要求不提交、不推送、不改其他端。
