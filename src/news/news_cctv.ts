/**
 * AKShare TypeScript - 新闻联播文字稿
 * https://tv.cctv.com/lm/xwlb
 */

import { httpGetText } from '../utils/httpClient';
import { createDataFrame, DataFrame } from '../utils/dataframe';

/**
 * 从 HTML 文本中提取所有 <a> 标签的 href
 */
function extractLinks(html: string): string[] {
  const linkRegex = /<a[^>]*href="([^"]+)"[^>]*>/gi;
  const result: string[] = [];
  let match;
  while ((match = linkRegex.exec(html)) !== null) {
    result.push(match[1]);
  }
  return result;
}

/**
 * 从新闻页面提取标题和内容
 */
function extractArticleContent(html: string): { title: string; content: string } | null {
  // 提取标题：h3 或 div.tit
  let title = '';
  const h3Match = /<h3[^>]*>([\s\S]*?)<\/h3>/i.exec(html);
  const titMatch = /<div[^>]*class="tit"[^>]*>([\s\S]*?)<\/div>/i.exec(html);
  if (h3Match) {
    title = h3Match[1].replace(/<[^>]+>/g, '').trim();
  } else if (titMatch) {
    title = titMatch[1].replace(/<[^>]+>/g, '').trim();
  }

  // 提取内容：div.cnt_bd 或 div.content_area
  let content = '';
  const cntBdMatch = /<div[^>]*class="cnt_bd"[^>]*>([\s\S]*?)<\/div>/i.exec(html);
  const contentAreaMatch = /<div[^>]*class="content_area"[^>]*>([\s\S]*?)<\/div>/i.exec(html);
  if (cntBdMatch) {
    content = cntBdMatch[1].replace(/<[^>]+>/g, '').trim();
  } else if (contentAreaMatch) {
    content = contentAreaMatch[1].replace(/<[^>]+>/g, '').trim();
  }

  if (!title && !content) {
    return null;
  }

  // 清理标题
  title = title
    .replace(/\[视频\]/g, '')
    .trim()
    .replace(/\n/g, ' ');

  // 清理内容
  content = content
    .replace(/^央视网消息[（(]新闻联播[）)]：/, '')
    .replace(/^[（(]新闻联播[）)]：/, '')
    .trim()
    .replace(/\n/g, ' ');

  return { title, content };
}

/**
 * 新闻联播文字稿
 * https://tv.cctv.com/lm/xwlb
 *
 * @param date 需要获取数据的日期，格式 YYYYMMDD；目前支持 20130708 年后
 * @returns 新闻联播文字稿 DataFrame
 */
export async function news_cctv(date: string = '20240424'): Promise<DataFrame> {
  const headers = {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
    'Accept-Encoding': 'gzip, deflate',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    'Cache-Control': 'no-cache',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36',
  };

  const dateNum = parseInt(date);
  const titleList: string[] = [];
  const contentList: string[] = [];

  if (dateNum <= 20130708) {
    // 早期格式
    const url = `https://cctv.cntv.cn/lm/xinwenlianbo/${date}.shtml`;
    const html = await httpGetText(url, { headers });

    // 提取页面链接（title_array_01 格式）
    const rawListMatches = html.match(/title_array_01\((.*)/g) || [];
    const pageUrls: string[] = [];
    for (const match of rawListMatches.slice(1)) {
      const urlMatch = /(http.*)/.exec(match);
      if (urlMatch) {
        pageUrls.push(urlMatch[1].split("'")[0]);
      }
    }

    for (const pageUrl of pageUrls) {
      try {
        const pageHtml = await httpGetText(pageUrl, { headers });
        const article = extractArticleContent(pageHtml);
        if (article) {
          titleList.push(article.title);
          contentList.push(article.content);
        }
      } catch {
        continue;
      }
    }
  } else if (dateNum < 20160203) {
    // 中间格式
    const url = `https://cctv.cntv.cn/lm/xinwenlianbo/${date}.shtml`;
    const html = await httpGetText(url, { headers });

    // 提取页面链接
    const contentBlock = /<div[^>]*id="contentELMT\d+"[^>]*>([\s\S]*?)<\/div>/i.exec(html);
    if (contentBlock) {
      const linkRegex = /<a[^>]*href="([^"]+)"[^>]*>/gi;
      let linkMatch;
      const pageUrls: string[] = [];
      while ((linkMatch = linkRegex.exec(contentBlock[1])) !== null) {
        pageUrls.push(linkMatch[1]);
      }

      for (const pageUrl of pageUrls) {
        try {
          const pageHtml = await httpGetText(pageUrl, { headers });
          const article = extractArticleContent(pageHtml);
          if (article) {
            titleList.push(article.title);
            contentList.push(article.content);
          }
        } catch {
          continue;
        }
      }
    }
  } else {
    // 20160203 之后的格式
    const url = `https://tv.cctv.com/lm/xwlb/day/${date}.shtml`;
    const html = await httpGetText(url, { headers });

    // 提取 <li> 中的链接（跳过第一个）
    const liRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi;
    const pageUrls: string[] = [];
    let liMatch;
    let first = true;
    while ((liMatch = liRegex.exec(html)) !== null) {
      if (first) {
        first = false;
        continue;
      }
      const hrefMatch = /<a[^>]*href="([^"]+)"[^>]*>/.exec(liMatch[1]);
      if (hrefMatch) {
        pageUrls.push(hrefMatch[1]);
      }
    }

    for (const pageUrl of pageUrls) {
      try {
        const fullUrl = pageUrl.startsWith('http') ? pageUrl : `https://tv.cctv.com${pageUrl}`;
        const pageHtml = await httpGetText(fullUrl, { headers });
        const article = extractArticleContent(pageHtml);
        if (article) {
          titleList.push(article.title);
          contentList.push(article.content);
        }
      } catch {
        continue;
      }
    }
  }

  const columns = ['date', 'title', 'content'];
  const data = titleList.map((title, i) => [date, title, contentList[i]]);

  return createDataFrame(columns, data);
}
