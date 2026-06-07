/**
 * AKShare TypeScript - 东方财富网-数据中心-特色数据-一致行动人
 * https://data.eastmoney.com/yzxdr/
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 东方财富网-数据中心-特色数据-一致行动人
 * https://data.eastmoney.com/yzxdr/
 * @param date 每年的季度末时间点，格式 "20240930"
 * @returns 一致行动人数据
 */
export async function stock_yzxdr_em(date: string = '20240930'): Promise<DataFrame> {
  const dateFormatted = `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6)}`;

  const url = 'https://datacenter.eastmoney.com/api/data/get';
  const params = {
    type: 'RPTA_WEB_YZXDRINDEX',
    sty: 'ALL',
    source: 'WEB',
    p: '1',
    ps: '500',
    st: 'noticedate',
    sr: '-1',
    var: 'mwUyirVm',
    filter: `(enddate='${dateFormatted}')`,
    rt: '53575609',
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.result?.data) {
    return createDataFrame([], []);
  }

  const totalPage = data.result.pages;
  let allData: any[] = [...data.result.data];

  for (let page = 2; page <= totalPage; page++) {
    const pageParams = { ...params, p: String(page) };
    const pageData = await httpGet<any>(url, { params: pageParams });
    if (pageData?.result?.data) {
      allData = allData.concat(pageData.result.data);
    }
  }

  const columns = [
    '序号', '一致行动人', '股票代码', '股票简称', '股东排名',
    '持股数量', '持股比例', '持股数量变动', '行业',
    '数据日期', '公告日期',
  ];

  const rows = allData.map((item: any, index: number) => [
    index + 1,
    item.SECURITY_CODE,
    item.SECURITY_NAME_ABBR,
    item.HOLDER_NAME,
    item.HOLDER_RANK,
    item.HOLD_NUM,
    item.HOLD_RATIO,
    item.HOLD_NUM_CHANGE,
    item.INDUSTRY,
    item.END_DATE ? new Date(item.END_DATE).toISOString().split('T')[0] : null,
    item.NOTICE_DATE ? new Date(item.NOTICE_DATE).toISOString().split('T')[0] : null,
  ]);

  return createDataFrame(columns, rows);
}
