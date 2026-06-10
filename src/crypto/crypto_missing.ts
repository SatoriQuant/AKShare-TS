/**
 * AKShare TypeScript - crypto missing interfaces
 */

import { httpGet } from '../utils/httpClient';
import { createDataFrame, DataFrame } from '../utils/dataframe';

function toNum(v: any): number | null {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v); return Number.isFinite(n) ? n : null;
}

/**
 * Jin10 - crypto spot prices
 */
export async function crypto_js_spot(): Promise<DataFrame> {
  const url = 'https://datacenter-api.jin10.com/crypto_currency/list';
  try {
    const data = await httpGet<any>(url, {
      headers: {
        'x-app-id': 'rU6QIu7JHe2gOUeR',
        'x-csrf-token': 'x-csrf-token',
        'x-version': '1.0.0',
        'User-Agent': 'Mozilla/5.0',
      },
    });
    const list = data?.data ?? [];
    const columns = ['\u5e02\u573a', '\u4ea4\u6613\u54c1\u79cd', '\u6700\u8fd1\u62a5\u4ef7', '\u6da8\u8dcc\u989d', '\u6da8\u8dcc\u5e45', '24\u5c0f\u65f6\u6700\u9ad8', '24\u5c0f\u65f6\u6700\u4f4e', '24\u5c0f\u65f6\u6210\u4ea4\u91cf', '\u66f4\u65b0\u65f6\u95f4'];
    const rows = list.map((item: any) => [
      item.market ?? '', item.name ?? '',
      toNum(item.close ?? item.price), toNum(item.chg),
      toNum(item.change_rate ?? item.pct_chg),
      toNum(item.high), toNum(item.low), toNum(item.volume),
      String(item.reported_at ?? item.updated_at ?? ''),
    ]);
    return createDataFrame(columns, rows);
  } catch { return createDataFrame([], []); }
}

/**
 * Jin10 - Bitcoin holdings report
 */
export async function crypto_bitcoin_hold_report(): Promise<DataFrame> {
  const url = 'https://datacenter-api.jin10.com/bitcoin_treasuries/list';
  try {
    const axios = (await import('axios')).default;
    const resp = await axios.get(url, {
      headers: { 'X-App-Id': 'lnFP5lxse24wPgtY', 'X-Version': '1.0.0' },
      timeout: 30000,
      responseType: 'text',
    });
    const rawText: string = resp.data;
    // \u5c06 JSON \u4e2d\u7684\u6574\u6570\u8f6c\u4e3a\u6d6e\u70b9\u6570\u683c\u5f0f\uff0c\u5339\u914d Python \u7684 str(np.float64) \u8f93\u51fa
    // \u5339\u914d :\u6570\u5b57 \u548c [,\u6570\u5b57\uff08\u6570\u7ec4\u4e2d\u7684\u6570\u5b57\uff09\uff0c\u4f46\u4e0d\u5f71\u54cd\u5b57\u7b26\u4e32\u503c
    const processed = rawText.replace(/([:\[,])(-?[0-9]+)(?=[,\]}])/g, '$1$2.0');
    const data = JSON.parse(processed);
    const values = data?.data?.values ?? [];
    if (!values.length) return createDataFrame([], []);

    const columns = [
      '\u4ee3\u7801', '\u516c\u53f8\u540d\u79f0-\u82f1\u6587', '\u516c\u53f8\u540d\u79f0-\u4e2d\u6587',
      '\u56fd\u5bb6/\u5730\u533a', '\u5e02\u503c', '\u6bd4\u7279\u5e01\u5360\u5e02\u503c\u6bd4\u91cd',
      '\u6301\u4ed3\u6210\u672c', '\u6301\u4ed3\u5360\u6bd4', '\u6301\u4ed3\u91cf',
      '\u5f53\u65e5\u6301\u4ed3\u5e02\u503c', '\u67e5\u8be2\u65e5\u671f', '\u516c\u544a\u94fe\u63a5',
      '\u5206\u7c7b', '\u500d\u6570',
    ];
    const rows = values.map((row: any[]) => {
      const fmtNum = (v: any): string => {
        if (v === null || v === undefined) return '';
        const n = Number(v);
        if (!Number.isFinite(n)) return '';
        // \u5339\u914d Python \u7684 str(np.float64) \u8f93\u51fa
        // np.float64 \u7684 str() \u8868\u793a\uff1a\u6574\u6570\u663e\u793a .0\uff0c\u6d6e\u70b9\u6570\u4fdd\u7559\u5408\u7406\u7cbe\u5ea6
        if (Number.isInteger(n)) return n + '.0';
        // \u622a\u65ad\u5230\u5408\u7406\u7cbe\u5ea6\uff0c\u907f\u514d\u6d6e\u70b9\u8bef\u5dee
        const s = n.toFixed(10).replace(/0+$/, '').replace(/\.$/, '.0');
        return s;
      };
      return [
        row[0] ?? '', row[1] ?? '', row[15] ?? '',
        row[2] ?? '', fmtNum(row[3]), fmtNum(row[4]),
        fmtNum(row[5]), fmtNum(row[6]), fmtNum(row[7]),
        fmtNum(row[8]), row[9] ? String(row[9]).slice(0, 10) : '', row[10] ?? '',
        row[12] ?? '', fmtNum(row[13]),
      ];
    });
    return createDataFrame(columns, rows);
  } catch { return createDataFrame([], []); }
}
