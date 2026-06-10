/**
 * AKShare TypeScript - 沪深债券数据接口
 */

import { httpGet, httpGetText } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';
import { decodeSinaData } from '../utils/jsDecode';

/**
 * 获取沪深债券列表 - 东方财富
 *
 * @param market 市场：sh 上海, sz 深圳
 */
export async function bond_zh_hs_cov_spot(
  market: 'sh' | 'sz' = 'sh'
): Promise<DataFrame> {
  const countUrl =
    'http://vip.stock.finance.sina.com.cn/quotes_service/api/json_v2.php/Market_Center.getHQNodeStockCountSimple';
  const dataUrl =
    'http://vip.stock.finance.sina.com.cn/quotes_service/api/json_v2.php/Market_Center.getHQNodeData';
  const node = market === 'sh' ? 'hskzz_z' : 'hskzz_z';

  try {
    const countData = await httpGet<string>(countUrl, {
      params: { node },
      responseType: 'text' as any,
    });
    const countMatch = String(countData).match(/\d+/);
    const total = countMatch ? parseInt(countMatch[0], 10) : 0;
    const pageCount = total > 0 ? Math.ceil(total / 80) : 0;
    if (pageCount <= 0) {
      return createDataFrame([], []);
    }

    const records: any[] = [];
    for (let page = 1; page <= pageCount; page++) {
      try {
        const pageData = await httpGet<any[]>(dataUrl, {
          params: {
            page: String(page),
            num: '80',
            sort: 'symbol',
            asc: '1',
            node,
            _s_r_a: 'page',
          },
        });
        if (Array.isArray(pageData) && pageData.length > 0) {
          records.push(...pageData);
        }
      } catch {
        continue;
      }
    }

    if (records.length === 0) {
      return createDataFrame([], []);
    }

    const columns = [
      'symbol',
      'name',
      'trade',
      'pricechange',
      'changepercent',
      'buy',
      'sell',
      'settlement',
      'open',
      'high',
      'low',
      'volume',
      'amount',
      'code',
      'ticktime',
    ];
    const rows = records.map((item: any) => [
      item?.symbol ?? '',
      item?.name ?? '',
      item?.trade ?? '',
      item?.pricechange ?? '',
      item?.changepercent ?? '',
      item?.buy ?? '',
      item?.sell ?? '',
      item?.settlement ?? '',
      item?.open ?? '',
      item?.high ?? '',
      item?.low ?? '',
      item?.volume ?? '',
      item?.amount ?? '',
      item?.code ?? '',
      item?.ticktime ?? '',
    ]);
    return createDataFrame(columns, rows);
  } catch {
    return createDataFrame([], []);
  }
}

/**
 * 新浪财经-债券-沪深债券-历史行情数据
 * https://vip.stock.finance.sina.com.cn/mkt/#hs_z
 *
 * @param symbol 沪深债券代码，如 sh010107
 */
export async function bond_zh_hs_daily(
  symbol: string = 'sh010107',
  _period?: 'daily' | 'weekly' | 'monthly',
  _startDate?: string,
  _endDate?: string
): Promise<DataFrame> {
  const now = new Date();
  const dateStr = `${now.getFullYear()}_${String(now.getMonth() + 1).padStart(2, '0')}_${String(now.getDate()).padStart(2, '0')}`;
  const url = `https://finance.sina.com.cn/realstock/company/${symbol}/hisdata/klc_kl.js?d=${dateStr}`;

  try {
    const text = await httpGetText(url);
    const encodedStr = String(text).split('=')[1]?.split(';')[0]?.replace(/"/g, '');
    if (!encodedStr) {
      return createDataFrame([], []);
    }

    const decoded = decodeSinaData(encodedStr);
    if (!Array.isArray(decoded) || decoded.length === 0) {
      return createDataFrame([], []);
    }

    const columns = Object.keys(decoded[0]);
    const rows = decoded.map((item: any) => {
      return columns.map((column) => {
        if (column === 'date') {
          const date = new Date(item?.date);
          return Number.isNaN(date.getTime()) ? null : date.toISOString().split('T')[0];
        }

        if (column === 'open' || column === 'high' || column === 'low' || column === 'close') {
          const value = Number(item?.[column]);
          return Number.isNaN(value) ? null : value;
        }

        return item?.[column] ?? null;
      });
    });

    return createDataFrame(columns, rows);
  } catch {
    return createDataFrame([], []);
  }
}
