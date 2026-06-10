/**
 * AKShare TypeScript - 期货数据接口
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 获取期货实时行情 - 东方财富
 *
 * @param market 市场：上海期货交易所, 大连商品交易所, 郑州商品交易所, 中国金融期货交易所, 上海国际能源交易中心, 广州期货交易所
 */
export async function futures_zh_spot(
  market: '上海期货交易所' | '大连商品交易所' | '郑州商品交易所' | '中国金融期货交易所' | '上海国际能源交易中心' | '广州期货交易所' = '上海期货交易所'
): Promise<DataFrame> {
  const marketMap: Record<string, string> = {
    '上海期货交易所': 'm:113,m:114,m:115',
    '大连商品交易所': 'm:113,m:114,m:115',
    '郑州商品交易所': 'm:113,m:114,m:115',
    '中国金融期货交易所': 'm:8',
    '上海国际能源交易中心': 'm:142',
    '广州期货交易所': 'm:155',
  };

  const url = 'https://79.push2.eastmoney.com/api/qt/clist/get';
  const params = {
    pn: '1',
    pz: '1000',
    po: '1',
    np: '1',
    ut: 'bd1d9ddb04089700cf9c27f6f7426281',
    fltt: '2',
    invt: '2',
    fid: 'f3',
    fs: marketMap[market],
    fields: 'f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f12,f13,f14,f15,f16,f17,f18,f20,f21,f23,f24,f25,f22,f11,f62,f128,f136,f115,f152',
    _: Date.now(),
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.data?.diff) {
    return createDataFrame([], []);
  }

  const columns = [
    '合约代码', '合约名称', '最新价', '涨跌幅', '涨跌额', '成交量', '成交额',
    '持仓量', '振幅', '开盘', '最高', '最低', '昨收', '结算'
  ];

  const rows = data.data.diff.map((item: any) => [
    item.f12,  // 合约代码
    item.f14,  // 合约名称
    item.f2,   // 最新价
    item.f3,   // 涨跌幅
    item.f4,   // 涨跌额
    item.f5,   // 成交量
    item.f6,   // 成交额
    item.f8,   // 持仓量
    item.f7,   // 振幅
    item.f17,  // 开盘
    item.f15,  // 最高
    item.f16,  // 最低
    item.f18,  // 昨收
    item.f21,  // 结算
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 获取期货历史行情 - 东方财富
 *
 * @param symbol 合约代码，如 "au2406"
 * @param period 周期：daily, weekly, monthly
 * @param startDate 开始日期
 * @param endDate 结束日期
 */
export async function futures_zh_daily_sina(
  symbol: string = 'RB0',
  period: 'daily' | 'weekly' | 'monthly' = 'daily',
  startDate?: string,
  endDate?: string
): Promise<DataFrame> {
  const date = '20210412';
  const url =
    'https://stock2.finance.sina.com.cn/futures/api/jsonp.php/var%20_V21052021_4_12=/InnerFuturesNewService.getDailyKLine';

  const text = await httpGet<any>(url, {
    params: {
      symbol,
      type: `${date.slice(0, 4)}_${date.slice(4, 6)}_${date.slice(6, 8)}`,
    },
    responseType: 'text' as any,
  });

  const rawText = typeof text === 'string' ? text : String(text ?? '');
  const jsonText = rawText.split('=(')[1]?.split(');')[0];
  if (!jsonText) {
    return createDataFrame([], []);
  }

  const data = JSON.parse(jsonText);
  if (!Array.isArray(data)) {
    return createDataFrame([], []);
  }

  const columns = ['date', 'open', 'high', 'low', 'close', 'volume', 'hold', 'settle'];
  const toNum = (v: any): number | null => {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  const rows = data.map((item: any[]) => [
    item[0],
    toNum(item[1]),
    toNum(item[2]),
    toNum(item[3]),
    toNum(item[4]),
    toNum(item[5]),
    toNum(item[6]),
    toNum(item[7]),
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 获取期货分钟级行情 - 东方财富
 *
 * @param symbol 合约代码
 * @param period 周期：1, 5, 15, 30, 60 分钟
 */
export async function futures_zh_minute_sina(
  symbol: string = 'IF2008',
  period: 1 | 5 | 15 | 30 | 60 = 1
): Promise<DataFrame> {
  const text = await httpGet<any>(
    'https://stock2.finance.sina.com.cn/futures/api/jsonp.php/=/InnerFuturesNewService.getFewMinLine',
    {
      params: {
        symbol,
        type: String(period),
      },
      responseType: 'text' as any,
    }
  );

  const rawText = typeof text === 'string' ? text : String(text ?? '');
  const jsonText = rawText.split('=(')[1]?.split(');')[0];
  if (!jsonText) {
    return createDataFrame([], []);
  }

  const data = JSON.parse(jsonText);
  if (!Array.isArray(data)) {
    return createDataFrame([], []);
  }

  const columns = ['datetime', 'open', 'high', 'low', 'close', 'volume', 'hold'];
  const toNum = (v: any): number | null => {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  const rows = data.map((item: any[]) => [
    item[0],
    toNum(item[1]),
    toNum(item[2]),
    toNum(item[3]),
    toNum(item[4]),
    toNum(item[5]),
    toNum(item[6]),
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 获取期货持仓排名 - 东方财富
 *
 * @param date 日期，格式 "20240101"
 * @param exchange 交易所：SHFE 上期所, DCE 大商所, CZCE 郑商所, CFFEX 中金所
 */
export async function futures_dce_position_rank(
  date: string,
  exchange: 'SHFE' | 'DCE' | 'CZCE' | 'CFFEX' = 'DCE'
): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    reportName: 'RPT_FUTU_POSITION',
    columns: 'ALL',
    filter: `(TRADE_DATE='${date}')(EXCHANGE='${exchange}')`,
    pageNumber: '1',
    pageSize: '5000',
    sortTypes: '-1',
    sortColumns: 'LONG_POSITION',
    source: 'WEB',
    client: 'WEB',
    _: Date.now(),
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.result?.data) {
    return createDataFrame([], []);
  }

  const columns = [
    '日期', '合约', '会员简称', '多头持仓', '多头增减',
    '空头持仓', '空头增减', '交易所'
  ];

  const rows = data.result.data.map((item: any) => [
    item.TRADE_DATE,
    item.SYMBOL,
    item.BROKER_NAME,
    item.LONG_POSITION,
    item.LONG_CHANGE,
    item.SHORT_POSITION,
    item.SHORT_CHANGE,
    item.EXCHANGE,
  ]);

  return createDataFrame(columns, rows);
}
