/**
 * AKShare TypeScript - 新浪财经-期货的主力合约数据
 * https://finance.sina.com.cn/futuremarket/index.shtml
 */

import { httpGet } from '../utils/httpClient';
import { createDataFrame, DataFrame } from '../utils/dataframe';
import {
  zhSubscribeExchangeSymbolUrl,
  zhMatchMainContractUrl,
  zhMatchMainContractPayload,
} from './cons';

/**
 * 解析新浪期货 JavaScript 返回的 JSON 数据
 */
function parseSinaJsData(text: string): Record<string, string[]> {
  const jsonStr = text.substring(text.indexOf('{'), text.indexOf('};') + 1);
  return JSON.parse(jsonStr);
}

/**
 * 订阅指定交易所品种的代码
 * https://finance.sina.com.cn/futuremarket/index.shtml
 *
 * @param symbol 交易所代码，choice of {"dce", "czce", "shfe", "cffex", "gfex"}
 */
export async function zh_subscribe_exchange_symbol(
  symbol: 'dce' | 'czce' | 'shfe' | 'cffex' | 'gfex' = 'dce'
): Promise<DataFrame> {
  const text = await httpGet<string>(zhSubscribeExchangeSymbolUrl, {
    headers: {
      'Accept-Encoding': 'gzip, deflate',
      Host: 'vip.stock.finance.sina.com.cn',
      Referer: 'https://finance.sina.com.cn/futuremarket/',
    },
    responseType: 'text' as any,
  });

  const dataJson = parseSinaJsData(text);
  let symbolList = dataJson[symbol] || [];

  // 移除交易所全称条目
  const exchangeNames: Record<string, string> = {
    czce: '郑州商品交易所',
    dce: '大连商品交易所',
    shfe: '上海期货交易所',
    cffex: '中国金融期货交易所',
    gfex: '广州期货交易所',
  };

  if (exchangeNames[symbol]) {
    symbolList = symbolList.filter((item: string) => item !== exchangeNames[symbol]);
  }

  const columns = ['品种代码'];
  const rows = symbolList.map((item: string) => [item]);
  return createDataFrame(columns, rows);
}

/**
 * 指定交易所的所有可以提供数据的主力连续合约
 * https://finance.sina.com.cn/futuremarket/index.shtml
 *
 * @param symbol 交易所代码，choice of {"dce", "czce", "shfe", "cffex", "gfex"}
 */
export async function match_main_contract(
  symbol: 'dce' | 'czce' | 'shfe' | 'cffex' | 'gfex' = 'shfe'
): Promise<DataFrame> {
  const exchangeDf = await zh_subscribe_exchange_symbol(symbol);
  const subscribeList: any[] = [];

  for (const row of exchangeDf.data) {
    const node = row[0];
    try {
      const params = { ...zhMatchMainContractPayload, node };
      const res = await httpGet<any[]>(zhMatchMainContractUrl, { params });

      if (!Array.isArray(res) || res.length === 0) continue;

      // 查找主力连续合约: name 包含"连续"且 symbol 的倒数第二位是 0
      const mainContract = res.find((item: any) => {
        const nameMatch = item.name && item.name.includes('连续');
        const symbolMatch = item.symbol && /0\d$/.test(item.symbol);
        return nameMatch && symbolMatch;
      });

      if (mainContract) {
        subscribeList.push([mainContract.symbol, mainContract.name, mainContract.trade]);
      }
    } catch {
      // 某些品种可能没有主力连续合约，跳过
      continue;
    }
  }

  const columns = ['symbol', 'name', 'trade'];
  return createDataFrame(columns, subscribeList);
}

/**
 * 新浪主力连续合约品种一览表
 * https://finance.sina.com.cn/futuremarket/index.shtml
 */
export async function futures_display_main_sina(): Promise<DataFrame> {
  const allRows: any[][] = [];

  for (const exchange of ['dce', 'czce', 'shfe', 'cffex', 'gfex'] as const) {
    try {
      const df = await match_main_contract(exchange);
      allRows.push(...df.data);
    } catch {
      continue;
    }
  }

  const columns = ['symbol', 'name', 'trade'];
  return createDataFrame(columns, allRows);
}

/**
 * 新浪财经-期货-主力连续日数据
 * https://vip.stock.finance.sina.com.cn/quotes_service/view/qihuohangqing.html
 *
 * @param symbol 通过 futures_display_main_sina() 函数获取 symbol，如 "V0", "CF0"
 * @param startDate 开始日期，格式 "YYYYMMDD"
 * @param endDate 结束日期，格式 "YYYYMMDD"
 */
export async function futures_main_sina(
  symbol: string = 'V0',
  startDate: string = '19900101',
  endDate: string = '22220101'
): Promise<DataFrame> {
  const tradeDate = '20210817';
  const formattedDate = `${tradeDate.slice(0, 4)}_${tradeDate.slice(4, 6)}_${tradeDate.slice(6)}`;

  const url = `https://stock2.finance.sina.com.cn/futures/api/jsonp.php/var%20_${symbol}${formattedDate}=/InnerFuturesNewService.getDailyKLine?symbol=${symbol}&_=${formattedDate}`;

  const text = await httpGet<string>(url, {
    responseType: 'text' as any,
  });

  // 解析 JSONP 响应: 提取 ([ ... ]) 部分
  const jsonStr = text.substring(text.indexOf('([') + 1, text.lastIndexOf('])') + 1);
  const jsonData = JSON.parse(jsonStr);

  const columns = [
    '日期', '开盘价', '最高价', '最低价', '收盘价', '成交量', '持仓量', '动态结算价',
  ];

  const start = startDate.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3');
  const end = endDate.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3');

  const rows = jsonData
    .filter((item: any) => {
      const date = item.d || item[0];
      return date >= start && date <= end;
    })
    .map((item: any) => {
      if (Array.isArray(item)) {
        return [
          item[0],
          parseFloat(item[1]) || 0,
          parseFloat(item[2]) || 0,
          parseFloat(item[3]) || 0,
          parseFloat(item[4]) || 0,
          parseInt(item[5]) || 0,
          parseInt(item[6]) || 0,
          parseFloat(item[7]) || 0,
        ];
      }
      return [
        item.d,
        parseFloat(item.open) || 0,
        parseFloat(item.high) || 0,
        parseFloat(item.low) || 0,
        parseFloat(item.close) || 0,
        parseInt(item.volume) || 0,
        parseInt(item.hold) || 0,
        parseFloat(item.settlement) || 0,
      ];
    });

  return createDataFrame(columns, rows);
}
