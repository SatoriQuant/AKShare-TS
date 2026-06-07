/**
 * AKShare TypeScript - 商品期权数据
 * 说明：
 * (1) 价格：元/吨，鸡蛋为元/500千克，纤维板为元/立方米，胶合板为元/张
 * (2) 成交量、持仓量：手（按双边计算）
 * (3) 成交额：万元（按双边计算）
 * (4) 涨跌＝收盘价－前结算价
 * (5) 涨跌1=今结算价-前结算价
 * (6) 隐含波动率：根据期权市场价格，利用期权定价模型计算的标的期货合约价格波动率
 */

import { httpGet, httpPost, httpGetText } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

// 大商所期权品种代码映射
const DCE_OPTION_CODE_MAP: Record<string, string> = {
  '玉米期权': 'c',
  '豆粕期权': 'm',
  '铁矿石期权': 'i',
  '液化石油气期权': 'pg',
  '聚乙烯期权': 'l',
  '聚氯乙烯期权': 'v',
  '聚丙烯期权': 'pp',
  '棕榈油期权': 'p',
  '黄大豆1号期权': 'a',
  '黄大豆2号期权': 'b',
  '豆油期权': 'y',
  '乙二醇期权': 'eg',
  '苯乙烯期权': 'eb',
  '鸡蛋期权': 'jd',
  '玉米淀粉期权': 'cs',
  '生猪期权': 'lh',
  '原木期权': 'lg',
};

// 上期所期权品种
const SHFE_OPTION_SYMBOLS = [
  '原油期权', '铜期权', '铝期权', '锌期权', '铅期权', '螺纹钢期权',
  '镍期权', '锡期权', '氧化铝期权', '黄金期权', '白银期权',
  '丁二烯橡胶期权', '天胶期权'
];

// 广期所期权品种代码映射
const GFEX_OPTION_CODE_MAP: Record<string, string> = {
  '工业硅': 'si',
  '碳酸锂': 'lc',
  '多晶硅': 'ps',
};

/**
 * 大连商品交易所-期权-日频行情数据
 * http://www.dce.com.cn/
 * @param symbol 期权品种名称
 * @param trade_date 交易日，格式：20251016
 * @returns 日频行情数据
 */
export async function option_hist_dce(
  symbol: string = '聚丙烯期权',
  trade_date: string = '20251016'
): Promise<DataFrame> {
  const varietyId = DCE_OPTION_CODE_MAP[symbol];
  if (!varietyId) {
    return createDataFrame([], []);
  }

  const url = 'http://www.dce.com.cn/dcereport/publicweb/dailystat/dayQuotes';
  const payload = {
    contractId: '',
    lang: 'zh',
    optionSeries: '',
    statisticsType: 0,
    tradeDate: trade_date,
    tradeType: '2',
    varietyId: varietyId,
  };

  try {
    const data = await httpPost<any>(url, payload);

    if (!data?.data || data.data.length === 0) {
      return createDataFrame([], []);
    }

    const columns = [
      '品种名称', '合约', '开盘价', '最高价', '最低价', '收盘价',
      '前结算价', '结算价', '涨跌', '涨跌1', 'Delta', '隐含波动率(%)',
      '成交量', '持仓量', '持仓量变化', '成交额', '行权量'
    ];

    const rows = data.data.map((item: any) => [
      item.variety,
      item.contractId,
      parseFloat(String(item.open).replace(/,/g, '')) || null,
      parseFloat(String(item.high).replace(/,/g, '')) || null,
      parseFloat(String(item.low).replace(/,/g, '')) || null,
      parseFloat(String(item.close).replace(/,/g, '')) || null,
      parseFloat(String(item.lastClear).replace(/,/g, '')) || null,
      parseFloat(String(item.clearPrice).replace(/,/g, '')) || null,
      parseFloat(String(item.diff).replace(/,/g, '')) || null,
      parseFloat(String(item.diff1).replace(/,/g, '')) || null,
      parseFloat(String(item.delta).replace(/,/g, '')) || null,
      parseFloat(String(item.impliedVolatility).replace(/,/g, '')) || null,
      parseInt(item.volumn) || null,
      parseInt(item.openInterest) || null,
      parseInt(item.diffI) || null,
      parseFloat(String(item.turnover).replace(/,/g, '')) || null,
      parseInt(item.matchQtySum) || null,
    ]);

    return createDataFrame(columns, rows);
  } catch {
    return createDataFrame([], []);
  }
}

