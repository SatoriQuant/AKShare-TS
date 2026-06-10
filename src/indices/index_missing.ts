/**
 * AKShare TypeScript - index missing interfaces (CNI, SW, EM index min)
 */

import axios from 'axios';
import * as XLSX from 'xlsx';
import { httpGet, httpGetText } from '../utils/httpClient';
import { load } from 'cheerio';
import { createDataFrame, DataFrame } from '../utils/dataframe';

function toNum(v: any): number | null {
  const n = Number(String(v).replace(/[,%]/g, '').trim());
  return Number.isFinite(n) ? n : null;
}

// ─── CNI index detail ─────────────────────────────────────────

async function _cnindex_xlsx(url: string): Promise<DataFrame> {
  try {
    const resp = await axios.get(url, {
      responseType: 'arraybuffer', timeout: 30000,
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    const wb = XLSX.read(Buffer.from(resp.data), { type: 'buffer' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const records = XLSX.utils.sheet_to_json<Record<string, any>>(ws, { defval: '' });
    if (!records.length) return createDataFrame([], []);
    const cols = Object.keys(records[0]);
    const rows = records.map((item) => cols.map((c) => item[c]));
    return createDataFrame(cols, rows);
  } catch { return createDataFrame([], []); }
}

export async function index_detail_cni(symbol: string = '399001'): Promise<DataFrame> {
  const df = await _cnindex_xlsx(`https://www.cnindex.com.cn/sample-detail/download-history?indexcode=${symbol}`);
  if (!df.data?.length) return df;
  // Rename columns to match Python
  const colRename: Record<string, string> = {
    '\u603b\u5e02\u503c(\u4ebf\u5143)': '\u603b\u5e02\u503c', '\u6743\u91cd\uff08%\uff09': '\u6743\u91cd',
    '\u603b\u5e02\u503c(\u4ebf)': '\u603b\u5e02\u503c', '\u6743\u91cd(%)': '\u6743\u91cd',
  };
  const newCols = df.columns.map(c => colRename[c] ?? c);
  // Normalize code column
  const codeIdx = newCols.indexOf('\u6837\u672c\u4ee3\u7801');
  const newData = df.data.map((r) => {
    const nr = [...r];
    if (codeIdx >= 0) nr[codeIdx] = String(nr[codeIdx] ?? '').padStart(6, '0');
    return nr;
  });
  return createDataFrame(newCols, newData);
}

export async function index_detail_hist_cni(symbol: string = '399001'): Promise<DataFrame> {
  return index_detail_cni(symbol);
}

export async function index_detail_hist_adjust_cni(symbol: string = '399005'): Promise<DataFrame> {
  return _cnindex_xlsx(`http://www.cnindex.com.cn/sample-detail/download-adjustment?indexcode=${symbol}`);
}

// ─── EM A-share index minute data ─────────────────────────────

export async function index_zh_a_hist_min_em(
  symbol: string = '399006',
  period: string = '1',
  start_date: string = '1979-09-01 09:32:00',
  end_date: string = '2222-01-01 09:32:00',
): Promise<DataFrame> {
  // Try market ids in order: 1=sh, 0=sz, 2=csi, 47=other
  for (const marketId of ['1', '0', '2', '47']) {
    try {
      const secid = `${marketId}.${symbol}`;
      if (period === '1') {
        const params = {
          fields1: 'f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f11,f12,f13',
          fields2: 'f51,f52,f53,f54,f55,f56,f57,f58',
          iscr: '0', ndays: '5', secid,
        };
        const data = await httpGet<any>('https://push2his.eastmoney.com/api/qt/stock/trends2/get', { params });
        const trends: string[] = data?.data?.trends ?? [];
        if (!trends.length && marketId !== '47') continue;
        const cols = ['\u65f6\u95f4', '\u5f00\u76d8', '\u6536\u76d8', '\u6700\u9ad8', '\u6700\u4f4e', '\u6210\u4ea4\u91cf', '\u6210\u4ea4\u989d', '\u5747\u4ef7'];
        const rows = trends.map((s) => { const p = s.split(','); return [p[0], toNum(p[1]), toNum(p[2]), toNum(p[3]), toNum(p[4]), toNum(p[5]), toNum(p[6]), toNum(p[7])]; })
          .filter((r) => String(r[0]) >= start_date && String(r[0]) <= end_date);
        return createDataFrame(cols, rows);
      }
      const params = {
        secid,
        ut: '7eea3edcaed734bea9cbfc24409ed989',
        fields1: 'f1,f2,f3,f4,f5,f6',
        fields2: 'f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61',
        klt: period, fqt: '1', beg: '0', end: '20500000',
      };
      const data = await httpGet<any>('https://push2his.eastmoney.com/api/qt/stock/kline/get', { params });
      const klines: string[] = data?.data?.klines ?? [];
      if (!klines.length && marketId !== '47') continue;
      const cols = ['\u65f6\u95f4', '\u5f00\u76d8', '\u6536\u76d8', '\u6700\u9ad8', '\u6700\u4f4e', '\u6210\u4ea4\u91cf', '\u6210\u4ea4\u989d', '\u632f\u5e45', '\u6da8\u8dcc\u5e45', '\u6da8\u8dcc\u989d', '\u6362\u624b\u7387'];
      const rows = klines.map((s) => { const p = s.split(','); return [p[0], toNum(p[1]), toNum(p[2]), toNum(p[3]), toNum(p[4]), toNum(p[5]), toNum(p[6]), toNum(p[7]), toNum(p[8]), toNum(p[9]), toNum(p[10])]; })
        .filter((r) => String(r[0]) >= start_date && String(r[0]) <= end_date);
      return createDataFrame(cols, rows);
    } catch { continue; }
  }
  return createDataFrame([], []);
}

// ─── SW index info (legulegu) ─────────────────────────────────

async function _sw_index_overview_level(level: string): Promise<{ codes: string[], names: string[], parentNames: string[], counts: string[], vals: string[][] }> {
  const url = 'https://legulegu.com/stockdata/sw-industry-overview';
  const text = await httpGetText(url, { headers: { 'User-Agent': 'Mozilla/5.0', Referer: 'https://legulegu.com/' } });
  const $ = load(text);
  const container = $(`#${level}Items`);

  const codes = container.find('.lg-industries-item-chinese-title').toArray().map((el) => $(el).text().trim());
  const names = container.find('.lg-industries-item-number').toArray().map((el) => {
    const t = $(el).text();
    return t.split('(')[0].trim();
  });
  const parentNames = level !== 'level1' ? container.find('.lg-industries-item-number').toArray().map((el) => {
    const span = $(el).find('span');
    return span.text().split('(')[0].replace(/[【】[\]]/g, '').trim();
  }) : [];
  const counts = container.find('.lg-industries-item-number').toArray().map((el) => {
    const t = $(el).text();
    const m = t.match(/\((\d+)\)/);
    return m ? m[1] : '';
  });
  const valueRows = container.find('.lg-sw-industries-item-value').toArray().map((el) => {
    return $(el).find('.value').toArray().map((span) => $(span).text().trim());
  });
  const vals = valueRows;
  return { codes, names, parentNames, counts, vals };
}

export async function sw_index_first_info(): Promise<DataFrame> {
  try {
    const { codes, names, counts, vals } = await _sw_index_overview_level('level1');
    const columns = ['\u884c\u4e1a\u4ee3\u7801', '\u884c\u4e1a\u540d\u79f0', '\u6210\u4efd\u4e2a\u6570', '\u9759\u6001\u5e02\u76c8\u7387', 'TTM(\u6eda\u52a8)\u5e02\u76c8\u7387', '\u5e02\u51c0\u7387', '\u9759\u6001\u80a1\u606f\u7387'];
    const rows = codes.map((code, i) => [
      code, names[i] ?? '', toNum(counts[i]),
      toNum(vals[i]?.[0]), toNum(vals[i]?.[1]), toNum(vals[i]?.[2]), toNum(vals[i]?.[3]),
    ]);
    return createDataFrame(columns, rows);
  } catch { return createDataFrame([], []); }
}

export async function sw_index_second_info(): Promise<DataFrame> {
  try {
    const { codes, names, parentNames, counts, vals } = await _sw_index_overview_level('level2');
    const columns = ['\u884c\u4e1a\u4ee3\u7801', '\u884c\u4e1a\u540d\u79f0', '\u4e0a\u7ea7\u884c\u4e1a', '\u6210\u4efd\u4e2a\u6570', '\u9759\u6001\u5e02\u76c8\u7387', 'TTM(\u6eda\u52a8)\u5e02\u76c8\u7387', '\u5e02\u51c0\u7387', '\u9759\u6001\u80a1\u606f\u7387'];
    const rows = codes.map((code, i) => [
      code, names[i] ?? '', parentNames[i] ?? '', toNum(counts[i]),
      toNum(vals[i]?.[0]), toNum(vals[i]?.[1]), toNum(vals[i]?.[2]), toNum(vals[i]?.[3]),
    ]);
    return createDataFrame(columns, rows);
  } catch { return createDataFrame([], []); }
}

export async function sw_index_third_info(): Promise<DataFrame> {
  try {
    const { codes, names, parentNames, counts, vals } = await _sw_index_overview_level('level3');
    const columns = ['\u884c\u4e1a\u4ee3\u7801', '\u884c\u4e1a\u540d\u79f0', '\u4e0a\u7ea7\u884c\u4e1a', '\u6210\u4efd\u4e2a\u6570', '\u9759\u6001\u5e02\u76c8\u7387', 'TTM(\u6eda\u52a8)\u5e02\u76c8\u7387', '\u5e02\u51c0\u7387', '\u9759\u6001\u80a1\u606f\u7387'];
    const rows = codes.map((code, i) => [
      code, names[i] ?? '', parentNames[i] ?? '', toNum(counts[i]),
      toNum(vals[i]?.[0]), toNum(vals[i]?.[1]), toNum(vals[i]?.[2]), toNum(vals[i]?.[3]),
    ]);
    return createDataFrame(columns, rows);
  } catch { return createDataFrame([], []); }
}

export async function sw_index_third_cons(symbol: string = '801120.SI'): Promise<DataFrame> {
  const url = `https://legulegu.com/stockdata/index-composition?industryCode=${symbol}`;
  try {
    const text = await httpGetText(url, { headers: { 'User-Agent': 'Mozilla/5.0', Referer: 'https://legulegu.com/' } });
    const $ = load(text);
    const table = $('table').first();
    const headers = table.find('thead th, thead td').toArray().map((el) => $(el).text().trim()).filter(Boolean);
    const rows: any[][] = [];
    table.find('tbody tr').each((_, tr) => {
      const cells = $(tr).find('td').toArray().map((td) => $(td).text().trim());
      if (cells.length > 0) rows.push(cells);
    });
    const cols = headers.length > 0 ? headers : ['\u5e8f\u53f7', '\u80a1\u7968\u4ee3\u7801', '\u80a1\u7968\u7b80\u79f0', '\u7eb3\u5165\u65f6\u95f4', '\u7533\u4e071\u7ea7', '\u7533\u4e072\u7ea7', '\u7533\u4e073\u7ea7', '\u4ef7\u683c', '\u5e02\u76c8\u7387', '\u5e02\u76c8\u7387ttm', '\u5e02\u51c0\u7387', '\u80a1\u606f\u7387', '\u5e02\u5024'];
    return createDataFrame(cols, rows);
  } catch { return createDataFrame([], []); }
}
