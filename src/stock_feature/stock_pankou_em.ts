/**
 * AKShare TypeScript - 东方财富-行情中心-盘口异动
 * https://quote.eastmoney.com/changes/
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 东方财富-行情中心-盘口异动
 * https://quote.eastmoney.com/changes/
 * @param symbol 选择 {"火箭发射", "快速反弹", "大笔买入", "封涨停板", "打开跌停板", "有大买盘", "竞价上涨", "高开5日线", "向上缺口", "60日新高", "60日大幅上涨", "加速下跌", "高台跳水", "大笔卖出", "封跌停板", "打开涨停板", "有大卖盘", "竞价下跌", "低开5日线", "向下缺口", "60日新低", "60日大幅下跌"}
 * @returns 盘口异动数据
 */
export async function stock_changes_em(symbol: string = '大笔买入'): Promise<DataFrame> {
  const symbolMap: Record<string, string> = {
    '火箭发射': '8201',
    '快速反弹': '8202',
    '大笔买入': '8193',
    '封涨停板': '4',
    '打开跌停板': '32',
    '有大买盘': '64',
    '竞价上涨': '8207',
    '高开5日线': '8209',
    '向上缺口': '8211',
    '60日新高': '8213',
    '60日大幅上涨': '8215',
    '加速下跌': '8204',
    '高台跳水': '8203',
    '大笔卖出': '8194',
    '封跌停板': '8',
    '打开涨停板': '16',
    '有大卖盘': '128',
    '竞价下跌': '8208',
    '低开5日线': '8210',
    '向下缺口': '8212',
    '60日新低': '8214',
    '60日大幅下跌': '8216',
  };

  const url = 'https://push2ex.eastmoney.com/getAllStockChanges';
  const params = {
    type: symbolMap[symbol],
    pageindex: '0',
    pagesize: '5000',
    ut: '7eea3edcaed734bea9cbfc24409ed989',
    dpt: 'wzchanges',
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.data?.allstock || data.data.allstock.length === 0) {
    return createDataFrame([], []);
  }

  const reversedMap: Record<string, string> = {};
  for (const [key, value] of Object.entries(symbolMap)) {
    reversedMap[value] = key;
  }

  const columns = ['时间', '代码', '名称', '板块', '相关信息'];
  const rows = data.data.allstock.map((item: any) => {
    const timeStr = String(item.tm).padStart(6, '0');
    const formattedTime = `${timeStr.slice(0, 2)}:${timeStr.slice(2, 4)}:${timeStr.slice(4, 6)}`;
    return [
      formattedTime,
      item.c,
      item.n,
      reversedMap[String(item.m)] || String(item.m),
      item.s,
    ];
  });

  return createDataFrame(columns, rows);
}

/**
 * 东方财富-行情中心-当日板块异动详情
 * https://quote.eastmoney.com/changes/
 * @returns 当日板块异动详情数据
 */
export async function stock_board_change_em(): Promise<DataFrame> {
  const url = 'https://push2ex.eastmoney.com/getAllBKChanges';
  const params = {
    ut: '7eea3edcaed734bea9cbfc24409ed989',
    dpt: 'wzchanges',
    pageindex: '0',
    pagesize: '5000',
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.data?.allbk || data.data.allbk.length === 0) {
    return createDataFrame([], []);
  }

  const directionMap: Record<number, string> = {
    0: '大笔买入',
    1: '大笔卖出',
  };

  const columns = [
    '板块名称', '涨跌幅', '主力净流入', '板块异动总次数',
    '板块异动最频繁个股及所属类型-股票代码',
    '板块异动最频繁个股及所属类型-股票名称',
    '板块异动最频繁个股及所属类型-买卖方向',
    '板块具体异动类型列表及出现次数',
  ];

  const rows = data.data.allbk.map((item: any) => [
    item.n,
    String(item.u ?? ''),
    String(item.zjl ?? ''),
    String(item.ct ?? ''),
    String(item.ms?.c ?? ''),
    String(item.ms?.n ?? ''),
    directionMap[item.ms?.m] ?? String(item.ms?.m ?? ''),
    item.ydl ? JSON.stringify(item.ydl) : '',
  ]);

  return createDataFrame(columns, rows);
}
