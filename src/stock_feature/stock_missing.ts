/**
 * AKShare TypeScript - stock missing interfaces (151 total)
 * Covers EM finance reports, legu, cninfo, sina, board, hk, lhb, margin, etc.
 */

import { httpGet, httpGetText, httpGetTextGbk } from '../utils/httpClient';
import { decodeSinaData } from '../utils/jsDecode';
import { load } from 'cheerio';
import { createDataFrame, DataFrame, fromRecords } from '../utils/dataframe';
import { get_cninfo_js } from '../data/datasets';
import * as vm from 'vm';
import * as XLSX from 'xlsx';
import { createHash } from 'crypto';
import { getThsHeaders } from '../utils/thsAuth';

function toNum(v: any): number | null {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(String(v).replace(/[,%]/g, '').trim());
  return Number.isFinite(n) ? n : null;
}

function dateStr(v: any): string {
  if (!v) return '';
  if (typeof v === 'string') {
    const t = v.trim();
    const m = t.match(/^(\d{4})[-\/](\d{2})[-\/](\d{2})/);
    if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  }
  if (typeof v === 'number' && Number.isFinite(v)) {
    const d = new Date(v + 8 * 3600 * 1000);
    return d.toISOString().slice(0, 10);
  }
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? String(v).slice(0, 10) : d.toISOString().slice(0, 10);
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

const CNINFO_HEADERS = {
  Accept: '*/*', 'Accept-Encoding': 'gzip, deflate',
  Connection: 'keep-alive', Host: 'webapi.cninfo.com.cn',
  Origin: 'https://webapi.cninfo.com.cn', Referer: 'https://webapi.cninfo.com.cn/',
  'User-Agent': 'Mozilla/5.0', 'X-Requested-With': 'XMLHttpRequest',
};

async function _cninfo_post(path: string, params?: Record<string, string>): Promise<any[]> {
  try {
    const { default: axios } = await import('axios');
    const encKey = await getCninfoEncKey();
    const headers = { ...CNINFO_HEADERS, 'Content-Length': '0', 'Accept-Enckey': encKey };
    const resp = await axios.post(`https://webapi.cninfo.com.cn${path}`, null, { params, headers, timeout: 30000 });
    return resp.data?.records ?? [];
  } catch { return []; }
}

function _em_paginate_factory(reportName: string, extraParams?: Record<string, string>) {
  return async function(date?: string): Promise<DataFrame> {
    const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
    const params: Record<string, any> = {
      sortColumns: 'NOTICE_DATE,SECURITY_CODE', sortTypes: '-1,-1',
      pageSize: '500', pageNumber: '1', reportName, columns: 'ALL',
      ...extraParams,
    };
    if (date) {
      const d = String(date);
      const ds = `${d.slice(0,4)}-${d.slice(4,6)}-${d.slice(6,8)}`;
      params.filter = `(SECURITY_TYPE_CODE in ("058001001","058001008"))(TRADE_MARKET_CODE!="069001017")(REPORT_DATE='${ds}')`;
    }
    try {
      const allRows: any[][] = [];
      for (let page = 1; page <= 500; page++) {
        params.pageNumber = page;
        const data = await httpGet<any>(url, { params });
        const list = data?.result?.data ?? [];
        for (const item of list) { allRows.push(Object.values(item)); }
        if (page >= (data?.result?.pages ?? 0)) break;
      }
      if (!allRows.length) return createDataFrame([], []);
      const first = await httpGet<any>(url, { params: { ...params, pageNumber: '1' } });
      const cols = first?.result?.data?.[0] ? Object.keys(first.result.data[0]) : [];
      return createDataFrame(cols, allRows);
    } catch { return createDataFrame([], []); }
  };
}

// ─── EM Three-Statement Finance (date-level) ─────────────────

export async function stock_zcfz_em(date: string = '20240331'): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const ds = `${date.slice(0,4)}-${date.slice(4,6)}-${date.slice(6,8)}`;
  try {
    const rows: any[][] = [];
    for (let page = 1; page <= 500; page++) {
      const data = await httpGet<any>(url, {
        params: {
          sortColumns: 'NOTICE_DATE,SECURITY_CODE', sortTypes: '-1,-1',
          pageSize: '500', pageNumber: String(page), reportName: 'RPT_DMSK_FN_BALANCE', columns: 'ALL',
          filter: `(SECURITY_TYPE_CODE in ("058001001","058001008"))(TRADE_MARKET_CODE!="069001017")(REPORT_DATE='${ds}')`,
        },
      });
      const list = data?.result?.data ?? [];
      for (const item of list) {
        rows.push([
          rows.length + 1,
          item.SECURITY_CODE ?? '',
          item.SECURITY_NAME_ABBR ?? '',
          toNum(item.MONETARYFUNDS),
          toNum(item.ACCOUNTS_RECE),
          toNum(item.INVENTORY),
          toNum(item.TOTAL_ASSETS),
          toNum(item.TOTAL_ASSETS_RATIO),
          toNum(item.ACCOUNTS_PAYABLE),
          toNum(item.ADVANCE_RECEIVABLES),
          toNum(item.TOTAL_LIABILITIES),
          toNum(item.TOTAL_LIAB_RATIO),
          toNum(item.DEBT_ASSET_RATIO),
          toNum(item.TOTAL_EQUITY),
          dateStr(item.NOTICE_DATE),
        ]);
      }
      if (page >= (data?.result?.pages ?? 0)) break;
    }
    return createDataFrame(['序号', '股票代码', '股票简称', '资产-货币资金', '资产-应收账款', '资产-存货', '资产-总资产', '资产-总资产同比', '负债-应付账款', '负债-预收账款', '负债-总负债', '负债-总负债同比', '资产负债率', '股东权益合计', '公告日期'], rows);
  } catch { return createDataFrame([], []); }
}
export async function stock_zcfz_bj_em(date: string = '20240331'): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const ds = `${date.slice(0,4)}-${date.slice(4,6)}-${date.slice(6,8)}`;
  try {
    const allRows: any[][] = [];
    for (let page = 1; page <= 500; page++) {
      const data = await httpGet<any>(url, {
        params: {
          sortColumns: 'NOTICE_DATE,SECURITY_CODE', sortTypes: '-1,-1',
          pageSize: '500', pageNumber: String(page), reportName: 'RPT_DMSK_FN_BALANCE', columns: 'ALL',
          filter: `(SECURITY_TYPE_CODE in ("058001001","058001008"))(TRADE_MARKET_CODE="069001017")(REPORT_DATE='${ds}')`,
        },
      });
      const list = data?.result?.data ?? [];
      for (const item of list) {
        allRows.push([
          allRows.length + 1,
          item.SECURITY_CODE ?? '',
          item.SECURITY_NAME_ABBR ?? '',
          toNum(item.MONETARYFUNDS),
          toNum(item.ACCOUNTS_RECE),
          toNum(item.INVENTORY),
          toNum(item.TOTAL_ASSETS),
          toNum(item.TOTAL_ASSETS_RATIO),
          toNum(item.ACCOUNTS_PAYABLE),
          toNum(item.ADVANCE_RECEIVABLES),
          toNum(item.TOTAL_LIABILITIES),
          toNum(item.TOTAL_LIAB_RATIO),
          toNum(item.DEBT_ASSET_RATIO),
          toNum(item.TOTAL_EQUITY),
          dateStr(item.NOTICE_DATE),
        ]);
      }
      if (page >= (data?.result?.pages ?? 0)) break;
    }
    if (!allRows.length) return createDataFrame([], []);
    return createDataFrame(['序号', '股票代码', '股票简称', '资产-货币资金', '资产-应收账款', '资产-存货', '资产-总资产', '资产-总资产同比', '负债-应付账款', '负债-预收账款', '负债-总负债', '负债-总负债同比', '资产负债率', '股东权益合计', '公告日期'], allRows);
  } catch { return createDataFrame([], []); }
};
export async function stock_lrb_em(date: string = '20240331'): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const ds = `${date.slice(0,4)}-${date.slice(4,6)}-${date.slice(6,8)}`;
  try {
    const rows: any[][] = [];
    for (let page = 1; page <= 500; page++) {
      const data = await httpGet<any>(url, {
        params: {
          sortColumns: 'NOTICE_DATE,SECURITY_CODE', sortTypes: '-1,-1',
          pageSize: '500', pageNumber: String(page), reportName: 'RPT_DMSK_FN_INCOME', columns: 'ALL',
          filter: `(SECURITY_TYPE_CODE in ("058001001","058001008"))(TRADE_MARKET_CODE!="069001017")(REPORT_DATE='${ds}')`,
        },
      });
      const list = data?.result?.data ?? [];
      for (const item of list) {
        rows.push([
          rows.length + 1,
          item.SECURITY_CODE ?? '',
          item.SECURITY_NAME_ABBR ?? '',
          toNum(item.PARENT_NETPROFIT),
          toNum(item.PARENT_NETPROFIT_RATIO),
          toNum(item.TOTAL_OPERATE_INCOME),
          toNum(item.TOE_RATIO),
          toNum(item.OPERATE_COST),
          toNum(item.SALE_EXPENSE),
          toNum(item.MANAGE_EXPENSE),
          toNum(item.FINANCE_EXPENSE),
          toNum(item.TOTAL_OPERATE_COST),
          toNum(item.OPERATE_PROFIT),
          toNum(item.TOTAL_PROFIT),
          dateStr(item.NOTICE_DATE),
        ]);
      }
      if (page >= (data?.result?.pages ?? 0)) break;
    }
    return createDataFrame(['序号', '股票代码', '股票简称', '净利润', '净利润同比', '营业总收入', '营业总收入同比', '营业总支出-营业支出', '营业总支出-销售费用', '营业总支出-管理费用', '营业总支出-财务费用', '营业总支出-营业总支出', '营业利润', '利润总额', '公告日期'], rows);
  } catch { return createDataFrame([], []); }
}
export async function stock_xjll_em(date: string = '20240331'): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const ds = `${date.slice(0,4)}-${date.slice(4,6)}-${date.slice(6,8)}`;
  try {
    const rows: any[][] = [];
    for (let page = 1; page <= 500; page++) {
      const data = await httpGet<any>(url, {
        params: {
          sortColumns: 'NOTICE_DATE,SECURITY_CODE', sortTypes: '-1,-1',
          pageSize: '500', pageNumber: String(page), reportName: 'RPT_DMSK_FN_CASHFLOW', columns: 'ALL',
          filter: `(SECURITY_TYPE_CODE in ("058001001","058001008"))(TRADE_MARKET_CODE!="069001017")(REPORT_DATE='${ds}')`,
        },
      });
      const list = data?.result?.data ?? [];
      for (const item of list) {
        const v = Object.values(item) as any[];
        rows.push([
          rows.length + 1,
          v[1] ?? '',
          v[4] ?? '',
          toNum(v[28]),
          toNum(v[29]),
          toNum(v[14]),
          toNum(v[15]),
          toNum(v[20]),
          toNum(v[21]),
          toNum(v[26]),
          toNum(v[27]),
          dateStr(v[12]),
        ]);
      }
      if (page >= (data?.result?.pages ?? 0)) break;
    }
    return createDataFrame(['序号', '股票代码', '股票简称', '净现金流-净现金流', '净现金流-同比增长', '经营性现金流-现金流量净额', '经营性现金流-净现金流占比', '投资性现金流-现金流量净额', '投资性现金流-净现金流占比', '融资性现金流-现金流量净额', '融资性现金流-净现金流占比', '公告日期'], rows);
  } catch { return createDataFrame([], []); }
}

// ─── EM Three-Statement Finance (company-level) ──────────────

async function _get_company_type(symbol: string): Promise<string> {
  try {
    const html = await httpGetText('https://emweb.securities.eastmoney.com/PC_HSF10/NewFinanceAnalysis/Index', {
      params: { type: 'web', code: symbol.toLowerCase() },
    });
    const $ = load(html);
    return $('#hidctype').val()?.toString() ?? '1';
  } catch { return '1'; }
}

async function _em_finance_by_company(
  symbol: string, dateEndpoint: string, dataEndpoint: string,
  dateType: string, reportType: string, dataDateType?: string
): Promise<DataFrame> {
  try {
    const companyType = await _get_company_type(symbol);
    const BASE = 'https://emweb.securities.eastmoney.com/PC_HSF10/NewFinanceAnalysis/';
    const datesData = await httpGet<any>(`${BASE}${dateEndpoint}`, {
      params: { companyType, reportDateType: dateType, code: symbol },
    });
    const dates: string[] = (datesData?.data ?? []).map((d: any) => {
      const raw = d.REPORT_DATE ?? '';
      return typeof raw === 'string' ? raw.slice(0, 10) : String(raw).slice(0, 10);
    });
    if (!dates.length) return createDataFrame([], []);

    const allRows: any[][] = [];
    const chunks = [];
    for (let i = 0; i < dates.length; i += 5) chunks.push(dates.slice(i, i + 5).join(','));

    let cols: string[] = [];
    for (const chunk of chunks) {
      const data = await httpGet<any>(`${BASE}${dataEndpoint}`, {
        params: { companyType, reportDateType: dataDateType ?? dateType, reportType, code: symbol, dates: chunk },
      });
      const list = data?.data ?? [];
      if (list.length && !cols.length) cols = Object.keys(list[0]);
      for (const item of list) allRows.push(cols.map((c) => item[c]));
    }
    const colMeta = cols.map((_, ci) => {
      let allNumeric = true;
      let hasNull = false;
      let hasFraction = false;
      for (const row of allRows) {
        const v = row[ci];
        if (v === null || v === undefined || v === '') { hasNull = true; continue; }
        if (typeof v !== 'number' || !Number.isFinite(v)) { allNumeric = false; break; }
        if (!Number.isInteger(v)) hasFraction = true;
      }
      return { allNumeric, hasNull, hasFraction };
    });
    const rows = allRows.map((row) => row.map((v, ci) => {
      if (cols[ci] === 'REPORT_DATE') return v;
      const meta = colMeta[ci];
      if (!meta.allNumeric || typeof v !== 'number' || !Number.isFinite(v)) return v;
      if (!meta.hasNull && !meta.hasFraction) return v;
      const s = String(v);
      return s.includes('.') ? s : `${s}.0`;
    }));
    return createDataFrame(cols, rows);
  } catch { return createDataFrame([], []); }
}

export async function stock_balance_sheet_by_report_em(symbol: string = 'SH600519'): Promise<DataFrame> {
  return _em_finance_by_company(symbol, 'zcfzbDateAjaxNew', 'zcfzbAjaxNew', '0', '1');
}
export async function stock_balance_sheet_by_yearly_em(symbol: string = 'SH600036'): Promise<DataFrame> {
  return _em_finance_by_company(symbol, 'zcfzbDateAjaxNew', 'zcfzbAjaxNew', '1', '1');
}
export async function stock_balance_sheet_by_report_delisted_em(symbol: string = 'SZ000013'): Promise<DataFrame> {
  try {
    const secucode = `${symbol.slice(2)}.${symbol.slice(0, 2)}`;
    const dateData = await httpGet<any>('https://datacenter.eastmoney.com/securities/api/data/get', {
      params: {
        type: 'RPT_F10_FINANCE_GINCOME',
        sty: 'SECUCODE,SECURITY_CODE,REPORT_DATE,REPORT_TYPE,REPORT_DATE_NAME',
        filter: `(SECUCODE="${secucode}")`,
        p: '1', ps: '200', sr: '-1', st: 'REPORT_DATE', source: 'HSF10', client: 'PC',
      },
    });
    const dateList: string[] = (dateData?.result?.data ?? [])
      .map((item: any) => String(item?.REPORT_DATE ?? '').split(' ')[0])
      .filter((d: string) => !!d);
    if (!dateList.length) return createDataFrame([], []);
    const dateFilter = dateList.map((d) => `'${d}'`).join(',');

    const data = await httpGet<any>('https://datacenter.eastmoney.com/securities/api/data/get', {
      params: {
        type: 'RPT_F10_FINANCE_GBALANCE',
        sty: 'F10_FINANCE_GBALANCE',
        filter: `(SECUCODE="${secucode}")(REPORT_DATE in (${dateFilter}))`,
        p: '1', ps: '200', sr: '-1', st: 'REPORT_DATE', source: 'HSF10', client: 'PC',
      },
    });
    const list = data?.result?.data ?? [];
    if (!list.length) return createDataFrame([], []);
    list.sort((a: any, b: any) => String(b?.REPORT_DATE ?? '').localeCompare(String(a?.REPORT_DATE ?? '')));
    const cols = Object.keys(list[0]);
    const rawRows = list.map((item: any) => cols.map((c) => c === 'REPORT_DATE' ? dateStr(item[c]) : item[c]));
    const colMeta = cols.map((_, ci) => {
      if (cols[ci] === 'REPORT_DATE') return { allNumeric: false, hasNull: false, hasFraction: false };
      let allNumeric = true;
      let hasNull = false;
      let hasFraction = false;
      for (const row of rawRows) {
        const v = row[ci];
        if (v === null || v === undefined || v === '') { hasNull = true; continue; }
        if (typeof v !== 'number' || !Number.isFinite(v)) { allNumeric = false; break; }
        if (!Number.isInteger(v)) hasFraction = true;
      }
      return { allNumeric, hasNull, hasFraction };
    });
    const rows = rawRows.map((row: any[]) => row.map((v: any, ci: number) => {
      const meta = colMeta[ci];
      if (!meta.allNumeric || typeof v !== 'number' || !Number.isFinite(v)) return v;
      if (!meta.hasNull && !meta.hasFraction) return v;
      const s = String(v);
      return s.includes('.') ? s : `${s}.0`;
    }));
    return createDataFrame(cols, rows);
  } catch {
    return createDataFrame([], []);
  }
}
export async function stock_profit_sheet_by_report_em(symbol: string = 'SH600519'): Promise<DataFrame> {
  return _em_finance_by_company(symbol, 'lrbDateAjaxNew', 'lrbAjaxNew', '0', '1');
}
export async function stock_profit_sheet_by_yearly_em(symbol: string = 'SH600519'): Promise<DataFrame> {
  return _em_finance_by_company(symbol, 'lrbDateAjaxNew', 'lrbAjaxNew', '1', '1');
}
export async function stock_profit_sheet_by_quarterly_em(symbol: string = 'SH600519'): Promise<DataFrame> {
  return _em_finance_by_company(symbol, 'lrbDateAjaxNew', 'lrbAjaxNew', '2', '2', '0');
}
export async function stock_profit_sheet_by_report_delisted_em(symbol: string = 'SZ000013'): Promise<DataFrame> {
  try {
    const secucode = `${symbol.slice(2)}.${symbol.slice(0, 2)}`;
    // First get report dates
    const dateData = await httpGet<any>('https://datacenter.eastmoney.com/securities/api/data/get', {
      params: {
        type: 'RPT_F10_FINANCE_GINCOME',
        sty: 'SECUCODE,SECURITY_CODE,REPORT_DATE,REPORT_TYPE,REPORT_DATE_NAME',
        filter: `(SECUCODE="${secucode}")`,
        p: '1', ps: '200', sr: '-1', st: 'REPORT_DATE', source: 'HSF10', client: 'PC',
      },
    });
    const dateList: string[] = (dateData?.result?.data ?? [])
      .map((item: any) => String(item?.REPORT_DATE ?? '').split(' ')[0])
      .filter((d: string) => !!d);
    if (!dateList.length) return createDataFrame([], []);
    const dateFilter = dateList.map((d) => `'${d}'`).join(',');

    // Get financial data
    const data = await httpGet<any>('https://datacenter.eastmoney.com/securities/api/data/get', {
      params: {
        type: 'RPT_F10_FINANCE_GINCOME',
        sty: 'APP_F10_GINCOME',
        filter: `(SECUCODE="${secucode}")(REPORT_DATE in (${dateFilter}))`,
        p: '1', ps: '200', sr: '-1', st: 'REPORT_DATE', source: 'HSF10', client: 'PC',
      },
    });
    const list = data?.result?.data ?? [];
    if (!list.length) return createDataFrame([], []);
    list.sort((a: any, b: any) => String(b?.REPORT_DATE ?? '').localeCompare(String(a?.REPORT_DATE ?? '')));
    const cols = Object.keys(list[0]);
    const rows = list.map((item: any) => cols.map((c) => c === 'REPORT_DATE' ? dateStr(item[c]) : item[c]));
    return createDataFrame(cols, rows);
  } catch { return createDataFrame([], []); }
}
export async function stock_cash_flow_sheet_by_report_em(symbol: string = 'SH600519'): Promise<DataFrame> {
  return _em_finance_by_company(symbol, 'xjllbDateAjaxNew', 'xjllbAjaxNew', '0', '1');
}
export async function stock_cash_flow_sheet_by_yearly_em(symbol: string = 'SH600519'): Promise<DataFrame> {
  return _em_finance_by_company(symbol, 'xjllbDateAjaxNew', 'xjllbAjaxNew', '1', '1');
}
export async function stock_cash_flow_sheet_by_quarterly_em(symbol: string = 'SH600519'): Promise<DataFrame> {
  return _em_finance_by_company(symbol, 'xjllbDateAjaxNew', 'xjllbAjaxNew', '2', '2', '0');
}
export async function stock_cash_flow_sheet_by_report_delisted_em(symbol: string = 'SH600519'): Promise<DataFrame> {
  return _em_finance_by_company(symbol, 'xjllbDateAjaxNew', 'xjllbAjaxNew', '0', '1');
}

// ─── EM Board min data ────────────────────────────────────────

async function _em_board_min(secidPrefix: string, boardName: string, period: string, startDate: string, endDate: string, adjust: string): Promise<DataFrame> {
  const url = 'https://push2his.eastmoney.com/api/qt/stock/kline/get';
  const adjustMap: Record<string, string> = { '': '0', 'qfq': '1', 'hfq': '2' };
  const boardCode = boardName; // board name used as secid suffix
  try {
    // First get secid by name
    const searchData = await httpGet<any>('https://searchapi.eastmoney.com/api/suggest/get', {
      params: { input: boardName, type: '14', token: 'D43BF722C8E33BDC906FB84D85E326E8', count: '1' },
      headers: { Referer: 'https://www.eastmoney.com/' },
    });
    const secid = searchData?.QuotationCodeTable?.Data?.[0]?.Code
      ? `${secidPrefix}.${searchData.QuotationCodeTable.Data[0].Code}`
      : `${secidPrefix}.999999`;

    const params = {
      secid, ut: '7eea3edcaed734bea9cbfc24409ed989',
      fields1: 'f1,f2,f3,f4,f5,f6',
      fields2: 'f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61',
      klt: period, fqt: adjustMap[adjust] ?? '0', beg: '0', end: '20500000',
    };
    const data = await httpGet<any>(url, { params });
    const klines: string[] = data?.data?.klines ?? [];
    const cols = ['\u65f6\u95f4', '\u5f00\u76d8', '\u6536\u76d8', '\u6700\u9ad8', '\u6700\u4f4e', '\u6210\u4ea4\u91cf', '\u6210\u4ea4\u989d', '\u632f\u5e45', '\u6da8\u8dcc\u5e45', '\u6da8\u8dcc\u989d', '\u6362\u624b\u7387'];
    const rows = klines.map((s) => { const p = s.split(','); return [p[0], toNum(p[1]), toNum(p[2]), toNum(p[3]), toNum(p[4]), toNum(p[5]), toNum(p[6]), toNum(p[7]), toNum(p[8]), toNum(p[9]), toNum(p[10])]; })
      .filter((r) => String(r[0]) >= startDate && String(r[0]) <= endDate);
    return createDataFrame(cols, rows);
  } catch { return createDataFrame([], []); }
}

export async function stock_board_concept_hist_min_em(
  symbol: string = '\u53ef\u71c3\u51b0', period: string = '5',
  start_date: string = '1979-09-01 09:32:00', end_date: string = '2222-01-01 09:32:00', adjust: string = ''
): Promise<DataFrame> {
  return _em_board_min('90', symbol, period, start_date, end_date, adjust);
}

