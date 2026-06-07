/**
 * AKShare TypeScript - 东方财富-个股-主营构成
 * https://emweb.securities.eastmoney.com/PC_HSF10/BusinessAnalysis/Index?type=web&code=SH688041
 */

import { httpGet } from '../utils/httpClient';
import { createDataFrame, DataFrame } from '../utils/dataframe';

/**
 * 东方财富网-个股-主营构成
 *
 * @param symbol 带市场标识的股票代码，如 "SH688041", "SZ000001"
 */
export async function stock_zygc_em(symbol: string = 'SH688041'): Promise<DataFrame> {
  const url = 'https://emweb.securities.eastmoney.com/PC_HSF10/BusinessAnalysis/PageAjax';
  const params = { code: symbol };

  const data = await httpGet<any>(url, { params });

  if (!data?.zygcfx || data.zygcfx.length === 0) {
    return createDataFrame([], []);
  }

  const columns = [
    '股票代码',
    '报告日期',
    '分类类型',
    '主营构成',
    '主营收入',
    '收入比例',
    '主营成本',
    '成本比例',
    '主营利润',
    '利润比例',
    '毛利率',
  ];

  const typeMap: Record<string, string> = {
    '1': '按行业分类',
    '2': '按产品分类',
    '3': '按地区分类',
  };

  const rows = data.zygcfx.map((item: any) => [
    item.SECURITY_CODE,
    item.REPORT_DATE ? item.REPORT_DATE.split(' ')[0] : null,
    typeMap[item.MAINOP_TYPE] || item.MAINOP_TYPE,
    item.ITEM_NAME,
    item.MAIN_BUSINESS_INCOME != null ? Number(item.MAIN_BUSINESS_INCOME) : null,
    item.MBI_RATIO != null ? Number(item.MBI_RATIO) : null,
    item.MAIN_BUSINESS_COST != null ? Number(item.MAIN_BUSINESS_COST) : null,
    item.MBC_RATIO != null ? Number(item.MBC_RATIO) : null,
    item.MAIN_BUSINESS_RPOFIT != null ? Number(item.MAIN_BUSINESS_RPOFIT) : null,
    item.MBR_RATIO != null ? Number(item.MBR_RATIO) : null,
    item.GROSS_RPOFIT_RATIO != null ? Number(item.GROSS_RPOFIT_RATIO) : null,
  ]);

  return createDataFrame(columns, rows);
}
