/**
 * AKShare TypeScript - fund missing interfaces
 * Covers Sina/THS/EM various fund data
 */

import axios from 'axios';
import * as XLSX from 'xlsx';
import { httpGet, httpGetText, httpGetTextGbk } from '../utils/httpClient';
import { decodeSinaData } from '../utils/jsDecode';
import { createDataFrame, DataFrame } from '../utils/dataframe';

function toNum(v: any): number | null {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(String(v).replace(/,/g, ''));
  return Number.isFinite(n) ? n : null;
}

function toDateStr(v: any): string {
  if (!v) return '';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return String(v);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function toPyFloatCell(v: any): string {
  const n = toNum(v);
  if (n === null) return '';
  return Number.isInteger(n) ? n.toFixed(1) : String(n);
}

/** Parse Sina JSONP array response */
function parseSinaJsonpArray(text: string): any[] {
  try {
    const start = text.indexOf('([');
    if (start >= 0) {
      const arr = text.slice(start + 1);
      const end = arr.lastIndexOf(')');
      return JSON.parse(end >= 0 ? arr.slice(0, end) : arr);
    }
    const fallback = text.slice(text.lastIndexOf('(') + 1, text.lastIndexOf(')'));
    return JSON.parse(fallback);
  } catch { return []; }
}

/** Parse Sina JSONP object response */
function parseSinaJsonpObject(text: string): Record<string, any> {
  try {
    const start = text.indexOf('({');
    if (start >= 0) {
      const obj = text.slice(start + 1);
      const end = obj.lastIndexOf(')');
      return JSON.parse(end >= 0 ? obj.slice(0, end) : obj);
    }
    return {};
  } catch { return {}; }
}

/** EM fund market id */
function fundMarketId(symbol: string): number {
  return (symbol.startsWith('5') || symbol.startsWith('6')) ? 1 : 0;
}

// ─── Sina Finance - Fund List ───────────────────────────────────

/**
 * Sina Finance - Fund list (Closed/ETF/LOF)
 */
export async function fund_etf_category_sina(
  symbol: string = 'LOF\u57fa\u91d1'
): Promise<DataFrame> {
  const fundMap: Record<string, string> = {
    '\u5c01\u95ed\u5f0f\u57fa\u91d1': 'close_fund',
    'ETF\u57fa\u91d1': 'etf_hq_fund',
    'LOF\u57fa\u91d1': 'lof_hq_fund',
  };
  const node = fundMap[symbol] ?? 'lof_hq_fund';
  const url =
    'https://vip.stock.finance.sina.com.cn/quotes_service/api/jsonp.php/' +
    "IO.XSRV2.CallbackList['da_yPT46_Ll7K6WD']/Market_Center.getHQNodeDataSimple";
  try {
    const text = await httpGetText(url, {
      params: { page: '1', num: '5000', sort: 'symbol', asc: '0', node },
      headers: { Referer: 'https://vip.stock.finance.sina.com.cn/fund_center/index.html' },
    });
    const arr = parseSinaJsonpArray(text);
    if (!arr.length) return createDataFrame([], []);

    const columns = [
      '\u4ee3\u7801', '\u540d\u79f0', '\u6700\u65b0\u4ef7', '\u6da8\u8dcc\u989d', '\u6da8\u8dcc\u5e45',
      '\u4e70\u5165', '\u5356\u51fa', '\u6628\u6536', '\u4eca\u5f00', '\u6700\u9ad8', '\u6700\u4f4e',
      '\u6210\u4ea4\u91cf', '\u6210\u4ea4\u989d',
    ];
    const rows = arr.map((item: any) => [
      item.symbol, item.name,
      toNum(item.trade), toNum(item.pricechange), toNum(item.changepercent),
      toNum(item.buy), toNum(item.sell), toNum(item.settlement), toNum(item.open),
      toNum(item.high), toNum(item.low),
      toNum(item.volume), toNum(item.amount),
    ]);
    return createDataFrame(columns, rows);
  } catch { return createDataFrame([], []); }
}

// ─── THS Fund Data ─────────────────────────────────────────────

/**
 * THS - Fund daily nav data
 */
export async function fund_etf_category_ths(
  symbol: string = 'ETF',
  date: string = ''
): Promise<DataFrame> {
  const symbolMap: Record<string, string> = {
    'ETF': 'ETF', 'LOF': 'LOF', 'QDII': 'QDII',
    '\u80a1\u7968\u578b': 'gpx', '\u503a\u5238\u578b': 'zqx', '\u6df7\u5408\u578b': 'hhx',
    '\u4fdd\u672c\u578b': 'bbx', '\u6307\u6570\u578b': 'zsx', '': 'all',
  };
  const inner = symbolMap[symbol] ?? 'ETF';
  const innerDate = date ? `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}` : '0';
  const url =
    `https://fund.10jqka.com.cn/data/Net/info/${inner}_rate_desc_${innerDate}_0_1_9999_0_0_0_jsonp_g.html`;
  try {
    const text = await httpGetText(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    const json = JSON.parse(text.slice(2, -1));
    const raw = json?.data?.data ?? {};
    const items = Object.values(raw) as any[];
    if (!items.length) return createDataFrame([], []);

    const columns = [
      '\u5e8f\u53f7', '\u57fa\u91d1\u4ee3\u7801', '\u57fa\u91d1\u540d\u79f0',
      '\u5f53\u524d-\u5355\u4f4d\u51c0\u503c', '\u5f53\u524d-\u7d2f\u8ba1\u51c0\u503c',
      '\u524d\u4e00\u65e5-\u5355\u4f4d\u51c0\u503c', '\u524d\u4e00\u65e5-\u7d2f\u8ba1\u51c0\u503c',
      '\u589e\u957f\u503c', '\u589e\u957f\u7387', '\u8d4e\u56de\u72b6\u6001', '\u7533\u8d2d\u72b6\u6001',
      '\u6700\u65b0-\u4ea4\u6613\u65e5', '\u6700\u65b0-\u5355\u4f4d\u51c0\u503c',
      '\u6700\u65b0-\u7d2f\u8ba1\u51c0\u503c', '\u57fa\u91d1\u7c7b\u578b', '\u67e5\u8be2\u65e5\u671f',
    ];
    const queryDate = innerDate !== '0' ? innerDate : (items[0]?.newdate ?? '');
    const rows = items.map((item: any, idx: number) => [
      idx + 1, item.code, item.name,
      toNum(item.net), toNum(item.totalnet), toNum(item.net1), toNum(item.totalnet1),
      toNum(item.ranges), toNum(item.rate), item.shstat, item.sgstat,
      item.newdate, toNum(item.newnet), toNum(item.newtotalnet), item.typename, queryDate,
    ]);
    return createDataFrame(columns, rows);
  } catch { return createDataFrame([], []); }
}

/**
 * THS ETF spot (alias)
 */
export async function fund_etf_spot_ths(date: string = ''): Promise<DataFrame> {
  return fund_etf_category_ths('ETF', date);
}

/**
 * THS - New fund list
 */
export async function fund_new_found_ths(
  symbol: string = '\u5168\u90e8'
): Promise<DataFrame> {
  const url = 'https://fund.10jqka.com.cn/datacenter/xfjj/';
  try {
    const text = await httpGetText(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const startIdx = text.indexOf('jsonData=');
    if (startIdx < 0) return createDataFrame([], []);
    const startBracket = text.indexOf('{', startIdx);
    if (startBracket < 0) return createDataFrame([], []);
    let count = 0;
    let endIdx = startBracket;
    for (let i = startBracket; i < text.length; i++) {
      if (text[i] === '{') count++;
      else if (text[i] === '}') { count--; if (count === 0) { endIdx = i + 1; break; } }
    }
    const data = JSON.parse(text.slice(startBracket, endIdx));
    let items: any[] = Object.values(data);
    if (symbol === '\u53d1\u884c\u4e2d') items = items.filter((x: any) => x.zzfx === 1);
    else if (symbol === '\u5c06\u53d1\u884c') items = items.filter((x: any) => x.zzfx !== 1);

    const columns = [
      '\u57fa\u91d1\u4ee3\u7801', '\u57fa\u91d1\u540d\u79f0', '\u6295\u8d44\u7c7b\u578b',
      '\u52df\u96c6\u8d77\u59cb\u65e5', '\u52df\u96c6\u7ec8\u6b62\u65e5', '\u7ba1\u7406\u4eba',
      '\u57fa\u91d1\u7ecf\u7406', '\u8ba4\u8d2d\u8d39\u7387', '\u6700\u4f4e\u8ba4\u8d2d',
      '\u57fa\u91d1\u7c7b\u578b', '\u6295\u8d44\u98ce\u683c',
    ];
    const rows = items.map((item: any) => [
      item.code, item.name, item.type,
      toDateStr(item.start), toDateStr(item.end),
      item.orgname, Array.isArray(item.manager) ? (item.manager[0] ?? '') : (item.manager ?? ''),
      toNum(item.zgrgfl), toNum(item.zdrg), item.jjlx, item.tzfg,
    ]);
    return createDataFrame(columns, rows);
  } catch { return createDataFrame([], []); }
}

/**
 * THS - Fund basic info
 */
export async function fund_info_ths(symbol: string = '161130'): Promise<DataFrame> {
  const { load } = await import('cheerio');
  const url = `https://fund.10jqka.com.cn/${symbol}/interduce.html`;
  try {
    const text = await httpGetText(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const $ = load(text);
    const rows: any[][] = [];
    $('ul.g-dialog li').each((_, li) => {
      const key = $(li).find('span.key').text().trim();
      const val = $(li).find('span.value').text().trim();
      if (key) rows.push([key, val]);
    });
    return createDataFrame(['\u5b57\u6bb5', '\u503c'], rows);
  } catch { return createDataFrame([], []); }
}

// ─── Sina ETF history / dividend ──────────────────────────────

/**
 * Sina Finance - ETF daily data
 */
export async function fund_etf_hist_sina(symbol: string = 'sh510050'): Promise<DataFrame> {
  const url = `https://finance.sina.com.cn/realstock/company/${symbol}/hisdata_klc2/klc_kl.js`;
  try {
    const text = await httpGetText(url, {
      headers: { Referer: `https://finance.sina.com.cn/fund/quotes/${symbol.slice(2)}/bc.shtml` },
    });
    const encoded = text.split('=')[1]?.split(';')[0]?.replace(/"/g, '');
    if (!encoded) return createDataFrame([], []);
    const decoded: any[] = decodeSinaData(encoded);
    if (!decoded.length) return createDataFrame([], []);

    const columns = ['date', 'prevclose', 'open', 'high', 'low', 'close', 'volume', 'amount'];
    const rows = decoded
      .map((item: any) => {
        const dateObj = new Date(item.date);
        const d = Number.isNaN(dateObj.getTime())
          ? String(item.date ?? '')
          : `${dateObj.getUTCFullYear()}-${String(dateObj.getUTCMonth() + 1).padStart(2, '0')}-${String(dateObj.getUTCDate()).padStart(2, '0')}`;
        return [
          d,
          toNum(item.prevclose),
          toNum(item.open),
          toNum(item.high),
          toNum(item.low),
          toNum(item.close),
          toNum(item.volume),
          toNum(item.amount),
        ];
      })
      .sort((a, b) => String(a[0]).localeCompare(String(b[0])));
    return createDataFrame(columns, rows);
  } catch { return createDataFrame([], []); }
}

/**
 * Sina Finance - ETF cumulative dividend
 */
export async function fund_etf_dividend_sina(symbol: string = 'sh510050'): Promise<DataFrame> {
  const url = `https://finance.sina.com.cn/realstock/company/${symbol}/hfq.js`;
  try {
    const text = await httpGetText(url);
    const raw = text.split('=').slice(1).join('=').trim();
    const jsonStr = raw.includes('}') ? raw.slice(0, raw.lastIndexOf('}') + 1) : raw;
    let data: any;
    try { data = JSON.parse(jsonStr); } catch { data = null; }
    if (!data?.data) return createDataFrame([], []);

    const rows: any[][] = (data.data as any[])
      .filter((item: any) => item[0] && item[0] !== '1900-01-01')
      .map((item: any) => [toDateStr(item[0]), toNum(item[3])])
      .sort((a, b) => String(a[0]).localeCompare(String(b[0])));
    return createDataFrame(['\u65e5\u671f', '\u7d2f\u8ba1\u5206\u7ea2'], rows);
  } catch { return createDataFrame([], []); }
}

// ─── EM ETF minute data ────────────────────────────────────────

/**
 * EM - ETF minute data
 */
export async function fund_etf_hist_min_em(
  symbol: string = '159707',
  start_date: string = '1979-09-01 09:32:00',
  end_date: string = '2222-01-01 09:32:00',
  period: string = '5',
  adjust: string = ''
): Promise<DataFrame> {
  const adjustMap: Record<string, string> = { '': '0', 'qfq': '1', 'hfq': '2' };
  const marketId = fundMarketId(symbol);

  try {
    if (period === '1') {
      const params = {
        fields1: 'f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f11,f12,f13',
        fields2: 'f51,f52,f53,f54,f55,f56,f57,f58',
        ut: '7eea3edcaed734bea9cbfc24409ed989',
        ndays: '5', iscr: '0',
        secid: `${marketId}.${symbol}`,
      };
      const data = await httpGet<any>('https://push2his.eastmoney.com/api/qt/stock/trends2/get', { params });
      const trends: string[] = data?.data?.trends ?? [];
      const columns = ['\u65f6\u95f4', '\u5f00\u76d8', '\u6536\u76d8', '\u6700\u9ad8', '\u6700\u4f4e', '\u6210\u4ea4\u91cf', '\u6210\u4ea4\u989d', '\u5747\u4ef7'];
      const rows = trends
        .map((s) => {
          const p = s.split(',');
          return [p[0], toNum(p[1]), toNum(p[2]), toNum(p[3]), toNum(p[4]), toNum(p[5]), toNum(p[6]), toNum(p[7])];
        })
        .filter((r) => String(r[0]) >= start_date && String(r[0]) <= end_date);
      return createDataFrame(columns, rows);
    }

    const params = {
      fields1: 'f1,f2,f3,f4,f5,f6',
      fields2: 'f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61',
      ut: '7eea3edcaed734bea9cbfc24409ed989',
      klt: period, fqt: adjustMap[adjust] ?? '0',
      secid: `${marketId}.${symbol}`, beg: '0', end: '20500000',
    };
    const data = await httpGet<any>('https://push2his.eastmoney.com/api/qt/stock/kline/get', { params });
    const klines: string[] = data?.data?.klines ?? [];
    const columns = ['\u65f6\u95f4', '\u5f00\u76d8', '\u6536\u76d8', '\u6700\u9ad8', '\u6700\u4f4e', '\u6210\u4ea4\u91cf', '\u6210\u4ea4\u989d', '\u632f\u5e45', '\u6da8\u8dcc\u5e45', '\u6da8\u8dcc\u989d', '\u6362\u624b\u7387'];
    const rows = klines
      .map((s) => {
        const p = s.split(',');
        return [p[0], toNum(p[1]), toNum(p[2]), toNum(p[3]), toNum(p[4]), toNum(p[5]), toNum(p[6]), toNum(p[7]), toNum(p[8]), toNum(p[9]), toNum(p[10])];
      })
      .filter((r) => String(r[0]) >= start_date && String(r[0]) <= end_date);
    return createDataFrame(columns, rows);
  } catch { return createDataFrame([], []); }
}

// ─── SSE / SZSE ETF scale ─────────────────────────────────────

/**
 * SSE - ETF fund scale data
 */
export async function fund_etf_scale_sse(date: string = '20250115'): Promise<DataFrame> {
  const dateStr = `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;
  const url = 'https://query.sse.com.cn/commonQuery.do';
  try {
    const data = await httpGet<any>(url, {
      params: {
        isPagination: 'true', 'pageHelp.pageSize': '10000',
        'pageHelp.pageNo': '1', 'pageHelp.beginPage': '1',
        'pageHelp.cacheSize': '1', 'pageHelp.endPage': '1',
        sqlId: 'COMMON_SSE_ZQPZ_ETFZL_XXPL_ETFGM_SEARCH_L',
        STAT_DATE: dateStr,
      },
      headers: { Referer: 'https://www.sse.com.cn/', 'User-Agent': 'Mozilla/5.0' },
    });
    const list = Array.isArray(data?.result) ? data.result : [];
    const columns = ['\u5e8f\u53f7', '\u57fa\u91d1\u4ee3\u7801', '\u57fa\u91d1\u7b80\u79f0', 'ETF\u7c7b\u578b', '\u7edf\u8ba1\u65e5\u671f', '\u57fa\u91d1\u4efd\u989d'];
    const rows = list.map((item: any) => [
      toNum(item.NUM), item.SEC_CODE, item.SEC_NAME, item.ETF_TYPE,
      toDateStr(item.STAT_DATE),
      toNum(item.TOT_VOL) !== null ? (toNum(item.TOT_VOL)! * 10000) : null,
    ]);
    return createDataFrame(columns, rows);
  } catch { return createDataFrame([], []); }
}

/**
 * SZSE - ETF fund scale data
 */
export async function fund_etf_scale_szse(): Promise<DataFrame> {
  const url = 'https://fund.szse.cn/api/report/ShowReport';
  try {
    const resp = await axios.get(url, {
      params: { SHOWTYPE: 'xlsx', CATALOGID: '1000_lf', TABKEY: 'tab1', random: '0.07' },
      responseType: 'arraybuffer',
      timeout: 30000,
      headers: {
        Referer: 'https://fund.szse.cn/marketdata/fundslist/index.html',
        'User-Agent': 'Mozilla/5.0',
      },
    });
    const wb = XLSX.read(Buffer.from(resp.data), { type: 'buffer' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const records = XLSX.utils.sheet_to_json<Record<string, any>>(ws, { defval: '' });
    if (!records.length) return createDataFrame([], []);

    const columns = ['\u57fa\u91d1\u4ee3\u7801', '\u57fa\u91d1\u7b80\u79f0', '\u57fa\u91d1\u7c7b\u522b', '\u6295\u8d44\u7c7b\u522b', '\u4e0a\u5e02\u65e5\u671f', '\u57fa\u91d1\u4efd\u989d', '\u57fa\u91d1\u7ba1\u7406\u4eba', '\u57fa\u91d1\u53d1\u8d77\u4eba', '\u57fa\u91d1\u6258\u7ba1\u4eba', '\u51c0\u503c'];
    const rows = records.map((item) => [
      String(item['\u57fa\u91d1\u4ee3\u7801'] ?? '').padStart(6, '0'),
      item['\u57fa\u91d1\u7b80\u79f0'] ?? '',
      item['\u57fa\u91d1\u7c7b\u522b'] ?? '',
      item['\u6295\u8d44\u7c7b\u522b'] ?? '',
      toDateStr(item['\u4e0a\u5e02\u65e5\u671f']),
      toNum(String(item['\u5f53\u524d\u89c4\u6a21(\u4efd)'] ?? item['\u57fa\u91d1\u4efd\u989d'] ?? '').replace(/,/g, '')),
      item['\u57fa\u91d1\u7ba1\u7406\u4eba'] ?? '',
      item['\u57fa\u91d1\u53d1\u8d77\u4eba'] ?? '',
      item['\u57fa\u91d1\u6258\u7ba1\u4eba'] ?? '',
      toNum(item['\u51c0\u503c']),
    ]);
    return createDataFrame(columns, rows);
  } catch { return createDataFrame([], []); }
}

/**
 * SZSE - Fund scale daily data
 */
export async function fund_scale_daily_szse(
  start_date: string = '20260401',
  end_date: string = '20260401',
  symbol: string = 'ETF'
): Promise<DataFrame> {
  const symbolMap: Record<string, { jjlb: string; referer: string }> = {
    'ETF': { jjlb: 'ETF', referer: 'https://www.szse.cn/market/fund/volume/etf/index.html' },
    'LOF': { jjlb: 'LOF', referer: 'https://www.szse.cn/market/fund/volume/lof/index.html' },
    'REITS': { jjlb: '\u4e0d\u52a8\u4ea7\u57fa\u91d1', referer: 'https://www.szse.cn/market/fund/volume/reits/index.html' },
  };
  const cfg = symbolMap[symbol] ?? symbolMap['ETF'];
  const startStr = `${start_date.slice(0, 4)}-${start_date.slice(4, 6)}-${start_date.slice(6, 8)}`;
  const endStr = `${end_date.slice(0, 4)}-${end_date.slice(4, 6)}-${end_date.slice(6, 8)}`;
  try {
    const resp = await axios.get('https://www.szse.cn/api/report/ShowReport', {
      params: {
        SHOWTYPE: 'xlsx', CATALOGID: 'scsj_fund_jjgm', TABKEY: 'tab1',
        txtStart: startStr, txtEnd: endStr, jjlb: cfg.jjlb, random: String(Math.random()),
      },
      responseType: 'arraybuffer',
      timeout: 30000,
      headers: { Host: 'www.szse.cn', Referer: cfg.referer, 'User-Agent': 'Mozilla/5.0' },
    });
    const wb = XLSX.read(Buffer.from(resp.data), { type: 'buffer' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const records = XLSX.utils.sheet_to_json<Record<string, any>>(ws, { defval: '' });
    if (!records.length) return createDataFrame([], []);

    const columns = ['\u65e5\u671f', '\u57fa\u91d1\u4ee3\u7801', '\u57fa\u91d1\u7b80\u79f0', '\u57fa\u91d1\u4efd\u989d'];
    const rows = records
      .filter((item) => toNum(item['\u57fa\u91d1\u4ee3\u7801']) !== null)
      .map((item) => [
        toDateStr(item['\u65e5\u671f']),
        String(Math.round(toNum(item['\u57fa\u91d1\u4ee3\u7801']) ?? 0)).padStart(6, '0'),
        item['\u57fa\u91d1\u7b80\u79f0'] ?? '',
        toNum(String(item['\u57fa\u91d1\u89c4\u6a21(\u4efd)'] ?? item['\u57fa\u91d1\u4efd\u989d'] ?? '').replace(/,/g, '')),
      ]);
    return createDataFrame(columns, rows);
  } catch { return createDataFrame([], []); }
}

// ─── EM ETF/Financial fund NAV ────────────────────────────────

/**
 * EM - Exchange traded fund real-time data (simplified)
 */
export async function fund_etf_fund_daily_em(): Promise<DataFrame> {
  try {
    const text = await httpGetTextGbk('https://fund.eastmoney.com/cnjy_dwjz.html', {
      headers: {
        Referer: 'https://fund.eastmoney.com/',
        'User-Agent': 'Mozilla/5.0',
      },
    });
    const $ = (await import('cheerio')).load(text);
    const table = $('table').eq(1);
    const trs = table.find('tr');
    if (trs.length < 3) return createDataFrame([], []);

    const headRow = trs.eq(0).find('th,td').toArray().map((el) => $(el).text().trim());
    const day0 = headRow[6] ?? '';
    const day1 = headRow[7] ?? '';

    const columns = [
      '基金代码', '基金简称', '类型',
      `${day0}-单位净值`, `${day0}-累计净值`,
      `${day1}-单位净值`, `${day1}-累计净值`,
      '增长值', '增长率', '市价', '折价率',
    ];

    const rows: any[][] = [];
    trs.slice(2).each((_, tr) => {
      const cells = $(tr).find('td').toArray().map((el) => $(el).text().trim());
      if (cells.length < 14) return;
      rows.push([
        cells[3] ?? '',
        (cells[4] ?? '').replace('行情吧档案', ''),
        cells[5] ?? '',
        cells[6] ?? '',
        cells[7] ?? '',
        cells[8] ?? '',
        cells[9] ?? '',
        cells[10] ?? '',
        cells[11] ?? '',
        cells[12] ?? '',
        cells[13] ?? '',
      ]);
    });
    return createDataFrame(columns, rows);
  } catch { return createDataFrame([], []); }
}

async function _em_lsjz_pages(
  fundCode: string, startDate: string, endDate: string
): Promise<DataFrame> {
  const url = 'https://api.fund.eastmoney.com/f10/lsjz';
  const headers = {
    'User-Agent': 'Mozilla/5.0',
    Referer: `https://fundf10.eastmoney.com/jjjz_${fundCode}.html`,
  };
  const PAGE_SIZE = 20;
  try {
    const first = await httpGet<any>(url, {
      params: { fundCode, pageIndex: '1', pageSize: String(PAGE_SIZE), startDate, endDate, _: Date.now() },
      headers,
    });
    const total = Math.ceil((first?.TotalCount ?? 0) / PAGE_SIZE);
    const allRows: any[][] = [];

    const addRows = (data: any) => {
      for (const item of (data?.Data?.LSJZList ?? [])) {
        allRows.push([
          toDateStr(item.FSRQ), toPyFloatCell(item.DWJZ), toPyFloatCell(item.LJJZ),
          toPyFloatCell(item.JZZZL), item.SGZT ?? '', item.SHZT ?? '',
        ]);
      }
    };
    addRows(first);

    for (let page = 2; page <= Math.min(total, 500); page++) {
      const data = await httpGet<any>(url, {
        params: { fundCode, pageIndex: String(page), pageSize: String(PAGE_SIZE), startDate, endDate, _: Date.now() },
        headers,
      });
      addRows(data);
    }
    allRows.sort((a, b) => String(a[0]).localeCompare(String(b[0])));
    const columns = ['净值日期', '单位净值', '累计净值', '日增长率', '申购状态', '赎回状态'];
    return createDataFrame(columns, allRows);
  } catch { return createDataFrame([], []); }
}

/**
 * EM - Exchange traded fund historical NAV
 */
export async function fund_etf_fund_info_em(
  fund: string = '511280',
  start_date: string = '20000101',
  end_date: string = '20500101'
): Promise<DataFrame> {
  const startStr = `${start_date.slice(0, 4)}-${start_date.slice(4, 6)}-${start_date.slice(6, 8)}`;
  const endStr = `${end_date.slice(0, 4)}-${end_date.slice(4, 6)}-${end_date.slice(6, 8)}`;
  return _em_lsjz_pages(fund, startStr, endStr);
}

/**
 * EM - Financial fund real-time data
 */
export async function fund_financial_fund_daily_em(): Promise<DataFrame> {
  const url = 'https://api.fund.eastmoney.com/FundNetValue/GetLCJJJZ';
  try {
    const data = await httpGet<any>(url, {
      params: { letter: '', jjgsid: '0', searchtext: '', sort: 'ljjz,desc', page: '1,100', cycle: '', OnlySale: '1' },
      headers: { Referer: 'https://fund.eastmoney.com/lcjj.html', 'User-Agent': 'Mozilla/5.0' },
    });
    const list = data?.Data?.List ?? [];
    const showDay: string[] = data?.Data?.showday ?? ['', ''];
    if (!list.length) return createDataFrame([], []);

    const columns = [
      '\u5e8f\u53f7', '\u57fa\u91d1\u4ee3\u7801', '\u57fa\u91d1\u7b80\u79f0',
      '\u4e0a\u4e00\u671f\u5e74\u5316\u6536\u76ca\u7387',
      `${showDay[0]}-\u4e07\u4efd\u6536\u76ca`, `${showDay[0]}-7\u65e5\u5e74\u534e`,
      `${showDay[1]}-\u4e07\u4efd\u6536\u76ca`, `${showDay[1]}-7\u65e5\u5e74\u534e`,
      '\u5c01\u95ed\u671f', '\u7533\u8d2d\u72b6\u6001',
    ];
    const rows = list.map((item: any, idx: number) => [
      idx + 1, item.fcode, item.shortname, toNum(item.actualsyi),
      toNum(item.mui), toNum(item.syi), toNum(item.zrmui), toNum(item.zrsyi),
      item.cycle, item.kfr,
    ]);
    return createDataFrame(columns, rows);
  } catch { return createDataFrame([], []); }
}

/**
 * EM - Financial fund historical NAV
 */
export async function fund_financial_fund_info_em(symbol: string = '000134'): Promise<DataFrame> {
  return _em_lsjz_pages(symbol, '2000-01-01', '2050-01-01');
}

// ─── Sina fund scale ──────────────────────────────────────────

async function _fund_scale_sina(
  urlPath: string,
  params: Record<string, string>,
  emptyDateAsNaT: boolean = false
): Promise<DataFrame> {
  const url = `http://vip.stock.finance.sina.com.cn/fund_center/data/jsonp.php/${urlPath}`;
  try {
    const text = await httpGetText(url, { params, headers: { 'User-Agent': 'Mozilla/5.0' } });
    const obj = parseSinaJsonpObject(text);
    const items: any[] = obj?.data ?? [];
    const columns = [
      '\u5e8f\u53f7', '\u57fa\u91d1\u4ee3\u7801', '\u57fa\u91d1\u7b80\u79f0',
      '\u5355\u4f4d\u51c0\u503c', '\u603b\u52df\u96c6\u89c4\u6a21', '\u6700\u8fd1\u603b\u4efd\u989d',
      '\u6210\u7acb\u65e5\u671f', '\u57fa\u91d1\u7ecf\u7406', '\u66f4\u65b0\u65e5\u671f',
    ];
    const rows = items.map((item: any, idx: number) => [
      idx + 1, item.symbol, item.sname, toNum(item.dwjz),
      toPyFloatCell(item.zmjgm), toPyFloatCell(item.zjzfe),
      toDateStr(item.clrq), item.jjjl, toDateStr(item.jzrq),
    ]);
    const fixedRows = rows.map((r) => {
      const dateVal = String(r[8] ?? '');
      if (!dateVal) {
        r[8] = emptyDateAsNaT ? 'NaT' : '';
      }
      return r;
    });
    return createDataFrame(columns, fixedRows);
  } catch { return createDataFrame([], []); }
}

/**
 * Sina Finance - Open fund scale
 */
export async function fund_scale_open_sina(
  symbol: string = '\u80a1\u7968\u578b\u57fa\u91d1'
): Promise<DataFrame> {
  const map: Record<string, string> = {
    '\u80a1\u7968\u578b\u57fa\u91d1': '2', '\u6df7\u5408\u578b\u57fa\u91d1': '1',
    '\u503a\u5238\u578b\u57fa\u91d1': '3', '\u8d27\u5e01\u578b\u57fa\u91d1': '5',
    'QDII\u57fa\u91d1': '6',
  };
  return _fund_scale_sina(
    "IO.XSRV2.CallbackList['J2cW8KXheoWKdSHc']/NetValueReturn_Service.NetValueReturnOpen",
    { page: '1', num: '10000', sort: 'zmjgm', asc: '0', ccode: '', type2: map[symbol] ?? '2', type3: '' },
    false
  );
}

/**
 * Sina Finance - Closed fund scale
 */
export async function fund_scale_close_sina(): Promise<DataFrame> {
  return _fund_scale_sina(
    "IO.XSRV2.CallbackList['_bjN6KvXOkfPy2Bu']/NetValueReturn_Service.NetValueReturnClose",
    { page: '1', num: '1000', sort: 'zmjgm', asc: '0', ccode: '', type2: '', type3: '' },
    false
  );
}

/**
 * Sina Finance - Structured fund scale
 */
export async function fund_scale_structured_sina(): Promise<DataFrame> {
  return _fund_scale_sina(
    "IO.XSRV2.CallbackList['cRrwseM7NWX68rDa']/NetValueReturn_Service.NetValueReturnCX",
    { page: '1', num: '1000', sort: 'zmjgm', asc: '0', ccode: '', type2: '', type3: '' },
    true
  );
}

// ─── EM LCX fund rank ─────────────────────────────────────────

/**
 * EM - LCX (li cai xing) fund rank
 */
export async function fund_lcx_rank_em(): Promise<DataFrame> {
  const url = 'https://fund.eastmoney.com/data/rankhandler.aspx';
  try {
    const text = await httpGetText(url, {
      params: { op: 'ph', dt: 'fb', ft: 'ct', rs: '', gs: '0', sc: '1nzf', st: 'desc', pi: '1', pn: '30000', v: '0.1' },
      headers: { Referer: 'https://fund.eastmoney.com/', 'User-Agent': 'Mozilla/5.0' },
    });
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start < 0 || end <= start) return createDataFrame([], []);
    const json = JSON.parse(text.slice(start, end + 1));
    const raw: any[] = Array.isArray(json?.datas) ? json.datas : [];
    const columns = [
      '\u5e8f\u53f7', '\u57fa\u91d1\u4ee3\u7801', '\u57fa\u91d1\u7b80\u79f0', '\u7c7b\u578b',
      '\u65e5\u671f', '\u5355\u4f4d\u51c0\u503c', '\u7d2f\u8ba1\u51c0\u503c',
      '\u8fd11\u5468', '\u8fd11\u6708', '\u8fd13\u6708', '\u8fd16\u6708', '\u8fd11\u5e74',
      '\u8fd12\u5e74', '\u8fd13\u5e74', '\u4eca\u5e74\u6765', '\u6210\u7acb\u6765', '\u6210\u7acb\u65e5\u671f',
    ];
    const rows = raw.map((s: any, idx: number) => {
      const parts = String(typeof s === 'string' ? s : (s[0] ?? '')).split(',');
      return [
        idx + 1, parts[0], parts[1], parts[22] ?? '',
        parts[4], toNum(parts[5]), toNum(parts[6]),
        toNum(parts[7]), toNum(parts[8]), toNum(parts[9]), toNum(parts[10]),
        toNum(parts[11]), toNum(parts[12]), toNum(parts[13]), toNum(parts[14]),
        toNum(parts[15]), parts[16] ?? '',
      ];
    });
    return createDataFrame(columns, rows);
  } catch { return createDataFrame([], []); }
}

// ─── EM LOF minute data ───────────────────────────────────────

/**
 * EM - LOF minute data
 */
export async function fund_lof_hist_min_em(
  symbol: string = '166009',
  start_date: string = '1979-09-01 09:32:00',
  end_date: string = '2222-01-01 09:32:00',
  period: string = '5',
  adjust: string = ''
): Promise<DataFrame> {
  const adjustMap: Record<string, string> = { '': '0', 'qfq': '1', 'hfq': '2' };
  for (const marketId of [0, 1]) {
    try {
      const params = {
        fields1: 'f1,f2,f3,f4,f5,f6',
        fields2: 'f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61',
        ut: '7eea3edcaed734bea9cbfc24409ed989',
        klt: period, fqt: adjustMap[adjust] ?? '0',
        secid: `${marketId}.${symbol}`, beg: '0', end: '20500000',
      };
      const data = await httpGet<any>('https://push2his.eastmoney.com/api/qt/stock/kline/get', { params });
      const klines: string[] = data?.data?.klines ?? [];
      if (!klines.length) continue;
      const columns = ['\u65f6\u95f4', '\u5f00\u76d8', '\u6536\u76d8', '\u6700\u9ad8', '\u6700\u4f4e', '\u6210\u4ea4\u91cf', '\u6210\u4ea4\u989d', '\u632f\u5e45', '\u6da8\u8dcc\u5e45', '\u6da8\u8dcc\u989d', '\u6362\u624b\u7387'];
      const rows = klines
        .map((s) => {
          const p = s.split(',');
          return [p[0], toNum(p[1]), toNum(p[2]), toNum(p[3]), toNum(p[4]), toNum(p[5]), toNum(p[6]), toNum(p[7]), toNum(p[8]), toNum(p[9]), toNum(p[10])];
        })
        .filter((r) => String(r[0]) >= start_date && String(r[0]) <= end_date);
      return createDataFrame(columns, rows);
    } catch { /* try other market id */ }
  }
  return createDataFrame([], []);
}
