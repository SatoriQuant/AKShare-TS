/**
 * AKShare TypeScript - 中国债券信息网中债指数数据接口
 * 中国债券信息网-中债指数-中债指数族系
 * https://yield.chinabond.com.cn/cbweb-mn/indices/singleIndexQueryResult
 */

import { httpPost } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 指标映射
 */
const INDICATOR_MAPPING: Record<string, string> = {
  '全价': 'QJZS',
  '净价': 'JJZS',
  '财富': 'CFZS',
  '平均市值法久期': 'PJSZFJQ',
  '平均现金流法久期': 'PJXJLFJQ',
  '平均市值法凸性': 'PJSZFTX',
  '平均现金流法凸性': 'PJXJLFTX',
  '平均现金流法到期收益率': 'PJDQSYL',
  '平均市值法到期收益率': 'PJSZFDQSYL',
  '平均基点价值': 'PJJDJZ',
  '平均待偿期': 'PJDCQ',
  '平均派息率': 'PJPXL',
  '指数上日总市值': 'ZSZSZ',
  '财富指数涨跌幅': 'CFZSZDF',
  '全价指数涨跌幅': 'QJZSZDF',
  '净价指数涨跌幅': 'JJZSZDF',
  '现券结算量': 'XQJSL',
};

/**
 * 期限映射
 */
const PERIOD_MAPPING: Record<string, string> = {
  '总值': '00',
  '1年以下': '01',
  '1-3年': '02',
  '3-5年': '03',
  '5-7年': '04',
  '7-10年': '05',
  '10年以上': '06',
  '0-3个月': '07',
  '3-6个月': '08',
  '6-9个月': '09',
  '9-12个月': '10',
  '0-6个月': '11',
  '6-12个月': '12',
};

/**
 * 中债-国债指数期限映射
 */
const TREASURY_INDEX_MAPPING: Record<string, string> = {
  '0-1Y': '8a8b2cef70bc61380170be069828032b',
  '0-3Y': '61f69682dc3ec18fe9664ff59308314a',
  '0-5Y': '0beafb51867009998c2f4932bf22ede3',
  '0-10Y': '8a8b2cef7832f8920178350801470014',
  '1-3Y': 'cc1cfe89b0cbd0800420a0e037026407',
  '1-5Y': '7c3110e5305f9301482517066427a554',
  '1-10Y': 'a5d90802e3259978a027267de651106d',
  '3-5Y': '8a8b2ca04bf69582014c10b60f376c77',
  '5Y': '8a8b2ca03a3feea1013a44b98fc533f5',
  '7Y': '2c9081e50e8767dc010e87b6e26c0080',
  '7-10Y': '8a8b2c8f5a492a01015a4ac986480043',
  '10Y': '8a8b2ca04b666362014b723482bc4f49',
  '30Y': '8a8b2cef77b239980177b485d20a6379',
};

/**
 * 综合类指数ID映射
 */
const GENERAL_INDEX_MAPPING: Record<string, string> = {
  '新综合指数': '8a8b2ca0332abed20134ea76d8885831',
  '综合指数': '2c90818811afed8d0111c0c672b31578',
  '高等级科技创新债券综合指数': '4d4aa3607fb4ba663b4587de4a624b24',
  '银行间债券总指数': '2c9081e50e8767dc010e87a3326c0039',
  '国债总指数': '2c9081e50e8767dc010e879acb220021',
  '信用债总指数': '8a8b2ca038d716f10138dadde8416adc',
  '企业债总指数': '2c90818811d3f4fa01123837e6b30d4a',
  '公司债总指数': '8a8b2ca050d9e35d0150da6758462c78',
  '中期票据总指数': '2c9081e91ebc9e41011ec8c7c0440001',
  '金融债券总指数': '2c9081e50e8767dc010e87a9d5650060',
};

/**
 * 中国债券信息网-中债指数-中债指数族系 当中，非指定期限部分
 * https://yield.chinabond.com.cn/cbweb-mn/indices/singleIndexQueryResult
 */
