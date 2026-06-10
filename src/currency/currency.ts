/**
 * AKShare TypeScript - 汇率数据接口
 */

import { httpGet, httpGetText } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 新浪财经-中行人民币牌价历史数据查询
 */
export async function currency_boc_sina(
  symbol: string = '美元',
  start_date: string = '20230304',
  end_date: string = '20231110'
): Promise<DataFrame> {
  const url = 'http://biz.finance.sina.com.cn/forex/forex.php';
  const symbolMap: Record<string, string> = {
    美元: 'USD',
    英镑: 'GBP',
    欧元: 'EUR',
    澳门元: 'MOP',
    泰国铢: 'THB',
    菲律宾比索: 'PHP',
    港币: 'HKD',
    瑞士法郎: 'CHF',
    新加坡元: 'SGD',
    瑞典克朗: 'SEK',
    丹麦克朗: 'DKK',
    挪威克朗: 'NOK',
    日元: 'JPY',
    加拿大元: 'CAD',
    澳大利亚元: 'AUD',
    新西兰元: 'NZD',
    韩国元: 'KRW',
  };

  const moneyCode = symbolMap[symbol] || symbolMap['美元'];
  const baseParams = {
    money_code: moneyCode,
    type: '0',
    startdate: `${start_date.slice(0, 4)}-${start_date.slice(4, 6)}-${start_date.slice(6, 8)}`,
    enddate: `${end_date.slice(0, 4)}-${end_date.slice(4, 6)}-${end_date.slice(6, 8)}`,
    call_type: 'ajax',
  };

  const parseTableRows = (html: string): string[][] => {
    const tableMatch = html.match(/<table[\s\S]*?<\/table>/i);
    if (!tableMatch) {
      return [];
    }
    const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    const rows: string[][] = [];
    let rowMatch: RegExpExecArray | null;

    while ((rowMatch = rowRegex.exec(tableMatch[0])) !== null) {
      const cellRegex = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi;
      const cells: string[] = [];
      let cellMatch: RegExpExecArray | null;
      while ((cellMatch = cellRegex.exec(rowMatch[1])) !== null) {
        cells.push(cellMatch[1].replace(/<[^>]+>/g, '').replace(/&nbsp;/gi, ' ').trim());
      }
      if (cells.length > 0) {
        rows.push(cells);
      }
    }

    return rows;
  };

  const toPandasNumericString = (value: any): string => {
    const raw = String(value ?? '').trim();
    if (!raw) {
      return '';
    }
    const num = Number(raw);
    if (!Number.isFinite(num)) {
      return '';
    }
    return Number.isInteger(num) ? num.toFixed(1) : num.toString();
  };

  try {
    const firstHtml = await httpGetText(url, { params: { ...baseParams, page: '1' } });
      const pageMatches = Array.from(firstHtml.matchAll(/<a[^>]*class="page"[^>]*>(\d+)<\/a>/gi));
      const pageNum = pageMatches.length > 0
        ? Math.max(...pageMatches.map((m) => Number(m[1] || 1)).filter((n) => Number.isFinite(n)))
        : 1;

    const allRows: string[][] = [];
    for (let page = 1; page <= pageNum; page++) {
      const pageHtml = await httpGetText(url, {
        params: { ...baseParams, page: String(page) },
      });
      const rows = parseTableRows(pageHtml);
      if (rows.length > 1) {
        allRows.push(...rows.slice(1));
      }
    }

    if (allRows.length === 0) {
      return createDataFrame([], []);
    }

    allRows.sort((a, b) => String(a[0] || '').localeCompare(String(b[0] || '')));
    const columns = ['日期', '中行汇买价', '中行钞买价', '中行钞卖价/汇卖价', '央行中间价', '中行折算价'];
    return createDataFrame(
      columns,
      allRows.map((row) => [
        row[0] ?? '',
        toPandasNumericString(row[1]),
        toPandasNumericString(row[2]),
        toPandasNumericString(row[3]),
        toPandasNumericString(row[4]),
        toPandasNumericString(row[5]),
      ])
    );
  } catch {
    return createDataFrame([], []);
  }
}

/**
 * 获取美元兑人民币汇率 - 东方财富
 */
