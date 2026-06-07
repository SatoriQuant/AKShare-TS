/**
 * AKShare TypeScript - 腾讯财经A+H股数据接口
 * https://stockapp.finance.qq.com/mstats/#mod=list&id=hk_ah&module=HK&type=AH
 */

import { httpGetText } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
  convertColumn,
} from '../utils/dataframe';

/**
 * 腾讯财经-港股-AH-实时行情
 * https://stockapp.finance.qq.com/mstats/#mod=list&id=hk_ah&module=HK&type=AH
 *
 * @param page 页码，默认 0
 */
export async function stock_zh_ah_spot(
  page: number = 0
): Promise<DataFrame> {
  const url = 'https://proxy.finance.qq.com/ifzqgtimg/appstock/app/HkHdInfo/getHkAhData';
  const params = {
    market: 'hk',
    type: 'AH',
    key: 'code',
    order: '1',
    reqPage: page.toString(),
    stockType: '',
    _bk1: '',
    _: Date.now().toString(),
  };

  try {
    const text = await httpGetText(url, { params });
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    if (jsonStart === -1 || jsonEnd === -1) {
      return createDataFrame([], []);
    }

    const data = JSON.parse(text.substring(jsonStart, jsonEnd + 1));
    if (!data?.data?.page_data) {
      return createDataFrame([], []);
    }

    const columns = [
      '代码', '名称', '最新价', '涨跌幅', '涨跌额',
      '买入', '卖出', '成交量', '成交额', '今开', '昨收', '最高', '最低',
    ];

    const rows = data.data.page_data.map((item: string) => {
      const parts = item.split('~');
      return [
        parts[0],                    // 代码
        parts[1],                    // 名称
        parseFloat(parts[2]) || NaN, // 最新价
        parseFloat(parts[3]) || NaN, // 涨跌幅
        parseFloat(parts[4]) || NaN, // 涨跌额
        parseFloat(parts[5]) || NaN, // 买入
        parseFloat(parts[6]) || NaN, // 卖出
        parseInt(parts[7]) || NaN,   // 成交量
        parseFloat(parts[8]) || NaN, // 成交额
        parseFloat(parts[9]) || NaN, // 今开
        parseFloat(parts[10]) || NaN,// 昨收
        parseFloat(parts[11]) || NaN,// 最高
        parseFloat(parts[12]) || NaN,// 最低
      ];
    });

    return createDataFrame(columns, rows);
  } catch (error) {
    return createDataFrame([], []);
  }
}

/**
 * 腾讯财经-港股-AH-股票名称
 * https://stockapp.finance.qq.com/mstats/#mod=list&id=hk_ah&module=HK&type=AH
 */
export async function stock_zh_ah_name(): Promise<DataFrame> {
  try {
    const df = await stock_zh_ah_spot();
    if (df.data.length === 0) {
      return createDataFrame([], []);
    }

    // Only keep code and name columns
    const codeIdx = df.columns.indexOf('代码');
    const nameIdx = df.columns.indexOf('名称');

    const columns = ['代码', '名称'];
    const rows = df.data.map(row => [row[codeIdx], row[nameIdx]]);

    return createDataFrame(columns, rows);
  } catch (error) {
    return createDataFrame([], []);
  }
}

/**
 * 腾讯财经-港股-AH-股票历史行情
 * https://gu.qq.com/hk01033/gp
 *
 * @param symbol 股票代码，如 "02318"
 * @param startYear 开始年份，如 "2020"
 * @param endYear 结束年份，如 "2024"
 * @param adjust 复权类型：qfq 前复权, hfq 后复权, "" 不复权
 */
export async function stock_zh_ah_daily(
  symbol: string = '02318',
  startYear: string = '2020',
  endYear: string = '2024',
  adjust: 'qfq' | 'hfq' | '' = ''
): Promise<DataFrame> {
  const allRows: any[][] = [];
  const columns = ['日期', '开盘', '收盘', '最高', '最低', '成交量'];

  for (let year = parseInt(startYear); year < parseInt(endYear); year++) {
    let url: string;
    const adjustSuffix = adjust ? `,${adjust}` : '';

    if (adjust === '') {
      url = 'http://web.ifzq.gtimg.cn/appstock/app/kline/kline';
    } else {
      url = 'https://web.ifzq.gtimg.cn/appstock/app/hkfqkline/get';
    }

    const params: Record<string, string> = {
      _var: `kline_day${adjust}${year}`,
      param: `hk${symbol},day,${year}-01-01,${year + 1}-12-31,640${adjustSuffix}`,
      r: Math.random().toString(),
    };

    try {
      const text = await httpGetText(url, {
        params,
        headers: {
          Referer: `http://gu.qq.com/hk${symbol}/gp`,
        },
      });

      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}');
      if (jsonStart === -1 || jsonEnd === -1) continue;

      const data = JSON.parse(text.substring(jsonStart, jsonEnd + 1));
      let klineData: any[];

      if (adjust === '') {
        klineData = data?.data?.[`hk${symbol}`]?.day;
      } else {
        klineData = data?.data?.[`hk${symbol}`]?.[`${adjust}day`];
      }

      if (!klineData || !Array.isArray(klineData)) continue;

      for (const item of klineData) {
        if (Array.isArray(item)) {
          allRows.push([
            item[0],
            parseFloat(item[1]) || NaN,
            parseFloat(item[2]) || NaN,
            parseFloat(item[3]) || NaN,
            parseFloat(item[4]) || NaN,
            parseInt(item[5]) || NaN,
          ]);
        }
      }
    } catch (error) {
      continue;
    }
  }

  if (allRows.length === 0) {
    return createDataFrame([], []);
  }

  let df = createDataFrame(columns, allRows);

  // Convert types
  df = convertColumn(df, '日期', 'date');
  for (const col of ['开盘', '收盘', '最高', '最低', '成交量']) {
    df = convertColumn(df, col, 'number');
  }

  return df;
}
