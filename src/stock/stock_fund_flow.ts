/**
 * AKShare TypeScript - 东方财富资金流向数据接口
 * https://data.eastmoney.com/zjlx/detail.html
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
  convertColumn,
} from '../utils/dataframe';

/**
 * 东方财富-数据中心-资金流向-个股
 *
 * @param stock 股票代码，如 "600094"
 * @param market 市场：sh 上海, sz 深圳, bj 北京
 */
export async function stock_individual_fund_flow(
  stock: string = '600094',
  market: 'sh' | 'sz' | 'bj' = 'sh'
): Promise<DataFrame> {
  const marketMap: Record<string, number> = { sh: 1, sz: 0, bj: 0 };
  const url = 'https://push2his.eastmoney.com/api/qt/stock/fflow/daykline/get';
  const params = {
    lmt: '0',
    klt: '101',
    secid: `${marketMap[market]}.${stock}`,
    fields1: 'f1,f2,f3,f7',
    fields2: 'f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61,f62,f63,f64,f65',
    ut: 'b2884a393a59ad64002292a3e90d46a5',
    _: Date.now().toString(),
  };

  const data = await httpGet<any>(url, { params });
  if (!data?.data?.klines) {
    return createDataFrame([], []);
  }

  const rawColumns = [
    '日期', '主力净流入-净额', '小单净流入-净额', '中单净流入-净额',
    '大单净流入-净额', '超大单净流入-净额', '主力净流入-净占比',
    '小单净流入-净占比', '中单净流入-净占比', '大单净流入-净占比',
    '超大单净流入-净占比', '收盘价', '涨跌幅', '-', '-',
  ];

  const selectedColumns = [
    '日期', '收盘价', '涨跌幅', '主力净流入-净额', '主力净流入-净占比',
    '超大单净流入-净额', '超大单净流入-净占比', '大单净流入-净额', '大单净流入-净占比',
    '中单净流入-净额', '中单净流入-净占比', '小单净流入-净额', '小单净流入-净占比',
  ];

  const rows = data.data.klines.map((item: string) => {
    const parts = item.split(',');
    const fullRow: Record<string, any> = {};
    rawColumns.forEach((col, i) => {
      if (col !== '-') fullRow[col] = parts[i];
    });
    return selectedColumns.map(col => {
      const val = fullRow[col];
      if (col === '日期') return val;
      return val !== undefined ? parseFloat(val) : NaN;
    });
  });

  return createDataFrame(selectedColumns, rows);
}

/**
 * 东方财富-数据中心-资金流向-排名
 *
 * @param indicator 指标周期：今日, 3日, 5日, 10日
 */
