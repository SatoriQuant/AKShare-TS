/**
 * AKShare TypeScript - 东方财富网-数据中心-特色数据-千股千评
 * https://data.eastmoney.com/stockcomment/
 */

import { httpGet, httpGetText } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 东方财富网-数据中心-特色数据-千股千评
 * https://data.eastmoney.com/stockcomment/
 * @returns 千股千评数据
 */
export async function stock_comment_em(): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    sortColumns: 'SECURITY_CODE',
    sortTypes: '1',
    pageSize: '500',
    pageNumber: '1',
    reportName: 'RPT_DMSK_TS_STOCKNEW',
    quoteColumns: 'f2~01~SECURITY_CODE~CLOSE_PRICE,f8~01~SECURITY_CODE~TURNOVERRATE,f3~01~SECURITY_CODE~CHANGE_RATE,f9~01~SECURITY_CODE~PE_DYNAMIC',
    columns: 'ALL',
    filter: '',
    token: '894050c76af8597a853f5b408b759f5d',
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
    '序号', '代码', '名称', '最新价', '涨跌幅', '换手率',
    '市盈率', '主力成本', '机构参与度', '综合得分', '上升',
    '目前排名', '关注指数', '交易日'
  ];

  const rows = allData.map((item: any, index: number) => [
    index + 1,
    item.SECURITY_CODE,
    item.SECURITY_NAME_ABBR,
    item.CLOSE_PRICE,
    item.CHANGE_RATE,
    item.TURNOVERRATE,
    item.PE_DYNAMIC,
    item.ORG_COST,
    item.ORG_PARTICIPATE,
    item.TOTAL_SCORE,
    item.SCORE_CHANGE,
    item.CURRENT_RANK,
    item.MARKET_FOCUS,
    item.TRADE_DATE ? new Date(item.TRADE_DATE).toISOString().split('T')[0] : null,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 东方财富网-数据中心-特色数据-千股千评-主力控盘-机构参与度
 * https://data.eastmoney.com/stockcomment/stock/600000.html
 * @param symbol 股票代码
 * @returns 主力控盘-机构参与度
 */
export async function stock_comment_detail_zlkp_jgcyd_em(
  symbol: string = '600000'
): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    reportName: 'RPT_DMSK_TS_STOCKEVALUATE',
    filter: `(SECURITY_CODE="${symbol}")`,
    columns: 'ALL',
    source: 'WEB',
    client: 'WEB',
    sortColumns: 'TRADE_DATE',
    sortTypes: '-1',
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.result?.data) {
    return createDataFrame([], []);
  }

  const columns = ['交易日', '机构参与度'];
  const rows = data.result.data.map((item: any) => [
    item.TRADE_DATE ? new Date(item.TRADE_DATE).toISOString().split('T')[0] : null,
    item.ORG_PARTICIPATE ? Number(item.ORG_PARTICIPATE) * 100 : null,
  ]);

  // 按日期排序
  rows.sort((a: any[], b: any[]) => {
    if (!a[0] || !b[0]) return 0;
    return new Date(a[0]).getTime() - new Date(b[0]).getTime();
  });

  return createDataFrame(columns, rows);
}

/**
 * 东方财富网-数据中心-特色数据-千股千评-综合评价-历史评分
 * https://data.eastmoney.com/stockcomment/stock/600000.html
 * @param symbol 股票代码
 * @returns 综合评价-历史评分
 */
export async function stock_comment_detail_zhpj_lspf_em(
  symbol: string = '600000'
): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    filter: `(SECURITY_CODE="${symbol}")`,
    columns: 'ALL',
    source: 'WEB',
    client: 'WEB',
    reportName: 'RPT_STOCK_HISTORYMARK',
    sortColumns: 'DIAGNOSE_DATE',
    sortTypes: '1',
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.result?.data) {
    return createDataFrame([], []);
  }

  const columns = ['交易日', '评分'];
  const rows = data.result.data.map((item: any) => [
    item.DIAGNOSE_DATE ? new Date(item.DIAGNOSE_DATE).toISOString().split('T')[0] : null,
    item.TOTAL_SCORE,
  ]);

  // 按日期排序
  rows.sort((a: any[], b: any[]) => {
    if (!a[0] || !b[0]) return 0;
    return new Date(a[0]).getTime() - new Date(b[0]).getTime();
  });

  return createDataFrame(columns, rows);
}

