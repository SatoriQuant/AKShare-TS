/**
 * AKShare TypeScript - 集思录 T+0 QDII 数据接口
 *
 * 对应 Python akshare/qdii/qdii_jsl.py
 * 集思录: https://www.jisilu.cn/data/qdii/#qdiie
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * QDII 欧美市场通用数据获取
 *
 * @param cookie 集思录登录 Cookie
 * @returns 欧美市场 QDII 数据
 */
async function fetchQdiiEData(cookie: string = ''): Promise<any[]> {
  const url = 'https://www.jisilu.cn/data/qdii/qdii_list/E';
  const params: Record<string, string> = {
    '___jsl': 'LST___t=1728207798534',
    rp: '22',
  };
  const headers: Record<string, string> = {};
  if (cookie) {
    headers['cookie'] = cookie;
  }

  const dataJson = await httpGet<any>(url, { params, headers });
  return dataJson.rows.map((item: any) => item.cell);
}

/**
 * QDII 亚洲市场通用数据获取
 *
 * @param cookie 集思录登录 Cookie
 * @returns 亚洲市场 QDII 数据
 */
async function fetchQdiiAData(cookie: string = ''): Promise<any[]> {
  const url = 'https://www.jisilu.cn/data/qdii/qdii_list/A';
  const params: Record<string, string> = {
    '___jsl': 'LST___t=1728206439242',
    rp: '22',
  };
  const headers: Record<string, string> = {};
  if (cookie) {
    headers['cookie'] = cookie;
  }

  const dataJson = await httpGet<any>(url, { params, headers });
  return dataJson.rows.map((item: any) => item.cell);
}

/**
 * 将原始数据转换为 DataFrame（欧美市场格式）
 */
function buildEuropeDataFrame(rows: any[]): DataFrame {
  const columns = [
    '代码', '名称', '现价', '涨幅', '成交', '场内份额', '场内新增',
    'T-2净值', '净值日期', 'T-1估值', '估值日期', 'T-1溢价率',
    '相关标的', 'T-1指数涨幅', '申购费', '赎回费', '托管费', '基金公司',
  ];

  const renameMap: Record<string, string> = {
    fund_id: '代码',
    fund_nm: '名称',
    price: '现价',
    increase_rt: '涨幅',
    volume: '成交',
    amount: '场内份额',
    amount_incr: '场内新增',
    fund_nav: 'T-2净值',
    nav_dt: '净值日期',
    estimate_value: 'T-1估值',
    last_est_dt: '估值日期',
    discount_rt: 'T-1溢价率',
    index_nm: '相关标的',
    ref_increase_rt: 'T-1指数涨幅',
    apply_fee: '申购费',
    redeem_fee: '赎回费',
    mt_fee: '托管费',
    issuer_nm: '基金公司',
  };

  const numericColumns = ['现价', '成交', '场内份额', '场内新增', 'T-2净值', 'T-1估值', '托管费'];
  const dateColumns = ['净值日期', '估值日期'];

  const data = rows.map(row => {
    return columns.map(col => {
      const originalKey = Object.keys(renameMap).find(k => renameMap[k] === col) || col;
      let value = row[originalKey];

      if (dateColumns.includes(col) && value) {
        // 保持日期字符串格式
        return value;
      }
      if (numericColumns.includes(col)) {
        const num = parseFloat(value);
        return isNaN(num) ? null : num;
      }
      return value;
    });
  });

  return createDataFrame(columns, data);
}

/**
 * 将原始数据转换为 DataFrame（亚洲市场格式）
 */
function buildAsiaDataFrame(rows: any[]): DataFrame {
  const columns = [
    '代码', '名称', '现价', '涨幅', '成交', '场内份额', '场内新增',
    '净值', '净值日期', '估值', '溢价率',
    '相关标的', '指数涨幅', '申购费', '赎回费', '托管费', '基金公司',
  ];

  const renameMap: Record<string, string> = {
    fund_id: '代码',
    fund_nm: '名称',
    price: '现价',
    increase_rt: '涨幅',
    volume: '成交',
    amount: '场内份额',
    amount_incr: '场内新增',
    fund_nav: '净值',
    nav_dt: '净值日期',
    estimate_value: '估值',
    discount_rt: '溢价率',
    index_nm: '相关标的',
    ref_increase_rt: '指数涨幅',
    apply_fee: '申购费',
    redeem_fee: '赎回费',
    mt_fee: '托管费',
    issuer_nm: '基金公司',
  };

  const numericColumns = ['现价', '成交', '场内份额', '场内新增', '净值', '估值', '托管费'];

  const data = rows.map(row => {
    return columns.map(col => {
      const originalKey = Object.keys(renameMap).find(k => renameMap[k] === col) || col;
      let value = row[originalKey];

      if (col === '净值日期' && value) {
        return value;
      }
      if (numericColumns.includes(col)) {
        const num = parseFloat(value);
        return isNaN(num) ? null : num;
      }
      return value;
    });
  });

  return createDataFrame(columns, data);
}

/**
 * 集思录-T+0 QDII-欧美市场-欧美指数
 *
 * https://www.jisilu.cn/data/qdii/#qdiia
 *
 * @param cookie 集思录登录 Cookie（可选，部分数据需要登录）
 * @returns 欧美指数 QDII 数据
 */
export async function qdii_e_index_jsl(cookie: string = ''): Promise<DataFrame> {
  const rows = await fetchQdiiEData(cookie);
  return buildEuropeDataFrame(rows);
}

/**
 * 集思录-T+0 QDII-欧美市场-商品
 *
 * https://www.jisilu.cn/data/qdii/#qdiia
 *
 * @param cookie 集思录登录 Cookie（可选）
 * @returns 欧美市场商品 QDII 数据
 */
export async function qdii_e_comm_jsl(cookie: string = ''): Promise<DataFrame> {
  const rows = await fetchQdiiEData(cookie);
  return buildEuropeDataFrame(rows);
}

/**
 * 集思录-T+0 QDII-亚洲市场-亚洲指数
 *
 * https://www.jisilu.cn/data/qdii/#qdiia
 *
 * @param cookie 集思录登录 Cookie（可选）
 * @returns 亚洲指数 QDII 数据
 */
export async function qdii_a_index_jsl(cookie: string = ''): Promise<DataFrame> {
  const rows = await fetchQdiiAData(cookie);
  return buildAsiaDataFrame(rows);
}
