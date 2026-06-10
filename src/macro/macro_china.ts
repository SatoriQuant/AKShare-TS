/**
 * AKShare TypeScript - 中国宏观经济数据接口
 */

import vm from 'vm';
import { httpGet, httpGetText } from '../utils/httpClient';
import { httpGetTextGbk } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

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
    '季度',
    '国内生产总值-绝对值', '国内生产总值-同比增长',
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
 * 获取中国货币供应量 - 东方财富
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

  const fetchPage = async (from: number) => {
    const text = await httpGetTextGbk(baseUrl, {
      params: { ...baseParams, from: String(from) },
    });
    // Response uses JS object literal (unquoted keys), use VM eval
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start === -1 || end === -1 || end <= start) return null;
    try {
      const sandbox: any = {};
      vm.createContext(sandbox);
      return vm.runInContext(`(${text.slice(start, end + 1)})`, sandbox);
    } catch {
      return null;
    }
  };

  try {
    const firstPage = await fetchPage(0);
    if (!firstPage?.data) {
      return createDataFrame([], []);
    }

    const total = Number(firstPage.count || 0);
    const pageSize = 31;
    const pageNum = Math.ceil(total / pageSize);
    let allData: any[][] = [...firstPage.data];

    for (let i = 1; i < pageNum; i++) {
      const page = await fetchPage(i * pageSize);
      if (page?.data) {
        allData = allData.concat(page.data);
      }
    }

    const finalColumns = (firstPage.config?.all || []).map((item: any[]) => item[1]);
    if (!Array.isArray(finalColumns) || finalColumns.length === 0) {
      return createDataFrame([], []);
    }

    const toNum = (v: any): number | string => {
      if (v === null || v === undefined || v === '') return '';
      const n = Number(v);
      return Number.isFinite(n) ? n : String(v);
    };

    const rows = allData.map((row: any[]) =>
      row.map((v: any, idx: number) => (idx >= 1 ? toNum(v) : (v ?? '')))
    );
    return createDataFrame(finalColumns, rows);
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
