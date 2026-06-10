/**
 * AKShare TypeScript - 新浪财经-期权数据
 * https://stock.finance.sina.com.cn/option/quotes.html
 */

import { httpGet, httpGetText } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 新浪财经-中金所-上证50指数-所有合约
 * @returns 中金所-上证50指数-所有合约
 */
export async function option_cffex_sz50_list_sina(): Promise<Record<string, string[]>> {
  const url = 'https://stock.finance.sina.com.cn/futures/view/optionsCffexDP.php/ho/cffex';
  const text = await httpGetText(url);

  // 简单解析HTML获取合约列表
  const symbolMatch = text.match(/id="option_symbol"[^>]*>([\s\S]*?)<\/ul>/);
  const suffixMatch = text.match(/id="option_suffix"[^>]*>([\s\S]*?)<\/ul>/);

  if (!symbolMatch || !suffixMatch) {
    return {};
  }

  const symbolLiMatch = symbolMatch[1].match(/<li[^>]*>(.*?)<\/li>/);
  const symbol = symbolLiMatch ? symbolLiMatch[1].trim() : '';

  const contracts: string[] = [];
  const liRegex = /<li[^>]*>(.*?)<\/li>/g;
  let match;
  while ((match = liRegex.exec(suffixMatch[1])) !== null) {
    contracts.push(match[1].trim());
  }

  return { [symbol]: contracts };
}

/**
 * 新浪财经-中金所-沪深300指数-所有合约
 * @returns 中金所-沪深300指数-所有合约
 */
export async function option_cffex_hs300_list_sina(): Promise<Record<string, string[]>> {
  const url = 'https://stock.finance.sina.com.cn/futures/view/optionsCffexDP.php';
  const text = await httpGetText(url);

  const symbolMatch = text.match(/id="option_symbol"[^>]*>([\s\S]*?)<\/ul>/);
  const suffixMatch = text.match(/id="option_suffix"[^>]*>([\s\S]*?)<\/ul>/);

  if (!symbolMatch || !suffixMatch) {
    return {};
  }

  const liMatches = symbolMatch[1].match(/<li[^>]*>(.*?)<\/li>/g);
  const symbol = liMatches && liMatches[1] ? liMatches[1].replace(/<[^>]+>/g, '').trim() : '';

  const contracts: string[] = [];
  const liRegex = /<li[^>]*>(.*?)<\/li>/g;
  let match;
  while ((match = liRegex.exec(suffixMatch[1])) !== null) {
    contracts.push(match[1].trim());
  }

  return { [symbol]: contracts };
}

/**
 * 新浪财经-中金所-中证1000指数-所有合约
 * @returns 中金所-中证1000指数-所有合约
 */
export async function option_cffex_zz1000_list_sina(): Promise<Record<string, string[]>> {
  const url = 'https://stock.finance.sina.com.cn/futures/view/optionsCffexDP.php/mo/cffex';
  const text = await httpGetText(url);

  const symbolMatch = text.match(/id="option_symbol"[^>]*>([\s\S]*?)<\/ul>/);
  const suffixMatch = text.match(/id="option_suffix"[^>]*>([\s\S]*?)<\/ul>/);

  if (!symbolMatch || !suffixMatch) {
    return {};
  }

  const liMatches = symbolMatch[1].match(/<li[^>]*>(.*?)<\/li>/g);
  const symbol = liMatches && liMatches[2] ? liMatches[2].replace(/<[^>]+>/g, '').trim() : '';

  const contracts: string[] = [];
  const liRegex = /<li[^>]*>(.*?)<\/li>/g;
  let match;
  while ((match = liRegex.exec(suffixMatch[1])) !== null) {
    contracts.push(match[1].trim());
  }

  return { [symbol]: contracts };
}

/**
 * 中金所-上证50指数-指定合约-实时行情
 * @param symbol 合约代码，如 "ho2303"
 * @returns 看涨看跌实时行情
 */
export async function option_cffex_sz50_spot_sina(symbol: string = 'ho2303'): Promise<DataFrame> {
  return fetchCffexSpotData('ho', 'cffex', symbol);
}

