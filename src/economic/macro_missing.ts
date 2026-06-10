/**
 * AKShare TypeScript - macro missing interfaces
 * Covers HK macro, Sina macro JSONP, NBS, THS macro, etc.
 */

import { httpGet, httpGetText, httpGetTextGbk } from '../utils/httpClient';
import { load } from 'cheerio';
import { createDataFrame, DataFrame } from '../utils/dataframe';
import * as XLSX from 'xlsx';

function toNum(v: any): number | null {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(String(v).replace(/,/g, ''));
  return Number.isFinite(n) ? n : null;
}

function toPyFloatCell(v: any): string | null {
  const n = toNum(v);
  if (n === null) return null;
  return Number.isInteger(n) ? n.toFixed(1) : String(n);
}

function parseSinaJsonpObject(text: string): any | null {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start < 0 || end <= start) return null;
  const objLiteral = text.slice(start, end + 1);
  try {
    return Function(`"use strict"; return (${objLiteral});`)();
  } catch {
    return null;
  }
}

function formatShanghaiDateTime(unixSeconds: number): string {
  const d = new Date(unixSeconds * 1000);
  const parts = new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(d);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')} ${get('hour')}:${get('minute')}:${get('second')}`;
}

// ─── EM HK macro core helper ──────────────────────────────────
async function _em_hk_core(indicatorId: string): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  try {
    const data = await httpGet<any>(url, {
      params: {
        reportName: 'RPT_ECONOMICVALUE_HK', columns: 'ALL',
        filter: `(INDICATOR_ID="${indicatorId}")`,
        pageNumber: '1', pageSize: '5000',
        sortColumns: 'REPORT_DATE', sortTypes: '-1',
        source: 'WEB', client: 'WEB', p: '1', pageNo: '1', pageNum: '1',
      },
    });
    const list = data?.result?.data ?? [];
    const columns = ['时间', '前值', '现值', '发布日期'];
    const rows = list
      .map((item: any) => [
        item.REPORT_DATE_CH ?? item.REPORT_DATE ?? '',
        toPyFloatCell(item.PRE_VALUE), toPyFloatCell(item.VALUE),
        item.PUBLISH_DATE ? item.PUBLISH_DATE.slice(0, 10) : '',
      ])
      .sort((a: any[], b: any[]) => String(a[3]).localeCompare(String(b[3])));
    return createDataFrame(columns, rows);
  } catch { return createDataFrame([], []); }
}

// ─── HK macro interfaces ──────────────────────────────────────

export async function macro_china_hk_cpi(): Promise<DataFrame> { return _em_hk_core('EMG01336996'); }
export async function macro_china_hk_cpi_ratio(): Promise<DataFrame> { return _em_hk_core('EMG00059282'); }
export async function macro_china_hk_rate_of_unemployment(): Promise<DataFrame> { return _em_hk_core('EMG00059647'); }
export async function macro_china_hk_gbp(): Promise<DataFrame> { return _em_hk_core('EMG01337008'); }
export async function macro_china_hk_gbp_ratio(): Promise<DataFrame> { return _em_hk_core('EMG01337009'); }
export async function macro_china_hk_building_volume(): Promise<DataFrame> { return _em_hk_core('EMG00158055'); }
export async function macro_china_hk_building_amount(): Promise<DataFrame> { return _em_hk_core('EMG00158066'); }
export async function macro_china_hk_trade_diff_ratio(): Promise<DataFrame> { return _em_hk_core('EMG00157898'); }
export async function macro_china_hk_ppi(): Promise<DataFrame> { return _em_hk_core('EMG00157818'); }

// ─── Sina JSONP macro helper ──────────────────────────────────
const SINA_MACRO_BASE = 'https://quotes.sina.cn/mac/api/jsonp_v3.php/SINAREMOTECALLCALLBACK1601651495761/MacPage_Service.get_pagedata';

