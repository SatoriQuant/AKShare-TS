/**
 * AKShare TypeScript - 东方财富大宗交易数据接口
 * https://data.eastmoney.com/dzjy/
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 东方财富-数据中心-大宗交易-市场统计
 */
export async function stock_dzjy_sctj(): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    sortColumns: 'TRADE_DATE',
    sortTypes: '-1',
    pageSize: '500',
    pageNumber: '1',
    reportName: 'PRT_BLOCKTRADE_MARKET_STA',
    columns: 'TRADE_DATE,SZ_INDEX,SZ_CHANGE_RATE,BLOCKTRADE_DEAL_AMT,PREMIUM_DEAL_AMT,PREMIUM_RATIO,DISCOUNT_DEAL_AMT,DISCOUNT_RATIO',
    source: 'WEB',
    client: 'WEB',
  };

  const data = await httpGet<any>(url, { params });
  if (!data?.result?.data) {
    return createDataFrame([], []);
  }

  const columns = [
    '交易日期', '上证指数', '上证指数涨跌幅', '大宗交易成交总额',
    '溢价成交总额', '溢价成交总额占比', '折价成交总额', '折价成交总额占比',
  ];

  const rows = data.result.data.map((item: any) => [
    item.TRADE_DATE,
    item.SZ_INDEX,
    item.SZ_CHANGE_RATE,
    item.BLOCKTRADE_DEAL_AMT,
    item.PREMIUM_DEAL_AMT,
    item.PREMIUM_RATIO,
    item.DISCOUNT_DEAL_AMT,
    item.DISCOUNT_RATIO,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 东方财富-数据中心-大宗交易-每日明细
 *
 * @param symbol 证券类型：A股, B股, 基金, 债券
 * @param startDate 开始日期，格式 "20220104"
 * @param endDate 结束日期，格式 "20220104"
 */
export async function stock_dzjy_mrmx(
  symbol: 'A股' | 'B股' | '基金' | '债券' = 'A股',
  startDate: string = '20220104',
  endDate: string = '20220104'
): Promise<DataFrame> {
  const symbolMap: Record<string, string> = {
    'A股': '1', 'B股': '2', '基金': '3', '债券': '4',
  };

  const formatDate = (d: string) =>
    `${d.substring(0, 4)}-${d.substring(4, 6)}-${d.substring(6, 8)}`;

  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    sortColumns: 'SECURITY_CODE',
    sortTypes: '1',
    pageSize: '5000',
    pageNumber: '1',
    reportName: 'RPT_DATA_BLOCKTRADE',
    columns: 'TRADE_DATE,SECURITY_CODE,SECUCODE,SECURITY_NAME_ABBR,CHANGE_RATE,CLOSE_PRICE,DEAL_PRICE,PREMIUM_RATIO,DEAL_VOLUME,DEAL_AMT,TURNOVER_RATE,BUYER_NAME,SELLER_NAME,CHANGE_RATE_1DAYS,CHANGE_RATE_5DAYS,CHANGE_RATE_10DAYS,CHANGE_RATE_20DAYS,BUYER_CODE,SELLER_CODE',
    source: 'WEB',
    client: 'WEB',
    filter: `(SECURITY_TYPE_WEB=${symbolMap[symbol]})(TRADE_DATE>='${formatDate(startDate)}')(TRADE_DATE<='${formatDate(endDate)}')`,
  };

  const data = await httpGet<any>(url, { params });
  if (!data?.result?.data) {
    return createDataFrame([], []);
  }

  if (symbol === 'A股') {
    const columns = [
      '交易日期', '证券代码', '证券简称', '涨跌幅', '收盘价', '成交价',
      '折溢率', '成交量', '成交额', '成交额/流通市值', '买方营业部', '卖方营业部',
    ];

    const rows = data.result.data.map((item: any) => [
      item.TRADE_DATE,
      item.SECURITY_CODE,
      item.SECURITY_NAME_ABBR,
      item.CHANGE_RATE,
      item.CLOSE_PRICE,
      item.DEAL_PRICE,
      item.PREMIUM_RATIO,
      item.DEAL_VOLUME,
      item.DEAL_AMT,
      item.TURNOVER_RATE,
      item.BUYER_NAME,
      item.SELLER_NAME,
    ]);

    return createDataFrame(columns, rows);
  } else {
    const columns = [
      '交易日期', '证券代码', '证券简称', '成交价', '成交量', '成交额',
      '买方营业部', '卖方营业部',
    ];

    const rows = data.result.data.map((item: any) => [
      item.TRADE_DATE,
      item.SECURITY_CODE,
      item.SECURITY_NAME_ABBR,
      item.DEAL_PRICE,
      item.DEAL_VOLUME,
      item.DEAL_AMT,
      item.BUYER_NAME,
      item.SELLER_NAME,
    ]);

    return createDataFrame(columns, rows);
  }
}

/**
 * 东方财富-数据中心-大宗交易-每日统计
 *
 * @param startDate 开始日期
 * @param endDate 结束日期
 */
export async function stock_dzjy_mrtj(
  startDate: string = '20220105',
  endDate: string = '20220105'
): Promise<DataFrame> {
  const formatDate = (d: string) =>
    `${d.substring(0, 4)}-${d.substring(4, 6)}-${d.substring(6, 8)}`;

  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    sortColumns: 'TURNOVERRATE',
    sortTypes: '-1',
    pageSize: '5000',
    pageNumber: '1',
    reportName: 'RPT_BLOCKTRADE_STA',
    columns: 'TRADE_DATE,SECURITY_CODE,SECUCODE,SECURITY_NAME_ABBR,CHANGE_RATE,CLOSE_PRICE,AVERAGE_PRICE,PREMIUM_RATIO,DEAL_NUM,VOLUME,DEAL_AMT,TURNOVERRATE,D1_CLOSE_ADJCHRATE,D5_CLOSE_ADJCHRATE,D10_CLOSE_ADJCHRATE,D20_CLOSE_ADJCHRATE',
    source: 'WEB',
    client: 'WEB',
    filter: `(TRADE_DATE>='${formatDate(startDate)}')(TRADE_DATE<='${formatDate(endDate)}')`,
  };

  const data = await httpGet<any>(url, { params });
  if (!data?.result?.data) {
    return createDataFrame([], []);
  }

  const columns = [
    '交易日期', '证券代码', '证券简称', '涨跌幅', '收盘价', '成交价',
    '折溢率', '成交笔数', '成交总量', '成交总额', '成交总额/流通市值',
  ];

  const rows = data.result.data.map((item: any) => [
    item.TRADE_DATE,
    item.SECURITY_CODE,
    item.SECURITY_NAME_ABBR,
    item.CHANGE_RATE,
    item.CLOSE_PRICE,
    item.AVERAGE_PRICE,
    item.PREMIUM_RATIO,
    item.DEAL_NUM,
    item.VOLUME,
    item.DEAL_AMT,
    item.TURNOVERRATE,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 东方财富-数据中心-大宗交易-活跃 A 股统计
 *
 * @param symbol 周期：近一月, 近三月, 近六月, 近一年
 */
export async function stock_dzjy_hygtj(
  symbol: '近一月' | '近三月' | '近六月' | '近一年' = '近三月'
): Promise<DataFrame> {
  const periodMap: Record<string, string> = {
    '近一月': '1', '近三月': '3', '近六月': '6', '近一年': '12',
  };

  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    sortColumns: 'DEAL_NUM,SECURITY_CODE',
    sortTypes: '-1,-1',
    pageSize: '5000',
    pageNumber: '1',
    reportName: 'RPT_BLOCKTRADE_ACSTA',
    columns: 'SECURITY_CODE,SECUCODE,SECURITY_NAME_ABBR,CLOSE_PRICE,CHANGE_RATE,TRADE_DATE,DEAL_AMT,PREMIUM_RATIO,SUM_TURNOVERRATE,DEAL_NUM,PREMIUM_TIMES,DISCOUNT_TIMES,D1_AVG_ADJCHRATE,D5_AVG_ADJCHRATE,D10_AVG_ADJCHRATE,D20_AVG_ADJCHRATE,DATE_TYPE_CODE',
    source: 'WEB',
    client: 'WEB',
    filter: `(DATE_TYPE_CODE=${periodMap[symbol]})`,
  };

  const data = await httpGet<any>(url, { params });
  if (!data?.result?.data) {
    return createDataFrame([], []);
  }

  const columns = [
    '证券代码', '证券简称', '最新价', '涨跌幅', '最近上榜日',
    '上榜次数-总计', '上榜次数-溢价', '上榜次数-折价',
    '总成交额', '折溢率', '成交总额/流通市值',
    '上榜日后平均涨跌幅-1日', '上榜日后平均涨跌幅-5日',
    '上榜日后平均涨跌幅-10日', '上榜日后平均涨跌幅-20日',
  ];

  const rows = data.result.data.map((item: any) => [
    item.SECURITY_CODE,
    item.SECURITY_NAME_ABBR,
    item.CLOSE_PRICE,
    item.CHANGE_RATE,
    item.TRADE_DATE,
    item.DEAL_NUM,
    item.PREMIUM_TIMES,
    item.DISCOUNT_TIMES,
    item.DEAL_AMT,
    item.PREMIUM_RATIO,
    item.SUM_TURNOVERRATE,
    item.D1_AVG_ADJCHRATE,
    item.D5_AVG_ADJCHRATE,
    item.D10_AVG_ADJCHRATE,
    item.D20_AVG_ADJCHRATE,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 东方财富-数据中心-大宗交易-活跃营业部统计
 *
 * @param symbol 周期：当前交易日, 近3日, 近5日, 近10日, 近30日
 */
export async function stock_dzjy_hyyybtj(
  symbol: '当前交易日' | '近3日' | '近5日' | '近10日' | '近30日' = '近3日'
): Promise<DataFrame> {
  const periodMap: Record<string, string> = {
    '当前交易日': '1', '近3日': '3', '近5日': '5', '近10日': '10', '近30日': '30',
  };

  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    sortColumns: 'BUYER_NUM,TOTAL_BUYAMT',
    sortTypes: '-1,-1',
    pageSize: '5000',
    pageNumber: '1',
    reportName: 'RPT_BLOCKTRADE_OPERATEDEPTSTATISTICS',
    columns: 'OPERATEDEPT_CODE,OPERATEDEPT_NAME,ONLIST_DATE,STOCK_DETAILS,BUYER_NUM,SELLER_NUM,TOTAL_BUYAMT,TOTAL_SELLAMT,TOTAL_NETAMT,N_DATE',
    source: 'WEB',
    client: 'WEB',
    filter: `(N_DATE=-${periodMap[symbol]})`,
  };

  const data = await httpGet<any>(url, { params });
  if (!data?.result?.data) {
    return createDataFrame([], []);
  }

  const columns = [
    '营业部名称', '最近上榜日', '次数总计-买入', '次数总计-卖出',
    '成交金额统计-买入', '成交金额统计-卖出', '成交金额统计-净买入额', '买入的股票',
  ];

  const rows = data.result.data.map((item: any) => [
    item.OPERATEDEPT_NAME,
    item.ONLIST_DATE,
    item.BUYER_NUM,
    item.SELLER_NUM,
    item.TOTAL_BUYAMT,
    item.TOTAL_SELLAMT,
    item.TOTAL_NETAMT,
    item.STOCK_DETAILS,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 东方财富-数据中心-大宗交易-营业部排行
 *
 * @param symbol 周期：近一月, 近三月, 近六月, 近一年
 */
export async function stock_dzjy_yybph(
  symbol: '近一月' | '近三月' | '近六月' | '近一年' = '近三月'
): Promise<DataFrame> {
  const periodMap: Record<string, string> = {
    '近一月': '30', '近三月': '90', '近六月': '180', '近一年': '360',
  };

  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    sortColumns: 'D5_BUYER_NUM,D1_AVERAGE_INCREASE',
    sortTypes: '-1,-1',
    pageSize: '5000',
    pageNumber: '1',
    reportName: 'RPT_BLOCKTRADE_OPERATEDEPT_RANK',
    columns: 'OPERATEDEPT_CODE,OPERATEDEPT_NAME,D1_BUYER_NUM,D1_AVERAGE_INCREASE,D1_RISE_PROBABILITY,D5_BUYER_NUM,D5_AVERAGE_INCREASE,D5_RISE_PROBABILITY,D10_BUYER_NUM,D10_AVERAGE_INCREASE,D10_RISE_PROBABILITY,D20_BUYER_NUM,D20_AVERAGE_INCREASE,D20_RISE_PROBABILITY,N_DATE,RELATED_ORG_CODE',
    source: 'WEB',
    client: 'WEB',
    filter: `(N_DATE=-${periodMap[symbol]})`,
  };

  const data = await httpGet<any>(url, { params });
  if (!data?.result?.data) {
    return createDataFrame([], []);
  }

  const columns = [
    '营业部名称',
    '上榜后1天-买入次数', '上榜后1天-平均涨幅', '上榜后1天-上涨概率',
    '上榜后5天-买入次数', '上榜后5天-平均涨幅', '上榜后5天-上涨概率',
    '上榜后10天-买入次数', '上榜后10天-平均涨幅', '上榜后10天-上涨概率',
    '上榜后20天-买入次数', '上榜后20天-平均涨幅', '上榜后20天-上涨概率',
  ];

  const rows = data.result.data.map((item: any) => [
    item.OPERATEDEPT_NAME,
    item.D1_BUYER_NUM, item.D1_AVERAGE_INCREASE, item.D1_RISE_PROBABILITY,
    item.D5_BUYER_NUM, item.D5_AVERAGE_INCREASE, item.D5_RISE_PROBABILITY,
    item.D10_BUYER_NUM, item.D10_AVERAGE_INCREASE, item.D10_RISE_PROBABILITY,
    item.D20_BUYER_NUM, item.D20_AVERAGE_INCREASE, item.D20_RISE_PROBABILITY,
  ]);

  return createDataFrame(columns, rows);
}
