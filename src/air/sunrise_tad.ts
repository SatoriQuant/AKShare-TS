/**
 * AKShare TypeScript - 日出和日落数据
 * https://www.timeanddate.com
 */

import { httpGet } from '../utils/httpClient';
import { createDataFrame, DataFrame } from '../utils/dataframe';

/**
 * 查询日出与日落数据的城市列表
 * https://www.timeanddate.com/astronomy/china
 * @returns 所有可以获取的数据的城市列表
 */
export async function sunrise_city_list(): Promise<string[]> {
  const url = 'https://www.timeanddate.com/astronomy/china';
  const response = await httpGet<string>(url);

  const cityList: string[] = [];

  // Parse HTML tables to extract city names
  const tableMatch = response.match(/<table[^>]*>[\s\S]*?<\/table>/gi);
  if (!tableMatch || tableMatch.length < 3) {
    return cityList;
  }

  // Extract cities from first table (china_city_one_df)
  const table1 = tableMatch[1];
  const rowRegex1 = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let rowMatch1;

  while ((rowMatch1 = rowRegex1.exec(table1)) !== null) {
    const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
    let cellMatch;
    let cellIndex = 0;

    while ((cellMatch = cellRegex.exec(rowMatch1[1])) !== null) {
      const cityName = cellMatch[1].replace(/<[^>]+>/g, '').trim().toLowerCase();
      if (cityName && cellIndex % 3 === 0) { // First column of each group
        cityList.push(cityName);
      }
      cellIndex++;
    }
  }

  // Extract cities from second table (china_city_two_df)
  const table2 = tableMatch[2];
  const rowRegex2 = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let rowMatch2;

  while ((rowMatch2 = rowRegex2.exec(table2)) !== null) {
    const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
    let cellMatch;

    while ((cellMatch = cellRegex.exec(rowMatch2[1])) !== null) {
      const cityName = cellMatch[1].replace(/<[^>]+>/g, '').trim().toLowerCase();
      if (cityName) {
        cityList.push(cityName);
      }
    }
  }

  return cityList;
}

/**
 * 每日日出日落数据
 * https://www.timeanddate.com/astronomy/china/shaoxing
 * @param date 需要查询的日期, e.g., "20200428"
 * @param city 需要查询的城市; 注意输入的格式, e.g., "beijing", "shanghai"
 * @returns 返回指定日期指定地区的日出日落数据
 */
export async function sunrise_daily(
  date: string = '20240428',
  city: string = 'beijing'
): Promise<DataFrame> {
  const year = date.slice(0, 4);
  const month = date.slice(4, 6);
  const day = date.slice(6, 8);

  const url = `https://www.timeanddate.com/sun/china/${city}?month=${month}&year=${year}`;
  const response = await httpGet<string>(url);

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
  let headerSkipped = false;

  while ((rowMatch = rowRegex.exec(table)) !== null) {
    if (!headerSkipped) {
      headerSkipped = true;
      continue; // Skip header
    }

    const cells: string[] = [];
    const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
    let cellMatch;

    while ((cellMatch = cellRegex.exec(rowMatch[1])) !== null) {
      cells.push(cellMatch[1].replace(/<[^>]+>/g, '').trim());
    }

    if (cells.length >= 2 && cells[0].padStart(2, '0') === day) {
      rows.push([
        `${year}-${month}-${day}`,
        ...cells.slice(1),
      ]);
    }
  }

  const columns = ['date', 'Sunrise', 'Sunset', 'Length', 'Difference', 'Astronomical Twilight', 'Nautical Twilight', 'Civil Twilight', 'Day Length'];
  return createDataFrame(columns.slice(0, rows[0]?.length || 0), rows);
}

/**
 * 每个指定 date 所在月份的每日日出日落数据, 如果当前月份未到月底, 则以预测值填充
 * https://www.timeanddate.com/astronomy/china/shaoxing
 * @param date 需要查询的日期, 这里用来指定 date 所在的月份; e.g., "20200428"
 * @param city 需要查询的城市; 注意输入的格式, e.g., "beijing", "shanghai"
 * @returns 指定 date 所在月份的每日日出日落数据
 */
export async function sunrise_monthly(
  date: string = '20240428',
  city: string = 'beijing'
): Promise<DataFrame> {
  const year = date.slice(0, 4);
  const month = date.slice(4, 6);

  const url = `https://www.timeanddate.com/sun/china/${city}?month=${month}&year=${year}`;
  const response = await httpGet<string>(url);

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
  let headerSkipped = false;

  while ((rowMatch = rowRegex.exec(table)) !== null) {
    if (!headerSkipped) {
      headerSkipped = true;
      continue; // Skip header
    }

    const cells: string[] = [];
    const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
    let cellMatch;

    while ((cellMatch = cellRegex.exec(rowMatch[1])) !== null) {
      cells.push(cellMatch[1].replace(/<[^>]+>/g, '').trim());
    }

    if (cells.length >= 2) {
      rows.push([
        `${year}-${month}`,
        ...cells,
      ]);
    }
  }

  const columns = ['date', 'Day', 'Sunrise', 'Sunset', 'Length', 'Difference', 'Astronomical Twilight', 'Nautical Twilight', 'Civil Twilight', 'Day Length'];
  return createDataFrame(columns.slice(0, rows[0]?.length || 0), rows);
}
