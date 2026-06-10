/**
 * AKShare TypeScript - 东方财富知名美股数据接口
 * https://quote.eastmoney.com/center/gridlist.html#us_wellknown
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 东方财富-美股市场-知名美股
 * https://quote.eastmoney.com/center/gridlist.html#us_wellknown
 *
 * @param category 分类，可选值：科技类, 金融类, 医药食品类, 媒体类, 汽车能源类, 制造零售类
 */
export async function stock_us_famous_spot_em(
  category: '科技类' | '金融类' | '医药食品类' | '媒体类' | '汽车能源类' | '制造零售类' = '科技类'
): Promise<DataFrame> {
  const marketMap: Record<string, string> = {
    '科技类': '0216',
    '金融类': '0217',
    '医药食品类': '0218',
    '媒体类': '0220',
    '汽车能源类': '0219',
    '制造零售类': '0221',
  };

  const url = 'https://69.push2.eastmoney.com/api/qt/clist/get';
  const params = {
    pn: '1',
    pz: '50000',
    po: '1',
    np: '2',
    ut: 'bd1d9ddb04089700cf9c27f6f7426281',
    fltt: '2',
    invt: '2',
    fid: 'f3',
    fs: `b:MK${marketMap[category]}`,
    fields: 'f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f12,f13,f14,f15,f16,f17,f18,f20,f21,f23,f24,f25,f26,f22,f33,f11,f62,f128,f136,f115,f152',
  };

  try {
    const data = await httpGet<any>(url, { params });

    if (!data?.data?.diff) {
      return createDataFrame([], []);
    }

    const columns = [
      '序号', '名称', '最新价', '涨跌额', '涨跌幅',
      '开盘价', '最高价', '最低价', '昨收价', '总市值', '市盈率', '代码',
    ];

    const diff = data.data.diff;
    const rows: any[][] = [];
    let index = 1;

    // diff may be an object with numeric keys or an array
    const items = Array.isArray(diff) ? diff : Object.values(diff);

    for (const item of items) {
      const code = `${(item as any).f13}.${(item as any).f12}`;
      rows.push([
        index++,
        (item as any).f14,  // 名称
        (item as any).f2,   // 最新价
        (item as any).f4,   // 涨跌额
        (item as any).f3,   // 涨跌幅
        (item as any).f17,  // 开盘价
        (item as any).f15,  // 最高价
        (item as any).f16,  // 最低价
        (item as any).f18,  // 昨收价
        (item as any).f20,  // 总市值
        (item as any).f26,  // 市盈率
        code,               // 代码
      ]);
    }

    return createDataFrame(columns, rows);
  } catch (error) {
    return createDataFrame([], []);
  }
}
