/**
 * AKShare TypeScript - 股票基本信息接口
 */

import axios from 'axios';
import * as XLSX from 'xlsx';
import { load } from 'cheerio';
import { httpGet, httpGetText, httpGetTextGbk } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

function normalizeStockCode(value: any): string {
  const text = String(value ?? '').trim();
  if (!text) {
    return '';
  }
  const base = text.split('.')[0];
  if (base.toLowerCase().includes('nan')) {
    return '';
  }
  return base.padStart(6, '0');
}

function toDateString(value: any): string {
  if (value === null || value === undefined || value === '') {
    return '';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }
  return date.toISOString().split('T')[0];
}

function parseXlsxRows(buffer: ArrayBuffer): Record<string, any>[] {
  const wb = XLSX.read(Buffer.from(buffer), { type: 'buffer' });
  const sheetName = wb.SheetNames[0];
  if (!sheetName) {
    return [];
  }
  const ws = wb.Sheets[sheetName];
  return XLSX.utils.sheet_to_json<Record<string, any>>(ws, { defval: '' });
}

/**
 * 深圳证券交易所-股票列表
 */
export async function stock_info_sz_name_code(
  symbol: 'A股列表' | 'B股列表' | 'CDR列表' | 'AB股列表' = 'A股列表'
): Promise<DataFrame> {
  const indicatorMap = {
    'A股列表': 'tab1',
    'B股列表': 'tab2',
    'CDR列表': 'tab3',
    'AB股列表': 'tab4',
  } as const;

  const url = 'https://www.szse.cn/api/report/ShowReport';
  const params = {
    SHOWTYPE: 'xlsx',
    CATALOGID: '1110',
    TABKEY: indicatorMap[symbol],
    random: '0.6935816432433362',
  };

  try {
    const response = await axios.get(url, {
      params,
      responseType: 'arraybuffer',
      timeout: 30000,
    });

    const records = parseXlsxRows(response.data);
    if (records.length === 0) {
      return createDataFrame([], []);
    }

    if (records.length <= 10) {
      const columns = Object.keys(records[0]);
      const rows = records.map((item) => columns.map((col) => item[col] ?? ''));
      return createDataFrame(columns, rows);
    }

    if (symbol === 'A股列表') {
      const columns = ['板块', 'A股代码', 'A股简称', 'A股上市日期', 'A股总股本', 'A股流通股本', '所属行业'];
      const rows = records.map((item) => [
        item['板块'] ?? '',
        normalizeStockCode(item['A股代码']),
        item['A股简称'] ?? '',
        item['A股上市日期'] ?? '',
        item['A股总股本'] ?? '',
        item['A股流通股本'] ?? '',
        item['所属行业'] ?? '',
      ]);
      return createDataFrame(columns, rows);
    }

    if (symbol === 'B股列表') {
      const columns = ['板块', 'B股代码', 'B股简称', 'B股上市日期', 'B股总股本', 'B股流通股本', '所属行业'];
      const rows = records.map((item) => [
        item['板块'] ?? '',
        normalizeStockCode(item['B股代码']),
        item['B股简称'] ?? '',
        item['B股上市日期'] ?? '',
        item['B股总股本'] ?? '',
        item['B股流通股本'] ?? '',
        item['所属行业'] ?? '',
      ]);
      return createDataFrame(columns, rows);
    }

    if (symbol === 'AB股列表') {
      const columns = ['板块', 'A股代码', 'A股简称', 'A股上市日期', 'B股代码', 'B股简称', 'B股上市日期', '所属行业'];
      const rows = records.map((item) => [
        item['板块'] ?? '',
        normalizeStockCode(item['A股代码']),
        item['A股简称'] ?? '',
        item['A股上市日期'] ?? '',
        normalizeStockCode(item['B股代码']),
        item['B股简称'] ?? '',
        item['B股上市日期'] ?? '',
        item['所属行业'] ?? '',
      ]);
      return createDataFrame(columns, rows);
    }

    const columns = Object.keys(records[0]);
    const rows = records.map((item) => columns.map((col) => item[col] ?? ''));
    return createDataFrame(columns, rows);
  } catch {
    return createDataFrame([], []);
  }
}

/**
 * 上海证券交易所-股票列表
 */
