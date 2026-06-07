/**
 * AKShare TypeScript - 个股新闻数据
 * https://so.eastmoney.com/news/s?keyword=603777
 */

import { httpGetText } from '../utils/httpClient';
import { createDataFrame, DataFrame } from '../utils/dataframe';

/**
 * 东方财富-个股新闻-最近100条新闻
 * https://so.eastmoney.com/news/s?keyword=603777
 *
 * @param symbol 股票代码，如 "603777"
 * @returns 个股新闻 DataFrame
 */
export async function stock_news_em(symbol: string = '603777'): Promise<DataFrame> {
  const url = 'https://search-api-web.eastmoney.com/search/jsonp';

  const innerParam = {
    uid: '',
    keyword: symbol,
    type: ['cmsArticleWebOld'],
    client: 'web',
    clientType: 'web',
    clientVersion: 'curr',
    param: {
      cmsArticleWebOld: {
        searchScope: 'default',
        sort: 'default',
        pageIndex: 1,
        pageSize: 10,
        preTag: '<em>',
        postTag: '</em>',
      },
    },
  };

  const cb = 'jQuery35101792940631092459_1764599530165';
  const params = {
    cb: cb,
    param: JSON.stringify(innerParam),
    _: '1764599530176',
  };

  const headers = {
    'Accept': '*/*',
    'Accept-Encoding': 'gzip, deflate, br, zstd',
    'Accept-Language': 'en,zh-CN;q=0.9,zh;q=0.8',
    'Cache-Control': 'no-cache',
    'Referer': `https://so.eastmoney.com/news/s?keyword=${symbol}`,
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
  };

  const responseText = await httpGetText(url, { params, headers });

  // 解析 JSONP 格式: jQuery...({...})
  const jsonStart = responseText.indexOf('(');
  const jsonEnd = responseText.lastIndexOf(')');
  if (jsonStart === -1 || jsonEnd === -1) {
    return createDataFrame([], []);
  }

  const jsonStr = responseText.substring(jsonStart + 1, jsonEnd);
  const dataJson = JSON.parse(jsonStr);

  if (!dataJson?.result?.cmsArticleWebOld) {
    return createDataFrame([], []);
  }

  const articles = dataJson.result.cmsArticleWebOld as Array<{
    date: string;
    mediaName: string;
    code: string;
    title: string;
    content: string;
    image?: string;
  }>;

  const columns = ['关键词', '新闻标题', '新闻内容', '发布时间', '文章来源', '新闻链接'];

  const rows = articles.map(item => {
    // 清理标题和内容中的 <em> 标签
    let title = (item.title || '')
      .replace(/\(<em>/g, '')
      .replace(/<\/em>\)/g, '')
      .replace(/<em>/g, '')
      .replace(/<\/em>/g, '');

    let content = (item.content || '')
      .replace(/\(<em>/g, '')
      .replace(/<\/em>\)/g, '')
      .replace(/<em>/g, '')
      .replace(/<\/em>/g, '')
      .replace(/　/g, '')
      .replace(/\r\n/g, ' ');

    const url = `http://finance.eastmoney.com/a/${item.code}.html`;

    return [symbol, title, content, item.date, item.mediaName, url];
  });

  return createDataFrame(columns, rows);
}
