/**
 * AKShare TypeScript - 百度股市通-经济数据
 * https://finance.baidu.com/calendar
 */

import { httpGet } from '../utils/httpClient';
import { createDataFrame, DataFrame } from '../utils/dataframe';

/** 日历数据类型 */
type CalendarCategory = 'economic_data' | 'notify_suspend' | 'notify_divide' | 'report_time';

/**
 * 百度股市通日历数据基础函数（支持分页）
 *
 * @param date 查询日期 (格式: YYYYMMDD)
 * @param cate 数据类别
 * @returns 处理后的 DataFrame
 */
async function baiduFinanceCalendar(
  date: string,
  cate: CalendarCategory
): Promise<DataFrame> {
  // 日期格式转换
  const formattedDate = `${date.substring(0, 4)}-${date.substring(4, 6)}-${date.substring(6, 8)}`;

  const url = 'https://finance.pae.baidu.com/sapi/v1/financecalendar';

  const headers = {
    'Accept': 'application/vnd.finance-web.v1+json',
    'Accept-Encoding': 'gzip, deflate, br, zstd',
    'Accept-Language': 'en,zh-CN;q=0.9,zh;q=0.8',
    'Cache-Control': 'no-cache',
    'Origin': 'https://finance.baidu.com',
    'Pragma': 'no-cache',
    'Referer': 'https://finance.baidu.com/',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
  };

  interface CalendarInfoItem {
    date: string;
    total?: number;
    list?: any[];
  }

  interface CalendarResponse {
    Result?: {
      calendarInfo?: CalendarInfoItem[];
    };
  }

  let allRows: any[][] = [];
  let columns: string[] = [];
  let totalRecords = 0;

  // 第一次请求获取总记录数
  const baseParams = {
    start_date: formattedDate,
    end_date: formattedDate,
    pn: '0',
    rn: '100',
    cate: cate,
    finClientType: 'pc',
  };

  const firstResponse = await httpGet<CalendarResponse>(url, { params: baseParams, headers });

  // 获取总记录数
  if (firstResponse?.Result?.calendarInfo) {
    for (const item of firstResponse.Result.calendarInfo) {
      if (item.date === formattedDate) {
        totalRecords = item.total || 0;
        break;
      }
    }
  }

  const totalPages = totalRecords > 0 ? Math.ceil(totalRecords / 100) : 1;

  // 处理所有页码
  for (let page = 0; page < totalPages; page++) {
    let dataJson: CalendarResponse;

    if (page === 0) {
      dataJson = firstResponse;
    } else {
      const params = { ...baseParams, pn: String(page) };
      dataJson = await httpGet<CalendarResponse>(url, { params, headers });
    }

    if (dataJson?.Result?.calendarInfo) {
      for (const item of dataJson.Result.calendarInfo) {
        if (item.date === formattedDate && item.list) {
          const processed = processCalendarData(item.list, cate);
          if (columns.length === 0 && processed.columns.length > 0) {
            columns = processed.columns;
          }
          allRows = allRows.concat(processed.data);
        }
      }
    }
  }

  return createDataFrame(columns, allRows);
}

/**
 * 处理日历数据
 */
function processCalendarData(dataList: any[], cate: CalendarCategory): DataFrame {
  if (!dataList || dataList.length === 0) {
    return createDataFrame([], []);
  }

  switch (cate) {
    case 'economic_data':
      return processEconomicData(dataList);
    case 'notify_suspend':
      return processSuspendData(dataList);
    case 'notify_divide':
      return processDividendData(dataList);
    case 'report_time':
      return processReportData(dataList);
    default:
      return createDataFrame([], []);
  }
}

/**
 * 处理经济数据
 */
function processEconomicData(dataList: any[]): DataFrame {
  const renameDict: Record<string, string> = {
    date: '日期',
    time: '时间',
    title: '事件',
    star: '重要性',
    formerVal: '前值',
    pubVal: '公布',
    region: '地区',
    indicateVal: '预期',
    country: '国家',
    timePeriod: '统计周期',
  };

  const columns = ['日期', '时间', '国家', '地区', '事件', '统计周期', '公布', '预期', '前值', '重要性'];

  const rows = dataList.map(item => {
    const mapped: Record<string, any> = {};
    for (const [key, value] of Object.entries(item)) {
      const cnKey = renameDict[key] || key;
      mapped[cnKey] = value;
    }
    return columns.map(col => {
      const val = mapped[col] ?? '';
      if (['公布', '预期', '前值', '重要性'].includes(col)) {
        return val === '' ? null : Number(val);
      }
      return val;
    });
  });

  return createDataFrame(columns, rows);
}

/**
 * 处理停复牌数据
 */