export async function stock_info_sh_name_code(
  symbol: '主板A股' | '主板B股' | '科创板' = '主板A股'
): Promise<DataFrame> {
  const indicatorMap = {
    '主板A股': '1',
    '主板B股': '2',
    '科创板': '8',
  } as const;

  const url = 'https://query.sse.com.cn/sseQuery/commonQuery.do';
  const headers = {
    Host: 'query.sse.com.cn',
    Pragma: 'no-cache',
    Referer: 'https://www.sse.com.cn/assortment/stock/list/share/',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  };
  const params = {
    STOCK_TYPE: indicatorMap[symbol],
    REG_PROVINCE: '',
    CSRC_CODE: '',
    STOCK_CODE: '',
    sqlId: 'COMMON_SSE_CP_GPJCTPZ_GPLB_GP_L',
    COMPANY_STATUS: '2,4,5,7,8',
    type: 'inParams',
    isPagination: 'true',
    'pageHelp.cacheSize': '1',
    'pageHelp.beginPage': '1',
    'pageHelp.pageSize': '10000',
    'pageHelp.pageNo': '1',
    'pageHelp.endPage': '1',
  };

  try {
    const data = await httpGet<any>(url, { params, headers });
    const list = Array.isArray(data?.result) ? data.result : [];
    const codeField = symbol === '主板B股' ? 'B_STOCK_CODE' : 'A_STOCK_CODE';

    const columns = ['证券代码', '证券简称', '证券全称', '公司简称', '公司全称', '上市日期'];
    const rows = list.map((item: any) => [
      item?.[codeField] ?? '',
      item?.SEC_NAME_CN ?? '',
      item?.SEC_NAME_FULL ?? '',
      item?.COMPANY_ABBR ?? '',
      item?.FULL_NAME ?? '',
      toDateString(item?.LIST_DATE),
    ]);

    return createDataFrame(columns, rows);
  } catch {
    return createDataFrame([], []);
  }
}

/**
 * 北京证券交易所-股票列表
 */
export async function stock_info_bj_name_code(): Promise<DataFrame> {
  const url = 'https://www.bse.cn/nqxxController/nqxxCnzq.do';
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
  };
  const basePayload: Record<string, string> = {
    page: '0',
    typejb: 'T',
    'xxfcbj[]': '2',
    xxzqdm: '',
    sortfield: 'xxzqdm',
    sorttype: 'asc',
  };

  try {
    const parseResponse = (text: string): any => {
      // Response is JSONP: null([{...}])
      const start = text.indexOf('[');
      if (start < 0) return null;
      const end = text.lastIndexOf(']');
      if (end < start) return null;
      try {
        return JSON.parse(text.slice(start, end + 1));
      } catch {
        return null;
      }
    };

    // Use native https module to handle redirects with cookies
    const https = await import('https');
    const makeRequest = (payload: Record<string, string>): Promise<string> => {
      return new Promise((resolve, reject) => {
        const postData = new URLSearchParams(payload).toString();
        const options = {
          hostname: 'www.bse.cn',
          port: 443,
          path: '/nqxxController/nqxxCnzq.do',
          method: 'POST',
          headers: {
            ...headers,
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(postData),
          },
        };

        const req = https.request(options, (res) => {
          // Handle redirect
          if (res.statusCode === 307 && res.headers.location) {
            const cookie = res.headers['set-cookie']?.[0]?.split(';')[0] ?? '';
            const redirectOptions = {
              hostname: 'www.bse.cn',
              port: 443,
              path: '/nqxxController/nqxxCnzq.do',
              method: 'POST',
              headers: {
                ...headers,
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(postData),
                ...(cookie ? { Cookie: cookie } : {}),
              },
            };
            const redirectReq = https.request(redirectOptions, (redirectRes) => {
              let data = '';
              redirectRes.on('data', (chunk) => { data += chunk; });
              redirectRes.on('end', () => resolve(data));
            });
            redirectReq.on('error', reject);
            redirectReq.write(postData);
            redirectReq.end();
            return;
          }
          let data = '';
          res.on('data', (chunk) => { data += chunk; });
          res.on('end', () => resolve(data));
        });
        req.on('error', reject);
        req.write(postData);
        req.end();
      });
    };

    const firstResp = await makeRequest(basePayload);
    const firstData = parseResponse(firstResp);
    if (!Array.isArray(firstData) || !firstData.length) return createDataFrame([], []);
    const totalPages = Number(firstData[0]?.totalPages ?? 0);
    const allRows: any[][] = [];

    for (let page = 0; page < totalPages; page += 1) {
      const payload = { ...basePayload, page: String(page) };
      const resp = await makeRequest(payload);
      const data = parseResponse(resp);
      if (!Array.isArray(data) || !data.length) continue;
      const content = Array.isArray(data[0]?.content) ? data[0].content : [];
      for (const row of content) {
        if (row !== null && typeof row === 'object') {
          allRows.push(Object.values(row));
        }
      }
    }

    if (!allRows.length) return createDataFrame([], []);

    const columns = ['证券代码', '证券简称', '总股本', '流通股本', '上市日期', '所属行业', '地区', '报告日期'];
    const rows = allRows.map((row) => [
      String(row[38] ?? ''),  // 证券代码
      String(row[40] ?? ''),  // 证券简称
      row[36] ?? '',          // 总股本
      row[11] ?? '',          // 流通股本
      toDateString(row[0]),    // 上市日期
      String(row[17] ?? ''),  // 所属行业
      String(row[29] ?? ''),  // 地区
      toDateString(row[22]),   // 报告日期
    ]);

    return createDataFrame(columns, rows);
  } catch {
    return createDataFrame([], []);
  }
}