/**
 * 上海期货交易所-期权-日频行情数据
 * https://www.shfe.com.cn/reports/tradedata/dailyandweeklydata/
 * @param symbol 期权品种名称
 * @param trade_date 交易日，格式：20250418
 * @returns 日频行情数据
 */
export async function option_hist_shfe(
  symbol: string = '铝期权',
  trade_date: string = '20250418'
): Promise<DataFrame> {
  const url = `https://www.shfe.com.cn/data/tradedata/option/dailydata/kx${trade_date}.dat`;

  try {
    const data = await httpGet<any>(url);

    if (!data?.o_curinstrument) {
      return createDataFrame([], []);
    }

    const filteredData = data.o_curinstrument.filter(
      (row: any) => row.PRODUCTNAME?.trim() === symbol &&
        !['小计', '合计'].includes(row.INSTRUMENTID) &&
        row.INSTRUMENTID !== ''
    );

    if (filteredData.length === 0) {
      return createDataFrame([], []);
    }

    const columns = [
      '合约代码', '开盘价', '最高价', '最低价', '收盘价',
      '前结算价', '结算价', '涨跌1', '涨跌2', '成交量',
      '持仓量', '持仓量变化', '成交额', '德尔塔', '行权量'
    ];

    const rows = filteredData.map((item: any) => [
      item.INSTRUMENTID,
      parseFloat(item.OPENPRICE) || null,
      parseFloat(item.HIGHESTPRICE) || null,
      parseFloat(item.LOWESTPRICE) || null,
      parseFloat(item.CLOSEPRICE) || null,
      parseFloat(item.PRESETTLEMENTPRICE) || null,
      parseFloat(item.SETTLEMENTPRICE) || null,
      parseFloat(item.ZD1_CHG) || null,
      parseFloat(item.ZD2_CHG) || null,
      parseInt(item.VOLUME) || null,
      parseInt(item.OPENINTEREST) || null,
      parseInt(item.OPENINTERESTCHG) || null,
      parseFloat(item.TURNOVER) || null,
      parseFloat(item.DELTA) || null,
      parseInt(item.EXECVOLUME) || null,
    ]);

    return createDataFrame(columns, rows);
  } catch {
    return createDataFrame([], []);
  }
}

/**
 * 上海期货交易所-期权-隐含波动率
 * https://www.shfe.com.cn/reports/tradedata/dailyandweeklydata/
 * @param symbol 期权品种名称
 * @param trade_date 交易日，格式：20250418
 * @returns 隐含波动率数据
 */
export async function option_vol_shfe(
  symbol: string = '铝期权',
  trade_date: string = '20250418'
): Promise<DataFrame> {
  const url = `https://www.shfe.com.cn/data/tradedata/option/dailydata/kx${trade_date}.dat`;

  try {
    const data = await httpGet<any>(url);

    if (!data?.o_cursigma) {
      return createDataFrame([], []);
    }

    const filteredData = data.o_cursigma.filter(
      (row: any) => row.PRODUCTNAME?.trim() === symbol
    );

    if (filteredData.length === 0) {
      return createDataFrame([], []);
    }

    const columns = [
      '合约系列', '成交量', '持仓量', '持仓量变化', '成交额', '行权量', '隐含波动率'
    ];

    const rows = filteredData.map((item: any) => [
      item.INSTRUMENTID,
      parseInt(item.VOLUME) || null,
      parseInt(item.OPENINTEREST) || null,
      parseInt(item.OPENINTERESTCHG) || null,
      parseFloat(item.TURNOVER) || null,
      parseInt(item.EXECVOLUME) || null,
      parseFloat(item.SIGMA) || null,
    ]);

    return createDataFrame(columns, rows);
  } catch {
    return createDataFrame([], []);
  }
}

