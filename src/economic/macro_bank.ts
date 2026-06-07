/**
 * AKShare TypeScript - 央行利率决议数据接口
 * 数据来源: 金十数据中心
 * 包含美联储、欧洲央行、新西兰联储、中国央行、瑞士央行、英国央行、澳洲联储、日本央行、俄罗斯央行、印度央行、巴西央行利率决议
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 金十数据中心利率决议通用函数
 */
async function getInterestRateData(attrId: string, name: string): Promise<DataFrame> {
  const columns = ['商品', '日期', '今值', '预测值', '前值'];
  let allRows: any[][] = [];
  let maxDate = '';

  const headers = {
    'Accept': '*/*',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Origin': 'https://datacenter.jin10.com',
    'Referer': 'https://datacenter.jin10.com/',
    'x-app-id': 'rU6QIu7JHe2gOUeR',
    'x-version': '1.0.0',
  };

  while (true) {
    const params: Record<string, any> = {
      max_date: maxDate,
      category: 'ec',
      attr_id: attrId,
      _: Date.now(),
    };

    const data = await httpGet<any>('https://datacenter-api.jin10.com/reports/list_v2', {
      params,
      headers,
    });

    if (!data?.data?.values || data.data.values.length === 0) break;

    const values = data.data.values;
    for (const row of values) {
      allRows.push([name, row[0], row[1], row[2], row[3]]);
    }

    const lastDate = values[values.length - 1][0];
    const d = new Date(lastDate);
    d.setDate(d.getDate() - 1);
    maxDate = d.toISOString().split('T')[0];
  }

  return createDataFrame(columns, allRows);
}

/**
 * 美联储利率决议报告 - 金十数据中心
 */
export async function macro_bank_usa_interest_rate(): Promise<DataFrame> {
  return getInterestRateData('24', '美联储利率决议报告');
}

/**
 * 欧洲央行决议报告 - 金十数据中心
 */
export async function macro_bank_euro_interest_rate(): Promise<DataFrame> {
  return getInterestRateData('21', '欧洲央行决议报告');
}

/**
 * 新西兰联储决议报告 - 金十数据中心
 */
export async function macro_bank_newzealand_interest_rate(): Promise<DataFrame> {
  return getInterestRateData('23', '新西兰利率决议报告');
}

/**
 * 中国央行决议报告 - 金十数据中心
 */
export async function macro_bank_china_interest_rate(): Promise<DataFrame> {
  return getInterestRateData('91', '中国央行决议报告');
}

/**
 * 瑞士央行决议报告 - 金十数据中心
 */
export async function macro_bank_switzerland_interest_rate(): Promise<DataFrame> {
  return getInterestRateData('25', '瑞士央行决议报告');
}

/**
 * 英国央行决议报告 - 金十数据中心
 */
export async function macro_bank_english_interest_rate(): Promise<DataFrame> {
  return getInterestRateData('26', '英国央行决议报告');
}

/**
 * 澳洲联储决议报告 - 金十数据中心
 */
export async function macro_bank_australia_interest_rate(): Promise<DataFrame> {
  return getInterestRateData('27', '澳洲联储决议报告');
}

/**
 * 日本央行决议报告 - 金十数据中心
 */
export async function macro_bank_japan_interest_rate(): Promise<DataFrame> {
  return getInterestRateData('22', '日本央行决议报告');
}

/**
 * 俄罗斯央行决议报告 - 金十数据中心
 */
export async function macro_bank_russia_interest_rate(): Promise<DataFrame> {
  return getInterestRateData('64', '俄罗斯央行决议报告');
}

/**
 * 印度央行决议报告 - 金十数据中心
 */
export async function macro_bank_india_interest_rate(): Promise<DataFrame> {
  return getInterestRateData('68', '印度央行决议报告');
}

/**
 * 巴西央行决议报告 - 金十数据中心
 */
export async function macro_bank_brazil_interest_rate(): Promise<DataFrame> {
  return getInterestRateData('55', '巴西央行决议报告');
}
