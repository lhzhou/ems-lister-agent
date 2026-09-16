/**
 * 中国邮政重点特快与调度系统 - 通用 API 请求客户端封装
 * 包含：基础配置、请求拦截（自动携带 Token）、响应拦截（统一业务状态码过滤）、超时控制与错误捕获
 */

import { getStoredToken, removeStoredToken } from "../utils/storage";

// 基础接口配置
const DEFAULT_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || "/api";
const DEFAULT_TIMEOUT = 15000; // 默认超时时间 15 秒

export interface RequestConfig extends Omit<RequestInit, "body"> {
  /** 基础路径覆盖 */
  baseUrl?: string;
  /** URL 查询参数对象 */
  params?: Record<string, any>;
  /** POST / PUT / PATCH 请求体数据 */
  data?: any;
  /** 超时毫秒数 (默认 15000ms) */
  timeout?: number;
  /** 是否跳过自动追加 Authorization Token (如登录、验证码接口) */
  skipAuth?: boolean;
  /** 自定义请求头 */
  headers?: Record<string, string>;
  /** 是否返回原始响应对象而不提取 data */
  rawResponse?: boolean;
}

/** 统一服务端返回结构 */
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  success?: boolean;
  timestamp?: number;
}

/** 自定义 API 异常类 */
export class ApiError extends Error {
  public status: number;
  public code?: number | string;
  public data?: any;

  constructor(message: string, status: number = 500, code?: number | string, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.data = data;
  }
}

/**
 * 序列化查询参数
 */
function buildQueryString(params?: Record<string, any>): string {
  if (!params) return "";
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      if (Array.isArray(value)) {
        value.forEach((val) => searchParams.append(key, String(val)));
      } else {
        searchParams.append(key, String(value));
      }
    }
  });
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
}

const inflightGets = new Map<string, Promise<unknown>>();
const recentGets = new Map<string, { at: number; value: Promise<unknown> }>();
const RECENT_GET_MS = 2000;

/**
 * 统一网络请求入口函数
 */
export async function request<T = any>(endpoint: string, config: RequestConfig = {}): Promise<T> {
  const {
    baseUrl = DEFAULT_BASE_URL,
    params,
    data,
    timeout = DEFAULT_TIMEOUT,
    skipAuth = false,
    headers: customHeaders = {},
    rawResponse = false,
    ...restConfig
  } = config;

  // 1. 构建完整 URL
  let fullUrl: string;
  if (endpoint.startsWith("http://") || endpoint.startsWith("https://")) {
    fullUrl = endpoint;
  } else if (endpoint.startsWith("/v1") || endpoint.startsWith("v1/")) {
    const path = `/${endpoint.replace(/^\/+/, "")}`;
    const apiBase = String(baseUrl || "").replace(/\/+$/, "");
    fullUrl = apiBase ? `${apiBase}${path}` : path;
  } else {
    // For other endpoints, if running in browser on HTTPS and baseUrl is HTTP,
    // use relative path to prevent mixed content blocking
    if (
      typeof window !== "undefined" &&
      window.location.protocol === "https:" &&
      baseUrl.startsWith("http://")
    ) {
      fullUrl = `/${endpoint.replace(/^\/+/, "")}`;
    } else {
      fullUrl = `${baseUrl.replace(/\/$/, "")}/${endpoint.replace(/^\//, "")}`;
    }
  }

  const queryString = buildQueryString(params);
  if (queryString) {
    fullUrl += fullUrl.includes("?") ? `&${queryString.slice(1)}` : queryString;
  }

  const method = String(restConfig.method || "GET").toUpperCase();
  const cacheKey = skipAuth ? fullUrl : `${fullUrl}\0${getStoredToken() ?? ""}`;
  if (method === "GET") {
    const recent = recentGets.get(cacheKey);
    if (recent && Date.now() - recent.at < RECENT_GET_MS) {
      return recent.value as Promise<T>;
    }
    const pending = inflightGets.get(cacheKey);
    if (pending) {
      return pending as Promise<T>;
    }
  }

  const pending = sendRequest<T>(fullUrl, {
    timeout,
    skipAuth,
    headers: customHeaders,
    rawResponse,
    data,
    ...restConfig,
  });
  if (method === "GET") {
    const shared = pending
      .then((value) => {
        recentGets.set(cacheKey, { at: Date.now(), value: Promise.resolve(value) });
        return value;
      })
      .finally(() => {
        inflightGets.delete(cacheKey);
      });
    inflightGets.set(cacheKey, shared);
    return shared;
  }
  return pending;
}