/**
 * 中金所-沪深300指数-指定合约-实时行情
 * @param symbol 合约代码，如 "io2204"
 * @returns 看涨看跌实时行情
 */
export async function option_cffex_hs300_spot_sina(symbol: string = 'io2204'): Promise<DataFrame> {
  return fetchCffexSpotData('io', 'cffex', symbol);
}

/**
 * 中金所-中证1000指数-指定合约-实时行情
 * @param symbol 合约代码，如 "mo2208"
 * @returns 看涨看跌实时行情
 */
export async function option_cffex_zz1000_spot_sina(symbol: string = 'mo2208'): Promise<DataFrame> {
  return fetchCffexSpotData('mo', 'cffex', symbol);
}

/**
 * 获取中金所期权实时行情的通用函数
 */
async function fetchCffexSpotData(
  product: string,
  exchange: string,
  pinzhong: string
): Promise<DataFrame> {
  const url = 'https://stock.finance.sina.com.cn/futures/api/openapi.php/OptionService.getOptionData';
  const params = {
    type: 'futures',
    product,
    exchange,
    pinzhong,
  };

  try {
    const data = await httpGet<any>(url, { params });

    if (!data?.result?.data) {
      return createDataFrame([], []);
    }

    const upData = data.result.data.up || [];
    const downData = data.result.data.down || [];

    const callColumns = [
      '看涨合约-买量', '看涨合约-买价', '看涨合约-最新价', '看涨合约-卖价',
      '看涨合约-卖量', '看涨合约-持仓量', '看涨合约-涨跌', '行权价', '看涨合约-标识'
    ];

    const putColumns = [
      '看跌合约-买量', '看跌合约-买价', '看跌合约-最新价', '看跌合约-卖价',
      '看跌合约-卖量', '看跌合约-持仓量', '看跌合约-涨跌', '看跌合约-标识'
    ];

    const columns = [...callColumns, ...putColumns];

    const rows: any[][] = [];
    const maxLen = Math.max(upData.length, downData.length);

    for (let i = 0; i < maxLen; i++) {
      const upRow = upData[i] || [];
      const downRow = downData[i] || [];

      rows.push([
        parseFloat(upRow[0]) || null,
        parseFloat(upRow[1]) || null,
        parseFloat(upRow[2]) || null,
        parseFloat(upRow[3]) || null,
        parseFloat(upRow[4]) || null,
        parseFloat(upRow[5]) || null,
        parseFloat(upRow[6]) || null,
        parseFloat(upRow[7]) || null,
        upRow[8] || null,
        parseFloat(downRow[0]) || null,
        parseFloat(downRow[1]) || null,
        parseFloat(downRow[2]) || null,
        parseFloat(downRow[3]) || null,
        parseFloat(downRow[4]) || null,
        parseFloat(downRow[5]) || null,
        parseFloat(downRow[6]) || null,
        downRow[7] || null,
      ]);
    }

    return createDataFrame(columns, rows);
  } catch {
    return createDataFrame([], []);
  }
}

/**
 * 获取新浪期权日频行情数据的通用函数
 */
async function fetchCffexDailyData(symbol: string): Promise<DataFrame> {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();

  const url = `https://stock.finance.sina.com.cn/futures/api/jsonp.php/var%20_${symbol}${year}_${month}_${day}=/FutureOptionAllService.getOptionDayline`;
  const params = { symbol };

  try {
    const text = await httpGetText(url, { params });
    const jsonStr = text.substring(text.indexOf('['), text.lastIndexOf(']') + 1);
    const data = JSON.parse(jsonStr);

    if (!data || data.length === 0) {
      return createDataFrame([], []);
    }

    const columns = ['date', 'open', 'high', 'low', 'close', 'volume'];
    const rows = data.map((item: any[]) => [
      item[5],
      parseFloat(item[0]) || null,
      parseFloat(item[1]) || null,
      parseFloat(item[2]) || null,
      parseFloat(item[3]) || null,
      parseInt(item[4]) || null,
    ]);

    return createDataFrame(columns, rows);
  } catch {
    return createDataFrame([], []);
  }
}

