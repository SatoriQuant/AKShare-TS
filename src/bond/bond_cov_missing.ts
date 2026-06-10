/**
 * AKShare TypeScript - bond cov missing interfaces
 */

import { httpGet, httpGetText } from '../utils/httpClient';
import { decodeSinaData } from '../utils/jsDecode';
import { createDataFrame, DataFrame } from '../utils/dataframe';
import { get_cninfo_js } from '../data/datasets';
import * as vm from 'vm';

function toNum(v: any): number | null {
  const n = Number(v); return Number.isFinite(n) ? n : null;
}

async function getCninfoEncKey(): Promise<string> {
  try {
    const jsCode = await get_cninfo_js();
    const ctx: any = {};
    vm.createContext(ctx);
    vm.runInContext(jsCode, ctx);
    return ctx.getResCode1?.() ?? '';
  } catch { return ''; }
}

/**
 * bond_zh_hs_cov_daily - Sina convertible bond daily history
 */
export async function bond_zh_hs_cov_daily(symbol: string = 'sh010107'): Promise<DataFrame> {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '_');
  const url = `https://finance.sina.com.cn/realstock/company/${symbol}/hisdata/klc_kl.js?d=${today}`;
  try {
    const text = await httpGetText(url, {
      headers: { Referer: 'https://finance.sina.com.cn/bond/' },
    });
    const encoded = text.split('=')[1]?.split(';')[0]?.replace(/"/g, '');
    if (!encoded) return createDataFrame([], []);
    const decoded: any[] = decodeSinaData(encoded);
    if (!decoded.length) return createDataFrame([], []);
    const columns = ['date', 'open', 'high', 'low', 'close', 'volume'];
    const rows = decoded.map((item: any) => {
      const d = item.date instanceof Date ? item.date.toISOString().slice(0, 10) : String(item.date ?? '');
      return [d, toNum(item.open), toNum(item.high), toNum(item.low), toNum(item.close), toNum(item.volume)];
    }).sort((a, b) => String(a[0]).localeCompare(String(b[0])));
    return createDataFrame(columns, rows);
  } catch { return createDataFrame([], []); }
}

/**
 * bond_zh_hs_cov_min - EM convertible bond minute data
 */
export async function bond_zh_hs_cov_min(
  symbol: string = 'sz128039',
  period: string = '15',
  adjust: string = '',
  start_date: string = '1979-09-01 09:32:00',
  end_date: string = '2222-01-01 09:32:00',
): Promise<DataFrame> {
  const marketMap: Record<string, string> = { 'sh': '1', 'sz': '0' };
  const marketId = marketMap[symbol.slice(0, 2)] ?? '0';
  const pureCode = symbol.slice(2);
  const adjustMap: Record<string, string> = { '': '0', 'qfq': '1', 'hfq': '2' };

  try {
    if (period === '1') {
      const params = {
        secid: `${marketId}.${pureCode}`,
        fields1: 'f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f11,f12,f13',
        fields2: 'f51,f52,f53,f54,f55,f56,f57,f58',
        iscr: '0', iscca: '0',
        ut: 'f057cbcbce2a86e2866ab8877db1d059',
        ndays: '1',
      };
      const data = await httpGet<any>('https://push2.eastmoney.com/api/qt/stock/trends2/get', { params });
      const trends: string[] = data?.data?.trends ?? [];
      const cols = ['\u65f6\u95f4', '\u5f00\u76d8', '\u6536\u76d8', '\u6700\u9ad8', '\u6700\u4f4e', '\u6210\u4ea4\u91cf', '\u6210\u4ea4\u989d', '\u6700\u65b0\u4ef7'];
      const rows = trends.map((s) => {
        const p = s.split(',');
        return [p[0], toNum(p[1]), toNum(p[2]), toNum(p[3]), toNum(p[4]), toNum(p[5]), toNum(p[6]), toNum(p[7])];
      }).filter((r) => String(r[0]) >= start_date && String(r[0]) <= end_date);
      return createDataFrame(cols, rows);
    }
    const params = {
      secid: `${marketId}.${pureCode}`,
      ut: '7eea3edcaed734bea9cbfc24409ed989',
      fields1: 'f1,f2,f3,f4,f5,f6',
      fields2: 'f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61',
      klt: period, fqt: adjustMap[adjust] ?? '0',
      beg: '0', end: '20500000',
    };
    const data = await httpGet<any>('https://push2his.eastmoney.com/api/qt/stock/kline/get', { params });
    const klines: string[] = data?.data?.klines ?? [];
    const cols = ['\u65f6\u95f4', '\u5f00\u76d8', '\u6536\u76d8', '\u6700\u9ad8', '\u6700\u4f4e', '\u6210\u4ea4\u91cf', '\u6210\u4ea4\u989d', '\u632f\u5e45', '\u6da8\u8dcc\u5e45', '\u6da8\u8dcc\u989d', '\u6362\u624b\u7387'];
    const rows = klines.map((s) => { const p = s.split(','); return [p[0], toNum(p[1]), toNum(p[2]), toNum(p[3]), toNum(p[4]), toNum(p[5]), toNum(p[6]), toNum(p[7]), toNum(p[8]), toNum(p[9]), toNum(p[10])]; })
      .filter((r) => String(r[0]) >= start_date && String(r[0]) <= end_date);
    return createDataFrame(cols, rows);
  } catch { return createDataFrame([], []); }
}

