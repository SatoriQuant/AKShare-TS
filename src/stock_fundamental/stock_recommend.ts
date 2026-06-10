/**
 * AKShare TypeScript - 新浪财经-机构推荐池
 * http://stock.finance.sina.com.cn/stock/go.php/vIR_RatingNewest/index.phtml
 */

import { httpGet } from '../utils/httpClient';
import { createDataFrame, DataFrame } from '../utils/dataframe';

/**
 * 新浪财经-机构推荐池-最新投资评级
 * 使用东方财富数据中心API
 *
 * @param symbol 评级类型:
 *   '最新投资评级', '上调评级股票', '下调评级股票', '股票综合评级',
 *   '首次评级股票', '目标涨幅排名', '机构关注度', '行业关注度', '投资评级选股'
 */
export async function stock_institute_recommend(
  symbol: string = '投资评级选股'
): Promise<DataFrame> {
  // Map symbol to eastmoney rating type
  const ratingMap: Record<string, string> = {
    '最新投资评级': '',
    '上调评级股票': '1',
    '下调评级股票': '2',
    '股票综合评级': '3',
    '首次评级股票': '4',
    '目标涨幅排名': '5',
    '机构关注度': '6',
    '行业关注度': '7',
    '投资评级选股': '',
  };

  const url = 'https://reportapi.eastmoney.com/report/list';
  const nextYear = new Date().getFullYear() + 1;

  const params = {
    industryCode: '*',
    pageSize: '5000',
    industry: '*',
    rating: ratingMap[symbol] ?? '',
    ratingChange: '*',
    beginTime: '2000-01-01',
    endTime: `${nextYear}-01-01`,
    pageNo: '1',
    fields: '',
    qType: '0',
    orgCode: '',
    code: '',
    rcode: '',
    p: '1',
    pageNum: '1',
    pageNumber: '1',
  };

  try {
    const data = await httpGet<any>(url, { params });

    if (!data?.data || data.data.length === 0) {
      return createDataFrame([], []);
    }

    const currentYear = data.currentYear;

    // Match Python column names from Sina API
    const columns = [
      '股票代码', '股票名称', '最新评级', '目标价', '评级日期', '综合评级', '平均涨幅', '行业',
    ];

    const rows = data.data.map((item: any) => [
      String(item.stockCode ?? ''),
      String(item.stockName ?? ''),
      String(item.emRatingName ?? ''),
      String(item.predictThisYearEps ?? ''),
      String(item.publishDate ? item.publishDate.split(' ')[0] : ''),
      String(item.sRatingName ?? ''),
      String(item.predictThisYearPe ?? ''),
      String(item.industryName ?? ''),
    ]);

    return createDataFrame(columns, rows);
  } catch (error) {
    return createDataFrame([], []);
  }
}

/**
 * 新浪财经-机构推荐池-股票评级记录
 * 使用东方财富数据中心API
 *
 * @param symbol 股票代码，如 "000001"
 */
export async function stock_institute_recommend_detail(
  symbol: string = '000001'
): Promise<DataFrame> {
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

  try {
    const data = await httpGet<any>(url, {
      params,
      headers: {
        'Referer': 'https://data.eastmoney.com/',
      },
    });

    if (!data?.data || data.data.length === 0) {
      return createDataFrame([], []);
    }

    // Match Python column names from Sina API
    const columns = [
      '股票代码', '股票名称', '目标价', '最新评级', '评级机构', '分析师', '行业', '评级日期',
    ];

    const rows = data.data.map((item: any) => [
      String(item.stockCode ?? ''),
      String(item.stockName ?? ''),
      String(item.predictThisYearEps ?? ''),
      String(item.emRatingName ?? ''),
      String(item.orgSName ?? ''),
      String(item.researcher ?? ''),
      String(item.industryName ?? ''),
      String(item.publishDate ? item.publishDate.split(' ')[0] : ''),
    ]);

    return createDataFrame(columns, rows);
  } catch (error) {
    return createDataFrame([], []);
  }
}
