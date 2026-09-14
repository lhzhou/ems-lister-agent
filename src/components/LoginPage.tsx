import React, { useState } from 'react';
import { 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle, 
  RefreshCw,
  Truck,
  ShieldCheck,
  Shield,
  Building2,
  Server,
  ChevronDown,
  ChevronUp,
  CheckCircle2
} from 'lucide-react';
import { UserInfo } from '../types/express';
import { authApi } from '../api/auth';
import { removeStoredToken } from '../utils/storage';

interface LoginPageProps {
  onLogin: (user: UserInfo, token: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  // 表单输入
  const [account, setAccount] = useState<string>('商丘-虞城县');
  const [password, setPassword] = useState<string>('123123123');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  
  // UI 状态
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [showServerConfig, setShowServerConfig] = useState<boolean>(false);
  const [backendUrl, setBackendUrl] = useState<string>((import.meta as any).env?.VITE_API_BASE_URL || 'http://39.107.75.132:8902');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!account.trim()) {
      setErrorMessage('请输入公司登录账号');
      return;
    }
    if (!password) {
      setErrorMessage('请输入登录密码');
      return;
    }

    setIsLoading(true);

    try {
      // 1. 调用公司端真实认证接口 POST /v1/auth/login
      const loginData = await authApi.login({
        login: account.trim(),
        password: password
      });

      // 严格校验 access_token：必须存在且非空，绝不放行空凭证！
      if (!loginData || !loginData.access_token || typeof loginData.access_token !== 'string' || !loginData.access_token.trim()) {
        throw new Error('鉴权未通过：服务端未返回有效授权令牌 (access_token)，拒绝进入系统');
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
        console.warn('获取当前公司端身份信息兜底:', meErr);
      }

      // 3. 尝试拉取名下关联租户 GET /v1/corporation/tenants?page=1&size=20
      let tenantItems: any[] = [];
      try {
        const tenantsRes = await authApi.getTenants(1, 20);
        tenantItems = tenantsRes.list || tenantsRes.items || [];
      } catch (tenantErr) {
        console.warn('查询公司名下租户异常:', tenantErr);
      }

      // 4. 解析角色与账号信息 (仅限 customer, customer_admin, customer_member)
      const rawRole = identity.role_type || identity.role || 'customer_admin';
      const roleDisplayName = 
        rawRole === 'customer_admin' ? '客户管理员' :
        rawRole === 'customer_member' ? '客户业务专员' :
        rawRole === 'customer' ? '公司端认证客户' : rawRole;

      const fullUser: UserInfo = {
        empId: String(identity.login || identity.id || account.trim()),
        name: identity.name || identity.company_name || identity.login || account.trim(),
        role: roleDisplayName,
        department: identity.company_name || '中国邮政速递物流·企业专席',
        phone: identity.phone || '11183',
        avatarUrl: identity.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
        lastLoginTime: new Date().toLocaleString(),
        token: token,
        tokenExpiresAt: loginData.expires_at || (Date.now() + 7 * 24 * 60 * 60 * 1000),
        tokenType: loginData.token_type || 'Bearer',
        serviceAccountId: identity.service_account_id,
        companyName: identity.company_name,
        tenants: tenantItems
      };

      setSuccessMessage('公司端身份鉴权成功，正在接入调度控制台...');
      setTimeout(() => {
        onLogin(fullUser, token);
      }, 400);

    } catch (err: any) {
      console.error('公司端登录接口失败:', err);
      // 登录失败：绝不调用 onLogin，并立即清除本地可能存在的旧 Token
      removeStoredToken();
      
      // 依公司端接口规范处理错误状态
      // 400: 请求字段缺失或格式不正确
      // 401: Token 无效、账号状态不可用，或账号不属于客户平台 (customer/customer_admin/customer_member)
      // 503/502: 依赖服务不可用或后端服务未启动
      let msg = err.message || '登录失败，请核对账号与密码';
      
      if (err.status === 401 || err.code === 'UNAUTHORIZED' || err.code === 401) {
        msg = err.data?.message || err.message || '账号或密码错误，或该账号不属于客户平台 (仅限 customer / customer_admin / customer_member)';
      } else if (err.status === 400) {
        msg = err.data?.message || '请求字段缺失或格式不正确，请检查账号与密码输入';
      } else if (err.status === 502 || err.status === 503) {
        msg = `公司端服务 (${backendUrl}) 连接失败: ${err.message || '后端服务异常，请确认后端已启动'}`;
      } else if (err.status === 504) {
        msg = `连接公司端服务超时 (8秒)，请确认服务地址 (${backendUrl}) 是否可连通`;
      } else if (err.status === 404) {
        msg = `公司端登录接口路由不存在 (404 Not Found)，请确认服务地址配置: ${backendUrl}`;
      }

      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#003819] via-[#005a30] to-[#002410] flex flex-col justify-between text-stone-800 selection:bg-[#00703C] selection:text-white relative overflow-hidden">
      {/* Background Decorative Circles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full border-[40px] border-white/20"></div>
        <div className="absolute top-1/2 -left-60 w-[700px] h-[700px] rounded-full border-[60px] border-white/20"></div>
      </div>

      {/* Top Navbar */}
      <header className="w-full px-6 py-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-lg border border-emerald-300/40">
            <span className="text-xl font-black text-[#00703C] tracking-tighter">EMS</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-extrabold text-white tracking-wide drop-shadow-sm">中国邮政</span>
              <span className="text-xs bg-[#F9B200] text-stone-900 font-bold px-1.5 py-0.5 rounded shadow-xs flex items-center gap-1">
                <Building2 className="w-3 h-3" />
                公司端
              </span>
            </div>
            <p className="text-[11px] text-emerald-200/90 tracking-wider font-mono">CHINA POST EXPRESS & LOGISTICS</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-4 text-xs text-emerald-100/90 font-medium">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>Profile: corporation (8902)</span>
          </span>
          <span className="text-emerald-500">|</span>
          <span>客服热线: 11183</span>
        </div>
      </header>

      {/* Center Login Box */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 z-10">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-100 overflow-hidden">
          {/* Header of Login Card */}
          <div className="bg-gradient-to-r from-[#005f32] to-[#00703C] px-7 py-6 text-white text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 mb-3 shadow-inner">
              <Truck className="w-6 h-6 text-[#F9B200]" />
            </div>
            <h2 className="text-xl font-bold tracking-tight">重点特快查询系统 · 公司端</h2>
            <p className="text-xs text-emerald-100/90 mt-1">
              客户平台专属通道 (customer / customer_admin / customer_member)
            </p>
          </div>

          {/* Form Content */}
          <div className="p-7">
            {/* Error Alert */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500 mt-0.5" />
                <div className="flex-1">
                  <div className="font-semibold text-red-800">登录未通过</div>
                  <div className="text-[11px] text-red-600 mt-0.5 leading-relaxed">{errorMessage}</div>
                </div>
              </div>
            )}

            {/* Success Alert */}
            {successMessage && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Account / Work ID */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 flex items-center justify-between">
                  <span>公司登录账号 (login)</span>
                  <span className="text-[11px] text-stone-400 font-normal">客户平台账号</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={account}
                    onChange={(e) => setAccount(e.target.value)}
                    placeholder="请输入公司端客户账号 (如 customer_admin)"
                    required
                    className="w-full pl-10 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00703C] focus:bg-white transition-all font-mono"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 flex items-center justify-between">
                  <span>登录密码 (password)</span>
                  <span className="text-[11px] text-stone-400 font-normal">安全密文传输</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="请输入公司端登录密码"
                    required
                    className="w-full pl-10 pr-10 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00703C] focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
                    title={showPassword ? '隐藏密码' : '显示密码'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between text-xs text-stone-600 pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded text-[#00703C] focus:ring-[#00703C]"
                  />
                  <span>记住账号并保持登录 (Bearer Token)</span>
                </label>
                <span className="text-emerald-700 text-[11px] font-medium">Profile: corporation</span>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-[#00703C] hover:bg-[#005a30] text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 mt-2"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>正在进行公司端身份认证...</span>
                  </>
                ) : (
                  <>
                    <span>登录公司端平台</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Server & API Config Accordion */}
            <div className="mt-4 pt-3 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setShowServerConfig(!showServerConfig)}
                className="w-full flex items-center justify-between text-[11px] text-stone-500 hover:text-stone-700 transition-colors py-1"
              >
                <span className="flex items-center gap-1.5 font-mono">
                  <Server className="w-3.5 h-3.5 text-[#00703C]" />
                  <span>接口服务监听: POST /v1/auth/login</span>
                </span>
                {showServerConfig ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showServerConfig && (
                <div className="mt-2 p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-2">
                  <div>
                    <div className="text-[11px] text-stone-500 font-medium">服务监听地址 (server.corporation.address)</div>
                    <div className="font-mono text-[11px] text-stone-800 mt-0.5 p-1.5 bg-white border border-stone-200 rounded">
                      {backendUrl}
                    </div>
                  </div>
                  <div className="text-[10px] text-stone-500 leading-relaxed">
                    说明：根据文档规范，所有受保护接口使用 <code className="bg-stone-200 px-1 rounded text-stone-800">Authorization: Bearer &lt;access_token&gt;</code>；邮政工作平台账号和平台管理员禁止通过公司端登录。
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Security Notice */}
          <div className="px-7 py-3 bg-stone-50 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
            <span className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-[#00703C]" />
              <span>TLS 1.3 传输加密 / Bearer Token</span>
            </span>
            <span>中国邮政客户平台</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-xs text-emerald-100/70 z-10 border-t border-emerald-800/40">
        <p>中国邮政集团有限公司速递物流部 · 重点特快客户平台管理中心</p>
        <p className="text-[11px] text-emerald-200/50 mt-0.5">
          Copyright © 2026 CHINA POST EXPRESS & LOGISTICS. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
};