/**
 * 广州期货交易所-日频率-量价数据
 * http://www.gfex.com.cn/gfex/rihq/hqsj_tjsj.shtml
 * @param symbol 期权品种名称
 * @param trade_date 交易日，格式：20230724
 * @returns 日频行情数据
 */
export async function option_hist_gfex(
  symbol: string = '工业硅',
  trade_date: string = '20230724'
): Promise<DataFrame> {
  const url = 'http://www.gfex.com.cn/u/interfacesWebTiDayQuotes/loadList';
  const payload = `trade_date=${trade_date}&trade_type=1`;

  try {
    const data = await httpPost<any>(url, payload, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'X-Requested-With': 'XMLHttpRequest',
        'Referer': 'http://www.gfex.com.cn/gfex/rihq/hqsj_tjsj.shtml',
      },
    });

    if (!data?.data) {
      return createDataFrame([], []);
    }

    const filteredData = data.data.filter((item: any) =>
      item.variety?.includes(symbol)
    );

    if (filteredData.length === 0) {
      return createDataFrame([], []);
    }

    const columns = [
      '商品名称', '合约名称', '开盘价', '最高价', '最低价', '收盘价',
      '前结算价', '结算价', '涨跌', '涨跌1', 'Delta', '成交量',
      '持仓量', '持仓量变化', '成交额', '行权量', '隐含波动率'
    ];

    const rows = filteredData.map((item: any) => [
      item.variety,
      item.delivMonth,
      parseFloat(item.open) || null,
      parseFloat(item.high) || null,
      parseFloat(item.low) || null,
      parseFloat(item.close) || null,
      parseFloat(item.lastClear) || null,
      parseFloat(item.clearPrice) || null,
      parseFloat(item.diff) || null,
      parseFloat(item.diff1) || null,
      parseFloat(item.delta) || null,
      parseInt(item.volumn) || null,
      parseInt(item.openInterest) || null,
      parseInt(item.diffI) || null,
      parseFloat(item.turnover) || null,
      parseInt(item.matchQtySum) || null,
      parseFloat(item.impliedVolatility) || null,
    ]);

    return createDataFrame(columns, rows);
  } catch {
    return createDataFrame([], []);
  }
}

/**
 * 广州期货交易所-日频率-合约隐含波动率
 * http://www.gfex.com.cn/gfex/rihq/hqsj_tjsj.shtml
 * @param symbol 期权品种名称
 * @param trade_date 交易日，格式：20230724
 * @returns 隐含波动率数据
 */
export async function option_vol_gfex(
  symbol: string = '碳酸锂',
  trade_date: string = '20230724'
): Promise<DataFrame> {
  const symbolCode = GFEX_OPTION_CODE_MAP[symbol];
  if (!symbolCode) {
    return createDataFrame([], []);
  }

  const url = 'http://www.gfex.com.cn/u/interfacesWebTiDayQuotes/loadListOptVolatility';
  const payload = `trade_date=${trade_date}`;

  try {
    const data = await httpPost<any>(url, payload, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'X-Requested-With': 'XMLHttpRequest',
        'Referer': 'http://www.gfex.com.cn/gfex/rihq/hqsj_tjsj.shtml',
      },
    });

    if (!data?.data) {
      return createDataFrame([], []);
    }

    const filteredData = data.data.filter((item: any) =>
      item.seriesId?.includes(symbolCode)
    );

    if (filteredData.length === 0) {
      return createDataFrame([], []);
    }

    const columns = ['合约系列', '隐含波动率'];
    const rows = filteredData.map((item: any) => [
      item.seriesId,
      parseFloat(item.hisVolatility) || null,
    ]);

    return createDataFrame(columns, rows);
  } catch {
    return createDataFrame([], []);
  }
}

