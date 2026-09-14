/**
 * 公司端 API (Corporation API) 客户端实现
 * 
 * 契约规范：
 * - 服务监听配置: server.corporation.address (8902), 认证 Profile: corporation
 * - 认证方式: Authorization: Bearer <access_token>
 * - 账号限制: 必须是客户平台账号 (customer、customer_admin 或 customer_member)
 */

import { http, ApiError } from './request';
import { saveStoredToken, removeStoredToken, getStoredToken } from '../utils/storage';

/** 公司登录请求参数 */
export interface CorporationLoginParams {
  login: string;
  password: string;
}

/** 公司登录统一响应结构中 data 字段 */
export interface CorporationLoginData {
  access_token: string;
  token_type?: string; // 如 "Bearer"
  expires_at?: string | number; // 过期时间
  user?: {
    id?: string | number;
    login?: string;
    name?: string;
    role?: string;
    role_type?: 'customer' | 'customer_admin' | 'customer_member' | string;
    status?: string;
    phone?: string;
    service_account_id?: string;
    company_name?: string;
    [key: string]: any;
  };
  account?: {
    id?: string | number;
    login?: string;
    name?: string;
    role?: string;
    service_account_id?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

/** 当前身份响应结构 */
export interface CorporationIdentity {
  id?: string | number;
  login?: string;
  name?: string;
  role?: string;
  role_type?: 'customer' | 'customer_admin' | 'customer_member' | string;
  status?: string;
  service_account_id?: string;
  company_name?: string;
  phone?: string;
  email?: string;
  [key: string]: any;
}

/** 租户信息项 */
export interface CorporationTenantItem {
  id: string | number;
  name: string;
  code?: string;
  service_account_id?: string;
  status?: string | number;
  created_at?: string;
  [key: string]: any;
}

/** 租户列表查询结果 */
export interface CorporationTenantListResult {
  list?: CorporationTenantItem[];
  items?: CorporationTenantItem[];
  total?: number;
  page?: number;
  size?: number;
  [key: string]: any;
}

export const authApi = {
  /**
   * 公司端登录
   * POST /v1/corporation/auth/login
   * Body: {"login":"公司登录账号","password":"登录密码"}
   */
  async login(params: CorporationLoginParams): Promise<CorporationLoginData> {
    const payload = {
      login: params.login.trim(),
      password: params.password
    };

    // 发起登录请求（跳过旧 token 注入）
    const res = await http.post<any>('/v1/corporation/auth/login', payload, {
      skipAuth: true
    });

    // 兼容统一响应结构与裸数据结构
    const data: CorporationLoginData = res?.data !== undefined ? res.data : res;

    // 严格检查：必须返回有效对象且包含 access_token，若无则抛出异常阻止后续执行
    if (!data || typeof data !== 'object' || !data.access_token || typeof data.access_token !== 'string' || !data.access_token.trim()) {
      const errorMsg = (data && (data.message || data.msg || data.error)) || '登录认证失败：服务端未返回有效授权令牌 (access_token)';
      throw new ApiError(errorMsg, 401, data?.code || 'NO_TOKEN', data);
    }

    saveStoredToken(data.access_token);
    return data;
  },

  /**
   * 获取当前身份
   * GET /v1/corporation/auth/me
   * Authorization: Bearer <access_token>
   */
  async getMe(): Promise<CorporationIdentity> {
    const res = await http.get<any>('/v1/corporation/auth/me');
    return (res?.data !== undefined ? res.data : res) as CorporationIdentity;
  },

  /**
   * 退出登录
   * POST /v1/corporation/auth/logout
   * Authorization: Bearer <access_token>
   */
  async logout(): Promise<{ success: boolean; message?: string }> {
    try {
      const res = await http.post<any>('/v1/corporation/auth/logout');
      return res?.data !== undefined ? res.data : res;
    } finally {
      removeStoredToken();
    }
  },

  /**
   * 查询公司名下租户
   * GET /v1/corporation/tenants?page=1&size=20
   * Authorization: Bearer <access_token>
   * 接口仅返回 ems_customers.service_account_id 等于当前公司账号 ID 的租户，默认 20 条，最大 100 条
   */
  async getTenants(page: number = 1, size: number = 20): Promise<CorporationTenantListResult> {
    const clampedSize = Math.min(Math.max(size, 1), 100);
    const res = await http.get<any>('/v1/corporation/tenants', {
      page,
      size: clampedSize
    });
    return (res?.data !== undefined ? res.data : res) as CorporationTenantListResult;
  },

  /**
   * 辅助方法：检查本地是否存在已保存的 Bearer Token
   */
  hasValidToken(): boolean {
    const token = getStoredToken();
    return !!token && token.trim().length > 0;
  }
};