export async function bond_available_index_cbond(): Promise<DataFrame> {
  const columns = ['index', 'value'];
  const rows = Object.keys(GENERAL_INDEX_MAPPING).map((key, i) => [
    i + 1,
    key,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 中国债券信息网-中债指数-中债指数族系-总指数-综合类指数
 * https://yield.chinabond.com.cn/cbweb-mn/indices/singleIndexQueryResult
 *
 * @param indexCategory 指数类别，如 "新综合指数"
 * @param indicator 指标，如 "全价", "净价", "财富" 等
 * @param period 期限，如 "总值", "1年以下", "1-3年" 等
 */
export async function bond_index_general_cbond(
  indexCategory: string = '新综合指数',
  indicator: string = '全价',
  period: string = '总值'
): Promise<DataFrame> {
  const indexId = GENERAL_INDEX_MAPPING[indexCategory];
  const indicatorCode = INDICATOR_MAPPING[indicator];
  const periodCode = PERIOD_MAPPING[period];

  if (!indexId || !indicatorCode || !periodCode) {
    return createDataFrame([], []);
  }

  const url =
    'https://yield.chinabond.com.cn/cbweb-mn/indices/singleIndexQueryResult';

  try {
    const params = {
      indexid: indexId,
      qxlxt: periodCode,
      ltcslx: '',
      zslxt: indicatorCode,
      zslxt1: indicatorCode,
      lx: '1',
      locale: 'zh_CN',
    };

    const data = await httpPost<any>(url, null, {
      params,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
      },
    });

    if (!data) {
      return createDataFrame([], []);
    }

    // Parse the key-column mapping
    const dqcName = data.dqcName || {};
    const dataKey = `${indicatorCode}_${periodCode}`;

    if (!data[dataKey]) {
      return createDataFrame([], []);
    }

    const timeSeries = data[dataKey];
    const columns = ['date', 'value'];
    const rows: any[][] = [];

    for (const [timestamp, value] of Object.entries(timeSeries)) {
      const ts = typeof timestamp === 'number' ? timestamp : parseFloat(timestamp);
      if (!isNaN(ts)) {
        const date = new Date(ts).toISOString().split('T')[0];
        rows.push([date, parseFloat(value as string) || null]);
      }
    }

    // Sort by date
    rows.sort((a, b) => (a[0] as string).localeCompare(b[0] as string));

    return createDataFrame(columns, rows);
  } catch (error) {
    return createDataFrame([], []);
  }
}

/**
 * 中国债券信息网-中债指数-中债指数族系-总指数-综合类指数-中债-国债指数
 * https://yield.chinabond.com.cn/cbweb-mn/indices/single_index_query
 *
 * @param indicator 指标，如 "全价", "净价", "财富"
 * @param period 期限，如 "0-1Y", "0-3Y", "0-5Y", "0-10Y", "1-3Y", "1-5Y",
 *               "1-10Y", "3-5Y", "5Y", "7Y", "7-10Y", "10Y", "30Y"
 */
export async function bond_treasury_index_cbond(
  indicator: string = '财富',
  period: string = '5Y'
): Promise<DataFrame> {
  const indexId = TREASURY_INDEX_MAPPING[period];
  const indicatorCode = INDICATOR_MAPPING[indicator];

  if (!indexId || !indicatorCode) {
    return createDataFrame([], []);
  }

  const url =
    'https://yield.chinabond.com.cn/cbweb-mn/indices/singleIndexQueryResult';

  try {
    const params = {
      indexid: indexId,
      qxlxt: '00',
      ltcslx: '',
      zslxt: indicatorCode,
      zslxt1: indicatorCode,
      lx: '1',
      locale: 'zh_CN',
    };

    const data = await httpPost<any>(url, null, {
      params,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
      },
    });

    if (!data) {
      return createDataFrame([], []);
    }

    const dqcName = data.dqcName || {};
    // Find the matching key
    const keyPrefix = `${indicatorCode}_`;
    const matchingKey = Object.keys(data).find(
      (k) => k.startsWith(keyPrefix) && typeof data[k] === 'object' && data[k] !== null
    );

    if (!matchingKey || !data[matchingKey]) {
      return createDataFrame([], []);
    }

    const timeSeries = data[matchingKey];
    const columns = ['date', 'value'];
    const rows: any[][] = [];

    for (const [timestamp, value] of Object.entries(timeSeries)) {
      const ts = typeof timestamp === 'number' ? timestamp : parseFloat(timestamp);
      if (!isNaN(ts)) {
        const date = new Date(ts).toISOString().split('T')[0];
        rows.push([date, parseFloat(value as string) || null]);
      }
    }

    rows.sort((a, b) => (a[0] as string).localeCompare(b[0] as string));

    return createDataFrame(columns, rows);
  } catch (error) {
    return createDataFrame([], []);
  }
}

/**
 * 中国债券信息网-中债指数-中债指数族系-总指数-综合类指数-中债-新综合指数
 * https://yield.chinabond.com.cn/cbweb-mn/indices/single_index_query
 *
 * @param indicator 指标，如 "全价", "净价", "财富" 等
 * @param period 期限，如 "总值", "1年以下", "1-3年" 等
 */
export async function bond_new_composite_index_cbond(
  indicator: string = '财富',
  period: string = '总值'
): Promise<DataFrame> {
  const indicatorCode = INDICATOR_MAPPING[indicator];
  const periodCode = PERIOD_MAPPING[period];

  if (!indicatorCode || !periodCode) {
    return createDataFrame([], []);
  }

  const url =
    'https://yield.chinabond.com.cn/cbweb-mn/indices/singleIndexQuery';

  try {
    const params = {
      indexid: '8a8b2ca0332abed20134ea76d8885831',
      qxlxt: periodCode,
      ltcslx: '',
      zslxt: indicatorCode,
      lx: '1',
      locale: '',
    };

    const data = await httpPost<any>(url, null, {
      params,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
      },
    });

    if (!data) {
      return createDataFrame([], []);
    }

    const dataKey = `${indicatorCode}_${periodCode}`;
    const timeSeries = data[dataKey];

    if (!timeSeries) {
      return createDataFrame([], []);
    }

    const columns = ['date', 'value'];
    const rows: any[][] = [];

    for (const [timestamp, value] of Object.entries(timeSeries)) {
      const ts = typeof timestamp === 'number' ? timestamp : parseFloat(timestamp);
      if (!isNaN(ts)) {
        const date = new Date(ts).toISOString().split('T')[0];
        rows.push([date, parseFloat(value as string) || null]);
      }
    }

    rows.sort((a, b) => (a[0] as string).localeCompare(b[0] as string));

    return createDataFrame(columns, rows);
  } catch (error) {
    return createDataFrame([], []);
  }
}

