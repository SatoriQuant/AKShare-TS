/**
 * AKShare TypeScript - 东方财富网-数据中心-重大合同-重大合同明细
 * https://data.eastmoney.com/zdht/mx.html
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 东方财富网-数据中心-重大合同-重大合同明细
 * https://data.eastmoney.com/zdht/mx.html
 * @param start_date 开始日期，格式 "20200819"
 * @param end_date 结束日期，格式 "20230819"
 * @returns 重大合同明细数据
 */
export async function stock_zdhtmx_em(
  start_date: string = '20200819',
  end_date: string = '20230819'
): Promise<DataFrame> {
  const startFormatted = `${start_date.slice(0, 4)}-${start_date.slice(4, 6)}-${start_date.slice(6)}`;
  const endFormatted = `${end_date.slice(0, 4)}-${end_date.slice(4, 6)}-${end_date.slice(6)}`;

  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    sortColumns: 'DIM_RDATE',
    sortTypes: '-1',
    pageSize: '500',
    pageNumber: '1',
    columns: 'ALL',
    token: '894050c76af8597a853f5b408b759f5d',
    reportName: 'RPTA_WEB_ZDHT_LIST',
    filter: `(DIM_RDATE>='${startFormatted}')(DIM_RDATE<='${endFormatted}')`,
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
    '序号', '股票代码', '股票简称', '签署主体', '签署主体-与上市公司关系',
    '其他签署方', '其他签署方-与上市公司关系', '合同类型', '合同名称', '合同金额',
    '上年度营业收入', '占上年度营业收入比例', '最新财务报表的营业收入',
    '签署日期', '公告日期',
  ];

  const rows = allData.map((item: any, index: number) => [
    String(index + 1),
    item.SECURITYCODE,
    item.SECURITYSHORTNAME,
    item.SIGNATORY,
    item.SIGNATORYRELNAME,
    item.COUNTERPARTY,
    item.COUNTERPARTYRELNAME,
    item.CONTRACTTYPENAME,
    item.CONTRACTNAME,
    item.AMOUNTS != null ? String(item.AMOUNTS) : null,
    item.SNDYYSR != null ? String(item.SNDYYSR) : null,
    item.ZSNDYYSRBL != null ? String(item.ZSNDYYSRBL) : null,
    item.OPERATEREVE != null ? String(item.OPERATEREVE) : null,
    item.SIGNDATE ? new Date(item.SIGNDATE).toISOString().split('T')[0] : null,
    item.DIM_RDATE ? new Date(item.DIM_RDATE).toISOString().split('T')[0] : null,
  ]);

  return createDataFrame(columns, rows);
}