async function _sina_macro_pages(cate: string, event: string, dataKey?: string): Promise<{ data: any[][], cols: string[] }> {
  const PAGE_SIZE = 31;
  const url = SINA_MACRO_BASE;
  let allRows: any[][] = [];
  let cols: string[] = [];

  try {
    let from = 0;
    while (true) {
      const text = await httpGetTextGbk(url, {
        params: { cate, event, from: String(from), num: String(PAGE_SIZE), condition: '' },
        headers: { 'User-Agent': 'Mozilla/5.0' },
      });
      const json = parseSinaJsonpObject(text);
      if (!json) break;

      const total = Number(json.count ?? 0);
      if (!cols.length) {
        cols = (json.config?.all ?? []).map((item: any[]) => item[1] ?? String(item[0]));
      }

      let pageData: any[] = [];
      if (dataKey && json.data?.[dataKey]) {
        pageData = json.data[dataKey];
      } else if (Array.isArray(json.data)) {
        pageData = json.data;
      } else if (json.data && typeof json.data === 'object') {
        const firstKey = Object.keys(json.data)[0];
        pageData = Array.isArray(json.data[firstKey]) ? json.data[firstKey] : [];
      } else {
        break;
      }

      for (const row of pageData) {
        if (Array.isArray(row)) {
          allRows.push(row);
        } else if (row && typeof row === 'object') {
          allRows.push(Object.values(row));
        }
      }

      from += PAGE_SIZE;
      if (from >= total) break;
    }
  } catch { /* return what we have */ }

  return { data: allRows, cols };
}

// ─── Sina-based macro interfaces ─────────────────────────────

/** Central bank balance sheet */
export async function macro_china_central_bank_balance(): Promise<DataFrame> {
  const { data, cols } = await _sina_macro_pages('fininfo', '8');
  const columns = cols.length ? cols : ['项目', '数据'];
  const rows = data.map((row) => row.map((v, i) => (i === 0 ? v : toPyFloatCell(v))));
  return createDataFrame(columns, rows);
}

/** Insurance industry operations */
export async function macro_china_insurance(): Promise<DataFrame> {
  const { data, cols } = await _sina_macro_pages('fininfo', '19');
  return createDataFrame(cols.length ? cols : ['\u9879\u76ee', '\u6570\u636e'], data);
}

/** Central bank gold and forex reserves */
export async function macro_china_foreign_exchange_gold(): Promise<DataFrame> {
  const { data, cols } = await _sina_macro_pages('fininfo', '5');
  return createDataFrame(cols.length ? cols : ['\u7edf\u8ba1\u65f6\u95f4', '\u9ec4\u91d1\u50a8\u5907', '\u56fd\u5bb6\u5916\u6c47\u50a8\u5907'], data);
}

/** Commodity retail price index */
export async function macro_china_retail_price_index(): Promise<DataFrame> {
  const { data, cols } = await _sina_macro_pages('price', '12');
  return createDataFrame(cols.length ? cols : ['\u7edf\u8ba1\u6708\u4efd', '\u96f6\u552e\u5546\u54c1\u4ef7\u683c\u6307\u6570'], data);
}

/** Electricity consumption by sector */
export async function macro_china_society_electricity(): Promise<DataFrame> {
  const { data, cols } = await _sina_macro_pages('industry', '6');
  return createDataFrame(cols.length ? cols : ['\u7edf\u8ba1\u65f6\u95f4', '\u6570\u636e'], data);
}

/** Freight and passenger transport volume */
export async function macro_china_society_traffic_volume(): Promise<DataFrame> {
  const { data, cols } = await _sina_macro_pages('industry', '10', '\u975e\u7d2f\u8ba1');
  return createDataFrame(cols.length ? cols : ['\u9879\u76ee', '\u6570\u636e'], data);
}

/** Postal and telecommunications operations */
export async function macro_china_postal_telecommunicational(): Promise<DataFrame> {
  const { data, cols } = await _sina_macro_pages('industry', '11', '\u975e\u7d2f\u8ba1');
  return createDataFrame(cols.length ? cols : ['\u9879\u76ee', '\u6570\u636e'], data);
}

/** International tourism foreign exchange income */
export async function macro_china_international_tourism_fx(): Promise<DataFrame> {
  const { data, cols } = await _sina_macro_pages('industry', '15');
  const columns = cols.length ? cols : ['统计年度', '指标', '数量', '比重'];
  const quantityIndex = columns.indexOf('数量');
  const ratioIndex = columns.indexOf('比重');
  const rows = data.map((row) => row.map((v, i) => {
    if (i === quantityIndex || i === ratioIndex) {
      return toPyFloatCell(v);
    }
    return v;
  }));
  return createDataFrame(columns, rows);
}

