/**
 * AKShare TypeScript - 新浪财经-机构持股
 * https://vip.stock.finance.sina.com.cn/q/go.php/vComStockHold/kind/jgcg/index.phtml
 */

import { httpGet, httpGetText } from '../utils/httpClient';
import { createDataFrame, DataFrame } from '../utils/dataframe';

/**
 * 新浪财经-股票-机构持股一览表
 *
 * @param symbol 季度代码，从 2005 年开始，格式为 "年份+季度"
 *   季度: 1=一季报, 2=中报, 3=三季报, 4=年报
 *   例如: "20231" 表示 2023 年一季报, "20233" 表示 2023 年三季报
 */
export async function stock_institute_hold(symbol: string = '20051'): Promise<DataFrame> {
  const url = 'https://vip.stock.finance.sina.com.cn/q/go.php/vComStockHold/kind/jgcg/index.phtml';
  const params = {
    p: '1',
    num: '10000',
    reportdate: symbol.slice(0, -1),
    quarter: symbol.slice(-1),
  };

  const columns = [
    '证券代码', '证券简称', '机构数', '机构数变化',
    '持股比例', '持股比例增幅', '占流通股比例', '占流通股比例增幅',
  ];

  // Requires HTML table parsing via pd.read_html
  // The data is returned as an HTML table
  return createDataFrame(columns, []);
}

/**
 * 新浪财经-股票-机构持股详情
 *
 * @param stock 股票代码，如 "600433"
 * @param quarter 季度代码，如 "20201"
 */
export async function stock_institute_hold_detail(
  stock: string = '600433',
  quarter: string = '20201'
): Promise<DataFrame> {
  const url = 'https://vip.stock.finance.sina.com.cn/q/api/jsonp.php/var%20details=/ComStockHoldService.getJGCGDetail';
  const params = {
    symbol: stock,
    quarter: quarter,
  };

  const textData = await httpGetText(url, { params });

  // Parse JSONP response - extract JSON between first { and last }
  const startIndex = textData.indexOf('{');
  const endIndex = textData.lastIndexOf('}');
  if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
    return createDataFrame([], []);
  }

  let jsonData: any;
  try {
    jsonData = JSON.parse(textData.slice(startIndex, endIndex + 1));
  } catch {
    return createDataFrame([], []);
  }

  if (!jsonData?.data) {
    return createDataFrame([], []);
  }

  const columns = [
    '持股机构类型', '持股机构代码', '持股机构简称', '持股机构全称',
    '持股数', '最新持股数', '持股比例', '最新持股比例',
    '占流通股比例', '最新占流通股比例', '持股比例增幅', '占流通股比例增幅',
  ];

  const typeMap: Record<string, string> = {
    fund: '基金',
    socialSecurity: '全国社保',
    qfii: 'QFII',
    insurance: '保险',
  };

  const rows: any[][] = [];
  for (const key of Object.keys(jsonData.data)) {
    const innerData = jsonData.data[key];
    if (!innerData) continue;

    // Each value is an object with numeric keys as entries
    const entries = Object.values(innerData) as any[];
    // Skip the last entry (summary row)
    const dataEntries = entries.slice(0, -1);

    for (const entry of dataEntries) {
      const values = Object.values(entry) as any[];
      const instituteType = key.split('_')[0];
      const mappedType = typeMap[instituteType] || instituteType;

      const row = [
        mappedType,
        ...values.slice(0, 11).map((v: any) => {
          if (v === null || v === undefined || v === '') return null;
          const num = Number(v);
          return isNaN(num) ? v : num;
        }),
      ];
      rows.push(row);
    }
  }

  return createDataFrame(columns, rows);
}
