/**
 * AKShare TypeScript - FF-data-library
 * https://mba.tuck.dartmouth.edu/pages/faculty/ken.french/data_library.html
 */

import { httpGet } from '../utils/httpClient';
import { createDataFrame, DataFrame } from '../utils/dataframe';

/**
 * FF多因子模型
 * https://mba.tuck.dartmouth.edu/pages/faculty/ken.french/data_library.html
 * @returns FF多因子模型单一表格
 */
export async function article_ff_crr(): Promise<DataFrame> {
  const url = 'http://mba.tuck.dartmouth.edu/pages/faculty/ken.french/data_library.html';
  const response = await httpGet<string>(url);

  // Parse HTML tables
  const tableMatch = response.match(/<table[^>]*>[\s\S]*?<\/table>/gi);
  if (!tableMatch || tableMatch.length < 5) {
    return createDataFrame([], []);
  }

  const table = tableMatch[4]; // 5th table (index 4)
  const rows: any[][] = [];

  // Extract rows from table
  const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let rowMatch;

  while ((rowMatch = rowRegex.exec(table)) !== null) {
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

  // Process the data according to the Python implementation
  // This is a simplified version - the original Python code is quite complex
  const columns = rows.length > 0 ? ['item', ...rows[0].slice(1)] : [];
  const data = rows.slice(1);

  return createDataFrame(columns, data);
}
