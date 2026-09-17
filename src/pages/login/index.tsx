/** @route
meta:
  layout: auth
  title: 登录
*/

import React, { useState } from "react";
import { Checkbox } from "antd";
import {
  Lock,
  User,
  AlertCircle,
  Truck,
  Shield,
  Server,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
} from "lucide-react";
import { UserInfo } from "@/src/types/express";
import { authApi } from "@/src/api";
import { Button, Input, Password } from "@/src/components/Form";
import { removeStoredToken } from "@/src/lib/storage";

interface LoginPageProps {
  onLogin: (user: UserInfo, token: string) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  // 表单输入
  const [account, setAccount] = useState<string>("商丘-虞城县");
  const [password, setPassword] = useState<string>("123123123");

  // UI 状态
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [showServerConfig, setShowServerConfig] = useState<boolean>(false);
  const [backendUrl] = useState<string>(
    (import.meta as any).env?.VITE_API_BASE_URL || "http://39.107.75.132:8902",
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!account.trim()) {
      setErrorMessage("请输入登录账号");
      return;
    }
    if (!password) {
      setErrorMessage("请输入登录密码");
      return;
    }

    setIsLoading(true);

    try {
      // 1. 调用公司端真实认证接口 POST /v1/auth/login
      const loginData = await authApi.login({
        login: account.trim(),
        password: password,
      });

      // 严格校验 access_token：必须存在且非空，绝不放行空凭证！
      if (
        !loginData ||
        !loginData.access_token ||
        typeof loginData.access_token !== "string" ||
        !loginData.access_token.trim()
      ) {
        throw new Error("鉴权未通过：服务端未返回有效授权令牌 (access_token)，拒绝进入系统");
      }

      const token = loginData.access_token.trim();

      // 2. 尝试获取公司当前身份信息 GET /v1/auth/me
      let identity: any = loginData.user || loginData.account || {};
      try {
        const meRes = await authApi.getMe();
        if (meRes && (meRes.login || meRes.name || meRes.id)) {
          identity = { ...identity, ...meRes };
        }
      } catch (meErr) {
        console.warn("获取当前公司端身份信息兜底:", meErr);
      }

      // 3. 尝试拉取名下关联租户 GET /v1/corporation/tenants?page=1&size=20
      let tenantItems: any[] = [];
      try {
        const tenantsRes = await authApi.getTenants(1, 20);
        tenantItems = tenantsRes.list || tenantsRes.items || [];
      } catch (tenantErr) {
        console.warn("查询公司名下租户异常:", tenantErr);
      }

      // 4. 解析角色与账号信息 (仅限 customer, customer_admin, customer_member)
      const rawRole = identity.role_type || identity.role || "customer_admin";
      const roleDisplayName =
        rawRole === "customer_admin"
          ? "客户管理员"
          : rawRole === "customer_member"
            ? "客户业务专员"
            : rawRole === "customer"
              ? "公司端认证客户"
              : rawRole;

      const fullUser: UserInfo = {
        empId: String(identity.login || identity.id || account.trim()),
        name: identity.name || identity.company_name || identity.login || account.trim(),
        role: roleDisplayName,
        department: identity.company_name || "中国邮政速递物流·企业专席",
        phone: identity.phone || "11183",
        avatarUrl:
          identity.avatar ||
          "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80",
        lastLoginTime: new Date().toLocaleString(),
        token: token,
        tokenExpiresAt: loginData.expires_at || Date.now() + 7 * 24 * 60 * 60 * 1000,
        tokenType: loginData.token_type || "Bearer",
        serviceAccountId: identity.service_account_id,
        companyName: identity.company_name,
        tenants: tenantItems,
      };

      setSuccessMessage("公司端身份鉴权成功，正在接入调度控制台...");
      setTimeout(() => {
        onLogin(fullUser, token);
      }, 400);
    } catch (err: any) {
      console.error("登录认证接口调用异常:", err);
      // 登录失败：绝不调用 onLogin，并立即清除本地可能存在的旧 Token
      removeStoredToken();

      // 依公司端接口规范处理错误状态
      // 400: 请求字段缺失或格式不正确
      // 401: Token 无效、账号状态不可用，或账号不属于客户平台 (customer/customer_admin/customer_member)
      // 503/502: 依赖服务不可用或后端服务未启动
      let msg = err.message || "登录失败，请核对账号与密码";

      if (err.message === "Failed to fetch") {
        msg = `网络连接异常 (Failed to fetch)，请确认服务地址 (${backendUrl}) 是否可连通`;
      } else if (err.status === 401 || err.code === "UNAUTHORIZED" || err.code === 401) {
        msg =
          err.data?.message ||
          err.message ||
          "账号或密码错误，或该账号不属于客户平台 (仅限 customer / customer_admin / customer_member)";
      } else if (err.status === 400) {
        msg = err.data?.message || "请求字段缺失或格式不正确，请检查账号与密码输入";
      } else if (err.status === 502 || err.status === 503) {
        msg = `后端服务 (${backendUrl}) 连接失败: ${err.message || "服务异常，请确认后端已启动"}`;
      } else if (err.status === 504) {
        msg = `连接服务超时 (8秒)，请确认服务地址 (${backendUrl}) 是否可连通`;
      } else if (err.status === 404) {
        msg = `登录接口路由不存在 (404 Not Found)，请确认服务地址配置: ${backendUrl}`;
      }

      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col justify-between overflow-hidden bg-primary-dark text-on-surface">
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-10">
        <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full border-[40px] border-white/20"></div>
        <div className="absolute top-1/2 -left-60 h-[700px] w-[700px] rounded-full border-[60px] border-white/20"></div>
      </div>

      <header className="z-10 flex w-full items-center justify-between px-6 py-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold tracking-wide text-white">中国邮政</span>
            <span className="rounded-full bg-gold-bg px-2 py-0.5 text-xs font-semibold text-gold">
              公司端
            </span>
          </div>
          <p className="font-mono text-[11px] tracking-wider text-white/70">
            CHINA POST EXPRESS & LOGISTICS
          </p>
        </div>
        <div className="hidden text-xs font-medium text-white/80 sm:flex">客服热线: 11183</div>
      </header>

      <div className="z-10 flex flex-1 items-center justify-center px-4 py-8">
        <div className="w-full max-w-md overflow-hidden rounded-xl border border-outline bg-surface shadow-modal">
          <div className="bg-primary px-7 py-6 text-center text-on-primary">
            <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-white/20 bg-white/10">
              <Truck className="h-6 w-6 text-[#ffb95f]" aria-hidden="true" />
            </div>
            <h2 className="text-xl font-semibold tracking-tight">邮件监控系统</h2>
          </div>

          <div className="p-6">
            {errorMessage && (
              <div className="mb-4 flex items-start gap-2 rounded-lg border border-[#ffccc7] bg-alert-error-bg p-3 text-xs text-error">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
                <div className="flex-1">
                  <div className="font-semibold">登录未通过</div>
                  <div className="mt-0.5 leading-relaxed text-[11px]">{errorMessage}</div>
                </div>
              </div>
            )}

            {successMessage && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-primary-border bg-alert-success-bg p-3 text-xs text-primary">
                <CheckCircle2 className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="flex items-center justify-between text-xs font-semibold text-on-surface">
                  <span>登录账号</span>
                  <span className="font-normal text-on-surface-disabled">系统账号</span>
                </label>
                <Input
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                  placeholder="请输入登录账号"
                  autoComplete="username"
                  prefix={<User className="h-4 w-4 text-on-surface-disabled" aria-hidden="true" />}
                />
              </div>

              <div className="space-y-1.5">
                <label className="flex items-center justify-between text-xs font-semibold text-on-surface">
                  <span>登录密码</span>
                  <span className="font-normal text-on-surface-disabled">安全密文传输</span>
                </label>
                <Password
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入登录密码"
                  autoComplete="current-password"
                  prefix={<Lock className="h-4 w-4 text-on-surface-disabled" aria-hidden="true" />}
                />
              </div>

              <div className="pt-1 text-xs text-on-surface-variant">
                <Checkbox checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)}>
                  记住账号并保持登录
                </Checkbox>
              </div>

