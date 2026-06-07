/**
 * AKShare TypeScript - 真气网-空气质量
 * https://www.zq12369.com/environment.php
 */

import { httpGet, httpPost } from '../utils/httpClient';
import { createDataFrame, DataFrame } from '../utils/dataframe';

/**
 * 真气网-空气质量历史数据查询-全部城市列表
 * https://www.zq12369.com/environment.php?date=2019-06-05&tab=rank&order=DESC&type=DAY#rank
 * @returns 城市映射
 */
export async function air_city_table(): Promise<DataFrame> {
  const url = 'https://www.zq12369.com/environment.php';
  const date = '2020-05-01';
  const params = {
    date,
    tab: 'rank',
    order: 'DESC',
    type: 'DAY',
  };

  const response = await httpGet<string>(url, { params });

  // Parse HTML table
  const tableMatch = response.match(/<table[^>]*>[\s\S]*?<\/table>/gi);
  if (!tableMatch || tableMatch.length < 2) {
    return createDataFrame([], []);
  }

  const table = tableMatch[1]; // Second table
  const rows: any[][] = [];

  // Extract rows from table
  const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let rowMatch;
  let isFirstRow = true;

  while ((rowMatch = rowRegex.exec(table)) !== null) {
    if (isFirstRow) {
      isFirstRow = false;
      continue; // Skip header
    }

    const cells: string[] = [];
    const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
    let cellMatch;

    while ((cellMatch = cellRegex.exec(rowMatch[1])) !== null) {
      cells.push(cellMatch[1].replace(/<[^>]+>/g, '').trim());
    }

    if (cells.length >= 7) {
      rows.push([
        cells[0], // 序号
        cells[1], // 省份
        cells[2], // 城市
        parseFloat(cells[3]) || 0, // AQI
        cells[4], // 空气质量
        parseFloat(cells[5]) || 0, // PM2.5浓度
        cells[6], // 首要污染物
      ]);
    }
  }

  const columns = ['序号', '省份', '城市', 'AQI', '空气质量', 'PM2.5浓度', '首要污染物'];
  return createDataFrame(columns, rows);
}

/**
 * 真气网-监测点空气质量-细化到具体城市的每个监测点
 * 指定时间段时间的空气质量数据
 * https://www.zq12369.com/
 * @param city 调用 air_city_table() 接口获取
 * @param start_date 开始日期, e.g., "20190327"
 * @param end_date 结束日期, e.g., "20200327"
 * @returns 指定城市指定日期区间的观测点空气质量
 */
export async function air_quality_watch_point(
  city: string = '杭州',
  start_date: string = '20220408',
  end_date: string = '20220409'
): Promise<DataFrame> {
  const formattedStartDate = `${start_date.slice(0, 4)}-${start_date.slice(4, 6)}-${start_date.slice(6, 8)}`;
  const formattedEndDate = `${end_date.slice(0, 4)}-${end_date.slice(4, 6)}-${end_date.slice(6, 8)}`;

  const url = 'https://www.zq12369.com/api/zhenqiapi.php';
  const payload = {
    appId: 'a01901d3caba1f362d69474674ce477f',
    method: 'GETCITYPOINTAVG',
    city,
    startTime: formattedStartDate,
    endTime: formattedEndDate,
  };

  const response = await httpPost<any>(url, payload);

  if (!response || !response.rows || !Array.isArray(response.rows)) {
    return createDataFrame([], []);
  }

  // Convert response rows to DataFrame
  const records = response.rows;
  if (records.length === 0) {
    return createDataFrame([], []);
  }

  const columns = Object.keys(records[0]);
  const data = records.map((record: any) => columns.map(col => record[col]));

  return createDataFrame(columns, data);
}

/**
 * 真气网-空气历史数据
 * https://www.zq12369.com/
 * @param city 调用 air_city_table() 接口获取所有城市列表
 * @param period "hour": 每小时一个数据, "day": 每天一个数据, "month": 每个月一个数据
 * @param start_date 开始日期, e.g., "20190327"
 * @param end_date 结束日期, e.g., "20200327"
 * @returns 指定城市和数据频率下在指定时间段内的空气质量数据
 */