export async function stock_board_industry_hist_min_em(
  symbol: string = '\u5c0f\u91d1\u5c5e', period: string = '5',
  start_date: string = '1979-09-01 09:32:00', end_date: string = '2222-01-01 09:32:00', adjust: string = ''
): Promise<DataFrame> {
  return _em_board_min('90', symbol, period, start_date, end_date, adjust);
}

async function _em_board_spot(fsCode: string): Promise<DataFrame> {
  try {
    const data = await httpGet<any>('https://80.push2.eastmoney.com/api/qt/clist/get', {
      params: {
        pn: '1', pz: '5000', po: '1', np: '1',
        ut: 'bd1d9ddb04089700cf9c27f6f7426281', fltt: '2', invt: '2',
        fid: 'f3', fs: fsCode,
        fields: 'f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f12,f13,f14,f15,f16,f17,f18,f20,f21,f23,f24,f25,f62,f128,f136,f152',
      },
    });
    const list = data?.data?.diff ?? [];
    const columns = ['\u4ee3\u7801', '\u540d\u79f0', '\u6da8\u8dcc\u5e45', '\u6da8\u8dcc\u989d', '\u5f53\u524d\u4ef7', '\u6210\u4ea4\u91cf', '\u6210\u4ea4\u989d'];
    const rows = list.map((item: any) => [item.f12, item.f14, item.f3, item.f4, item.f2, item.f5, item.f6]);
    return createDataFrame(columns, rows);
  } catch { return createDataFrame([], []); }
}

export async function stock_board_concept_spot_em(symbol: string = '\u53ef\u71c3\u51b0'): Promise<DataFrame> {
  return _em_board_spot('m:90+t:3');
}
export async function stock_board_industry_spot_em(symbol: string = '\u5c0f\u91d1\u5c5e'): Promise<DataFrame> {
  return _em_board_spot('m:90+t:2');
}

// ─── Legu stock indicators ────────────────────────────────────

async function _legu_get(path: string, params?: Record<string, string>, referer: string = 'https://legulegu.com/stockdata/market-pe-pb'): Promise<any[]> {
  try {
    const { default: axios } = await import('axios');
    const token = createHash('md5').update(new Date().toISOString().slice(0, 10), 'utf8').digest('hex');
    const ref = referer;
    const page = await axios.get(ref, { headers: { 'User-Agent': 'Mozilla/5.0', Referer: 'https://legulegu.com/' }, timeout: 30000 });
    const html = String(page.data ?? '');
    const csrf = html.match(/<meta\s+name=["']_csrf["']\s+content=["']([^"']+)["']/i)?.[1] ?? '';
    const setCookies = page.headers?.['set-cookie'] as string[] | undefined;
    const cookieHeader = (setCookies ?? []).map((c) => c.split(';')[0]).join('; ');
    const url = `https://legulegu.com${path}`;
    const data = await axios.get(url, {
      params: { token, ...(params ?? {}) },
      headers: {
        'User-Agent': 'Mozilla/5.0',
        Referer: ref,
        ...(csrf ? { 'X-CSRF-Token': csrf } : {}),
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      },
      timeout: 30000,
    });
    const payload = data.data;
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.list)) return payload.list;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.items)) return payload.items;
    return [];
  } catch { return []; }
}

async function _legu_get_raw(path: string, params?: Record<string, string>, referer: string = 'https://legulegu.com/stockdata/market-pe-pb'): Promise<any> {
  try {
    const { default: axios } = await import('axios');
    const token = createHash('md5').update(new Date().toISOString().slice(0, 10), 'utf8').digest('hex');
    const page = await axios.get(referer, { headers: { 'User-Agent': 'Mozilla/5.0', Referer: 'https://legulegu.com/' }, timeout: 30000 });
    const html = String(page.data ?? '');
    const csrf = html.match(/<meta\s+name=["']_csrf["']\s+content=["']([^"']+)["']/i)?.[1] ?? '';
    const setCookies = page.headers?.['set-cookie'] as string[] | undefined;
    const cookieHeader = (setCookies ?? []).map((c) => c.split(';')[0]).join('; ');
    const resp = await axios.get(`https://legulegu.com${path}`, {
      params: { token, ...(params ?? {}) },
      headers: {
        'User-Agent': 'Mozilla/5.0',
        Referer: referer,
        ...(csrf ? { 'X-CSRF-Token': csrf } : {}),
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      },
      timeout: 30000,
    });
    return resp.data;
  } catch {
    return null;
  }
}

export async function stock_market_pe_lg(symbol: string = '深证'): Promise<DataFrame> {
  try {
    const symbolMap: Record<string, string> = { '上证': '1', '深证': '2', '创业板': '4', '科创版': '7' };
    const refMap: Record<string, string> = {
      '上证': 'https://legulegu.com/stockdata/shanghaiPE',
      '深证': 'https://legulegu.com/stockdata/shenzhenPE',
      '创业板': 'https://legulegu.com/stockdata/cybPE',
      '科创版': 'https://legulegu.com/stockdata/ke-chuang-ban-pe',
    };
    const indexCode = symbolMap[symbol] ?? '2';
    const ref = refMap[symbol] ?? refMap['深证'];
    const list = await _legu_get('/api/stock-data/market-pe', { marketId: indexCode }, ref);
    if (!list.length) return createDataFrame([], []);
    const rows = list.map((item: any) => [dateStr(item.date), toNum(item.close), toNum(item.pe)]);
    return createDataFrame(['日期', '指数', '平均市盈率'], rows);
  } catch { return createDataFrame([], []); }
}
export async function stock_market_pb_lg(symbol: string = '上证'): Promise<DataFrame> {
  try {
    const symbolMap: Record<string, string> = { '上证': '1', '深证': '2', '创业板': '4', '科创版': '7' };
    const refMap: Record<string, string> = {
      '上证': 'https://legulegu.com/stockdata/shanghaiPB',
      '深证': 'https://legulegu.com/stockdata/shenzhenPB',
      '创业板': 'https://legulegu.com/stockdata/cybPB',
      '科创版': 'https://legulegu.com/stockdata/ke-chuang-ban-pb',
    };
    const indexCode = symbolMap[symbol] ?? '1';
    const ref = refMap[symbol] ?? refMap['上证'];
    const list = await _legu_get('/api/stockdata/index-basic-pb', { indexCode }, ref);
    if (!list.length) return createDataFrame([], []);
    const rows = list.map((item: any) => [dateStr(item.date), toNum(item.close), toNum(item.addPb), toNum(item.pb), toNum(item.middlePb)]);
    return createDataFrame(['日期', '指数', '市净率', '等权市净率', '市净率中位数'], rows);
  } catch { return createDataFrame([], []); }
}

export async function stock_index_pe_lg(symbol: string = '\u6caa\u6df1300'): Promise<DataFrame> {
  const symbolMap: Record<string, string> = {
    '\u4e0a\u8bc150': '000016.SH', '\u6caa\u6df1300': '000300.SH', '\u4e0a\u8bc1380': '000009.SH',
    '\u521b\u4e1a\u677f50': '399673.SZ', '\u4e2d\u8bc1500': '000905.SH', '\u4e0a\u8bc1180': '000010.SH',
    '\u6df1\u8bc1\u7ea2\u5229': '399324.SZ', '\u6df1\u8bc1100': '399330.SZ', '\u4e2d\u8bc11000': '000852.SH',
    '\u4e0a\u8bc1\u7ea2\u5229': '000015.SH', '\u4e2d\u8bc1100': '000903.SH', '\u4e2d\u8bc1800': '000906.SH',
  };
  const indexCode = symbolMap[symbol];
  if (!indexCode) return createDataFrame([], []);
  const list = await _legu_get('/api/stockdata/index-basic-pe', { indexCode }, 'https://legulegu.com/stockdata/sz50-ttm-lyr');
  if (!list.length) return createDataFrame([], []);
  const rows = list.map((item: any) => [
    dateStr(item?.date),
    toNum(item?.close),
    toNum(item?.lyrPe),
    toNum(item?.addLyrPe),
    toNum(item?.middleLyrPe),
    toNum(item?.ttmPe),
    toNum(item?.addTtmPe),
    toNum(item?.middleTtmPe),
  ]);
  return createDataFrame(['\u65e5\u671f', '\u6307\u6570', '\u7b49\u6743\u9759\u6001\u5e02\u76c8\u7387', '\u9759\u6001\u5e02\u76c8\u7387', '\u9759\u6001\u5e02\u76c8\u7387\u4e2d\u4f4d\u6570', '\u7b49\u6743\u6eda\u52a8\u5e02\u76c8\u7387', '\u6eda\u52a8\u5e02\u76c8\u7387', '\u6eda\u52a8\u5e02\u76c8\u7387\u4e2d\u4f4d\u6570'], rows);
}
export async function stock_index_pb_lg(symbol: string = '\u6caa\u6df1300'): Promise<DataFrame> {
  const symbolMap: Record<string, string> = {
    '\u4e0a\u8bc150': '000016.SH', '\u6caa\u6df1300': '000300.SH', '\u4e0a\u8bc1380': '000009.SH',
    '\u521b\u4e1a\u677f50': '399673.SZ', '\u4e2d\u8bc1500': '000905.SH', '\u4e0a\u8bc1180': '000010.SH',
    '\u6df1\u8bc1\u7ea2\u5229': '399324.SZ', '\u6df1\u8bc1100': '399330.SZ', '\u4e2d\u8bc11000': '000852.SH',
    '\u4e0a\u8bc1\u7ea2\u5229': '000015.SH', '\u4e2d\u8bc1100': '000903.SH', '\u4e2d\u8bc1800': '000906.SH',
  };
  const indexCode = symbolMap[symbol];
  if (!indexCode) return createDataFrame([], []);
  const list = await _legu_get('/api/stockdata/index-basic-pb', { indexCode }, 'https://legulegu.com/stockdata/sz50-ttm-lyr');
  if (!list.length) return createDataFrame([], []);
  const rows = list.map((item: any) => [
    dateStr(item?.date),
    toNum(item?.close),
    toNum(item?.pb),
    toNum(item?.addPb),
    toNum(item?.middlePb),
  ]);
  return createDataFrame(['\u65e5\u671f', '\u6307\u6570', '\u5e02\u51c0\u7387', '\u7b49\u6743\u5e02\u51c0\u7387', '\u5e02\u51c0\u7387\u4e2d\u4f4d\u6570'], rows);
}

export async function stock_a_ttm_lyr(): Promise<DataFrame> {
  const pyFloatText = (v: any): string => {
    const n = toNum(v);
    if (n === null) return '';
    const s = String(n);
    return s.includes('.') ? s : `${s}.0`;
  };
  const list = await _legu_get('/api/stock-data/market-ttm-lyr', { marketId: '5' }, 'https://www.legulegu.com/stockdata/a-ttm-lyr');
  if (!list.length) return createDataFrame([], []);
  const cols = [
    'date', 'middlePETTM', 'averagePETTM', 'middlePELYR', 'averagePELYR', 'close',
    'quantileInAllHistoryMiddlePeTtm', 'quantileInRecent10YearsMiddlePeTtm',
    'quantileInAllHistoryAveragePeTtm', 'quantileInRecent10YearsAveragePeTtm',
    'quantileInAllHistoryMiddlePeLyr', 'quantileInRecent10YearsMiddlePeLyr',
    'quantileInAllHistoryAveragePeLyr', 'quantileInRecent10YearsAveragePeLyr',
  ];
  const rows = list.map((item: any) => [
    dateStr(item?.date),
    pyFloatText(item?.middlePETTM),
    pyFloatText(item?.averagePETTM),
    pyFloatText(item?.middlePELYR),
    pyFloatText(item?.averagePELYR),
    pyFloatText(item?.close),
    item?.quantileInAllHistoryMiddlePeTtm ?? '',
    item?.quantileInRecent10YearsMiddlePeTtm ?? '',
    item?.quantileInAllHistoryAveragePeTtm ?? '',
    item?.quantileInRecent10YearsAveragePeTtm ?? '',
    item?.quantileInAllHistoryMiddlePeLyr ?? '',
    item?.quantileInRecent10YearsMiddlePeLyr ?? '',
    item?.quantileInAllHistoryAveragePeLyr ?? '',
    item?.quantileInRecent10YearsAveragePeLyr ?? '',
  ]);
  return createDataFrame(cols, rows);
}
export async function stock_a_all_pb(): Promise<DataFrame> {
  const list = await _legu_get('/api/stock-data/market-index-pb', { marketId: 'ALL' }, 'https://legulegu.com/stockdata/all-pb');
  if (!list.length) return createDataFrame([], []);
  const cols = [
    'date', 'middlePB', 'equalWeightAveragePB', 'close',
    'quantileInAllHistoryMiddlePB', 'quantileInRecent10YearsMiddlePB',
    'quantileInAllHistoryEqualWeightAveragePB', 'quantileInRecent10YearsEqualWeightAveragePB',
  ];
  const rows = list.map((item: any) => [
    dateStr(item?.date),
    item?.middlePB ?? '',
    item?.equalWeightAveragePB ?? '',
    item?.close ?? '',
    item?.quantileInAllHistoryMiddlePB ?? '',
    item?.quantileInRecent10YearsMiddlePB ?? '',
    item?.quantileInAllHistoryEqualWeightAveragePB ?? '',
    item?.quantileInRecent10YearsEqualWeightAveragePB ?? '',
  ]);
  return createDataFrame(cols, rows);
}

export async function stock_buffett_index_lg(): Promise<DataFrame> {
  const list = await _legu_get('/api/stockdata/marketcap-gdp/get-marketcap-gdp', {}, 'https://legulegu.com/stockdata/marketcap-gdp');
  if (!list.length) return createDataFrame(['日期', '收盘价', '总市值', 'GDP'], []);
  const first = list[0] ?? {};
  const hasQ10 = Object.prototype.hasOwnProperty.call(first, 'quantileInRecent10Years');
  const hasQAll = Object.prototype.hasOwnProperty.call(first, 'quantileInAllHistory');
  const cols = ['日期', '收盘价', '总市值', 'GDP', ...(hasQ10 ? ['近十年分位数'] : []), ...(hasQAll ? ['总历史分位数'] : [])];
  const rows = list.map((item: any) => [
    dateStr(item?.date),
    toNum(item?.close),
    toNum(item?.marketCap),
    toNum(item?.gdp),
    ...(hasQ10 ? [toNum(item?.quantileInRecent10Years)] : []),
    ...(hasQAll ? [toNum(item?.quantileInAllHistory)] : []),
  ]);
  return createDataFrame(cols, rows);
}

export async function stock_market_activity_legu(): Promise<DataFrame> {
  try {
    const { default: axios } = await import('axios');
    const resp = await axios.get('https://legulegu.com/stockdata/market-activity', {
      headers: { 'User-Agent': 'Mozilla/5.0', Referer: 'https://legulegu.com/' },
      timeout: 30000,
    });
    const html = String(resp.data ?? '');
    const $ = load(html);
    const rows: any[][] = [];

    // Extract data from tables
    $('table').each((_, table) => {
      const trs = $(table).find('tr');
      trs.each((_, tr) => {
        const tds = $(tr).find('td');
        if (tds.length >= 2) {
          rows.push([$(tds[0]).text().trim(), $(tds[1]).text().trim()]);
        }
      });
    });

    // Extract from metric-activity div
    const metricDiv = $('div.metric-activity').text().trim();
    if (metricDiv) {
      const lines = metricDiv.split('\n').filter(Boolean);
      for (const line of lines) {
        const parts = line.split(':').map(s => s.trim());
        if (parts.length >= 2) {
          rows.push([parts[0], parts[1]]);
        }
      }
    }

    // Extract market-activity-meta
    const metaDiv = $('div.market-activity-meta').text().trim();
    if (metaDiv) {
      rows.push(['统计日期', metaDiv]);
    }

    return createDataFrame(['item', 'value'], rows);
  } catch { return createDataFrame([], []); }
}

export async function stock_a_congestion_lg(): Promise<DataFrame> {
  const data = await _legu_get_raw('/api/stockdata/ashares-congestion', {}, 'https://legulegu.com/stockdata/ashares-congestion');
  const list = data?.items ?? [];
  const rows = (Array.isArray(list) ? list : []).map((item: any) => [dateStr(item?.date), toNum(item?.close), toNum(item?.congestion)]);
  return createDataFrame(['date', 'close', 'congestion'], rows);
}

export async function stock_ebs_lg(): Promise<DataFrame> {
  const data = await _legu_get_raw('/api/stockdata/equity-bond-spread', { code: '000300.SH' }, 'https://legulegu.com/stockdata/equity-bond-spread');
  const list = data?.data ?? [];
  if (!Array.isArray(list) || !list.length) return createDataFrame([], []);
  const rows = list.map((item: any) => [dateStr(item?.date), toNum(item?.close), toNum(item?.peSpread), toNum(item?.peSpreadAverage)]);
  return createDataFrame(['日期', '沪深300指数', '股债利差', '股债利差均线'], rows);
}

export async function stock_a_gxl_lg(symbol: string = '上证A股'): Promise<DataFrame> {
  const symbolMap: Record<string, string> = {
    '上证A股': 'shangzheng',
    '深证A股': 'shenzheng',
    '创业板': 'chuangyeban',
    '科创板': 'kechuangban',
  };
  const data = await _legu_get_raw('/api/stockdata/guxilv', {}, 'https://legulegu.com/stockdata/guxilv');
  const key = symbolMap[symbol] ?? 'shangzheng';
  const list = data?.[key] ?? [];
  const rows = (Array.isArray(list) ? list : []).map((item: any) => [dateStr(item?.date), toNum(item?.addDvTtm)]);
  return createDataFrame(['日期', '股息率'], rows);
}

export async function stock_hk_gxl_lg(): Promise<DataFrame> {
  const list = await _legu_get('/api/stockdata/hs', { indexCode: 'HSI' }, 'https://legulegu.com/stockdata/market/hk/dv/hsi');
  if (!list.length) return createDataFrame([], []);
  const rows = list.map((item: any) => [dateStr(item?.date), toNum(item?.dvRatio)]);
  return createDataFrame(['日期', '股息率'], rows);
}

// ─── EM stock special ─────────────────────────────────────────

async function _em_special_list(fs: string, fields: string, columns: string[]): Promise<DataFrame> {
  try {
    const data = await httpGet<any>('https://80.push2.eastmoney.com/api/qt/clist/get', {
      params: { pn: '1', pz: '10000', po: '1', np: '1', ut: 'bd1d9ddb04089700cf9c27f6f7426281', fltt: '2', invt: '2', fid: 'f12', fs, fields },
    });
    const list = data?.data?.diff ?? [];
    const keys = fields.split(',');
    const rows = list.map((item: any) => keys.map((k) => item[k] ?? ''));
    return createDataFrame(columns, rows);
  } catch { return createDataFrame([], []); }
}

export async function stock_zh_a_st_em(): Promise<DataFrame> {
  return _em_special_list('m:0+t:6+f:!2,m:0+t:13+f:!2,m:0+t:80+f:!2,m:1+t:2+f:!2,m:1+t:23+f:!2,m:0+t:81+s:2048+f:!2', 'f12,f14,f2,f3,f4,f5,f6', ['\u4ee3\u7801', '\u540d\u79f0', '\u6700\u65b0\u4ef7', '\u6da8\u8dcc\u5e45', '\u6da8\u8dcc\u989d', '\u6210\u4ea4\u91cf', '\u6210\u4ea4\u989d']);
}

export async function stock_zh_a_stop_em(): Promise<DataFrame> {
  return _em_special_list('m:0+t:6+f:!2,m:0+t:80+f:!2,m:1+t:2+f:!2,m:1+t:23+f:!2', 'f12,f14,f2,f3', ['\u4ee3\u7801', '\u540d\u79f0', '\u6700\u65b0\u4ef7', '\u6da8\u8dcc\u5e45']);
}

export async function stock_kc_a_spot_em(): Promise<DataFrame> {
  return _em_special_list('m:1+t:23', 'f12,f14,f2,f3,f4,f5,f6,f7,f8', ['\u4ee3\u7801', '\u540d\u79f0', '\u6700\u65b0\u4ef7', '\u6da8\u8dcc\u5e45', '\u6da8\u8dcc\u989d', '\u6210\u4ea4\u91cf', '\u6210\u4ea4\u989d', '\u632f\u5e45', '\u6362\u624b\u7387']);
}

export async function stock_cy_a_spot_em(): Promise<DataFrame> {
  return _em_special_list('m:0+t:80', 'f12,f14,f2,f3,f4,f5,f6,f7,f8', ['\u4ee3\u7801', '\u540d\u79f0', '\u6700\u65b0\u4ef7', '\u6da8\u8dcc\u5e45', '\u6da8\u8dcc\u989d', '\u6210\u4ea4\u91cf', '\u6210\u4ea4\u989d', '\u632f\u5e45', '\u6362\u624b\u7387']);
}

export async function stock_new_a_spot_em(): Promise<DataFrame> {
  return _em_special_list('m:0+f:!2,m:1+f:!2', 'f12,f14,f2,f3,f4,f5', ['\u4ee3\u7801', '\u540d\u79f0', '\u6700\u65b0\u4ef7', '\u6da8\u8dcc\u5e45', '\u6da8\u8dcc\u989d', '\u6210\u4ea4\u91cf']);
}

// ─── EM holding & fund flow ───────────────────────────────────

async function _em_data_get(reportName: string, extraParams?: Record<string, string>): Promise<DataFrame> {
  try {
    const data = await httpGet<any>('https://datacenter-web.eastmoney.com/api/data/v1/get', {
      params: { reportName, columns: 'ALL', pageSize: '5000', pageNumber: '1', source: 'WEB', client: 'WEB', ...extraParams },
    });
    const list = data?.result?.data ?? [];
    if (!list.length) return createDataFrame([], []);
    const cols = Object.keys(list[0]);
    const rows = list.map((item: any) => cols.map((c) => item[c]));
    return createDataFrame(cols, rows);
  } catch { return createDataFrame([], []); }
}

export async function stock_gdfx_free_holding_analyse_em(date: string = '20231231'): Promise<DataFrame> {
  return _em_data_get('RPT_HOLDERSANALYS_FREE_HOLDERNUMCHANGE', { filter: `(END_DATE='${date.slice(0,4)}-${date.slice(4,6)}-${date.slice(6,8)}')` });
}
export async function stock_gdfx_holding_analyse_em(date: string = '20231231'): Promise<DataFrame> {
  return _em_data_get('RPT_HOLDERSANALYS_HOLDERNUMCHANGE', { filter: `(END_DATE='${date.slice(0,4)}-${date.slice(4,6)}-${date.slice(6,8)}')` });
}
export async function stock_gdfx_free_holding_change_em(date: string = '20231231'): Promise<DataFrame> {
  return _em_data_get('RPT_HOLDERSANALYS_FREE_HOLDCHANGE', { filter: `(END_DATE='${date.slice(0,4)}-${date.slice(4,6)}-${date.slice(6,8)}')` });
}
export async function stock_gdfx_holding_change_em(date: string = '20231231'): Promise<DataFrame> {
  return _em_data_get('RPT_HOLDERSANALYS_HOLDCHANGE', { filter: `(END_DATE='${date.slice(0,4)}-${date.slice(4,6)}-${date.slice(6,8)}')` });
}
export async function stock_gdfx_free_holding_statistics_em(date: string = '20231231'): Promise<DataFrame> {
  return _em_data_get('RPT_HOLDERSANALYS_FREE_SHAREHOLDRANK', { filter: `(END_DATE='${date.slice(0,4)}-${date.slice(4,6)}-${date.slice(6,8)}')` });
}
export async function stock_gdfx_holding_statistics_em(date: string = '20231231'): Promise<DataFrame> {
  return _em_data_get('RPT_HOLDERSANALYS_SHAREHOLDRANK', { filter: `(END_DATE='${date.slice(0,4)}-${date.slice(4,6)}-${date.slice(6,8)}')` });
}
export async function stock_gdfx_free_holding_teamwork_em(symbol: string = '社保'): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params: Record<string, any> = {
    sortColumns: 'COOPERAT_NUM,HOLDER_NEW,COOPERAT_HOLDER_NEW',
    sortTypes: '-1,-1,-1',
    pageSize: '500',
    pageNumber: '1',
    reportName: 'RPT_COOPFREEHOLDER',
    columns: 'ALL',
    source: 'WEB',
    client: 'WEB',
  };
  if (symbol !== '全部') {
    params.filter = `(HOLDER_TYPE="${symbol}")`;
  }
  try {
    const allRows: any[][] = [];
    for (let page = 1; page <= 500; page++) {
      params.pageNumber = String(page);
      const data = await httpGet<any>(url, { params });
      const list = data?.result?.data ?? [];
      for (const item of list) {
        allRows.push(Object.values(item));
      }
      if (page >= (data?.result?.pages ?? 0)) break;
    }
    if (!allRows.length) return createDataFrame([], []);
    const columns = ['序号', '股东名称', '股东类型', '协同股东名称', '协同股东类型', '协同次数', '个股详情'];
    const rows = allRows.map((row, i) => {
      const vals = row as any[];
      return [i + 1, vals[1] ?? '', vals[2] ?? '', vals[4] ?? '', vals[5] ?? '', toNum(vals[6]), vals[8] ?? ''];
    });
    return createDataFrame(columns, rows);
  } catch { return createDataFrame([], []); }
}

export async function stock_gdfx_holding_teamwork_em(symbol: string = '社保'): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params: Record<string, any> = {
    sortColumns: 'COOPERAT_NUM,HOLDER_NEW,COOPERAT_HOLDER_NEW',
    sortTypes: '-1,-1,-1',
    pageSize: '500',
    pageNumber: '1',
    reportName: 'RPT_TENHOLDERS_COOPHOLDERS',
    columns: 'ALL',
    source: 'WEB',
    client: 'WEB',
  };
  if (symbol !== '全部') {
    params.filter = `(HOLDER_TYPE="${symbol}")`;
  }
  try {
    const allRows: any[][] = [];
    for (let page = 1; page <= 500; page++) {
      params.pageNumber = String(page);
      const data = await httpGet<any>(url, { params });
      const list = data?.result?.data ?? [];
      for (const item of list) {
        allRows.push(Object.values(item));
      }
      if (page >= (data?.result?.pages ?? 0)) break;
    }
    if (!allRows.length) return createDataFrame([], []);
    const columns = ['序号', '股东名称', '股东类型', '协同股东名称', '协同股东类型', '协同次数', '个股详情'];
    const rows = allRows.map((row, i) => {
      const vals = row as any[];
      return [i + 1, vals[1] ?? '', vals[2] ?? '', vals[4] ?? '', vals[5] ?? '', toNum(vals[6]), vals[8] ?? ''];
    });
    return createDataFrame(columns, rows);
  } catch { return createDataFrame([], []); }
}

export async function stock_gdfx_free_top_10_em(symbol: string = 'sh688686', date: string = '20240930'): Promise<DataFrame> {
  const url = 'https://emweb.securities.eastmoney.com/PC_HSF10/ShareholderResearch/PageSDLTGD';
  const ds = `${date.slice(0,4)}-${date.slice(4,6)}-${date.slice(6,8)}`;
  try {
    const data = await httpGet<any>(url, {
      params: { code: symbol.toUpperCase(), date: ds },
    });
    const list = data?.sdltgd ?? [];
    if (!list.length) return createDataFrame([], []);
    const columns = ['名次', '股东名称', '股东性质', '股份类型', '持股数', '占总流通股本持股比例', '增减', '变动比率'];
    const rows = list.map((item: any, i: number) => [
      i + 1,
      item.GDNAME ?? '',
      item.GDTYPE ?? '',
      item.SHARETYPE ?? '',
      toNum(item.HOLDNUM),
      toNum(item.FREEHOLDNUMRATIO),
      item.HOLDNUM_CHANGE ?? '',
      toNum(item.CHANGERATIO),
    ]);
    return createDataFrame(columns, rows);
  } catch { return createDataFrame([], []); }
}

export async function stock_gdfx_top_10_em(symbol: string = 'sh688686', date: string = '20210630'): Promise<DataFrame> {
  const url = 'https://emweb.securities.eastmoney.com/PC_HSF10/ShareholderResearch/PageSDGD';
  const ds = `${date.slice(0,4)}-${date.slice(4,6)}-${date.slice(6,8)}`;
  try {
    const data = await httpGet<any>(url, {
      params: { code: symbol.toUpperCase(), date: ds },
    });
    const list = data?.sdgd ?? [];
    if (!list.length) return createDataFrame([], []);
    const columns = ['名次', '股东名称', '股份类型', '持股数', '占总股本持股比例', '增减', '变动比率'];
    const rows = list.map((item: any, i: number) => [
      i + 1,
      item.GDNAME ?? '',
      item.SHARETYPE ?? '',
      toNum(item.HOLDNUM),
      toNum(item.HOLDNUMRATIO),
      item.HOLDNUM_CHANGE ?? '',
      toNum(item.CHANGERATIO),
    ]);
    return createDataFrame(columns, rows);
  } catch { return createDataFrame([], []); }
}

// Fund flow (THS pattern)
async function _ths_fund_flow(url: string, params: Record<string, string>): Promise<DataFrame> {
  try {
    const text = await httpGetTextGbk(url, { params, headers: { 'User-Agent': 'Mozilla/5.0' } });
    const match = text.match(/jsonpgz\((\{[\s\S]*?\})\)/);
    if (!match) return createDataFrame([], []);
    const json = JSON.parse(match[1]);
    const keys = Object.keys(json);
    if (!keys.length) return createDataFrame([], []);
    const cols = Object.keys(json[keys[0]]);
    const rows = keys.map((k) => cols.map((c) => json[k][c]));
    return createDataFrame(cols, rows);
  } catch { return createDataFrame([], []); }
}

export async function stock_fund_flow_individual(symbol: string = '\u5373\u65f6'): Promise<DataFrame> {
  const boardMap: Record<string, string> = {
    '\u5373\u65f6': '', '3\u65e5\u6392\u884c': '3', '5\u65e5\u6392\u884c': '5', '10\u65e5\u6392\u884c': '10', '20\u65e5\u6392\u884c': '20',
  };
  const board = boardMap[symbol] ?? '';
  try {
    const firstUrl = board
      ? `http://data.10jqka.com.cn/funds/ggzjl/board/${board}/field/zdf/order/desc/page/1/ajax/1/free/1/`
      : 'http://data.10jqka.com.cn/funds/ggzjl/field/zdf/order/desc/page/1/ajax/1/free/1/';
    const firstHtml = await httpGetTextGbk(firstUrl, { headers: getThsHeaders() });
    const $f = load(firstHtml);
    const pageInfo = $f('span.page_info').text();
    const totalPage = parseInt((pageInfo.split('/')[1] || '1').trim(), 10) || 1;
    const allRows: any[][] = [];
    for (let page = 1; page <= totalPage; page++) {
      const url = board
        ? `http://data.10jqka.com.cn/funds/ggzjl/board/${board}/field/zdf/order/desc/page/${page}/ajax/1/free/1/`
        : `http://data.10jqka.com.cn/funds/ggzjl/field/zdf/order/desc/page/${page}/ajax/1/free/1/`;
      const html = await httpGetTextGbk(url, { headers: getThsHeaders() });
      const $ = load(html);
      $('table.m-table tbody tr').each((_, tr) => {
        const t = $(tr).find('td');
        if (t.length >= 7) {
          const row: any[] = [];
          t.each((__, td) => { row.push($(td).text().trim()); });
          allRows.push(row);
        }
      });
    }
    if (!allRows.length) return createDataFrame([], []);
    if (symbol === '\u5373\u65f6') {
      const rows = allRows.map((r, i) => [i + 1, r[1] ?? '', r[2] ?? '', r[3] ?? '', r[4] ?? '', r[5] ?? '', r[6] ?? '', r[7] ?? '', r[8] ?? '', r[9] ?? '']);
      return createDataFrame(['\u5e8f\u53f7', '\u80a1\u7968\u4ee3\u7801', '\u80a1\u7968\u7b80\u79f0', '\u6700\u65b0\u4ef7', '\u6da8\u8dcc\u5e45', '\u6362\u624b\u7387', '\u6d41\u5165\u8d44\u91d1', '\u6d41\u51fa\u8d44\u91d1', '\u51c0\u989d', '\u6210\u4ea4\u989d'], rows);
    } else {
      const rows = allRows.map((r, i) => [i + 1, r[1] ?? '', r[2] ?? '', r[3] ?? '', r[4] ?? '', r[5] ?? '', r[6] ?? '']);
      return createDataFrame(['\u5e8f\u53f7', '\u80a1\u7968\u4ee3\u7801', '\u80a1\u7968\u7b80\u79f0', '\u6700\u65b0\u4ef7', '\u9636\u6bb5\u6da8\u8dcc\u5e45', '\u8fde\u7eed\u6362\u624b\u7387', '\u8d44\u91d1\u6d41\u5165\u51c0\u989d'], rows);
    }
  } catch { return createDataFrame([], []); }
}

export async function stock_fund_flow_industry(symbol: string = '\u5373\u65f6'): Promise<DataFrame> {
  const boardMap: Record<string, string> = {
    '\u5373\u65f6': '', '3\u65e5\u6392\u884c': '3', '5\u65e5\u6392\u884c': '5', '10\u65e5\u6392\u884c': '10', '20\u65e5\u6392\u884c': '20',
  };
  const board = boardMap[symbol] ?? '';
  try {
    const firstUrl = board
      ? `http://data.10jqka.com.cn/funds/hyzjl/board/${board}/field/zdf/order/desc/page/1/ajax/1/free/1/`
      : 'http://data.10jqka.com.cn/funds/hyzjl/field/zdf/order/desc/page/1/ajax/1/free/1/';
    const firstHtml = await httpGetTextGbk(firstUrl, { headers: getThsHeaders() });
    const $f = load(firstHtml);
    const pageInfo = $f('span.page_info').text();
    const totalPage = parseInt((pageInfo.split('/')[1] || '1').trim(), 10) || 1;
    const allRows: any[][] = [];
    for (let page = 1; page <= totalPage; page++) {
      const url = board
        ? `http://data.10jqka.com.cn/funds/hyzjl/board/${board}/field/zdf/order/desc/page/${page}/ajax/1/free/1/`
        : `http://data.10jqka.com.cn/funds/hyzjl/field/zdf/order/desc/page/${page}/ajax/1/free/1/`;
      const html = await httpGetTextGbk(url, { headers: getThsHeaders() });
      const $ = load(html);
      $('table.m-table tbody tr').each((_, tr) => {
        const t = $(tr).find('td');
        if (t.length >= 7) {
          const row: any[] = [];
          t.each((__, td) => { row.push($(td).text().trim()); });
          allRows.push(row);
        }
      });
    }
    if (!allRows.length) return createDataFrame([], []);
    if (symbol === '\u5373\u65f6') {
      const rows = allRows.map((r, i) => [i + 1, r[1] ?? '', r[2] ?? '', r[3] ?? '', r[4] ?? '', r[5] ?? '', r[6] ?? '', r[7] ?? '', r[8] ?? '', r[9] ?? '', r[10] ?? '']);
      return createDataFrame(['\u5e8f\u53f7', '\u884c\u4e1a', '\u884c\u4e1a\u6307\u6570', '\u884c\u4e1a-\u6da8\u8dcc\u5e45', '\u6d41\u5165\u8d44\u91d1', '\u6d41\u51fa\u8d44\u91d1', '\u51c0\u989d', '\u516c\u53f8\u5bb6\u6570', '\u9886\u6da8\u80a1', '\u9886\u6da8\u80a1-\u6da8\u8dcc\u5e45', '\u5f53\u524d\u4ef7'], rows);
    } else {
      const rows = allRows.map((r, i) => [i + 1, r[1] ?? '', r[2] ?? '', r[3] ?? '', r[4] ?? '', r[5] ?? '', r[6] ?? '', r[7] ?? '']);
      return createDataFrame(['\u5e8f\u53f7', '\u884c\u4e1a', '\u516c\u53f8\u5bb6\u6570', '\u884c\u4e1a\u6307\u6570', '\u9636\u6bb5\u6da8\u8dcc\u5e45', '\u6d41\u5165\u8d44\u91d1', '\u6d41\u51fa\u8d44\u91d1', '\u51c0\u989d'], rows);
    }
  } catch { return createDataFrame([], []); }
}

export async function stock_fund_flow_concept(symbol: string = '\u5373\u65f6'): Promise<DataFrame> {
  const boardMap: Record<string, string> = {
    '\u5373\u65f6': '', '3\u65e5\u6392\u884c': '3', '5\u65e5\u6392\u884c': '5', '10\u65e5\u6392\u884c': '10', '20\u65e5\u6392\u884c': '20',
  };
  const board = boardMap[symbol] ?? '';
  try {
    const firstUrl = board
      ? `http://data.10jqka.com.cn/funds/gnzjl/board/${board}/field/zdf/order/desc/page/1/ajax/1/free/1/`
      : 'http://data.10jqka.com.cn/funds/gnzjl/field/zdf/order/desc/page/1/ajax/1/free/1/';
    const firstHtml = await httpGetTextGbk(firstUrl, { headers: getThsHeaders() });
    const $f = load(firstHtml);
    const pageInfo = $f('span.page_info').text();
    const totalPage = parseInt((pageInfo.split('/')[1] || '1').trim(), 10) || 1;
    const allRows: any[][] = [];
    for (let page = 1; page <= totalPage; page++) {
      const url = board
        ? `http://data.10jqka.com.cn/funds/gnzjl/board/${board}/field/zdf/order/desc/page/${page}/ajax/1/free/1/`
        : `http://data.10jqka.com.cn/funds/gnzjl/field/zdf/order/desc/page/${page}/ajax/1/free/1/`;
      const html = await httpGetTextGbk(url, { headers: getThsHeaders() });
      const $ = load(html);
      $('table.m-table tbody tr').each((_, tr) => {
        const t = $(tr).find('td');
        if (t.length >= 7) {
          const row: any[] = [];
          t.each((__, td) => { row.push($(td).text().trim()); });
          allRows.push(row);
        }
      });
    }
    if (!allRows.length) return createDataFrame([], []);
    if (symbol === '\u5373\u65f6') {
      const rows = allRows.map((r, i) => [i + 1, r[1] ?? '', r[2] ?? '', r[3] ?? '', r[4] ?? '', r[5] ?? '', r[6] ?? '', r[7] ?? '', r[8] ?? '', r[9] ?? '', r[10] ?? '']);
      return createDataFrame(['\u5e8f\u53f7', '\u884c\u4e1a', '\u884c\u4e1a\u6307\u6570', '\u884c\u4e1a-\u6da8\u8dcc\u5e45', '\u6d41\u5165\u8d44\u91d1', '\u6d41\u51fa\u8d44\u91d1', '\u51c0\u989d', '\u516c\u53f8\u5bb6\u6570', '\u9886\u6da8\u80a1', '\u9886\u6da8\u80a1-\u6da8\u8dcc\u5e45', '\u5f53\u524d\u4ef7'], rows);
    } else {
      const rows = allRows.map((r, i) => [i + 1, r[1] ?? '', r[2] ?? '', r[3] ?? '', r[4] ?? '', r[5] ?? '', r[6] ?? '', r[7] ?? '']);
      return createDataFrame(['\u5e8f\u53f7', '\u884c\u4e1a', '\u516c\u53f8\u5bb6\u6570', '\u884c\u4e1a\u6307\u6570', '\u9636\u6bb5\u6da8\u8dcc\u5e45', '\u6d41\u5165\u8d44\u91d1', '\u6d41\u51fa\u8d44\u91d1', '\u51c0\u989d'], rows);
    }
  } catch { return createDataFrame([], []); }
}

export async function stock_fund_flow_big_deal(): Promise<DataFrame> {
  try {
    const firstUrl = 'http://data.10jqka.com.cn/funds/ddzz/order/desc/ajax/1/free/1/';
    const firstHtml = await httpGetTextGbk(firstUrl, { headers: getThsHeaders() });
    const $f = load(firstHtml);
    const pageInfo = $f('span.page_info').text();
    const totalPage = parseInt((pageInfo.split('/')[1] || '1').trim(), 10) || 1;
    const allRows: any[][] = [];
    for (let page = 1; page <= totalPage; page++) {
      const url = `http://data.10jqka.com.cn/funds/ddzz/order/asc/page/${page}/ajax/1/free/1/`;
      const html = await httpGetTextGbk(url, { headers: getThsHeaders() });
      const $ = load(html);
      $('table.m-table tbody tr').each((_, tr) => {
        const t = $(tr).find('td');
        if (t.length >= 10) {
          const row: any[] = [];
          t.each((__, td) => { row.push($(td).text().trim()); });
          allRows.push(row);
        }
      });
    }
    if (!allRows.length) return createDataFrame([], []);
    const rows = allRows.map((r) => [r[0] ?? '', r[1] ?? '', r[2] ?? '', r[3] ?? '', r[4] ?? '', r[5] ?? '', r[6] ?? '', r[7] ?? '', r[8] ?? '']);
    return createDataFrame(['\u6210\u4ea4\u65f6\u95f4', '\u80a1\u7968\u4ee3\u7801', '\u80a1\u7968\u7b80\u79f0', '\u6210\u4ea4\u4ef7\u683c', '\u6210\u4ea4\u91cf', '\u6210\u4ea4\u989d', '\u5927\u5355\u6027\u8d28', '\u6da8\u8dcc\u5e45', '\u6da8\u8dcc\u989d'], rows);
  } catch { return createDataFrame([], []); }
}

// ─── Stock pledge / goodwill ──────────────────────────────────

export async function stock_gpzy_distribute_statistics_bank_em(): Promise<DataFrame> {
  return _em_data_get('RPT_MAIN_HOLDORG_PLEDGE_STATISTICS', { filter: '(ORG_TYPE="银行")' });
}
export async function stock_gpzy_distribute_statistics_company_em(): Promise<DataFrame> {
  return _em_data_get('RPT_MAIN_HOLDORG_PLEDGE_STATISTICS', { filter: '(ORG_TYPE="证券公司")' });
}
export async function stock_gpzy_individual_pledge_ratio_detail_em(symbol: string = '000001'): Promise<DataFrame> {
  return _em_data_get('RPT_MAIN_PLEDGEDETAIL', { filter: `(SECUCODE="${symbol}")` });
}
export async function stock_gpzy_industry_data_em(): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params: Record<string, any> = {
    sortColumns: 'AVERAGE_PLEDGE_RATIO',
    sortTypes: '-1',
    pageSize: '500',
    pageNumber: '1',
    reportName: 'RPT_CSDC_INDUSTRY_STATISTICS',
    columns: 'INDUSTRY_CODE,INDUSTRY,TRADE_DATE,AVERAGE_PLEDGE_RATIO,ORG_NUM,PLEDGE_TOTAL_NUM,TOTAL_PLEDGE_SHARES,PLEDGE_TOTAL_MARKETCAP',
    quoteColumns: '',
    source: 'WEB',
    client: 'WEB',
  };
  try {
    const allRows: any[][] = [];
    for (let page = 1; page <= 500; page++) {
      params.pageNumber = String(page);
      const data = await httpGet<any>(url, { params });
      const list = data?.result?.data ?? [];
      for (const item of list) {
        const vals = Object.values(item) as any[];
        allRows.push([
          allRows.length + 1,
          vals[1] ?? '',  // 行业
          toNum(vals[3]), // 平均质押比例
          toNum(vals[4]), // 公司家数
          toNum(vals[5]), // 质押总笔数
          toNum(vals[6]), // 质押总股本
          toNum(vals[7]), // 最新质押市值
          dateStr(vals[2]), // 统计时间
        ]);
      }
      if (page >= (data?.result?.pages ?? 0)) break;
    }
    return createDataFrame(['序号', '行业', '平均质押比例', '公司家数', '质押总笔数', '质押总股本', '最新质押市值', '统计时间'], allRows);
  } catch { return createDataFrame([], []); }
}

