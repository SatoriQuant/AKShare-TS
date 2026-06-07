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
      '板块', '公司家数', '平均价格', '涨跌额', '涨跌幅',
      '总成交量', '总成交额', '股票代码', '股票名称',
    ];

    const rows: any[][] = [];

    for (const [key, value] of Object.entries(jsonData)) {
      const parts = (value as string).split(',');
      if (parts.length >= 13) {
        rows.push([
          parts[1],                          // 板块
          parseInt(parts[2]) || NaN,         // 公司家数
          parseFloat(parts[3]) || NaN,       // 平均价格
          parseFloat(parts[4]) || NaN,       // 涨跌额
          parseFloat(parts[5]) || NaN,       // 涨跌幅
          parseFloat(parts[6]) || NaN,       // 总成交量
          parseFloat(parts[7]) || NaN,       // 总成交额
          parts[8],                          // 股票代码
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
  page: number = 1,
  pageSize: number = 80
): Promise<DataFrame> {
  const url =
    'http://vip.stock.finance.sina.com.cn/quotes_service/api/json_v2.php/Market_Center.getHQNodeData';
  const params = {
    page: page.toString(),
    num: pageSize.toString(),
    sort: 'symbol',
    asc: '1',
    node: sector,
    symbol: '',
    _s_r_a: 'page',
  };

  try {
    const text = await httpGetText(url, { params });
    const data = JSON.parse(text);

    if (!Array.isArray(data) || data.length === 0) {
      return createDataFrame([], []);
    }

    const columns = [
      '代码', '名称', '最新价', '涨跌额', '涨跌幅',
      '买入', '卖出', '昨收', '今开', '最高', '最低',
      '成交量', '成交额', '市盈率', '市净率', '总市值', '流通市值', '换手率',
    ];

    const rows = data.map((item: any) => [
      item.symbol,
      item.name,
      parseFloat(item.trade) || NaN,
      parseFloat(item.pricechange) || NaN,
      parseFloat(item.changepercent) || NaN,
      parseFloat(item.buy) || NaN,
      parseFloat(item.sell) || NaN,
      parseFloat(item.settlement) || NaN,
      parseFloat(item.open) || NaN,
      parseFloat(item.high) || NaN,
      parseFloat(item.low) || NaN,
      parseInt(item.volume) || NaN,
      parseFloat(item.amount) || NaN,
      parseFloat(item.per) || NaN,
      parseFloat(item.pb) || NaN,
      parseFloat(item.mktcap) || NaN,
      parseFloat(item.nmc) || NaN,
      parseFloat(item.turnoverratio) || NaN,
    ]);

    return createDataFrame(columns, rows);
  } catch (error) {
    return createDataFrame([], []);
  }
}
