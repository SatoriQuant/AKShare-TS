/**
 * AKShare TypeScript - 经济政策不确定性指数
 * https://www.policyuncertainty.com/index.html
 */

import { httpGet } from '../utils/httpClient';
import { createDataFrame, DataFrame } from '../utils/dataframe';

/**
 * 经济政策不确定性指数
 * https://www.policyuncertainty.com/index.html
 * @param symbol 指定的国家名称, e.g. "China"
 * @returns 经济政策不确定性指数数据
 */
export async function article_epu_index(symbol: string = 'China'): Promise<DataFrame> {
  let url: string;
  let isExcel = false;

  // Handle different symbol mappings
  if (symbol === 'China New' || symbol === 'China') {
    symbol = 'SCMP_China';
  } else if (symbol === 'USA') {
    symbol = 'US';
  } else if (symbol === 'Hong Kong') {
    symbol = 'HK';
    isExcel = true;
  } else if (['Germany', 'France', 'Italy'].includes(symbol)) {
    symbol = 'Europe';
  } else if (symbol === 'South Korea') {
    symbol = 'Korea';
  } else if (symbol === 'Spain New') {
    symbol = 'Spain';
  } else if (['Ireland', 'Chile', 'Colombia', 'Netherlands', 'Singapore', 'Sweden'].includes(symbol)) {
    isExcel = true;
  } else if (symbol === 'Greece') {
    symbol = `FKT_${symbol}`;
    isExcel = true;
  }

  if (isExcel) {
    // For Excel files, we need to handle differently
    // In a real implementation, you'd use a library like xlsx
    throw new Error('Excel file parsing not implemented. Use CSV format instead.');
  }

  url = `http://www.policyuncertainty.com/media/${symbol}_Policy_Uncertainty_Data.csv`;
  const response = await httpGet<string>(url);

  // Parse CSV
  const lines = response.split('\n').filter(line => line.trim());
  if (lines.length === 0) {
    return createDataFrame([], []);
  }

  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const data: any[][] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
    if (values.length === headers.length) {
      data.push(values.map(v => {
        const num = parseFloat(v);
        return isNaN(num) ? v : num;
      }));
    }
  }

  return createDataFrame(headers, data);
}