export async function stock_individual_fund_flow_rank(
  indicator: '今日' | '3日' | '5日' | '10日' = '今日'
): Promise<DataFrame> {
  const indicatorMap: Record<string, [string, string]> = {
    '今日': ['f62', 'f12,f14,f2,f3,f62,f184,f66,f69,f72,f75,f78,f81,f84,f87,f204,f205,f124'],
    '3日': ['f267', 'f12,f14,f2,f127,f267,f268,f269,f270,f271,f272,f273,f274,f275,f276,f257,f258,f124'],
    '5日': ['f164', 'f12,f14,f2,f109,f164,f165,f166,f167,f168,f169,f170,f171,f172,f173,f257,f258,f124'],
    '10日': ['f174', 'f12,f14,f2,f160,f174,f175,f176,f177,f178,f179,f180,f181,f182,f183,f260,f261,f124'],
  };

  const url = 'https://push2.eastmoney.com/api/qt/clist/get';
  const params = {
    fid: indicatorMap[indicator][0],
    po: '1',
    pz: '10000',
    pn: '1',
    np: '1',
    fltt: '2',
    invt: '2',
    ut: 'b2884a393a59ad64002292a3e90d46a5',
    fs: 'm:0+t:6+f:!2,m:0+t:13+f:!2,m:0+t:80+f:!2,m:1+t:2+f:!2,m:1+t:23+f:!2,m:0+t:7+f:!2,m:1+t:3+f:!2',
    fields: indicatorMap[indicator][1],
  };

  const data = await httpGet<any>(url, { params });
  if (!data?.data?.diff) {
    return createDataFrame([], []);
  }

  let columns: string[];
  let rows: any[][];

  const diff = data.data.diff;

  if (indicator === '今日') {
    columns = [
      '序号', '代码', '名称', '最新价', '今日涨跌幅',
      '今日主力净流入-净额', '今日主力净流入-净占比',
      '今日超大单净流入-净额', '今日超大单净流入-净占比',
      '今日大单净流入-净额', '今日大单净流入-净占比',
      '今日中单净流入-净额', '今日中单净流入-净占比',
      '今日小单净流入-净额', '今日小单净流入-净占比',
    ];
    rows = diff.map((item: any, idx: number) => [
      idx + 1, item.f12, item.f14, item.f2, item.f3,
      item.f62, item.f184, item.f66, item.f69,
      item.f72, item.f75, item.f78, item.f81,
      item.f84, item.f87,
    ]);
  } else if (indicator === '3日') {
    columns = [
      '序号', '代码', '名称', '最新价', '3日涨跌幅',
      '3日主力净流入-净额', '3日主力净流入-净占比',
      '3日超大单净流入-净额', '3日超大单净流入-净占比',
      '3日大单净流入-净额', '3日大单净流入-净占比',
      '3日中单净流入-净额', '3日中单净流入-净占比',
      '3日小单净流入-净额', '3日小单净流入-净占比',
    ];
    rows = diff.map((item: any, idx: number) => [
      idx + 1, item.f12, item.f14, item.f2, item.f267,
      item.f268, item.f269, item.f270, item.f271,
      item.f272, item.f273, item.f274, item.f275,
      item.f276, item.f127,
    ]);
  } else if (indicator === '5日') {
    columns = [
      '序号', '代码', '名称', '最新价', '5日涨跌幅',
      '5日主力净流入-净额', '5日主力净流入-净占比',
      '5日超大单净流入-净额', '5日超大单净流入-净占比',
      '5日大单净流入-净额', '5日大单净流入-净占比',
      '5日中单净流入-净额', '5日中单净流入-净占比',
      '5日小单净流入-净额', '5日小单净流入-净占比',
    ];
    rows = diff.map((item: any, idx: number) => [
      idx + 1, item.f12, item.f14, item.f2, item.f109,
      item.f164, item.f165, item.f166, item.f167,
      item.f168, item.f169, item.f170, item.f171,
      item.f172, item.f173,
    ]);
  } else {
    columns = [
      '序号', '代码', '名称', '最新价', '10日涨跌幅',
      '10日主力净流入-净额', '10日主力净流入-净占比',
      '10日超大单净流入-净额', '10日超大单净流入-净占比',
      '10日大单净流入-净额', '10日大单净流入-净占比',
      '10日中单净流入-净额', '10日中单净流入-净占比',
      '10日小单净流入-净额', '10日小单净流入-净占比',
    ];
    rows = diff.map((item: any, idx: number) => [
      idx + 1, item.f12, item.f14, item.f2, item.f160,
      item.f174, item.f175, item.f176, item.f177,
      item.f178, item.f179, item.f180, item.f181,
      item.f182, item.f183,
    ]);
  }

  return createDataFrame(columns, rows);
}

/**
 * 东方财富-数据中心-资金流向-大盘
 */