/** Civil aviation load factor */
export async function macro_china_passenger_load_factor(): Promise<DataFrame> {
  const { data, cols } = await _sina_macro_pages('industry', '20');
  return createDataFrame(cols.length ? cols : ['\u65f6\u95f4', '\u5ba2\u5ea7\u7387', '\u8f7d\u8fd0\u7387'], data);
}

/** Freight index (using XLS export endpoint) */
export async function macro_china_freight_index(): Promise<DataFrame> {
  const url = 'http://quotes.sina.cn/mac/view/vMacExcle.php';
  try {
    const text = await httpGetTextGbk(url, {
      params: { cate: 'industry', event: '22', from: '0', num: '5000', condition: '' },
    });
    const lines = text.split(/\r?\n/);
    const headerIndex = lines.findIndex((line) => line.includes('截止日期'));
    if (headerIndex < 0) return createDataFrame([], []);

    let cols = lines[headerIndex].split(', ').map((s) => s.trim().replace(/\s+/g, ''));
    if (cols.length && !cols[cols.length - 1]) cols = cols.slice(0, -1);

    const rawRows = lines.slice(headerIndex + 1)
      .map((line) => line.split(', ').map((v) => v.trim()))
      .map((r) => (r.length && !r[r.length - 1] ? r.slice(0, -1) : r))
      .filter((r) => r.length >= 2 && r[0]);
    const rows = rawRows
      .map((r) => {
        const limited = r.slice(0, cols.length);
        while (limited.length < cols.length) limited.push('');
        return limited.map((v, i) => (i === 0 ? v : toPyFloatCell(v)));
      })
      .filter((r) => r.some((v) => v !== null && v !== ''));
    return createDataFrame(cols, rows);
  } catch { return createDataFrame([], []); }
}

// ─── NBS (National Bureau of Statistics) ─────────────────────

/**
 * NBS national data universal interface
 */
export async function macro_china_nbs_nation(
  kind: string = '\u6708\u5ea6\u6570\u636e',
  path: string = '',
  period: string = 'LAST10'
): Promise<DataFrame> {
  const kindCode: Record<string, string> = {
    '\u6708\u5ea6\u6570\u636e': 'hgyd', '\u5b63\u5ea6\u6570\u636e': 'hgjd', '\u5e74\u5ea6\u6570\u636e': 'hgnd',
  };
  const dbcode = kindCode[kind] ?? 'hgyd';
  const url = 'https://data.stats.gov.cn/easyquery.htm';

  try {
    // Get tree to find indicator code
    const treeResp = await httpGet<any>(url, {
      params: { id: 'zb', dbcode, wdcode: 'zb', m: 'getTree' },
    });
    const tree: any[] = Array.isArray(treeResp) ? treeResp : [];

    // Walk the path to find indicator ID
    const pathParts = path.replace(/\s/g, '').split('>').filter(Boolean);
    let indicatorId = 'zb';
    for (const part of pathParts) {
      const node = tree.find((n: any) => n.name === part || n.cname === part);
      if (node) { indicatorId = node.id; }
    }

    // Query data
    const data = await httpGet<any>(url, {
      params: {
        m: 'QueryData', dbcode, rowcode: 'zb', colcode: 'sj',
        wds: '[]',
        dfwds: `[{"wdcode":"zb","valuecode":"${indicatorId}"},{"wdcode":"sj","valuecode":"${period}"}]`,
        k1: String(Date.now()),
      },
    });

    const dataNodes = data?.returndata?.datanodes ?? [];
    const wdnodes = data?.returndata?.wdnodes ?? [];
    const columns = (wdnodes[0]?.nodes ?? []).map((n: any) => `${n.cname}${n.unit ? `(${n.unit})` : ''}`);
    const timeNodes = (wdnodes[1]?.nodes ?? []).map((n: any) => `${n.cname}`);

    const rows = columns.map((col: string, i: number) => {
      const row: any[] = [col];
      for (let j = 0; j < timeNodes.length; j++) {
        const idx = i * timeNodes.length + j;
        const node = dataNodes[idx];
        row.push(node?.data?.hasdata ? node.data.data : null);
      }
      return row;
    });

    return createDataFrame(['\u6307\u6807', ...timeNodes], rows);
  } catch { return createDataFrame([], []); }
}

