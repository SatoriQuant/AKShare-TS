/**
 * AKShare TypeScript - 东方财富-公告大全
 * https://data.eastmoney.com/notices/hsa/5.html
 */

import { httpGet } from '../utils/httpClient';
import { createDataFrame, DataFrame } from '../utils/dataframe';

/**
 * 内部通用函数 - 获取公告数据
 */
async function fetchNoticeData(
  security?: string,
  symbol: string = '全部',
  beginDate?: string,
  endDate?: string
): Promise<DataFrame> {
  const url = 'https://np-anotice-stock.eastmoney.com/api/security/ann';
  const reportMap: Record<string, string> = {
    '全部': '0',
    '财务报告': '1',
    '融资公告': '2',
    '风险提示': '3',
    '信息变更': '4',
    '重大事项': '5',
    '资产重组': '6',
    '持股变动': '7',
  };

  const params: Record<string, string> = {
    sr: '-1',
    page_size: '100',
    page_index: '1',
    ann_type: 'A',
    client_source: 'web',
    f_node: reportMap[symbol] || '0',
    s_node: '0',
  };

  if (security) params.stock_list = security;
  if (beginDate) params.begin_time = beginDate;
  if (endDate) params.end_time = endDate;

  // First request to get total pages
  const firstData = await httpGet<any>(url, { params });

  if (!firstData?.data?.list) {
    return createDataFrame([], []);
  }

  const totalHits = firstData.data.total_hits || 0;
  const totalPages = Math.ceil(totalHits / 100);
  let allData: any[] = [...firstData.data.list];

  // Fetch remaining pages
  for (let page = 2; page <= totalPages; page++) {
    const pageParams = { ...params, page_index: String(page) };
    const pageData = await httpGet<any>(url, { params: pageParams });
    if (pageData?.data?.list) {
      allData = allData.concat(pageData.data.list);
    }
  }

  const columns = ['代码', '名称', '公告标题', '公告类型', '公告日期', '网址'];
  const rows: any[][] = [];

  for (const item of allData) {
    // Extract stock code
    let stockCode = '';
    let stockName = '';
    if (item.codes && item.codes.length > 0) {
      const codeEntry = item.codes.find((c: any) => c.ann_type?.startsWith('A')) || item.codes[0];
      stockCode = codeEntry.stock_code || '';
      stockName = codeEntry.short_name || '';
    }

    // Extract column name (notice type)
    let noticeType = '';
    if (item.columns && item.columns.length > 0) {
      noticeType = item.columns[0].column_name || '';
    }

    const artCode = item.art_code || '';
    const noticeDate = item.notice_date ? item.notice_date.split(' ')[0] : null;
    const title = item.title || '';
    const detailUrl = `https://data.eastmoney.com/notices/detail/${stockCode}/${artCode}.html`;

    rows.push([stockCode, stockName, title, noticeType, noticeDate, detailUrl]);
  }

  return createDataFrame(columns, rows);
}

/**
 * 东方财富网-数据中心-公告大全-沪深京 A 股公告
 *
 * @param symbol 报告类型: "全部", "重大事项", "财务报告", "融资公告", "风险提示", "资产重组", "信息变更", "持股变动"
 * @param date 日期，格式 "20220511"
 */
export async function stock_notice_report(
  symbol: string = '全部',
  date: string = '20220511'
): Promise<DataFrame> {
  const dateStr = `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6)}`;
  return fetchNoticeData(undefined, symbol, dateStr, dateStr);
}

/**
 * 东方财富网-数据中心-公告大全-个股公告
 *
 * @param security 股票代码，如 "300237"
 * @param symbol 报告类型: "全部", "重大事项", "财务报告", "融资公告", "风险提示", "资产重组", "信息变更", "持股变动"
 * @param beginDate 开始日期，格式 "20250101"
 * @param endDate 结束日期，格式 "20260101"
 */
export async function stock_individual_notice_report(
  security: string,
  symbol: string = '全部',
  beginDate?: string,
  endDate?: string
): Promise<DataFrame> {
  // Convert date format if provided
  const begin = beginDate
    ? `${beginDate.slice(0, 4)}-${beginDate.slice(4, 6)}-${beginDate.slice(6)}`
    : undefined;
  const end = endDate
    ? `${endDate.slice(0, 4)}-${endDate.slice(4, 6)}-${endDate.slice(6)}`
    : undefined;

  return fetchNoticeData(security, symbol, begin, end);
}