/**
 * 郑州商品交易所-期权-日频行情数据
 * http://www.czce.com.cn/cn/sspz/dejbqhqq/H770227index_1.htm
 * @param symbol 期权品种名称
 * @param trade_date 交易日，格式：20191017
 * @returns 日频行情数据
 */
export async function option_hist_czce(
  symbol: string = '白糖期权',
  trade_date: string = '20191017'
): Promise<DataFrame> {
  // 郑商所期权品种代码映射
  const czceCodeMap: Record<string, string> = {
    '白糖期权': 'SR',
    '棉花期权': 'CF',
    '甲醇期权': 'MA',
    'PTA期权': 'TA',
    '动力煤期权': 'ZC',
    '菜籽粕期权': 'RM',
    '菜籽油期权': 'OI',
    '花生期权': 'PK',
    '对二甲苯期权': 'PX',
    '烧碱期权': 'SH',
    '纯碱期权': 'SA',
    '短纤期权': 'PF',
    '锰硅期权': 'SM',
    '硅铁期权': 'SF',
    '尿素期权': 'UR',
    '苹果期权': 'AP',
    '红枣期权': 'CJ',
    '玻璃期权': 'FG',
    '瓶片期权': 'PR',
    '丙烯期权': 'PL',
  };

  const code = czceCodeMap[symbol];
  if (!code) {
    return createDataFrame([], []);
  }

  const year = trade_date.substring(0, 4);
  const url = `http://www.czce.com.cn/cn/DFSStaticFiles/Option/${year}/${trade_date}/OptionDataDaily.txt`;

  try {
    const text = await httpGetText(url);
    const lines = text.split('\n').filter(line => line.trim());

    if (lines.length < 3) {
      return createDataFrame([], []);
    }

    const columns = [
      '合约代码', '昨结算', '今开盘', '最高价', '最低价', '今收盘',
      '今结算', '涨跌1', '涨跌2', '成交量(手)', '持仓量', '增减量',
      '成交额(万元)', 'DELTA', '隐含波动率', '行权量'
    ];

    // 跳过标题行，解析数据
    const dataLines = lines.slice(1); // 跳过第一行
    const rows: any[][] = [];

    for (const line of dataLines) {
      const parts = line.split('|').map(p => p.trim()).filter(p => p);
      if (parts.length < 16) continue;

      // 过滤指定品种的数据
      if (!parts[0].includes(code)) continue;

      // 跳过合计行
      if (parts[0].includes('合计') || parts[0].includes('小计')) continue;

      rows.push([
        parts[0],
        parseFloat(parts[1].replace(/,/g, '')) || null,
        parseFloat(parts[2].replace(/,/g, '')) || null,
        parseFloat(parts[3].replace(/,/g, '')) || null,
        parseFloat(parts[4].replace(/,/g, '')) || null,
        parseFloat(parts[5].replace(/,/g, '')) || null,
        parseFloat(parts[6].replace(/,/g, '')) || null,
        parseFloat(parts[7].replace(/,/g, '')) || null,
        parseFloat(parts[8].replace(/,/g, '')) || null,
        parseFloat(parts[9].replace(/,/g, '')) || null,
        parseFloat(parts[10].replace(/,/g, '')) || null,
        parseFloat(parts[11].replace(/,/g, '')) || null,
        parseFloat(parts[12].replace(/,/g, '')) || null,
        parseFloat(parts[13].replace(/,/g, '')) || null,
        parseFloat(parts[14].replace(/,/g, '')) || null,
        parseFloat(parts[15].replace(/,/g, '')) || null,
      ]);
    }

    return createDataFrame(columns, rows);
  } catch {
    return createDataFrame([], []);
  }
}
