/**
 * AKShare TypeScript - 东方财富网-数据中心-沪深港通持股
 * https://data.eastmoney.com/hsgtcg/
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 东方财富网-数据中心-资金流向-沪深港通资金流向
 * https://data.eastmoney.com/hsgt/index.html#lssj
 * @returns 沪深港通资金流向数据
 */
export async function stock_hsgt_fund_flow_summary_em(): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    reportName: 'RPT_MUTUAL_QUOTA',
    columns: 'TRADE_DATE,MUTUAL_TYPE,BOARD_TYPE,MUTUAL_TYPE_NAME,FUNDS_DIRECTION,INDEX_CODE,INDEX_NAME,BOARD_CODE',
    quoteColumns: 'status~07~BOARD_CODE,dayNetAmtIn~07~BOARD_CODE,dayAmtRemain~07~BOARD_CODE,dayAmtThreshold~07~BOARD_CODE,f104~07~BOARD_CODE,f105~07~BOARD_CODE,f106~07~BOARD_CODE,f3~03~INDEX_CODE~INDEX_f3,netBuyAmt~07~BOARD_CODE',
    quoteType: '0',
    pageNumber: '1',
    pageSize: '2000',
    sortTypes: '1',
    sortColumns: 'MUTUAL_TYPE',
    source: 'WEB',
    client: 'WEB',
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.result?.data) {
    return createDataFrame([], []);
  }

  const columns = [
    '交易日', '类型', '板块', '资金方向', '交易状态', '成交净买额', '资金净流入',
    '当日资金余额', '上涨数', '持平数', '下跌数', '相关指数', '指数涨跌幅'
  ];

  const rows = data.result.data.map((item: any) => [
    item.TRADE_DATE ? new Date(item.TRADE_DATE).toISOString().split('T')[0] : null,
    item.MUTUAL_TYPE_NAME,
    item.BOARD_TYPE,
    item.FUNDS_DIRECTION,
    item.status,
    item.netBuyAmt ? item.netBuyAmt / 10000 : null,
    item.dayNetAmtIn ? item.dayNetAmtIn / 10000 : null,
    item.dayAmtRemain ? item.dayAmtRemain / 10000 : null,
    item.f104,
    item.f105,
    item.f106,
    item.INDEX_NAME,
    item['INDEX_f3'],
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 东方财富网-数据中心-资金流向-沪深港通资金流向-沪深港通历史数据
 * https://data.eastmoney.com/hsgt/index.html
 * @param symbol 选择 {"北向资金", "沪股通", "深股通", "南向资金", "港股通沪", "港股通深"}
 * @returns 沪深港通历史数据
 */
export async function stock_hsgt_hist_em(symbol: string = '北向资金'): Promise<DataFrame> {
  const symbol_map: { [key: string]: string } = {
    '北向资金': '5',
    '沪股通': '1',
    '深股通': '3',
    '南向资金': '6',
    '港股通沪': '2',
    '港股通深': '4',
  };

  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    sortColumns: 'TRADE_DATE',
    sortTypes: '-1',
    pageSize: '1000',
    pageNumber: '1',
    reportName: 'RPT_MUTUAL_DEAL_HISTORY',
    columns: 'ALL',
    source: 'WEB',
    client: 'WEB',
    filter: `(MUTUAL_TYPE="00${symbol_map[symbol]}")`,
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.result?.data) {
    return createDataFrame([], []);
  }

  let index_name = '';
  if (symbol === '北向资金') index_name = '沪深300';
  else if (symbol === '沪股通') index_name = '上证指数';
  else if (symbol === '深股通') index_name = '深证指数';
  else if (symbol === '南向资金') index_name = '沪深300';
  else index_name = '恒生指数';

  const columns = [
    '日期', '当日成交净买额', '买入成交额', '卖出成交额', '历史累计净买额',
    '当日资金流入', '当日余额', '持股市值', '领涨股', '领涨股-涨跌幅',
    index_name, `${index_name}-涨跌幅`, '领涨股-代码'
  ];

  const rows = data.result.data.map((item: any) => {
    const is_single = symbol === '沪股通' || symbol === '深股通';
    return [
      item.TRADE_DATE ? new Date(item.TRADE_DATE).toISOString().split('T')[0] : null,
      item.NET_DEAL_AMT ? item.NET_DEAL_AMT / 100 : null,
      item.BUY_AMT ? item.BUY_AMT / 100 : null,
      item.SELL_AMT ? item.SELL_AMT / 100 : null,
      item.ACCUM_DEAL_AMT ? (is_single ? item.ACCUM_DEAL_AMT / 100 : item.ACCUM_DEAL_AMT / 100 / 10000) : null,
      item.FUND_INFLOW ? item.FUND_INFLOW / 100 : null,
      item.QUOTA_BALANCE ? item.QUOTA_BALANCE / 100 : null,
      item.HOLD_MARKET_CAP,
      item.LEAD_STOCKS_NAME,
      item.LS_CHANGE_RATE,
      item.INDEX_CLOSE_PRICE,
      item.INDEX_CHANGE_RATE,
      item.LEAD_STOCKS_CODE,
    ];
  });

  // Sort by date
  rows.sort((a: any[], b: any[]) => {
    if (!a[0] || !b[0]) return 0;
    return new Date(a[0]).getTime() - new Date(b[0]).getTime();
  });

  return createDataFrame(columns, rows);
}

/**
 * 东方财富-数据中心-沪深港通持股-个股排行
 * https://data.eastmoney.com/hsgtcg/list.html
 * @param market 选择 {"北向", "沪股通", "深股通"}
 * @param indicator 选择 {"今日排行", "3日排行", "5日排行", "10日排行", "月排行", "季排行", "年排行"}
 * @returns 指定市场和指标的数据
 */
export async function stock_hsgt_hold_stock_em(
  market: string = '沪股通',
  indicator: string = '5日排行'
): Promise<DataFrame> {
  // First get the current date from the page
  const pageUrl = 'https://data.eastmoney.com/hsgtcg/list.html';
  const pageData = await httpGet<string>(pageUrl);

  // Extract date from page (simplified - in real implementation would parse HTML)
  const today = new Date();
  const date = today.toISOString().split('T')[0];

  const indicator_map: { [key: string]: string } = {
    '今日排行': '1',
    '3日排行': '3',
    '5日排行': '5',
    '10日排行': '10',
    '月排行': 'M',
    '季排行': 'Q',
    '年排行': 'Y',
  };

  let filter_str = '';
  if (market === '北向') {
    filter_str = `(TRADE_DATE='${date}')(INTERVAL_TYPE="${indicator_map[indicator]}")`;
  } else if (market === '沪股通') {
    filter_str = `(TRADE_DATE='${date}')(INTERVAL_TYPE="${indicator_map[indicator]}")(MUTUAL_TYPE="001")`;
  } else if (market === '深股通') {
    filter_str = `(TRADE_DATE='${date}')(INTERVAL_TYPE="${indicator_map[indicator]}")(MUTUAL_TYPE="003")`;
  }

  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    sortColumns: 'ADD_MARKET_CAP',
    sortTypes: '-1',
    pageSize: '50000',
    pageNumber: '1',
    reportName: 'RPT_MUTUAL_STOCK_NORTHSTA',
    columns: 'ALL',
    source: 'WEB',
    client: 'WEB',
    filter: filter_str,
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.result?.data) {
    return createDataFrame([], []);
  }

  const indicator_prefix = indicator.split('排')[0];
  const columns = [
    '序号', '代码', '名称', '今日收盘价', '今日涨跌幅', '今日持股-股数', '今日持股-市值',
    '今日持股-占流通股比', '今日持股-占总股本比', `${indicator_prefix}增持估计-股数`,
    `${indicator_prefix}增持估计-市值`, `${indicator_prefix}增持估计-市值增幅`,
    `${indicator_prefix}增持估计-占流通股比`, `${indicator_prefix}增持估计-占总股本比`,
    '所属板块', '日期'
  ];

  const rows = data.result.data.map((item: any, index: number) => [
    index + 1,
    item.SECURITY_CODE,
    item.SECURITY_NAME,
    item.CLOSE_PRICE,
    item.CHANGE_RATE,
    item.HOLD_SHARES,
    item.HOLD_MARKET_CAP,
    item.FREE_SHARES_RATIO,
    item.TOTAL_SHARES_RATIO,
    item[`ADD_SHARES_${indicator_map[indicator]}`] || item.ADD_SHARES,
    item[`ADD_MARKET_CAP_${indicator_map[indicator]}`] || item.ADD_MARKET_CAP,
    item[`ADD_RATIO_${indicator_map[indicator]}`] || item.ADD_RATIO,
    item[`ADD_FREE_RATIO_${indicator_map[indicator]}`] || item.ADD_FREE_RATIO,
    item[`ADD_TOTAL_RATIO_${indicator_map[indicator]}`] || item.ADD_TOTAL_RATIO,
    item.BOARD_NAME,
    item.TRADE_DATE ? new Date(item.TRADE_DATE).toISOString().split('T')[0] : null,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 东方财富网-数据中心-沪深港通-沪深港通持股-每日个股统计
 * https://data.eastmoney.com/hsgtcg/StockStatistics.aspx
 * @param symbol 选择 {"北向持股", "南向持股", "沪股通持股", "深股通持股"}
 * @param start_date 开始日期，格式 "20200713"
 * @param end_date 结束日期，格式 "20200715"
 * @returns 每日个股统计数据
 */
export async function stock_hsgt_stock_statistics_em(
  symbol: string = '北向持股',
  start_date: string = '20240110',
  end_date: string = '20240110'
): Promise<DataFrame> {
  const start = `${start_date.slice(0, 4)}-${start_date.slice(4, 6)}-${start_date.slice(6)}`;
  const end = `${end_date.slice(0, 4)}-${end_date.slice(4, 6)}-${end_date.slice(6)}`;

  let filter_str = '';
  let reportName = '';

  if (symbol === '南向持股') {
    filter_str = `(INTERVAL_TYPE="1")(RN=1)(TRADE_DATE>='${start}')(TRADE_DATE<='${end}')`;
    reportName = 'RPT_MUTUAL_STOCK_HOLDRANKS';
  } else if (symbol === '北向持股') {
    filter_str = `(INTERVAL_TYPE="1")(MUTUAL_TYPE in ("001","003"))(TRADE_DATE>='${start}')(TRADE_DATE<='${end}')`;
    reportName = 'RPT_MUTUAL_STOCK_NORTHSTA';
  } else if (symbol === '沪股通持股') {
    filter_str = `(INTERVAL_TYPE="1")(MUTUAL_TYPE="001")(TRADE_DATE>='${start}')(TRADE_DATE<='${end}')`;
    reportName = 'RPT_MUTUAL_STOCK_NORTHSTA';
  } else if (symbol === '深股通持股') {
    filter_str = `(INTERVAL_TYPE="1")(MUTUAL_TYPE="003")(TRADE_DATE>='${start}')(TRADE_DATE<='${end}')`;
    reportName = 'RPT_MUTUAL_STOCK_NORTHSTA';
  }

  if (start_date === end_date) {
    if (symbol === '南向持股') {
      filter_str = `(INTERVAL_TYPE="1")(RN=1)(TRADE_DATE='${start}')`;
    } else if (symbol === '北向持股') {
      filter_str = `(INTERVAL_TYPE="1")(MUTUAL_TYPE in ("001","003"))(TRADE_DATE='${start}')`;
    } else if (symbol === '沪股通持股') {
      filter_str = `(INTERVAL_TYPE="1")(MUTUAL_TYPE="001")(TRADE_DATE='${start}')`;
    } else if (symbol === '深股通持股') {
      filter_str = `(INTERVAL_TYPE="1")(MUTUAL_TYPE="003")(TRADE_DATE='${start}')`;
    }
  }

  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    sortColumns: 'TRADE_DATE',
    sortTypes: '-1',
    pageSize: '1000',
    pageNumber: '1',
    columns: 'ALL',
    source: 'WEB',
    client: 'WEB',
    filter: filter_str,
    rt: '53160469',
    reportName: reportName,
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.result?.data) {
    return createDataFrame([], []);
  }

  const columns = [
    '持股日期', '股票代码', '股票简称', '当日收盘价', '当日涨跌幅', '持股数量',
    '持股市值', '持股数量占发行股百分比', '持股市值变化-1日', '持股市值变化-5日', '持股市值变化-10日'
  ];

  const rows = data.result.data.map((item: any) => [
    item.TRADE_DATE ? new Date(item.TRADE_DATE).toISOString().split('T')[0] : null,
    item.SECURITY_CODE,
    item.SECURITY_NAME,
    item.CLOSE_PRICE,
    item.CHANGE_RATE,
    item.HOLD_SHARES,
    item.HOLD_MARKET_CAP,
    item.HOLD_SHARES_RATIO,
    item.HOLD_MARKETCAP_CHG1,
    item.HOLD_MARKETCAP_CHG5,
    item.HOLD_MARKETCAP_CHG10,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 东方财富网-数据中心-沪深港通-沪深港通持股-每日机构统计
 * https://data.eastmoney.com/hsgtcg/InstitutionStatistics.aspx
 * @param market 选择 {"北向持股", "南向持股", "沪股通持股", "深股通持股"}
 * @param start_date 开始日期，格式 "20200713"
 * @param end_date 结束日期，格式 "20200715"
 * @returns 每日机构统计数据
 */
export async function stock_hsgt_institution_statistics_em(
  market: string = '北向持股',
  start_date: string = '20220601',
  end_date: string = '20220609'
): Promise<DataFrame> {
  const start = `${start_date.slice(0, 4)}-${start_date.slice(4, 6)}-${start_date.slice(6)}`;
  const end = `${end_date.slice(0, 4)}-${end_date.slice(4, 6)}-${end_date.slice(6)}`;

  let filter_str = '';
  if (market === '南向持股') {
    filter_str = `(MARKET_TYPE="S")(HOLD_DATE>='${start}')(HOLD_DATE<='${end}')`;
  } else if (market === '北向持股') {
    filter_str = `(MARKET_TYPE="N")(HOLD_DATE>='${start}')(HOLD_DATE<='${end}')`;
  } else if (market === '沪股通持股') {
    filter_str = `(MARKET_TYPE="001")(HOLD_DATE>='${start}')(HOLD_DATE<='${end}')`;
  } else if (market === '深股通持股') {
    filter_str = `(MARKET_TYPE="003")(HOLD_DATE>='${start}')(HOLD_DATE<='${end}')`;
  }

  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    sortColumns: 'HOLD_DATE',
    sortTypes: '-1',
    pageSize: '500',
    pageNumber: '1',
    reportName: 'PRT_MUTUAL_ORG_STA',
    columns: 'ALL',
    source: 'WEB',
    client: 'WEB',
    filter: filter_str,
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.result?.data) {
    return createDataFrame([], []);
  }

  const columns = [
    '持股日期', '机构名称', '持股只数', '持股市值', '持股市值变化-1日', '持股市值变化-5日', '持股市值变化-10日'
  ];

  const rows = data.result.data.map((item: any) => [
    item.HOLD_DATE ? new Date(item.HOLD_DATE).toISOString().split('T')[0] : null,
    item.ORG_NAME,
    item.HOLD_NUM,
    item.HOLD_MARKET_CAP,
    item.HOLD_MARKET_CAPONE,
    item.HOLD_MARKET_CAPFIVE,
    item.HOLD_MARKET_CAPTEN,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 东方财富-数据中心-沪深港通-沪深港通持股-具体股票
 * https://data.eastmoney.com/hsgt/StockHdDetail/002008.html
 * @param symbol 股票代码
 * @returns 具体股票-沪深港通持股数据
 */
export async function stock_hsgt_individual_em(symbol: string = '002008'): Promise<DataFrame> {
  if (symbol.length === 6) {
    // A股
    const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
    const params = {
      sortColumns: 'TRADE_DATE',
      sortTypes: '-1',
      pageSize: '500',
      pageNumber: '1',
      reportName: 'RPT_MUTUAL_HOLDSTOCKNDATE_STA',
      columns: 'ALL',
      source: 'WEB',
      client: 'WEB',
      filter: `(SECURITY_CODE="${symbol}")(INTERVAL_TYPE="1")`,
    };

    const data = await httpGet<any>(url, { params });

    if (!data?.result?.data) {
      return createDataFrame([], []);
    }

    const columns = [
      '持股日期', '当日收盘价', '当日涨跌幅', '持股数量', '持股市值',
      '持股数量占A股百分比', '今日增持股数', '今日增持资金', '今日持股市值变化'
    ];

    const rows = data.result.data.map((item: any) => [
      item.TRADE_DATE ? new Date(item.TRADE_DATE).toISOString().split('T')[0] : null,
      item.CLOSE_PRICE,
      item.CHANGE_RATE,
      item.HOLD_SHARES,
      item.HOLD_MARKET_CAP,
      item.HOLD_SHARES_RATIO,
      item.ADD_SHARES_REPAIR,
      item.PREDICT_AMC,
      item.HMC_CHANGE,
    ]);

    // Sort by date
    rows.sort((a: any[], b: any[]) => {
      if (!a[0] || !b[0]) return 0;
      return new Date(a[0]).getTime() - new Date(b[0]).getTime();
    });

    return createDataFrame(columns, rows);
  } else {
    // 港股
    const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
    const params = {
      sortColumns: 'TRADE_DATE',
      sortTypes: '-1',
      pageSize: '500',
      pageNumber: '1',
      reportName: 'RPT_MUTUAL_STOCK_HOLDRANKS',
      columns: 'ALL',
      source: 'WEB',
      client: 'WEB',
      filter: `(SECUCODE="${symbol}.HK")(MUTUAL_TYPE="002")`,
    };

    const data = await httpGet<any>(url, { params });

    if (!data?.result?.data) {
      return createDataFrame([], []);
    }

    const columns = [
      '持股日期', '当日收盘价', '当日涨跌幅', '持股数量', '持股市值',
      '持股数量占A股百分比', '持股市值变化-1日', '持股市值变化-5日', '持股市值变化-10日'
    ];

    const rows = data.result.data.map((item: any) => [
      item.TRADE_DATE ? new Date(item.TRADE_DATE).toISOString().split('T')[0] : null,
      item.CLOSE_PRICE,
      item.CHANGE_RATE,
      item.HOLD_SHARES,
      item.HOLD_MARKET_CAP,
      item.HOLD_SHARES_RATIO,
      item.HOLD_MARKETCAP_CHG1,
      item.HOLD_MARKETCAP_CHG5,
      item.HOLD_MARKETCAP_CHG10,
    ]);

    // Sort by date
    rows.sort((a: any[], b: any[]) => {
      if (!a[0] || !b[0]) return 0;
      return new Date(a[0]).getTime() - new Date(b[0]).getTime();
    });

    return createDataFrame(columns, rows);
  }
}

/**
 * 东方财富-数据中心-沪深港通-沪深港通持股-具体股票详情
 * https://data.eastmoney.com/hsgtcg/StockHdStatistics/002008.html
 * @param symbol 股票代码
 * @param start_date 开始日期
 * @param end_date 结束日期
 * @returns 沪深港通持股-具体股票详情数据
 */
export async function stock_hsgt_individual_detail_em(
  symbol: string = '002008',
  start_date: string = '20220130',
  end_date: string = '20220330'
): Promise<DataFrame> {
  const start = `${start_date.slice(0, 4)}-${start_date.slice(4, 6)}-${start_date.slice(6)}`;
  const end = `${end_date.slice(0, 4)}-${end_date.slice(4, 6)}-${end_date.slice(6)}`;

  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    sortColumns: 'HOLD_DATE',
    sortTypes: '-1',
    pageSize: '500',
    pageNumber: '1',
    reportName: 'RPT_MUTUAL_HOLD_DET',
    columns: 'ALL',
    source: 'WEB',
    client: 'WEB',
    filter: `(SECURITY_CODE="${symbol}")(MARKET_CODE="003")(HOLD_DATE>='${start}')(HOLD_DATE<='${end}')`,
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.result?.data) {
    return createDataFrame([], []);
  }

  const columns = [
    '持股日期', '当日收盘价', '当日涨跌幅', '机构名称', '持股数量', '持股市值',
    '持股数量占A股百分比', '持股市值变化-1日', '持股市值变化-5日', '持股市值变化-10日'
  ];

  const rows = data.result.data.map((item: any) => [
    item.HOLD_DATE ? new Date(item.HOLD_DATE).toISOString().split('T')[0] : null,
    item.CLOSE_PRICE,
    item.CHANGE_RATE,
    item.ORG_NAME,
    item.HOLD_NUM,
    item.HOLD_MARKET_CAP,
    item.HOLD_SHARES_RATIO,
    item.HOLD_MARKET_CAPONE,
    item.HOLD_MARKET_CAPFIVE,
    item.HOLD_MARKET_CAPTEN,
  ]);

  return createDataFrame(columns, rows);
}
