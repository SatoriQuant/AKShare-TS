/**
 * AKShare TypeScript - 东方财富网-数据中心-特色数据-高管持股
 * https://data.eastmoney.com/executive/gdzjc.html
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 东方财富网-数据中心-特色数据-高管持股
 * https://data.eastmoney.com/executive/gdzjc.html
 * @param symbol 选择 {"全部", "股东增持", "股东减持"}
 * @returns 高管持股数据
 */
export async function stock_ggcg_em(symbol: string = '全部'): Promise<DataFrame> {
  const symbolMap: Record<string, string> = {
    '全部': '',
    '股东增持': '(DIRECTION="增持")',
    '股东减持': '(DIRECTION="减持")',
  };

  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    sortColumns: 'END_DATE,SECURITY_CODE,EITIME',
    sortTypes: '-1,-1,-1',
    pageSize: '500',
    pageNumber: '1',
    reportName: 'RPT_SHARE_HOLDER_INCREASE',
    quoteColumns: 'f2~01~SECURITY_CODE~NEWEST_PRICE,f3~01~SECURITY_CODE~CHANGE_RATE_QUOTES',
    quoteType: '0',
    columns: 'ALL',
    source: 'WEB',
    client: 'WEB',
    filter: symbolMap[symbol],
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.result?.data) {
    return createDataFrame([], []);
  }

  const totalPage = data.result.pages;
  let allData: any[] = [...data.result.data];

  for (let page = 2; page <= totalPage; page++) {
    const pageParams = { ...params, pageNumber: String(page) };
    const pageData = await httpGet<any>(url, { params: pageParams });
    if (pageData?.result?.data) {
      allData = allData.concat(pageData.result.data);
    }
  }

  const columns = [
    '代码', '名称', '股东名称', '持股变动信息-增减',
    '持股变动信息-变动数量', '持股变动信息-占总股本比例',
    '持股变动信息-占流通股比例', '变动开始日', '变动截止日',
    '变动后持股情况-持股总数', '变动后持股情况-占总股本比例',
    '变动后持股情况-持流通股数', '变动后持股情况-占流通股比例',
    '最新价', '涨跌幅', '公告日',
  ];

  const rows = allData.map((item: any) => [
    item.SECURITY_CODE,
    item.SECURITY_NAME_ABBR,
    item.HOLDER_NAME,
    item.DIRECTION,
    item.CHANGE_SHARES,
    item.HOLD_RATIO,
    item.FREE_HOLD_RATIO,
    item.BEGIN_DATE ? new Date(item.BEGIN_DATE).toISOString().split('T')[0] : null,
    item.END_DATE ? new Date(item.END_DATE).toISOString().split('T')[0] : null,
    item.HOLD_NUM,
    item.HOLD_NUM_RATIO,
    item.FREE_HOLD_NUM,
    item.FREE_HOLD_NUM_RATIO,
    item.NEWEST_PRICE,
    item.CHANGE_RATE_QUOTES,
    item.NOTICE_DATE ? new Date(item.NOTICE_DATE).toISOString().split('T')[0] : null,
  ]);

  return createDataFrame(columns, rows);
}
