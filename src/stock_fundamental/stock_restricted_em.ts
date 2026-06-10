/**
 * AKShare TypeScript - 东方财富-限售股解禁
 * https://data.eastmoney.com/dxf/detail.html
 */

import { httpGet } from '../utils/httpClient';
import { createDataFrame, DataFrame } from '../utils/dataframe';

/**
 * 东方财富网-数据中心-特色数据-限售股解禁
 *
 * @param symbol 标的市场: "全部股票", "沪市A股", "科创板", "深市A股", "创业板", "京市A股"
 * @param startDate 开始日期，格式 "20221101"
 * @param endDate 结束日期，格式 "20221209"
 */
export async function stock_restricted_release_summary_em(
  symbol: string = '全部股票',
  startDate: string = '20221101',
  endDate: string = '20221209'
): Promise<DataFrame> {
  const symbolMap: Record<string, string> = {
    '全部股票': '000300',
    '沪市A股': '000001',
    '科创板': '000688',
    '深市A股': '399001',
    '创业板': '399001',
    '京市A股': '999999',
  };

  const startDateStr = `${startDate.slice(0, 4)}-${startDate.slice(4, 6)}-${startDate.slice(6)}`;
  const endDateStr = `${endDate.slice(0, 4)}-${endDate.slice(4, 6)}-${endDate.slice(6)}`;

  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    sortColumns: 'FREE_DATE',
    sortTypes: '1',
    pageSize: '500',
    pageNumber: '1',
    columns: 'ALL',
    quoteColumns: 'f2~03~INDEX_CODE,f3~03~INDEX_CODE,f124~03~INDEX_CODE',
    quoteType: '0',
    source: 'WEB',
    client: 'WEB',
    filter: `(INDEX_CODE="${symbolMap[symbol] || '000300'}")(FREE_DATE>='${startDateStr}')(FREE_DATE<='${endDateStr}')`,
    reportName: 'RPT_LIFTDAY_STA',
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.result?.data) {
    return createDataFrame([], []);
  }

  const columns = [
    '序号', '解禁时间', '当日解禁股票家数', '解禁数量',
    '实际解禁数量', '实际解禁市值', '沪深300指数', '沪深300指数涨跌幅',
  ];

  const rows = data.result.data.map((item: any, index: number) => [
    index + 1,
    item.FREE_DATE ? item.FREE_DATE.split(' ')[0] : null,
    item.LIFTING_NUM != null ? Number(item.LIFTING_NUM) : null,
    item.FREE_SHARES != null ? Number(item.FREE_SHARES) * 10000 : null,
    item.CURRENT_FREE_SHARES != null ? Number(item.CURRENT_FREE_SHARES) * 10000 : null,
    item.LIFT_MARKET_CAP != null ? Number(item.LIFT_MARKET_CAP) * 10000 : null,
    item.f2 != null ? Number(item.f2) : null,
    item.f3 != null ? Number(item.f3) : null,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 东方财富网-数据中心-限售股解禁-解禁详情一览
 *
 * @param startDate 开始日期，格式 "20221202"
 * @param endDate 结束日期，格式 "20241202"
 */
export async function stock_restricted_release_detail_em(
  startDate: string = '20221202',
  endDate: string = '20241202'
): Promise<DataFrame> {
  const startDateStr = `${startDate.slice(0, 4)}-${startDate.slice(4, 6)}-${startDate.slice(6)}`;
  const endDateStr = `${endDate.slice(0, 4)}-${endDate.slice(4, 6)}-${endDate.slice(6)}`;

  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    sortColumns: 'FREE_DATE,CURRENT_FREE_SHARES',
    sortTypes: '1,1',
    pageSize: '500',
    pageNumber: '1',
    reportName: 'RPT_LIFT_STAGE',
    columns: 'SECURITY_CODE,SECURITY_NAME_ABBR,FREE_DATE,CURRENT_FREE_SHARES,ABLE_FREE_SHARES,LIFT_MARKET_CAP,FREE_RATIO,NEW,B20_ADJCHRATE,A20_ADJCHRATE,FREE_SHARES_TYPE,TOTAL_RATIO,NON_FREE_SHARES,BATCH_HOLDER_NUM',
    source: 'WEB',
    client: 'WEB',
    filter: `(FREE_DATE>='${startDateStr}')(FREE_DATE<='${endDateStr}')`,
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.result?.data) {
    return createDataFrame([], []);
  }

  const columns = [
    '序号', '股票代码', '股票简称', '解禁时间', '限售股类型',
    '解禁数量', '实际解禁数量', '实际解禁市值', '占解禁前流通市值比例',
    '解禁前一交易日收盘价', '解禁前20日涨跌幅', '解禁后20日涨跌幅',
  ];

  const rows = data.result.data.map((item: any, index: number) => [
    index + 1,
    item.SECURITY_CODE,
    item.SECURITY_NAME_ABBR,
    item.FREE_DATE ? item.FREE_DATE.split(' ')[0] : null,
    item.FREE_SHARES_TYPE,
    item.FREE_SHARES != null ? Number(item.FREE_SHARES) * 10000 : null,
    item.CURRENT_FREE_SHARES != null ? Number(item.CURRENT_FREE_SHARES) * 10000 : null,
    item.LIFT_MARKET_CAP != null ? Number(item.LIFT_MARKET_CAP) * 10000 : null,
    item.FREE_RATIO != null ? Number(item.FREE_RATIO) : null,
    item.NEW != null ? Number(item.NEW) : null,
    item.B20_ADJCHRATE != null ? Number(item.B20_ADJCHRATE) : null,
    item.A20_ADJCHRATE != null ? Number(item.A20_ADJCHRATE) : null,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 东方财富网-数据中心-个股限售解禁-解禁批次
 *
 * @param symbol 股票代码，如 "600000"
 */
export async function stock_restricted_release_queue_em(symbol: string = '600000'): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    sortColumns: 'FREE_DATE',
    sortTypes: '-1',
    pageSize: '500',
    pageNumber: '1',
    reportName: 'RPT_LIFT_STAGE',
    filter: `(SECURITY_CODE="${symbol}")`,
    columns: 'SECURITY_CODE,SECURITY_NAME_ABBR,FREE_DATE,CURRENT_FREE_SHARES,ABLE_FREE_SHARES,LIFT_MARKET_CAP,FREE_RATIO,NEW,B20_ADJCHRATE,A20_ADJCHRATE,FREE_SHARES_TYPE,TOTAL_RATIO,NON_FREE_SHARES,BATCH_HOLDER_NUM',
    source: 'WEB',
    client: 'WEB',
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.result?.data) {
    return createDataFrame([], []);
  }

  const columns = [
    '序号', '解禁时间', '解禁股东数', '解禁数量', '实际解禁数量',
    '未解禁数量', '实际解禁数量市值', '占总市值比例', '占流通市值比例',
    '解禁前一交易日收盘价', '限售股类型', '解禁前20日涨跌幅', '解禁后20日涨跌幅',
  ];

  const rows = data.result.data.map((item: any, index: number) => [
    index + 1,
    item.FREE_DATE ? item.FREE_DATE.split(' ')[0] : null,
    item.BATCH_HOLDER_NUM != null ? Number(item.BATCH_HOLDER_NUM) : null,
    item.FREE_SHARES != null ? Number(item.FREE_SHARES) * 10000 : null,
    item.CURRENT_FREE_SHARES != null ? Number(item.CURRENT_FREE_SHARES) * 10000 : null,
    item.NON_FREE_SHARES != null ? Number(item.NON_FREE_SHARES) * 10000 : null,
    item.LIFT_MARKET_CAP != null ? Number(item.LIFT_MARKET_CAP) * 10000 : null,
    item.TOTAL_RATIO != null ? Number(item.TOTAL_RATIO) : null,
    item.FREE_RATIO != null ? Number(item.FREE_RATIO) : null,
    item.NEW != null ? Number(item.NEW) : null,
    item.FREE_SHARES_TYPE,
    item.B20_ADJCHRATE != null ? Number(item.B20_ADJCHRATE) : null,
    item.A20_ADJCHRATE != null ? Number(item.A20_ADJCHRATE) : null,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 东方财富网-数据中心-个股限售解禁-解禁股东
 *
 * @param symbol 股票代码，如 "600000"
 * @param date 日期，格式 "20200904"，通过 stock_restricted_release_queue_em 获取
 */
export async function stock_restricted_release_stockholder_em(
  symbol: string = '600000',
  date: string = '20200904'
): Promise<DataFrame> {
  const dateStr = `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6)}`;

  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    sortColumns: 'ADD_LISTING_SHARES',
    sortTypes: '-1',
    pageSize: '500',
    pageNumber: '1',
    reportName: 'RPT_LIFT_GD',
    filter: `(SECURITY_CODE="${symbol}")(FREE_DATE='${dateStr}')`,
    columns: 'LIMITED_HOLDER_NAME,ADD_LISTING_SHARES,ACTUAL_LISTED_SHARES,ADD_LISTING_CAP,LOCK_MONTH,RESIDUAL_LIMITED_SHARES,FREE_SHARES_TYPE,PLAN_FEATURE',
    source: 'WEB',
    client: 'WEB',
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.result?.data) {
    return createDataFrame([], []);
  }

  const columns = [
    '序号', '股东名称', '解禁数量', '实际解禁数量', '解禁市值',
    '锁定期', '剩余未解禁数量', '限售股类型', '进度',
  ];

  const rows = data.result.data.map((item: any, index: number) => [
    index + 1,
    item.LIMITED_HOLDER_NAME,
    item.ADD_LISTING_SHARES != null ? Number(item.ADD_LISTING_SHARES) : null,
    item.ACTUAL_LISTED_SHARES != null ? Number(item.ACTUAL_LISTED_SHARES) : null,
    item.ADD_LISTING_CAP != null ? Number(item.ADD_LISTING_CAP) : null,
    item.LOCK_MONTH != null ? Number(item.LOCK_MONTH) : null,
    item.RESIDUAL_LIMITED_SHARES != null ? Number(item.RESIDUAL_LIMITED_SHARES) : null,
    item.FREE_SHARES_TYPE,
    item.PLAN_FEATURE,
  ]);

  return createDataFrame(columns, rows);
}