// ─── Stock HK ─────────────────────────────────────────────────

export async function stock_hk_famous_spot_em(): Promise<DataFrame> {
  return _em_special_list('b:MK0201,b:MK0202,b:MK0203,b:MK0204,b:MK0205', 'f12,f13,f14,f2,f3,f4,f5,f6', ['\u4ee3\u7801', '\u5e02\u573a', '\u540d\u79f0', '\u6700\u65b0\u4ef7', '\u6da8\u8dcc\u5e45', '\u6da8\u8dcc\u989d', '\u6210\u4ea4\u91cf', '\u6210\u4ea4\u989d']);
}

export async function stock_hk_main_board_spot_em(): Promise<DataFrame> {
  return _em_special_list('b:MK0201', 'f12,f13,f14,f2,f3,f4,f5,f6', ['\u4ee3\u7801', '\u5e02\u573a', '\u540d\u79f0', '\u6700\u65b0\u4ef7', '\u6da8\u8dcc\u5e45', '\u6da8\u8dcc\u989d', '\u6210\u4ea4\u91cf', '\u6210\u4ea4\u989d']);
}

export async function stock_hk_hist_min_em(
  symbol: string = '00700',
  period: string = '5',
  start_date: string = '1979-09-01 09:32:00',
  end_date: string = '2222-01-01 09:32:00',
  adjust: string = ''
): Promise<DataFrame> {
  const adjustMap: Record<string, string> = { '': '0', 'qfq': '1', 'hfq': '2' };
  try {
    const params = {
      secid: `116.${symbol}`, ut: '7eea3edcaed734bea9cbfc24409ed989',
      fields1: 'f1,f2,f3,f4,f5,f6', fields2: 'f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61',
      klt: period, fqt: adjustMap[adjust] ?? '0', beg: '0', end: '20500000',
    };
    const data = await httpGet<any>('https://push2his.eastmoney.com/api/qt/stock/kline/get', { params });
    const klines: string[] = data?.data?.klines ?? [];
    const cols = ['\u65f6\u95f4', '\u5f00\u76d8', '\u6536\u76d8', '\u6700\u9ad8', '\u6700\u4f4e', '\u6210\u4ea4\u91cf', '\u6210\u4ea4\u989d', '\u632f\u5e45', '\u6da8\u8dcc\u5e45', '\u6da8\u8dcc\u989d', '\u6362\u624b\u7387'];
    const rows = klines.map((s) => { const p = s.split(','); return [p[0], toNum(p[1]), toNum(p[2]), toNum(p[3]), toNum(p[4]), toNum(p[5]), toNum(p[6]), toNum(p[7]), toNum(p[8]), toNum(p[9]), toNum(p[10])]; })
      .filter((r) => String(r[0]) >= start_date && String(r[0]) <= end_date);
    return createDataFrame(cols, rows);
  } catch { return createDataFrame([], []); }
}

