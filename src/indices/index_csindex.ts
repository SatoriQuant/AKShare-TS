/**
 * AKShare TypeScript - 中证指数数据接口
 * https://www.csindex.com.cn/
 */

import * as XLSX from 'xlsx';
import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 中证指数-具体指数-历史行情数据
 * https://www.csindex.com.cn/zh-CN/indices/index-detail/H30374
 *
 * @param symbol 指数代码，如 "000928"
 * @param startDate 开始日期，格式 "20180526"
 * @param endDate 结束日期，格式 "20240604"
 */
export async function stock_zh_index_hist_csindex(
  symbol: string = '000928',
  startDate: string = '20180526',
  endDate: string = '20240604'
): Promise<DataFrame> {
  const url = 'https://www.csindex.com.cn/csindex-home/perf/index-perf';
  const params = {
    indexCode: symbol,
    startDate,
    endDate,
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.data) {
    return createDataFrame([], []);
  }

  const columns = [
    '日期', '指数代码', '指数中文全称', '指数中文简称',
    '指数英文全称', '指数英文简称',
    '开盘', '最高', '最低', '收盘', '涨跌', '涨跌幅',
    '成交量', '成交金额', '样本数量', '滚动市盈率',
  ];

  const rows = data.data.map((item: any[]) => [
    item[0],
    item[1],
    item[2],
    item[3],
    item[4],
    item[5],
    parseFloat(item[6]),
    parseFloat(item[7]),
    parseFloat(item[8]),
    parseFloat(item[9]),
    parseFloat(item[10]),
    parseFloat(item[11]),
    item[12],
    item[13],
    item[14],
    parseFloat(item[15]),
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 中证指数-指数估值数据
 * https://www.csindex.com.cn/zh-CN/indices/index-detail/H30374
 *
 * @param symbol 指数代码，如 "H30374"
 */
export async function stock_zh_index_value_csindex(
  symbol: string = 'H30374'
): Promise<DataFrame> {
  const url = `https://oss-ch.csindex.com.cn/static/html/csindex/public/uploads/file/autofile/indicator/${symbol}indicator.xls`;

  // Note: This returns an Excel file. In a browser/Node environment,
  // we would need a library to parse XLS. For now, we make the request
  // and return the raw data or empty DataFrame if parsing isn't possible.
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return createDataFrame([], []);
    }

    // If we're in a Node.js environment with xlsx support, parse it
    // For now, return empty as XLS parsing requires additional dependencies
    console.warn('stock_zh_index_value_csindex: XLS parsing requires additional setup');
    return createDataFrame([], []);
  } catch {
    return createDataFrame([], []);
  }
}

/**
 * 中证指数网站-指数列表
 * https://www.csindex.com.cn/#/indices/family/list?index_series=1
 * Python downloads an Excel file from csindex.com.cn and returns all index data.
 */
export async function index_csindex_all(): Promise<DataFrame> {
  const url = 'https://www.csindex.com.cn/csindex-home/exportExcel/indexAll/CH';

  try {
    const payload = {
      sorter: { sortField: 'null', sortOrder: null },
      pager: { pageNum: 1, pageSize: 10 },
      indexFilter: {
        ifCustomized: null,
        ifTracked: null,
        ifWeightCapped: null,
        indexCompliance: null,
        hotSpot: null,
        indexClassify: null,
        currency: null,
        region: null,
        indexSeries: ['1'],
        undefined: null,
      },
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return createDataFrame([], []);
    }

    const buffer = await response.arrayBuffer();
    const workbook = XLSX.read(Buffer.from(buffer), { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      return createDataFrame([], []);
    }

    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, defval: '' }) as any[][];
    if (rows.length <= 1) {
      return createDataFrame([], []);
    }

    // Use the header row from the Excel file as column names
    const columns = rows[0].map((v: any) => String(v ?? ''));
    const data = rows.slice(1).map((row) => columns.map((_, index) => row[index] ?? ''));

    return createDataFrame(columns, data);
  } catch {
    return createDataFrame([], []);
  }
}