/**
 * NBS regional data universal interface
 */
export async function macro_china_nbs_region(
  kind: string = '\u5206\u7701\u6708\u5ea6\u6570\u636e',
  path: string = '',
  indicator: string | null = null,
  region: string | null = null,
  period: string = 'LAST10'
): Promise<DataFrame> {
  const kindDict: Record<string, string> = {
    '\u5206\u7701\u6708\u5ea6\u6570\u636e': 'fsyd', '\u5206\u7701\u5b63\u5ea6\u6570\u636e': 'fsjd',
    '\u5206\u7701\u5e74\u5ea6\u6570\u636e': 'fsnd', '\u4e3b\u8981\u57ce\u5e02\u6708\u5ea6\u4ef7\u683c': 'csyd',
    '\u4e3b\u8981\u57ce\u5e02\u5e74\u5ea6\u6570\u636e': 'csnd',
  };
  const dbcode = kindDict[kind] ?? 'fsyd';
  const url = 'https://data.stats.gov.cn/easyquery.htm';

  try {
    const treeResp = await httpGet<any>(url, {
      params: { id: 'zb', dbcode, wdcode: 'zb', m: 'getTree' },
    });
    const tree: any[] = Array.isArray(treeResp) ? treeResp : [];
    const pathParts = path.replace(/\s/g, '').split('>').filter(Boolean);
    let indicatorId = 'zb';
    for (const part of pathParts) {
      const node = tree.find((n: any) => n.name === part || n.cname === part);
      if (node) { indicatorId = node.id; }
    }

    const dfwds = [{ wdcode: 'zb', valuecode: indicatorId }, { wdcode: 'sj', valuecode: period }];
    if (region) { dfwds.push({ wdcode: 'reg', valuecode: region }); }

    const data = await httpGet<any>(url, {
      params: {
        m: 'QueryData', dbcode, rowcode: region ? 'zb' : 'reg',
        colcode: 'sj', wds: '[]',
        dfwds: JSON.stringify(dfwds),
        k1: String(Date.now()),
      },
    });

    const dataNodes = data?.returndata?.datanodes ?? [];
    const wdnodes = data?.returndata?.wdnodes ?? [];
    const rowNodes = (wdnodes[0]?.nodes ?? []).map((n: any) => n.cname ?? n.name ?? '');
    const timeNodes = (wdnodes[1]?.nodes ?? []).map((n: any) => n.cname ?? n.name ?? '');

    const rows = rowNodes.map((rowName: string, i: number) => {
      const row: any[] = [rowName];
      for (let j = 0; j < timeNodes.length; j++) {
        const idx = i * timeNodes.length + j;
        const node = dataNodes[idx];
        row.push(node?.data?.hasdata ? node.data.data : null);
      }
      return row;
    });

    return createDataFrame(['\u5730\u533a', ...timeNodes], rows);
  } catch { return createDataFrame([], []); }
}

// ─── CNBS (China National Bureau of Statistics leverage) ──────

/**
 * China macro leverage rate data
 */