/**
 * 上海证券交易所-暂停和终止上市
 */
export async function stock_info_sh_delist(
  symbol: '全部' | '沪市' | '科创板' = '全部'
): Promise<DataFrame> {
  const symbolMap = {
    '全部': '1,2,8',
    '沪市': '1,2',
    '科创板': '8',
  } as const;

  const url = 'https://query.sse.com.cn/commonQuery.do';
  const headers = {
    Accept: '*/*',
    'Accept-Encoding': 'gzip, deflate',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    Host: 'query.sse.com.cn',
    Pragma: 'no-cache',
    Referer: 'https://www.sse.com.cn/',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  };
  const params = {
    sqlId: 'COMMON_SSE_CP_GPJCTPZ_GPLB_GP_L',
    isPagination: 'true',
    STOCK_CODE: '',
    CSRC_CODE: '',
    REG_PROVINCE: '',
    STOCK_TYPE: symbolMap[symbol],
    COMPANY_STATUS: '3',
    type: 'inParams',
    'pageHelp.cacheSize': '1',
    'pageHelp.beginPage': '1',
    'pageHelp.pageSize': '500',
    'pageHelp.pageNo': '1',
    'pageHelp.endPage': '1',
  };

  try {
    const data = await httpGet<any>(url, { params, headers });
    const list = Array.isArray(data?.result) ? data.result : [];
    const columns = ['公司代码', '公司简称', '上市日期', '暂停上市日期'];
    const rows = list.map((item: any) => [
      item?.COMPANY_CODE ?? '',
      item?.COMPANY_ABBR ?? '',
      toDateString(item?.LIST_DATE),
      toDateString(item?.DELIST_DATE),
    ]);
    return createDataFrame(columns, rows);
  } catch {
    return createDataFrame([], []);
  }
}

/**
 * 深证证券交易所-暂停和终止上市
 */
export async function stock_info_sz_delist(
  symbol: '暂停上市公司' | '终止上市公司' = '终止上市公司'
): Promise<DataFrame> {
  const indicatorMap = {
    '暂停上市公司': 'tab1',
    '终止上市公司': 'tab2',
  } as const;

  const url = 'https://www.szse.cn/api/report/ShowReport';
  const params = {
    SHOWTYPE: 'xlsx',
    CATALOGID: '1793_ssgs',
    TABKEY: indicatorMap[symbol],
    random: '0.6935816432433362',
  };

  try {
    const response = await axios.get(url, {
      params,
      responseType: 'arraybuffer',
      timeout: 30000,
    });
    const records = parseXlsxRows(response.data);
    if (records.length === 0) {
      return createDataFrame([], []);
    }

    const columns = Object.keys(records[0]);
    const rows = records.map((item) => {
      const row = columns.map((col) => item[col] ?? '');
      const codeIndex = columns.indexOf('证券代码');
      const listDateIndex = columns.indexOf('上市日期');
      const delistDateIndex = columns.indexOf('终止上市日期');
      if (codeIndex >= 0) {
        row[codeIndex] = normalizeStockCode(row[codeIndex]);
      }
      if (listDateIndex >= 0) {
        row[listDateIndex] = toDateString(row[listDateIndex]);
      }
      if (delistDateIndex >= 0) {
        row[delistDateIndex] = toDateString(row[delistDateIndex]);
      }
      return row;
    });
    return createDataFrame(columns, rows);
  } catch {
    return createDataFrame([], []);
  }
}