/**
 * 新浪财经-中金所-上证50指数-指定合约-日频行情
 * @param symbol 具体合约代码(包括看涨和看跌标识)
 * @returns 日频率数据
 */
export async function option_cffex_sz50_daily_sina(symbol: string = 'ho2303P2350'): Promise<DataFrame> {
  return fetchCffexDailyData(symbol);
}

/**
 * 新浪财经-中金所-沪深300指数-指定合约-日频行情
 * @param symbol 具体合约代码(包括看涨和看跌标识)
 * @returns 日频率数据
 */
export async function option_cffex_hs300_daily_sina(symbol: string = 'io2202P4350'): Promise<DataFrame> {
  return fetchCffexDailyData(symbol);
}

/**
 * 新浪财经-中金所-中证1000指数-指定合约-日频行情
 * @param symbol 具体合约代码(包括看涨和看跌标识)
 * @returns 日频率数据
 */
export async function option_cffex_zz1000_daily_sina(symbol: string = 'mo2208P6200'): Promise<DataFrame> {
  return fetchCffexDailyData(symbol);
}

/**
 * 新浪财经-期权-上交所-50ETF-合约到期月份列表
 * @param symbol 50ETF or 300ETF
 * @returns 合约到期时间列表
 */
export async function option_sse_list_sina(
  symbol: string = '50ETF',
  exchange: string = 'null'
): Promise<string[]> {
  const url = 'https://stock.finance.sina.com.cn/futures/api/openapi.php/StockOptionService.getStockName';
  const params = { exchange, cate: symbol };

  try {
    const data = await httpGet<any>(url, { params });
    const dateList = data?.result?.data?.contractMonth || [];
    return dateList.map((item: string) => item.replace('-', '')).slice(1);
  } catch {
    return [];
  }
}

/**
 * 指定到期月份指定品种的剩余到期时间
 * @param trade_date 到期月份，如 "202102"
 * @param symbol 50ETF or 300ETF
 * @returns [到期时间, 剩余天数]
 */
export async function option_sse_expire_day_sina(
  trade_date: string = '202102',
  symbol: string = '50ETF',
  exchange: string = 'null'
): Promise<[string, number]> {
  const url = 'https://stock.finance.sina.com.cn/futures/api/openapi.php/StockOptionService.getRemainderDay';
  const params = {
    exchange,
    cate: symbol,
    date: `${trade_date.slice(0, 4)}-${trade_date.slice(4)}`,
  };

  try {
    const data = await httpGet<any>(url, { params });
    const result = data?.result?.data;

    if (result && parseInt(result.remainderDays) >= 0) {
      return [result.expireDay, parseInt(result.remainderDays)];
    }

    // 尝试XD前缀
    const xdParams = {
      ...params,
      cate: `XD${symbol}`,
    };
    const xdData = await httpGet<any>(url, { params: xdParams });
    const xdResult = xdData?.result?.data;

    return [xdResult?.expireDay || '', parseInt(xdResult?.remainderDays || '0')];
  } catch {
    return ['', 0];
  }
}

/**
 * 上海证券交易所-所有看涨和看跌合约的代码
 * @param symbol 看涨期权 or 看跌期权
 * @param trade_date 期权到期月份
 * @param underlying 标的产品代码
 * @returns 合约代码列表
 */