export async function macro_cnbs(): Promise<DataFrame> {
  const url = 'http://114.115.232.154:8080/handler/download.ashx';
  try {
    const axios = (await import('axios')).default;
    const resp = await axios.get<ArrayBuffer>(url, {
      responseType: 'arraybuffer',
      headers: { 'User-Agent': 'Mozilla/5.0', Referer: 'http://www.nifd.cn/' },
      timeout: 30000,
    });
    const wb = XLSX.read(Buffer.from(resp.data), { type: 'buffer' });
    const ws = wb.Sheets['Data'] ?? wb.Sheets[wb.SheetNames[0]];
    if (!ws) return createDataFrame([], []);
    const rows = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1, raw: true, defval: '' }) as any[][];
    if (rows.length < 3) return createDataFrame([], []);

    const header = rows[1].map((x) => String(x ?? '').trim());
    const body = rows.slice(2).filter((r) => r.some((v) => String(v ?? '').trim() !== ''));
    const records = body.map((r) => {
      const obj: Record<string, any> = {};
      header.forEach((h, i) => {
        if (h) obj[h] = r[i];
      });
      return obj;
    });

    const dropCols = new Set<string>();
    for (const h of header) {
      if (!h) continue;
      const allEmpty = records.every((rec) => String(rec[h] ?? '').trim() === '');
      if (allEmpty) dropCols.add(h);
    }

    const columnMap: Record<string, string> = {
      Period: '年份',
      Household: '居民部门',
      'Non-financial corporations': '非金融企业部门',
      'Central government ': '中央政府',
      'Central government': '中央政府',
      'Local government': '地方政府',
      'General government': '政府部门',
      'Non financial sector': '实体经济部门',
      'Financial sector(asset side)': '金融部门资产方',
      'Financial sector(liability side)': '金融部门负债方',
    };

    const order = ['年份', '居民部门', '非金融企业部门', '政府部门', '中央政府', '地方政府', '实体经济部门', '金融部门资产方', '金融部门负债方'];
    const outRows = records.map((rec) => {
      const renamed: Record<string, any> = {};
      for (const [k, v] of Object.entries(rec)) {
        if (dropCols.has(k)) continue;
        const nk = columnMap[k] ?? k;
        renamed[nk] = v;
      }

      const periodRaw = renamed['年份'];
      let period = '';
      if (typeof periodRaw === 'number') {
        const parsed = XLSX.SSF.parse_date_code(periodRaw);
        if (parsed) {
          const y = String(parsed.y).padStart(4, '0');
          const m = String(parsed.m).padStart(2, '0');
          period = `${y}-${m}`;
        }
      }
      if (!period && periodRaw) {
        const d = new Date(periodRaw);
        if (!Number.isNaN(d.getTime())) {
          period = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        } else {
          period = String(periodRaw).slice(0, 7);
        }
      }
      renamed['年份'] = period;

      return order.map((col, i) => (i === 0 ? renamed[col] ?? '' : toPyFloatCell(renamed[col])));
    });
    return createDataFrame(order, outRows);
  } catch {
    return createDataFrame(['年份', '居民部门', '非金融企业部门', '政府部门', '中央政府', '地方政府', '实体经济部门', '金融部门资产方', '金融部门负债方'], []);
  }
}

// ─── OPEC month report ────────────────────────────────────────

/**
 * OPEC monthly report
 */
export async function macro_cons_opec_month(): Promise<DataFrame> {
  const datesUrl = 'https://datacenter-api.jin10.com/reports/dates';
  const listUrl = 'https://datacenter-api.jin10.com/reports/list';
  try {
    const headers = {
      'x-app-id': 'rU6QIu7JHe2gOUeR',
      'x-csrf-token': '',
      'x-version': '1.0.0',
      Referer: 'https://datacenter.jin10.com/reportType/dc_opec_report',
      Origin: 'https://datacenter.jin10.com',
      'User-Agent': 'Mozilla/5.0',
    };
    const datesResp = await httpGet<any>(datesUrl, {
      params: { category: 'opec', _: Date.now() },
      headers,
    });
    const allDates: string[] = Array.isArray(datesResp?.data) ? datesResp.data : [];
    const orderedDates = [...allDates].reverse();
    const countries = ['阿尔及利亚', '安哥拉', '加蓬', '伊朗', '伊拉克', '科威特', '利比亚', '尼日利亚', '沙特', '阿联酋', '委内瑞拉', '欧佩克产量'];

    const rows: any[][] = [];
    for (const date of orderedDates) {
      const resp = await httpGet<any>(listUrl, {
        params: { category: 'opec', date, _: Date.now() },
        headers,
      });
      const keys = (resp?.data?.keys ?? []).map((k: any) => String(k?.name ?? ''));
      const values = Array.isArray(resp?.data?.values) ? resp.data.values : [];
      if (keys.length < 2 || !values.length) continue;

      const monthKeys = keys.slice(1);
      const monthIndex = monthKeys.length >= 2 ? monthKeys.length - 2 : monthKeys.length - 1;
      const monthName = monthKeys[monthIndex] ?? '';
      const colIdx = monthIndex + 1;

      const map = new Map<string, any>();
      for (const r of values) {
        const country = String(r?.[0] ?? '').trim();
        if (!country) continue;
        map.set(country, r?.[colIdx]);
      }

      const row: any[] = [monthName];
      for (const c of countries) {
        row.push(toPyFloatCell(map.get(c)));
      }
      rows.push(row);
    }

    const columns = ['日期', ...countries];
    return createDataFrame(columns, rows);
  } catch { return createDataFrame([], []); }
}

