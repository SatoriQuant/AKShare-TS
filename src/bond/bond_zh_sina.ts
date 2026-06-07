/**
 * AKShare TypeScript - 新浪财经债券数据接口
 * 新浪财经-债券-沪深债券-实时行情数据和历史行情数据
 * https://vip.stock.finance.sina.com.cn/mkt/#hs_z
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 新浪财经-债券-沪深债券-实时行情数据
 * https://vip.stock.finance.sina.com.cn/mkt/#hs_z
 *
 * @param startPage 分页起始页
 * @param endPage 分页结束页
 */
export async function bond_zh_hs_spot(
  startPage: string = '1',
  endPage: string = '10'
): Promise<DataFrame> {
  const url =
    'http://vip.stock.finance.sina.com.cn/quotes_service/api/json_v2.php/Market_Center.getHQNodeData';
  const countUrl =
    'http://vip.stock.finance.sina.com.cn/quotes_service/api/json_v2.php/Market_Center.getHQNodeStockCountSimple';

  try {
    // 获取总页数
    const countData = await httpGet<string>(countUrl, {
      params: { node: 'hs_z' },
      responseType: 'text' as any,
    });
    const countMatch = String(countData).match(/\d+/);
    const pageCount = countMatch
      ? Math.ceil(parseInt(countMatch[0]) / 80)
      : 10;

    const start = parseInt(startPage);
    const end = Math.min(parseInt(endPage) + 1, pageCount + 1);

    const allRows: any[][] = [];

    for (let page = start; page < end; page++) {
      try {
        const data = await httpGet<any[]>(url, {
          params: {
            page: String(page),
            num: '80',
            sort: 'symbol',
            asc: '1',
            node: 'hs_z',
            _s_r_a: 'page',
          },
        });

        if (Array.isArray(data)) {
          for (const item of data) {
            allRows.push([
              item.symbol,       // 代码
              item.name,         // 名称
              parseFloat(item.trade) || null,     // 最新价
              parseFloat(item.pricechange) || null, // 涨跌额
              parseFloat(item.changepercent) || null, // 涨跌幅
              parseFloat(item.buy) || null,       // 买入
              parseFloat(item.sell) || null,      // 卖出
              parseFloat(item.yestclose) || null, // 昨收
              parseFloat(item.open) || null,      // 今开
              parseFloat(item.high) || null,      // 最高
              parseFloat(item.low) || null,       // 最低
              parseInt(item.volume) || null,      // 成交量
              parseFloat(item.amount) || null,    // 成交额
            ]);
          }
        }
      } catch {
        // Skip failed page
        continue;
      }
    }

    const columns = [
      '代码', '名称', '最新价', '涨跌额', '涨跌幅',
      '买入', '卖出', '昨收', '今开', '最高', '最低',
      '成交量', '成交额',
    ];

    return createDataFrame(columns, allRows);
  } catch (error) {
    return createDataFrame([], []);
  }
}

/**
 * 新浪财经-债券-沪深债券-历史行情数据
 * https://vip.stock.finance.sina.com.cn/mkt/#hs_z
 *
 * @param symbol 沪深债券代码，如 sh010107
 */
export async function bond_zh_hs_sina_daily(
  symbol: string = 'sh010107'
): Promise<DataFrame> {
  const now = new Date();
  const dateStr = `${now.getFullYear()}_${String(now.getMonth() + 1).padStart(2, '0')}_${String(now.getDate()).padStart(2, '0')}`;
  const url = `https://finance.sina.com.cn/realstock/company/${symbol}/hisdata/klc_kl.js?d=${dateStr}`;

  try {
    const text = await httpGet<string>(url, {
      responseType: 'text' as any,
    });

    // 解析返回的 JS 数据
    // 格式: var ... = [{date: "...", open: "...", high: "...", low: "...", close: "...", volume: "..."}, ...]
    const jsonStr = String(text).split('=')[1]?.split(';')[0]?.replace(/"/g, '"');
    if (!jsonStr) {
      return createDataFrame([], []);
    }

    // 尝试解析 JSON 数组
    const data: any[] = JSON.parse(jsonStr);

    if (!Array.isArray(data) || data.length === 0) {
      return createDataFrame([], []);
    }

    const columns = ['日期', '开盘', '最高', '最低', '收盘', '成交量'];
    const rows = data.map((item: any) => [
      item.date,
      parseFloat(item.open) || null,
      parseFloat(item.high) || null,
      parseFloat(item.low) || null,
      parseFloat(item.close) || null,
      parseInt(item.volume) || null,
    ]);

    return createDataFrame(columns, rows);
  } catch (error) {
    return createDataFrame([], []);
  }
}
