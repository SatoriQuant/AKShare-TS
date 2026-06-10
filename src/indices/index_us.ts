/**
 * AKShare TypeScript - 美国指数数据接口
 */

import { httpGet, httpGetText } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';
import { decodeSinaUSData } from '../utils/jsDecode';

/**
 * 获取美国指数实时行情 - 东方财富
 */
export async function index_us_stock_sina(symbol: string = '.INX'): Promise<DataFrame> {
  const url = `https://finance.sina.com.cn/staticdata/us/${symbol}`;
  try {
    const text = await httpGetText(url);
    const encoded = text.split('=')[1]?.split(';')[0]?.replace(/"/g, '');
    if (!encoded) {
      return createDataFrame([], []);
    }

    const decoded = decodeSinaUSData(encoded);
    if (!Array.isArray(decoded) || decoded.length === 0) {
      return createDataFrame([], []);
    }

    const columns = ['date', 'open', 'high', 'low', 'close', 'volume', 'amount'];
    const toNum = (v: any): number | null => {
      const n = Number(v);
      return Number.isFinite(n) ? n : null;
    };

    const rows = decoded.map((item: any) => {
      let dateStr: string;
      const d = item.date;
      if (d && typeof d.getFullYear === 'function') {
        // VM-sandboxed Date objects don't pass instanceof Date
        dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      } else if (d instanceof Date) {
        dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      } else {
        dateStr = String(d ?? '');
      }
      return [
        dateStr,
        toNum(item.open),
        toNum(item.high),
        toNum(item.low),
        toNum(item.close),
        toNum(item.volume),
        toNum(item.amount),
      ];
    });

    return createDataFrame(columns, rows);
  } catch {
    return createDataFrame([], []);
  }
}

/**
 * 获取美国指数历史行情 - 东方财富
 *
 * @param symbol 指数代码，如 ".DJI" (道琼斯), ".IXIC" (纳斯达克), ".INX" (标普500)
 * @param period 周期：daily, weekly, monthly
 * @param startDate 开始日期
 * @param endDate 结束日期
 */
export async function index_us_stock_sina_hist(
  symbol: string,
  period: 'daily' | 'weekly' | 'monthly' = 'daily',
  startDate?: string,
  endDate?: string
): Promise<DataFrame> {
  const periodMap: Record<string, string> = {
    daily: '101',
    weekly: '102',
    monthly: '103',
  };

  const url = 'https://push2his.eastmoney.com/api/qt/stock/kline/get';
  const params = {
    fields1: 'f1,f2,f3,f4,f5,f6',
    fields2: 'f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61',
    klt: periodMap[period],
    fqt: '1',
    secid: `105.${symbol}`,
    beg: startDate || '19700101',
    end: endDate || '20500101',
    lmt: '1000000',
    _: Date.now(),
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.data?.klines) {
    return createDataFrame([], []);
  }

  const columns = ['日期', '开盘', '收盘', '最高', '最低', '成交量', '振幅', '涨跌幅', '涨跌额'];

  const rows = data.data.klines.map((item: string) => {
    const parts = item.split(',');
    return [
      parts[0],
      parseFloat(parts[1]),
      parseFloat(parts[2]),
      parseFloat(parts[3]),
      parseFloat(parts[4]),
      parseInt(parts[5]),
      parseFloat(parts[7]),
      parseFloat(parts[8]),
      parseFloat(parts[9]),
    ];
  });

  return createDataFrame(columns, rows);
}