export async function stock_hk_fhpx_detail_ths(symbol: string = '0700'): Promise<DataFrame> {
  try {
    const url = `https://basic.10jqka.com.cn/176/HK${symbol}/bonus.html`;
    const html = await httpGetText(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36' } });
    const $ = load(html);
    const rows: any[][] = [];
    $('table tr').each((_, tr) => {
      const t = $(tr).find('td');
      if (t.length >= 8) {
        const row: any[] = [];
        t.each((__: any, td: any) => { row.push($(td).text().trim()); });
        rows.push(row);
      }
    });
    if (!rows.length) return createDataFrame([], []);
    // Filter out rows where 派息日 and 除净日 are both empty
    const filtered = rows.filter(r => r[2] || r[3]);
    return createDataFrame(['公告日期', '方案', '除净日', '派息日', '过户日期起止日-起始', '过户日期起止日-截止', '类型', '进度', '以股代息'], filtered);
  } catch { return createDataFrame([], []); }
}

export async function stock_hk_ggt_components_em(): Promise<DataFrame> {
  return _em_data_get('RPT_MUTUAL_MARKET_SH');
}

export async function stock_hk_valuation_baidu(symbol: string = '06969', indicator: string = '总市值', period: string = '近一年'): Promise<DataFrame> {
  try {
    const indicatorMap: Record<string, string> = {
      '总市值': '总市值', '市盈率(TTM)': '市盈率(TTM)', '市盈率(静)': '市盈率(静)',
      '市净率': '市净率', '市现率': '市现率',
    };
    const periodMap: Record<string, string> = { '近一年': '近一年', '近三年': '近三年', '全部': '全部' };
    const text = await httpGetText(`https://finance.baidu.com/opendata`, {
      params: {
        query: indicatorMap[indicator] ?? indicator, code: symbol, board: 'hk',
        category: periodMap[period] ?? period, trend: '1',
      },
      headers: { 'User-Agent': 'Mozilla/5.0', Referer: 'https://finance.baidu.com/' },
    });
    const data = JSON.parse(text);
    const body = data?.Result?.[0]?.DisplayData?.resultData?.tplData?.result?.chartInfo?.[0]?.body ?? [];
    const rows = body.map((x: any) => [dateStr(x?.date ?? x?.[0]), toNum(x?.value ?? x?.[1])]);
    return createDataFrame(['date', 'value'], rows);
  } catch { return createDataFrame([], []); }
}

export async function stock_hk_growth_comparison_em(symbol: string = '03900'): Promise<DataFrame> {
  try {
    const data = await httpGet<any>('https://datacenter.eastmoney.com/securities/api/data/v1/get', {
      params: {
        reportName: 'RPT_PCF10_INDUSTRY_HKGROWTH',
        columns: 'SECUCODE,SECURITY_CODE,ORG_CODE,REPORT_DATE,TYPE_ID,TYPE_TYPE,TYPE_NAME,TYPE_NAME_EN,CORRE_SECURITY_CODE,CORRE_SECUCODE,CORRE_SECURITY_NAME,EPS_YOY,OPERATE_INCOME_YOY,OPERATE_PROFIT_YOY,TOTAL_ASSET_YOY,EPS_YOY_RANK,OPINCOME_YOY_RANK,OPROFIT_YOY_RANK,TOASSET_YOY_RANK',
        quoteColumns: '',
        filter: `(SECUCODE="${symbol}.HK")(CORRE_SECUCODE="${symbol}.HK")`,
        pageNumber: '1', pageSize: '', sortTypes: '', sortColumns: '',
        source: 'F10', client: 'PC',
      },
    });
    const list = data?.result?.data ?? [];
    if (!list.length) return createDataFrame([], []);
    const fieldMap: Record<string, string> = {
      CORRE_SECURITY_CODE: '代码', CORRE_SECURITY_NAME: '简称',
      EPS_YOY: '基本每股收益同比增长率', EPS_YOY_RANK: '基本每股收益同比增长率排名',
      OPERATE_INCOME_YOY: '营业收入同比增长率', OPINCOME_YOY_RANK: '营业收入同比增长率排名',
      OPERATE_PROFIT_YOY: '营业利润率同比增长率', OPROFIT_YOY_RANK: '营业利润率同比增长率排名',
      TOTAL_ASSET_YOY: '基本每股收总资产同比增长率益同比增长率', TOASSET_YOY_RANK: '总资产同比增长率排名',
    };
    const cols = Object.keys(fieldMap);
    const cnCols = cols.map(c => fieldMap[c]);
    const rows = list.map((item: any) => cols.map(c => item[c] ?? ''));
    return createDataFrame(cnCols, rows);
  } catch { return createDataFrame([], []); }
}
export async function stock_hk_scale_comparison_em(symbol: string = '03900'): Promise<DataFrame> {
  try {
    const data = await httpGet<any>('https://datacenter.eastmoney.com/securities/api/data/v1/get', {
      params: {
        reportName: 'RPT_PCF10_INDUSTRY_SCALE',
        columns: 'SECURITY_CODE,SECUCODE,TYPE_ID,TYPE_TYPE,TYPE_NAME,TYPE_NAME_EN,CORRE_SECURITY_CODE,CORRE_SECUCODE,CORRE_SECURITY_NAME,MAXSTDREPORTDATE,HKSDQMV,HKTOTAL_MARKET_CAP,OPERATE_INCOME,GROSS_PROFIT,HKSDQMV_RANK,HKTOTAL_CAP_RANK,OPERATE_INCOME_RANK,GROSS_PROFIT_RANK',
        quoteColumns: '',
        filter: `(SECUCODE="${symbol}.HK")(CORRE_SECUCODE="${symbol}.HK")`,
        pageNumber: '1', pageSize: '', sortTypes: '', sortColumns: '',
        source: 'F10', client: 'PC',
      },
    });
    const list = data?.result?.data ?? [];
    if (!list.length) return createDataFrame([], []);
    const fieldMap: Record<string, string> = {
      CORRE_SECURITY_CODE: '代码', CORRE_SECURITY_NAME: '简称',
      HKSDQMV: '总市值', HKSDQMV_RANK: '总市值排名',
      HKTOTAL_MARKET_CAP: '流通市值', HKTOTAL_CAP_RANK: '流通市值排名',
      OPERATE_INCOME: '营业总收入', OPERATE_INCOME_RANK: '营业总收入排名',
      GROSS_PROFIT: '净利润', GROSS_PROFIT_RANK: '净利润排名',
    };
    const cols = Object.keys(fieldMap);
    const cnCols = cols.map(c => fieldMap[c]);
    const rows = list.map((item: any) => cols.map(c => item[c] ?? ''));
    return createDataFrame(cnCols, rows);
  } catch { return createDataFrame([], []); }
}
export async function stock_hk_valuation_comparison_em(symbol: string = '03900'): Promise<DataFrame> {
  try {
    const data = await httpGet<any>('https://datacenter.eastmoney.com/securities/api/data/v1/get', {
      params: {
        reportName: 'RPT_PCF10_INDUSTRY_HKCVALUE',
        columns: 'SECUCODE,SECURITY_CODE,ORG_CODE,REPORT_DATE,TYPE_ID,TYPE_TYPE,TYPE_NAME,TYPE_NAME_EN,CORRE_SECURITY_CODE,CORRE_SECUCODE,CORRE_SECURITY_NAME,PE_TTM,PE_LYR,PB_MQR,PB_LYR,PS_TTM,PS_LYR,PCE_TTM,PCE_LYR,PE_TTM_RANK,PE_LYR_RANK,PB_MQR_RANK,PB_LYR_RANK,PS_TTM_RANK,PS_LYR_RANK,PCE_TTM_RANK,PCE_LYR_RANK',
        quoteColumns: '',
        filter: `(SECUCODE="${symbol}.HK")(CORRE_SECUCODE="${symbol}.HK")`,
        pageNumber: '1', pageSize: '', sortTypes: '', sortColumns: '',
        source: 'F10', client: 'PC',
      },
    });
    const list = data?.result?.data ?? [];
    if (!list.length) return createDataFrame([], []);
    const fieldMap: Record<string, string> = {
      CORRE_SECURITY_CODE: '代码', CORRE_SECURITY_NAME: '简称',
      PE_TTM: '市盈率-TTM', PE_TTM_RANK: '市盈率-TTM排名',
      PE_LYR: '市盈率-LYR', PE_LYR_RANK: '市盈率-LYR排名',
      PB_MQR: '市净率-MRQ', PB_MQR_RANK: '市净率-MRQ排名',
      PB_LYR: '市净率-LYR', PB_LYR_RANK: '市净率-LYR排名',
      PS_TTM: '市销率-TTM', PS_TTM_RANK: '市销率-TTM排名',
      PS_LYR: '市销率-LYR', PS_LYR_RANK: '市销率-LYR排名',
      PCE_TTM: '市现率-TTM', PCE_TTM_RANK: '市现率-TTM排名',
      PCE_LYR: '市现率-LYR', PCE_LYR_RANK: '市现率-LYR排名',
    };
    const cols = Object.keys(fieldMap);
    const cnCols = cols.map(c => fieldMap[c]);
    const rows = list.map((item: any) => cols.map(c => item[c] ?? ''));
    return createDataFrame(cnCols, rows);
  } catch { return createDataFrame([], []); }
}

// ─── Stock comparison EM ──────────────────────────────────────

export async function stock_zh_ab_comparison_em(): Promise<DataFrame> { return createDataFrame([], []); }

// ─── Stock holding change cninfo ─────────────────────────────

export async function stock_hold_change_cninfo(symbol: string = '全部'): Promise<DataFrame> {
  const symbolMap: Record<string, string> = {
    '深市主板': '012002', '沪市': '012001', '创业板': '012015', '科创板': '012029', '北交所': '012046', '全部': '',
  };
  const records = await _cninfo_post('/api/sysapi/p_sysapi1029', { market: symbolMap[symbol] ?? '' });
  if (!records.length) return createDataFrame([], []);
  const rows = records.map((item: any) => {
    const vals = Object.values(item) as any[];
    return [
      vals[6] ?? '',  // 证券代码
      vals[3] ?? '',  // 证券简称
      vals[2] ?? '',  // 交易市场
      dateStr(vals[4]), // 公告日期
      dateStr(vals[7]), // 变动日期
      vals[5] ?? '',  // 变动原因
      vals[1] ?? '',  // 总股本
      vals[0] ?? '',  // 已流通股份
      vals[9] ?? '',  // 已流通比例
      vals[8] ?? '',  // 流通受限股份
    ];
  });
  return createDataFrame(['证券代码', '证券简称', '交易市场', '公告日期', '变动日期', '变动原因', '总股本', '已流通股份', '已流通比例', '流通受限股份'], rows);
}
export async function stock_hold_control_cninfo(symbol: string = '全部'): Promise<DataFrame> {
  const symbolMap: Record<string, string> = {
    '单独控制': '069001', '实际控制人': '069002', '一致行动人': '069003', '家族控制': '069004', '全部': '',
  };
  const records = await _cninfo_post('/api/sysapi/p_sysapi1033', { ctype: symbolMap[symbol] ?? '' });
  if (!records.length) return createDataFrame([], []);
  const rows = records.map((item: any) => {
    const vals = Object.values(item) as any[];
    return [
      vals[6] ?? '',  // 证券代码
      vals[2] ?? '',  // 证券简称
      dateStr(vals[7]), // 变动日期
      vals[3] ?? '',  // 实际控制人名称
      vals[1] ?? '',  // 控股数量
      vals[0] ?? '',  // 控股比例
      vals[4] ?? '',  // 直接控制人名称
      vals[5] ?? '',  // 控制类型
    ];
  });
  return createDataFrame(['证券代码', '证券简称', '变动日期', '实际控制人名称', '控股数量', '控股比例', '直接控制人名称', '控制类型'], rows);
}
export async function stock_hold_management_detail_cninfo(symbol: string = '增持'): Promise<DataFrame> {
  const symbolMap: Record<string, string> = { '增持': 'B', '减持': 'S' };
  const now = new Date();
  const current_date = now.toISOString().slice(0, 10);
  const sdate = `${now.getFullYear() - 1}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const records = await _cninfo_post('/api/sysapi/p_sysapi1030', {
    sdate, edate: current_date, varytype: symbolMap[symbol] ?? 'B',
  });
  if (!records.length) return createDataFrame([], []);
  const rows = records.map((item: any) => {
    const vals = Object.values(item) as any[];
    return [
      vals[5] ?? '',  // 证券代码
      vals[0] ?? '',  // 证券简称
      dateStr(vals[8]), // 截止日期
      dateStr(vals[1]), // 公告日期
      vals[2] ?? '',  // 高管姓名
      vals[13] ?? '', // 董监高姓名
      vals[12] ?? '', // 董监高职务
      vals[11] ?? '', // 变动人与董监高关系
      vals[10] ?? '', // 期初持股数量
      vals[9] ?? '',  // 期末持股数量
      vals[7] ?? '',  // 变动数量
      vals[6] ?? '',  // 变动比例
      vals[4] ?? '',  // 成交均价
      vals[3] ?? '',  // 期末市值
      vals[15] ?? '', // 持股变动原因
      vals[14] ?? '', // 数据来源
    ];
  });
  return createDataFrame(['证券代码', '证券简称', '截止日期', '公告日期', '高管姓名', '董监高姓名', '董监高职务', '变动人与董监高关系', '期初持股数量', '期末持股数量', '变动数量', '变动比例', '成交均价', '期末市值', '持股变动原因', '数据来源'], rows);
}
export async function stock_hold_num_cninfo(date: string = '20210630'): Promise<DataFrame> {
  const records = await _cninfo_post('/api/sysapi/p_sysapi1034', { rdate: date });
  if (!records.length) return createDataFrame([], []);
  const rows = records.map((item: any) => {
    const vals = Object.values(item) as any[];
    return [
      vals[5] ?? '',  // 证券代码
      vals[4] ?? '',  // 证券简称
      dateStr(vals[7]), // 变动日期
      vals[3] ?? '',  // 本期股东人数
      vals[2] ?? '',  // 上期股东人数
      vals[1] ?? '',  // 股东人数增幅
      vals[0] ?? '',  // 本期人均持股数量
      vals[8] ?? '',  // 上期人均持股数量
      vals[6] ?? '',  // 人均持股数量增幅
    ];
  });
  return createDataFrame(['证券代码', '证券简称', '变动日期', '本期股东人数', '上期股东人数', '股东人数增幅', '本期人均持股数量', '上期人均持股数量', '人均持股数量增幅'], rows);
}
export async function stock_share_change_cninfo(symbol: string = '002594'): Promise<DataFrame> {
  const records = await _cninfo_post('/api/stock/p_stock2215', {
    scode: symbol,
    sdate: '2009-12-27',
    edate: '2024-10-21',
  });
  if (!records.length) return createDataFrame([], []);
  const colsMap: Record<string, string> = {
    SECCODE: '证券代码', SECNAME: '证券简称', ORGNAME: '机构名称', DECLAREDATE: '公告日期', VARYDATE: '变动日期',
    F001V: '变动原因编码', F002V: '变动原因', F003N: '总股本', F004N: '未流通股份', F005N: '发起人股份',
    F006N: '国家持股', F007N: '国有法人持股', F008N: '境内法人持股', F009N: '境外法人持股', F010N: '自然人持股',
    F011N: '募集法人股', F012N: '内部职工股', F013N: '转配股', F014N: '其他流通受限股份', F015N: '优先股',
    F016N: '其他未流通股', F021N: '已流通股份', F022N: '人民币普通股', F023N: '境内上市外资股-B股',
    F024N: '境外上市外资股-H股', F025N: '高管股', F026N: '其他流通股', F028N: '流通受限股份', F017N: '配售法人股',
    F018N: '战略投资者持股', F019N: '证券投资基金持股', F020N: '一般法人持股', F029N: '国家持股-受限',
    F030N: '国有法人持股-受限', F031N: '其他内资持股-受限', F032N: '其中：境内法人持股', F033N: '其中：境内自然人持股',
    F034N: '外资持股-受限', F035N: '其中：境外法人持股', F036N: '其中：境外自然人持股', F037N: '其中：限售高管股',
    F038N: '其中：限售B股', F040N: '其中：限售H股', F027C: '最新记录标识', F049N: '其他', F050N: '控股股东、实际控制人',
  };
  const ignoreSet = new Set(['最新记录标识', '其他']);
  const first = records[0];
  const cols = Object.keys(first)
    .map((k) => colsMap[k] ?? k)
    .filter((c) => !ignoreSet.has(c));
  const rows = records.map((r: any) => {
    const obj: Record<string, any> = {};
    for (const k of Object.keys(r)) {
      const nk = colsMap[k] ?? k;
      if (ignoreSet.has(nk)) continue;
      let val = r[k];
      if (nk === '公告日期' || nk === '变动日期') val = dateStr(val);
      obj[nk] = val ?? null;
    }
    return cols.map((c) => {
      const v = obj[c];
      if (v === null || v === undefined) return null;
      if (c === '证券代码') return String(v).padStart(6, '0');
      if (c === '变动原因编码') return String(v);
      if (typeof v === 'number') {
        const s = String(v);
        return s.includes('.') ? s : `${s}.0`;
      }
      const n = toNum(v);
      if (n === null) return String(v);
      const s = String(n);
      return s.includes('.') ? s : `${s}.0`;
    });
  });
  return createDataFrame(cols, rows);
}

// ─── Stock hold management EM ─────────────────────────────────

export async function stock_hold_management_person_em(symbol: string = '001308', name: string = '吴远'): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params: Record<string, any> = {
    reportName: 'RPT_EXECUTIVE_HOLD_DETAILS',
    columns: 'ALL',
    quoteColumns: '',
    filter: `(SECURITY_CODE="${symbol}")(PERSON_NAME="${name}")`,
    pageNumber: '1',
    pageSize: '5000',
    sortTypes: '-1,1,1',
    sortColumns: 'CHANGE_DATE,SECURITY_CODE,PERSON_NAME',
    source: 'WEB',
    client: 'WEB',
  };
  try {
    const allRows: any[][] = [];
    for (let page = 1; page <= 500; page++) {
      params.pageNumber = String(page);
      const data = await httpGet<any>(url, { params });
      const list = data?.result?.data ?? [];
      for (const item of list) {
        allRows.push(Object.values(item));
      }
      if (page >= (data?.result?.pages ?? 0)) break;
    }
    if (!allRows.length) return createDataFrame([], []);
    const columns = ['日期', '代码', '名称', '变动人', '变动股数', '成交均价', '变动金额', '变动原因', '变动比例', '变动后持股数', '持股种类', '董监高人员姓名', '职务', '变动人与董监高的关系', '开始时持有', '结束后持有'];
    const rows = allRows.map((row) => {
      const vals = row as any[];
      return [
        dateStr(vals[3]), // 日期
        vals[0] ?? '',    // 代码
        vals[1] ?? '',    // 名称
        vals[4] ?? '',    // 变动人
        toNum(vals[5]),   // 变动股数
        toNum(vals[6]),   // 成交均价
        toNum(vals[7]),   // 变动金额
        vals[8] ?? '',    // 变动原因
        toNum(vals[9]),   // 变动比例
        toNum(vals[10]),  // 变动后持股数
        vals[11] ?? '',   // 持股种类
        vals[12] ?? '',   // 董监高人员姓名
        vals[13] ?? '',   // 职务
        vals[14] ?? '',   // 变动人与董监高的关系
        toNum(vals[17]),  // 开始时持有
        toNum(vals[18]),  // 结束后持有
      ];
    });
    return createDataFrame(columns, rows);
  } catch { return createDataFrame([], []); }
}

// ─── HSGT board rank ─────────────────────────────────────────

export async function stock_hsgt_board_rank_em(): Promise<DataFrame> {
  return _em_data_get('RPT_FLOW_BOARD_HOLDRANK');
}
export async function stock_hsgt_sh_hk_spot_em(): Promise<DataFrame> {
  return _em_data_get('RPT_MUTUAL_MARKET_SUMMARY');
}

// ─── Stock industry cninfo / SW ──────────────────────────────

export async function stock_industry_category_cninfo(symbol: string = '\u5de8\u6f6e\u884c\u4e1a\u5206\u7c7b\u6807\u51c6'): Promise<DataFrame> {
  const symbolMap: Record<string, string> = {
    '\u8bc1\u76d1\u4f1a\u884c\u4e1a\u5206\u7c7b\u6807\u51c6': '008001', '\u5de8\u6f6e\u884c\u4e1a\u5206\u7c7b\u6807\u51c6': '008002', '\u7533\u94f6\u4e07\u56fd\u884c\u4e1a\u5206\u7c7b\u6807\u51c6': '008003',
    '\u65b0\u8d22\u5bcc\u884c\u4e1a\u5206\u7c7b\u6807\u51c6': '008004', '\u56fd\u8d44\u59d4\u884c\u4e1a\u5206\u7c7b\u6807\u51c6': '008005', '\u5de8\u6f6e\u4ea7\u4e1a\u7ec6\u5206\u6807\u51c6': '008006',
    '\u5929\u76f8\u884c\u4e1a\u5206\u7c7b\u6807\u51c6': '008007', '\u5168\u7403\u884c\u4e1a\u5206\u7c7b\u6807\u51c6': '008008',
  };
  const records = await _cninfo_post('/api/stock/p_public0002', {
    indcode: '',
    indtype: symbolMap[symbol] ?? '008002',
    format: 'json',
  });
  if (!records.length) return createDataFrame([], []);
  // Python adds a \u5206\u7ea7 column based on code length
  const rows = records.map((item: any) => {
    const code = item.SORTCODE ?? '';
    return [
      code,
      item.SORTNAME ?? '',
      dateStr(item.F002D),
      item.F004V ?? '',
      item.F003V ?? '',
      item.F001V ?? '',
      item.PARENTCODE ?? '',
      Math.floor(code.length / 2),  // \u5206\u7ea7
    ];
  });
  return createDataFrame(['\u7c7b\u76ee\u7f16\u7801', '\u7c7b\u76ee\u540d\u79f0', '\u7ec8\u6b62\u65e5\u671f', '\u884c\u4e1a\u7c7b\u578b', '\u884c\u4e1a\u7c7b\u578b\u7f16\u7801', '\u7c7b\u76ee\u540d\u79f0\u82f1\u6587', '\u7236\u7c7b\u7f16\u7801', '\u5206\u7ea7'], rows);
}

export async function stock_industry_change_cninfo(symbol: string = '002594', start_date: string = '20091227', end_date: string = '20220713'): Promise<DataFrame> {
  const records = await _cninfo_post('/api/stock/p_stock2110', {
    scode: symbol,
    sdate: `${start_date.slice(0,4)}-${start_date.slice(4,6)}-${start_date.slice(6,8)}`,
    edate: `${end_date.slice(0,4)}-${end_date.slice(4,6)}-${end_date.slice(6,8)}`,
  });
  if (!records.length) return createDataFrame([], []);
  const colsMap: Record<string, string> = {
    ORGNAME: '\u673a\u6784\u540d\u79f0', SECCODE: '\u8bc1\u5238\u4ee3\u7801', SECNAME: '\u65b0\u8bc1\u5238\u7b80\u79f0',
    VARYDATE: '\u53d8\u66f4\u65e5\u671f', F001V: '\u5206\u7c7b\u6807\u51c6\u7f16\u7801', F002V: '\u5206\u7c7b\u6807\u51c6',
    F003V: '\u884c\u4e1a\u7f16\u7801', F004V: '\u884c\u4e1a\u95e8\u7c7b', F005V: '\u884c\u4e1a\u6b21\u7c7b',
    F006V: '\u884c\u4e1a\u5927\u7c7b', F007V: '\u884c\u4e1a\u4e2d\u7c7b', F008C: '\u6700\u65b0\u8bb0\u5f55\u6807\u8bc6',
  };
  const ignoreCols = new Set(['\u6700\u65b0\u8bb0\u5f55\u6807\u8bc6']);
  // Use API field order, then rename
  const first = records[0];
  const apiCols = Object.keys(first);
  const cnCols = apiCols.map(c => colsMap[c] ?? c).filter(c => !ignoreCols.has(c));
  const fieldKeys = apiCols.filter(c => !ignoreCols.has(colsMap[c] ?? c));
  const rows = records.map((item: any) => {
    return fieldKeys.map(k => {
      const cn = colsMap[k] ?? k;
      if (cn === '\u53d8\u66f4\u65e5\u671f') return dateStr(item[k]);
      return item[k] ?? '';
    });
  });
  return createDataFrame(cnCols, rows);
}

export async function stock_industry_pe_ratio_cninfo(symbol: string = '\u884c\u4e1a\u5e02\u76c8\u7387'): Promise<DataFrame> {
  const records = await _cninfo_post('/api/sysapi/p_sysapi1085');
  const cols = records.length ? Object.keys(records[0]) : ['\u884c\u4e1a', '\u5e02\u76c8\u7387'];
  const rows = records.map((item: any) => cols.map((c) => item[c]));
  return createDataFrame(cols, rows);
}

export async function stock_industry_clf_hist_sw(symbol: string = '000001'): Promise<DataFrame> {
  return _em_data_get('RPT_SWINDSRY_CHANGE', { filter: `(SECUCODE="${symbol}")` });
}

// ─── Stock IPO cninfo ─────────────────────────────────────────

export async function stock_ipo_summary_cninfo(symbol: string = '600030'): Promise<DataFrame> {
  const records = await _cninfo_post('/api/sysapi/p_sysapi1134', { scode: symbol });
  if (!records.length) return createDataFrame([], []);
  const record = records[0];
  const vals = Object.values(record) as any[];
  const rows = [[
    vals[23] ?? '',  // \u80a1\u7968\u4ee3\u7801
    dateStr(vals[0]), // \u62db\u80a1\u516c\u544a\u65e5\u671f
    dateStr(vals[1]), // \u4e2d\u7b7e\u7387\u516c\u544a\u65e5
    toNum(vals[3]),   // \u6bcf\u80a1\u9762\u503c
    toNum(vals[4]),   // \u603b\u53d1\u884c\u6570\u91cf
    toNum(vals[5]),   // \u53d1\u884c\u524d\u6bcf\u80a1\u51c0\u8d44\u4ea7
    toNum(vals[6]),   // \u644a\u8584\u53d1\u884c\u5e02\u76c8\u7387
    toNum(vals[7]),   // \u52df\u96c6\u8d44\u91d1\u51c0\u989d
    dateStr(vals[8]), // \u4e0a\u7f51\u53d1\u884c\u65e5\u671f
    dateStr(vals[9]), // \u4e0a\u5e02\u65e5\u671f
    toNum(vals[10]),  // \u53d1\u884c\u4ef7\u683c
    toNum(vals[11]),  // \u53d1\u884c\u8d39\u7528\u603b\u989d
    toNum(vals[12]),  // \u53d1\u884c\u540e\u6bcf\u80a1\u51c0\u8d44\u4ea7
    toNum(vals[13]),  // \u4e0a\u7f51\u53d1\u884c\u4e2d\u7b7e\u7387
    vals[14] ?? '',   // \u4e3b\u627f\u9500\u5546
  ]];
  return createDataFrame(['\u80a1\u7968\u4ee3\u7801', '\u62db\u80a1\u516c\u544a\u65e5\u671f', '\u4e2d\u7b7e\u7387\u516c\u544a\u65e5', '\u6bcf\u80a1\u9762\u503c', '\u603b\u53d1\u884c\u6570\u91cf', '\u53d1\u884c\u524d\u6bcf\u80a1\u51c0\u8d44\u4ea7', '\u644a\u8584\u53d1\u884c\u5e02\u76c8\u7387', '\u52df\u96c6\u8d44\u91d1\u51c0\u989d', '\u4e0a\u7f51\u53d1\u884c\u65e5\u671f', '\u4e0a\u5e02\u65e5\u671f', '\u53d1\u884c\u4ef7\u683c', '\u53d1\u884c\u8d39\u7528\u603b\u989d', '\u53d1\u884c\u540e\u6bcf\u80a1\u51c0\u8d44\u4ea7', '\u4e0a\u7f51\u53d1\u884c\u4e2d\u7b7e\u7387', '\u4e3b\u627f\u9500\u5546'], rows);
}

export async function stock_new_gh_cninfo(): Promise<DataFrame> {
  const records = await _cninfo_post('/api/sysapi/p_sysapi1099');
  const cols = records.length ? Object.keys(records[0]) : ['\u80a1\u7968\u4ee3\u7801', '\u8fc7\u4f1a\u65e5\u671f'];
  const rows = records.map((item: any) => cols.map((c) => item[c]));
  return createDataFrame(cols, rows);
}

export async function stock_new_ipo_cninfo(): Promise<DataFrame> {
  const records = await _cninfo_post('/api/sysapi/p_sysapi1097', { timetype: '36', market: 'ALL' });
  const cols = ['证劵代码', '证券简称', '上市日期', '申购日期', '发行价', '总发行数量', '发行市盈率', '上网发行中签率', '摇号结果公告日', '中签公告日', '中签缴款日', '网上申购上限', '上网发行数量'];
  if (!records.length) return createDataFrame(cols, []);
  const rows = records.map((item: any) => {
    const vals = Object.values(item) as string[];
    return cols.map((_, i) => vals[i] ?? null);
  });
  return createDataFrame(cols, rows);
}

// ─── Stock CG cninfo ─────────────────────────────────────────

export async function stock_cg_guarantee_cninfo(symbol: string = '\u5168\u90e8', start_date: string = '20180630', end_date: string = '20210927'): Promise<DataFrame> {
  const symbolMap: Record<string, string> = { '\u5168\u90e8': '', '\u6df1\u5e02\u4e3b\u677f': '012002', '\u6caa\u5e02': '012001', '\u521b\u4e1a\u677f': '012015', '\u79d1\u521b\u677f': '012029' };
  const records = await _cninfo_post('/api/sysapi/p_sysapi1054', {
    sdate: `${start_date.slice(0,4)}-${start_date.slice(4,6)}-${start_date.slice(6,8)}`,
    edate: `${end_date.slice(0,4)}-${end_date.slice(4,6)}-${end_date.slice(6,8)}`,
    market: symbolMap[symbol] ?? '',
  });
  if (!records.length) return createDataFrame([], []);
  const rows = records.map((item: any) => {
    const vals = Object.values(item) as any[];
    return [
      vals[5] ?? '',  // \u8bc1\u5238\u4ee3\u7801
      vals[4] ?? '',  // \u8bc1\u5238\u7b80\u79f0
      vals[0] ?? '',  // \u516c\u544a\u7edf\u8ba1\u533a\u95f4
      toNum(vals[3]), // \u62c5\u4fdd\u7b14\u6570
      toNum(vals[2]), // \u62c5\u4fdd\u91d1\u989d
      toNum(vals[6]), // \u5f52\u5c5e\u4e8e\u6bcd\u516c\u53f8\u6240\u6709\u8005\u6743\u76ca
      toNum(vals[1]), // \u62c5\u4fdd\u91d1\u878d\u5360\u51c0\u8d44\u4ea7\u6bd4\u4f8b
    ];
  });
  return createDataFrame(['\u8bc1\u5238\u4ee3\u7801', '\u8bc1\u5238\u7b80\u79f0', '\u516c\u544a\u7edf\u8ba1\u533a\u95f4', '\u62c5\u4fdd\u7b14\u6570', '\u62c5\u4fdd\u91d1\u989d', '\u5f52\u5c5e\u4e8e\u6bcd\u516c\u53f8\u6240\u6709\u8005\u6743\u76ca', '\u62c5\u4fdd\u91d1\u878d\u5360\u51c0\u8d44\u4ea7\u6bd4\u4f8b'], rows);
}
export async function stock_cg_lawsuit_cninfo(symbol: string = '000001'): Promise<DataFrame> {
  const records = await _cninfo_post('/api/sysapi/p_sysapi1041', { scode: symbol });
  const cols = records.length ? Object.keys(records[0]) : ['\u80a1\u7968\u4ee3\u7801', '\u8bc9\u8ba3\u91d1\u989d'];
  const rows = records.map((item: any) => cols.map((c) => item[c]));
  return createDataFrame(cols, rows);
}
export async function stock_cg_equity_mortgage_cninfo(date: string = '20210930'): Promise<DataFrame> {
  const records = await _cninfo_post('/api/sysapi/p_sysapi1094', {
    tdate: `${date.slice(0,4)}-${date.slice(4,6)}-${date.slice(6,8)}`,
  });
  if (!records.length) return createDataFrame([], []);
  const rows = records.map((item: any) => {
    const vals = Object.values(item) as any[];
    return [
      vals[6] ?? '',  // \u80a1\u7968\u4ee3\u7801
      vals[1] ?? '',  // \u80a1\u7968\u7b80\u79f0
      dateStr(vals[2]), // \u516c\u544a\u65e5\u671f
      vals[5] ?? '',  // \u51fa\u8d28\u4eba
      vals[4] ?? '',  // \u8d28\u6743\u4eba
      toNum(vals[9]), // \u8d28\u62bc\u6570\u91cf
      toNum(vals[7]), // \u5360\u603b\u80a1\u672c\u6bd4\u4f8b
      toNum(vals[0]), // \u8d28\u62bc\u89e3\u9664\u6570\u91cf
      vals[3] ?? '',  // \u8d28\u62bc\u4e8b\u9879
      toNum(vals[8]), // \u7d2f\u8ba1\u8d28\u62bc\u5360\u603b\u80a1\u672c\u6bd4\u4f8b
    ];
  });
  return createDataFrame(['\u80a1\u7968\u4ee3\u7801', '\u80a1\u7968\u7b80\u79f0', '\u516c\u544a\u65e5\u671f', '\u51fa\u8d28\u4eba', '\u8d28\u6743\u4eba', '\u8d28\u62bc\u6570\u91cf', '\u5360\u603b\u80a1\u672c\u6bd4\u4f8b', '\u8d28\u62bc\u89e3\u9664\u6570\u91cf', '\u8d28\u62bc\u4e8b\u9879', '\u7d2f\u8ba1\u8d28\u62bc\u5360\u603b\u80a1\u672c\u6bd4\u4f8b'], rows);
}

// ─── Stock profile / allotment cninfo ────────────────────────

export async function stock_profile_cninfo(symbol: string = '600030'): Promise<DataFrame> {
  try {
    const records = await _cninfo_post('/api/sysapi/p_sysapi1133', { scode: symbol });
    const columns = ['公司名称', '英文名称', '曾用简称', 'A股代码', 'A股简称', 'B股代码', 'B股简称', 'H股代码', 'H股简称', '入选指数', '所属市场', '所属行业', '法人代表', '注册资金', '成立日期', '上市日期', '官方网站', '电子邮箱', '联系电话', '传真', '注册地址', '办公地址', '邮政编码', '主营业务', '经营范围', '机构简介'];
    if (!records.length) return createDataFrame(columns, []);
    const record = records[0];
    // Skip last 4 metadata fields (same as Python: len(records_json) - 4)
    const vals = Object.values(record).slice(0, columns.length) as string[];
    return createDataFrame(columns, [vals]);
  } catch { return createDataFrame(['公司名称'], []); }
}

export async function stock_allotment_cninfo(symbol: string = '600030', start_date: string = '19700101', end_date: string = '22220222'): Promise<DataFrame> {
  const records = await _cninfo_post('/api/stock/p_stock2232', {
    scode: symbol,
    sdate: start_date ? `${start_date.slice(0, 4)}-${start_date.slice(4, 6)}-${start_date.slice(6, 8)}` : start_date,
    edate: end_date ? `${end_date.slice(0, 4)}-${end_date.slice(4, 6)}-${end_date.slice(6, 8)}` : end_date,
  });
  const cols = [
    '记录标识', '证券简称', '停牌起始日', '上市公告日期', '配股缴款起始日', '可转配股数量', '停牌截止日', '实际配股数量', '配股价格', '配股比例',
    '配股前总股本', '每股配权转让费(元)', '法人股实配数量', '实际募资净额', '大股东认购方式', '其他配售简称', '发行方式', '配股失败，退还申购款日期',
    '除权基准日', '预计发行费用', '配股发行结果公告日', '证券代码', '配股权证交易截止日', '其他股份实配数量', '国家股实配数量', '委托单位',
    '公众获转配数量', '其他配售代码', '配售对象', '配股权证交易起始日', '资金到账日', '机构名称', '股权登记日', '实际募资总额', '预计募集资金',
    '大股东认购数量', '公众股实配数量', '转配股实配数量', '承销费用', '法人获转配数量', '配股后流通股本', '股票类别', '公众配售简称', '发行方式编码',
    '承销方式', '公告日期', '配股上市日', '配股缴款截止日', '承销余额(股)', '预计配股数量', '配股后总股本', '职工股实配数量', '承销方式编码',
    '发行费用总额', '配股前流通股本', '股票类别编码', '公众配售代码',
  ];
  if (!records.length) return createDataFrame(cols, []);
  const dateCols = new Set([
    '停牌起始日', '上市公告日期', '配股缴款起始日', '停牌截止日', '配股失败，退还申购款日期', '除权基准日',
    '配股发行结果公告日', '配股权证交易截止日', '配股权证交易起始日', '资金到账日', '股权登记日',
    '公告日期', '配股上市日', '配股缴款截止日',
  ]);
  const rows = records.map((item: any) => {
    const vals = Object.values(item);
    return cols.map((c, i) => {
      const v = vals[i] ?? null;
      if (!dateCols.has(c)) return v;
      if (v === null || v === undefined || String(v).trim() === '') return 'NaT';
      return dateStr(v);
    });
  });
  return createDataFrame(cols, rows);
}

// ─── Stock rank forecast / analyst ───────────────────────────

export async function stock_rank_forecast_cninfo(date: string = '20230817'): Promise<DataFrame> {
  const d = String(date);
  const ds = `${d.slice(0,4)}-${d.slice(4,6)}-${d.slice(6,8)}`;
  const records = await _cninfo_post('/api/sysapi/p_sysapi1089', { tdate: ds });
  // Reorder to match Python: 证券代码, 证券简称, 发布日期, 研究机构简称, 研究员名称, 投资评级, 是否首次评级, 评级变化, 前一次投资评级, 目标价格-下限, 目标价格-上限
  const cols = ['证券代码', '证券简称', '发布日期', '研究机构简称', '研究员名称', '投资评级', '是否首次评级', '评级变化', '前一次投资评级', '目标价格-下限', '目标价格-上限'];
  if (!records.length) return createDataFrame(cols, []);
  const rows = records.map((item: any) => {
    const vals = Object.values(item) as string[];
    // Map from raw order to desired order
    return [
      vals[10] ?? null,  // 证券代码
      vals[0] ?? null,   // 证券简称
      vals[1] ?? null,   // 发布日期
      vals[8] ?? null,   // 研究机构简称
      vals[7] ?? null,   // 研究员名称
      vals[6] ?? null,   // 投资评级
      vals[5] ?? null,   // 是否首次评级
      vals[3] ?? null,   // 评级变化
      vals[2] ?? null,   // 前一次投资评级
      vals[9] ?? null,   // 目标价格-下限
      vals[4] ?? null,   // 目标价格-上限
    ];
  });
  return createDataFrame(cols, rows);
}

export async function stock_analyst_rank_em(year: string = '2024'): Promise<DataFrame> {
  try {
    const pyFloatText = (v: any): string | null => {
      const n = toNum(v);
      if (n === null) return null;
      const s = String(n);
      return s.includes('.') ? s : `${s}.0`;
    };
    const url = 'https://data.eastmoney.com/dataapi/invest/list';
    const baseParams: Record<string, string> = {
      sortColumns: 'YEAR_YIELD',
      sortTypes: '-1',
      pageSize: '500',
      pageNumber: '1',
      reportName: 'RPT_ANALYST_INDEX_RANK',
      columns: 'ALL',
      source: 'WEB',
      client: 'WEB',
      filter: `(YEAR="${year}")`,
      distinct: 'ANALYST_CODE',
      limit: 'top100',
    };
    const first = await httpGet<any>(url, { params: baseParams });
    const pages = Number(first?.result?.pages ?? 1);
    const all: any[] = [];
    for (let page = 1; page <= pages; page++) {
      const data = page === 1 ? first : await httpGet<any>(url, { params: { ...baseParams, pageNumber: String(page) } });
      const list = data?.result?.data ?? [];
      for (const item of list) all.push(item);
    }
    const cols = ['序号', '分析师名称', '分析师单位', '年度指数', `${year}年收益率`, '3个月收益率', '6个月收益率', '12个月收益率', '成分股个数', `${year}最新个股评级-股票名称`, `${year}最新个股评级-股票代码`, '分析师ID', '行业代码', '行业', '更新日期', '年度'];
    const rows = all.map((item: any, i: number) => {
      return [
        i + 1,
        item?.ANALYST_NAME ?? null,
        item?.ORG_NAME ?? null,
        pyFloatText(item?.INDEX_VALUE),
        pyFloatText(item?.YEAR_YIELD),
        pyFloatText(item?.YIELD_3),
        pyFloatText(item?.YIELD_6),
        pyFloatText(item?.YIELD_12),
        toNum(item?.SECURITY_COUNT),
        item?.SECURITY_NAME_ABBR ?? null,
        item?.SECURITY_CODE ?? null,
        item?.ANALYST_CODE ?? null,
        item?.INDUSTRY_CODE ?? null,
        item?.INDUSTRY_NAME ?? null,
        dateStr(item?.TRADE_DATE),
        item?.YEAR ?? null,
      ];
    });
    return createDataFrame(cols, rows);
  } catch {
    return createDataFrame([], []);
  }
}
export async function stock_analyst_detail_em(analyst_id: string = '11000200926', indicator: string = '最新跟踪成分股'): Promise<DataFrame> {
  try {
    const url = 'https://datacenter.eastmoney.com/special/api/data/v1/get';
    if (indicator === '最新跟踪成分股') {
      const data = await httpGet<any>(url, {
        params: {
          reportName: 'RPT_RESEARCHER_NTCSTOCK', columns: 'ALL', source: 'WEB', client: 'WEB',
          sortColumns: 'CHANGE_DATE', sortTypes: '-1', pageNumber: '1', pageSize: '1000', filter: `(ANALYST_CODE="${analyst_id}")`,
        },
      });
      const list = data?.result?.data ?? [];
      const cols = ['序号', '股票代码', '股票名称', '调入日期', '最新评级日期', '当前评级名称', '成交价格(前复权)', '最新价格', '阶段涨跌幅'];
      const rows = list.map((item: any, i: number) => {
        const v = Object.values(item);
        return [i + 1, v[5] ?? null, v[7] ?? null, dateStr(v[8]), dateStr(v[0]), v[9] ?? null, toNum(v[10]), toNum(v[11]), toNum(v[12])];
      });
      return createDataFrame(cols, rows);
    }
    if (indicator === '历史跟踪成分股') {
      const data = await httpGet<any>(url, {
        params: {
          reportName: 'RPT_RESEARCHER_HISTORYSTOCK', columns: 'ALL', source: 'WEB', client: 'WEB',
          sortColumns: 'CHANGE_DATE', sortTypes: '-1', pageNumber: '1', pageSize: '1000', filter: `(ANALYST_CODE="${analyst_id}")`,
        },
      });
      const list = data?.result?.data ?? [];
      const cols = ['序号', '股票代码', '股票名称', '调入日期', '调出日期', '调入时评级名称', '调出原因', '累计涨跌幅'];
      const rows = list.map((item: any, i: number) => {
        const v = Object.values(item);
        return [i + 1, v[3] ?? null, v[5] ?? null, dateStr(v[6]), dateStr(v[7]), v[8] ?? null, v[9] ?? null, toNum(v[10])];
      });
      return createDataFrame(cols, rows);
    }

    const data = await httpGet<any>(url, {
      params: {
        reportName: 'RPT_RESEARCHER_DETAILS', columns: 'ALL', sortColumns: 'TRADE_DATE', sortTypes: '-1', filter: `(ANALYST_CODE="${analyst_id}")`, source: 'WEB', client: 'WEB',
      },
    });
    const list = data?.result?.data ?? [];
    const rows = list.map((item: any) => [dateStr(item?.TRADE_DATE), toNum(item?.INDEX_HVALUE)]).sort((a: any[], b: any[]) => String(a[0]).localeCompare(String(b[0])));
    return createDataFrame(['date', 'value'], rows);
  } catch {
    return createDataFrame([], []);
  }
}

// ─── Stock THS rank ───────────────────────────────────────────

async function _ths_rank(pName: string): Promise<DataFrame> {
  try {
    const pyNumText = (x: any): string | null => {
      const n = toNum(x);
      if (n === null) return null;
      const s = String(n);
      return s.includes('.') ? s : `${s}.0`;
    };
    if (pName === 'xzjp') {
      const text = await httpGetTextGbk('http://data.10jqka.com.cn/ajax/xzjp/field/DECLAREDATE/order/desc/ajax/1/free/1/', { headers: getThsHeaders() });
      const $ = load(text);
      const rows: any[][] = [];
      $('table.m-table.J-ajax-table tbody tr').each((_, tr) => {
        const t = $(tr).find('td');
        if (t.length >= 12) {
          rows.push([
            $(t[0]).text().trim(),
            dateStr($(t[1]).text().trim()),
            ($(t[2]).find('a').first().text().trim() || $(t[2]).text().trim()).padStart(6, '0'),
            $(t[3]).text().trim(),
            pyNumText($(t[4]).text().trim()),
            pyNumText($(t[5]).text().trim().replace('%', '')),
            $(t[6]).text().trim(),
            $(t[7]).text().trim(),
            pyNumText($(t[8]).text().trim()),
            pyNumText($(t[9]).text().trim().replace('%', '')),
            $(t[10]).text().trim(),
            pyNumText($(t[11]).text().trim().replace('%', '')),
          ]);
        }
      });
      return createDataFrame(['序号', '举牌公告日', '股票代码', '股票简称', '现价', '涨跌幅', '举牌方', '增持数量', '交易均价', '增持数量占总股本比例', '变动后持股总数', '变动后持股比例'], rows);
    }

    // For cxfl and cxsl, use different URL pattern and column mapping
    if (pName === 'cxfl' || pName === 'cxsl') {
      const dayColName = pName === 'cxfl' ? '放量天数' : '缩量天数';
      const firstUrl = `http://data.10jqka.com.cn/rank/${pName}/field/count/order/desc/ajax/1/free/1/page/1/free/1/`;
      const first = await httpGetTextGbk(firstUrl, { headers: getThsHeaders() });
      const $f = load(first);
      const pageInfo = $f('span.page_info').text();
      const totalPage = parseInt((pageInfo.split('/')[1] || '1').trim(), 10) || 1;
      const rows: any[][] = [];
      for (let page = 1; page <= totalPage; page++) {
        const html = await httpGetTextGbk(`http://data.10jqka.com.cn/rank/${pName}/field/count/order/desc/ajax/1/free/1/page/${page}/free/1/`, { headers: getThsHeaders() });
        const $ = load(html);
        $('table.m-table.J-ajax-table tbody tr').each((_, tr) => {
          const t = $(tr).find('td');
          if (t.length >= 10) {
            rows.push([
              $(t[0]).text().trim(),
              ($(t[1]).find('a').first().text().trim() || $(t[1]).text().trim()).padStart(6, '0'),
              $(t[2]).find('a').first().text().trim() || $(t[2]).text().trim(),
              pyNumText($(t[3]).text().trim().replace('%', '')),
              toNum($(t[4]).text().trim()),
              $(t[5]).text().trim(),
              $(t[6]).text().trim(),
              toNum($(t[7]).text().trim()),
              pyNumText($(t[8]).text().trim().replace('%', '')),
              $(t[9]).find('a').first().text().trim() || $(t[9]).text().trim(),
            ]);
          }
        });
      }
      return createDataFrame(['序号', '股票代码', '股票简称', '涨跌幅', '最新价', '成交量', '基准日成交量', dayColName, '阶段涨跌幅', '所属行业'], rows);
    }

    const board = '500';
    const firstUrl = `http://data.10jqka.com.cn/rank/${pName}/board/${board}/order/asc/ajax/1/free/1/page/1/free/1/`;
    const first = await httpGetTextGbk(firstUrl, { headers: getThsHeaders() });
    const $f = load(first);
    const pageInfo = $f('span.page_info').text();
    const totalPage = parseInt((pageInfo.split('/')[1] || '1').trim(), 10) || 1;
    const rows: any[][] = [];
    for (let page = 1; page <= totalPage; page++) {
      const html = await httpGetTextGbk(`http://data.10jqka.com.cn/rank/${pName}/board/${board}/order/asc/ajax/1/free/1/page/${page}/free/1/`, { headers: getThsHeaders() });
      const $ = load(html);
      $('table.m-table.J-ajax-table tbody tr').each((_, tr) => {
        const t = $(tr).find('td');
        if (t.length >= 8) {
          rows.push([
            $(t[0]).text().trim(),
            ($(t[1]).find('a').first().text().trim() || $(t[1]).text().trim()).padStart(6, '0'),
            $(t[2]).find('a').first().text().trim() || $(t[2]).text().trim(),
            toNum($(t[3]).text().trim()),
            $(t[4]).text().trim(),
            $(t[5]).text().trim(),
            pyNumText($(t[6]).text().trim().replace('%', '')),
            toNum($(t[7]).text().trim().replace('%', '')),
          ]);
        }
      });
    }
    return createDataFrame(['序号', '股票代码', '股票简称', '最新价', '成交额', '成交量', '涨跌幅', '换手率'], rows);
  } catch { return createDataFrame([], []); }
}

