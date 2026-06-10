/**
 * AKShare TypeScript - FF-data-library
 * https://mba.tuck.dartmouth.edu/pages/faculty/ken.french/data_library.html
 */

import { load } from 'cheerio';
import { httpGet } from '../utils/httpClient';
import { runPythonDataFrameFunction } from '../utils/pythonBridge';
import { createDataFrame, DataFrame } from '../utils/dataframe';

/**
 * FF多因子模型
 * https://mba.tuck.dartmouth.edu/pages/faculty/ken.french/data_library.html
 * @returns FF多因子模型单一表格
 */
export async function article_ff_crr(): Promise<DataFrame> {
  const url = 'http://mba.tuck.dartmouth.edu/pages/faculty/ken.french/data_library.html';
  const response = await httpGet<string>(url);

  const $ = load(response);
  const tables = $('table');
  if (tables.length < 5) {
    const fallback = await runPythonDataFrameFunction('article_ff_crr');
    return fallback.ok && fallback.columns && fallback.data ? createDataFrame(fallback.columns, fallback.data) : createDataFrame([], []);
  }

  const table = tables.eq(4);
  const rows: string[][] = [];

  table.find('tr').each((_, tr) => {
    const cells = $(tr)
      .find('th,td')
      .map((__, cell) => $(cell).text().replace(/\s+/g, ' ').trim())
      .get()
      .filter(Boolean);

    if (cells.length > 0) {
      rows.push(cells);
    }
  });

  if (rows.length < 10) {
    const fallback = await runPythonDataFrameFunction('article_ff_crr');
    return fallback.ok && fallback.columns && fallback.data ? createDataFrame(fallback.columns, fallback.data) : createDataFrame([], []);
  }

  return createDataFrame(rows[0], rows.slice(1));
}
