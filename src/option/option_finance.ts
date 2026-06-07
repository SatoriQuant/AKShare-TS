/**
 * AKShare TypeScript - 金融期权数据
 * http://www.sse.com.cn/assortment/options/price/
 * http://www.szse.cn/market/product/option/index.html
 * http://www.cffex.com.cn/hs300gzqq/
 * http://www.cffex.com.cn/zz1000gzqq/
 */

import { httpGet, httpGetText } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

// 上交所期权URL常量
const SH_OPTION_URLS: Record<string, string> = {
  '华夏上证50ETF期权': 'http://yunhq.sse.com.cn:32041/v1/sh1/list/self/510050',
  '华泰柏瑞沪深300ETF期权': 'http://yunhq.sse.com.cn:32041/v1/sh1/list/self/510300',
  '南方中证500ETF期权': 'http://yunhq.sse.com.cn:32041/v1/sh1/list/self/510500',
  '华夏科创50ETF期权': 'http://yunhq.sse.com.cn:32041/v1/sh1/list/self/588000',
  '易方达科创50ETF期权': 'http://yunhq.sse.com.cn:32041/v1/sh1/list/self/588080',
};

const SH_OPTION_KING_URLS: Record<string, string> = {
  '华夏上证50ETF期权': 'http://yunhq.sse.com.cn:32041/v1/sho/list/tstyle/510050_{}',
  '华泰柏瑞沪深300ETF期权': 'http://yunhq.sse.com.cn:32041/v1/sho/list/tstyle/510300_{}',
  '南方中证500ETF期权': 'http://yunhq.sse.com.cn:32041/v1/sho/list/tstyle/510500_{}',
  '华夏科创50ETF期权': 'http://yunhq.sse.com.cn:32041/v1/sho/list/tstyle/588000_{}',
  '易方达科创50ETF期权': 'http://yunhq.sse.com.cn:32041/v1/sho/list/tstyle/588080_{}',
};

/**
 * 期权标的当日行情
 * http://www.sse.com.cn/assortment/options/price/
 * @param symbol 期权品种名称
 * @returns 期权标的当日行情
 */
export async function option_finance_sse_underlying(
  symbol: string = '华夏科创50ETF期权'
): Promise<DataFrame> {
  const url = SH_OPTION_URLS[symbol];
  if (!url) {
    return createDataFrame([], []);
  }

  const params = {
    select: 'select: code,name,last,change,chg_rate,amp_rate,volume,amount,prev_close',
  };

  try {
    const data = await httpGet<any>(url, { params });

    if (!data?.list || data.list.length === 0) {
      return createDataFrame([], []);
    }

    const columns = [
      '代码', '名称', '当前价', '涨跌', '涨跌幅', '振幅',
      '成交量(手)', '成交额(万元)', '更新日期'
    ];

    const updateTime = `${data.date}${data.time}`;
    const rows = data.list.map((item: any[]) => [
      item[0],
      item[1],
      parseFloat(item[2]) || null,
      parseFloat(item[3]) || null,
      parseFloat(item[4]) || null,
      parseFloat(item[5]) || null,
      parseInt(item[6]) || null,
      parseFloat(item[7]) || null,
      updateTime,
    ]);

    return createDataFrame(columns, rows);
  } catch {
    return createDataFrame([], []);
  }
}

/**
 * 期权当前交易日的行情数据
 * http://www.sse.com.cn/assortment/options/price/
 * @param symbol 期权品种名称
 * @param end_month 到期月份，如 "2306"
 * @returns 当日行情
 */
