/**
 * AKShare TypeScript - 东方财富网-数据中心-研究报告-个股研报
 * https://data.eastmoney.com/report/stock.jshtml
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 东方财富网-数据中心-研究报告-个股研报
 * https://data.eastmoney.com/report/stock.jshtml
 * @param symbol 个股代码
 * @returns 个股研报数据
 */
export async function stock_research_report_em(symbol: string = '000001'): Promise<DataFrame> {
  const url = 'https://reportapi.eastmoney.com/report/list';
  const nextYear = new Date().getFullYear() + 1;

  const params = {
    industryCode: '*',
    pageSize: '5000',
    industry: '*',
    rating: '*',
    ratingChange: '*',
    beginTime: '2000-01-01',
    endTime: `${nextYear}-01-01`,
    pageNo: '1',
    fields: '',
    qType: '0',
    orgCode: '',
    code: symbol,
    rcode: '',
    p: '1',
    pageNum: '1',
    pageNumber: '1',
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.data || data.data.length === 0) {
    return createDataFrame([], []);
  }

  const currentYear = data.currentYear;
  const totalPage = data.TotalPage;
  let allData: any[] = [...data.data];

  for (let page = 2; page <= totalPage; page++) {
    const pageParams = {
      ...params,
      pageNo: String(page),
      p: String(page),
      pageNum: String(page),
      pageNumber: String(page),
    };
    const pageData = await httpGet<any>(url, { params: pageParams });
    if (pageData?.data) {
      allData = allData.concat(pageData.data);
    }
  }

  const columns = [
    '序号', '股票代码', '股票简称', '报告名称', '东财评级', '机构', '近一月个股研报数',
    `${currentYear}-盈利预测-收益`, `${currentYear}-盈利预测-市盈率`,
    `${currentYear + 1}-盈利预测-收益`, `${currentYear + 1}-盈利预测-市盈率`,
    `${currentYear + 2}-盈利预测-收益`, `${currentYear + 2}-盈利预测-市盈率`,
    '行业', '日期', '报告PDF链接',
  ];

  const rows = allData.map((item: any, index: number) => [
    String(index + 1),
    item.stockCode,
    item.stockName,
    item.title,
    item.emRatingName,
    item.orgSName,
    item.count != null ? String(item.count) : null,
    item.predictThisYearEps != null ? String(item.predictThisYearEps) : null,
    item.predictThisYearPe != null ? String(item.predictThisYearPe) : null,
    item.predictNextYearEps != null ? String(item.predictNextYearEps) : null,
    item.predictNextYearPe != null ? String(item.predictNextYearPe) : null,
    item.predictNextTwoYearEps != null ? String(item.predictNextTwoYearEps) : null,
    item.predictNextTwoYearPe != null ? String(item.predictNextTwoYearPe) : null,
    item.indvInduName,
    item.publishDate ? new Date(item.publishDate).toISOString().split('T')[0] : null,
    item.infoCode ? `https://pdf.dfcfw.com/pdf/H3_${item.infoCode}_1.pdf` : null,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 东方财富网-数据中心-研究报告-机构研报
 * https://data.eastmoney.com/report/list.html
 * @param symbol 机构代码，如 "8000001" 为东方财富证券
 * @returns 机构研报数据
 */
export async function stock_institute_recommend_em(symbol: string = '8000001'): Promise<DataFrame> {
  const url = 'https://reportapi.eastmoney.com/report/list';
  const nextYear = new Date().getFullYear() + 1;

  const params = {
    industryCode: '*',
    pageSize: '5000',
    industry: '*',
    rating: '*',
    ratingChange: '*',
    beginTime: '2000-01-01',
    endTime: `${nextYear}-01-01`,
    pageNo: '1',
    fields: '',
    qType: '1',
    orgCode: symbol,
    code: '',
    rcode: '',
    p: '1',
    pageNum: '1',
    pageNumber: '1',
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.data || data.data.length === 0) {
    return createDataFrame([], []);
  }

  const currentYear = data.currentYear;
  const totalPage = data.TotalPage;
  let allData: any[] = [...data.data];

  for (let page = 2; page <= totalPage; page++) {
    const pageParams = {
      ...params,
      pageNo: String(page),
      p: String(page),
      pageNum: String(page),
      pageNumber: String(page),
    };
    const pageData = await httpGet<any>(url, { params: pageParams });
    if (pageData?.data) {
      allData = allData.concat(pageData.data);
    }
  }

  const columns = [
    '序号', '股票代码', '股票简称', '报告名称', '东财评级', '机构', '近一月个股研报数',
    `${currentYear}-盈利预测-收益`, `${currentYear}-盈利预测-市盈率`,
    `${currentYear + 1}-盈利预测-收益`, `${currentYear + 1}-盈利预测-市盈率`,
    `${currentYear + 2}-盈利预测-收益`, `${currentYear + 2}-盈利预测-市盈率`,
    '行业', '日期', '报告PDF链接',
  ];

  const rows = allData.map((item: any, index: number) => [
    String(index + 1),
    item.stockCode,
    item.stockName,
    item.title,
    item.emRatingName,
    item.orgSName,
    item.count != null ? String(item.count) : null,
    item.predictThisYearEps != null ? String(item.predictThisYearEps) : null,
    item.predictThisYearPe != null ? String(item.predictThisYearPe) : null,
    item.predictNextYearEps != null ? String(item.predictNextYearEps) : null,
    item.predictNextYearPe != null ? String(item.predictNextYearPe) : null,
    item.predictNextTwoYearEps != null ? String(item.predictNextTwoYearEps) : null,
    item.predictNextTwoYearPe != null ? String(item.predictNextTwoYearPe) : null,
    item.indvInduName,
    item.publishDate ? new Date(item.publishDate).toISOString().split('T')[0] : null,
    item.infoCode ? `https://pdf.dfcfw.com/pdf/H3_${item.infoCode}_1.pdf` : null,
  ]);

  return createDataFrame(columns, rows);
}
