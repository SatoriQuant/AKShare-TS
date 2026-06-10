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
 *
 * Uses POST requests with proper headers (same as Python AKShare).
 *
 * @param symbol 股票代码
 * @returns 提问与回答数据
 */
export async function stock_irm_cninfo(symbol: string = '002594'): Promise<DataFrame> {
  try {
    // First get orgId
    const searchUrl = 'https://irm.cninfo.com.cn/newircs/index/queryKeyboardInfo';
    const searchParams = {
      _t: String(Date.now()),
    };
    const searchData = { keyWord: symbol };

    let orgId = '';
    try {
      const searchResult = await httpPost<any>(searchUrl, searchData, {
        params: searchParams,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      if (searchResult?.data?.[0]?.secid) {
        orgId = searchResult.data[0].secid;
      }
    } catch {
      return createDataFrame([], []);
    }

    if (!orgId) {
      return createDataFrame([], []);
    }

    // Then get Q&A data with pagination
    const url = 'https://irm.cninfo.com.cn/newircs/company/question';
    const sourceMap: Record<string, string> = {
      '2': 'APP',
      '5': '公众号',
      '4': '网站',
    };

    const allRows: any[][] = [];
    let totalPage = 1;

    // First request to get total pages
    const firstParams: Record<string, string> = {
      _t: String(Date.now()),
      stockcode: symbol,
      orgId: orgId,
      pageSize: '1000',
      pageNum: '1',
      keyWord: '',
      startDay: '',
      endDay: '',
    };

    const firstData = await httpPost<any>(url, null, {
      params: firstParams,
    });

    if (firstData?.totalPage) {
      totalPage = Math.min(parseInt(firstData.totalPage), 10);
    }

    // Process first page
    if (firstData?.rows) {
      for (const item of firstData.rows) {
        const source = sourceMap[String(item.pubClient)] || '网站';
        const trade = Array.isArray(item.trade) ? item.trade[0] : item.trade;
        const boardType = Array.isArray(item.boardType) ? item.boardType[0] : item.boardType;

        // Convert timestamps to date strings
        let pubDate = '';
        if (item.pubDate) {
          const d = new Date(item.pubDate);
          if (!isNaN(d.getTime())) {
            pubDate = d.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/\//g, '-');
          }
        }
        let updateDate = '';
        if (item.updateDate) {
          const d = new Date(item.updateDate);
          if (!isNaN(d.getTime())) {
            updateDate = d.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/\//g, '-');
          }
        }

        allRows.push([
          item.stockCode,
          item.companyShortName,
          trade,
          boardType,
          item.mainContent,
          item.authorName,
          source,
          pubDate,
          updateDate,
          item.author,
          item.indexId,
          item.attachedId,
          item.attachedContent || '',
          item.attachedAuthor || '',
        ]);
      }
    }

    // Fetch remaining pages
    for (let page = 2; page <= totalPage; page++) {
      const pageParams: Record<string, string> = {
        _t: String(Date.now()),
        stockcode: symbol,
        orgId: orgId,
        pageSize: '1000',
        pageNum: String(page),
        keyWord: '',
        startDay: '',
        endDay: '',
      };

      try {
        const pageData = await httpPost<any>(url, null, {
          params: pageParams,
        });

        if (pageData?.rows) {
          for (const item of pageData.rows) {
            const source = sourceMap[String(item.pubClient)] || '网站';
            const trade = Array.isArray(item.trade) ? item.trade[0] : item.trade;
            const boardType = Array.isArray(item.boardType) ? item.boardType[0] : item.boardType;

            let pubDate = '';
            if (item.pubDate) {
              const d = new Date(item.pubDate);
              if (!isNaN(d.getTime())) {
                pubDate = d.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/\//g, '-');
              }
            }
            let updateDate = '';
            if (item.updateDate) {
              const d = new Date(item.updateDate);
              if (!isNaN(d.getTime())) {
                updateDate = d.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/\//g, '-');
              }
            }

            allRows.push([
              item.stockCode,
              item.companyShortName,
              trade,
              boardType,
              item.mainContent,
              item.authorName,
              source,
              pubDate,
              updateDate,
              item.author,
              item.indexId,
              item.attachedId,
              item.attachedContent || '',
              item.attachedAuthor || '',
            ]);
          }
        }
      } catch {
        // Skip failed pages
      }
    }

    if (allRows.length === 0) {
      return createDataFrame([], []);
    }

    const columns = [
      '股票代码', '公司简称', '行业', '行业代码', '问题', '提问者', '来源',
      '提问时间', '更新时间', '提问者编号', '问题编号', '回答ID', '回答内容', '回答者',
    ];

    return createDataFrame(columns, allRows);
  } catch (error) {
    return createDataFrame([], []);
  }
}
