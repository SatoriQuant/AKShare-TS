/**
 * AKShare TypeScript - 美国经济数据接口
 * 数据来源: 金十数据中心、东方财富
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 金十数据中心基础函数 - 用于获取美国经济指标
 */
async function jin10BaseFunc(symbol: string, attrId: string): Promise<DataFrame> {
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
 * 获取美国非农就业数据 - 金十数据中心
 * Python: macro_usa_non_farm 使用 jin10 API，返回列: 商品, 日期, 今值, 预测值, 前值
 */
export async function macro_usa_non_farm(): Promise<DataFrame> {
  return jin10BaseFunc('美国非农就业人数', '33');
}

/**
 * 获取美国联邦基金利率 - 东方财富
 */
export async function macro_usa_interest_rate(): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    reportName: 'RPT_ECONOMY_USA_INTEREST_RATE',
    columns: 'ALL',
    pageNumber: '1',
    pageSize: '1000',
    sortTypes: '-1',
    sortColumns: 'REPORT_DATE',
    source: 'WEB',
    client: 'WEB',
    _: Date.now(),
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.result?.data) {
    return createDataFrame([], []);
  }

  const columns = ['日期', '利率', '利率上限', '利率下限'];

  const rows = data.result.data.map((item: any) => [
    item.REPORT_DATE,
    item.INTEREST_RATE,
    item.INTEREST_RATE_CEILING,
    item.INTEREST_RATE_FLOOR,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 未决房屋销售月率 - 东方财富
 */
export async function macro_usa_phs(): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    reportName: 'RPT_ECONOMICVALUE_USA',
    columns: 'ALL',
    filter: '(INDICATOR_ID="EMG00342249")',
    pageNumber: '1',
    pageSize: '2000',
    sortColumns: 'REPORT_DATE',
    sortTypes: '-1',
    source: 'WEB',
    client: 'WEB',
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.result?.data) {
    return createDataFrame([], []);
  }

  const columns = ['时间', '前值', '现值', '发布日期'];

  const rows = data.result.data.map((item: any) => [
    item.REPORT_DATE_CH,
    item.PRE_VALUE,
    item.VALUE,
    item.PUBLISH_DATE,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 美国 CPI 年率 - 东方财富
 */
export async function macro_usa_cpi_yoy(): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    reportName: 'RPT_ECONOMICVALUE_USA',
    columns: 'ALL',
    filter: '(INDICATOR_ID="EMG00000733")',
    sortColumns: 'REPORT_DATE',
    sortTypes: '-1',
    source: 'WEB',
    client: 'WEB',
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.result?.data) {
    return createDataFrame([], []);
  }

  const columns = ['时间', '发布日期', '现值', '前值'];

  const rows = data.result.data.map((item: any) => [
    item.REPORT_DATE,
    item.PUBLISH_DATE,
    item.VALUE,
    item.PRE_VALUE,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 美国国内生产总值(GDP) - 金十数据中心
 */
export async function macro_usa_gdp_monthly(): Promise<DataFrame> {
  return jin10BaseFunc('美国国内生产总值(GDP)', '53');
}

/**
 * 美国 CPI 月率报告 - 金十数据中心
 */
export async function macro_usa_cpi_monthly(): Promise<DataFrame> {
  return jin10BaseFunc('美国CPI月率', '9');
}

/**
 * 美国核心 CPI 月率报告 - 金十数据中心
 */
export async function macro_usa_core_cpi_monthly(): Promise<DataFrame> {
  return jin10BaseFunc('美国核心CPI月率', '6');
}

/**
 * 美国个人支出月率报告 - 金十数据中心
 */
export async function macro_usa_personal_spending(): Promise<DataFrame> {
  return jin10BaseFunc('美国个人支出月率', '35');
}

/**
 * 美国零售销售月率报告 - 金十数据中心
 */
export async function macro_usa_retail_sales(): Promise<DataFrame> {
  return jin10BaseFunc('美国零售销售月率', '39');
}

/**
 * 美国进口物价指数报告 - 金十数据中心
 */
export async function macro_usa_import_price(): Promise<DataFrame> {
  return jin10BaseFunc('美国进口物价指数', '18');
}

/**
 * 美国出口价格指数报告 - 金十数据中心
 */
export async function macro_usa_export_price(): Promise<DataFrame> {
  return jin10BaseFunc('美国出口价格指数', '79');
}

/**
 * 美联储劳动力市场状况指数 - 金十数据中心
 */
export async function macro_usa_lmci(): Promise<DataFrame> {
  return jin10BaseFunc('美联储劳动力市场状况指数', '93');
}

/**
 * 美国失业率 - 金十数据中心
 */
export async function macro_usa_unemployment_rate(): Promise<DataFrame> {
  return jin10BaseFunc('美国失业率', '47');
}

/**
 * 美国挑战者企业裁员人数 - 金十数据中心
 */
export async function macro_usa_job_cuts(): Promise<DataFrame> {
  return jin10BaseFunc('美国挑战者企业裁员人数', '78');
}

/**
 * 美国非农就业人数 - 金十数据中心
 */
export async function macro_usa_non_farm_jin10(): Promise<DataFrame> {
  return jin10BaseFunc('美国非农就业人数', '33');
}

/**
 * 美国 ADP 就业人数 - 金十数据中心
 */
export async function macro_usa_adp_employment(): Promise<DataFrame> {
  return jin10BaseFunc('美国ADP就业人数', '1');
}

/**
 * 美国核心 PCE 物价指数年率 - 金十数据中心
 */
export async function macro_usa_core_pce_price(): Promise<DataFrame> {
  return jin10BaseFunc('美国核心PCE物价指数年率', '80');
}

/**
 * 美国实际个人消费支出季率初值 - 金十数据中心
 */
export async function macro_usa_real_consumer_spending(): Promise<DataFrame> {
  return jin10BaseFunc('美国实际个人消费支出季率初值', '81');
}

/**
 * 美国贸易帐 - 金十数据中心
 */
export async function macro_usa_trade_balance(): Promise<DataFrame> {
  return jin10BaseFunc('美国贸易帐报告', '42');
}

/**
 * 美国经常帐 - 金十数据中心
 */
export async function macro_usa_current_account(): Promise<DataFrame> {
  return jin10BaseFunc('美国经常账报告', '12');
}

/**
 * 美国生产者物价指数(PPI) - 金十数据中心
 */
export async function macro_usa_ppi(): Promise<DataFrame> {
  return jin10BaseFunc('美国生产者物价指数', '37');
}

/**
 * 美国核心生产者物价指数(PPI) - 金十数据中心
 */
export async function macro_usa_core_ppi(): Promise<DataFrame> {
  return jin10BaseFunc('美国核心生产者物价指数', '7');
}

/**
 * 美国 API 原油库存 - 金十数据中心
 */
export async function macro_usa_api_crude_stock(): Promise<DataFrame> {
  return jin10BaseFunc('美国API原油库存', '69');
}

/**
 * 美国 Markit 制造业 PMI 初值 - 金十数据中心
 */
export async function macro_usa_pmi(): Promise<DataFrame> {
  return jin10BaseFunc('美国Markit制造业PMI报告', '74');
}

/**
 * 美国 ISM 制造业 PMI - 金十数据中心
 */
export async function macro_usa_ism_pmi(): Promise<DataFrame> {
  return jin10BaseFunc('美国ISM制造业PMI报告', '28');
}

/**
 * 美国工业产出月率 - 金十数据中心
 */
export async function macro_usa_industrial_production(): Promise<DataFrame> {
  return jin10BaseFunc('美国工业产出月率报告', '20');
}

/**
 * 美国耐用品订单月率 - 金十数据中心
 */
export async function macro_usa_durable_goods_orders(): Promise<DataFrame> {
  return jin10BaseFunc('美国耐用品订单月率报告', '13');
}

/**
 * 美国工厂订单月率 - 金十数据中心
 */
export async function macro_usa_factory_orders(): Promise<DataFrame> {
  return jin10BaseFunc('美国工厂订单月率报告', '16');
}

/**
 * 美国 Markit 服务业 PMI 初值 - 金十数据中心
 */
export async function macro_usa_services_pmi(): Promise<DataFrame> {
  return jin10BaseFunc('美国Markit服务业PMI初值报告', '89');
}

/**
 * 美国商业库存月率 - 金十数据中心
 */
export async function macro_usa_business_inventories(): Promise<DataFrame> {
  return jin10BaseFunc('美国商业库存月率报告', '4');
}

/**
 * 美国 ISM 非制造业 PMI - 金十数据中心
 */
export async function macro_usa_ism_non_pmi(): Promise<DataFrame> {
  return jin10BaseFunc('美国ISM非制造业PMI报告', '29');
}

/**
 * 美国 NAHB 房产市场指数 - 金十数据中心
 */
export async function macro_usa_nahb_house_market_index(): Promise<DataFrame> {
  return jin10BaseFunc('美国NAHB房产市场指数报告', '31');
}

/**
 * 美国新屋开工总数年化 - 金十数据中心
 */
export async function macro_usa_house_starts(): Promise<DataFrame> {
  return jin10BaseFunc('美国新屋开工总数年化报告', '17');
}

/**
 * 美国新屋销售总数年化 - 金十数据中心
 */
export async function macro_usa_new_home_sales(): Promise<DataFrame> {
  return jin10BaseFunc('美国新屋销售总数年化报告', '32');
}

/**
 * 美国营建许可总数 - 金十数据中心
 */
export async function macro_usa_building_permits(): Promise<DataFrame> {
  return jin10BaseFunc('美国营建许可总数报告', '3');
}

/**
 * 美国成屋销售总数年化 - 金十数据中心
 */
export async function macro_usa_exist_home_sales(): Promise<DataFrame> {
  return jin10BaseFunc('美国成屋销售总数年化报告', '15');
}

/**
 * 美国 FHFA 房价指数月率 - 金十数据中心
 */
export async function macro_usa_house_price_index(): Promise<DataFrame> {
  return jin10BaseFunc('美国FHFA房价指数月率报告', '51');
}

/**
 * 美国 S&P/CS20 座大城市房价指数年率 - 金十数据中心
 */
export async function macro_usa_spcs20(): Promise<DataFrame> {
  return jin10BaseFunc('美国S&P/CS20座大城市房价指数年率', '52');
}

/**
 * 美国成屋签约销售指数月率 - 金十数据中心
 */
export async function macro_usa_pending_home_sales(): Promise<DataFrame> {
  return jin10BaseFunc('美国成屋签约销售指数月率报告', '34');
}

/**
 * 美国谘商会消费者信心指数 - 金十数据中心
 */
export async function macro_usa_cb_consumer_confidence(): Promise<DataFrame> {
  return jin10BaseFunc('美国谘商会消费者信心指数', '5');
}

/**
 * 美国 NFIB 小型企业信心指数 - 金十数据中心
 */
export async function macro_usa_nfib_small_business(): Promise<DataFrame> {
  return jin10BaseFunc('美国NFIB小型企业信心指数报告', '63');
}

/**
 * 美国密歇根大学消费者信心指数初值 - 金十数据中心
 */
export async function macro_usa_michigan_consumer_sentiment(): Promise<DataFrame> {
  return jin10BaseFunc('美国密歇根大学消费者信心指数初值报告', '50');
}

/**
 * 美国 EIA 原油库存 - 金十数据中心
 */
export async function macro_usa_eia_crude_rate(): Promise<DataFrame> {
  return jin10BaseFunc('美国EIA原油库存', '10');
}

/**
 * 美国初请失业金人数 - 金十数据中心
 */
export async function macro_usa_initial_jobless(): Promise<DataFrame> {
  return jin10BaseFunc('美国初请失业金人数', '44');
}

/**
 * 贝克休斯钻井报告 - 金十数据中心
 */
export async function macro_usa_rig_count(): Promise<DataFrame> {
  const data = await httpGet<any>('https://cdn.jin10.com/data_center/reports/baker.json', {
    params: { _: Date.now() },
  });

  if (!data?.values) {
    return createDataFrame([], []);
  }

  const columns = [
    '日期', '钻井总数_钻井数', '钻井总数_变化',
    '美国石油钻井_钻井数', '美国石油钻井_变化',
    '混合钻井_钻井数', '混合钻井_变化',
    '美国天然气钻井_钻井数', '美国天然气钻井_变化',
  ];

  const rows: any[][] = [];
  const values = data.values;

  for (const date of Object.keys(values)) {
    const item = values[date];
    rows.push([
      date,
      item['钻井总数']?.[0], item['钻井总数']?.[1],
      item['美国石油钻井']?.[0], item['美国石油钻井']?.[1],
      item['混合钻井']?.[0], item['混合钻井']?.[1],
      item['美国天然气钻井']?.[0], item['美国天然气钻井']?.[1],
    ]);
  }

  return createDataFrame(columns, rows);
}

/**
 * 美国原油产量 - 金十数据中心
 */
export async function macro_usa_crude_inner(): Promise<DataFrame> {
  const data = await httpGet<any>('https://cdn.jin10.com/data_center/reports/usa_oil.json', {
    params: { _: Date.now() },
  });

  if (!data?.values) {
    return createDataFrame([], []);
  }

  const columns = [
    '日期', '美国国内原油总量-产量', '美国国内原油总量-变化',
    '美国本土48州原油产量-产量', '美国本土48州原油产量-变化',
    '美国阿拉斯加州原油产量-产量', '美国阿拉斯加州原油产量-变化',
  ];

  const rows: any[][] = [];
  const values = data.values;

  for (const date of Object.keys(values)) {
    const item = values[date];
    rows.push([
      date,
      item['美国国内原油总量']?.[0], item['美国国内原油总量']?.[1],
      item['美国本土48州原油产量']?.[0], item['美国本土48州原油产量']?.[1],
      item['美国阿拉斯加州原油产量']?.[0], item['美国阿拉斯加州原油产量']?.[1],
    ]);
  }

  return createDataFrame(columns, rows);
}

/**
 * CFTC 外汇类非商业持仓报告 - 金十数据中心
 */
export async function macro_usa_cftc_nc_holding(): Promise<DataFrame> {
  const data = await httpGet<any>('https://cdn.jin10.com/data_center/reports/cftc_4.json', {
    params: { _: Date.now() },
  });

  if (!data?.values) {
    return createDataFrame([], []);
  }

  const columns = [
    '日期',
    '欧元-多头', '欧元-空头', '欧元-净多头',
    '日元-多头', '日元-空头', '日元-净多头',
    '英镑-多头', '英镑-空头', '英镑-净多头',
    '瑞郎-多头', '瑞郎-空头', '瑞郎-净多头',
    '加元-多头', '加元-空头', '加元-净多头',
    '澳元-多头', '澳元-空头', '澳元-净多头',
    '纽元-多头', '纽元-空头', '纽元-净多头',
  ];

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
 * CFTC 商品类非商业持仓报告 - 金十数据中心
 */
export async function macro_usa_cftc_c_holding(): Promise<DataFrame> {
  const data = await httpGet<any>('https://cdn.jin10.com/data_center/reports/cftc_2.json', {
    params: { _: Date.now() },
  });

  if (!data?.values) {
    return createDataFrame([], []);
  }

  const columns = ['日期', '黄金-多头', '黄金-空头', '黄金-净多头', '白银-多头', '白银-空头', '白银-净多头', '原油-多头', '原油-空头', '原油-净多头'];

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
 * CFTC 外汇类商业持仓报告 - 金十数据中心
 */
export async function macro_usa_cftc_merchant_currency_holding(): Promise<DataFrame> {
  const data = await httpGet<any>('https://cdn.jin10.com/data_center/reports/cftc_3.json', {
    params: { _: Date.now() },
  });

  if (!data?.values) {
    return createDataFrame([], []);
  }

  const columns = ['日期', '欧元-多头', '欧元-空头', '欧元-净多头', '日元-多头', '日元-空头', '日元-净多头', '英镑-多头', '英镑-空头', '英镑-净多头'];

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
 * CFTC 商品类商业持仓报告 - 金十数据中心
 */
export async function macro_usa_cftc_merchant_goods_holding(): Promise<DataFrame> {
  const data = await httpGet<any>('https://cdn.jin10.com/data_center/reports/cftc_1.json', {
    params: { _: Date.now() },
  });

  if (!data?.values) {
    return createDataFrame([], []);
  }

  const columns = ['日期', '黄金-多头', '黄金-空头', '黄金-净多头', '白银-多头', '白银-空头', '白银-净多头', '原油-多头', '原油-空头', '原油-净多头'];

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
 * CME 贵金属 - 金十数据中心
 */
export async function macro_usa_cme_merchant_goods_holding(): Promise<DataFrame> {
  const data = await httpGet<any>('https://cdn.jin10.com/data_center/reports/cme_3.json', {
    params: { _: Date.now() },
  });

  if (!data?.values) {
    return createDataFrame([], []);
  }

  const columns = ['日期', '品种', '成交量'];

  const rows: any[][] = [];
  const values = data.values;

  for (const date of Object.keys(values)) {
    const items = values[date];
    for (const item of items) {
      rows.push([date, `${item[0]}-${item[1]}`, item[5]]);
    }
  }

  return createDataFrame(columns, rows);
}
