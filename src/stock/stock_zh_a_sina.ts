/**
 * AKShare TypeScript - 新浪股票数据接口
 */

import { httpGetText, httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
  convertColumn,
} from '../utils/dataframe';

/**
 * 股票日线行情数据 - 新浪
 *
 * @param symbol 股票代码，如 "sh000001" 或 "sz000001"
 * @param startDate 开始日期
 * @param endDate 结束日期
 * @param adjust 复权类型：qfq 前复权, hfq 后复权, "" 不复权
 */
export async function stock_zh_a_daily(
  symbol: string,
  startDate?: string,
  endDate?: string,
  adjust: 'qfq' | 'hfq' | '' = ''
): Promise<DataFrame> {
  // 解析市场和代码
  const market = symbol.startsWith('sh') ? 'sh' : 'sz';
  const code = symbol.replace(/^(sh|sz)/, '');

  // 构建调整参数
  let adjustParam = '';
  switch (adjust) {
    case 'qfq':
      adjustParam = 'qfq';
      break;
    case 'hfq':
      adjustParam = 'hfq';
      break;
    default:
      adjustParam = '';
  }

  const url = `https://finance.sina.com.cn/realstock/company/${market}${code}/hisdata/klc_kl.js`;
  const params: Record<string, any> = {
    d: 'day',
  };

  if (adjustParam) {
    params.a = adjustParam;
  }

  try {
    const text = await httpGetText(url, { params });

    // 解析 JavaScript 响应
    const dataMatch = text.match(/var\s+\w+\s*=\s*(\[[\s\S]*?\]);/);
    if (!dataMatch) {
      return createDataFrame([], []);
    }

    const data = JSON.parse(dataMatch[1]);

    const columns = ['日期', '开盘', '最高', '最低', '收盘', '成交量'];
    const rows = data.map((item: any) => [
      item.d,      // 日期
      parseFloat(item.o),  // 开盘
      parseFloat(item.h),  // 最高
      parseFloat(item.l),  // 最低
      parseFloat(item.c),  // 收盘
      parseInt(item.v),    // 成交量
    ]);

    let df = createDataFrame(columns, rows);

    // 转换数据类型
    df = convertColumn(df, '日期', 'date');
    for (const col of ['开盘', '最高', '最低', '收盘', '成交量']) {
      df = convertColumn(df, col, 'number');
    }

    // 过滤日期范围
    if (startDate || endDate) {
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      df = {
        ...df,
        data: df.data.filter(row => {
          const date = row[0] as Date;
          if (start && date < start) return false;
          if (end && date > end) return false;
          return true;
        }),
      };
    }

    return df;
  } catch (error) {
    return createDataFrame([], []);
  }
}

/**
 * 获取A股实时行情 - 新浪
 *
 * @param symbols 股票代码列表，如 ["sh000001", "sz000002"]
 */
export async function stock_zh_a_spot_sina(
  symbols: string[]
): Promise<DataFrame> {
  if (symbols.length === 0) {
    return createDataFrame([], []);
  }

  const symbolStr = symbols.join(',');
  const url = `https://hq.sinajs.cn/list=${symbolStr}`;

  try {
    const text = await httpGetText(url, {
      headers: {
        Referer: 'https://finance.sina.com.cn',
      },
    });

    const lines = text.split('\n').filter(line => line.trim());
    const columns = [
      '代码', '名称', '今开', '昨收', '最新价', '最高', '最低',
      '买一', '卖一', '成交量', '成交额', '时间'
    ];

    const rows = lines.map(line => {
      const match = line.match(/var hq_str_(\w+)="(.*)"/);
      if (!match) return null;

      const code = match[1];
      const data = match[2].split(',');

      return [
        code,
        data[0],           // 名称
        parseFloat(data[1]), // 今开
        parseFloat(data[2]), // 昨收
        parseFloat(data[3]), // 最新价
        parseFloat(data[4]), // 最高
        parseFloat(data[5]), // 最低
        parseFloat(data[6]), // 买一
        parseFloat(data[7]), // 卖一
        parseInt(data[8]),   // 成交量
        parseFloat(data[9]), // 成交额
        data[30] + ' ' + data[31], // 时间
      ];
    }).filter(row => row !== null);

    return createDataFrame(columns, rows as any[][]);
  } catch (error) {
    return createDataFrame([], []);
  }
}

/**
 * 获取股票分钟级行情 - 新浪
 *
 * @param symbol 股票代码，如 "sh000001"
 * @param period 周期：1, 5, 15, 30, 60 分钟
 */
export async function stock_zh_a_minute(
  symbol: string,
  period: 1 | 5 | 15 | 30 | 60 = 5
): Promise<DataFrame> {
  const market = symbol.startsWith('sh') ? 'sh' : 'sz';
  const code = symbol.replace(/^(sh|sz)/, '');

  const url = `https://quotes.sina.cn/cn/api/jsonp_v2.php/var%20_sh${code}${period}_1626836858=/CN_MarketDataService.getKLineData`;

  const params = {
    symbol: `${market}${code}`,
    scale: period.toString(),
    ma: 'no',
    datalen: '1000',
  };

  try {
    const text = await httpGetText(url, { params });

    // 解析 JSONP 响应
    const match = text.match(/\((\[.*\])\)/s);
    if (!match) {
      return createDataFrame([], []);
    }

    const data = JSON.parse(match[1]);

    const columns = ['日期', '开盘', '最高', '最低', '收盘', '成交量'];
    const rows = data.map((item: any) => [
      item.day,
      parseFloat(item.open),
      parseFloat(item.high),
      parseFloat(item.low),
      parseFloat(item.close),
      parseInt(item.volume),
    ]);

    return createDataFrame(columns, rows);
  } catch (error) {
    return createDataFrame([], []);
  }
}

/**
 * 获取股票历史分笔数据 - 新浪
 *
 * @param symbol 股票代码，如 "sh000001"
 * @param date 日期，格式 "2024-01-01"
 */
export async function stock_zh_a_tick_sina(
  symbol: string,
  date: string
): Promise<DataFrame> {
  const market = symbol.startsWith('sh') ? 'sh' : 'sz';
  const code = symbol.replace(/^(sh|sz)/, '');
  const dateStr = date.replace(/-/g, '');

  const url = `https://vip.stock.finance.sina.com.cn/quotes_service/api/json_v2.php/CN_Transactions.getAllPageTime`;

  const params = {
    date: dateStr,
    symbol: `${market}${code}`,
  };

  try {
    const text = await httpGetText(url, { params });

    // 解析响应
    const data = JSON.parse(text);

    const columns = ['时间', '价格', '成交量', '类型'];
    const rows = data.map((item: any) => [
      item.ticktime,
      parseFloat(item.price),
      parseInt(item.volume),
      item.type,
    ]);

    return createDataFrame(columns, rows);
  } catch (error) {
    return createDataFrame([], []);
  }
}
