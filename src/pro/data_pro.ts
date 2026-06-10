/**
 * AKShare TypeScript - Pro API 初始化接口
 *
 * 对应 Python akshare/pro/data_pro.py
 * 通过 Token 初始化 Pro API 客户端
 */

import { DataApi } from './client';

// 全局 Token 存储
let globalToken: string = '';

/**
 * 设置 Pro API Token
 *
 * @param token API Token 凭证码
 */
export function setProToken(token: string): void {
  globalToken = token;
}

/**
 * 设置 Pro API Token（兼容别名）
 */
export function set_token(token: string): void {
  setProToken(token);
}

/**
 * 获取当前 Pro API Token
 */
export function getProToken(): string {
  return globalToken;
}

/**
 * 获取当前 Pro API Token（兼容别名）
 */
export function get_token(): string {
  return getProToken();
}

/**
 * 初始化 Pro API 客户端
 *
 * 第一次可以通过 setProToken('your token') 来记录自己的 token 凭证
 * 临时 token 可以通过本参数传入
 *
 * @param token API Token 凭证码，如果为空则使用全局 Token
 * @returns DataApi 客户端实例
 * @throws Error 如果 Token 未设置
 */
export function proApi(token: string = ''): DataApi {
  const effectiveToken = token || globalToken;

  if (effectiveToken && effectiveToken !== '') {
    return new DataApi(effectiveToken);
  } else {
    throw new Error(
      'api init error. 请设置 AKShare pro 的 token 凭证码，如果没有权限，请访问 https://qhkch.com/ 注册申请'
    );
  }
}

/**
 * 初始化 Pro API 客户端（兼容别名）
 */
export function pro_api(token: string = ''): DataApi {
  return proApi(token);
}
