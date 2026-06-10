/**
 * AKShare TypeScript - 中国经济数据接口
 * 数据来源: 东方财富、金十数据中心、商务部、国家统计局
 */

import { httpGet, httpPost, httpGetText } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 金十数据中心基础函数 - 用于获取中国经济指标
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
/**
 * 获取中国 GDP 数据 - 东方财富
 */
export async function macro_china_gdp(): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    columns: 'REPORT_DATE,TIME,DOMESTICL_PRODUCT_BASE,FIRST_PRODUCT_BASE,SECOND_PRODUCT_BASE,THIRD_PRODUCT_BASE,SUM_SAME,FIRST_SAME,SECOND_SAME,THIRD_SAME',
    pageNumber: '1',
    pageSize: '2000',
    sortTypes: '-1',
    sortColumns: 'REPORT_DATE',
    source: 'WEB',
    client: 'WEB',
    reportName: 'RPT_ECONOMY_GDP',
    _: Date.now(),
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.result?.data) {
    return createDataFrame([], []);
  }

  const columns = [
    '季度', '国内生产总值-绝对值', '国内生产总值-同比增长',
    '第一产业-绝对值', '第一产业-同比增长',
    '第二产业-绝对值', '第二产业-同比增长',
    '第三产业-绝对值', '第三产业-同比增长',
  ];

  const rows = data.result.data.map((item: any) => [
    item.TIME,
    item.DOMESTICL_PRODUCT_BASE,
    item.SUM_SAME,
    item.FIRST_PRODUCT_BASE,
    item.FIRST_SAME,
    item.SECOND_PRODUCT_BASE,
    item.SECOND_SAME,
    item.THIRD_PRODUCT_BASE,
    item.THIRD_SAME,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 获取中国 CPI 数据 - 东方财富
 */
export async function macro_china_cpi(): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    columns: 'REPORT_DATE,TIME,NATIONAL_SAME,NATIONAL_BASE,NATIONAL_SEQUENTIAL,NATIONAL_ACCUMULATE,CITY_SAME,CITY_BASE,CITY_SEQUENTIAL,CITY_ACCUMULATE,RURAL_SAME,RURAL_BASE,RURAL_SEQUENTIAL,RURAL_ACCUMULATE',
    pageNumber: '1',
    pageSize: '2000',
    sortTypes: '-1',
    sortColumns: 'REPORT_DATE',
    source: 'WEB',
    client: 'WEB',
    reportName: 'RPT_ECONOMY_CPI',
    _: Date.now(),
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.result?.data) {
    return createDataFrame([], []);
  }

  const columns = [
    '月份',
    '全国-当月', '全国-同比增长', '全国-环比增长', '全国-累计',
    '城市-当月', '城市-同比增长', '城市-环比增长', '城市-累计',
    '农村-当月', '农村-同比增长', '农村-环比增长', '农村-累计',
  ];

  const rows = data.result.data.map((item: any) => [
    item.TIME,
    item.NATIONAL_BASE,
    item.NATIONAL_SAME,
    item.NATIONAL_SEQUENTIAL,
    item.NATIONAL_ACCUMULATE,
    item.CITY_BASE,
    item.CITY_SAME,
    item.CITY_SEQUENTIAL,
    item.CITY_ACCUMULATE,
    item.RURAL_BASE,
    item.RURAL_SAME,
    item.RURAL_SEQUENTIAL,
    item.RURAL_ACCUMULATE,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 获取中国 PPI 数据 - 东方财富
 */
export async function macro_china_ppi(): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    columns: 'REPORT_DATE,TIME,BASE,BASE_SAME,BASE_ACCUMULATE',
    pageNumber: '1',
    pageSize: '2000',
    sortTypes: '-1',
    sortColumns: 'REPORT_DATE',
    source: 'WEB',
    client: 'WEB',
    reportName: 'RPT_ECONOMY_PPI',
    _: Date.now(),
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.result?.data) {
    return createDataFrame([], []);
  }

  const columns = ['月份', '当月', '当月同比增长', '累计'];

  const rows = data.result.data.map((item: any) => [
    item.TIME,
    item.BASE,
    item.BASE_SAME,
    item.BASE_ACCUMULATE,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 获取中国 PMI 数据 - 东方财富
 */
export async function macro_china_pmi(): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    columns: 'REPORT_DATE,TIME,MAKE_INDEX,MAKE_SAME,NMAKE_INDEX,NMAKE_SAME',
    pageNumber: '1',
    pageSize: '2000',
    sortTypes: '-1',
    sortColumns: 'REPORT_DATE',
    source: 'WEB',
    client: 'WEB',
    reportName: 'RPT_ECONOMY_PMI',
    _: Date.now(),
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.result?.data) {
    return createDataFrame([], []);
  }

  const columns = ['月份', '制造业-指数', '制造业-同比增长', '非制造业-指数', '非制造业-同比增长'];

  const rows = data.result.data.map((item: any) => [
    item.TIME,
    item.MAKE_INDEX,
    item.MAKE_SAME,
    item.NMAKE_INDEX,
    item.NMAKE_SAME,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 获取中国货币供应量 - 新浪财经
 * https://finance.sina.com.cn/mac/#fininfo-1-0-31-1
 */
export async function macro_china_supply_of_money(): Promise<DataFrame> {
  const baseUrl =
    'https://quotes.sina.cn/mac/api/jsonp_v3.php/SINAREMOTECALLCALLBACK1601651495761/MacPage_Service.get_pagedata';

  const baseParams = {
    cate: 'fininfo',
    event: '1',
    from: '0',
    num: '31',
    condition: '',
  };

  try {
    const fetchPage = async (from: number) => {
      const text = await httpGetText(baseUrl, {
        params: { ...baseParams, from: String(from) },
      });
      const match = text.match(/\((\{[\s\S]*\})\)/);
      if (!match) return null;
      return JSON.parse(match[1]);
    };

    const firstPage = await fetchPage(0);
    if (!firstPage?.data) {
      return createDataFrame([], []);
    }

    const total: number = parseInt(firstPage.count || '0', 10);
    const pageSize = 31;
    const pageNum = Math.ceil(total / pageSize);
    const columns: string[] = firstPage.config?.all
      ? firstPage.config.all.map((item: any[]) => item[1])
      : [];

    let allData: any[][] = [...firstPage.data];

    for (let i = 1; i < pageNum; i++) {
      const page = await fetchPage(i * pageSize);
      if (page?.data) {
        allData = allData.concat(page.data);
      }
    }

    if (columns.length === 0) {
      return createDataFrame([], []);
    }

    const rows = allData.map((row: any[]) => row.map((v: any) => v ?? null));
    return createDataFrame(columns, rows);
  } catch {
    return createDataFrame([], []);
  }
}

/**
 * 获取中国社会融资规模 - 东方财富
 */
export async function macro_china_shrzgm(): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    reportName: 'RPT_ECONOMY_FINANCING',
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

  const columns = ['日期', '社会融资规模', '新增人民币贷款', '新增外币贷款', '委托贷款', '信托贷款', '未贴现银行承兑汇票', '企业债券', '非金融企业境内股票融资'];

  const rows = data.result.data.map((item: any) => [
    item.REPORT_DATE,
    item.TOTAL,
    item.RMB_LOANS,
    item.FOREX_LOANS,
    item.TRUST_LOANS,
    item.ENTRUST_LOANS,
    item.BANK_ACCEPTANCE,
    item.CORP_BONDS,
    item.STOCK_FINANCING,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 企业商品价格指数 - 东方财富
 */
export async function macro_china_qyspjg(): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    columns: 'REPORT_DATE,TIME,BASE,BASE_SAME,BASE_SEQUENTIAL,FARM_BASE,FARM_BASE_SAME,FARM_BASE_SEQUENTIAL,MINERAL_BASE,MINERAL_BASE_SAME,MINERAL_BASE_SEQUENTIAL,ENERGY_BASE,ENERGY_BASE_SAME,ENERGY_BASE_SEQUENTIAL',
    pageNumber: '1',
    pageSize: '2000',
    sortColumns: 'REPORT_DATE',
    sortTypes: '-1',
    source: 'WEB',
    client: 'WEB',
    reportName: 'RPT_ECONOMY_GOODS_INDEX',
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.result?.data) {
    return createDataFrame([], []);
  }

  const columns = [
    '月份', '总指数-指数值', '总指数-同比增长', '总指数-环比增长',
    '农产品-指数值', '农产品-同比增长', '农产品-环比增长',
    '矿产品-指数值', '矿产品-同比增长', '矿产品-环比增长',
    '煤油电-指数值', '煤油电-同比增长', '煤油电-环比增长',
  ];

  const rows = data.result.data.map((item: any) => [
    item.TIME, item.BASE, item.BASE_SAME, item.BASE_SEQUENTIAL,
    item.FARM_BASE, item.FARM_BASE_SAME, item.FARM_BASE_SEQUENTIAL,
    item.MINERAL_BASE, item.MINERAL_BASE_SAME, item.MINERAL_BASE_SEQUENTIAL,
    item.ENERGY_BASE, item.ENERGY_BASE_SAME, item.ENERGY_BASE_SEQUENTIAL,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 外商直接投资数据 - 东方财富
 */
export async function macro_china_fdi(): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    columns: 'REPORT_DATE,TIME,ACTUAL_FOREIGN,ACTUAL_FOREIGN_SAME,ACTUAL_FOREIGN_SEQUENTIAL,ACTUAL_FOREIGN_ACCUMULATE,FOREIGN_ACCUMULATE_SAME',
    pageNumber: '1',
    pageSize: '2000',
    sortColumns: 'REPORT_DATE',
    sortTypes: '-1',
    source: 'WEB',
    client: 'WEB',
    reportName: 'RPT_ECONOMY_FDI',
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.result?.data) {
    return createDataFrame([], []);
  }

  const columns = ['月份', '当月', '当月-同比增长', '当月-环比增长', '累计', '累计-同比增长'];

  const rows = data.result.data.map((item: any) => [
    item.TIME, item.ACTUAL_FOREIGN, item.ACTUAL_FOREIGN_SAME,
    item.ACTUAL_FOREIGN_SEQUENTIAL, item.ACTUAL_FOREIGN_ACCUMULATE,
    item.FOREIGN_ACCUMULATE_SAME,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 中国 GDP 年率报告 - 金十数据中心
 */
export async function macro_china_gdp_yearly(): Promise<DataFrame> {
  return jin10BaseFunc('中国GDP年率报告', '57');
}

/**
 * 中国 CPI 年率报告 - 金十数据中心
 */
export async function macro_china_cpi_yearly(): Promise<DataFrame> {
  return jin10BaseFunc('中国CPI年率报告', '56');
}

/**
 * 中国 CPI 月率报告 - 金十数据中心
 */
export async function macro_china_cpi_monthly(): Promise<DataFrame> {
  return jin10BaseFunc('中国CPI月率报告', '72');
}

/**
 * 中国 PPI 年率报告 - 金十数据中心
 */
export async function macro_china_ppi_yearly(): Promise<DataFrame> {
  return jin10BaseFunc('中国PPI年率报告', '60');
}

/**
 * 中国以美元计算出口年率报告 - 金十数据中心
 */
export async function macro_china_exports_yoy(): Promise<DataFrame> {
  return jin10BaseFunc('中国以美元计算出口年率报告', '66');
}

/**
 * 中国以美元计算进口年率报告 - 金十数据中心
 */
export async function macro_china_imports_yoy(): Promise<DataFrame> {
  return jin10BaseFunc('中国以美元计算进口年率报告', '77');
}

/**
 * 中国以美元计算贸易帐报告 - 金十数据中心
 */
export async function macro_china_trade_balance(): Promise<DataFrame> {
  return jin10BaseFunc('中国以美元计算贸易帐报告', '61');
}

/**
 * 中国规模以上工业增加值年率报告 - 金十数据中心
 */
export async function macro_china_industrial_production_yoy(): Promise<DataFrame> {
  return jin10BaseFunc('中国规模以上工业增加值年率报告', '58');
}

/**
 * 中国官方制造业PMI - 金十数据中心
 */
export async function macro_china_pmi_yearly(): Promise<DataFrame> {
  return jin10BaseFunc('中国官方制造业PMI', '65');
}

/**
 * 中国财新制造业PMI终值 - 金十数据中心
 */
export async function macro_china_cx_pmi_yearly(): Promise<DataFrame> {
  return jin10BaseFunc('中国财新制造业PMI终值报告', '73');
}

/**
 * 中国财新服务业PMI - 金十数据中心
 */
export async function macro_china_cx_services_pmi_yearly(): Promise<DataFrame> {
  return jin10BaseFunc('中国财新服务业PMI报告', '67');
}

/**
 * 中国官方非制造业PMI - 金十数据中心
 */
export async function macro_china_non_man_pmi(): Promise<DataFrame> {
  return jin10BaseFunc('中国官方非制造业PMI报告', '75');
}

/**
 * 中国外汇储备 - 金十数据中心
 */
export async function macro_china_fx_reserves_yearly(): Promise<DataFrame> {
  return jin10BaseFunc('中国外汇储备报告', '76');
}

/**
 * 中国 M2 货币供应年率 - 金十数据中心
 */
export async function macro_china_m2_yearly(): Promise<DataFrame> {
  return jin10BaseFunc('中国M2货币供应年率报告', '59');
}

/**
 * 城镇调查失业率 - 国家统计局
 */
export async function macro_china_urban_unemployment(): Promise<DataFrame> {
  const url = 'https://data.stats.gov.cn/dg/website/publicrelease/web/external/getEsDataByCidAndDt';
  const payload = {
    cid: 'ee3b7046b390415b9b7745e3d16f6052',
    indicatorIds: [
      '3888eac6062945a79c8a27e5f13d4953',
      '1d550f3ec77a463bb607d4a3427e1465',
      '1c1b2d9ab24048bfadc5c7d9510dc663',
      '3921da310de24f14b6457c235657baf9',
      'bd6da1abb26046c2acb38aa701d90e86',
      '7bc1bd5daeac48ae8bb413c34ece1d08',
      'c03a36c9562246b6bc8aab010951ef1c',
      '1061f276ce354907b0b9900c266cf851',
      '40ab91b1ef4948e89633c5c7f55b9713',
    ],
    daCatalogId: '',
    das: [{ text: '全国', value: '000000000000' }],
    dts: ['199001MM-203601MM'],
    showType: '1',
    rootId: 'fc982599aa684be7969d7b90b1bd0e84',
  };

  const data = await httpPost<any>(url, payload, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!data?.data) {
    return createDataFrame([], []);
  }

  const columns = ['date', 'item', 'value'];
  const rows: any[][] = [];

  for (const monthItem of data.data) {
    const rawMonth = monthItem.name;
    const yearPart = rawMonth.split('年')[0];
    const monthPart = rawMonth.split('年')[1].replace('月', '');
    const monthClean = yearPart + monthPart.padStart(2, '0');

    for (const valueItem of monthItem.values) {
      if (valueItem._name === '城镇调查失业率' && valueItem.value) {
        const indicatorClean = valueItem.i_showname.replace(' (%)', '');
        rows.push([monthClean, indicatorClean, valueItem.value]);
      }
    }
  }

  return createDataFrame(columns, rows);
}

/**
 * LPR品种详细数据 - 东方财富
 */
export async function macro_china_lpr(): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    reportName: 'RPTA_WEB_RATE',
    columns: 'ALL',
    sortColumns: 'TRADE_DATE',
    sortTypes: '-1',
    token: '894050c76af8597a853f5b408b759f5d',
    pageNumber: '1',
    pageSize: '500',
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.result?.data) {
    return createDataFrame([], []);
  }

  const columns = ['日期', 'LPR1Y', 'LPR5Y', 'DR007', 'DR001'];

  const rows = data.result.data.map((item: any) => [
    item.TRADE_DATE,
    item.LPR1Y,
    item.LPR5Y,
    item.RATE_1,
    item.RATE_2,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 企业景气及企业家信心指数 - 东方财富
 */
export async function macro_china_enterprise_boom_index(): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    columns: 'REPORT_DATE,TIME,BOOM_INDEX,FAITH_INDEX,BOOM_INDEX_SAME,BOOM_INDEX_SEQUENTIAL,FAITH_INDEX_SAME,FAITH_INDEX_SEQUENTIAL',
    pageNumber: '1',
    pageSize: '500',
    sortColumns: 'REPORT_DATE',
    sortTypes: '-1',
    source: 'WEB',
    client: 'WEB',
    reportName: 'RPT_ECONOMY_BOOM_INDEX',
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.result?.data) {
    return createDataFrame([], []);
  }

  const columns = [
    '季度', '企业景气指数-指数', '企业景气指数-同比', '企业景气指数-环比',
    '企业家信心指数-指数', '企业家信心指数-同比', '企业家信心指数-环比',
  ];

  const rows = data.result.data.map((item: any) => [
    item.TIME, item.BOOM_INDEX, item.BOOM_INDEX_SAME, item.BOOM_INDEX_SEQUENTIAL,
    item.FAITH_INDEX, item.FAITH_INDEX_SAME, item.FAITH_INDEX_SEQUENTIAL,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 全国税收收入 - 东方财富
 */
export async function macro_china_national_tax_receipts(): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    columns: 'REPORT_DATE,TIME,TAX_INCOME,TAX_INCOME_SAME,TAX_INCOME_SEQUENTIAL',
    pageNumber: '1',
    pageSize: '500',
    sortColumns: 'REPORT_DATE',
    sortTypes: '-1',
    source: 'WEB',
    client: 'WEB',
    reportName: 'RPT_ECONOMY_TAX',
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.result?.data) {
    return createDataFrame([], []);
  }

  const columns = ['季度', '税收收入合计', '较上年同期', '季度环比'];

  const rows = data.result.data.map((item: any) => [
    item.TIME, item.TAX_INCOME, item.TAX_INCOME_SAME, item.TAX_INCOME_SEQUENTIAL,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 新增信贷数据 - 东方财富
 */
export async function macro_china_new_financial_credit(): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    columns: 'REPORT_DATE,TIME,RMB_LOAN,RMB_LOAN_SAME,RMB_LOAN_SEQUENTIAL,RMB_LOAN_ACCUMULATE,LOAN_ACCUMULATE_SAME',
    pageNumber: '1',
    pageSize: '2000',
    sortColumns: 'REPORT_DATE',
    sortTypes: '-1',
    source: 'WEB',
    client: 'WEB',
    reportName: 'RPT_ECONOMY_RMB_LOAN',
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.result?.data) {
    return createDataFrame([], []);
  }

  const columns = ['月份', '当月', '当月-同比增长', '当月-环比增长', '累计', '累计-同比增长'];

  const rows = data.result.data.map((item: any) => [
    item.TIME, item.RMB_LOAN, item.RMB_LOAN_SAME,
    item.RMB_LOAN_SEQUENTIAL, item.RMB_LOAN_ACCUMULATE, item.LOAN_ACCUMULATE_SAME,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 外汇和黄金储备 - 东方财富
 */
export async function macro_china_fx_gold(): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    columns: 'REPORT_DATE,TIME,GOLD_RESERVES,GOLD_RESERVES_SAME,GOLD_RESERVES_SEQUENTIAL,FOREX,FOREX_SAME,FOREX_SEQUENTIAL',
    pageNumber: '1',
    pageSize: '1000',
    sortColumns: 'REPORT_DATE',
    sortTypes: '-1',
    source: 'WEB',
    client: 'WEB',
    reportName: 'RPT_ECONOMY_GOLD_CURRENCY',
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.result?.data) {
    return createDataFrame([], []);
  }

  const columns = [
    '月份', '黄金储备-数值', '黄金储备-同比', '黄金储备-环比',
    '国家外汇储备-数值', '国家外汇储备-同比', '国家外汇储备-环比',
  ];

  const rows = data.result.data.map((item: any) => [
    item.TIME, item.GOLD_RESERVES, item.GOLD_RESERVES_SAME, item.GOLD_RESERVES_SEQUENTIAL,
    item.FOREX, item.FOREX_SAME, item.FOREX_SEQUENTIAL,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 货币供应量 - 东方财富
 */
export async function macro_china_money_supply(): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    columns: 'REPORT_DATE,TIME,BASIC_CURRENCY,BASIC_CURRENCY_SAME,BASIC_CURRENCY_SEQUENTIAL,CURRENCY,CURRENCY_SAME,CURRENCY_SEQUENTIAL,FREE_CASH,FREE_CASH_SAME,FREE_CASH_SEQUENTIAL',
    pageNumber: '1',
    pageSize: '2000',
    sortColumns: 'REPORT_DATE',
    sortTypes: '-1',
    source: 'WEB',
    client: 'WEB',
    reportName: 'RPT_ECONOMY_CURRENCY_SUPPLY',
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.result?.data) {
    return createDataFrame([], []);
  }

  const columns = [
    '月份', '货币和准货币(M2)-数量(亿元)', '货币和准货币(M2)-同比增长', '货币和准货币(M2)-环比增长',
    '货币(M1)-数量(亿元)', '货币(M1)-同比增长', '货币(M1)-环比增长',
    '流通中的现金(M0)-数量(亿元)', '流通中的现金(M0)-同比增长', '流通中的现金(M0)-环比增长',
  ];

  const rows = data.result.data.map((item: any) => [
    item.TIME, item.BASIC_CURRENCY, item.BASIC_CURRENCY_SAME, item.BASIC_CURRENCY_SEQUENTIAL,
    item.CURRENCY, item.CURRENCY_SAME, item.CURRENCY_SEQUENTIAL,
    item.FREE_CASH, item.FREE_CASH_SAME, item.FREE_CASH_SEQUENTIAL,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 东财宏观数据通用函数 - 用于行业指数类数据
 */
async function emMacroIndex(emId: string): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    sortColumns: 'REPORT_DATE',
    sortTypes: '-1',
    pageSize: '500',
    pageNumber: '1',
    reportName: 'RPT_INDUSTRY_INDEX',
    columns: 'REPORT_DATE,INDICATOR_VALUE,CHANGE_RATE,CHANGERATE_3M,CHANGERATE_6M,CHANGERATE_1Y,CHANGERATE_2Y,CHANGERATE_3Y',
    filter: `(INDICATOR_ID="${emId}")`,
    source: 'WEB',
    client: 'WEB',
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.result?.data) {
    return createDataFrame([], []);
  }

  const columns = ['日期', '最新值', '涨跌幅', '近3月涨跌幅', '近6月涨跌幅', '近1年涨跌幅', '近2年涨跌幅', '近3年涨跌幅'];

  const rows = data.result.data.map((item: any) => [
    item.REPORT_DATE, item.INDICATOR_VALUE, item.CHANGE_RATE,
    item.CHANGERATE_3M, item.CHANGERATE_6M, item.CHANGERATE_1Y,
    item.CHANGERATE_2Y, item.CHANGERATE_3Y,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 银行理财产品发行数量 - 东方财富
 */
export async function macro_china_bank_financing(): Promise<DataFrame> {
  return emMacroIndex('EMI01516267');
}

/**
 * 原保险保费收入 - 东方财富
 */
export async function macro_china_insurance_income(): Promise<DataFrame> {
  return emMacroIndex('EMM00088870');
}

/**
 * 手机出货量 - 东方财富
 */
export async function macro_china_mobile_number(): Promise<DataFrame> {
  return emMacroIndex('EMI00225823');
}

/**
 * 菜篮子产品批发价格指数 - 东方财富
 */
export async function macro_china_vegetable_basket(): Promise<DataFrame> {
  return emMacroIndex('EMI00009275');
}

/**
 * 农产品批发价格总指数 - 东方财富
 */
export async function macro_china_agricultural_product(): Promise<DataFrame> {
  return emMacroIndex('EMI00009274');
}

/**
 * 农副指数 - 东方财富
 */
export async function macro_china_agricultural_index(): Promise<DataFrame> {
  return emMacroIndex('EMI00662543');
}

/**
 * 能源指数 - 东方财富
 */
export async function macro_china_energy_index(): Promise<DataFrame> {
  return emMacroIndex('EMI00662539');
}

/**
 * 大宗商品价格 - 东方财富
 */
export async function macro_china_commodity_price_index(): Promise<DataFrame> {
  return emMacroIndex('EMI00662535');
}

/**
 * 费城半导体指数 - 东方财富
 */
export async function macro_global_sox_index(): Promise<DataFrame> {
  return emMacroIndex('EMI00055562');
}

/**
 * 建材指数 - 东方财富
 */
export async function macro_china_construction_index(): Promise<DataFrame> {
  return emMacroIndex('EMI00662541');
}

/**
 * 建材价格指数 - 东方财富
 */
export async function macro_china_construction_price_index(): Promise<DataFrame> {
  return emMacroIndex('EMI00237146');
}

/**
 * 物流景气指数 - 东方财富
 */
export async function macro_china_lpi_index(): Promise<DataFrame> {
  return emMacroIndex('EMI00352262');
}

/**
 * 原油运输指数 - 东方财富
 */
export async function macro_china_bdti_index(): Promise<DataFrame> {
  return emMacroIndex('EMI00107668');
}

/**
 * 超灵便型船运价指数 - 东方财富
 */
export async function macro_china_bsi_index(): Promise<DataFrame> {
  return emMacroIndex('EMI00107667');
}

/**
 * 海岬型运费指数(BCI) - 东方财富
 */
export async function macro_shipping_bci(): Promise<DataFrame> {
  return emMacroIndex('EMI00107666');
}

/**
 * 波罗的海干散货指数(BDI) - 东方财富
 */
export async function macro_shipping_bdi(): Promise<DataFrame> {
  return emMacroIndex('EMI00107664');
}

/**
 * 巴拿马型运费指数(BPI) - 东方财富
 */
export async function macro_shipping_bpi(): Promise<DataFrame> {
  return emMacroIndex('EMI00107665');
}

/**
 * 成品油运输指数（BCTI） - 东方财富
 */
export async function macro_shipping_bcti(): Promise<DataFrame> {
  return emMacroIndex('EMI00107669');
}

/**
 * 全国股票交易统计表 - 东方财富
 */
export async function macro_china_stock_market_cap(): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    reportName: 'RPT_ECONOMY_STOCK_STATISTICS',
    columns: 'REPORT_DATE,TIME,TOTAL_SHARES_SH,TOTAL_MARKE_SH,DEAL_AMOUNT_SH,VOLUME_SH,HIGH_INDEX_SH,LOW_INDEX_SH,TOTAL_SZARES_SZ,TOTAL_MARKE_SZ,DEAL_AMOUNT_SZ,VOLUME_SZ,HIGH_INDEX_SZ,LOW_INDEX_SZ',
    sortColumns: 'REPORT_DATE',
    sortTypes: '-1',
    pageNumber: '1',
    pageSize: '1000',
    source: 'WEB',
    client: 'WEB',
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.result?.data) {
    return createDataFrame([], []);
  }

  const columns = [
    '数据日期', '发行总股本-上海', '发行总股本-深圳',
    '市价总值-上海', '市价总值-深圳',
    '成交金额-上海', '成交金额-深圳',
    '成交量-上海', '成交量-深圳',
    'A股最高综合股价指数-上海', 'A股最高综合股价指数-深圳',
    'A股最低综合股价指数-上海', 'A股最低综合股价指数-深圳',
  ];

  const rows = data.result.data.map((item: any) => [
    item.TIME, item.TOTAL_SHARES_SH, item.TOTAL_SZARES_SZ,
    item.TOTAL_MARKE_SH, item.TOTAL_MARKE_SZ,
    item.DEAL_AMOUNT_SH, item.DEAL_AMOUNT_SZ,
    item.VOLUME_SH, item.VOLUME_SZ,
    item.HIGH_INDEX_SH, item.HIGH_INDEX_SZ,
    item.LOW_INDEX_SH, item.LOW_INDEX_SZ,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 上海银行业同业拆借报告 - 金十数据中心
 */
export async function macro_china_shibor_all(): Promise<DataFrame> {
  const data = await httpGet<any>('https://cdn.jin10.com/data_center/reports/il_1.json', {
    params: { _: Date.now() },
  });

  if (!data?.values) {
    return createDataFrame([], []);
  }

  const columns = [
    '日期', 'O/N-定价', 'O/N-涨跌幅', '1W-定价', '1W-涨跌幅',
    '2W-定价', '2W-涨跌幅', '1M-定价', '1M-涨跌幅',
    '3M-定价', '3M-涨跌幅', '6M-定价', '6M-涨跌幅',
    '9M-定价', '9M-涨跌幅', '1Y-定价', '1Y-涨跌幅',
  ];

  const rows: any[][] = [];
  const values = data.values;

  for (const date of Object.keys(values)) {
    const item = values[date];
    rows.push([
      date,
      item['O/N']?.[0], item['O/N']?.[1],
      item['1W']?.[0], item['1W']?.[1],
      item['2W']?.[0], item['2W']?.[1],
      item['1M']?.[0], item['1M']?.[1],
      item['3M']?.[0], item['3M']?.[1],
      item['6M']?.[0], item['6M']?.[1],
      item['9M']?.[0], item['9M']?.[1],
      item['1Y']?.[0], item['1Y']?.[1],
    ]);
  }

  return createDataFrame(columns, rows);
}

/**
 * 香港同业拆借报告 - 金十数据中心
 */
export async function macro_china_hk_market_info(): Promise<DataFrame> {
  const data = await httpGet<any>('https://cdn.jin10.com/data_center/reports/il_2.json', {
    params: { _: Date.now() },
  });

  if (!data?.values) {
    return createDataFrame([], []);
  }

  const columns = [
    '日期', '1W-定价', '1W-涨跌幅', '2W-定价', '2W-涨跌幅',
    '1M-定价', '1M-涨跌幅', '3M-定价', '3M-涨跌幅',
    '6M-定价', '6M-涨跌幅', '1Y-定价', '1Y-涨跌幅',
    'ON-定价', 'ON-涨跌幅', '2M-定价', '2M-涨跌幅',
  ];

  const rows: any[][] = [];
  const values = data.values;

  for (const date of Object.keys(values)) {
    const item = values[date];
    rows.push([
      date,
      item['1W']?.[0], item['1W']?.[1],
      item['2W']?.[0], item['2W']?.[1],
      item['1M']?.[0], item['1M']?.[1],
      item['3M']?.[0], item['3M']?.[1],
      item['6M']?.[0], item['6M']?.[1],
      item['1Y']?.[0], item['1Y']?.[1],
      item['ON']?.[0], item['ON']?.[1],
      item['2M']?.[0], item['2M']?.[1],
    ]);
  }

  return createDataFrame(columns, rows);
}

/**
 * 中国人民币汇率中间价报告 - 金十数据中心
 */
export async function macro_china_rmb(): Promise<DataFrame> {
  const data = await httpGet<any>('https://cdn.jin10.com/data_center/reports/exchange_rate.json', {
    params: { _: Date.now() },
  });

  if (!data?.values) {
    return createDataFrame([], []);
  }

  const currencyPairs = [
    '美元/人民币', '欧元/人民币', '100日元/人民币', '港元/人民币',
    '英镑/人民币', '澳元/人民币', '新西兰元/人民币', '新加坡元/人民币',
    '瑞郎/人民币', '加元/人民币', '人民币/马来西亚林吉特', '人民币/俄罗斯卢布',
    '人民币/南非兰特', '人民币/韩元', '人民币/阿联酋迪拉姆', '人民币/沙特里亚尔',
    '人民币/匈牙利福林', '人民币/波兰兹罗提', '人民币/丹麦克朗', '人民币/瑞典克朗',
    '人民币/挪威克朗', '人民币/土耳其里拉', '人民币/墨西哥比索', '人民币/泰铢',
  ];

  const columns: string[] = ['日期'];
  for (const pair of currencyPairs) {
    columns.push(`${pair}_中间价`);
    columns.push(`${pair}_涨跌幅`);
  }

  const rows: any[][] = [];
  const values = data.values;

  for (const date of Object.keys(values)) {
    const row: any[] = [date];
    const item = values[date];
    for (const pair of currencyPairs) {
      row.push(item[pair]?.[0] ?? 0);
      row.push(item[pair]?.[1] ?? 0);
    }
    rows.push(row);
  }

  return createDataFrame(columns, rows);
}

/**
 * 上海融资融券报告 - 金十数据中心
 */
export async function macro_china_market_margin_sh(): Promise<DataFrame> {
  const data = await httpGet<any>('https://cdn.jin10.com/data_center/reports/fs_1.json', {
    params: { _: Date.now() },
  });

  if (!data?.values) {
    return createDataFrame([], []);
  }

  const columns = ['日期', '融资买入额', '融资余额', '融券卖出量', '融券余量', '融券余额', '融资融券余额'];

  const rows: any[][] = [];
  const values = data.values;

  for (const date of Object.keys(values)) {
    const item = values[date];
    rows.push([date, ...item]);
  }

  return createDataFrame(columns, rows);
}

/**
 * 深圳融资融券报告 - 金十数据中心
 */
export async function macro_china_market_margin_sz(): Promise<DataFrame> {
  const data = await httpGet<any>('https://cdn.jin10.com/data_center/reports/fs_2.json', {
    params: { _: Date.now() },
  });

  if (!data?.values) {
    return createDataFrame([], []);
  }

  const columns = ['日期', '融资买入额', '融资余额', '融券卖出量', '融券余量', '融券余额', '融资融券余额'];

  const rows: any[][] = [];
  const values = data.values;

  for (const date of Object.keys(values)) {
    const item = values[date];
    rows.push([date, ...item]);
  }

  return createDataFrame(columns, rows);
}

/**
 * 上海黄金交易所报告 - 金十数据中心
 */
export async function macro_china_au_report(): Promise<DataFrame> {
  const data = await httpGet<any>('https://cdn.jin10.com/data_center/reports/sge.json', {
    params: { _: Date.now() },
  });

  if (!data?.values) {
    return createDataFrame([], []);
  }

  const columns = [
    '日期', '商品', '开盘价', '最高价', '最低价', '收盘价',
    '涨跌', '涨跌幅', '加权平均价', '成交量', '成交金额',
    '持仓量', '交收方向', '交收量',
  ];

  const rows: any[][] = [];
  const values = data.values;

  for (const date of Object.keys(values)) {
    const items = values[date];
    for (const item of items) {
      rows.push([date, ...item]);
    }
  }

  return createDataFrame(columns, rows);
}

/**
 * 中国日度沿海六大电库存数据 - 金十数据中心
 */
export async function macro_china_daily_energy(): Promise<DataFrame> {
  const t = Date.now();
  const url = `https://cdn.jin10.com/dc/reports/dc_qihuo_energy_report_all.js?v=${t}&_=${t + 90}`;

  const data = await httpGet<any>(url);

  if (!data?.list) {
    return createDataFrame([], []);
  }

  const columns = ['日期', '沿海六大电库存', '日耗', '存煤可用天数'];

  const rows = data.list.map((item: any) => [
    item.date,
    item.datas['沿海六大电厂库存动态报告']?.[0],
    item.datas['沿海六大电厂库存动态报告']?.[1],
    item.datas['沿海六大电厂库存动态报告']?.[2],
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 新房价指数 - 东方财富
 */
export async function macro_china_new_house_price(
  cityFirst: string = '北京',
  citySecond: string = '上海',
): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    reportName: 'RPT_ECONOMY_HOUSE_PRICE',
    columns: 'REPORT_DATE,CITY,FIRST_COMHOUSE_SAME,FIRST_COMHOUSE_SEQUENTIAL,FIRST_COMHOUSE_BASE,SECOND_HOUSE_SAME,SECOND_HOUSE_SEQUENTIAL,SECOND_HOUSE_BASE,REPORT_DAY',
    filter: `(CITY in ("${cityFirst}","${citySecond}"))`,
    pageNumber: '1',
    pageSize: '500',
    sortColumns: 'REPORT_DATE,CITY',
    sortTypes: '-1,-1',
    source: 'WEB',
    client: 'WEB',
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.result?.data) {
    return createDataFrame([], []);
  }

  const columns = [
    '日期', '城市',
    '新建商品住宅价格指数-同比', '新建商品住宅价格指数-环比', '新建商品住宅价格指数-定基',
    '二手住宅价格指数-同比', '二手住宅价格指数-环比', '二手住宅价格指数-定基',
  ];

  const rows = data.result.data.map((item: any) => [
    item.REPORT_DATE, item.CITY,
    item.FIRST_COMHOUSE_SAME, item.FIRST_COMHOUSE_SEQUENTIAL, item.FIRST_COMHOUSE_BASE,
    item.SECOND_HOUSE_SAME, item.SECOND_HOUSE_SEQUENTIAL, item.SECOND_HOUSE_BASE,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 城镇固定资产投资 - 东方财富
 */
export async function macro_china_gdzctz(): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    columns: 'REPORT_DATE,TIME,BASE,BASE_SAME,BASE_SEQUENTIAL,BASE_ACCUMULATE',
    pageNumber: '1',
    pageSize: '2000',
    sortColumns: 'REPORT_DATE',
    sortTypes: '-1',
    source: 'WEB',
    client: 'WEB',
    reportName: 'RPT_ECONOMY_ASSET_INVEST',
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.result?.data) {
    return createDataFrame([], []);
  }

  const columns = ['月份', '当月', '同比增长', '环比增长', '自年初累计'];

  const rows = data.result.data.map((item: any) => [
    item.TIME, item.BASE, item.BASE_SAME, item.BASE_SEQUENTIAL, item.BASE_ACCUMULATE,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 海关进出口增减情况一览表 - 东方财富
 */
export async function macro_china_hgjck(): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    columns: 'REPORT_DATE,TIME,EXIT_BASE,IMPORT_BASE,EXIT_BASE_SAME,IMPORT_BASE_SAME,EXIT_BASE_SEQUENTIAL,IMPORT_BASE_SEQUENTIAL,EXIT_ACCUMULATE,IMPORT_ACCUMULATE,EXIT_ACCUMULATE_SAME,IMPORT_ACCUMULATE_SAME',
    pageNumber: '1',
    pageSize: '2000',
    sortColumns: 'REPORT_DATE',
    sortTypes: '-1',
    source: 'WEB',
    client: 'WEB',
    reportName: 'RPT_ECONOMY_CUSTOMS',
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.result?.data) {
    return createDataFrame([], []);
  }

  const columns = [
    '月份',
    '当月出口额-金额', '当月出口额-同比增长', '当月出口额-环比增长',
    '当月进口额-金额', '当月进口额-同比增长', '当月进口额-环比增长',
    '累计出口额-金额', '累计出口额-同比增长',
    '累计进口额-金额', '累计进口额-同比增长',
  ];

  const rows = data.result.data.map((item: any) => [
    item.TIME,
    item.EXIT_BASE, item.EXIT_BASE_SAME, item.EXIT_BASE_SEQUENTIAL,
    item.IMPORT_BASE, item.IMPORT_BASE_SAME, item.IMPORT_BASE_SEQUENTIAL,
    item.EXIT_ACCUMULATE, item.EXIT_ACCUMULATE_SAME,
    item.IMPORT_ACCUMULATE, item.IMPORT_ACCUMULATE_SAME,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 财政收入 - 东方财富
 */
export async function macro_china_czsr(): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    columns: 'REPORT_DATE,TIME,BASE,BASE_SAME,BASE_SEQUENTIAL,BASE_ACCUMULATE,ACCUMULATE_SAME',
    pageNumber: '1',
    pageSize: '2000',
    sortColumns: 'REPORT_DATE',
    sortTypes: '-1',
    source: 'WEB',
    client: 'WEB',
    reportName: 'RPT_ECONOMY_INCOME',
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.result?.data) {
    return createDataFrame([], []);
  }

  const columns = ['月份', '当月', '当月-同比增长', '当月-环比增长', '累计', '累计-同比增长'];

  const rows = data.result.data.map((item: any) => [
    item.TIME, item.BASE, item.BASE_SAME, item.BASE_SEQUENTIAL, item.BASE_ACCUMULATE, item.ACCUMULATE_SAME,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 外汇贷款数据 - 东方财富
 */
export async function macro_china_whxd(): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    columns: 'REPORT_DATE,TIME,BASE,BASE_SAME,BASE_SEQUENTIAL,BASE_ACCUMULATE',
    pageNumber: '1',
    pageSize: '2000',
    sortColumns: 'REPORT_DATE',
    sortTypes: '-1',
    source: 'WEB',
    client: 'WEB',
    reportName: 'RPT_ECONOMY_FOREX_LOAN',
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.result?.data) {
    return createDataFrame([], []);
  }

  const columns = ['月份', '当月', '同比增长', '环比增长', '累计'];

  const rows = data.result.data.map((item: any) => [
    item.TIME, item.BASE, item.BASE_SAME, item.BASE_SEQUENTIAL, item.BASE_ACCUMULATE,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 本外币存款 - 东方财富
 */
export async function macro_china_wbck(): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    columns: 'REPORT_DATE,TIME,BASE,BASE_SAME,BASE_SEQUENTIAL,BASE_ACCUMULATE',
    pageNumber: '1',
    pageSize: '2000',
    sortColumns: 'REPORT_DATE',
    sortTypes: '-1',
    source: 'WEB',
    client: 'WEB',
    reportName: 'RPT_ECONOMY_FOREX_DEPOSIT',
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.result?.data) {
    return createDataFrame([], []);
  }

  const columns = ['月份', '当月', '同比增长', '环比增长', '累计'];

  const rows = data.result.data.map((item: any) => [
    item.TIME, item.BASE, item.BASE_SAME, item.BASE_SEQUENTIAL, item.BASE_ACCUMULATE,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 消费者信心指数 - 东方财富
 */
export async function macro_china_xfzxx(): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    columns: 'REPORT_DATE,TIME,CONSUMERS_FAITH_INDEX,FAITH_INDEX_SAME,FAITH_INDEX_SEQUENTIAL,CONSUMERS_ASTIS_INDEX,ASTIS_INDEX_SAME,ASTIS_INDEX_SEQUENTIAL,CONSUMERS_EXPECT_INDEX,EXPECT_INDEX_SAME,EXPECT_INDEX_SEQUENTIAL',
    pageNumber: '1',
    pageSize: '2000',
    sortColumns: 'REPORT_DATE',
    sortTypes: '-1',
    source: 'WEB',
    client: 'WEB',
    reportName: 'RPT_ECONOMY_FAITH_INDEX',
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.result?.data) {
    return createDataFrame([], []);
  }

  const columns = [
    '月份',
    '消费者信心指数-指数值', '消费者信心指数-同比增长', '消费者信心指数-环比增长',
    '消费者满意指数-指数值', '消费者满意指数-同比增长', '消费者满意指数-环比增长',
    '消费者预期指数-指数值', '消费者预期指数-同比增长', '消费者预期指数-环比增长',
  ];

  const rows = data.result.data.map((item: any) => [
    item.TIME,
    item.CONSUMERS_FAITH_INDEX, item.FAITH_INDEX_SAME, item.FAITH_INDEX_SEQUENTIAL,
    item.CONSUMERS_ASTIS_INDEX, item.ASTIS_INDEX_SAME, item.ASTIS_INDEX_SEQUENTIAL,
    item.CONSUMERS_EXPECT_INDEX, item.EXPECT_INDEX_SAME, item.EXPECT_INDEX_SEQUENTIAL,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 工业增加值增长 - 东方财富
 */
export async function macro_china_gyzjz(): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    columns: 'REPORT_DATE,TIME,BASE_SAME,BASE_ACCUMULATE',
    pageNumber: '1',
    pageSize: '2000',
    sortColumns: 'REPORT_DATE',
    sortTypes: '-1',
    source: 'WEB',
    client: 'WEB',
    reportName: 'RPT_ECONOMY_INDUS_GROW',
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.result?.data) {
    return createDataFrame([], []);
  }

  const columns = ['月份', '同比增长', '累计增长', '发布时间'];

  const rows = data.result.data.map((item: any) => [
    item.TIME, item.BASE_SAME, item.BASE_ACCUMULATE, item.REPORT_DATE,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 存款准备金率 - 东方财富
 */
export async function macro_china_reserve_requirement_ratio(): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    columns: 'REPORT_DATE,PUBLISH_DATE,TRADE_DATE,INTEREST_RATE_BB,INTEREST_RATE_BA,CHANGE_RATE_B,INTEREST_RATE_SB,INTEREST_RATE_SA,CHANGE_RATE_S,NEXT_SH_RATE,NEXT_SZ_RATE,REMARK',
    pageNumber: '1',
    pageSize: '2000',
    sortColumns: 'PUBLISH_DATE,TRADE_DATE',
    sortTypes: '-1,-1',
    source: 'WEB',
    client: 'WEB',
    reportName: 'RPT_ECONOMY_DEPOSIT_RESERVE',
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.result?.data) {
    return createDataFrame([], []);
  }

  const columns = [
    '公布时间', '生效时间',
    '大型金融机构-调整前', '大型金融机构-调整后', '大型金融机构-调整幅度',
    '中小金融机构-调整前', '中小金融机构-调整后', '中小金融机构-调整幅度',
    '消息公布次日指数涨跌-上证', '消息公布次日指数涨跌-深证', '备注',
  ];

  const rows = data.result.data.map((item: any) => [
    item.PUBLISH_DATE, item.TRADE_DATE,
    item.INTEREST_RATE_BB, item.INTEREST_RATE_BA, item.CHANGE_RATE_B,
    item.INTEREST_RATE_SB, item.INTEREST_RATE_SA, item.CHANGE_RATE_S,
    item.NEXT_SH_RATE, item.NEXT_SZ_RATE, item.REMARK,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 社会消费品零售总额 - 东方财富
 */
export async function macro_china_consumer_goods_retail(): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    columns: 'REPORT_DATE,TIME,RETAIL_TOTAL,RETAIL_TOTAL_SAME,RETAIL_TOTAL_SEQUENTIAL,RETAIL_TOTAL_ACCUMULATE,RETAIL_ACCUMULATE_SAME',
    pageNumber: '1',
    pageSize: '1000',
    sortColumns: 'REPORT_DATE',
    sortTypes: '-1',
    source: 'WEB',
    client: 'WEB',
    reportName: 'RPT_ECONOMY_TOTAL_RETAIL',
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.result?.data) {
    return createDataFrame([], []);
  }

  const columns = ['月份', '当月', '同比增长', '环比增长', '累计', '累计-同比增长'];

  const rows = data.result.data.map((item: any) => [
    item.TIME, item.RETAIL_TOTAL, item.RETAIL_TOTAL_SAME, item.RETAIL_TOTAL_SEQUENTIAL,
    item.RETAIL_TOTAL_ACCUMULATE, item.RETAIL_ACCUMULATE_SAME,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 国房景气指数 - 东方财富
 */
export async function macro_china_real_estate(): Promise<DataFrame> {
  return emMacroIndex('EMM00121987');
}

/**
 * 义乌小商品指数-电子元器件 - 东方财富
 */
export async function macro_china_yw_electronic_index(): Promise<DataFrame> {
  return emMacroIndex('EMI00055551');
}
