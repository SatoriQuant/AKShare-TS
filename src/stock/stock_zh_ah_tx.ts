/**
 * AKShare TypeScript - A+H股数据接口
 * 数据源: 腾讯财经 (QQ Finance)
 * https://stockapp.finance.qq.com/mstats/#mod=list&id=hk_ah&module=HK&type=AH
 */

import { httpGetText, httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
  convertColumn,
} from '../utils/dataframe';

/**
 * 腾讯财经-港股-AH-获取总页数
 */
async function getZhAhPageCount(): Promise<number> {
  const url = 'http://stock.gtimg.cn/data/hk_rank.php';
  const params = {
    board: 'A_H',
    metric: 'price',
    pageSize: '20',
    reqPage: '1',
    order: 'decs',
    var_name: 'list_data',
  };

  const text = await httpGetText(url, {
    params,
    headers: {
      Referer: 'http://stockapp.finance.qq.com/mstats/',
    },
  });

  // Parse response: list_data={data:{page_count:N,...}}
  const jsonStart = text.indexOf('{');
  const jsonEnd = text.lastIndexOf('}');
  if (jsonStart === -1 || jsonEnd === -1) return 1;

  try {
    const data = JSON.parse(text.substring(jsonStart, jsonEnd + 1));
    return data?.data?.page_count || 1;
  } catch {
    return 1;
  }
}

/**
 * 腾讯财经-AH股-实时行情
 * https://stockapp.finance.qq.com/mstats/#mod=list&id=hk_ah&module=HK&type=AH
 */
export async function stock_zh_ah_spot(): Promise<DataFrame> {
  try {
    const pageCount = await getZhAhPageCount();
    const allRows: any[][] = [];

    for (let i = 0; i < pageCount; i++) {
      const url = 'http://stock.gtimg.cn/data/hk_rank.php';
      const params = {
        board: 'A_H',
        metric: 'price',
        pageSize: '20',
        reqPage: String(i),
        order: 'decs',
        var_name: 'list_data',
      };

      const text = await httpGetText(url, {
        params,
        headers: {
          Referer: 'http://stockapp.finance.qq.com/mstats/',
        },
      });

      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}');
      if (jsonStart === -1 || jsonEnd === -1) continue;

      try {
        const data = JSON.parse(text.substring(jsonStart, jsonEnd + 1));
        const pageData = data?.data?.page_data;
        if (!pageData || !Array.isArray(pageData)) continue;

        for (const item of pageData) {
          // Each item is a string like "code~name~price~chg_pct~chg~buy~sell~vol~amount~open~prev_close~high~low~..."
          const parts = String(item).split('~');
          if (parts.length >= 13) {
            allRows.push(parts);
          }
        }
      } catch {
        continue;
      }
    }

    if (allRows.length === 0) {
      return createDataFrame([], []);
    }

    const columns = [
      '代码', '名称', '最新价', '涨跌幅', '涨跌额',
      '买入', '卖出', '成交量', '成交额', '今开', '昨收', '最高', '最低',
    ];

    const rows = allRows.map(parts => [
      parts[0],                          // 代码
      parts[1],                          // 名称
      parts[2],                          // 最新价
      parts[3],                          // 涨跌幅
      parts[4],                          // 涨跌额
      parts[5],                          // 买入
      parts[6],                          // 卖出
      parts[7],                          // 成交量
      parts[8],                          // 成交额
      parts[9],                          // 今开
      parts[10],                         // 昨收
      parts[11],                         // 最高
      parts[12],                         // 最低
    ]);

    return createDataFrame(columns, rows);
  } catch (error) {
    return createDataFrame([], []);
  }
}

/**
 * 腾讯财经-AH股-股票名称
 * https://stockapp.finance.qq.com/mstats/#mod=list&id=hk_ah&module=HK&type=AH
 */
export async function stock_zh_ah_name(): Promise<DataFrame> {
  try {
    const df = await stock_zh_ah_spot();
    if (df.data.length === 0) {
      return createDataFrame([], []);
    }

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
