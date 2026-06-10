/**
 * AKShare TypeScript - 东方财富-注册制审核
 * https://data.eastmoney.com/xg/ipo/
 */

import { httpGet } from '../utils/httpClient';
import { createDataFrame, DataFrame } from '../utils/dataframe';

/**
 * 通用的 IPO 审核信息获取函数
 */
async function fetchRegisterData(filter?: string): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const baseParams: Record<string, string> = {
    sortColumns: 'UPDATE_DATE,ORG_CODE',
    sortTypes: '-1,-1',
    pageSize: '500',
    pageNumber: '1',
    reportName: 'RPT_IPO_INFOALLNEW',
    columns: 'SECURITY_CODE,STATE,REG_ADDRESS,INFO_CODE,CSRC_INDUSTRY,ACCEPT_DATE,DECLARE_ORG,PREDICT_LISTING_MARKET,LAW_FIRM,ACCOUNT_FIRM,ORG_CODE,UPDATE_DATE,RECOMMEND_ORG,IS_REGISTRATION',
    source: 'WEB',
    client: 'WEB',
  };

  if (filter) {
    baseParams.filter = filter;
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
    const pageParams = { ...baseParams, pageNumber: String(page) };
    const pageData = await httpGet<any>(url, { params: pageParams });
    if (pageData?.result?.data) {
      allData = allData.concat(pageData.result.data);
    }
  }

  const columns = [
    '序号', '企业名称', '最新状态', '注册地', '行业',
    '保荐机构', '律师事务所', '会计师事务所', '更新日期',
    '受理日期', '拟上市地点', '招股说明书',
  ];

  const rows = allData.map((item: any, index: number) => [
    index + 1,
    item.DECLARE_ORG,
    item.STATE,
    item.REG_ADDRESS,
    item.CSRC_INDUSTRY,
    item.RECOMMEND_ORG,
    item.LAW_FIRM,
    item.ACCOUNT_FIRM,
    item.UPDATE_DATE ? item.UPDATE_DATE.split(' ')[0] : null,
    item.ACCEPT_DATE ? item.ACCEPT_DATE.split(' ')[0] : null,
    item.PREDICT_LISTING_MARKET,
    item.INFO_CODE ? `https://pdf.dfcfw.com/pdf/H2_${item.INFO_CODE}_1.pdf` : '',
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 东方财富网-数据中心-新股数据-IPO审核信息-全部
 * https://data.eastmoney.com/xg/ipo/
 */
export async function stock_register_all_em(): Promise<DataFrame> {
  return fetchRegisterData();
}

/**
 * 东方财富网-数据中心-新股数据-IPO审核信息-科创板
 * https://data.eastmoney.com/xg/ipo/
 */
export async function stock_register_kcb(): Promise<DataFrame> {
  return fetchRegisterData('(PREDICT_LISTING_MARKET="科创板")');
}

/**
 * 东方财富网-数据中心-新股数据-IPO审核信息-创业板
 * https://data.eastmoney.com/xg/ipo/
 */
export async function stock_register_cyb(): Promise<DataFrame> {
  return fetchRegisterData('(PREDICT_LISTING_MARKET="创业板")');
}

/**
 * 东方财富网-数据中心-新股数据-IPO审核信息-北交所
 * https://data.eastmoney.com/xg/ipo/
 */
export async function stock_register_bj(): Promise<DataFrame> {
  return fetchRegisterData('(PREDICT_LISTING_MARKET="北交所")');
}

/**
 * 东方财富网-数据中心-新股数据-IPO审核信息-上海主板
 * https://data.eastmoney.com/xg/ipo/
 */
export async function stock_register_sh(): Promise<DataFrame> {
  return fetchRegisterData('(PREDICT_LISTING_MARKET="沪主板")');
}

/**
 * 东方财富网-数据中心-新股数据-IPO审核信息-深圳主板
 * https://data.eastmoney.com/xg/ipo/
 */
export async function stock_register_sz(): Promise<DataFrame> {
  return fetchRegisterData('(PREDICT_LISTING_MARKET="深主板")');
}

/**
 * 东方财富网-数据中心-新股数据-IPO审核信息-达标企业
 * https://data.eastmoney.com/xg/cyb/
 */
export async function stock_register_db(): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const baseParams: Record<string, string> = {
    sortColumns: 'NOTICE_DATE,SECURITY_CODE',
    sortTypes: '-1,-1',
    pageSize: '500',
    pageNumber: '1',
    reportName: 'RPT_KCB_IPO',
    columns: 'KCB_LB',
    source: 'WEB',
    client: 'WEB',
    filter: '(ORG_TYPE_CODE="03")',
  };

  const firstData = await httpGet<any>(url, { params: baseParams });

  if (!firstData?.result?.data) {
    return createDataFrame([], []);
  }

  const totalPages = firstData.result.pages || 1;
  let allData: any[] = [...firstData.result.data];

  for (let page = 2; page <= totalPages; page++) {
    const pageParams = { ...baseParams, pageNumber: String(page) };
    const pageData = await httpGet<any>(url, { params: pageParams });
    if (pageData?.result?.data) {
      allData = allData.concat(pageData.result.data);
    }
  }

  const columns = ['序号', '企业名称'];
  const rows = allData.map((item: any, index: number) => [
    index + 1,
    item.ORG_NAME,
  ]);

  return createDataFrame(columns, rows);
}