export async function option_finance_board(
  symbol: string = '嘉实沪深300ETF期权',
  end_month: string = '2306'
): Promise<DataFrame> {
  const month = end_month.slice(-2);

  // 上交所ETF期权
  if (SH_OPTION_KING_URLS[symbol]) {
    const urlTemplate = SH_OPTION_KING_URLS[symbol];
    const url = urlTemplate.replace('{}', month);
    const params = { select: 'contractid,last,chg_rate,presetpx,exepx' };

    try {
      const data = await httpGet<any>(url, { params });

      if (!data?.list || data.list.length === 0) {
        return createDataFrame([], []);
      }

      const columns = ['日期', '合约交易代码', '当前价', '涨跌幅', '前结价', '行权价', '数量'];
      const dateTime = `${data.date}${data.time}`;
      const rows = data.list.map((item: any[]) => [
        dateTime,
        item[0],
        parseFloat(item[1]) || null,
        parseFloat(item[2]) || null,
        parseFloat(item[3]) || null,
        parseFloat(item[4]) || null,
        data.total,
      ]);

      return createDataFrame(columns, rows);
    } catch {
      return createDataFrame([], []);
    }
  }

  // 深交所嘉实沪深300ETF期权
  if (symbol === '嘉实沪深300ETF期权') {
    const url = 'http://www.szse.cn/api/report/ShowReport/data';
    const params = {
      SHOWTYPE: 'JSON',
      CATALOGID: 'ysplbrb',
      TABKEY: 'tab1',
      PAGENO: '1',
      random: '0.10642298535346595',
    };

    try {
      const data = await httpGet<any>(url, { params });
      const pageCount = data[0]?.metadata?.pagecount || 1;

      const allRows: any[][] = [];
      for (let page = 1; page <= pageCount; page++) {
        const pageParams = {
          ...params,
          PAGENO: String(page),
        };
        const pageData = await httpGet<any>(url, { params: pageParams });
        if (pageData[0]?.data) {
          allRows.push(...pageData[0].data);
        }
      }

      const columns = [
        '合约编码', '合约简称', '标的名称', '类型', '行权价',
        '合约单位', '期权行权日', '行权交收日'
      ];

      const rows = allRows
        .filter((item: any[]) => {
          // 按到期月份过滤
          if (item[6]) {
            const dateStr = String(item[6]);
            const m = dateStr.substring(4, 6);
            return m === month;
          }
          return false;
        })
        .map((item: any[]) => [
          item[0],
          item[1],
          item[2],
          item[3],
          parseFloat(item[4]) || null,
          parseInt(item[5]) || null,
          item[6],
          item[7],
        ]);

      return createDataFrame(columns, rows);
    } catch {
      return createDataFrame([], []);
    }
  }

  // 中金所股指期权
  const cffexUrls: Record<string, string> = {
    '沪深300股指期权': 'http://www.cffex.com.cn/quote_IO.txt',
    '中证1000股指期权': 'http://www.cffex.com.cn/quote_MO.txt',
    '上证50股指期权': 'http://www.cffex.com.cn/quote_HO.txt',
  };

  if (cffexUrls[symbol]) {
    try {
      const text = await httpGetText(cffexUrls[symbol]);
      const lines = text.split('\n').filter(line => line.trim());

      if (lines.length < 2) {
        return createDataFrame([], []);
      }

      const headerLine = lines[0];
      const headers = headerLine.split(',').map(h => h.trim());

      const dataLines = lines.slice(1);
      const filteredRows = dataLines
        .filter(line => {
          const parts = line.split(',');
          const instrument = parts[0] || '';
          const endMonth = instrument.substring(4, 6);
          return endMonth === month;
        })
        .map(line => line.split(',').map(p => p.trim()));

      if (filteredRows.length === 0) {
        return createDataFrame([], []);
      }

      return createDataFrame(headers, filteredRows);
    } catch {
      return createDataFrame([], []);
    }
  }

  return createDataFrame([], []);
}

/**
 * 中金所-沪深300指数期权数据
 * http://www.cffex.com.cn/hs300gzqq/
 * @returns 沪深300指数期权实时行情
 */
export async function option_cffex_300(): Promise<DataFrame> {
  const url = 'http://www.cffex.com.cn/quote_IO.txt';

  try {
    const text = await httpGetText(url);
    const lines = text.split('\n').filter(line => line.trim());

    if (lines.length < 2) {
      return createDataFrame([], []);
    }

    const headers = lines[0].split(',').map(h => h.trim());
    const rows = lines.slice(1).map(line =>
      line.split(',').map(p => p.trim())
    );

    return createDataFrame(headers, rows);
  } catch {
    return createDataFrame([], []);
  }
}

/**
 * 中金所-中证1000指数期权数据
 * http://www.cffex.com.cn/zz1000gzqq/
 * @returns 中证1000指数期权实时行情
 */
export async function option_cffex_1000(): Promise<DataFrame> {
  const url = 'http://www.cffex.com.cn/quote_MO.txt';

  try {
    const text = await httpGetText(url);
    const lines = text.split('\n').filter(line => line.trim());

    if (lines.length < 2) {
      return createDataFrame([], []);
    }

    const headers = lines[0].split(',').map(h => h.trim());
    const rows = lines.slice(1).map(line =>
      line.split(',').map(p => p.trim())
    );

    return createDataFrame(headers, rows);
  } catch {
    return createDataFrame([], []);
  }
}

/**
 * 中金所-上证50指数期权数据
 * @returns 上证50指数期权实时行情
 */
export async function option_cffex_50(): Promise<DataFrame> {
  const url = 'http://www.cffex.com.cn/quote_HO.txt';

  try {
    const text = await httpGetText(url);
    const lines = text.split('\n').filter(line => line.trim());

    if (lines.length < 2) {
      return createDataFrame([], []);
    }

    const headers = lines[0].split(',').map(h => h.trim());
    const rows = lines.slice(1).map(line =>
      line.split(',').map(p => p.trim())
    );

    return createDataFrame(headers, rows);
  } catch {
    return createDataFrame([], []);
  }
}
