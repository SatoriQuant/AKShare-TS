/**
 * AKShare TypeScript - 巨潮资讯-首页-公告查询-信息披露
 * http://www.cninfo.com.cn/new/commonUrl/pageOfSearch?url=disclosure/list/search
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 巨潮资讯-首页-公告查询-信息披露
 * http://www.cninfo.com.cn/new/commonUrl/pageOfSearch?url=disclosure/list/search
 * @param symbol 股票代码
 * @param date 公告日期，格式 "20240101"
 * @param end_date 结束日期，格式 "20241231"
 * @returns 信息披露数据
 */
export async function stock_disclosure_cninfo(
  symbol: string = '000001',
  date: string = '20240101',
  end_date: string = '20241231'
): Promise<DataFrame> {
  const url = 'http://www.cninfo.com.cn/new/hisAnnouncement/query';
  const params = {
    pageNum: '1',
    pageSize: '30',
    column: 'szse' as string,
    tabName: 'fulltext',
    plate: '',
    stock: '',
    searchkey: '',
    secid: '',
    category: '',
    trade: '',
    seDate: `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6)}~${end_date.slice(0, 4)}-${end_date.slice(4, 6)}-${end_date.slice(6)}`,
    sortName: '',
    sortType: '',
    isHLtitle: 'true',
  };

  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
    'Content-Type': 'application/x-www-form-urlencoded',
    'Accept': 'application/json',
  };

  const data = await httpGet<any>(url, { params, headers });

  if (!data?.announcements || data.announcements.length === 0) {
    return createDataFrame([], []);
  }

  const columns = [
    '代码', '简称', '公告标题', '公告时间', '公告类型',
    '公告链接',
  ];

  const rows = data.announcements.map((item: any) => [
    item.secCode,
    item.secName,
    item.announcementTitle,
    item.announcementTime ? new Date(item.announcementTime).toISOString().split('T')[0] : null,
    item.announcementTypeName,
    `http://static.cninfo.com.cn/${item.adjunctUrl}`,
  ]);

  return createDataFrame(columns, rows);
}
