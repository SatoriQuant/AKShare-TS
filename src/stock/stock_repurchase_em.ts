/**
 * AKShare TypeScript - 东方财富股票回购数据
 * https://data.eastmoney.com/gphg/hglist.html
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 东方财富-数据中心-股票回购-股票回购数据
 */
export async function stock_repurchase_em(): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    sortColumns: 'UPD,DIM_DATE,DIM_SCODE',
    sortTypes: '-1,-1,-1',
    pageSize: '500',
    pageNumber: '1',
    reportName: 'RPTA_WEB_GETHGLIST_NEW',
    columns: 'ALL',
    source: 'WEB',
  };

  const firstPage = await httpGet<any>(url, { params });
  if (!firstPage?.result?.data) {
    return createDataFrame([], []);
  }

  const totalPages = firstPage.result.pages || 1;
  const allData: any[] = [...firstPage.result.data];

  for (let page = 2; page <= totalPages; page++) {
    const pageParams = { ...params, pageNumber: page.toString() };
    const pageData = await httpGet<any>(url, { params: pageParams });
    if (pageData?.result?.data) {
      allData.push(...pageData.result.data);
    }
  }

  const processMap: Record<string, string> = {
    '001': '董事会预案',
    '002': '股东大会通过',
    '003': '股东大会否决',
    '004': '实施中',
    '005': '停止实施',
    '006': '完成实施',
  };

  const columns = [
    '序号', '股票代码', '股票简称', '最新价',
    '计划回购价格区间', '计划回购数量区间-下限', '计划回购数量区间-上限',
    '占公告前一日总股本比例-下限', '占公告前一日总股本比例-上限',
    '计划回购金额区间-下限', '计划回购金额区间-上限',
    '回购起始时间', '实施进度',
    '已回购股份价格区间-下限', '已回购股份价格区间-上限',
    '已回购股份数量', '已回购金额', '最新公告日期',
  ];

  const rows = allData.map((item: any, index: number) => [
    index + 1,
    item.DIM_SCODE,
    item.SECURITYSHORTNAME,
    item.NEWPRICE,
    item.REPURPRICECAP,
    item.REPURNUMLOWER,
    item.REPURNUMCAP,
    item.ZSZXX,
    item.ZSZSX,
    item.JEXX,
    item.JESX,
    item.DIM_TRADEDATE,
    processMap[item.REPURPROGRESS] || item.REPURPROGRESS,
    item.REPURPRICELOWER1,
    item.REPURPRICECAP1,
    item.REPURNUM,
    item.REPURAMOUNT,
    item.UPDATEDATE,
  ]);

  return createDataFrame(columns, rows);
}