export async function stock_market_fund_flow(): Promise<DataFrame> {
  const url = 'https://push2his.eastmoney.com/api/qt/stock/fflow/daykline/get';
  const params = {
    lmt: '0',
    klt: '101',
    secid: '1.000001',
    secid2: '0.399001',
    fields1: 'f1,f2,f3,f7',
    fields2: 'f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61,f62,f63,f64,f65',
    ut: 'b2884a393a59ad64002292a3e90d46a5',
    _: Date.now().toString(),
  };

  const data = await httpGet<any>(url, { params });
  if (!data?.data?.klines) {
    return createDataFrame([], []);
  }

  const rawColumns = [
    '日期', '主力净流入-净额', '小单净流入-净额', '中单净流入-净额',
    '大单净流入-净额', '超大单净流入-净额', '主力净流入-净占比',
    '小单净流入-净占比', '中单净流入-净占比', '大单净流入-净占比',
    '超大单净流入-净占比', '上证-收盘价', '上证-涨跌幅',
    '深证-收盘价', '深证-涨跌幅',
  ];

  const selectedColumns = [
    '日期', '上证-收盘价', '上证-涨跌幅', '深证-收盘价', '深证-涨跌幅',
    '主力净流入-净额', '主力净流入-净占比',
    '超大单净流入-净额', '超大单净流入-净占比',
    '大单净流入-净额', '大单净流入-净占比',
    '中单净流入-净额', '中单净流入-净占比',
    '小单净流入-净额', '小单净流入-净占比',
  ];

  const rows = data.data.klines.map((item: string) => {
    const parts = item.split(',');
    const fullRow: Record<string, any> = {};
    rawColumns.forEach((col, i) => {
      fullRow[col] = parts[i];
    });
    return selectedColumns.map(col => {
      if (col === '日期') return fullRow[col];
      return parseFloat(fullRow[col]);
    });
  });

  return createDataFrame(selectedColumns, rows);
}

/**
 * 东方财富-数据中心-资金流向-板块资金流-排名
 *
 * @param indicator 指标周期：今日, 5日, 10日
 * @param sector_type 板块类型：行业资金流, 概念资金流, 地域资金流
 */
export async function stock_sector_fund_flow_rank(
  indicator: '今日' | '5日' | '10日' = '今日',
  sectorType: '行业资金流' | '概念资金流' | '地域资金流' = '行业资金流'
): Promise<DataFrame> {
  const sectorTypeMap: Record<string, string> = {
    '行业资金流': '2',
    '概念资金流': '3',
    '地域资金流': '1',
  };

  const indicatorMap: Record<string, [string, string, string]> = {
    '今日': ['f62', '1', 'f12,f14,f2,f3,f62,f184,f66,f69,f72,f75,f78,f81,f84,f87,f204,f205,f124'],
    '5日': ['f164', '5', 'f12,f14,f2,f109,f164,f165,f166,f167,f168,f169,f170,f171,f172,f173,f257,f258,f124'],
    '10日': ['f174', '10', 'f12,f14,f2,f160,f174,f175,f176,f177,f178,f179,f180,f181,f182,f183,f260,f261,f124'],
  };

  const url = 'https://push2.eastmoney.com/api/qt/clist/get';
  const params = {
    pn: '1',
    pz: '10000',
    po: '1',
    np: '1',
    ut: 'b2884a393a59ad64002292a3e90d46a5',
    fltt: '2',
    invt: '2',
    fid0: indicatorMap[indicator][0],
    fs: `m:90 t:${sectorTypeMap[sectorType]}`,
    stat: indicatorMap[indicator][1],
    fields: indicatorMap[indicator][2],
    rt: '52975239',
    _: Date.now().toString(),
  };

  const data = await httpGet<any>(url, { params });
  if (!data?.data?.diff) {
    return createDataFrame([], []);
  }

  const diff = data.data.diff;
  let columns: string[];
  let rows: any[][];

  if (indicator === '今日') {
    columns = [
      '名称', '今日涨跌幅', '今日主力净流入-净额', '今日主力净流入-净占比',
      '今日超大单净流入-净额', '今日超大单净流入-净占比',
      '今日大单净流入-净额', '今日大单净流入-净占比',
      '今日中单净流入-净额', '今日中单净流入-净占比',
      '今日小单净流入-净额', '今日小单净流入-净占比',
      '今日主力净流入最大股',
    ];
    rows = diff.map((item: any) => [
      item.f14, item.f3, item.f62, item.f184, item.f66, item.f69,
      item.f72, item.f75, item.f78, item.f81, item.f84, item.f87,
      item.f204,
    ]);
  } else if (indicator === '5日') {
    columns = [
      '名称', '5日涨跌幅', '5日主力净流入-净额', '5日主力净流入-净占比',
      '5日超大单净流入-净额', '5日超大单净流入-净占比',
      '5日大单净流入-净额', '5日大单净流入-净占比',
      '5日中单净流入-净额', '5日中单净流入-净占比',
      '5日小单净流入-净额', '5日小单净流入-净占比',
      '5日主力净流入最大股',
    ];
    rows = diff.map((item: any) => [
      item.f14, item.f109, item.f164, item.f165, item.f166, item.f167,
      item.f168, item.f169, item.f170, item.f171, item.f172, item.f173,
      item.f257,
    ]);
  } else {
    columns = [
      '名称', '10日涨跌幅', '10日主力净流入-净额', '10日主力净流入-净占比',
      '10日超大单净流入-净额', '10日超大单净流入-净占比',
      '10日大单净流入-净额', '10日大单净流入-净占比',
      '10日中单净流入-净额', '10日中单净流入-净占比',
      '10日小单净流入-净额', '10日小单净流入-净占比',
      '10日主力净流入最大股',
    ];
    rows = diff.map((item: any) => [
      item.f14, item.f160, item.f174, item.f175, item.f176, item.f177,
      item.f178, item.f179, item.f180, item.f181, item.f182, item.f183,
      item.f260,
    ]);
  }

  return createDataFrame(columns, rows);
}