/**
 * 东方财富网-数据中心-特色数据-千股千评-市场热度-用户关注指数
 * https://data.eastmoney.com/stockcomment/stock/600000.html
 * @param symbol 股票代码
 * @returns 市场热度-用户关注指数
 */
export async function stock_comment_detail_scrd_focus_em(
  symbol: string = '600000'
): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    filter: `(SECURITY_CODE="${symbol}")`,
    columns: 'ALL',
    source: 'WEB',
    client: 'WEB',
    reportName: 'RPT_STOCK_MARKETFOCUS',
    sortColumns: 'TRADE_DATE',
    sortTypes: '-1',
    pageSize: '30',
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.result?.data) {
    return createDataFrame([], []);
  }

  const columns = ['交易日', '用户关注指数'];
  const rows = data.result.data.map((item: any) => [
    item.TRADE_DATE ? new Date(item.TRADE_DATE).toISOString().split('T')[0] : null,
    item.MARKET_FOCUS,
  ]);

  // 按日期排序
  rows.sort((a: any[], b: any[]) => {
    if (!a[0] || !b[0]) return 0;
    return new Date(a[0]).getTime() - new Date(b[0]).getTime();
  });

  return createDataFrame(columns, rows);
}

/**
 * 东方财富网-数据中心-特色数据-千股千评-市场热度-市场参与意愿
 * https://data.eastmoney.com/stockcomment/stock/600000.html
 * @param symbol 股票代码
 * @returns 市场热度-市场参与意愿
 */
export async function stock_comment_detail_scrd_desire_em(
  symbol: string = '600000'
): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const timestamp = Date.now();
  const params = {
    callback: `jQuery11230899775623921407_${timestamp}`,
    filter: `(SECURITY_CODE="${symbol}")`,
    columns: 'ALL',
    source: 'WEB',
    client: 'WEB',
    reportName: 'RPT_STOCK_PARTICIPATION',
    sortColumns: 'TRADE_DATE',
    sortTypes: '-1',
    pageSize: '30',
    _: String(timestamp),
  };

  // Fetch as text since response is JSONP wrapped
  const jsonpText = await httpGetText(url, {
    params,
    headers: {
      'Referer': 'https://data.eastmoney.com/',
      'Accept': '*/*',
    },
  });

  // Extract JSON from JSONP wrapper: jQuery...({...})
  const jsonMatch = jsonpText.match(/\((.*)\)/s);
  if (!jsonMatch) {
    return createDataFrame([], []);
  }

  const data = JSON.parse(jsonMatch[1]);

  if (!data?.result?.data) {
    return createDataFrame([], []);
  }

  const columns = [
    '交易日期', '股票代码', '参与意愿',
    '5日平均参与意愿', '参与意愿变化', '5日平均变化',
  ];

  const rows = data.result.data.map((item: any) => [
    item.TRADE_DATE ? new Date(item.TRADE_DATE).toISOString().split('T')[0] : null,
    String(item.SECURITY_CODE ?? ''),
    String(item.PARTICIPATION_WISH ?? ''),
    String(item.PARTICIPATION_WISH_5DAYS ?? ''),
    String(item.PARTICIPATION_WISH_CHANGE ?? ''),
    String(item.PARTICIPATION_WISH_5DAYSCHANGE ?? ''),
  ]);

  // 按日期排序
  rows.sort((a: any[], b: any[]) => {
    if (!a[0] || !b[0]) return 0;
    return new Date(a[0]).getTime() - new Date(b[0]).getTime();
  });

  return createDataFrame(columns, rows);
}
