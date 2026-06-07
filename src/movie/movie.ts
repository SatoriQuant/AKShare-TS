/**
 * AKShare TypeScript - 电影票房数据
 * https://ys.endata.cn/BoxOffice/Movie
 *
 * 艺恩-艺人商业价值 / 流量价值
 * https://www.endata.com.cn/Marketing/Artist/business.html
 *
 * 艺恩-视频放映（电视剧集 / 综艺节目）
 * https://www.endata.com.cn/Video/index.html
 */

import { httpPost } from '../utils/httpClient';
import { createDataFrame, DataFrame } from '../utils/dataframe';

// ---------------------------------------------------------------------------
// jm.js decrypt helper (runs the obfuscated JS in Node.js vm)
// ---------------------------------------------------------------------------

import * as fs from 'fs';
import * as path from 'path';
import * as vm from 'vm';

let _decryptContext: any = null;

function getDecryptContext(): any {
  if (_decryptContext) return _decryptContext;

  // Try multiple possible locations for jm.js
  const candidates = [
    path.resolve(__dirname, '../../akshare/akshare/movie/jm.js'),
    path.resolve(__dirname, '../../../akshare/akshare/movie/jm.js'),
    path.resolve(__dirname, '../movie/jm.js'),
  ];

  let jsCode = '';
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      jsCode = fs.readFileSync(candidate, 'utf-8');
      break;
    }
  }

  if (!jsCode) {
    throw new Error('Cannot find jm.js decryption file');
  }

  // Provide navigator stub expected by the script
  const sandbox: any = { navigator: { userAgent: 'node.js' }, window: undefined, process, global };
  vm.createContext(sandbox);
  vm.runInContext(jsCode, sandbox);
  _decryptContext = sandbox;
  return _decryptContext;
}

function decrypt(originData: string): string {
  const ctx = getDecryptContext();
  if (!ctx) {
    throw new Error('Failed to initialize decrypt context');
  }
  return vm.runInContext(`webInstace.shell("${originData.replace(/"/g, '\\"')}")`, ctx);
}

// ---------------------------------------------------------------------------
// Helper: POST form-urlencoded to endata API and decrypt
// ---------------------------------------------------------------------------

async function postEndata<T = any>(payload: Record<string, any>): Promise<T> {
  const url = 'https://www.endata.com.cn/API/GetData.ashx';
  const formBody = Object.entries(payload)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');
  const raw: string = await httpPost<string>(url, formBody, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    timeout: 30000,
  });
  const decrypted = decrypt(typeof raw === 'string' ? raw : JSON.stringify(raw));
  return JSON.parse(decrypted);
}

// ---------------------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------------------

function formatDate(date: string): { year: string; month: string; day: string } {
  return {
    year: date.slice(0, 4),
    month: date.slice(4, 6),
    day: date.slice(6, 8),
  };
}

function toISODate(date: string): string {
  const { year, month, day } = formatDate(date);
  return `${year}-${month}-${day}`;
}