              <Button type="primary" htmlType="submit" loading={isLoading} block className="mt-2">
                {isLoading ? "正在验证登录身份..." : "登录邮件监控系统"}
              </Button>
            </form>

            <div className="mt-4 border-t border-outline-variant pt-3">
              <button
                type="button"
                onClick={() => setShowServerConfig(!showServerConfig)}
                className="flex w-full items-center justify-between py-1 text-[11px] text-on-surface-variant transition-colors hover:text-on-surface"
              >
                <span className="flex items-center gap-1.5 font-mono">
                  <Server className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                  <span>接口服务监听: POST /v1/auth/login</span>
                </span>
                {showServerConfig ? (
                  <ChevronUp className="h-3.5 w-3.5" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" />
                )}
              </button>

              {showServerConfig && (
                <div className="mt-2 space-y-2 rounded-lg border border-outline bg-surface-container p-3 text-xs">
                  <div>
                    <div className="text-[11px] font-medium text-on-surface-variant">
                      服务监听地址 (server.corporation.address)
                    </div>
                    <div className="mt-0.5 rounded-[6px] border border-outline bg-surface p-1.5 font-mono text-[11px] text-on-surface">
                      {backendUrl}
                    </div>
                  </div>
                  <div className="text-[10px] leading-relaxed text-on-surface-variant">
                    说明：根据文档规范，所有受保护接口使用{" "}
                    <code className="rounded bg-outline-variant px-1 text-on-surface">
                      Authorization: Bearer &lt;access_token&gt;
                    </code>
                    ；邮政工作平台账号和平台管理员禁止通过公司端登录。
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-outline-variant bg-surface-container px-6 py-3 text-[11px] text-on-surface-variant">
            <span className="flex items-center gap-1">
              <Shield className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              <span>TLS 1.3 传输加密 / Bearer Token</span>
            </span>
            <span>中国邮政客户平台</span>
          </div>
        </div>
      </div>

      <footer className="z-10 w-full border-t border-white/10 py-4 text-center text-xs text-white/70">
        <p>中国邮政集团有限公司速递物流部 · 重点特快客户平台管理中心</p>
        <p className="mt-0.5 text-[11px] text-white/40">
          Copyright © 2026 CHINA POST EXPRESS & LOGISTICS. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
}
