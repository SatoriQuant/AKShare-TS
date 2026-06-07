/**
 * AKShare TypeScript - 东方财富-盈利预测
 * https://data.eastmoney.com/report/profitforecast.jshtml
 */

import { httpGet } from '../utils/httpClient';
import { createDataFrame, DataFrame } from '../utils/dataframe';

/**
 * 东方财富网-数据中心-研究报告-盈利预测
 *
 * @param symbol 行业板块名称，如 "船舶制造"；空字符串表示获取全部数据
 */
export async function stock_profit_forecast_em(symbol: string = ''): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const baseParams: Record<string, string> = {
    reportName: 'RPT_WEB_RESPREDICT',
    columns: 'WEB_RESPREDICT',
    pageNumber: '1',
    pageSize: '500',
    sortTypes: '-1',
    sortColumns: 'RATING_ORG_NUM',
    p: '1',
    pageNo: '1',
    pageNum: '1',
  };

  if (symbol) {
    baseParams.filter = `(INDUSTRY_BOARD="${symbol}")`;
  }

  // First request to get total pages
  const firstData = await httpGet<any>(url, { params: baseParams });

  if (!firstData?.result?.data) {
    return createDataFrame([], []);
  }

  const totalPages = firstData.result.pages || 1;
  let allData: any[] = [...firstData.result.data];

  // Fetch remaining pages
  for (let page = 2; page <= totalPages; page++) {
    const pageParams = {
      ...baseParams,
      pageNumber: String(page),
      p: String(page),
      pageNo: String(page),
      pageNum: String(page),
    };
    const pageData = await httpGet<any>(url, { params: pageParams });
    if (pageData?.result?.data) {
      allData = allData.concat(pageData.result.data);
    }
  }

  if (allData.length === 0) {
    return createDataFrame([], []);
  }

  // Determine year labels from data
  const year1 = allData[0]?.YEAR1 || '';
  const year2 = allData[0]?.YEAR2 || '';
  const year3 = allData[0]?.YEAR3 || '';
  const year4 = allData[0]?.YEAR4 || '';

  const columns = [
    '序号', '代码', '名称', '研报数',
    '机构投资评级(近六个月)-买入', '机构投资评级(近六个月)-增持',
    '机构投资评级(近六个月)-中性', '机构投资评级(近六个月)-减持',
    '机构投资评级(近六个月)-卖出',
    `${year1}预测每股收益`, `${year2}预测每股收益`,
    `${year3}预测每股收益`, `${year4}预测每股收益`,
  ];

  // Sort by RATING_ORG_NUM descending
  allData.sort((a: any, b: any) => (b.RATING_ORG_NUM || 0) - (a.RATING_ORG_NUM || 0));

  const rows = allData.map((item: any, index: number) => [
    index + 1,
    item.SECURITY_CODE,
    item.SECURITY_NAME_ABBR,
    item.RATING_ORG_NUM != null ? Number(item.RATING_ORG_NUM) : 0,
    item.RATING_BUY_NUM != null ? Number(item.RATING_BUY_NUM) : 0,
    item.RATING_OVERWEIGHT_NUM != null ? Number(item.RATING_OVERWEIGHT_NUM) : 0,
    item.RATING_NEUTRAL_NUM != null ? Number(item.RATING_NEUTRAL_NUM) : 0,
    item.RATING_UNDERWEIGHT_NUM != null ? Number(item.RATING_UNDERWEIGHT_NUM) : 0,
    item.RATING_SELL_NUM != null ? Number(item.RATING_SELL_NUM) : 0,
    item.EPS1 != null ? Number(item.EPS1) : null,
    item.EPS2 != null ? Number(item.EPS2) : null,
    item.EPS3 != null ? Number(item.EPS3) : null,
    item.EPS4 != null ? Number(item.EPS4) : null,
  ]);

  return createDataFrame(columns, rows);
}
