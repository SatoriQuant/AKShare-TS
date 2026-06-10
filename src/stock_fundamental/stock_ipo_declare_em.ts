/**
 * AKShare TypeScript - 东方财富-首发申报企业信息
 * https://data.eastmoney.com/xg/xg/sbqy.html
 */

import { httpGet } from '../utils/httpClient';
import { createDataFrame, DataFrame } from '../utils/dataframe';

/**
 * 东方财富网-数据中心-新股数据-首发申报企业信息
 * https://data.eastmoney.com/xg/xg/sbqy.html
 */
export async function stock_ipo_declare_em(): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const baseParams: Record<string, string> = {
    sortColumns: 'END_DATE,SECURITY_CODE',
    sortTypes: '-1,-1',
    pageSize: '500',
    pageNumber: '1',
    reportName: 'RPT_IPO_DECORGNEWEST',
    columns: 'DECLARE_ORG,STATE,REG_ADDRESS,RECOMMEND_ORG,LAW_FIRM,ACCOUNT_FIRM,IS_SUBMIT,PREDICT_LISTING_MARKET,END_DATE,INFO_CODE,SECURITY_CODE,ORG_CODE,IS_REGISTER,STATE_CODE,DERIVE_SECURITY_CODE,ORG_CODE_OLD,IS_STATE',
    source: 'WEB',
    client: 'WEB',
  };

  // First request to get total pages
  const firstData = await httpGet<any>(url, { params: baseParams });

  if (!firstData?.result?.data) {
    return createDataFrame([], []);
  }

  const totalPages = firstData.result.pages || 1;
  let allData: any[] = [...firstData.result.data];

  // Fetch remaining pages
  for (let page = 2; page <= totalPages; page++) {
    const pageParams = { ...baseParams, pageNumber: String(page) };
    const pageData = await httpGet<any>(url, { params: pageParams });
    if (pageData?.result?.data) {
      allData = allData.concat(pageData.result.data);
    }
  }

  const columns = [
    '序号', '企业名称', '最新状态', '注册地', '保荐机构',
    '律师事务所', '会计师事务所', '拟上市地点', '更新日期', '招股说明书',
  ];

  const rows = allData.map((item: any, index: number) => [
    index + 1,
    item.DECLARE_ORG,
    item.STATE,
    item.REG_ADDRESS,
    item.RECOMMEND_ORG,
    item.LAW_FIRM,
    item.ACCOUNT_FIRM,
    item.PREDICT_LISTING_MARKET,
    item.END_DATE ? item.END_DATE.split(' ')[0] : null,
    item.INFO_CODE ? `https://pdf.dfcfw.com/pdf/H2_${item.INFO_CODE}_1.pdf` : '',
  ]);

  return createDataFrame(columns, rows);
}