/**
 * 深证证券交易所-名称变更
 */
export async function stock_info_sz_change_name(
  symbol: '全称变更' | '简称变更' = '全称变更'
): Promise<DataFrame> {
  const indicatorMap = {
    '全称变更': 'tab1',
    '简称变更': 'tab2',
  } as const;

  const url = 'https://www.szse.cn/api/report/ShowReport';
  const params = {
    SHOWTYPE: 'xlsx',
    CATALOGID: 'SSGSGMXX',
    TABKEY: indicatorMap[symbol],
    random: '0.6935816432433362',
  };

  try {
    const response = await axios.get(url, {
      params,
      responseType: 'arraybuffer',
      timeout: 30000,
    });
    const records = parseXlsxRows(response.data);
    if (records.length === 0) {
      return createDataFrame([], []);
    }

    const columns = Object.keys(records[0]);
    const rows = records
      .map((item) => {
        const row = columns.map((col) => item[col] ?? '');
        const codeIndex = columns.indexOf('证券代码');
        const dateIndex = columns.indexOf('变更日期');
        if (codeIndex >= 0) {
          row[codeIndex] = normalizeStockCode(row[codeIndex]);
        }
        if (dateIndex >= 0) {
          row[dateIndex] = toDateString(row[dateIndex]);
        }
        return row;
      })
      .sort((a, b) => {
        const dateIndex = columns.indexOf('变更日期');
        if (dateIndex < 0) {
          return 0;
        }
        return String(a[dateIndex]).localeCompare(String(b[dateIndex]));
      });

    return createDataFrame(columns, rows);
  } catch {
    return createDataFrame([], []);
  }
}

/**
 * 新浪财经-A股股票曾用名
 */
export async function stock_info_change_name(symbol: string = '000503'): Promise<DataFrame> {
  const url = `https://vip.stock.finance.sina.com.cn/corp/go.php/vCI_CorpInfo/stockid/${symbol}.phtml`;

  try {
    const html = await httpGetTextGbk(url, {
      headers: {
        Referer: 'https://vip.stock.finance.sina.com.cn/',
      },
    });
    const $ = load(html);
    const tables = $('table').toArray();
    if (tables.length < 4) {
      return createDataFrame([], []);
    }

    const target = $(tables[3]);
    const kvRows: Array<[string, string]> = [];
    target.find('tr').each((_, tr) => {
      const cols = $(tr)
        .find('th,td')
        .toArray()
        .map((cell) => $(cell).text().replace(/\s+/g, ' ').trim())
        .filter((text) => text.length > 0);
      if (cols.length >= 2) {
        kvRows.push([cols[0], cols[1]]);
      }
    });

    const targetRow = kvRows.find(([k]) => k.split('：')[0] === '证券简称更名历史');
    if (!targetRow) {
      return createDataFrame([], []);
    }

    const names = String(targetRow[1])
      .split(' ')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    const columns = ['index', 'name'];
    const rows = names.map((name, idx) => [idx + 1, name]);
    return createDataFrame(columns, rows);
  } catch {
    return createDataFrame([], []);
  }
}

/**
 * 获取股票基本信息 - 东方财富
 *
 * @param symbol 股票代码，如 "000001"
 */
export async function stock_individual_info_em(
  symbol: string
): Promise<Record<string, any>> {
  const market = symbol.startsWith('6') ? '1' : '0';

  const url = 'https://push2.eastmoney.com/api/qt/stock/get';
  const params = {
    secid: `${market}.${symbol}`,
    fields: 'f57,f58,f59,f162,f167,f116,f117,f173,f177,f127,f115,f164,f168,f169,f170,f171,f172,f177,f531',
    ut: 'fa5fd1943c7b386f172d6893dbbd1d0c',
    _: Date.now(),
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.data) {
    return {};
  }

  const d = data.data;
  return {
    code: d.f57,
    name: d.f58,
    industry: d.f127,
    area: d.f164,
    pe: d.f162 / 100,
    pb: d.f167 / 100,
    totalValue: d.f116,
    circulatingValue: d.f117,
    market: d.f173 === 1 ? '上海' : '深圳',
    listDate: d.f177,
    roe: d.f172 / 100,
    revenue: d.f115,
    eps: d.f168 / 100,
    bvps: d.f169 / 100,
  };
}