export async function currency_usd_cny(): Promise<DataFrame> {
  const url = 'https://push2his.eastmoney.com/api/qt/stock/kline/get';
  const params = {
    fields1: 'f1,f2,f3,f4,f5,f6',
    fields2: 'f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61',
    klt: '101',
    fqt: '1',
    secid: '119.USDCNY',
    beg: '19700101',
    end: '20500101',
    lmt: '1000000',
    _: Date.now(),
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.data?.klines) {
    return createDataFrame([], []);
  }

  const columns = ['日期', '开盘', '收盘', '最高', '最低', '成交量'];

  const rows = data.data.klines.map((item: string) => {
    const parts = item.split(',');
    return [
      parts[0],
      parseFloat(parts[1]),
      parseFloat(parts[2]),
      parseFloat(parts[3]),
      parseFloat(parts[4]),
      parseInt(parts[5]),
    ];
  });

  return createDataFrame(columns, rows);
}

/**
 * 获取主要货币汇率 - 东方财富
 */
export async function currency_boc_safe(): Promise<DataFrame> {
  const url = 'https://79.push2.eastmoney.com/api/qt/clist/get';
  const params = {
    pn: '1',
    pz: '100',
    po: '1',
    np: '1',
    ut: 'bd1d9ddb04089700cf9c27f6f7426281',
    fltt: '2',
    invt: '2',
    fid: 'f3',
    fs: 'm:119',
    fields: 'f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f12,f13,f14,f15,f16,f17,f18,f20,f21,f23,f24,f25,f22,f11,f62,f128,f136,f115,f152',
    _: Date.now(),
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.data?.diff) {
    return createDataFrame([], []);
  }

  const columns = ['货币代码', '货币名称', '最新价', '涨跌幅', '涨跌额', '开盘', '最高', '最低', '昨收'];

  const rows = data.data.diff.map((item: any) => [
    item.f12,  // 货币代码
    item.f14,  // 货币名称
    item.f2,   // 最新价
    item.f3,   // 涨跌幅
    item.f4,   // 涨跌额
    item.f17,  // 开盘
    item.f15,  // 最高
    item.f16,  // 最低
    item.f18,  // 昨收
  ]);

  return createDataFrame(columns, rows);
}

// ---------------------------------------------------------------------------
// currencybeacon / currencyscoop.com 外汇数据接口
// ---------------------------------------------------------------------------

/**
 * Latest data from currencyscoop.com
 * https://currencyscoop.com/api-documentation
 *
 * @param base 基础货币，如 "USD"
 * @param symbols 目标货币列表，逗号分隔
 * @param api_key API Key
 */
