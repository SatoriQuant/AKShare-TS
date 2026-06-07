/**
 * AKShare TypeScript - 互动易-提问与回答
 * https://irm.cninfo.com.cn/
 */

import { httpGet, httpPost } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 互动易-提问与回答
 * https://irm.cninfo.com.cn/
 * @param symbol 股票代码
 * @returns 提问与回答数据
 */
export async function stock_irm_cninfo(symbol: string = '002594'): Promise<DataFrame> {
  // First get orgId
  const searchUrl = 'https://irm.cninfo.com.cn/newircs/index/queryKeyboardInfo';
  const searchParams = {
    _t: String(Date.now()),
  };
  const searchData = { keyWord: symbol };

  let orgId = '';
  try {
    const searchResult = await httpPost<any>(searchUrl, searchData, { params: searchParams });
    if (searchResult?.data?.[0]?.secid) {
      orgId = searchResult.data[0].secid;
    }
  } catch {
    return createDataFrame([], []);
  }

  const url = 'https://irm.cninfo.com.cn/newircs/company/question';
  const params = {
    _t: String(Date.now()),
    stockcode: symbol,
    orgId: orgId,
    pageSize: '1000',
    pageNum: '1',
    keyWord: '',
    startDay: '',
    endDay: '',
  };

  const data = await httpPost<any>(url, null, { params });

  if (!data?.rows || data.rows.length === 0) {
    return createDataFrame([], []);
  }

  const columns = [
    '股票代码', '公司简称', '行业', '问题', '提问者',
    '提问时间', '回答内容', '来源',
  ];

  const rows = data.rows.map((item: any) => [
    item.stockCode,
    item.companyShortName,
    item.trade,
    item.mainContent,
    item.authorName,
    item.pubDate,
    item.attachedContent,
    item.pubClient,
  ]);

  return createDataFrame(columns, rows);
}
