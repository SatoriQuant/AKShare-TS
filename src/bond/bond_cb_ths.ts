/**
 * AKShare TypeScript - 同花顺可转债数据接口
 * 同花顺-数据中心-可转债
 * https://data.10jqka.com.cn/ipo/bond/
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 获取同花顺可转债数据
 * https://data.10jqka.com.cn/ipo/bond/
 */
export async function bond_zh_cov_info_ths(): Promise<DataFrame> {
  const url = 'https://data.10jqka.com.cn/ipo/kzz/';

  try {
    const data = await httpGet<any>(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36',
      },
    });

    if (!data?.list) {
      return createDataFrame([], []);
    }

    const columns = [
      '债券代码', '债券简称', '申购日期', '申购代码', '原股东配售码',
      '每股获配额', '计划发行量', '实际发行量', '中签公布日', '中签号',
      '上市日期', '正股代码', '正股简称', '转股价格', '到期时间', '中签率'
    ];

    const rows = data.list.map((item: any) => [
      item.bond_code,
      item.bond_name,
      item.sub_date,
      item.sub_code,
      item.share_code,
      parseFloat(item.quota) || null,
      parseFloat(item.plan_total) || null,
      parseFloat(item.issue_total) || null,
      item.sign_date,
      item.number,
      item.listing_date,
      item.code,
      item.name,
      parseFloat(item.price) || null,
      item.expire_date,
      parseFloat(item.success_rate) || null,
    ]);

    return createDataFrame(columns, rows);
  } catch (error) {
    return createDataFrame([], []);
  }
}

/**
 * 东方财富网-数据中心-新股数据-可转债详情
 * https://data.eastmoney.com/kzz/detail/123121.html
 */
export async function bond_zh_cov_info(symbol: string = '123121', indicator: string = '基本信息'): Promise<DataFrame> {
  const indicatorMap: Record<string, string> = {
    '基本信息': 'RPT_BOND_CB_LIST',
    '中签号': 'RPT_CB_BALLOTNUM',
    '筹资用途': 'RPT_BOND_BS_OPRFINVESTITEM',
    '重要日期': 'RPT_CB_IMPORTANTDATE',
  };
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const reportName = indicatorMap[indicator] ?? 'RPT_BOND_CB_LIST';
  const params: Record<string, string> = {
    reportName,
    columns: 'ALL',
    quoteColumns: 'f2~01~CONVERT_STOCK_CODE~CONVERT_STOCK_PRICE,f235~10~SECURITY_CODE~TRANSFER_PRICE,f236~10~SECURITY_CODE~TRANSFER_VALUE,f2~10~SECURITY_CODE~CURRENT_BOND_PRICE,f237~10~SECURITY_CODE~TRANSFER_PREMIUM_RATIO,f239~10~SECURITY_CODE~RESALE_TRIG_PRICE,f240~10~SECURITY_CODE~REDEEM_TRIG_PRICE,f23~01~CONVERT_STOCK_CODE~PBV_RATIO',
    quoteType: '0',
    source: 'WEB',
    client: 'WEB',
    filter: `(SECURITY_CODE="${symbol}")`,
    _: String(Date.now()),
  };
  if (indicator !== '基本信息') {
    params.quoteColumns = '';
  }
  try {
    // 使用 responseType text 获取原始文本，保留数字的小数格式
    const axios = (await import('axios')).default;
    const resp = await axios.get(url, { params, timeout: 30000, responseType: 'text' });
    const rawText: string = resp.data;
    const data = JSON.parse(rawText);
    if (!data?.result?.data) return createDataFrame([], []);
    const records = data.result.data;
    if (!Array.isArray(records) || records.length === 0) return createDataFrame([], []);
    const columns = Object.keys(records[0]);
    // 从原始 JSON 文本中提取每条记录的数字，保留小数格式
    const dataStart = rawText.indexOf('"data":[');
    if (dataStart < 0) return createDataFrame([], []);
    const dataSection = rawText.slice(dataStart);
    // 提取每条记录的原始 JSON 文本
    const recordRegex = /\{[^{}]*\}/g;
    const recordStrs: string[] = [];
    let m: RegExpExecArray | null;
    while ((m = recordRegex.exec(dataSection)) !== null) {
      if (recordStrs.length >= records.length) break;
      recordStrs.push(m[0]);
    }
    const stringRows: string[][] = records.map((item: any, idx: number) => {
      const itemRaw = recordStrs[idx] ?? '';
      return columns.map((k) => {
        const v = item[k];
        if (v === null || v === undefined) return '';
        if (typeof v === 'number') {
          // 从原始 JSON 中查找该字段的数字格式
          const regex = new RegExp(`"${k}":([-0-9.eE+]+)`);
          const match = itemRaw.match(regex);
          return match ? match[1] : String(v);
        }
        return String(v);
      });
    });
    return createDataFrame(columns, stringRows);
  } catch { return createDataFrame([], []); }
}
