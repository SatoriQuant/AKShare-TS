/**
 * AKShare TypeScript - 商品现货价格指数
 * 新浪财经-商品现货价格指数
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 新浪财经-商品现货价格指数
 * https://finance.sina.com.cn/futuremarket/spotprice.shtml#titlePos_0
 *
 * @param symbol 选择: "波罗的海干散货指数", "钢坯价格指数", "澳大利亚粉矿价格"
 */
export async function spot_goods(
  symbol: '波罗的海干散货指数' | '钢坯价格指数' | '澳大利亚粉矿价格' = '波罗的海干散货指数'
): Promise<DataFrame> {
  const symbolMap: Record<string, string> = {
    '波罗的海干散货指数': 'BDI',
    '钢坯价格指数': 'GP',
    '澳大利亚粉矿价格': 'PB',
  };

  const url = 'https://stock.finance.sina.com.cn/futures/api/openapi.php/GoodsIndexService.get_goods_index';
  const params = {
    symbol: symbolMap[symbol],
    table: '0',
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.result?.data?.data) {
    return createDataFrame([], []);
  }

  const columns = ['日期', '指数', '涨跌额', '涨跌幅'];

  const rows = data.result.data.data.map((item: any) => [
    item.opendate,
    parseFloat(item.price),
    parseFloat(item.zde),
    parseFloat(item.zdf),
  ]).filter((row: any[]) => row.every(v => v !== null && v !== undefined && !isNaN(v)));

  return createDataFrame(columns, rows);
}

/**
 * 沐甜科技数据中心-中国食糖指数
 * https://www.msweet.com.cn/mtkj/sjzx13/index.html
 */
export async function index_sugar_msweet(): Promise<DataFrame> {
  const url = 'https://www.msweet.com.cn/eportal/ui';
  const params = {
    'struts.portlet.action': '/portlet/price!getSTZSJson.action',
    moduleId: 'cb752447cfe24b44b18c7a7e9abab048',
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.category || !data?.data) {
    return createDataFrame([], []);
  }

  const columns = ['日期', '综合价格', '原糖价格', '现货价格'];

  const rows = data.category.map((date: string, idx: number) => [
    date,
    parseFloat(data.data[0]?.[idx] ?? 'NaN'),
    parseFloat(data.data[1]?.[idx] ?? 'NaN'),
    parseFloat(data.data[2]?.[idx] ?? 'NaN'),
  ]);

  return createDataFrame(columns, rows);
}
