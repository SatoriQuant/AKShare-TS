/**
 * AKShare TypeScript - 中国金融期货交易所-数据-交易参数
 * http://www.cffex.com.cn/jycs/
 */

import { httpGet } from '../utils/httpClient';
import { createDataFrame, DataFrame } from '../utils/dataframe';

/**
 * 简单的 XML 解析: 提取指定标签下的子元素数据
 */
function parseXmlRecords(xml: string, tagName: string): Record<string, string>[] {
  const records: Record<string, string>[] = [];
  const tagRegex = new RegExp(`<${tagName}>[\\s\\S]*?<\\/${tagName}>`, 'gi');
  const matches = xml.match(tagRegex);

  if (!matches) return records;

  for (const match of matches) {
    const record: Record<string, string> = {};
    const fieldRegex = /<([A-Z_]+)>([\s\S]*?)<\/\1>/g;
    let fieldMatch;

    while ((fieldMatch = fieldRegex.exec(match)) !== null) {
      record[fieldMatch[1]] = fieldMatch[2].trim();
    }

    records.push(record);
  }

  return records;
}

/**
 * 中国金融期货交易所-数据-交易参数
 * http://www.cffex.com.cn/jycs/
 *
 * @param date 查询日期，格式 "YYYYMMDD"
 */
export async function futures_contract_info_cffex(
  date: string = '20240228'
): Promise<DataFrame> {
  const yearMonth = date.slice(0, 6);
  const day = date.slice(6);
  const url = `http://www.cffex.com.cn/sj/jycs/${yearMonth}/${day}/index.xml`;

  const xml = await httpGet<string>(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
    },
    responseType: 'text' as any,
  });

  const records = parseXmlRecords(xml, 'INDEX');

  if (records.length === 0) {
    return createDataFrame([], []);
  }

  const columnMap: Record<string, string> = {
    TRADING_DAY: '查询交易日',
    PRODUCT_ID: '品种',
    INSTRUMENT_ID: '合约代码',
    INSTRUMENT_MONTH: '合约月份',
    BASIS_PRICE: '挂盘基准价',
    OPEN_DATE: '上市日',
    END_TRADING_DAY: '最后交易日',
    UPPER_VALUE: '涨停板幅度',
    LOWER_VALUE: '跌停板幅度',
    UPPERLIMITPRICE: '涨停板价位',
    LOWERLIMITPRICE: '跌停板价位',
    LONG_LIMIT: '持仓限额',
  };

  const columns = [
    '合约代码', '合约月份', '挂盘基准价', '上市日', '最后交易日',
    '涨停板幅度', '跌停板幅度', '涨停板价位', '跌停板价位', '持仓限额', '品种', '查询交易日',
  ];

  const rows = records.map((record) => {
    const mapped: Record<string, string> = {};
    for (const [key, value] of Object.entries(record)) {
      const cnKey = columnMap[key] || key;
      mapped[cnKey] = value;
    }

    return columns.map((col) => {
      const val = mapped[col] || '';
      // 数值列转换
      if (['挂盘基准价', '涨停板价位', '跌停板价位', '持仓限额'].includes(col)) {
        const num = parseFloat(val);
        return isNaN(num) ? val : num;
      }
      // 日期列转换: YYYYMMDD -> YYYY-MM-DD
      if (['查询交易日', '上市日', '最后交易日'].includes(col)) {
        if (val.length === 8) {
          return `${val.slice(0, 4)}-${val.slice(4, 6)}-${val.slice(6)}`;
        }
      }
      return val;
    });
  });

  // 按合约代码降序排序
  rows.sort((a, b) => {
    const codeA = String(a[0]);
    const codeB = String(b[0]);
    return codeB.localeCompare(codeA);
  });

  return createDataFrame(columns, rows);
}
