/**
 * AKShare TypeScript - 巨潮资讯-首页-数据-预约披露
 * http://www.cninfo.com.cn/new/commonUrl?url=data/yypl
 */

import { httpGet, httpPost } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 巨潮资讯-首页-数据-预约披露
 * http://www.cninfo.com.cn/new/commonUrl?url=data/yypl
 * @param market 选择 {"沪深京", "深市", "深主板", "创业板", "沪市", "沪主板", "科创板", "北交所"}
 * @param period 报告期，如 "2021年报"
 * @returns 预约披露数据
 */
export async function stock_report_disclosure(
  market: string = '沪深京',
  period: string = '2021年报'
): Promise<DataFrame> {
  const marketMap: Record<string, string> = {
    '沪深京': 'szsh',
    '深市': 'sz',
    '深主板': 'szmb',
    '创业板': 'szcn',
    '沪市': 'sh',
    '沪主板': 'shmb',
    '科创板': 'shkcp',
    '北交所': 'bj',
  };

  const year = period.slice(0, 4);
  const periodMap: Record<string, string> = {
    [`${year}一季`]: `${year}-03-31`,
    [`${year}半年报`]: `${year}-06-30`,
    [`${year}三季`]: `${year}-09-30`,
    [`${year}年报`]: `${year}-12-31`,
  };

  const url = 'http://www.cninfo.com.cn/new/information/getPrbookInfo';
  const params = {
    sectionTime: periodMap[period],
    firstTime: '',
    lastTime: '',
    market: marketMap[market],
    stockCode: '',
    orderClos: '',
    isDesc: '',
    pagesize: '10000',
    pagenum: '1',
  };

  const data = await httpPost<any>(url, null, { params });

  if (!data?.prbookinfos || data.prbookinfos.length === 0) {
    return createDataFrame([], []);
  }

  const columns = [
    '股票代码', '股票简称', '首次预约', '初次变更',
    '二次变更', '三次变更', '实际披露',
  ];

  const rows = data.prbookinfos.map((item: any) => [
    item.stockCode,
    item.stockName,
    item.firstDate,
    item.firstChangeDate,
    item.secondChangeDate,
    item.thirdChangeDate,
    item.actualDate,
  ]);

  return createDataFrame(columns, rows);
}