// ─── FX sentiment ─────────────────────────────────────────────

/**
 * Currency pair speculative sentiment report
 */
export async function macro_fx_sentiment(symbol: string = 'usd_jpy'): Promise<DataFrame> {
  const url = 'https://datacenter-api.jin10.com/reports/list_v2';
  try {
    const data = await httpGet<any>(url, {
      params: { max_date: '', category: 'ec', attr_id: '82', _: Date.now() },
      headers: { 'x-app-id': 'rU6QIu7JHe2gOUeR', 'x-csrf-token': 'x-csrf-token', 'x-version': '1.0.0' },
    });
    const values = data?.data?.values ?? [];
    const columns = ['\u65e5\u671f', '\u591a\u5934', '\u7a7a\u5934', '\u51c0\u5934\u5c0f\u8ba1'];
    const rows = values.map((row: any[]) => [row[0], row[1], row[2], row[3]]);
    return createDataFrame(columns, rows);
  } catch { return createDataFrame([], []); }
}

// ─── Wall Street Journal macro calendar ──────────────────────

/**
 * Wall Street Journal macro economic calendar
 */
export async function macro_info_ws(date: string = '20240514'): Promise<DataFrame> {
  const url = 'https://api-one-wscn.awtmt.com/apiv1/finance/macrodatas';
  try {
    const startMs = new Date(`${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)} 00:00:00`).getTime();
    const endMs = startMs + 24 * 60 * 60 * 1000;
    const data = await httpGet<any>(url, {
      params: { start: Math.floor(startMs / 1000), end: Math.floor(endMs / 1000) },
      headers: { 'User-Agent': 'Mozilla/5.0', Referer: 'https://wallstreetcn.com/calendar' },
    });
    const list = data?.data?.items ?? [];
    if (!Array.isArray(list) || !list.length) return createDataFrame([], []);
    const columns = ['时间', '地区', '事件', '重要性', '今值', '预期', '前值', '链接'];
    const rows = list.map((item: any) => [
      item.public_date ? formatShanghaiDateTime(Number(item.public_date)) : '',
      item.country ?? '',
      item.title ?? '',
      item.importance ?? '',
      toPyFloatCell(item.actual),
      toPyFloatCell(item.forecast),
      toPyFloatCell(item.revised) ?? toPyFloatCell(item.previous),
      item.uri ?? '',
    ]);
    return createDataFrame(columns, rows);
  } catch { return createDataFrame([], []); }
}

// ─── THS macro HTML table interfaces ─────────────────────────

