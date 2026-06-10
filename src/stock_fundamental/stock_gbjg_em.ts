/**
 * AKShare TypeScript - 东方财富-A股-股本结构
 * https://emweb.securities.eastmoney.com/pc_hsf10/pages/index.html?type=web&code=SH603392&color=b#/gbjg/gbjg
 */

import { httpGet } from '../utils/httpClient';
import { createDataFrame, DataFrame } from '../utils/dataframe';

/**
 * 东方财富-A股数据-股本结构
 *
 * @param symbol 股票代码（带市场标识），如 "603392.SH"
 */
export async function stock_zh_a_gbjg_em(symbol: string = '603392.SH'): Promise<DataFrame> {
  const url = 'https://datacenter.eastmoney.com/securities/api/data/v1/get';
  const params = {
    reportName: 'RPT_F10_EH_EQUITY',
    columns: 'SECUCODE,SECURITY_CODE,END_DATE,TOTAL_SHARES,LIMITED_SHARES,LIMITED_OTHARS,LIMITED_DOMESTIC_NATURAL,LIMITED_STATE_LEGAL,LIMITED_OVERSEAS_NOSTATE,LIMITED_OVERSEAS_NATURAL,UNLIMITED_SHARES,LISTED_A_SHARES,B_FREE_SHARE,H_FREE_SHARE,FREE_SHARES,LIMITED_A_SHARES,NON_FREE_SHARES,LIMITED_B_SHARES,OTHER_FREE_SHARES,LIMITED_STATE_SHARES,LIMITED_DOMESTIC_NOSTATE,LOCK_SHARES,LIMITED_FOREIGN_SHARES,LIMITED_H_SHARES,SPONSOR_SHARES,STATE_SPONSOR_SHARES,SPONSOR_SOCIAL_SHARES,RAISE_SHARES,RAISE_STATE_SHARES,RAISE_DOMESTIC_SHARES,RAISE_OVERSEAS_SHARES,CHANGE_REASON',
    quoteColumns: '',
    filter: `(SECUCODE="${symbol}")`,
    pageNumber: '1',
    pageSize: '20',
    sortTypes: '-1',
    sortColumns: 'END_DATE',
    source: 'HSF10',
    client: 'PC',
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.result?.data) {
    return createDataFrame([], []);
  }

  const columns = [
    '变更日期', '总股本', '流通受限股份', '其他内资持股(受限)',
    '境内法人持股(受限)', '境内自然人持股(受限)', '已流通股份',
    '已上市流通A股', '变动原因',
  ];

  const rows = data.result.data.map((item: any) => [
    item.END_DATE ? item.END_DATE.split(' ')[0] : null,
    item.TOTAL_SHARES != null ? Number(item.TOTAL_SHARES) : null,
    item.LIMITED_A_SHARES != null ? Number(item.LIMITED_A_SHARES) : null,
    item.LIMITED_OTHARS != null ? Number(item.LIMITED_OTHARS) : null,
    item.LIMITED_DOMESTIC_NOSTATE != null ? Number(item.LIMITED_DOMESTIC_NOSTATE) : null,
    item.LIMITED_DOMESTIC_NATURAL != null ? Number(item.LIMITED_DOMESTIC_NATURAL) : null,
    item.FREE_SHARES != null ? Number(item.FREE_SHARES) : null,
    item.LISTED_A_SHARES != null ? Number(item.LISTED_A_SHARES) : null,
    item.CHANGE_REASON,
  ]);

  return createDataFrame(columns, rows);
}
