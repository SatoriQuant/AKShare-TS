/**
 * AKShare TypeScript - 盖世汽车-汽车行业制造企业数据库-销量数据
 * https://i.gasgoo.com/data/ranking
 */

import { httpPost } from '../utils/httpClient';
import { createDataFrame, fromRecords, DataFrame } from '../utils/dataframe';

const SYMBOL_MAP: Record<string, string> = {
  '车型榜': 'M',
  '车企榜': 'F',
  '品牌榜': 'B',
};

/**
 * 盖世汽车-汽车行业制造企业数据库-销量数据
 * https://i.gasgoo.com/data/ranking
 *
 * @param symbol "车企榜" | "品牌榜" | "车型榜"
 * @param date 查询的年份和月份，格式 YYYYMM
 */
export async function car_sale_rank_gasgoo(
  symbol: '车企榜' | '品牌榜' | '车型榜' = '车企榜',
  date: string = '202109'
): Promise<DataFrame> {
  const rankType = SYMBOL_MAP[symbol];
  if (!rankType) {
    throw new Error(`symbol 仅支持 ${Object.keys(SYMBOL_MAP).join(', ')}, 当前传入: ${symbol}`);
  }

  const url = 'https://i.gasgoo.com/data/sales/AutoModelSalesRank.aspx/GetSalesRank';
  const payload = {
    countryID: '',
    endM: String(parseInt(date.slice(4, 6), 10)),
    endY: date.slice(0, 4),
    energy: '',
    modelGradeID: '',
    modelTypeID: '',
    orderBy: `${date.slice(0, 4)}-${parseInt(date.slice(4, 6), 10)}`,
    queryDate: `${date.slice(0, 4)}-${parseInt(date.slice(4, 6), 10)}`,
    rankType: rankType,
    startY: date.slice(0, 4),
    startM: String(parseInt(date.slice(4, 6), 10)),
  };

  const headers = {
    'Accept': 'application/json, text/javascript, */*; q=0.01',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    'Cache-Control': 'no-cache',
    'Content-Type': 'application/json; charset=UTF-8',
    'Host': 'i.gasgoo.com',
    'Origin': 'https://i.gasgoo.com',
    'Pragma': 'no-cache',
    'Referer': 'https://i.gasgoo.com/data/sales/AutoModelSalesRank.aspx/GetSalesRank',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36',
    'X-Requested-With': 'XMLHttpRequest',
  };

  const resp = await httpPost<any>(url, payload, { headers });

  // The response's `d` field is a JSON string that needs parsing
  let rawData: any[];
  if (typeof resp?.d === 'string') {
    try {
      rawData = JSON.parse(resp.d);
    } catch {
      // demjson in Python is more lenient; try a relaxed parse
      rawData = JSON.parse(resp.d.replace(/'/g, '"'));
    }
  } else if (Array.isArray(resp?.d)) {
    rawData = resp.d;
  } else {
    return createDataFrame([], []);
  }

  if (!rawData || !rawData.length) return createDataFrame([], []);

  return fromRecords(rawData);
}