export async function currency_latest(
  base: string = 'USD',
  symbols: string = '',
  api_key: string = ''
): Promise<DataFrame> {
  const url = 'https://api.currencyscoop.com/v1/latest';
  const params: Record<string, string> = { base, api_key };
  if (symbols) params.symbols = symbols;

  const dataJson = await httpGet<any>(url, { params });

  if (!dataJson?.response) {
    return createDataFrame([], []);
  }

  const response = dataJson.response;
  const date = response.date;
  const rates = response.rates || {};

  const columns = ['currency', 'rate', 'date'];
  const rows = Object.entries(rates).map(([currency, rate]) => [
    currency,
    rate,
    date,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * Historical data from currencyscoop.com
 * https://currencyscoop.com/api-documentation
 *
 * @param base 基础货币
 * @param date 特定日期，如 "2020-02-03"
 * @param symbols 目标货币列表
 * @param api_key API Key
 */
export async function currency_history(
  base: string = 'USD',
  date: string = '2023-02-03',
  symbols: string = '',
  api_key: string = ''
): Promise<DataFrame> {
  const url = 'https://api.currencyscoop.com/v1/historical';
  const params: Record<string, string> = { base, date, api_key };
  if (symbols) params.symbols = symbols;

  const dataJson = await httpGet<any>(url, { params });

  if (!dataJson?.response) {
    return createDataFrame([], []);
  }

  const response = dataJson.response;
  const responseDate = response.date;
  const rates = response.rates || {};

  const columns = ['currency', 'rate', 'date'];
  const rows = Object.entries(rates).map(([currency, rate]) => [
    currency,
    rate,
    responseDate,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * Time-series data from currencyscoop.com
 * https://currencyscoop.com/api-documentation
 * P.S. need special authority
 *
 * @param base 基础货币
 * @param start_date 开始日期
 * @param end_date 结束日期
 * @param symbols 目标货币列表
 * @param api_key API Key
 */
export async function currency_time_series(
  base: string = 'USD',
  start_date: string = '2023-02-03',
  end_date: string = '2023-03-04',
  symbols: string = '',
  api_key: string = ''
): Promise<DataFrame> {
  const url = 'https://api.currencyscoop.com/v1/timeseries';
  const params: Record<string, string> = {
    base,
    api_key,
    start_date,
    end_date,
  };
  if (symbols) params.symbols = symbols;

  const dataJson = await httpGet<any>(url, { params });

  if (!dataJson?.response) {
    return createDataFrame([], []);
  }

  const response = dataJson.response;
  // response is { "2023-02-03": { "USD": {...rates...} }, ... }
  const dates = Object.keys(response).sort();

  if (dates.length === 0) {
    return createDataFrame([], []);
  }

  // Collect all currency names
  const currencySet = new Set<string>();
  for (const d of dates) {
    for (const cur of Object.keys(response[d] || {})) {
      currencySet.add(cur);
    }
  }
  const currencies = Array.from(currencySet).sort();

  const columns = ['date', ...currencies];
  const rows = dates.map(d => {
    const rates = response[d] || {};
    return [d, ...currencies.map(c => rates[c] ?? null)];
  });

  return createDataFrame(columns, rows);
}

/**
 * currencies data from currencyscoop.com
 * https://currencyscoop.com/api-documentation
 *
 * @param c_type 类型，目前仅 "fiat" 可返回数据
 * @param api_key API Key
 */
export async function currency_currencies(
  c_type: string = 'fiat',
  api_key: string = ''
): Promise<DataFrame> {
  const url = 'https://api.currencyscoop.com/v1/currencies';
  const params = { type: c_type, api_key };

  const dataJson = await httpGet<any>(url, { params });

  if (!dataJson?.response) {
    return createDataFrame([], []);
  }

  const response = dataJson.response;

  // response may be an array directly or an object with nested arrays
  if (Array.isArray(response)) {
    if (response.length === 0) return createDataFrame([], []);
    const columns = Object.keys(response[0]);
    const data = response.map((item: any) => columns.map(col => item[col]));
    return createDataFrame(columns, data);
  }

  // If response is an object with nested data keyed by currency type
  const allRecords: Record<string, any>[] = [];
  for (const [, value] of Object.entries(response)) {
    if (Array.isArray(value)) {
      allRecords.push(...value);
    } else if (typeof value === 'object' && value !== null) {
      allRecords.push(value);
    }
  }

  if (allRecords.length === 0) return createDataFrame([], []);
  const columns = Object.keys(allRecords[0]);
  const data = allRecords.map(item => columns.map(col => item[col]));
  return createDataFrame(columns, data);
}

/**
 * Convert currency data from currencyscoop.com
 * https://currencyscoop.com/api-documentation
 *
 * @param base 基础货币
 * @param to 目标货币
 * @param amount 金额
 * @param api_key API Key
 */
export async function currency_convert(
  base: string = 'USD',
  to: string = 'CNY',
  amount: string = '10000',
  api_key: string = ''
): Promise<DataFrame> {
  const url = 'https://api.currencyscoop.com/v1/convert';
  const params = {
    from: base,
    to,
    amount,
    api_key,
  };

  const dataJson = await httpGet<any>(url, { params });

  if (!dataJson?.response) {
    return createDataFrame([], []);
  }

  const response = dataJson.response;
  const columns = ['item', 'value'];
  const rows: any[][] = [];

  for (const [key, value] of Object.entries(response)) {
    if (key === 'timestamp') {
      const ts = typeof value === 'number' ? value : Number(value);
      const dateStr = new Date(ts * 1000).toISOString();
      rows.push([key, dateStr]);
    } else {
      rows.push([key, value]);
    }
  }

  return createDataFrame(columns, rows);
}