function getCurrentMonday(date: string): string {
  const d = new Date(Number(date.slice(0, 4)), Number(date.slice(4, 6)) - 1, Number(date.slice(6, 8)));
  const day = d.getDay();
  const diff = day === 0 ? 6 : day - 1; // Monday = 0 in JS, handle Sunday
  d.setDate(d.getDate() - diff);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

// ---------------------------------------------------------------------------
// 电影票房-实时票房
// ---------------------------------------------------------------------------

/**
 * 电影票房-实时票房
 * https://ys.endata.cn/BoxOffice/Movie
 */
export async function movie_boxoffice_realtime(): Promise<DataFrame> {
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const d = String(today.getDate()).padStart(2, '0');
  const todayStr = `${y}${m}${d}`;

  const dataJson = await postEndata({
    showDate: '',
    tdate: `${todayStr.slice(0, 4)}-${todayStr.slice(4, 6)}-${todayStr.slice(6, 8)}`,
    MethodName: 'BoxOffice_GetHourBoxOffice',
  });

  const table = dataJson?.Data?.Table1;
  if (!table || !table.length) return createDataFrame([], []);

  const columns = ['排序', '影片名称', '实时票房', '票房占比', '上映天数', '累计票房'];
  const data = table.map((item: any) => {
    const values = Object.values(item);
    return [
      values[0],  // 排序
      values[2],  // 影片名称
      values[3],  // 实时票房
      values[6],  // 票房占比
      values[5],  // 上映天数
      values[4],  // 累计票房
    ];
  });

  return createDataFrame(columns, data);
}

// ---------------------------------------------------------------------------
// 电影票房-单日票房
// ---------------------------------------------------------------------------

/**
 * 电影票房-单日票房
 * https://www.endata.com.cn/BoxOffice/BO/Day/index.html
 * @param date 日期，格式 YYYYMMDD（获取前一天的票房数据）
 */
export async function movie_boxoffice_daily(date: string = '20240219'): Promise<DataFrame> {
  const { year, month, day } = formatDate(date);
  const d = new Date(Number(year), Number(month) - 1, Number(day));
  d.setDate(d.getDate() - 1);
  const lastDate = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;

  const dataJson = await postEndata({
    sdate: `${year}-${month}-${day}`,
    edate: `${lastDate.slice(0, 4)}-${lastDate.slice(4, 6)}-${lastDate.slice(6, 8)}`,
    MethodName: 'BoxOffice_GetDayBoxOffice',
  });

  const table = dataJson?.Data?.Table;
  if (!table || !table.length) return createDataFrame([], []);

  const allColumns = [
    '排序', '_', '影片名称', '_', '累计票房', '平均票价', '上映天数',
    '场均人次', '_', '_', '_', '_', '_', '单日票房', '环比变化', '_', '口碑指数',
  ];
  const keepColumns = [
    '排序', '影片名称', '单日票房', '环比变化', '累计票房', '平均票价',
    '场均人次', '口碑指数', '上映天数',
  ];

  const data = table.map((item: any) => {
    const values = Object.values(item);
    const row: Record<string, any> = {};
    allColumns.forEach((col, i) => {
      if (col !== '_') row[col] = values[i];
    });
    return keepColumns.map(col => row[col] ?? null);
  });

  return createDataFrame(keepColumns, data);
}

// ---------------------------------------------------------------------------
// 电影票房-单周票房
// ---------------------------------------------------------------------------

/**
 * 电影票房-单周票房
 * https://www.endata.com.cn/BoxOffice/BO/Week/oneWeek.html
 * @param date 日期，格式 YYYYMMDD（获取指定日期所在完整周的票房数据）
 */
export async function movie_boxoffice_weekly(date: string = '20240218'): Promise<DataFrame> {
  const monday = getCurrentMonday(date);

  const dataJson = await postEndata({
    sdate: monday,
    MethodName: 'BoxOffice_GetWeekInfoData',
  });

  const table = dataJson?.Data?.Table;
  if (!table || !table.length) return createDataFrame([], []);

  const allColumns = [
    '排序', '_', '影片名称', '单周票房', '累计票房', '_', '上映天数',
    '平均票价', '场均人次', '环比变化', '_', '_', '_', '排名变化', '口碑指数',
  ];
  const keepColumns = [
    '排序', '影片名称', '排名变化', '单周票房', '环比变化', '累计票房',
    '平均票价', '场均人次', '口碑指数', '上映天数',
  ];

  const data = table.map((item: any) => {
    const values = Object.values(item);
    const row: Record<string, any> = {};
    allColumns.forEach((col, i) => {
      if (col !== '_') row[col] = values[i];
    });
    return keepColumns.map(col => {
      const v = row[col] ?? null;
      if (['单周票房', '环比变化', '累计票房'].includes(col)) {
        return v !== null && v !== '' ? Number(v) : NaN;
      }
      return v;
    });
  });

  return createDataFrame(keepColumns, data);
}

// ---------------------------------------------------------------------------
// 电影票房-单月票房
// ---------------------------------------------------------------------------

/**
 * 电影票房-单月票房
 * https://www.endata.com.cn/BoxOffice/BO/Month/oneMonth.html
 * @param date 日期，格式 YYYYMMDD（获取指定日期所在月份的月度票房）
 */
export async function movie_boxoffice_monthly(date: string = '20240218'): Promise<DataFrame> {
  const { year, month } = formatDate(date);

  const dataJson = await postEndata({
    startTime: `${year}-${month}-01`,
    MethodName: 'BoxOffice_GetMonthBox',
  });

  const table = dataJson?.Data?.Table;
  if (!table || !table.length) return createDataFrame([], []);

  const allColumns = [
    '排序', '_', '影片名称', '月内天数', '单月票房', '平均票价',
    '场均人次', '月度占比', '上映日期', '_', '口碑指数',
  ];
  const keepColumns = [
    '排序', '影片名称', '单月票房', '月度占比', '平均票价',
    '场均人次', '上映日期', '口碑指数', '月内天数',
  ];

  const data = table.map((item: any) => {
    const values = Object.values(item);
    const row: Record<string, any> = {};
    allColumns.forEach((col, i) => {
      if (col !== '_') row[col] = values[i];
    });
    return keepColumns.map(col => row[col] ?? null);
  });

  return createDataFrame(keepColumns, data);
}

// ---------------------------------------------------------------------------
// 电影票房-年度票房
// ---------------------------------------------------------------------------

/**
 * 电影票房-年度票房
 * https://www.endata.com.cn/BoxOffice/BO/Year/index.html
 * @param date 日期，格式 YYYYMMDD（获取当前日期所在年度的票房数据）
 */
export async function movie_boxoffice_yearly(date: string = '20240218'): Promise<DataFrame> {
  const { year } = formatDate(date);

  const dataJson = await postEndata({
    year: year,
    MethodName: 'BoxOffice_GetYearInfoData',
  });

  const table = dataJson?.Data?.Table;
  if (!table || !table.length) return createDataFrame([], []);

  const allColumns = [
    '排序', '_', '影片名称', '类型', '总票房', '平均票价',
    '场均人次', '国家及地区', '上映日期', '_',
  ];
  const keepColumns = [
    '排序', '影片名称', '类型', '总票房', '平均票价',
    '场均人次', '国家及地区', '上映日期',
  ];

  const data = table.map((item: any, index: number) => {
    const values = Object.values(item);
    const row: Record<string, any> = { '排序': index + 1 };
    allColumns.forEach((col, i) => {
      if (col !== '_') row[col] = values[i];
    });
    return keepColumns.map(col => row[col] ?? null);
  });

  return createDataFrame(keepColumns, data);
}

// ---------------------------------------------------------------------------
// 电影票房-年度首周票房
// ---------------------------------------------------------------------------

/**
 * 电影票房-年度票房-年度首周票房
 * https://www.endata.com.cn/BoxOffice/BO/Year/firstWeek.html
 * @param date 日期，格式 YYYYMMDD
 */
export async function movie_boxoffice_yearly_first_week(date: string = '20201018'): Promise<DataFrame> {
  const { year } = formatDate(date);

  const dataJson = await postEndata({
    year: year,
    MethodName: 'BoxOffice_getYearInfo_fData',
  });

  const table = dataJson?.Data?.Table;
  if (!table || !table.length) return createDataFrame([], []);

  const allColumns = [
    '排序', '_', '_', '影片名称', '首周票房', '场均人次',
    '上映日期', '首周天数', '类型', '国家及地区', '_', '占总票房比重',
  ];
  const keepColumns = [
    '排序', '影片名称', '类型', '首周票房', '占总票房比重',
    '场均人次', '国家及地区', '上映日期', '首周天数',
  ];

  const data = table.map((item: any, index: number) => {
    const values = Object.values(item);
    const row: Record<string, any> = { '排序': index + 1 };
    allColumns.forEach((col, i) => {
      if (col !== '_') row[col] = values[i];
    });
    return keepColumns.map(col => row[col] ?? null);
  });

  return createDataFrame(keepColumns, data);
}

// ---------------------------------------------------------------------------
// 电影票房-影院票房-日票房排行
// ---------------------------------------------------------------------------

/**
 * 电影票房-影院票房-日票房排行
 * https://www.endata.com.cn/BoxOffice/BO/Cinema/day.html
 * @param date 日期，格式 YYYYMMDD（获取当前日期前一日的票房数据）
 */
export async function movie_boxoffice_cinema_daily(date: string = '20240219'): Promise<DataFrame> {
  const dataJson = await postEndata({
    rowNum1: '1',
    rowNum2: '100',
    date: date,
    MethodName: 'BoxOffice_GetCinemaDayBoxOffice',
  });

  const table = dataJson?.Data?.Table;
  if (!table || !table.length) return createDataFrame([], []);

  const allColumns = [
    '排序', '_', '影院名称', '单日票房', '单日场次', '_', '_',
    '场均票价', '场均人次', '上座率',
  ];
  const keepColumns = ['排序', '影院名称', '单日票房', '单日场次', '场均人次', '场均票价', '上座率'];

  const data = table.map((item: any) => {
    const values = Object.values(item);
    const row: Record<string, any> = {};
    allColumns.forEach((col, i) => {
      if (col !== '_') row[col] = values[i];
    });
    return keepColumns.map(col => row[col] ?? null);
  });

  return createDataFrame(keepColumns, data);
}

// ---------------------------------------------------------------------------
// 电影票房-影院票房-周票房排行
// ---------------------------------------------------------------------------

/**
 * 电影票房-影院票房-周票房排行
 * https://www.endata.com.cn/BoxOffice/BO/Cinema/week.html
 * @param date 日期，格式 YYYYMMDD（获取当前日期前完整一周的票房数据）
 */
export async function movie_boxoffice_cinema_weekly(date: string = '20240219'): Promise<DataFrame> {
  const { year, month, day } = formatDate(date);
  const d = new Date(Number(year), Number(month) - 1, Number(day));
  // ISO week number
  const jan1 = new Date(d.getFullYear(), 0, 1);
  const daysSinceJan1 = Math.floor((d.getTime() - jan1.getTime()) / 86400000);
  const weekNumber = Math.ceil((daysSinceJan1 + jan1.getDay() + 1) / 7);
  const dateID = String(weekNumber - 1 - 41 + 1128);

  const dataJson = await postEndata({
    dateID: dateID,
    rowNum1: '1',
    rowNum2: '100',
    MethodName: 'BoxOffice_GetCinemaWeekBoxOffice',
  });

  const table = dataJson?.Data?.Table;
  if (!table || !table.length) return createDataFrame([], []);

  const allColumns = [
    '排序', '_', '影院名称', '当周票房', '_',
    '单银幕票房', '场均人次', '单日单厅票房', '单日单厅场次',
  ];
  const keepColumns = [
    '排序', '影院名称', '当周票房', '单银幕票房', '场均人次', '单日单厅票房', '单日单厅场次',
  ];

  const data = table.map((item: any) => {
    const values = Object.values(item);
    const row: Record<string, any> = {};
    allColumns.forEach((col, i) => {
      if (col !== '_') row[col] = values[i];
    });
    return keepColumns.map(col => row[col] ?? null);
  });

  return createDataFrame(keepColumns, data);
}

// ---------------------------------------------------------------------------
// 艺恩-艺人-艺人商业价值
// ---------------------------------------------------------------------------

/**
 * 艺恩-艺人-艺人商业价值
 * https://www.endata.com.cn/Marketing/Artist/business.html
 */
export async function business_value_artist(): Promise<DataFrame> {
  const dataJson = await postEndata({
    Order: 'BusinessValueIndex_L1',
    OrderType: 'DESC',
    PageIndex: '1',
    PageSize: '100',
    MethodName: 'Data_GetList_Star',
  });

  const table = dataJson?.Data?.Table;
  if (!table || !table.length) return createDataFrame([], []);

  const allColumns = ['排名', '-', '艺人', '商业价值', '-', '专业热度', '关注热度', '预测热度', '美誉度', '-'];
  const keepColumns = ['排名', '艺人', '商业价值', '专业热度', '关注热度', '预测热度', '美誉度'];

  const today = new Date().toISOString().slice(0, 10);

  const data = table.map((item: any) => {
    const values = Object.values(item);
    const row: Record<string, any> = {};
    allColumns.forEach((col, i) => {
      if (col !== '-') row[col] = values[i];
    });
    return [...keepColumns.map(col => row[col] ?? null), today];
  });

  return createDataFrame([...keepColumns, '统计日期'], data);
}

// ---------------------------------------------------------------------------
// 艺恩-艺人-艺人流量价值
// ---------------------------------------------------------------------------

/**
 * 艺恩-艺人-艺人流量价值
 * https://www.endata.com.cn/Marketing/Artist/business.html
 */
export async function online_value_artist(): Promise<DataFrame> {
  const dataJson = await postEndata({
    Order: 'FlowValueIndex_L1',
    OrderType: 'DESC',
    PageIndex: 1,
    PageSize: 100,
    MethodName: 'Data_GetList_Star',
  });

  const table = dataJson?.Data?.Table;
  if (!table || !table.length) return createDataFrame([], []);

  const allColumns = ['排名', '-', '艺人', '-', '流量价值', '专业热度', '关注热度', '预测热度', '-', '带货力'];
  const keepColumns = ['排名', '艺人', '流量价值', '专业热度', '关注热度', '预测热度', '带货力'];

  const today = new Date().toISOString().slice(0, 10);

  const data = table.map((item: any) => {
    const values = Object.values(item);
    const row: Record<string, any> = {};
    allColumns.forEach((col, i) => {
      if (col !== '-') row[col] = values[i];
    });
    return [...keepColumns.map(col => row[col] ?? null), today];
  });

  return createDataFrame([...keepColumns, '统计日期'], data);
}

// ---------------------------------------------------------------------------
// 艺恩-视频放映-电视剧集
// ---------------------------------------------------------------------------

/**
 * 艺恩-视频放映-电视剧集
 * https://www.endata.com.cn/Video/index.html
 */
export async function video_tv(): Promise<DataFrame> {
  const dataJson = await postEndata({
    tvType: 2,
    MethodName: 'BoxOffice_GetTvData_PlayIndexRank',
  });

  const table = dataJson?.Data?.Table;
  if (!table || !table.length) return createDataFrame([], []);

  const reportDate = dataJson?.Data?.Table1?.[0]?.MaxDate ?? '';

  const allColumns = ['排序', '名称', '类型', '播映指数', '用户热度', '媒体热度', '观看度', '好评度'];
  const keepColumns = ['排序', '名称', '类型', '播映指数', '媒体热度', '用户热度', '好评度', '观看度'];

  const data = table.map((item: any) => {
    const values = Object.values(item);
    const row: Record<string, any> = {};
    allColumns.forEach((col, i) => {
      row[col] = values[i];
    });
    return [...keepColumns.map(col => row[col] ?? null), reportDate];
  });

  return createDataFrame([...keepColumns, '统计日期'], data);
}

// ---------------------------------------------------------------------------
// 艺恩-视频放映-综艺节目
// ---------------------------------------------------------------------------

/**
 * 艺恩-视频放映-综艺节目
 * https://www.endata.com.cn/Video/index.html
 */
export async function video_variety_show(): Promise<DataFrame> {
  const dataJson = await postEndata({
    tvType: 8,
    MethodName: 'BoxOffice_GetTvData_PlayIndexRank',
  });

  const table = dataJson?.Data?.Table;
  if (!table || !table.length) return createDataFrame([], []);

  const reportDate = dataJson?.Data?.Table1?.[0]?.MaxDate ?? '';

  const allColumns = ['排序', '名称', '类型', '播映指数', '用户热度', '媒体热度', '观看度', '好评度'];
  const keepColumns = ['排序', '名称', '类型', '播映指数', '媒体热度', '用户热度', '好评度', '观看度'];

  const data = table.map((item: any) => {
    const values = Object.values(item);
    const row: Record<string, any> = {};
    allColumns.forEach((col, i) => {
      row[col] = values[i];
    });
    return [...keepColumns.map(col => row[col] ?? null), reportDate];
  });

  return createDataFrame([...keepColumns, '统计日期'], data);
}