export async function air_quality_hist(
  city: string = '杭州',
  period: string = 'day',
  start_date: string = '20190327',
  end_date: string = '20200427'
): Promise<DataFrame> {
  const formattedStartDate = `${start_date.slice(0, 4)}-${start_date.slice(4, 6)}-${start_date.slice(6, 8)}`;
  const formattedEndDate = `${end_date.slice(0, 4)}-${end_date.slice(4, 6)}-${end_date.slice(6, 8)}`;

  const url = 'https://www.zq12369.com/api/newzhenqiapi.php';
  const payload = {
    appId: '4f0e3a273d547ce6b7147bfa7ceb4b6e',
    method: 'CETCITYPERIOD',
    object: {
      city,
      type: period.toUpperCase(),
      startTime: `${formattedStartDate} 00:00:00`,
      endTime: `${formattedEndDate} 23:45:39`,
    },
  };

  const response = await httpPost<any>(url, payload);

  if (!response || !response.result || !response.result.data || !response.result.data.rows) {
    return createDataFrame([], []);
  }

  const records = response.result.data.rows;
  if (records.length === 0) {
    return createDataFrame([], []);
  }

  const columns = Object.keys(records[0]);
  const data = records.map((record: any) => columns.map(col => record[col]));

  return createDataFrame(columns, data);
}

/**
 * 真气网-168 城市 AQI 排行榜
 * https://www.zq12369.com/environment.php?date=2020-03-12&tab=rank&order=DESC&type=DAY#rank
 * @param date "": 当前时刻空气质量排名; "20200312": 当日空气质量排名; "202003": 当月空气质量排名; "2019": 当年空气质量排名
 * @returns 指定 date 类型的空气质量排名数据
 */
export async function air_quality_rank(date: string = ''): Promise<DataFrame> {
  const url = 'https://www.zq12369.com/environment.php';
  let params: any;

  if (date === '') {
    params = {
      tab: 'rank',
      order: 'DESC',
      type: 'MONTH',
    };
  } else if (date.length === 4) {
    params = {
      year: date,
      tab: 'rank',
      order: 'DESC',
      type: 'YEAR',
    };
  } else if (date.length === 6) {
    params = {
      month: `${date.slice(0, 4)}-${date.slice(4, 6)}`,
      tab: 'rank',
      order: 'DESC',
      type: 'MONTH',
    };
  } else {
    params = {
      date: `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`,
      tab: 'rank',
      order: 'DESC',
      type: 'DAY',
    };
  }

  const response = await httpGet<string>(url, { params });

  // Parse HTML table
  const tableMatch = response.match(/<table[^>]*>[\s\S]*?<\/table>/gi);
  if (!tableMatch) {
    return createDataFrame([], []);
  }

  let tableIndex = 0;
  if (date.length === 8) tableIndex = 1;
  else if (date.length === 6) tableIndex = 2;
  else if (date.length === 4) tableIndex = 3;

  const table = tableMatch[tableIndex];
  const rows: any[][] = [];

  // Extract rows from table
  const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let rowMatch;
  let isFirstRow = true;

  while ((rowMatch = rowRegex.exec(table)) !== null) {
    if (isFirstRow) {
      isFirstRow = false;
      continue; // Skip header
    }

    const cells: string[] = [];
    const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
    let cellMatch;

    while ((cellMatch = cellRegex.exec(rowMatch[1])) !== null) {
      cells.push(cellMatch[1].replace(/<[^>]+>/g, '').trim());
    }

    if (cells.length > 0) {
      rows.push(cells);
    }
  }

  // Determine columns based on the table content
  const columns = rows.length > 0 ? rows[0].map((_, i) => `列${i + 1}`) : [];
  return createDataFrame(columns, rows.length > 1 ? rows.slice(1) : []);
}