export async function option_sse_codes_sina(
  symbol: string = '看涨期权',
  trade_date: string = '202202',
  underlying: string = '510050'
): Promise<DataFrame> {
  const prefix = symbol === '看涨期权' ? 'OP_UP' : 'OP_DOWN';
  const suffix = trade_date.slice(-4);
  const url = `https://hq.sinajs.cn/list=${prefix}_${underlying}${suffix}`;

  try {
    const text = await httpGetText(url, {
      headers: {
        'Referer': 'https://stock.finance.sina.com.cn/',
      },
    });

    const dataStr = text.replace(/"/g, ',');
    const parts = dataStr.split(',');
    const codes = parts
      .filter(p => p.startsWith('CON_OP_'))
      .map(p => p.substring(7));

    const columns = ['序号', '期权代码'];
    const rows = codes.map((code, index) => [index + 1, code]);

    return createDataFrame(columns, rows);
  } catch {
    return createDataFrame([], []);
  }
}

/**
 * 新浪财经-期权-期权实时数据
 * @param symbol 期权代码
 * @returns 期权量价数据
 */
export async function option_sse_spot_price_sina(symbol: string = '10003720'): Promise<DataFrame> {
  const url = `https://hq.sinajs.cn/list=CON_OP_${symbol}`;

  try {
    const text = await httpGetText(url, {
      headers: {
        'Referer': 'https://stock.finance.sina.com.cn/',
      },
    });

    const dataStr = text.substring(text.indexOf('"') + 1, text.lastIndexOf('"'));
    const dataParts = dataStr.split(',');

    const fieldList = [
      '买量', '买价', '最新价', '卖价', '卖量', '持仓量', '涨幅', '行权价',
      '昨收价', '开盘价', '涨停价', '跌停价', '申卖价五', '申卖量五',
      '申卖价四', '申卖量四', '申卖价三', '申卖量三', '申卖价二', '申卖量二',
      '申卖价一', '申卖量一', '申买价一', '申买量一', '申买价二', '申买量二',
      '申买价三', '申买量三', '申买价四', '申买量四', '申买价五', '申买量五',
      '行情时间', '主力合约标识', '状态码', '标的证券类型', '标的股票',
      '期权合约简称', '振幅', '最高价', '最低价', '成交量', '成交额',
    ];

    const columns = ['字段', '值'];
    const rows = fieldList.map((field, index) => [field, dataParts[index] || '']);

    return createDataFrame(columns, rows);
  } catch {
    return createDataFrame([], []);
  }
}

/**
 * 期权标的物的实时数据
 * @param symbol sh510050 or sh510300
 * @returns 期权标的物的信息
 */
export async function option_sse_underlying_spot_price_sina(
  symbol: string = 'sh510300'
): Promise<DataFrame> {
  const url = `https://hq.sinajs.cn/list=${symbol}`;

  try {
    const text = await httpGetText(url, {
      headers: {
        'Referer': 'https://vip.stock.finance.sina.com.cn/',
      },
    });

    const dataStr = text.substring(text.indexOf('"') + 1, text.lastIndexOf('"'));
    const dataParts = dataStr.split(',');

    const fieldList = [
      '证券简称', '今日开盘价', '昨日收盘价', '最近成交价', '最高成交价',
      '最低成交价', '买入价', '卖出价', '成交数量', '成交金额',
      '买数量一', '买价位一', '买数量二', '买价位二', '买数量三', '买价位三',
      '买数量四', '买价位四', '买数量五', '买价位五', '卖数量一', '卖价位一',
      '卖数量二', '卖价位二', '卖数量三', '卖价位三', '卖数量四', '卖价位四',
      '卖数量五', '卖价位五', '行情日期', '行情时间', '停牌状态',
    ];

    const columns = ['字段', '值'];
    const rows = fieldList.map((field, index) => [field, dataParts[index] || '']);

    return createDataFrame(columns, rows);
  } catch {
    return createDataFrame([], []);
  }
}

/**
 * 期权基本信息表(Greeks)
 * @param symbol 合约代码
 * @returns 期权基本信息表
 */
export async function option_sse_greeks_sina(symbol: string = '10003045'): Promise<DataFrame> {
  const url = `https://hq.sinajs.cn/list=CON_SO_${symbol}`;

  try {
    const text = await httpGetText(url, {
      headers: {
        'Referer': 'https://vip.stock.finance.sina.com.cn/',
      },
    });

    const dataStr = text.substring(text.indexOf('"') + 1, text.lastIndexOf('"'));
    const dataParts = dataStr.split(',');

    const fieldList = [
      '期权合约简称', '成交量', 'Delta', 'Gamma', 'Theta', 'Vega',
      '隐含波动率', '最高价', '最低价', '交易代码', '行权价', '最新价', '理论价值',
    ];

    const values = [dataParts[0], ...dataParts.slice(4)];

    const columns = ['字段', '值'];
    const rows = fieldList.map((field, index) => [field, values[index] || '']);

    return createDataFrame(columns, rows);
  } catch {
    return createDataFrame([], []);
  }
}

/**
 * 指定期权品种在当前交易日的分钟数据
 * @param symbol 期权代码
 * @returns 当前交易日的分钟数据
 */
export async function option_sse_minute_sina(symbol: string = '10003720'): Promise<DataFrame> {
  const url = 'https://stock.finance.sina.com.cn/futures/api/openapi.php/StockOptionDaylineService.getOptionMinline';
  const params = { symbol: `CON_OP_${symbol}` };
  const columns = ['日期', '时间', '价格', '成交', '持仓', '均价'];

  try {
    const data = await httpGet<any>(url, { params });
    const tempData = data?.result?.data;

    if (!tempData || tempData.length === 0) {
      return createDataFrame(columns, []);
    }

    const rows: any[][] = [];
    let lastDate = '';

    for (const item of tempData) {
      const date = item[5] || lastDate;
      if (item[5]) lastDate = item[5];

      rows.push([
        date,
        item[0],
        item[1] || '',
        item[2] || '',
        item[3] || '',
        item[4] || '',
      ]);
    }

    return createDataFrame(columns, rows);
  } catch {
    return createDataFrame(columns, []);
  }
}

/**
 * 指定期权的日频率数据
 * @param symbol 期权代码
 * @returns 所有日频率历史数据
 */
export async function option_sse_daily_sina(symbol: string = '10003889'): Promise<DataFrame> {
  const url = 'https://stock.finance.sina.com.cn/futures/api/jsonp_v2.php//StockOptionDaylineService.getSymbolInfo';
  const params = { symbol: `CON_OP_${symbol}` };

  try {
    const text = await httpGetText(url, { params });
    const jsonStr = text.substring(text.indexOf('(') + 1, text.lastIndexOf(')'));
    const data = JSON.parse(jsonStr);

    if (!data || data.length === 0) {
      return createDataFrame([], []);
    }

    const columns = ['日期', '开盘', '最高', '最低', '收盘', '成交量'];
    const rows = data.map((item: any[]) => [
      item[0],
      parseFloat(item[1]) || null,
      parseFloat(item[2]) || null,
      parseFloat(item[3]) || null,
      parseFloat(item[4]) || null,
      parseInt(item[5]) || null,
    ]);

    return createDataFrame(columns, rows);
  } catch {
    return createDataFrame([], []);
  }
}

/**
 * 指定期权的分钟频率数据(五日)
 * @param symbol 期权代码
 * @returns 分钟频率数据
 */
export async function option_finance_minute_sina(symbol: string = '10002530'): Promise<DataFrame> {
  const url = 'https://stock.finance.sina.com.cn/futures/api/openapi.php/StockOptionDaylineService.getFiveDayLine';
  const params = { symbol: `CON_OP_${symbol}` };

  try {
    const data = await httpGet<any>(url, { params });
    const allData = data?.result?.data;

    if (!allData || allData.length === 0) {
      return createDataFrame([], []);
    }

    const columns = ['date', 'time', 'price', 'average_price', 'volume'];
    const rows: any[][] = [];
    let lastDate = '';

    for (const dayData of allData) {
      if (!dayData) continue;

      for (const item of dayData) {
        if (!item) continue;

        const date = item[5] || lastDate;
        if (item[5]) lastDate = item[5];

        rows.push([
          date,
          item[0],
          parseFloat(item[1]) || null,
          parseFloat(item[4]) || null,
          parseInt(item[2]) || null,
        ]);
      }
    }

    return createDataFrame(columns, rows);
  } catch {
    return createDataFrame([], []);
  }
}