async function _ths_macro_table(url: string, columns: string[]): Promise<DataFrame> {
  try {
    const text = await httpGetText(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const $ = load(text);
    const rows: any[][] = [];
    $('table').first().find('tr').each((i, tr) => {
      if (i === 0) return;
      const cells = $(tr).find('td').toArray().map((td) => $(td).text().trim());
      if (cells.length > 0) rows.push(cells);
    });
    return createDataFrame(columns, rows);
  } catch { return createDataFrame([], []); }
}

/**
 * THS - Stock financing data
 */
export async function macro_stock_finance(): Promise<DataFrame> {
  return _ths_macro_table(
    'https://data.10jqka.com.cn/macro/finance/',
    ['\u6708\u4efd', '\u52df\u96c6\u8d44\u91d1', '\u9996\u53d1\u52df\u96c6\u8d44\u91d1', '\u589e\u53d1\u52df\u96c6\u8d44\u91d1', '\u914d\u80a1\u52df\u96c6\u8d44\u91d1']
  );
}

/**
 * THS - New RMB loans
 */
export async function macro_rmb_loan(): Promise<DataFrame> {
  return _ths_macro_table(
    'https://data.10jqka.com.cn/macro/loan/',
    ['\u6708\u4efd', '\u65b0\u589e\u4eba\u6c11\u5e01\u8d37\u6b3e-\u603b\u989d', '\u65b0\u589e\u4eba\u6c11\u5e01\u8d37\u6b3e-\u540c\u6bd4', '\u65b0\u589e\u4eba\u6c11\u5e01\u8d37\u6b3e-\u73af\u6bd4', '\u7d2f\u8ba1\u4eba\u6c11\u5e01\u8d37\u6b3e-\u603b\u989d', '\u7d2f\u8ba1\u4eba\u6c11\u5e01\u8d37\u6b3e-\u540c\u6bd4']
  );
}

/**
 * THS - RMB deposit balance
 */
export async function macro_rmb_deposit(): Promise<DataFrame> {
  return _ths_macro_table(
    'https://data.10jqka.com.cn/macro/rmb/',
    ['\u6708\u4efd', '\u65b0\u589e\u5b58\u6b3e-\u6570\u91cf', '\u65b0\u589e\u5b58\u6b3e-\u540c\u6bd4', '\u65b0\u589e\u5b58\u6b3e-\u73af\u6bd4', '\u65b0\u589e\u4f01\u4e1a\u5b58\u6b3e-\u6570\u91cf', '\u65b0\u589e\u4f01\u4e1a\u5b58\u6b3e-\u540c\u6bd4', '\u65b0\u589e\u4f01\u4e1a\u5b58\u6b3e-\u73af\u6bd4', '\u65b0\u589e\u50a8\u84c4\u5b58\u6b3e-\u6570\u91cf', '\u65b0\u589e\u50a8\u84c4\u5b58\u6b3e-\u540c\u6bd4', '\u65b0\u589e\u50a8\u84c4\u5b58\u6b3e-\u73af\u6bd4', '\u65b0\u589e\u5176\u4ed6\u5b58\u6b3e-\u6570\u91cf', '\u65b0\u589e\u5176\u4ed6\u5b58\u6b3e-\u540c\u6bd4', '\u65b0\u589e\u5176\u4ed6\u5b58\u6b3e-\u73af\u6bd4']
  );
}

// ─── Swiss macro aliases ──────────────────────────────────────

/**
 * Swiss central bank interest rate decision (alias for macro_swiss_bank_rate)
 */
export async function macro_swiss_gbd_bank_rate(): Promise<DataFrame> {
  return _em_swiss_core('EMG00341606');
}

/**
 * Switzerland GDP annual rate (alias)
 */
export async function macro_swiss_gbd_yearly(): Promise<DataFrame> {
  return _em_swiss_core('EMG00341601');
}

async function _em_swiss_core(indicatorId: string): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  try {
    const data = await httpGet<any>(url, {
      params: {
        reportName: 'RPT_ECONOMICVALUE_CH',
        columns: 'ALL',
        filter: `(INDICATOR_ID="${indicatorId}")`,
        pageNumber: '1',
        pageSize: '5000',
        sortColumns: 'REPORT_DATE',
        sortTypes: '-1',
        source: 'WEB',
        client: 'WEB',
        p: '1',
        pageNo: '1',
        pageNum: '1',
      },
    });
    const list = data?.result?.data ?? [];
    const columns = ['时间', '前值', '现值', '发布日期'];
    const rows = list
      .map((item: any) => [
        item.REPORT_DATE_CH ?? item.REPORT_DATE ?? '',
        toPyFloatCell(item.PRE_VALUE),
        toPyFloatCell(item.VALUE),
        item.PUBLISH_DATE ? String(item.PUBLISH_DATE).slice(0, 10) : '',
      ])
      .sort((a: any[], b: any[]) => {
        const da = String(a[3] ?? '');
        const db = String(b[3] ?? '');
        if (!da && db) return 1;
        if (da && !db) return -1;
        return da.localeCompare(db);
      });
    return createDataFrame(columns, rows);
  } catch {
    return createDataFrame([], []);
  }
}