async function sendRequest<T>(fullUrl: string, config: RequestConfig): Promise<T> {
  const {
    timeout = DEFAULT_TIMEOUT,
    skipAuth = false,
    headers: customHeaders = {},
    rawResponse = false,
    data,
    ...restConfig
  } = config;

  // 2. 请求拦截器 - 设置 Headers 与 Token
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...customHeaders,
  };

  // 如果传了 data 且非 FormData，默认以 JSON 传输
  if (data !== undefined && !(data instanceof FormData)) {
    headers["Content-Type"] = "application/json;charset=UTF-8";
  }

  // 自动追加持久化 Token
  if (!skipAuth) {
    const token = getStoredToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  // 3. 超时控制 (AbortController)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeout);

  try {
    const response = await fetch(fullUrl, {
      ...restConfig,
      headers,
      body: data instanceof FormData ? data : data !== undefined ? JSON.stringify(data) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // 4. HTTP 状态码拦截与处理
    if (!response.ok) {
      const status = response.status;
      let errorMsg = `网络请求失败 (${status})`;
      let errorData: any = null;
      let errorCode: any = undefined;

      // 尝试解析服务端返回的错误信息
      try {
        const errorBody = await response.json();
        errorData = errorBody;
        if (errorBody?.message) {
          errorMsg = errorBody.message;
        }
        if (errorBody?.code) {
          errorCode = errorBody.code;
        }
      } catch {
        // 非 JSON 格式错误信息
        if (status === 401) {
          errorMsg = "登录凭证已失效或过期，请重新登录";
        } else if (status === 403) {
          errorMsg = "无权访问此受保护资源 (403 Forbidden)";
        } else if (status === 404) {
          errorMsg = "请求的服务接口不存在 (404 Not Found)";
        } else if (status >= 500) {
          errorMsg = "公司端服务响应异常，请稍后重试 (500)";
        }
      }

      if (status === 401 && !skipAuth) {
        removeStoredToken();
        window.dispatchEvent(new CustomEvent("auth:unauthorized"));
      }

      throw new ApiError(errorMsg, status, errorCode, errorData);
    }

    if (rawResponse) {
      return response as unknown as T;
    }

    // 5. 响应体解析与业务状态码统一判断
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const resData = await response.json();

      if (resData && typeof resData === "object") {
        // 服务端统一响应结构：包含 code 状态码
        if ("code" in resData) {
          const { code, message, data: payload } = resData as ApiResponse<T>;
          const isSuccess =
            code === 200 ||
            code === 0 ||
            code === 1 ||
            String(code).toLowerCase() === "ok" ||
            String(code).toLowerCase() === "success";

          if (isSuccess) {
            return (payload !== undefined ? payload : resData) as T;
          } else if (code === 401 || String(code).toUpperCase() === "UNAUTHORIZED") {
            removeStoredToken();
            window.dispatchEvent(new CustomEvent("auth:unauthorized"));
            throw new ApiError(message || "身份认证未通过或凭证已过期", 401, code, resData);
          } else {
            throw new ApiError(message || "请求执行失败", 400, code, resData);
          }
        }

        // 服务端显式返回 success: false
        if ("success" in resData && resData.success === false) {
          throw new ApiError(
            resData.message || resData.msg || "业务请求失败",
            400,
            undefined,
            resData,
          );
        }

        // 服务端包含错误标识 error
        if ("error" in resData && resData.error) {
          const msg = resData.message || resData.error_description || String(resData.error);
          throw new ApiError(msg, 400, undefined, resData);
        }
      }

      return resData as T;
    }

    // 非 JSON 响应（如文本、流等）
    const textData = await response.text();
    return textData as unknown as T;
  } catch (error: any) {
    clearTimeout(timeoutId);

    if (error.name === "AbortError") {
      throw new ApiError(`请求超时，未在 ${timeout / 1000} 秒内完成响应`, 408);
    }
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(error.message || "网络连接异常，请检查网络设置", 0);
  }
}

// 语法糖便捷方法封装
export const http = {
  get<T = any>(
    endpoint: string,
    params?: Record<string, any>,
    config?: Omit<RequestConfig, "params">,
  ): Promise<T> {
    return request<T>(endpoint, { ...config, method: "GET", params });
  },

  post<T = any>(endpoint: string, data?: any, config?: Omit<RequestConfig, "data">): Promise<T> {
    return request<T>(endpoint, { ...config, method: "POST", data });
  },

  put<T = any>(endpoint: string, data?: any, config?: Omit<RequestConfig, "data">): Promise<T> {
    return request<T>(endpoint, { ...config, method: "PUT", data });
  },

  patch<T = any>(endpoint: string, data?: any, config?: Omit<RequestConfig, "data">): Promise<T> {
    return request<T>(endpoint, { ...config, method: "PATCH", data });
  },

  delete<T = any>(
    endpoint: string,
    params?: Record<string, any>,
    config?: Omit<RequestConfig, "params">,
  ): Promise<T> {
    return request<T>(endpoint, { ...config, method: "DELETE", params });
  },
};

export default http;