/**
 * 东方财富-数据中心-资金流向-主力净流入排名
 *
 * @param symbol 范围：全部股票, 沪深A股, 沪市A股, 科创板, 深市A股, 创业板, 沪市B股, 深市B股
 */
export async function stock_main_fund_flow(
  symbol: '全部股票' | '沪深A股' | '沪市A股' | '科创板' | '深市A股' | '创业板' | '沪市B股' | '深市B股' = '全部股票'
): Promise<DataFrame> {
  const symbolMap: Record<string, string> = {
    '全部股票': 'm:0+t:6+f:!2,m:0+t:13+f:!2,m:0+t:80+f:!2,m:1+t:2+f:!2,m:1+t:23+f:!2,m:0+t:7+f:!2,m:1+t:3+f:!2',
    '沪深A股': 'm:0+t:6+f:!2,m:0+t:13+f:!2,m:0+t:80+f:!2,m:1+t:2+f:!2,m:1+t:23+f:!2',
    '沪市A股': 'm:1+t:2+f:!2,m:1+t:23+f:!2',
    '科创板': 'm:1+t:23+f:!2',
    '深市A股': 'm:0+t:6+f:!2,m:0+t:13+f:!2,m:0+t:80+f:!2',
    '创业板': 'm:0+t:80+f:!2',
    '沪市B股': 'm:1+t:3+f:!2',
    '深市B股': 'm:0+t:7+f:!2',
  };

  const url = 'https://push2.eastmoney.com/api/qt/clist/get';
  const params = {
    fid: 'f184',
    po: '1',
    pz: '10000',
    pn: '1',
    np: '1',
    fltt: '2',
    invt: '2',
    fields: 'f2,f3,f12,f13,f14,f62,f184,f225,f165,f263,f109,f175,f264,f160,f100,f124,f265,f1',
    ut: 'b2884a393a59ad64002292a3e90d46a5',
    fs: symbolMap[symbol],
  };

  const data = await httpGet<any>(url, { params });
  if (!data?.data?.diff) {
    return createDataFrame([], []);
  }

  const columns = [
    '序号', '代码', '名称', '最新价',
    '今日排行榜-主力净占比', '今日排行榜-今日排名', '今日排行榜-今日涨跌',
    '5日排行榜-主力净占比', '5日排行榜-5日排名', '5日排行榜-5日涨跌',
    '10日排行榜-主力净占比', '10日排行榜-10日排名', '10日排行榜-10日涨跌',
    '所属板块',
  ];

  const rows = data.data.diff.map((item: any, idx: number) => [
    idx + 1, item.f12, item.f14, item.f2,
    item.f184, item.f225, item.f3,
    item.f165, item.f263, item.f109,
    item.f175, item.f264, item.f160,
    item.f100,
  ]);

  return createDataFrame(columns, rows);
}