function processSuspendData(dataList: any[]): DataFrame {
  const renameDict: Record<string, string> = {
    code: '股票代码',
    name: '股票简称',
    exchange: '交易所代码',
    start: '停牌时间',
    reason: '停牌事项说明',
    marketValue: '市值',
    date: '公告日期',
    time: '公告时间',
    type: '证券类型',
    market: '市场类型',
    isSkip: '是否跳过',
    end: '复牌时间',
  };

  const columns = [
    '股票代码', '股票简称', '交易所代码', '停牌时间', '复牌时间',
    '停牌事项说明', '市值', '公告日期', '公告时间', '证券类型', '市场类型', '是否跳过',
  ];

  const rows = dataList.map(item => {
    const mapped: Record<string, any> = {};
    for (const [key, value] of Object.entries(item)) {
      const cnKey = renameDict[key] || key;
      mapped[cnKey] = value;
    }
    if (!mapped['复牌时间']) {
      mapped['复牌时间'] = '-';
    }
    return columns.map(col => mapped[col] ?? '');
  });

  return createDataFrame(columns, rows);
}

/**
 * 处理分红派息数据
 */
function processDividendData(dataList: any[]): DataFrame {
  const renameDict: Record<string, string> = {
    code: '股票代码',
    exchange: '交易所',
    name: '股票简称',
    diviDate: '除权日',
    date: '报告期',
    diviCash: '分红',
    shareDivide: '送股',
    transfer: '转增',
    physical: '实物',
  };

  const columns = ['股票代码', '除权日', '分红', '送股', '转增', '实物', '交易所', '股票简称', '报告期'];

  const rows = dataList.map(item => {
    const mapped: Record<string, any> = {};
    for (const [key, value] of Object.entries(item)) {
      const cnKey = renameDict[key] || key;
      mapped[cnKey] = value;
    }
    // 确保必要列存在
    if (!mapped['分红']) mapped['分红'] = '-';
    if (!mapped['实物']) mapped['实物'] = '-';
    if (!mapped['送股']) mapped['送股'] = '-';
    if (!mapped['转增']) mapped['转增'] = '-';
    return columns.map(col => mapped[col] ?? '');
  });

  return createDataFrame(columns, rows);
}

/**
 * 处理财报发行数据
 */
function processReportData(dataList: any[]): DataFrame {
  const renameDict: Record<string, string> = {
    code: '股票代码',
    name: '股票简称',
    exchange: '交易所',
    reportType: '财报类型',
    time: '发布时间',
    marketValue: '市值',
    capitalization: '总市值',
    date: '发布日期',
  };

  const columns = ['股票代码', '股票简称', '交易所', '财报类型', '发布时间', '市值', '发布日期'];

  const rows = dataList.map(item => {
    const mapped: Record<string, any> = {};
    for (const [key, value] of Object.entries(item)) {
      const cnKey = renameDict[key] || key;
      mapped[cnKey] = value;
    }
    if (!mapped['财报类型']) mapped['财报类型'] = '-';
    if (!mapped['发布时间']) mapped['发布时间'] = '-';
    if (!mapped['市值'] && mapped['总市值']) mapped['市值'] = mapped['总市值'];
    return columns.map(col => {
      const val = mapped[col] ?? '';
      if (col === '市值') return val === '' ? null : Number(val);
      return val;
    });
  });

  return createDataFrame(columns, rows);
}

/**
 * 百度股市通-经济数据
 * https://finance.baidu.com/calendar
 *
 * @param date 查询日期 (格式: YYYYMMDD)
 * @returns 经济数据 DataFrame
 */
export async function news_economic_baidu(date: string = '20251126'): Promise<DataFrame> {
  return baiduFinanceCalendar(date, 'economic_data');
}

/**
 * 百度股市通-交易提醒-停复牌
 * https://finance.baidu.com/calendar
 *
 * @param date 查询日期 (格式: YYYYMMDD)
 * @returns 停复牌数据 DataFrame
 */
export async function news_trade_notify_suspend_baidu(date: string = '20251126'): Promise<DataFrame> {
  return baiduFinanceCalendar(date, 'notify_suspend');
}

/**
 * 百度股市通-交易提醒-分红派息
 * https://finance.baidu.com/calendar
 *
 * @param date 查询日期 (格式: YYYYMMDD)
 * @returns 交易提醒-分红派息 DataFrame
 */
export async function news_trade_notify_dividend_baidu(date: string = '20251126'): Promise<DataFrame> {
  return baiduFinanceCalendar(date, 'notify_divide');
}

/**
 * 百度股市通-财报发行
 * https://finance.baidu.com/calendar
 *
 * @param date 查询日期 (格式: YYYYMMDD)
 * @returns 财报发行 DataFrame
 */
export async function news_report_time_baidu(date: string = '20251126'): Promise<DataFrame> {
  return baiduFinanceCalendar(date, 'report_time');
}
