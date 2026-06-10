/**
 * AKShare TypeScript - 新浪行业板块数据接口
 * http://finance.sina.com.cn/stock/sl/
 */

import { httpGetText } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 新浪行业-板块行情
 * http://finance.sina.com.cn/stock/sl/
 *
 * @param indicator 指标类型，可选值：新浪行业, 启明星行业, 概念, 地域, 行业
 */
export async function stock_sector_spot(
  indicator: '新浪行业' | '启明星行业' | '概念' | '地域' | '行业' = '新浪行业'
): Promise<DataFrame> {
  let url: string;
  const params: Record<string, string> = {};

  switch (indicator) {
    case '新浪行业':
      url = 'http://vip.stock.finance.sina.com.cn/q/view/newSinaHy.php';
      break;
    case '启明星行业':
      url = 'http://biz.finance.sina.com.cn/hq/qmxIndustryHq.php';
      break;
    case '概念':
      url = 'http://money.finance.sina.com.cn/q/view/newFLJK.php';
      params.param = 'class';
      break;
    case '地域':
      url = 'http://money.finance.sina.com.cn/q/view/newFLJK.php';
      params.param = 'area';
      break;
    case '行业':
      url = 'http://money.finance.sina.com.cn/q/view/newFLJK.php';
      params.param = 'industry';
      break;
    default:
      return createDataFrame([], []);
  }

  try {
    const text = await httpGetText(url, {
      params,
      headers: {
        'Accept-Charset': 'utf-8',
      },
    });

    // Parse the JSON-like response
    const jsonStart = text.indexOf('{');
    if (jsonStart === -1) {
      return createDataFrame([], []);
    }

    const jsonData = JSON.parse(text.substring(jsonStart));

    const columns = [
      'label', '板块', '公司家数', '平均价格', '涨跌额', '涨跌幅',
      '总成交量', '总成交额', '股票代码', '个股-涨跌幅', '个股-当前价', '个股-涨跌额', '股票名称',
    ];

    const rows: any[][] = [];

    for (const [key, value] of Object.entries(jsonData)) {
      const parts = (value as string).split(',');
      if (parts.length >= 13) {
        rows.push([
          key,                               // label
          parts[1],                          // 板块
          parseInt(parts[2]) || NaN,         // 公司家数
          parseFloat(parts[3]) || NaN,       // 平均价格
          parseFloat(parts[4]) || NaN,       // 涨跌额
          parseFloat(parts[5]) || NaN,       // 涨跌幅
          parseFloat(parts[6]) || NaN,       // 总成交量
          parseFloat(parts[7]) || NaN,       // 总成交额
          parts[8],                          // 股票代码
          parseFloat(parts[9]) || NaN,       // 个股-涨跌幅
          parseFloat(parts[10]) || NaN,      // 个股-当前价
          parseFloat(parts[11]) || NaN,      // 个股-涨跌额
          parts[12],                         // 股票名称
        ]);
      }
    }

    return createDataFrame(columns, rows);
  } catch (error) {
    return createDataFrame([], []);
  }
}

/**
 * 新浪行业-板块行情-成份详情
 * http://finance.sina.com.cn/stock/sl/#area_1
 *
 * @param sector 板块标识，如 "hangye_ZC27"，从 stock_sector_spot 返回的 label 值获取
 * @param page 页码，默认 1
 * @param pageSize 每页数量，默认 80
 */
export async function stock_sector_detail(
  sector: string = 'hangye_ZC27',
): Promise<DataFrame> {
  try {
    // First get total count
    const countUrl = 'http://vip.stock.finance.sina.com.cn/quotes_service/api/json_v2.php/Market_Center.getHQNodeStockCount';
    const countText = await httpGetText(countUrl, { params: { node: sector } });
    const totalCount = parseInt(countText.replace(/[^\d]/g, '')) || 0;
    const totalPages = Math.ceil(totalCount / 80);

    const allData: any[] = [];
    const dataUrl = 'http://vip.stock.finance.sina.com.cn/quotes_service/api/json_v2.php/Market_Center.getHQNodeData';

    for (let page = 1; page <= totalPages; page++) {
      const params = {
        page: page.toString(),
        num: '80',
        sort: 'symbol',
        asc: '1',
        node: sector,
        symbol: '',
        _s_r_a: 'page',
      };

      try {
        const text = await httpGetText(dataUrl, { params });
        const data = JSON.parse(text);
        if (Array.isArray(data)) {
          allData.push(...data);
        }
      } catch {
        // Skip failed pages
      }
    }

    if (allData.length === 0) {
      return createDataFrame([], []);
    }

    // Python returns raw field names, not Chinese names
    const columns = [
      'symbol', 'code', 'name', 'trade', 'pricechange', 'changepercent',
      'buy', 'sell', 'settlement', 'open', 'high', 'low',
      'volume', 'amount', 'ticktime', 'per', 'pb', 'mktcap', 'nmc', 'turnoverratio',
    ];

    const rows = allData.map((item: any) => [
      String(item.symbol ?? ''),
      String(item.code ?? ''),
      String(item.name ?? ''),
      String(item.trade ?? ''),
      String(item.pricechange ?? ''),
      String(item.changepercent ?? ''),
      String(item.buy ?? ''),
      String(item.sell ?? ''),
      String(item.settlement ?? ''),
      String(item.open ?? ''),
      String(item.high ?? ''),
      String(item.low ?? ''),
      String(item.volume ?? ''),
      String(item.amount ?? ''),
      String(item.ticktime ?? ''),
      String(item.per ?? ''),
      String(item.pb ?? ''),
      String(item.mktcap ?? ''),
      String(item.nmc ?? ''),
      String(item.turnoverratio ?? ''),
    ]);

    return createDataFrame(columns, rows);
  } catch (error) {
    return createDataFrame([], []);
  }
}
