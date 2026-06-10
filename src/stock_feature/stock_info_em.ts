/**
 * AKShare TypeScript - 东方财富-财经早餐和全球财经快讯
 * https://stock.eastmoney.com/a/czpnc.html
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 东方财富-财经早餐
 * https://stock.eastmoney.com/a/czpnc.html
 * @returns 财经早餐数据
 */
export async function stock_info_cjzc_em(): Promise<DataFrame> {
  const url = 'https://np-listapi.eastmoney.com/comm/web/getNewsByColumns';

  let allData: any[] = [];

  for (let page = 1; page <= 2; page++) {
    const params = {
      client: 'web',
      biz: 'web_news_col',
      column: '1207',
      order: '1',
      needInteractData: '0',
      page_index: String(page),
      page_size: '200',
      req_trace: String(Date.now()),
      fields: 'code,showTime,title,mediaName,summary,image,url,uniqueUrl,Np_dst',
    };

    const data = await httpGet<any>(url, { params });

    if (data?.data?.list) {
      allData = allData.concat(data.data.list);
    }
  }

  if (allData.length === 0) {
    return createDataFrame([], []);
  }

  const columns = ['标题', '摘要', '发布时间', '链接'];
  const rows = allData.map((item: any) => [
    item.title,
    item.summary,
    item.showTime,
    item.uniqueUrl,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 东方财富-全球财经快讯
 * https://kuaixun.eastmoney.com/7_24.html
 * @returns 全球财经快讯数据
 */
export async function stock_info_global_em(): Promise<DataFrame> {
  const url = 'https://np-weblist.eastmoney.com/comm/web/getFastNewsList';
  const params = {
    client: 'web',
    biz: 'web_724',
    fastColumn: '102',
    sortEnd: '',
    pageSize: '200',
    req_trace: String(Date.now()),
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.data?.fastNewsList || data.data.fastNewsList.length === 0) {
    return createDataFrame([], []);
  }

  const columns = ['标题', '摘要', '发布时间', '链接'];
  const rows = data.data.fastNewsList.map((item: any) => [
    item.title,
    item.summary,
    item.showTime,
    `https://finance.eastmoney.com/a/${item.code}.html`,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 新浪财经-全球财经快讯
 */
export async function stock_info_global_sina(): Promise<DataFrame> {
  const url = 'https://zhibo.sina.com.cn/api/zhibo/feed';
  const params = {
    page: '1',
    page_size: '20',
    zhibo_id: '152',
    tag_id: '0',
    dire: 'f',
    dpc: '1',
    pagesize: '20',
    type: '1',
  };

  try {
    const data = await httpGet<any>(url, { params });
    const list = data?.result?.data?.feed?.list;
    if (!Array.isArray(list) || list.length === 0) {
      return createDataFrame([], []);
    }

    const columns = ['时间', '内容'];
    const rows = list.map((item: any) => [
      item?.create_time ?? '',
      item?.rich_text ?? '',
    ]);
    return createDataFrame(columns, rows);
  } catch {
    return createDataFrame([], []);
  }
}

/**
 * 富途牛牛-快讯
 */
export async function stock_info_global_futu(): Promise<DataFrame> {
  const url = 'https://news.futunn.com/news-site-api/main/get-flash-list';
  const params = {
    pageSize: '50',
  };

  try {
    const data = await httpGet<any>(url, {
      params,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      },
    });

    const list = data?.data?.data?.news;
    if (!Array.isArray(list) || list.length === 0) {
      return createDataFrame([], []);
    }

    const columns = ['标题', '内容', '发布时间', '链接'];
    const rows = list.map((item: any) => {
      const ts = Number(item?.time);
      const dt = Number.isFinite(ts) ? new Date(ts * 1000) : null;
      const timeText = dt ? dt.toISOString().slice(0, 19).replace('T', ' ') : '';
      return [
        item?.title ?? '',
        item?.content ?? '',
        timeText,
        item?.detailUrl ?? '',
      ];
    });

    return createDataFrame(columns, rows);
  } catch {
    return createDataFrame([], []);
  }
}

/**
 * 同花顺财经-全球财经直播
 */
export async function stock_info_global_ths(): Promise<DataFrame> {
  const url = 'https://news.10jqka.com.cn/tapp/news/push/stock';
  const params = {
    page: '1',
    tag: '',
    track: 'website',
  };

  try {
    const data = await httpGet<any>(url, { params });
    const list = data?.data?.list;
    if (!Array.isArray(list) || list.length === 0) {
      return createDataFrame([], []);
    }

    const columns = ['标题', '内容', '发布时间', '链接'];
    const rows = list.map((item: any) => {
      const ts = Number(item?.rtime);
      const dt = Number.isFinite(ts) ? new Date(ts * 1000) : null;
      const timeText = dt ? dt.toISOString().slice(0, 19).replace('T', ' ') : '';
      return [
        item?.title ?? '',
        item?.digest ?? '',
        timeText,
        item?.url ?? '',
      ];
    });
    return createDataFrame(columns, rows);
  } catch {
    return createDataFrame([], []);
  }
}

/**
 * 财联社-电报
 */
export async function stock_info_global_cls(symbol: '全部' | '重点' = '全部'): Promise<DataFrame> {
  const url = 'https://www.cls.cn/nodeapi/telegraphList';

  try {
    const data = await httpGet<any>(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      },
    });
    const list = data?.data?.roll_data;
    if (!Array.isArray(list) || list.length === 0) {
      return createDataFrame([], []);
    }

    const normalized = list
      .map((item: any) => {
        const ts = Number(item?.ctime);
        if (!Number.isFinite(ts)) {
          return null;
        }
        const dt = new Date(ts * 1000);
        return {
          title: item?.title ?? '',
          content: item?.content ?? '',
          level: item?.level ?? '',
          datetime: dt,
        };
      })
      .filter((item): item is { title: string; content: string; level: string; datetime: Date } => item !== null)
      .sort((a, b) => a.datetime.getTime() - b.datetime.getTime())
      .filter((item) => (symbol === '重点' ? item.level === 'A' || item.level === 'B' : true));

    const columns = ['标题', '内容', '发布日期', '发布时间'];
    const rows = normalized.map((item) => {
      const iso = item.datetime.toISOString();
      return [
        item.title,
        item.content,
        iso.slice(0, 10),
        iso.slice(11, 19),
      ];
    });
    return createDataFrame(columns, rows);
  } catch {
    return createDataFrame([], []);
  }
}
