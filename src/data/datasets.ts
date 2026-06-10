/**
 * AKShare TypeScript - 数据集工具
 *
 * 提供对内置数据文件的访问（如 cninfo.js, ths.js, crypto_info.zip）
 * 在 Python 版本中，这些文件通过 importlib.resources 加载
 * 在 TypeScript 版本中，这些文件作为静态资源或运行时下载
 */

import { httpGetText } from '../utils/httpClient';

/**
 * 同花顺 JS 解密脚本缓存
 */
let thsJsCache: string | null = null;

/**
 * 巨潮资讯 JS 解密脚本缓存
 */
let cninfoJsCache: string | null = null;

/**
 * 获取同花顺 JS 解密脚本内容
 *
 * 用于解码同花顺网站返回的加密数据
 *
 * @returns JS 脚本内容
 */
export async function get_ths_js(): Promise<string> {
  if (thsJsCache) {
    return thsJsCache;
  }

  // 尝试从 GitHub 获取原始 ths.js
  try {
    const url = 'https://raw.githubusercontent.com/akfamily/akshare/main/akshare/data/ths.js';
    thsJsCache = await httpGetText(url);
    return thsJsCache;
  } catch {
    // 如果无法获取，返回空字符串
    return '';
  }
}

/**
 * 获取巨潮资讯 JS 解密脚本内容
 *
 * 用于解码巨潮资讯网站返回的加密数据
 *
 * @returns JS 脚本内容
 */
export async function get_cninfo_js(): Promise<string> {
  if (cninfoJsCache) {
    return cninfoJsCache;
  }

  // 尝试从 GitHub 获取原始 cninfo.js
  try {
    const url = 'https://raw.githubusercontent.com/akfamily/akshare/main/akshare/data/cninfo.js';
    cninfoJsCache = await httpGetText(url);
    return cninfoJsCache;
  } catch {
    // 如果无法获取，返回空字符串
    return '';
  }
}

/**
 * 获取加密货币信息数据 URL
 *
 * 在 Python 版本中，crypto_info.zip 是一个包含加密货币信息的压缩文件
 * 在 TypeScript 版本中，我们直接返回 GitHub 上的文件 URL
 *
 * @returns crypto_info.zip 的下载 URL
 */
export function get_crypto_info_url(): string {
  return 'https://raw.githubusercontent.com/akfamily/akshare/main/akshare/data/crypto_info.zip';
}