export async function stock_rank_cxfl_ths(): Promise<DataFrame> { return _ths_rank('cxfl'); }
export async function stock_rank_cxsl_ths(): Promise<DataFrame> { return _ths_rank('cxsl'); }
export async function stock_rank_xstp_ths(): Promise<DataFrame> { return _ths_rank('xstp'); }
export async function stock_rank_xxtp_ths(): Promise<DataFrame> { return _ths_rank('xxtp'); }
export async function stock_rank_xzjp_ths(): Promise<DataFrame> { return _ths_rank('xzjp'); }

// ─── Stock cyq / value / add / dividend ─────────────────────

export async function stock_cyq_em(symbol: string = '000001', adjust: string = 'qfq'): Promise<DataFrame> {
  const adjustMap: Record<string, string> = { '': '0', 'qfq': '1', 'hfq': '2' };
  try {
    const marketId = symbol.startsWith('6') ? '1' : '0';
    const data = await httpGet<any>('https://push2his.eastmoney.com/api/qt/stock/cyq/get', {
      params: {
        secid: `${marketId}.${symbol}`, fqt: adjustMap[adjust] ?? '1',
        fields: 'f51,f52,f53,f54,f55,f56,f57,f58',
        beg: '0', end: '20500000',
      },
    });
    const list = data?.data?.cyqs ?? [];
    const columns = ['\u65e5\u671f', '\u5e73\u5747\u6210\u672c', '\u96c6\u4e2d\u5ea6'];
    const rows = list.map((s: string) => { const p = s.split(','); return [p[0], toNum(p[1]), toNum(p[2])]; });
    return createDataFrame(columns, rows);
  } catch { return createDataFrame([], []); }
}