/**
 * bond_zh_hs_cov_pre_min - EM convertible bond pre-market minute data
 */
export async function bond_zh_hs_cov_pre_min(symbol: string = 'sh113570'): Promise<DataFrame> {
  const marketMap: Record<string, string> = { 'sh': '1', 'sz': '0' };
  const marketId = marketMap[symbol.slice(0, 2)] ?? '0';
  const pureCode = symbol.slice(2);
  try {
    const params = {
      secid: `${marketId}.${pureCode}`,
      fields1: 'f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f11,f12,f13',
      fields2: 'f51,f52,f53,f54,f55,f56,f57,f58',
      ndays: '1', iscr: '1', iscca: '0',
    };
    const data = await httpGet<any>('https://push2.eastmoney.com/api/qt/stock/trends2/get', { params });
    const trends: string[] = data?.data?.trends ?? [];
    const cols = ['\u65f6\u95f4', '\u5f00\u76d8', '\u6536\u76d8', '\u6700\u9ad8', '\u6700\u4f4e', '\u6210\u4ea4\u91cf', '\u6210\u4ea4\u989d', '\u6700\u65b0\u4ef7'];
    const rows = trends.map((s) => { const p = s.split(','); return [p[0], toNum(p[1]), toNum(p[2]), toNum(p[3]), toNum(p[4]), toNum(p[5]), toNum(p[6]), toNum(p[7])]; });
    return createDataFrame(cols, rows);
  } catch { return createDataFrame([], []); }
}

/**
 * bond_zh_cov_value_analysis - convertible bond value analysis
 */
export async function bond_zh_cov_value_analysis(symbol: string = '113527'): Promise<DataFrame> {
  try {
    const data = await httpGet<any>('https://datacenter-web.eastmoney.com/api/data/get', {
      params: {
        sty: 'ALL',
        token: '894050c76af8597a853f5b408b759f5d',
        st: 'date',
        sr: '1',
        source: 'WEB',
        type: 'RPTA_WEB_KZZ_LS',
        filter: `(zcode="${symbol}")`,
        p: '1',
        ps: '8000',
      },
    });
    const list = data?.result?.data ?? [];
    if (!list.length) return createDataFrame([], []);
    const rawCols = Object.keys(list[0]);
    // 按 Python 版本的列映射重命名并筛选
    const colMapping: Record<string, string> = {};
    const targetCols = ['日期', '收盘价', '纯债价值', '转股价值', '纯债溢价率', '转股溢价率'];
    rawCols.forEach((k, i) => {
      const names = ['日期', '', '', '转股价值', '纯债价值', '纯债溢价率', '转股溢价率', '收盘价', '', '', '', '', '', ''];
      if (i < names.length && names[i]) colMapping[k] = names[i];
    });
    const rows = list.map((item: any) => targetCols.map((c) => {
      const rawKey = Object.keys(colMapping).find((k) => colMapping[k] === c);
      if (!rawKey) return '';
      const v = item[rawKey];
      if (v === null || v === undefined) return '';
      // 日期字段去掉时间部分
      if (c === '日期' && typeof v === 'string' && v.includes(' ')) return v.split(' ')[0];
      return String(v);
    }));
    return createDataFrame(targetCols, rows);
  } catch { return createDataFrame([], []); }
}
