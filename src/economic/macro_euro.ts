/**
 * AKShare TypeScript - 欧元区经济数据接口
 * 数据来源: 金十数据中心
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 金十数据中心欧元区基础函数
 */
async function jin10EuroBaseFunc(symbol: string, attrId: string): Promise<DataFrame> {
  const columns = ['商品', '日期', '今值', '预测值', '前值'];
  let allRows: any[][] = [];
  let maxDate = '';

  const headers = {
    'x-app-id': 'rU6QIu7JHe2gOUeR',
    'x-csrf-token': 'x-csrf-token',
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
      allRows.push([symbol, row[0], row[1], row[2], row[3]]);
    }

    const lastDate = values[values.length - 1][0];
    const d = new Date(lastDate);
    d.setDate(d.getDate() - 1);
    maxDate = d.toISOString().split('T')[0];
  }

  return createDataFrame(columns, allRows);
}

/**
 * 欧元区季度 GDP 年率 - 金十数据中心
 */
export async function macro_euro_gdp_yoy(): Promise<DataFrame> {
  return jin10EuroBaseFunc('欧元区季度GDP年率', '84');
}

/**
 * 欧元区 CPI 月率 - 金十数据中心
 */
export async function macro_euro_cpi_mom(): Promise<DataFrame> {
  return jin10EuroBaseFunc('欧元区CPI月率', '84');
}

/**
 * 欧元区 CPI 年率 - 金十数据中心
 */
export async function macro_euro_cpi_yoy(): Promise<DataFrame> {
  return jin10EuroBaseFunc('欧元区CPI年率', '8');
}

/**
 * 欧元区 PPI 月率 - 金十数据中心
 */
export async function macro_euro_ppi_mom(): Promise<DataFrame> {
  return jin10EuroBaseFunc('欧元区PPI月率', '36');
}

/**
 * 欧元区零售销售月率 - 金十数据中心
 */
export async function macro_euro_retail_sales_mom(): Promise<DataFrame> {
  return jin10EuroBaseFunc('欧元区零售销售月率', '38');
}

/**
 * 欧元区季调后就业人数季率 - 金十数据中心
 */
export async function macro_euro_employment_change_qoq(): Promise<DataFrame> {
  return jin10EuroBaseFunc('欧元区季调后就业人数季率', '14');
}

/**
 * 欧元区失业率 - 金十数据中心
 */
export async function macro_euro_unemployment_rate_mom(): Promise<DataFrame> {
  return jin10EuroBaseFunc('欧元区失业率', '46');
}

/**
 * 欧元区未季调贸易帐 - 金十数据中心
 */
export async function macro_euro_trade_balance(): Promise<DataFrame> {
  return jin10EuroBaseFunc('欧元区未季调贸易帐', '43');
}

/**
 * 欧元区经常帐 - 金十数据中心
 */
export async function macro_euro_current_account_mom(): Promise<DataFrame> {
  return jin10EuroBaseFunc('欧元区经常帐', '11');
}

/**
 * 欧元区工业产出月率 - 金十数据中心
 */
export async function macro_euro_industrial_production_mom(): Promise<DataFrame> {
  return jin10EuroBaseFunc('欧元区工业产出月率', '19');
}

/**
 * 欧元区制造业 PMI 初值 - 金十数据中心
 */
export async function macro_euro_manufacturing_pmi(): Promise<DataFrame> {
  return jin10EuroBaseFunc('欧元区制造业PMI初值', '30');
}

/**
 * 欧元区服务业 PMI 终值 - 金十数据中心
 */
export async function macro_euro_services_pmi(): Promise<DataFrame> {
  return jin10EuroBaseFunc('欧元区服务业PMI终值', '41');
}

/**
 * 欧元区 ZEW 经济景气指数 - 金十数据中心
 */
export async function macro_euro_zew_economic_sentiment(): Promise<DataFrame> {
  return jin10EuroBaseFunc('欧元区ZEW经济景气指数', '48');
}

/**
 * 欧元区 Sentix 投资者信心指数 - 金十数据中心
 */
export async function macro_euro_sentix_investor_confidence(): Promise<DataFrame> {
  return jin10EuroBaseFunc('欧元区Sentix投资者信心指数', '40');
}

/**
 * 伦敦金属交易所(LME)持仓报告 - 金十数据中心
 */
export async function macro_euro_lme_holding(): Promise<DataFrame> {
  const data = await httpGet<any>('https://cdn.jin10.com/data_center/reports/lme_position.json', {
    params: { _: Date.now() },
  });

  if (!data?.values) {
    return createDataFrame([], []);
  }

  const columns = ['日期', '铜-多头', '铜-空头', '铜-净多头', '铝-多头', '铝-空头', '铝-净多头', '镍-多头', '镍-空头', '镍-净多头'];

  const rows: any[][] = [];
  const values = data.values;

  for (const date of Object.keys(values)) {
    const item = values[date];
    const row: any[] = [date];
    for (const key of Object.keys(item)) {
      const val = item[key];
      if (Array.isArray(val)) {
        row.push(...val);
      }
    }
    rows.push(row);
  }

  return createDataFrame(columns, rows);
}

/**
 * 伦敦金属交易所(LME)库存报告 - 金十数据中心
 */
export async function macro_euro_lme_stock(): Promise<DataFrame> {
  const data = await httpGet<any>('https://cdn.jin10.com/data_center/reports/lme_stock.json', {
    params: { _: Date.now() },
  });

  if (!data?.values) {
    return createDataFrame([], []);
  }

  const columns = ['日期', '铜-库存', '铜-注销仓单', '铜-注销占比', '铝-库存', '铝-注销仓单', '铝-注销占比', '镍-库存', '镍-注销仓单', '镍-注销占比'];

  const rows: any[][] = [];
  const values = data.values;

  for (const date of Object.keys(values)) {
    const item = values[date];
    const row: any[] = [date];
    for (const key of Object.keys(item)) {
      const val = item[key];
      if (Array.isArray(val)) {
        row.push(...val);
      }
    }
    rows.push(row);
  }

  return createDataFrame(columns, rows);
}