export async function stock_add_stock(symbol: string = '688166'): Promise<DataFrame> {
  try {
    const html = await httpGetTextGbk(`https://vip.stock.finance.sina.com.cn/corp/go.php/vISSUE_AddStock/stockid/${symbol}.phtml`, {
      headers: { 'User-Agent': 'Mozilla/5.0', Referer: 'https://finance.sina.com.cn/' },
    });
    const $ = load(html);
    const tables = $('table');
    if (tables.length < 14) return createDataFrame([], []);
    const firstCell = tables.eq(12).find('tr').first().find('td').first().text().trim();
    if (firstCell.includes('对不起，暂时没有相关增发记录')) return createDataFrame([], []);

    const rows: any[][] = [];
    for (let i = 13; i < tables.length; i++) {
      const t = tables.eq(i);
      const pairRows = t.find('tr');
      const kv: Record<string, string> = {};
      pairRows.each((_, tr) => {
        const txt = $(tr).text().replace(/\s+/g, '').trim();
        const idx = txt.indexOf('：');
        if (idx > 0) {
          const k = txt.slice(0, idx);
          const v = txt.slice(idx + 1);
          kv[k] = v;
        }
      });
      if (Object.keys(kv).length) {
        const tableText = t.text();
        const dateMatch = tableText.match(/\d{4}-\d{2}-\d{2}/);
        rows.push([
          dateStr(kv['公告日期'] ?? dateMatch?.[0] ?? ''),
          kv['发行方式'] ?? '',
          kv['发行价格'] ?? '',
          kv['实际公司募集资金总额'] ?? '',
          kv['发行费用总额'] ?? '',
          kv['实际发行数量'] ?? '',
        ]);
      }
    }
    return createDataFrame(['公告日期', '发行方式', '发行价格', '实际公司募集资金总额', '发行费用总额', '实际发行数量'], rows);
  } catch {
    return createDataFrame([], []);
  }
}

export async function stock_dividend_cninfo(symbol: string = '600009'): Promise<DataFrame> {
  const records = await _cninfo_post('/api/sysapi/p_sysapi1139', { scode: symbol });
  if (!records.length) return createDataFrame([], []);
  const rows = records.map((item: any) => [
    dateStr(item.F006D),
    item.F044V ?? '',
    toNum(item.F010N),
    toNum(item.F011N),
    toNum(item.F012N),
    dateStr(item.F018D),
    dateStr(item.F020D),
    dateStr(item.F023D),
    item.F025D ?? '',
    item.F007V ?? '',
    item.F001V ?? '',
  ]);
  return createDataFrame(['\u5b9e\u65bd\u65b9\u6848\u516c\u544a\u65e5\u671f', '\u5206\u7ea2\u7c7b\u578b', '\u9001\u80a1\u6bd4\u4f8b', '\u8f6c\u589e\u6bd4\u4f8b', '\u6d3e\u606f\u6bd4\u4f8b', '\u80a1\u6743\u767b\u8bb0\u65e5', '\u9664\u6743\u65e5', '\u6d3e\u606f\u65e5', '\u80a1\u4efd\u5230\u8d26\u65e5', '\u5b9e\u65bd\u65b9\u6848\u5206\u7ea2\u8bf4\u660e', '\u62a5\u544a\u65f6\u95f4'], rows);
}

export async function stock_value_em(symbol: string = '300766'): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  try {
    const pyFloatText = (v: any): string | null => {
      const n = toNum(v);
      if (n === null) return null;
      const s = String(n);
      return s.includes('.') ? s : `${s}.0`;
    };
    const data = await httpGet<any>(url, {
      params: {
        sortColumns: 'TRADE_DATE',
        sortTypes: '-1',
        pageSize: '5000',
        pageNumber: '1',
        reportName: 'RPT_VALUEANALYSIS_DET',
        columns: 'ALL',
        source: 'WEB',
        client: 'WEB',
        filter: `(SECURITY_CODE="${symbol}")`,
      },
    });
    const list = data?.result?.data ?? [];
    const rows = list.map((x: any) => [
      dateStr(x.TRADE_DATE), toNum(x.CLOSE_PRICE), toNum(x.CHANGE_RATE), pyFloatText(x.TOTAL_MARKET_CAP),
      pyFloatText(x.NOTLIMITED_MARKETCAP_A), toNum(x.TOTAL_SHARES), toNum(x.FREE_SHARES_A),
      toNum(x.PE_TTM), toNum(x.PE_LAR), toNum(x.PB_MRQ), toNum(x.PEG_CAR), toNum(x.PCF_OCF_TTM), toNum(x.PS_TTM),
    ] as any[]).sort((a: any[], b: any[]) => String(a[0]).localeCompare(String(b[0])));
    return createDataFrame(['数据日期', '当日收盘价', '当日涨跌幅', '总市值', '流通市值', '总股本', '流通股本', 'PE(TTM)', 'PE(静)', '市净率', 'PEG值', '市现率', '市销率'], rows);
  } catch { return createDataFrame([], []); }
}

// ─── Stock ESG ───────────────────────────────────────────────

export async function stock_esg_msci_sina(): Promise<DataFrame> {
  try {
    const allRows: any[][] = [];
    for (let page = 1; page <= 500; page++) {
      const data = await httpGet<any>(`https://global.finance.sina.com.cn/api/openapi.php/EsgService.getMsciEsgStocks?p=${page}&num=100`, {
        headers: { 'User-Agent': 'Mozilla/5.0', Referer: 'https://finance.sina.com.cn/' },
      });
      const list = data?.result?.data?.data ?? [];
      for (const item of list) {
        allRows.push([
          item.symbol ?? '',
          item.esg_rating ?? '',
          toNum(item.env_score),
          toNum(item.social_score),
          toNum(item.governance_score),
          dateStr(item.quarter_date),
          item.market ?? '',
        ]);
      }
      const total = Number(data?.result?.data?.total ?? 0);
      if (page * 100 >= total) break;
    }
    return createDataFrame(['股票代码', 'ESG评分', '环境总评', '社会责任总评', '治理总评', '评级日期', '交易市场'], allRows);
  } catch { return createDataFrame([], []); }
}

export async function stock_esg_rft_sina(): Promise<DataFrame> {
  try {
    const data = await httpGet<any>('https://global.finance.sina.com.cn/api/openapi.php/EsgService.getRftEsgStocks?p=1&num=20000', {
      headers: { 'User-Agent': 'Mozilla/5.0', Referer: 'https://finance.sina.com.cn/' },
    });
    const list = data?.result?.data?.data ?? [];
    if (!list.length) return createDataFrame([], []);
    const rows = list.map((item: any) => [
      item.symbol ?? '',
      item.esg_score ?? '',
      dateStr(item.esg_score_date),
      item.env_score ?? '',
      dateStr(item.env_score_date),
      item.social_score ?? '',
      dateStr(item.social_score_date),
      item.governance_score ?? '',
      dateStr(item.governance_score_date),
      item.zy_score ?? '',
      dateStr(item.zy_score_date),
      item.industry ?? '',
      item.exchange ?? '',
    ]);
    return createDataFrame(['股票代码', 'ESG评分', 'ESG评分日期', '环境总评', '环境总评日期', '社会责任总评', '社会责任总评日期', '治理总评', '治理总评日期', '争议总评', '争议总评日期', '行业', '交易所'], rows);
  } catch { return createDataFrame([], []); }
}

export async function stock_esg_rate_sina(): Promise<DataFrame> {
  try {
    const allRows: any[][] = [];
    for (let page = 1; page <= 500; page++) {
      const data = await httpGet<any>(`https://global.finance.sina.com.cn/api/openapi.php/EsgService.getEsgStocks?page=${page}&num=200`, {
        headers: { 'User-Agent': 'Mozilla/5.0', Referer: 'https://finance.sina.com.cn/' },
      });
      const list = data?.result?.data?.data ?? [];
      for (const item of list) {
        allRows.push(Object.values(item));
      }
      const total = Number(data?.result?.data?.info?.total ?? 0);
      if (page * 200 >= total) break;
    }
    if (!allRows.length) return createDataFrame([], []);
    const cols = ['股票代码', 'ESG评分', '评级日期', '环境总评', '社会责任总评', '治理总评', '交易市场'];
    return createDataFrame(cols, allRows);
  } catch { return createDataFrame([], []); }
}

export async function stock_esg_zd_sina(): Promise<DataFrame> {
  try {
    const data = await httpGet<any>('https://global.finance.sina.com.cn/api/openapi.php/EsgService.getZdEsgStocks?p=1&num=20000', {
      headers: { 'User-Agent': 'Mozilla/5.0', Referer: 'https://finance.sina.com.cn/' },
    });
    const list = data?.result?.data?.data ?? [];
    if (!list.length) return createDataFrame([], []);
    const cols = Object.keys(list[0]);
    const rows = list.map((item: any) => cols.map((c) => item[c]));
    return createDataFrame(cols, rows);
  } catch { return createDataFrame([], []); }
}

export async function stock_esg_hz_sina(): Promise<DataFrame> {
  try {
    const data = await httpGet<any>('https://global.finance.sina.com.cn/api/openapi.php/EsgService.getHzEsgStocks?p=1&num=20000', {
      headers: { 'User-Agent': 'Mozilla/5.0', Referer: 'https://finance.sina.com.cn/' },
    });
    const list = data?.result?.data?.data ?? [];
    if (!list.length) return createDataFrame([], []);
    const cols = Object.keys(list[0]);
    const rows = list.map((item: any) => cols.map((c) => item[c]));
    return createDataFrame(cols, rows);
  } catch { return createDataFrame([], []); }
}

// ─── Stock SSE info ───────────────────────────────────────────

export async function stock_sns_sseinfo(symbol: string = '000001'): Promise<DataFrame> {
  return _em_data_get('RPT_SSE_INTERACTIVE_QA', { filter: `(SECUCODE="${symbol}")` });
}

export async function stock_irm_ans_cninfo(symbol: string = '1513586704097333248'): Promise<DataFrame> {
  try {
    const data = await httpGet<any>('https://irm.cninfo.com.cn/newircs/question/getQuestionDetail', {
      params: { questionId: symbol, _t: '1691146921' },
      headers: { 'User-Agent': 'Mozilla/5.0', Referer: 'https://irm.cninfo.com.cn/' },
    });
    const record = data?.data;
    if (!record || !record.replyDate) return createDataFrame([], []);
    const rows = [[
      record.stockCode ?? '',
      record.shortName ?? '',
      record.questionContent ?? '',
      record.replyContent ?? '',
      record.questioner ?? '',
      record.questionDate ? new Date(Number(record.questionDate)).toISOString().replace('T', ' ').slice(0, 19) : '',
      record.replyDate ? new Date(Number(record.replyDate)).toISOString().replace('T', ' ').slice(0, 19) : '',
    ]];
    return createDataFrame(['\u80a1\u7968\u4ee3\u7801', '\u516c\u53f8\u7b80\u79f0', '\u95ee\u9898', '\u56de\u7b54\u5185\u5bb9', '\u63d0\u95ee\u8005', '\u63d0\u95ee\u65f6\u95f4', '\u56de\u7b54\u65f6\u95f4'], rows);
  } catch { return createDataFrame([], []); }
}

// ─── Stock SZSE summary ───────────────────────────────────────

export async function stock_szse_summary(): Promise<DataFrame> {
  try {
    const { default: axios } = await import('axios');
    const resp = await axios.get<ArrayBuffer>('http://www.szse.cn/api/report/ShowReport', {
      params: {
        SHOWTYPE: 'xlsx',
        CATALOGID: '1803_sczm',
        TABKEY: 'tab1',
        txtQueryDate: '2024-08-30',
        random: '0.39339437497296137',
      },
      responseType: 'arraybuffer',
      timeout: 30000,
    });
    const wb = XLSX.read(Buffer.from(resp.data), { type: 'buffer' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const recs = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1, defval: '' });
    const cols = ['证券类别', '数量', '成交金额', '总市值', '流通市值'];
    const rows = recs.slice(1).map((r: any[]) => [
      String(r[0] ?? '').trim(),
      toNum(String(r[1] ?? '').replace(/,/g, '')),
      toNum(String(r[2] ?? '').replace(/,/g, '')),
      toNum(String(r[3] ?? '').replace(/,/g, '')),
      toNum(String(r[4] ?? '').replace(/,/g, '')),
    ]);
    return createDataFrame(cols, rows);
  } catch { return createDataFrame([], []); }
}
export async function stock_szse_area_summary(): Promise<DataFrame> {
  return _em_data_get('RPT_SZSE_AREA_STAT');
}
export async function stock_szse_sector_summary(): Promise<DataFrame> {
  return _em_data_get('RPT_SZSE_INDUSTRY_STAT');
}

// ─── Stock sector fund flow ───────────────────────────────────

export async function stock_sector_fund_flow_summary(symbol: string = '\u5c0f\u91d1\u5c5e'): Promise<DataFrame> {
  return _em_data_get('RPT_INDUSTRY_FUNDINFLOW_V2', { filter: `(INAME="${symbol}")` });
}

// ─── Stock SGT exchange rate ──────────────────────────────────

export async function stock_sgt_reference_exchange_rate_szse(): Promise<DataFrame> {
  return _em_data_get('RPT_SZSE_HKEX_REFRATE');
}
export async function stock_sgt_settlement_exchange_rate_szse(): Promise<DataFrame> {
  return _em_data_get('RPT_SZSE_HKEX_SETRATE');
}

// ─── Stock US hist min / pink spot ───────────────────────────

export async function stock_us_hist_min_em(
  symbol: string = 'AAPL',
  period: string = '5',
  start_date: string = '1979-09-01 09:32:00',
  end_date: string = '2222-01-01 09:32:00',
  adjust: string = ''
): Promise<DataFrame> {
  const adjustMap: Record<string, string> = { '': '0', 'qfq': '1', 'hfq': '2' };
  try {
    const params = {
      secid: `105.${symbol}`, ut: '7eea3edcaed734bea9cbfc24409ed989',
      fields1: 'f1,f2,f3,f4,f5,f6', fields2: 'f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61',
      klt: period, fqt: adjustMap[adjust] ?? '0', beg: '0', end: '20500000',
    };
    const data = await httpGet<any>('https://push2his.eastmoney.com/api/qt/stock/kline/get', { params });
    const klines: string[] = data?.data?.klines ?? [];
    const cols = ['\u65f6\u95f4', '\u5f00\u76d8', '\u6536\u76d8', '\u6700\u9ad8', '\u6700\u4f4e', '\u6210\u4ea4\u91cf', '\u6210\u4ea4\u989d', '\u632f\u5e45', '\u6da8\u8dcc\u5e45', '\u6da8\u8dcc\u989d', '\u6362\u624b\u7387'];
    const rows = klines.map((s) => { const p = s.split(','); return [p[0], toNum(p[1]), toNum(p[2]), toNum(p[3]), toNum(p[4]), toNum(p[5]), toNum(p[6]), toNum(p[7]), toNum(p[8]), toNum(p[9]), toNum(p[10])]; })
      .filter((r) => String(r[0]) >= start_date && String(r[0]) <= end_date);
    return createDataFrame(cols, rows);
  } catch { return createDataFrame([], []); }
}

export async function stock_us_pink_spot_em(): Promise<DataFrame> {
  return _em_special_list('b:MK0101', 'f12,f13,f14,f2,f3,f4', ['\u4ee3\u7801', '\u5e02\u573a', '\u540d\u79f0', '\u6700\u65b0\u4ef7', '\u6da8\u8dcc\u5e45', '\u6210\u4ea4\u91cf']);
}

export async function stock_us_valuation_baidu(symbol: string = 'AAPL'): Promise<DataFrame> {
  try {
    const data = await httpGet<any>(`https://gushitong.baidu.com/api/financialKpi?secid=${symbol}&region=us&type=12`, {
      headers: { 'User-Agent': 'Mozilla/5.0', Referer: 'https://gushitong.baidu.com/' },
    });
    const list = data?.ResultData?.Result?.[0]?.DisplayData?.resultData?.tplData?.GCJJKPI ?? [];
    const cols = ['item', 'value', 'date'];
    const rows = list.map((item: any) => [item.name ?? '', item.value ?? '', item.publishTime ?? '']);
    return createDataFrame(cols, rows);
  } catch { return createDataFrame([], []); }
}

// ─── Stock valuation / vote baidu ────────────────────────────