/**
 * 获取A股股票列表 - 东方财富
 */
export async function stock_info_a_code_name(): Promise<DataFrame> {
  const url = 'https://79.push2.eastmoney.com/api/qt/clist/get';
  const params = {
    pn: '1',
    pz: '10000',
    po: '1',
    np: '1',
    ut: 'bd1d9ddb04089700cf9c27f6f7426281',
    fltt: '2',
    invt: '2',
    fid: 'f12',
    fs: 'm:0+t:6,m:0+t:80,m:1+t:2,m:1+t:23',
    fields: 'f12,f14',
    _: Date.now(),
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.data?.diff) {
    return createDataFrame([], []);
  }

  const columns = ['code', 'name'];
  const rows = data.data.diff.map((item: any) => [item.f12, item.f14]);

  return createDataFrame(columns, rows);
}

/**
 * 获取股票板块信息
 *
 * @param symbol 股票代码
 */
export async function stock_individual_basic_em(
  symbol: string
): Promise<Record<string, any>> {
  const market = symbol.startsWith('6') ? '1' : '0';

  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    reportName: 'RPT_F10_BASIC_ORGINFO',
    columns: 'SECUCODE,SECURITY_NAME_ABBR,ORG_CODE,SECURITY_CODE,ORG_NAME,REG_CAPITAL,FOUND_DATE,CHAIRMAN,SECRETARY,MAIN_BUSINESS,ORG_WEB,REG_ADDRESS,BELONG_INDUSTRY',
    filter: `(SECURITY_CODE="${symbol}")`,
    pageNumber: '1',
    pageSize: '1',
    sortTypes: '-1',
    sortColumns: 'MARKET_CAP',
    source: 'WEB',
    client: 'WEB',
    _: Date.now(),
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.result?.data?.[0]) {
    return {};
  }

  const d = data.result.data[0];
  return {
    code: d.SECURITY_CODE,
    name: d.SECURITY_NAME_ABBR,
    orgName: d.ORG_NAME,
    regCapital: d.REG_CAPITAL,
    foundDate: d.FOUND_DATE,
    chairman: d.CHAIRMAN,
    secretary: d.SECRETARY,
    mainBusiness: d.MAIN_BUSINESS,
    orgWeb: d.ORG_WEB,
    regAddress: d.REG_ADDRESS,
    belongIndustry: d.BELONG_INDUSTRY,
  };
}

/**
 * 获取沪深京A股实时行情 - 东方财富
 */
export async function stock_zh_a_gdhs_em(): Promise<DataFrame> {
  const url = 'https://79.push2.eastmoney.com/api/qt/clist/get';
  const params = {
    pn: '1',
    pz: '10000',
    po: '1',
    np: '1',
    ut: 'bd1d9ddb04089700cf9c27f6f7426281',
    fltt: '2',
    invt: '2',
    fid: 'f3',
    fs: 'm:0+t:6,m:0+t:80,m:1+t:2,m:1+t:23,m:0+t:81+s:2048',
    fields: 'f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f12,f13,f14,f15,f16,f17,f18,f20,f21,f23,f24,f25,f22,f11,f62,f128,f136,f115,f152,f124,f107',
    _: Date.now(),
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.data?.diff) {
    return createDataFrame([], []);
  }

  const columns = [
    '代码', '名称', '最新价', '涨跌幅', '涨跌额', '成交量', '成交额',
    '振幅', '换手率', '市盈率-动态', '市净率', '总市值', '流通市值'
  ];

  const rows = data.data.diff.map((item: any) => [
    item.f12,  // 代码
    item.f14,  // 名称
    item.f2,   // 最新价
    item.f3,   // 涨跌幅
    item.f4,   // 涨跌额
    item.f5,   // 成交量
    item.f6,   // 成交额
    item.f7,   // 振幅
    item.f8,   // 换手率
    item.f9,   // 市盈率-动态
    item.f23,  // 市净率
    item.f20,  // 总市值
    item.f21,  // 流通市值
  ]);

  return createDataFrame(columns, rows);
}