/**
 * 中国债券信息网-中债指数-中债指数族系-总指数-综合类指数-中债-综合指数
 * https://yield.chinabond.com.cn/cbweb-mn/indices/single_index_query
 *
 * @param indicator 指标，如 "全价", "净价", "财富" 等
 * @param period 期限，如 "总值", "1年以下", "1-3年" 等
 */
export async function bond_composite_index_cbond(
  indicator: string = '财富',
  period: string = '总值'
): Promise<DataFrame> {
  const indicatorCode = INDICATOR_MAPPING[indicator];
  const periodCode = PERIOD_MAPPING[period];

  if (!indicatorCode || !periodCode) {
    return createDataFrame([], []);
  }

  const url =
    'https://yield.chinabond.com.cn/cbweb-mn/indices/singleIndexQuery';

  try {
    const params = {
      indexid: '2c90818811afed8d0111c0c672b31578',
      qxlxt: periodCode,
      zslxt: indicatorCode,
      lx: '1',
      locale: '',
    };

    const data = await httpPost<any>(url, null, {
      params,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
      },
    });

    if (!data) {
      return createDataFrame([], []);
    }

    const dataKey = `${indicatorCode}_${periodCode}`;
    const timeSeries = data[dataKey];

    if (!timeSeries) {
      return createDataFrame([], []);
    }

    const columns = ['date', 'value'];
    const rows: any[][] = [];

    for (const [timestamp, value] of Object.entries(timeSeries)) {
      const ts = typeof timestamp === 'number' ? timestamp : parseFloat(timestamp);
      if (!isNaN(ts)) {
        const date = new Date(ts).toISOString().split('T')[0];
        rows.push([date, parseFloat(value as string) || null]);
      }
    }

    rows.sort((a, b) => (a[0] as string).localeCompare(b[0] as string));

    return createDataFrame(columns, rows);
  } catch (error) {
    return createDataFrame([], []);
  }
}