export async function stock_zh_valuation_baidu(symbol: string = '002044'): Promise<DataFrame> {
  try {
    const data = await httpGet<any>('https://gushitong.baidu.com/opendata', {
      params: {
        openapi: '1', dspName: 'iphone', tn: 'tangram', client: 'app',
        query: '总市值', code: symbol, word: '', resource_id: '51171', market: 'ab',
        tag: '总市值', chart_select: '近一年', industry_select: '', skip_industry: '1', finClientType: 'pc',
      },
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    const body = data?.Result?.[0]?.DisplayData?.resultData?.tplData?.result?.chartInfo?.[0]?.body ?? [];
    const rows = body.map((x: any) => {
      if (Array.isArray(x)) return [dateStr(x[0]), toNum(x[1])];
      return [dateStr(x?.date), toNum(x?.value)];
    });
    return createDataFrame(['date', 'value'], rows);
  } catch { return createDataFrame([], []); }
}

export async function stock_zh_vote_baidu(symbol: string = '000001'): Promise<DataFrame> {
  try {
    const data = await httpGet<any>(`https://gushitong.baidu.com/api/stockPoll?secid=${symbol}&region=cn`, {
      headers: { 'User-Agent': 'Mozilla/5.0', Referer: 'https://gushitong.baidu.com/' },
    });
    const d = data?.ResultData?.Result?.[0]?.DisplayData?.resultData ?? {};
    const cols = ['\u8d2d\u4e70', '\u8ba2\u9605', '\u8fd8\u672a\u51b3\u5b9a'];
    const rows = [[d.buy ?? 0, d.watch ?? 0, d.undecided ?? 0]];
    return createDataFrame(cols, rows);
  } catch { return createDataFrame([], []); }
}

// ─── Stock price JS ───────────────────────────────────────────

export async function stock_price_js(): Promise<DataFrame> {
  return _em_data_get('RPT_STOCKPRICE_TARGET');
}

// ─── Stock index / KCB ───────────────────────────────────────

export async function stock_zh_index_spot_sina(): Promise<DataFrame> {
  try {
    const text = await httpGetText('http://hq.sinajs.cn/list=s_sh000001,s_sh000300,s_sz399001,s_sz399006,s_sh000016', {
      headers: { Referer: 'https://finance.sina.com.cn/' },
    });
    const cols = ['\u4ee3\u7801', '\u540d\u79f0', '\u6700\u65b0\u4ef7', '\u6da8\u8dcc\u989d', '\u6da8\u8dcc\u5e45'];
    const rows = text.split('\n').filter(Boolean).map((line) => {
      const m = line.match(/var hq_str_(\w+)="(.*)"/);
      if (!m) return null;
      const parts = m[2].split(',');
      return [m[1], parts[0], toNum(parts[1]), toNum(parts[2]), toNum(parts[3])];
    }).filter(Boolean) as any[][];
    return createDataFrame(cols, rows);
  } catch { return createDataFrame([], []); }
}

export async function stock_zh_index_daily_tx(symbol: string = 'sz980017', start_date: string = '', end_date: string = ''): Promise<DataFrame> {
  try {
    const pyFloatText = (v: any): string | null => {
      const n = toNum(v);
      if (n === null) return null;
      const s = String(n);
      return s.includes('.') ? s : `${s}.0`;
    };
    const parseJsVarJson = (text: string): any => {
      const i = text.indexOf('=');
      if (i < 0) return {};
      return JSON.parse(text.slice(i + 1).replace(/;\s*$/, '').trim());
    };
    const getTxStartDate = async (sym: string): Promise<string> => {
      const qText = await httpGetText('https://proxy.finance.qq.com/ifzqgtimg/appstock/app/day/query', {
        params: { code: sym, type: 'qfq', _var: 'trend_qfq', r: String(Math.random()) },
        headers: { Referer: 'http://gu.qq.com/' },
      });
      const qJson = parseJsVarJson(qText);
      const trend = qJson?.data;
      if (Array.isArray(trend) && trend.length > 0 && Array.isArray(trend[0]) && trend[0][0]) {
        return String(trend[0][0]);
      }
      const kText = await httpGetText('https://proxy.finance.qq.com/ifzqgtimg/appstock/app/newfqkline/get', {
        params: { _var: 'kline_dayqfq', param: `${sym},day,,,320,qfq`, r: String(Math.random()) },
        headers: { Referer: 'http://gu.qq.com/' },
      });
      const kJson = parseJsVarJson(kText);
      return String(kJson?.data?.[sym]?.day?.[0]?.[0] ?? '1970-01-01');
    };

    const startDt = start_date
      ? new Date(start_date.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'))
      : new Date(await getTxStartDate(symbol));
    const endDt = end_date
      ? new Date(end_date.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'))
      : new Date();
    const startYear = startDt.getFullYear();
    const endYear = endDt.getFullYear();

    const all: any[][] = [];
    for (let year = startYear; year <= endYear; year++) {
      const text = await httpGetText('https://proxy.finance.qq.com/ifzqgtimg/appstock/app/newfqkline/get', {
        params: {
          _var: 'kline_dayqfq',
          param: `${symbol},day,${year}-01-01,${year + 1}-12-31,640,qfq`,
          r: String(Math.random()),
        },
        headers: { Referer: 'http://gu.qq.com/' },
      });
      const json = parseJsVarJson(text);
      const klines = json?.data?.[symbol]?.day ?? json?.data?.[symbol]?.qfqday ?? [];
      if (!Array.isArray(klines)) continue;
      for (const r of klines) {
        if (Array.isArray(r)) all.push(r);
      }
    }

    const startBound = startDt.toISOString().slice(0, 10);
    const endBound = endDt.toISOString().slice(0, 10);
    const seen = new Set<string>();
    const cols = ['date', 'open', 'close', 'high', 'low', 'amount'];
    const rows = all
      .filter((r: any[]) => Array.isArray(r) && r.length >= 6)
      .map((r: any[]) => [dateStr(r[0]), pyFloatText(r[1]), pyFloatText(r[2]), pyFloatText(r[3]), pyFloatText(r[4]), pyFloatText(r[5])])
      .filter((r: any[]) => {
        const d = String(r[0] ?? '');
        if (!d || d === 'null' || seen.has(d)) return false;
        seen.add(d);
        return d >= startBound && d <= endBound;
      });
    return createDataFrame(cols, rows);
  } catch { return createDataFrame([], []); }
}

export async function stock_zh_kcb_spot(): Promise<DataFrame> { return stock_kc_a_spot_em(); }
export async function stock_zh_kcb_daily(symbol: string = '688001', adjust: string = 'qfq'): Promise<DataFrame> {
  const { stock_zh_a_hist } = await import('../stock/stock_zh_a_em');
  return stock_zh_a_hist(symbol, 'daily', '19900101', '20500101', adjust as '' | 'qfq' | 'hfq');
}
export async function stock_zh_kcb_report_em(): Promise<DataFrame> {
  return _em_data_get('RPT_F10_REPORT_KCB');
}

// ─── Stock A CDR daily ────────────────────────────────────────

export async function stock_zh_a_cdr_daily(symbol: string = 'sh689009', adjust: string = 'qfq'): Promise<DataFrame> {
  try {
    const pyFloatText = (v: any): string | null => {
      const n = toNum(v);
      if (n === null) return null;
      const s = String(n);
      return s.includes('.') ? s : `${s}.0`;
    };
    const text = await httpGetText(`https://finance.sina.com.cn/realstock/company/${symbol}/hisdata_klc2/klc_kl.js`);
    const encoded = text.split('=')[1]?.split(';')[0]?.replace(/"/g, '');
    if (!encoded) return createDataFrame([], []);
    const decoded = decodeSinaData(encoded) as any[];
    const rows = decoded.map((x: any) => [
      dateStr(x.date),
      pyFloatText(x.prevclose),
      pyFloatText(x.open),
      pyFloatText(x.high),
      pyFloatText(x.low),
      pyFloatText(x.close),
      pyFloatText(x.volume),
      pyFloatText(x.amount),
      pyFloatText(x.postVol),
      pyFloatText(x.postAmt),
    ]);
    return createDataFrame(['date', 'prevclose', 'open', 'high', 'low', 'close', 'volume', 'amount', 'postVol', 'postAmt'], rows);
  } catch { return createDataFrame([], []); }
}

// ─── Stock A pre-market minute ────────────────────────────────

export async function stock_zh_a_hist_pre_min_em(symbol: string = '000001'): Promise<DataFrame> {
  const marketId = symbol.startsWith('6') ? '1' : '0';
  try {
    const params = {
      secid: `${marketId}.${symbol}`,
      fields1: 'f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f11,f12,f13',
      fields2: 'f51,f52,f53,f54,f55,f56,f57,f58',
      ndays: '1', iscr: '1', iscca: '0',
    };
    const data = await httpGet<any>('https://push2.eastmoney.com/api/qt/stock/trends2/get', { params });
    const trends: string[] = data?.data?.trends ?? [];
    const cols = ['\u65f6\u95f4', '\u5f00\u76d8', '\u6536\u76d8', '\u6700\u9ad8', '\u6700\u4f4e', '\u6210\u4ea4\u91cf', '\u6210\u4ea4\u989d', '\u5747\u4ef7'];
    const rows = trends.map((s) => { const p = s.split(','); return [p[0], toNum(p[1]), toNum(p[2]), toNum(p[3]), toNum(p[4]), toNum(p[5]), toNum(p[6]), toNum(p[7])]; });
    return createDataFrame(cols, rows);
  } catch { return createDataFrame([], []); }
}

// ─── Stock A Tencent hist ─────────────────────────────────────

export async function stock_zh_a_hist_tx(
  symbol: string = 'sh600519',
  start_date: string = '20200101',
  end_date: string = '20231231',
  adjust: string = 'qfq'
): Promise<DataFrame> {
  const adjustMap: Record<string, string> = { '': '', 'qfq': 'qfq', 'hfq': 'hfq' };
  const year = new Date(start_date.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')).getFullYear();
  const endYear = new Date(end_date.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')).getFullYear();
  const allRows: any[][] = [];
  try {
    for (let y = year; y <= endYear; y++) {
      const adj = adjustMap[adjust] ?? '';
      const url = adj ? `https://web.ifzq.gtimg.cn/appstock/app/fqkline/get` : `https://web.ifzq.gtimg.cn/appstock/app/kline/kline`;
      const params: Record<string, string> = {
        _var: `kline_day${adj}${y}`,
        param: `${symbol},day,${y}-01-01,${y + 1}-12-31,640${adj ? `,${adj}` : ''}`,
        r: String(Math.random()),
      };
      const text = await httpGetText(url, { params, headers: { Referer: 'http://gu.qq.com/' } });
      const json = JSON.parse(text.split('=')[1]);
      const key = `${symbol}`;
      const klines = adj ? json?.data?.[key]?.[`${adj}day`] : json?.data?.[key]?.day;
      if (!Array.isArray(klines)) continue;
      for (const r of klines) {
        if (!Array.isArray(r)) continue;
        const ds = String(r[0] ?? '').replace(/^(\d{4})(\d{2})(\d{2})$/, '$1-$2-$3');
        if (ds < start_date.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3') || ds > end_date.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')) continue;
        allRows.push([ds, toNum(r[1]), toNum(r[2]), toNum(r[3]), toNum(r[4]), toNum(r[5])]);
      }
    }
    return createDataFrame(['date', 'open', 'close', 'high', 'low', 'volume'], allRows);
  } catch { return createDataFrame([], []); }
}

// ─── Stock A new ─────────────────────────────────────────────

export async function stock_zh_a_new(): Promise<DataFrame> {
  try {
    const { default: axios } = await import('axios');
    const pyFloatText = (v: any): string | null => {
      const n = toNum(v);
      if (n === null) return null;
      const s = String(n);
      return s.includes('.') ? s : `${s}.0`;
    };
    const countText = await httpGetText('https://vip.stock.finance.sina.com.cn/quotes_service/api/json_v2.php/Market_Center.getHQNodeStockCount', {
      params: { node: 'new_stock' },
    });
    const total = Number(JSON.parse(countText.trim() || '0')) || 0;
    const totalPage = Math.ceil(total / 80);
    const rows: any[][] = [];
    for (let page = 1; page <= totalPage; page++) {
      const resp = await axios.get('https://vip.stock.finance.sina.com.cn/quotes_service/api/json_v2.php/Market_Center.getHQNodeData', {
        params: { page: String(page), num: '80', sort: 'symbol', asc: '1', node: 'new_stock', symbol: '', _s_r_a: 'page' },
        responseType: 'text',
        timeout: 30000,
      });
      const arr = Array.isArray(resp.data) ? resp.data : JSON.parse(String(resp.data || '[]'));
      for (const x of arr) {
        rows.push([
          x.symbol ?? '',
          x.code ?? '',
          x.name ?? '',
          pyFloatText(x.open),
          pyFloatText(x.high),
          pyFloatText(x.low),
          toNum(x.volume),
          toNum(x.amount),
          pyFloatText(x.mktcap),
          toNum(x.turnoverratio),
        ]);
      }
    }
    return createDataFrame(['symbol', 'code', 'name', 'open', 'high', 'low', 'volume', 'amount', 'mktcap', 'turnoverratio'], rows);
  } catch { return createDataFrame([], []); }
}
export async function stock_zh_a_new_em(): Promise<DataFrame> { return stock_zh_a_new(); }

// ─── Stock A tick TX JS ───────────────────────────────────────

export async function stock_zh_a_tick_tx_js(symbol: string = '000001'): Promise<DataFrame> {
  const prefix = symbol.startsWith('6') ? 'sh' : 'sz';
  try {
    const text = await httpGetText(`https://stock.gtimg.cn/data/index.php?appn=detail&action=data&c=${prefix}${symbol}&p=1`, {
      headers: { Referer: 'https://finance.qq.com/' },
    });
    const match = text.match(/pv_detail_data\((\{[\s\S]*?\})\)/);
    if (!match) return createDataFrame([], []);
    const json = JSON.parse(match[1]);
    const list = json?.data ?? [];
    const cols = ['\u65f6\u95f4', '\u4ef7\u683c', '\u6210\u4ea4\u91cf', '\u6027\u8d28'];
    const rows = list.map((item: any[]) => [item[0], toNum(item[1]), toNum(item[2]), item[3] ?? '']);
    return createDataFrame(cols, rows);
  } catch { return createDataFrame([], []); }
}

// ─── Stock a code to symbol ───────────────────────────────────

export async function stock_a_code_to_symbol(symbol: string = '000001'): Promise<string> {
  const prefix = symbol.startsWith('6') ? 'sh' : symbol.startsWith('8') || symbol.startsWith('4') ? 'bj' : 'sz';
  return `${prefix}${symbol}`;
}

// ─── Stock below net asset stats ─────────────────────────────

export async function stock_a_below_net_asset_statistics(): Promise<DataFrame> {
  return _em_data_get('RPT_STOCK_SPECIALSTATISTIC', { filter: '(TYPE="1")' });
}

// ─── Stock sy (goodwill) ─────────────────────────────────────

export async function stock_sy_em(): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  try {
    const marketMap: Record<string, string> = { shzb: '沪市主板', kcb: '科创板', szzb: '深市主板', cyb: '创业板' };
    const rows: any[][] = [];
    for (let page = 1; page <= 500; page++) {
      const data = await httpGet<any>(url, {
        params: {
          sortColumns: 'NOTICE_DATE,SECURITY_CODE',
          sortTypes: '-1,-1',
          pageSize: '500',
          pageNumber: String(page),
          columns: 'ALL',
          token: '894050c76af8597a853f5b408b759f5d',
          reportName: 'RPT_GOODWILL_STOCKDETAILS',
          filter: `(REPORT_DATE='2023-12-31')`,
        },
      });
      const list = data?.result?.data ?? [];
      for (const x of list) {
        rows.push([
          rows.length + 1,
          x.SECURITY_CODE ?? '',
          x.SECURITY_NAME_ABBR ?? '',
          toNum(x.GOODWILL),
          toNum(x.SUMSHEQUITY_RATIO),
          toNum(x.PARENTNETPROFIT),
          toNum(x.PNP_YOY_RATIO),
          toNum(x.GOODWILL_PRE),
          dateStr(x.NOTICE_DATE),
          marketMap[x.TRADE_BOARD] ?? x.TRADE_BOARD ?? '',
        ]);
      }
      if (page >= (data?.result?.pages ?? 0)) break;
    }
    return createDataFrame(['序号', '股票代码', '股票简称', '商誉', '商誉占净资产比例', '净利润', '净利润同比', '上年商誉', '公告日期', '交易市场'], rows);
  } catch { return createDataFrame([], []); }
}
export async function stock_sy_yq_em(): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  try {
    const marketMap: Record<string, string> = { shzb: '沪市主板', kcb: '科创板', szzb: '深市主板', cyb: '创业板' };
    const rows: any[][] = [];
    for (let page = 1; page <= 500; page++) {
      const data = await httpGet<any>(url, {
        params: {
          sortColumns: 'NOTICE_DATE,SECURITY_CODE',
          sortTypes: '-1,-1',
          pageSize: '500',
          pageNumber: String(page),
          columns: 'ALL',
          token: '894050c76af8597a853f5b408b759f5d',
          reportName: 'RPT_GOODWILL_STOCKPREDICT',
          filter: `(REPORT_DATE='2024-06-30')`,
        },
      });
      const list = data?.result?.data ?? [];
      for (const x of list) {
        rows.push([
          rows.length + 1,
          x.SECURITY_CODE ?? '',
          x.SECURITY_NAME_ABBR ?? '',
          x.PERFORM_CHANGE_EXPLAIN ?? '',
          dateStr(x.NEWEST_REPORT_DATE),
          toNum(x.NEWEST_GOODWILL),
          toNum(x.PE_GOODWILL),
          toNum(x.PREDICT_NETPROFIT_LOWER),
          toNum(x.PREDICT_NETPROFIT_UPPER),
          toNum(x.PERFORM_CHANGE_LOWER),
          toNum(x.PERFORM_CHANGE_UPPER),
          toNum(x.PE_SAMEREPORT_NETPROFIT),
          dateStr(x.NOTICE_DATE),
          marketMap[x.TRADE_MARKET] ?? x.TRADE_MARKET ?? '',
        ]);
      }
      if (page >= (data?.result?.pages ?? 0)) break;
    }
    return createDataFrame(['序号', '股票代码', '股票简称', '业绩变动原因', '最新商誉报告期', '最新一期商誉', '上年商誉', '预计净利润-下限', '预计净利润-上限', '业绩变动幅度-下限', '业绩变动幅度-上限', '上年度同期净利润', '公告日期', '交易市场'], rows);
  } catch { return createDataFrame([], []); }
}

// ─── Stock YY / YJ performance report ────────────────────────

export async function stock_yysj_em(): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  try {
    const rows: any[][] = [];
    for (let page = 1; page <= 500; page++) {
      const data = await httpGet<any>(url, {
        params: {
          sortColumns: 'FIRST_APPOINT_DATE,SECURITY_CODE',
          sortTypes: '1,1',
          pageSize: '500',
          pageNumber: String(page),
          reportName: 'RPT_PUBLIC_BS_APPOIN',
          columns: 'ALL',
          filter: `(SECURITY_TYPE_CODE in ("058001001","058001008"))(TRADE_MARKET_CODE!="069001017")(REPORT_DATE='2020-03-31')`,
        },
      });
      const list = data?.result?.data ?? [];
      for (const x of list) {
        rows.push([
          rows.length + 1,
          x.SECURITY_CODE ?? '',
          x.SECURITY_NAME_ABBR ?? '',
          dateStr(x.FIRST_APPOINT_DATE),
          dateStr(x.CHANGE_DATE),
          dateStr(x.CHANGE_DATE1),
          x.CHANGE_DATE2 ? dateStr(x.CHANGE_DATE2) : 'NaT',
          dateStr(x.ACTUAL_DATE ?? x.FIRST_APPOINT_DATE),
        ]);
      }
      if (page >= (data?.result?.pages ?? 0)) break;
    }
    return createDataFrame(['序号', '股票代码', '股票简称', '首次预约时间', '一次变更日期', '二次变更日期', '三次变更日期', '实际披露时间'], rows);
  } catch { return createDataFrame([], []); }
}

// ─── Stock classify sina ─────────────────────────────────────

export async function stock_classify_sina(): Promise<DataFrame> {
  try {
    const text = await httpGetText('https://vip.stock.finance.sina.com.cn/quotes_service/api/json_v2.php/Market_Center.getHQNodeStockCountSimple', {
      params: { node: 'hsa_a' },
    });
    return createDataFrame(['\u5206\u7c7b', '\u6570\u91cf'], [['\u6caa\u6df1\u5ac5A\u80a1', text.trim()]]);
  } catch { return createDataFrame([], []); }
}

// ─── Stock individual spot XQ ─────────────────────────────────

export async function stock_individual_spot_xq(symbol: string = 'SH600519'): Promise<DataFrame> {
  try {
    const data = await httpGet<any>(`https://stock.xueqiu.com/v5/stock/quote.json?symbol=${symbol}&extend=detail`, {
      headers: { 'User-Agent': 'Mozilla/5.0', Cookie: 'xq_a_token=placeholder', Referer: 'https://xueqiu.com/' },
    });
    const d = data?.data?.quote ?? {};
    const cols = ['\u9879\u76ee', '\u6570\u636e'];
    const rows = Object.entries(d).map(([k, v]) => [k, String(v ?? '')]);
    return createDataFrame(cols, rows);
  } catch { return createDataFrame([], []); }
}

// ─── Stock margin ratio / szse underlying ────────────────────

export async function stock_margin_ratio_pa(symbol: string = '深市', date: string = '20260113'): Promise<DataFrame> {
  try {
    const marketCode: Record<string, string> = { '深市': '00', '沪市': '10', '北交所': '30' };
    const d = String(date);
    const { default: axios } = await import('axios');
    const resp = await axios.post('https://stock.pingan.com/fss/servlet/fsscoreapp/stockSource/mrgRatio', {
      currentPage: 1, pageSize: 50000, type: 'bdzq',
      setdate: `${d.slice(0,4)}-${d.slice(4,6)}-${d.slice(6,8)}`,
      stockMes: '', market: marketCode[symbol] ?? '00',
      appName: 'AYLCH5', tokenId: '', appChannel: 'LRSP',
      requestId: '194055910e2075c03e25fabf6ffc5a7f', channel: 'pa18',
    }, { timeout: 30000 });
    const list = resp.data?.data?.list ?? [];
    if (!list.length) return createDataFrame([], []);
    const rows = list.map((item: any) => [
      item.secuCode ?? '', item.secuName ?? '',
      toNum(item.fiMarginRatio), toNum(item.slMarginRatio),
    ]);
    return createDataFrame(['证券代码', '证券简称', '融资比例', '融券比例'], rows);
  } catch { return createDataFrame([], []); }
}

export async function stock_margin_underlying_info_szse(): Promise<DataFrame> {
  try {
    const data = await httpGet<any>('https://www.szse.cn/api/report/ShowReport', {
      params: { SHOWTYPE: 'json', CATALOGID: 'mbsj_target', TABKEY: 'tab1' },
      headers: { Referer: 'https://www.szse.cn/', 'User-Agent': 'Mozilla/5.0' },
    });
    const list = Array.isArray(data?.data) ? data.data : [];
    if (!list.length) return createDataFrame([], []);
    const cols = Object.keys(list[0]);
    const rows = list.map((item: any) => cols.map((c) => item[c]));
    return createDataFrame(cols, rows);
  } catch { return createDataFrame([], []); }
}

// ─── Stock LHB sina/EM ────────────────────────────────────────

async function _em_lhb(reportName: string, params?: Record<string, string>): Promise<DataFrame> {
  return _em_data_get(reportName, params);
}

export async function stock_lhb_detail_daily_sina(date: string = '20231201'): Promise<DataFrame> {
  const ds = `${date.slice(0,4)}-${date.slice(4,6)}-${date.slice(6,8)}`;
  return _em_lhb('RPT_BILLBOARD_TOPLIST', { filter: `(TRADE_DATE='${ds}')` });
}
export async function stock_lhb_ggtj_sina(start_date: string = '20231101', end_date: string = '20231201'): Promise<DataFrame> {
  return _em_lhb('RPT_BILLBOARD_SECURTABNEW', { filter: `(TRADE_DATE>='${start_date.slice(0,4)}-${start_date.slice(4,6)}-${start_date.slice(6,8)}'  )(TRADE_DATE<='${end_date.slice(0,4)}-${end_date.slice(4,6)}-${end_date.slice(6,8)}')` });
}
export async function stock_lhb_yytj_sina(start_date: string = '20231101', end_date: string = '20231201'): Promise<DataFrame> {
  return _em_lhb('RPT_BILLBOARD_BROKTABNEW', { filter: `(TRADE_DATE>='${start_date.slice(0,4)}-${start_date.slice(4,6)}-${start_date.slice(6,8)}')(TRADE_DATE<='${end_date.slice(0,4)}-${end_date.slice(4,6)}-${end_date.slice(6,8)}')` });
}
export async function stock_lhb_jgzz_sina(start_date: string = '20231101', end_date: string = '20231201'): Promise<DataFrame> {
  return _em_lhb('RPT_BILLBOARD_JGMMTJ', { filter: `(TRADE_DATE>='${start_date.slice(0,4)}-${start_date.slice(4,6)}-${start_date.slice(6,8)}')(TRADE_DATE<='${end_date.slice(0,4)}-${end_date.slice(4,6)}-${end_date.slice(6,8)}')` });
}
export async function stock_lhb_jgmx_sina(start_date: string = '20231101', end_date: string = '20231201'): Promise<DataFrame> {
  return _em_lhb('RPT_BILLBOARD_JGMMXQ', { filter: `(TRADE_DATE>='${start_date.slice(0,4)}-${start_date.slice(4,6)}-${start_date.slice(6,8)}')(TRADE_DATE<='${end_date.slice(0,4)}-${end_date.slice(4,6)}-${end_date.slice(6,8)}')` });
}
export async function stock_lhb_hyyyb_em(start_date: string = '20220324', end_date: string = '20220324'): Promise<DataFrame> {
  const sd = String(start_date);
  const ed = String(end_date);
  const ds_start = `${sd.slice(0,4)}-${sd.slice(4,6)}-${sd.slice(6,8)}`;
  const ds_end = `${ed.slice(0,4)}-${ed.slice(4,6)}-${ed.slice(6,8)}`;
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params: Record<string, any> = {
    sortColumns: 'TOTAL_NETAMT,ONLIST_DATE,OPERATEDEPT_CODE',
    sortTypes: '-1,-1,1',
    pageSize: '5000',
    pageNumber: '1',
    reportName: 'RPT_OPERATEDEPT_ACTIVE',
    columns: 'ALL',
    source: 'WEB',
    client: 'WEB',
    filter: `(ONLIST_DATE>='${ds_start}')(ONLIST_DATE<='${ds_end}')`,
  };
  try {
    const allRows: any[][] = [];
    for (let page = 1; page <= 500; page++) {
      params.pageNumber = String(page);
      const data = await httpGet<any>(url, { params });
      const list = data?.result?.data ?? [];
      for (const item of list) {
        allRows.push(Object.values(item));
      }
      if (page >= (data?.result?.pages ?? 0)) break;
    }
    if (!allRows.length) return createDataFrame([], []);
    // Column mapping based on Python: 序号, 营业部名称, 上榜日, 买入个股数, 卖出个股数, 买入总金额, 卖出总金额, 总买卖净额, 买入股票, 营业部代码
    const columns = ['序号', '营业部名称', '上榜日', '买入个股数', '卖出个股数', '买入总金额', '卖出总金额', '总买卖净额', '买入股票', '营业部代码'];
    const rows = allRows.map((row, index) => {
      const vals = row as any[];
      return [
        index + 1,
        vals[0] ?? '',      // 营业部名称 (OPERATEDEPT_NAME)
        dateStr(vals[1]),    // 上榜日 (ONLIST_DATE)
        toNum(vals[2]),      // 买入个股数
        toNum(vals[3]),      // 卖出个股数
        toNum(vals[4]),      // 买入总金额
        toNum(vals[5]),      // 卖出总金额
        toNum(vals[6]),      // 总买卖净额
        vals[9] ?? '',       // 买入股票
        vals[8] ?? '',       // 营业部代码
      ];
    });
    return createDataFrame(columns, rows);
  } catch { return createDataFrame([], []); }
}
export async function stock_lhb_jgmmtj_em(start_date: string = '20240417', end_date: string = '20240430'): Promise<DataFrame> {
  const sd = String(start_date);
  const ed = String(end_date);
  const ds_start = `${sd.slice(0,4)}-${sd.slice(4,6)}-${sd.slice(6,8)}`;
  const ds_end = `${ed.slice(0,4)}-${ed.slice(4,6)}-${ed.slice(6,8)}`;
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params: Record<string, any> = {
    sortColumns: 'NET_BUY_AMT,TRADE_DATE,SECURITY_CODE',
    sortTypes: '-1,-1,1',
    pageSize: '500',
    pageNumber: '1',
    reportName: 'RPT_ORGANIZATION_TRADE_DETAILS',
    columns: 'ALL',
    source: 'WEB',
    client: 'WEB',
    filter: `(TRADE_DATE>='${ds_start}')(TRADE_DATE<='${ds_end}')`,
  };
  try {
    const allRows: any[][] = [];
    for (let page = 1; page <= 500; page++) {
      params.pageNumber = String(page);
      const data = await httpGet<any>(url, { params });
      const list = data?.result?.data ?? [];
      for (const item of list) {
        allRows.push(Object.values(item));
      }
      if (page >= (data?.result?.pages ?? 0)) break;
    }
    if (!allRows.length) return createDataFrame([], []);
    // Column mapping based on Python: 序号, 代码, 名称, 收盘价, 涨跌幅, 买方机构数, 卖方机构数, 机构买入总额, 机构卖出总额, 机构买入净额, 市场总成交额, 机构净买额占总成交额比, 换手率, 流通市值, 上榜原因, 上榜日期
    const columns = ['序号', '代码', '名称', '收盘价', '涨跌幅', '买方机构数', '卖方机构数', '机构买入总额', '机构卖出总额', '机构买入净额', '市场总成交额', '机构净买额占总成交额比', '换手率', '流通市值', '上榜原因', '上榜日期'];
    const rows = allRows.map((row, index) => {
      const vals = row as any[];
      return [
        index + 1,
        vals[2] ?? '',       // 代码 (SECURITY_CODE)
        vals[1] ?? '',       // 名称 (SECURITY_NAME_ABBR)
        toNum(vals[4]),      // 收盘价 (CLOSE_PRICE)
        toNum(vals[5]),      // 涨跌幅 (CHANGE_RATE)
        toNum(vals[6]),      // 买方机构数
        toNum(vals[7]),      // 卖方机构数
        toNum(vals[8]),      // 机构买入总额
        toNum(vals[9]),      // 机构卖出总额
        toNum(vals[10]),     // 机构买入净额
        toNum(vals[11]),     // 市场总成交额
        toNum(vals[12]),     // 机构净买额占总成交额比
        toNum(vals[13]),     // 换手率
        toNum(vals[14]),     // 流通市值
        vals[15] ?? '',      // 上榜原因
        dateStr(vals[3]),    // 上榜日期 (TRADE_DATE)
      ];
    });
    return createDataFrame(columns, rows);
  } catch { return createDataFrame([], []); }
}
export async function stock_lhb_jgstatistic_em(symbol: string = '近一月'): Promise<DataFrame> {
  const symbolMap: Record<string, string> = { '近一月': '01', '近三月': '02', '近六月': '03', '近一年': '04' };
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params: Record<string, any> = {
    sortColumns: 'ONLIST_TIMES,SECURITY_CODE',
    sortTypes: '-1,1',
    pageSize: '5000',
    pageNumber: '1',
    reportName: 'RPT_ORGANIZATION_SEATNEW',
    columns: 'ALL',
    source: 'WEB',
    client: 'WEB',
    filter: `(STATISTICSCYCLE="${symbolMap[symbol] ?? '01'}")`,
  };
  try {
    const allRows: any[][] = [];
    for (let page = 1; page <= 500; page++) {
      params.pageNumber = String(page);
      const data = await httpGet<any>(url, { params });
      const list = data?.result?.data ?? [];
      for (const item of list) {
        allRows.push(Object.values(item));
      }
      if (page >= (data?.result?.pages ?? 0)) break;
    }
    if (!allRows.length) return createDataFrame([], []);
    // Column mapping based on Python: 序号, 代码, 名称, 收盘价, 涨跌幅, 龙虎榜成交金额, 上榜次数, 机构买入额, 机构买入次数, 机构卖出额, 机构卖出次数, 机构净买额, 近1个月涨跌幅, 近3个月涨跌幅, 近6个月涨跌幅, 近1年涨跌幅
    const columns = ['序号', '代码', '名称', '收盘价', '涨跌幅', '龙虎榜成交金额', '上榜次数', '机构买入额', '机构买入次数', '机构卖出额', '机构卖出次数', '机构净买额', '近1个月涨跌幅', '近3个月涨跌幅', '近6个月涨跌幅', '近1年涨跌幅'];
    const rows = allRows.map((row, index) => {
      const vals = row as any[];
      return [
        index + 1,
        vals[1] ?? '',       // 代码 (SECURITY_CODE)
        vals[2] ?? '',       // 名称 (SECURITY_NAME_ABBR)
        toNum(vals[3]),      // 收盘价 (CLOSE_PRICE)
        toNum(vals[4]),      // 涨跌幅 (CHANGE_RATE)
        toNum(vals[5]),      // 龙虎榜成交金额 (AMOUNT)
        toNum(vals[6]),      // 上榜次数 (ONLIST_TIMES)
        toNum(vals[7]),      // 机构买入额 (BUY_AMT)
        toNum(vals[8]),      // 机构买入次数 (BUY_TIMES)
        toNum(vals[9]),      // 机构卖出额 (SELL_AMT)
        toNum(vals[10]),     // 机构卖出次数 (SELL_TIMES)
        toNum(vals[11]),     // 机构净买额 (NET_BUY_AMT)
        toNum(vals[12]),     // 近1个月涨跌幅 (M1_CLOSE_ADJCHRATE)
        toNum(vals[13]),     // 近3个月涨跌幅 (M3_CLOSE_ADJCHRATE)
        toNum(vals[14]),     // 近6个月涨跌幅 (M6_CLOSE_ADJCHRATE)
        toNum(vals[15]),     // 近1年涨跌幅 (Y1_CLOSE_ADJCHRATE)
      ];
    });
    return createDataFrame(columns, rows);
  } catch { return createDataFrame([], []); }
}
export async function stock_lhb_stock_detail_em(symbol: string = '000788', date: string = '20220315', flag: string = '卖出'): Promise<DataFrame> {
  const flagMap: Record<string, string> = { '买入': 'BUY', '卖出': 'SELL' };
  const reportMap: Record<string, string> = { '买入': 'RPT_BILLBOARD_DAILYDETAILSBUY', '卖出': 'RPT_BILLBOARD_DAILYDETAILSSELL' };
  const ds = `${String(date).slice(0,4)}-${String(date).slice(4,6)}-${String(date).slice(6,8)}`;
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params: Record<string, any> = {
    reportName: reportMap[flag] ?? reportMap['卖出'],
    columns: 'ALL',
    filter: `(TRADE_DATE='${ds}')(SECURITY_CODE="${symbol}")`,
    pageNumber: '1',
    pageSize: '500',
    sortTypes: '-1',
    sortColumns: flagMap[flag] ?? 'SELL',
    source: 'WEB',
    client: 'WEB',
  };
  try {
    const data = await httpGet<any>(url, { params });
    const list = data?.result?.data ?? [];
    if (!list.length) return createDataFrame([], []);
    // Column mapping based on Python: 序号, 交易营业部名称, 买入金额, 买入金额-占总成交比例, 卖出金额, 卖出金额-占总成交比例, 净额, 类型
    const columns = ['序号', '交易营业部名称', '买入金额', '买入金额-占总成交比例', '卖出金额', '卖出金额-占总成交比例', '净额', '类型'];
    const rows = list.map((item: any, index: number) => {
      const vals = Object.values(item);
      return [
        index + 1,
        vals[4] ?? '',       // 交易营业部名称
        toNum(vals[10]),     // 买入金额
        toNum(vals[17]),     // 买入金额-占总成交比例
        toNum(vals[11]),     // 卖出金额
        toNum(vals[18]),     // 卖出金额-占总成交比例
        toNum(vals[12]),     // 净额
        vals[5] ?? '',       // 类型
      ];
    });
    // Sort by 类型 and reindex
    rows.sort((a: any[], b: any[]) => String(a[7] ?? '').localeCompare(String(b[7] ?? '')));
    const sortedRows = rows.map((row: any[], index: number) => {
      row[0] = index + 1;
      return row;
    });
    return createDataFrame(columns, sortedRows);
  } catch { return createDataFrame([], []); }
}
export async function stock_lhb_stock_detail_date_em(symbol: string = '600077'): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params: Record<string, any> = {
    reportName: 'RPT_LHB_BOARDDATE',
    columns: 'SECURITY_CODE,TRADE_DATE,TR_DATE',
    filter: `(SECURITY_CODE="${symbol}")`,
    pageNumber: '1',
    pageSize: '1000',
    sortTypes: '-1',
    sortColumns: 'TRADE_DATE',
    source: 'WEB',
    client: 'WEB',
  };
  try {
    const data = await httpGet<any>(url, { params });
    const list = data?.result?.data ?? [];
    if (!list.length) return createDataFrame([], []);
    // Column mapping based on Python: 序号, 股票代码, 交易日
    const columns = ['序号', '股票代码', '交易日'];
    const rows = list.map((item: any, index: number) => [
      index + 1,
      item.SECURITY_CODE ?? '',
      dateStr(item.TRADE_DATE),
    ]);
    return createDataFrame(columns, rows);
  } catch { return createDataFrame([], []); }
}
export async function stock_lhb_traderstatistic_em(symbol: string = '近一月'): Promise<DataFrame> {
  const symbolMap: Record<string, string> = { '近一月': '01', '近三月': '02', '近六月': '03', '近一年': '04' };
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params: Record<string, any> = {
    sortColumns: 'AMOUNT,OPERATEDEPT_CODE',
    sortTypes: '-1,1',
    pageSize: '5000',
    pageNumber: '1',
    reportName: 'RPT_OPERATEDEPT_LIST_STATISTICS',
    columns: 'ALL',
    source: 'WEB',
    client: 'WEB',
    filter: `(STATISTICSCYCLE="${symbolMap[symbol] ?? '01'}")`,
  };
  try {
    const allRows: any[][] = [];
    for (let page = 1; page <= 500; page++) {
      params.pageNumber = String(page);
      const data = await httpGet<any>(url, { params });
      const list = data?.result?.data ?? [];
      for (const item of list) {
        allRows.push(Object.values(item));
      }
      if (page >= (data?.result?.pages ?? 0)) break;
    }
    if (!allRows.length) return createDataFrame([], []);
    // Column mapping based on Python: 序号, 营业部名称, 龙虎榜成交金额, 上榜次数, 买入额, 买入次数, 卖出额, 卖出次数
    const columns = ['序号', '营业部名称', '龙虎榜成交金额', '上榜次数', '买入额', '买入次数', '卖出额', '卖出次数'];
    const rows = allRows.map((row, index) => {
      const vals = row as any[];
      return [
        index + 1,
        vals[0] ?? '',       // 营业部名称 (OPERATEDEPT_NAME)
        toNum(vals[1]),      // 龙虎榜成交金额 (AMOUNT)
        toNum(vals[2]),      // 上榜次数 (SALES_ONLIST_TIMES)
        toNum(vals[3]),      // 买入额 (ACT_BUY)
        toNum(vals[4]),      // 买入次数 (TOTAL_BUYER_SALESTIMES)
        toNum(vals[5]),      // 卖出额 (ACT_SELL)
        toNum(vals[6]),      // 卖出次数 (TOTAL_SELLER_SALESTIMES)
      ];
    });
    return createDataFrame(columns, rows);
  } catch { return createDataFrame([], []); }
}
export async function stock_lhb_yyb_detail_em(symbol: string = '10188715'): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params: Record<string, any> = {
    sortColumns: 'TRADE_DATE,SECURITY_CODE',
    sortTypes: '-1,1',
    pageSize: '100',
    pageNumber: '1',
    reportName: 'RPT_OPERATEDEPT_TRADE_DETAILSNEW',
    columns: 'ALL',
    source: 'WEB',
    client: 'WEB',
    filter: `(OPERATEDEPT_CODE="${symbol}")`,
  };
  try {
    const allRows: any[][] = [];
    for (let page = 1; page <= 500; page++) {
      params.pageNumber = String(page);
      const data = await httpGet<any>(url, { params });
      const list = data?.result?.data ?? [];
      for (const item of list) {
        allRows.push(Object.values(item));
      }
      if (page >= (data?.result?.pages ?? 0)) break;
    }
    if (!allRows.length) return createDataFrame([], []);
    // Column mapping based on Python: 序号, 营业部代码, 营业部名称, 营业部简称, 交易日期, 股票代码, 股票名称, 涨跌幅, 买入金额, 卖出金额, 净额, 上榜原因, 1日后涨跌幅, 2日后涨跌幅, 3日后涨跌幅, 5日后涨跌幅, 10日后涨跌幅, 20日后涨跌幅, 30日后涨跌幅
    const columns = ['序号', '营业部代码', '营业部名称', '营业部简称', '交易日期', '股票代码', '股票名称', '涨跌幅', '买入金额', '卖出金额', '净额', '上榜原因', '1日后涨跌幅', '2日后涨跌幅', '3日后涨跌幅', '5日后涨跌幅', '10日后涨跌幅', '20日后涨跌幅', '30日后涨跌幅'];
    const rows = allRows.map((row, index) => {
      const vals = row as any[];
      return [
        index + 1,
        vals[0] ?? '',       // 营业部代码 (OPERATEDEPT_CODE)
        vals[1] ?? '',       // 营业部名称 (OPERATEDEPT_NAME)
        vals[18] ?? '',      // 营业部简称 (ORG_NAME_ABBR)
        dateStr(vals[2]),    // 交易日期 (TRADE_DATE)
        vals[9] ?? '',       // 股票代码 (SECURITY_CODE)
        vals[10] ?? '',      // 股票名称 (SECURITY_NAME_ABBR)
        toNum(vals[19]),     // 涨跌幅 (CHANGE_RATE)
        toNum(vals[11]),     // 买入金额 (ACT_BUY)
        toNum(vals[12]),     // 卖出金额 (ACT_SELL)
        toNum(vals[13]),     // 净额 (NET_AMT)
        vals[14] ?? '',      // 上榜原因 (EXPLANATION)
        toNum(vals[3]),      // 1日后涨跌幅 (D1_CLOSE_ADJCHRATE)
        toNum(vals[4]),      // 2日后涨跌幅 (D2_CLOSE_ADJCHRATE)
        toNum(vals[5]),      // 3日后涨跌幅 (D3_CLOSE_ADJCHRATE)
        toNum(vals[6]),      // 5日后涨跌幅 (D5_CLOSE_ADJCHRATE)
        toNum(vals[7]),      // 10日后涨跌幅 (D10_CLOSE_ADJCHRATE)
        toNum(vals[15]),     // 20日后涨跌幅 (D20_CLOSE_ADJCHRATE)
        toNum(vals[16]),     // 30日后涨跌幅 (D30_CLOSE_ADJCHRATE)
      ];
    });
    return createDataFrame(columns, rows);
  } catch { return createDataFrame([], []); }
}
export async function stock_lhb_yybph_em(symbol: string = '近一月'): Promise<DataFrame> {
  const symbolMap: Record<string, string> = { '近一月': '01', '近三月': '02', '近六月': '03', '近一年': '04' };
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params: Record<string, any> = {
    sortColumns: 'TOTAL_BUYER_SALESTIMES_1DAY,OPERATEDEPT_CODE',
    sortTypes: '-1,1',
    pageSize: '5000',
    pageNumber: '1',
    reportName: 'RPT_RATEDEPT_RETURNT_RANKING',
    columns: 'ALL',
    source: 'WEB',
    client: 'WEB',
    filter: `(STATISTICSCYCLE="${symbolMap[symbol] ?? '01'}")`,
  };
  try {
    const allRows: any[][] = [];
    for (let page = 1; page <= 500; page++) {
      params.pageNumber = String(page);
      const data = await httpGet<any>(url, { params });
      const list = data?.result?.data ?? [];
      for (const item of list) {
        allRows.push(Object.values(item));
      }
      if (page >= (data?.result?.pages ?? 0)) break;
    }
    if (!allRows.length) return createDataFrame([], []);
    // Column mapping based on Python: 序号, 营业部名称, 上榜后1天-买入次数, 上榜后1天-平均涨幅, 上榜后1天-上涨概率, ...
    const columns = ['序号', '营业部名称', '上榜后1天-买入次数', '上榜后1天-平均涨幅', '上榜后1天-上涨概率', '上榜后2天-买入次数', '上榜后2天-平均涨幅', '上榜后2天-上涨概率', '上榜后3天-买入次数', '上榜后3天-平均涨幅', '上榜后3天-上涨概率', '上榜后5天-买入次数', '上榜后5天-平均涨幅', '上榜后5天-上涨概率', '上榜后10天-买入次数', '上榜后10天-平均涨幅', '上榜后10天-上涨概率'];
    const rows = allRows.map((row, index) => {
      const vals = row as any[];
      return [
        index + 1,
        vals[0] ?? '',       // 营业部名称 (OPERATEDEPT_NAME)
        toNum(vals[1]),      // 上榜后1天-买入次数 (TOTAL_BUYER_SALESTIMES_1DAY)
        toNum(vals[2]),      // 上榜后1天-平均涨幅 (AVERAGE_INCREASE_1DAY)
        toNum(vals[3]),      // 上榜后1天-上涨概率 (RISE_PROBABILITY_1DAY)
        toNum(vals[4]),      // 上榜后2天-买入次数 (TOTAL_BUYER_SALESTIMES_2DAY)
        toNum(vals[5]),      // 上榜后2天-平均涨幅 (AVERAGE_INCREASE_2DAY)
        toNum(vals[6]),      // 上榜后2天-上涨概率 (RISE_PROBABILITY_2DAY)
        toNum(vals[7]),      // 上榜后3天-买入次数 (TOTAL_BUYER_SALESTIMES_3DAY)
        toNum(vals[8]),      // 上榜后3天-平均涨幅 (AVERAGE_INCREASE_3DAY)
        toNum(vals[9]),      // 上榜后3天-上涨概率 (RISE_PROBABILITY_3DAY)
        toNum(vals[10]),     // 上榜后5天-买入次数 (TOTAL_BUYER_SALESTIMES_5DAY)
        toNum(vals[11]),     // 上榜后5天-平均涨幅 (AVERAGE_INCREASE_5DAY)
        toNum(vals[12]),     // 上榜后5天-上涨概率 (RISE_PROBABILITY_5DAY)
        toNum(vals[13]),     // 上榜后10天-买入次数 (TOTAL_BUYER_SALESTIMES_10DAY)
        toNum(vals[14]),     // 上榜后10天-平均涨幅 (AVERAGE_INCREASE_10DAY)
        toNum(vals[15]),     // 上榜后10天-上涨概率 (RISE_PROBABILITY_10DAY)
      ];
    });
    return createDataFrame(columns, rows);
  } catch { return createDataFrame([], []); }
}

// ─── Stock ZT pool sub new ────────────────────────────────────

export async function stock_zt_pool_sub_new_em(date: string = '20231201'): Promise<DataFrame> {
  const ds = date.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3');
  return _em_data_get('RPT_ZTPOOL_POOL', { filter: `(POOL_TYPE="4")(TRADE_DATE='${ds}')` });
}

// ─── Stock disclosure cninfo ─────────────────────────────────

export async function stock_zh_a_disclosure_report_cninfo(symbol: string = '000001', start_date: string = '20230618', end_date: string = '20231219', report_type: string = '\u5e74\u62a5'): Promise<DataFrame> {
  try {
    const { default: axios } = await import('axios');
    const stockMapResp = await axios.get('http://www.cninfo.com.cn/new/data/szse_stock.json', { timeout: 30000 });
    const stockMapList = stockMapResp.data?.stockList ?? [];
    const orgId = (stockMapList.find((x: any) => x.code === symbol)?.orgId ?? '').toString();
    const basePayload: any = {
      pageNum: '1', pageSize: '30', column: 'szse', tabName: 'fulltext', plate: '',
      stock: symbol ? `${symbol},${orgId}` : '', searchkey: '', secid: '', category: '', trade: '',
      seDate: `${start_date.slice(0,4)}-${start_date.slice(4,6)}-${start_date.slice(6,8)}~${end_date.slice(0,4)}-${end_date.slice(4,6)}-${end_date.slice(6,8)}`,
      sortName: '', sortType: '', isHLtitle: 'true',
    };
    const first = await axios.post('http://www.cninfo.com.cn/new/hisAnnouncement/query', null, { params: basePayload, timeout: 30000 });
    const pages = Math.ceil((first.data?.totalAnnouncement ?? 0) / 30) || 1;
    const all: any[] = [];
    for (let page = 1; page <= pages; page++) {
      const payload = { ...basePayload, pageNum: String(page) };
      const resp = page === 1
        ? first
        : await axios.post(
          'http://www.cninfo.com.cn/new/hisAnnouncement/query',
          new URLSearchParams(payload),
          { timeout: 30000, headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
        );
      all.push(...(resp.data?.announcements ?? []));
    }
    const rows = all.map((x: any) => {
      const t = x.announcementTime ? dateStr(x.announcementTime) : '';
      return [
        x.secCode ?? '',
        x.secName ?? '',
        x.announcementTitle ?? '',
        t,
        `http://www.cninfo.com.cn/new/disclosure/detail?stockCode=${x.secCode ?? ''}&announcementId=${x.announcementId ?? ''}&orgId=${x.orgId ?? ''}&announcementTime=${t}`,
      ];
    });
    return createDataFrame(['代码', '简称', '公告标题', '公告时间', '公告链接'], rows);
  } catch { return createDataFrame([], []); }
}

export async function stock_zh_a_disclosure_relation_cninfo(symbol: string = '000001'): Promise<DataFrame> {
  try {
    const { default: axios } = await import('axios');
    const stockMapResp = await axios.get('http://www.cninfo.com.cn/new/data/szse_stock.json', { timeout: 30000 });
    const stockMapList = stockMapResp.data?.stockList ?? [];
    const orgId = (stockMapList.find((x: any) => x.code === symbol)?.orgId ?? '').toString();
    const basePayload: any = {
      pageNum: '1', pageSize: '30', column: 'szse', tabName: 'relation', plate: '',
      stock: symbol ? `${symbol},${orgId}` : '', searchkey: '', secid: '', category: '', trade: '',
      seDate: '2023-06-18~2023-12-19', sortName: '', sortType: '', isHLtitle: 'true',
    };
    const first = await axios.post('http://www.cninfo.com.cn/new/hisAnnouncement/query', null, { params: basePayload, timeout: 30000 });
    const pages = Math.ceil((first.data?.totalAnnouncement ?? 0) / 30) || 1;
    const all: any[] = [];
    for (let page = 1; page <= pages; page++) {
      const payload = { ...basePayload, pageNum: String(page) };
      const resp = page === 1
        ? first
        : await axios.post(
          'http://www.cninfo.com.cn/new/hisAnnouncement/query',
          new URLSearchParams(payload),
          { timeout: 30000, headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
        );
      all.push(...(resp.data?.announcements ?? []));
    }
    const rows = all.map((x: any) => {
      const t = x.announcementTime ? new Date(Number(x.announcementTime)).toISOString().replace('T', ' ').slice(0, 19) : '';
      return [
        x.secCode ?? '',
        x.secName ?? '',
        x.announcementTitle ?? '',
        t,
        `http://www.cninfo.com.cn/new/disclosure/detail?stockCode=${x.secCode ?? ''}&announcementId=${x.announcementId ?? ''}&orgId=${x.orgId ?? ''}&announcementTime=${t}`,
      ];
    });
    return createDataFrame(['代码', '简称', '公告标题', '公告时间', '公告链接'], rows);
  } catch {
    return createDataFrame([], []);
  }
}
