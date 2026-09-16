# 拦截器边界

401 清登录态由 `src/lib/request.ts` 派发 `auth:unauthorized`（见 `auth.ts`）。业务接口从 `src/api` 接入，页面不直接 `fetch`。
