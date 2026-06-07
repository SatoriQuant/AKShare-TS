/**
 * AKShare TypeScript - 历年世界500强榜单数据
 * https://www.fortunechina.com/fortune500/index.htm
 *
 * 特殊情况说明：
 * 2010年由于网页端没有公布公司所属的国家, 故2010年数据没有国家这列
 */

import { httpGetText } from '../utils/httpClient';
import { createDataFrame, DataFrame } from '../utils/dataframe';

/**
 * 解析 HTML 表格为 DataFrame
 * 从 HTML 文本中提取第一个 <table> 的数据
 */
function parseHtmlTable(html: string): DataFrame {
  const rows: string[][] = [];

  // 匹配所有 <tr> 行
  const trRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let trMatch;
  while ((trMatch = trRegex.exec(html)) !== null) {
    const trContent = trMatch[1];
    const cells: string[] = [];

    // 匹配 <td> 或 <th> 单元格
    const cellRegex = /<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi;
    let cellMatch;
    while ((cellMatch = cellRegex.exec(trContent)) !== null) {
      // 移除 HTML 标签，只保留文本
      const text = cellMatch[1].replace(/<[^>]+>/g, '').trim();
      cells.push(text);
    }

    if (cells.length > 0) {
      rows.push(cells);
    }
  }

  if (rows.length === 0) {
    return createDataFrame([], []);
  }

  // 第一行作为列名
  const columns = rows[0];
  const data = rows.slice(1);

  return createDataFrame(columns, data);
}

/**
 * 获取财富500强公司排行榜（从1996年开始）
 * https://www.fortunechina.com/fortune500/index.htm
 *
 * @param year 年份，如 "2023"
 * @returns 财富500强排行榜数据
 */
export async function fortune_rank(year: string = '2015'): Promise<DataFrame> {
  // 获取年份和URL映射
  const indexUrl = 'https://www.fortunechina.com/fortune500/index.htm';
  const indexHtml = await httpGetText(indexUrl);

  // 解析页面中的年份和链接
  const yearUrlMap: Record<string, string> = {};

  // 匹配 swiper-slide 中的链接
  const slideRegex = /<div[^>]*class="swiper-slide"[^>]*>([\s\S]*?)<\/div>/gi;
  let slideMatch;
  while ((slideMatch = slideRegex.exec(indexHtml)) !== null) {
    const slideContent = slideMatch[1];
    const linkMatch = /<a[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>/i.exec(slideContent);
    if (linkMatch) {
      const href = linkMatch[1];
      const yearText = linkMatch[2].trim();
      yearUrlMap[yearText] = href.startsWith('http') ? href : `https://www.fortunechina.com${href}`;
    }
  }

  // 手动补充2023年的URL（特殊情况）
  yearUrlMap['2023'] = 'https://www.fortunechina.com/fortune500/c/2023-08/02/content_436874.htm';

  const url = yearUrlMap[year];
  if (!url) {
    throw new Error(`未找到年份 ${year} 的数据，请检查年份是否正确`);
  }

  const responseHtml = await httpGetText(url);

  const yearNum = parseInt(year);

  if (yearNum < 2007) {
    // 早期数据格式：需要从表格中跳过第一行和最后一行
    const fullDf = parseHtmlTable(responseHtml);
    if (fullDf.data.length <= 2) {
      return createDataFrame([], []);
    }
    // 使用第一行作为列名，跳过最后一行
    const columns = fullDf.data[0];
    const data = fullDf.data.slice(1, -1);
    return createDataFrame(columns, data);
  } else if (yearNum > 2006 && yearNum < 2010) {
    // 2007-2009年数据：需要分页获取
    let allData: string[][] = [];
    let columns: string[] = [];

    for (let page = 1; page <= 10; page++) {
      const pageUrl = page === 1
        ? url
        : `${url.substring(0, url.lastIndexOf('.'))}_${page}.htm`;

      const pageHtml = await httpGetText(pageUrl);
      const pageDf = parseHtmlTable(pageHtml);

      if (pageDf.data.length > 0) {
        if (page === 1) {
          columns = pageDf.data[0];
          allData = pageDf.data.slice(1);
        } else {
          allData = allData.concat(pageDf.data.slice(1));
        }
      }
    }

    return createDataFrame(columns, allData);
  } else {
    // 2010年及以后的数据：直接解析表格
    const df = parseHtmlTable(responseHtml);
    return df;
  }
}
