/** 401 清登录态由 `src/lib/request.ts` 派发 `auth:unauthorized`；页面只监听事件，不读 Token。 */
export const AUTH_UNAUTHORIZED_EVENT = "auth:unauthorized";
