/**
 * AKShare TypeScript - 东方财富网-数据中心-龙虎榜单
 * https://data.eastmoney.com/stock/tradedetail.html
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 东方财富网-数据中心-龙虎榜单-龙虎榜详情
 * https://data.eastmoney.com/stock/tradedetail.html
 * @param startDate 开始日期，格式 "20230403"
 * @param endDate 结束日期，格式 "20230417"
 * @returns 龙虎榜详情数据
 */
export async function stock_lhb_detail_em(
  startDate: string = '20230403',
  endDate: string = '20230417'
): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const startDateFormatted = `${startDate.slice(0, 4)}-${startDate.slice(4, 6)}-${startDate.slice(6, 8)}`;
  const endDateFormatted = `${endDate.slice(0, 4)}-${endDate.slice(4, 6)}-${endDate.slice(6, 8)}`;

  const params = {
    sortColumns: 'SECURITY_CODE,TRADE_DATE',
    sortTypes: '1,-1',
    pageSize: '5000',
    pageNumber: '1',
    reportName: 'RPT_DAILYBILLBOARD_DETAILSNEW',
    columns: 'SECURITY_CODE,SECUCODE,SECURITY_NAME_ABBR,TRADE_DATE,EXPLAIN,CLOSE_PRICE,CHANGE_RATE,BILLBOARD_NET_AMT,BILLBOARD_BUY_AMT,BILLBOARD_SELL_AMT,BILLBOARD_DEAL_AMT,ACCUM_AMOUNT,DEAL_NET_RATIO,DEAL_AMOUNT_RATIO,TURNOVERRATE,FREE_MARKET_CAP,EXPLANATION,D1_CLOSE_ADJCHRATE,D2_CLOSE_ADJCHRATE,D5_CLOSE_ADJCHRATE,D10_CLOSE_ADJCHRATE,SECURITY_TYPE_CODE',
    source: 'WEB',
    client: 'WEB',
    filter: `(TRADE_DATE<='${endDateFormatted}')(TRADE_DATE>='${startDateFormatted}')`,
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.result?.data) {
    return createDataFrame([], []);
  }

  const totalPage = data.result.pages;
  let allData: any[] = [...data.result.data];

  // 获取剩余页数据
  for (let page = 2; page <= totalPage; page++) {
    const pageParams = { ...params, pageNumber: String(page) };
    const pageData = await httpGet<any>(url, { params: pageParams });
    if (pageData?.result?.data) {
      allData = allData.concat(pageData.result.data);
    }
  }

  const columns = [
    '序号', '代码', '名称', '上榜日', '解读', '收盘价',
    '涨跌幅', '龙虎榜净买额', '龙虎榜买入额', '龙虎榜卖出额',
    '龙虎榜成交额', '市场总成交额', '净买额占总成交比',
    '成交额占总成交比', '换手率', '流通市值', '上榜原因',
    '上榜后1日', '上榜后2日', '上榜后5日', '上榜后10日'
  ];

  const rows = allData.map((item: any, index: number) => [
    index + 1,
    item.SECURITY_CODE,
    item.SECURITY_NAME_ABBR,
    item.TRADE_DATE ? new Date(item.TRADE_DATE).toISOString().split('T')[0] : null,
    item.EXPLAIN,
    item.CLOSE_PRICE,
    item.CHANGE_RATE,
    item.BILLBOARD_NET_AMT,
    item.BILLBOARD_BUY_AMT,
    item.BILLBOARD_SELL_AMT,
    item.BILLBOARD_DEAL_AMT,
    item.ACCUM_AMOUNT,
    item.DEAL_NET_RATIO,
    item.DEAL_AMOUNT_RATIO,
    item.TURNOVERRATE,
    item.FREE_MARKET_CAP,
    item.EXPLANATION,
    item.D1_CLOSE_ADJCHRATE,
    item.D2_CLOSE_ADJCHRATE,
    item.D5_CLOSE_ADJCHRATE,
    item.D10_CLOSE_ADJCHRATE,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 东方财富网-数据中心-龙虎榜单-个股上榜统计
 * https://data.eastmoney.com/stock/tradedetail.html
 * @param symbol 时间范围，可选 {"近一月", "近三月", "近六月", "近一年"}
 * @returns 个股上榜统计数据
 */
export async function stock_lhb_stock_statistic_em(
  symbol: string = '近一月'
): Promise<DataFrame> {
  const symbolMap: Record<string, string> = {
    '近一月': '01',
    '近三月': '02',
    '近六月': '03',
    '近一年': '04',
  };

  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    sortColumns: 'BILLBOARD_NUMS,LATEST_DATE,SECURITY_CODE',
    sortTypes: '-1,-1,1',
    pageSize: '5000',
    pageNumber: '1',
    reportName: 'RPT_DAILYBILLBOARD_DAILYSTATS',
    columns: 'ALL',
    source: 'WEB',
    client: 'WEB',
    filter: `(STATISTICS_CYCLE="${symbolMap[symbol]}")`,
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.result?.data) {
    return createDataFrame([], []);
  }

  const totalPage = data.result.pages;
  let allData: any[] = [...data.result.data];

  // 获取剩余页数据
  for (let page = 2; page <= totalPage; page++) {
    const pageParams = { ...params, pageNumber: String(page) };
    const pageData = await httpGet<any>(url, { params: pageParams });
    if (pageData?.result?.data) {
      allData = allData.concat(pageData.result.data);
    }
  }

  const columns = [
    '序号', '代码', '名称', '上榜次数', '龙虎榜净买额',
    '龙虎榜买入额', '龙虎榜卖出额', '龙虎榜成交额',
    '机构买入净额', '机构卖出净额', '机构买入额', '机构卖出额',
    '上榜后1日', '上榜后2日', '上榜后5日', '上榜后10日', '最新上榜日期'
  ];

  const rows = allData.map((item: any, index: number) => [
    index + 1,
    item.SECURITY_CODE,
    item.SECURITY_NAME_ABBR,
    item.BILLBOARD_NUMS,
    item.BILLBOARD_NET_AMT,
    item.BILLBOARD_BUY_AMT,
    item.BILLBOARD_SELL_AMT,
    item.BILLBOARD_DEAL_AMT,
    item.ORG_NET_AMT,
    item.ORG_SELL_AMT,
    item.ORG_BUY_AMT,
    item.ORG_SELL_AMT2,
    item.D1_CLOSE_ADJCHRATE,
    item.D2_CLOSE_ADJCHRATE,
    item.D5_CLOSE_ADJCHRATE,
    item.D10_CLOSE_ADJCHRATE,
    item.LATEST_DATE ? new Date(item.LATEST_DATE).toISOString().split('T')[0] : null,
  ]);

  return createDataFrame(columns, rows);
}
