/**
 * AKShare TypeScript - 巨潮资讯债券发行数据接口
 * 巨潮资讯-数据中心-专题统计-债券报表-债券发行
 * http://webapi.cninfo.com.cn/#/thematicStatistics
 */

import { httpPost } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';
import { get_cninfo_js } from '../data/datasets';

/**
 * 默认请求头
 */
const CNINFO_HEADERS = {
  Accept: '*/*',
  'Accept-Encoding': 'gzip, deflate',
  'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
  'Cache-Control': 'no-cache',
  'Content-Length': '0',
  Host: 'webapi.cninfo.com.cn',
  Origin: 'http://webapi.cninfo.com.cn',
  Pragma: 'no-cache',
  'Proxy-Connection': 'keep-alive',
  Referer: 'http://webapi.cninfo.com.cn/',
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36',
  'X-Requested-With': 'XMLHttpRequest',
};

async function getCninfoEncKey(): Promise<string> {
  try {
    const jsCode = await get_cninfo_js();
    if (!jsCode) return '';
    const fn = new Function(
      `${jsCode}; return (typeof getResCode1 === 'function' ? getResCode1() : '');`
    );
    const result = fn();
    return String(result ?? '').trim();
  } catch {
    return '';
  }
}

function parseNullableNumber(value: any, isInt: boolean = false): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const parsed = isInt ? Number.parseInt(String(value), 10) : Number.parseFloat(String(value));
  return Number.isNaN(parsed) ? null : parsed;
}

function dateOnly(value: any): string {
  const raw = String(value ?? '').trim();
  if (!raw) return '';
  return raw.split(' ')[0];
}

/**
 * 格式化日期
 */
function formatDate(dateStr: string): string {
  return `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;
}

/**
 * 巨潮资讯-数据中心-专题统计-债券报表-债券发行-国债发行
 * http://webapi.cninfo.com.cn/#/thematicStatistics
 *
 * @param startDate 开始统计时间，格式 "20210910"
 * @param endDate 结束统计数据，格式 "20211109"
 */
export async function bond_treasure_issue_cninfo(
  startDate: string = '20210910',
  endDate: string = '20211109'
): Promise<DataFrame> {
  const url = 'http://webapi.cninfo.com.cn/api/sysapi/p_sysapi1120';

  try {
    const encKey = await getCninfoEncKey();
    const headers: Record<string, string> = { ...CNINFO_HEADERS };
    if (encKey) {
      headers['Accept-Enckey'] = encKey;
    }

    const params = {
      sdate: formatDate(startDate),
      edate: formatDate(endDate),
    };

    const data = await httpPost<any>(url, null, {
      params,
      headers,
    });

    if (!Array.isArray(data?.records) || data.records.length === 0) {
      return createDataFrame([], []);
    }

    const columns = [
      '债券代码', '债券简称', '发行起始日', '发行终止日',
      '计划发行总量', '实际发行总量', '发行价格', '单位面值',
      '缴款日', '增发次数', '交易市场', '发行方式',
      '发行对象', '公告日期', '债券名称',
    ];

    const rows = data.records.map((item: any) => [
      item.SECCODE,
      item.SECNAME,
      dateOnly(item.F004D),
      dateOnly(item.F003D),
      parseNullableNumber(item.F006N),
      parseNullableNumber(item.F005N),
      parseNullableNumber(item.F007N),
      parseNullableNumber(item.F008N),
      dateOnly(item.F009D),
      parseNullableNumber(item.F028N, true),
      item.F002V,
      item.F013V,
      item.F014V,
      dateOnly(item.DECLAREDATE),
      item.BONDNAME,
    ]);

    return createDataFrame(columns, rows);
  } catch (error) {
    return createDataFrame([], []);
  }
}

/**
 * 巨潮资讯-数据中心-专题统计-债券报表-债券发行-地方债发行
 * http://webapi.cninfo.com.cn/#/thematicStatistics
 *
 * @param startDate 开始统计时间，格式 "20210911"
 * @param endDate 结束统计数据，格式 "20211110"
 */
export async function bond_local_government_issue_cninfo(
  startDate: string = '20210911',
  endDate: string = '20211110'
): Promise<DataFrame> {
  const url = 'http://webapi.cninfo.com.cn/api/sysapi/p_sysapi1121';

  try {
    const encKey = await getCninfoEncKey();
    const headers: Record<string, string> = { ...CNINFO_HEADERS };
    if (encKey) {
      headers['Accept-Enckey'] = encKey;
    }

    const params = {
      sdate: formatDate(startDate),
      edate: formatDate(endDate),
    };

    const data = await httpPost<any>(url, null, {
      params,
      headers,
    });

    if (!Array.isArray(data?.records) || data.records.length === 0) {
      return createDataFrame([], []);
    }

    const columns = [
      '债券代码', '债券简称', '发行起始日', '发行终止日',
      '计划发行总量', '实际发行总量', '发行价格', '单位面值',
      '缴款日', '增发次数', '交易市场', '发行方式',
      '发行对象', '公告日期', '债券名称',
    ];

    const rows = data.records.map((item: any) => [
      item.SECCODE,
      item.SECNAME,
      dateOnly(item.F004D),
      dateOnly(item.F003D),
      parseNullableNumber(item.F006N),
      parseNullableNumber(item.F005N),
      parseNullableNumber(item.F007N),
      parseNullableNumber(item.F008N),
      dateOnly(item.F009D),
      parseNullableNumber(item.F028N, true),
      item.F002V,
      item.F013V,
      item.F014V,
      dateOnly(item.DECLAREDATE),
      item.BONDNAME,
    ]);

    return createDataFrame(columns, rows);
  } catch (error) {
    return createDataFrame([], []);
  }
}

/**
 * 巨潮资讯-数据中心-专题统计-债券报表-债券发行-企业债发行
 * http://webapi.cninfo.com.cn/#/thematicStatistics
 *
 * @param startDate 开始统计时间，格式 "20210911"
 * @param endDate 结束统计数据，格式 "20211110"
 */
export async function bond_corporate_issue_cninfo(
  startDate: string = '20210911',
  endDate: string = '20211110'
): Promise<DataFrame> {
  const url = 'http://webapi.cninfo.com.cn/api/sysapi/p_sysapi1122';

  try {
    const encKey = await getCninfoEncKey();
    const headers: Record<string, string> = { ...CNINFO_HEADERS };
    if (encKey) {
      headers['Accept-Enckey'] = encKey;
    }

    const params = {
      sdate: formatDate(startDate),
      edate: formatDate(endDate),
    };

    const data = await httpPost<any>(url, null, {
      params,
      headers,
    });

    if (!Array.isArray(data?.records) || data.records.length === 0) {
      return createDataFrame([], []);
    }

    const columns = [
      '债券代码', '债券简称', '公告日期',
      '交易所网上发行起始日', '交易所网上发行终止日',
      '计划发行总量', '实际发行总量', '发行面值', '发行价格',
      '发行方式', '发行对象', '发行范围', '承销方式',
      '最小认购单位', '募资用途说明', '最低认购额', '债券名称',
    ];

    const rows = data.records.map((item: any) => [
      item.SECCODE,
      item.SECNAME,
      dateOnly(item.DECLAREDATE),
      dateOnly(item.F003D),
      dateOnly(item.F004D),
      parseNullableNumber(item.F005N),
      parseNullableNumber(item.F006N),
      parseNullableNumber(item.F008N),
      parseNullableNumber(item.F007N),
      item.F013V,
      item.F014V,
      item.F015V,
      item.F017V,
      parseNullableNumber(item.F022N, true),
      item.F023V,
      parseNullableNumber(item.F052N),
      item.BONDNAME,
    ]);

    return createDataFrame(columns, rows);
  } catch (error) {
    return createDataFrame([], []);
  }
}

/**
 * 巨潮资讯-数据中心-专题统计-债券报表-债券发行-可转债发行
 * http://webapi.cninfo.com.cn/#/thematicStatistics
 *
 * @param startDate 开始统计时间，格式 "20210913"
 * @param endDate 结束统计数据，格式 "20211112"
 */
export async function bond_cov_issue_cninfo(
  startDate: string = '20210913',
  endDate: string = '20211112'
): Promise<DataFrame> {
  const url = 'http://webapi.cninfo.com.cn/api/sysapi/p_sysapi1123';

  try {
    const encKey = await getCninfoEncKey();
    const headers: Record<string, string> = { ...CNINFO_HEADERS };
    if (encKey) {
      headers['Accept-Enckey'] = encKey;
    }

    const params = {
      sdate: formatDate(startDate),
      edate: formatDate(endDate),
    };

    const data = await httpPost<any>(url, null, {
      params,
      headers,
    });

    if (!Array.isArray(data?.records) || data.records.length === 0) {
      return createDataFrame([], []);
    }

    const columns = [
      '债券代码', '债券简称', '公告日期', '发行起始日', '发行终止日',
      '计划发行总量', '实际发行总量', '发行面值', '发行价格',
      '发行方式', '发行对象', '发行范围', '承销方式', '募资用途说明',
      '初始转股价格', '转股开始日期', '转股终止日期',
      '网上申购日期', '网上申购代码', '网上申购简称',
      '网上申购数量上限', '网上申购数量下限', '网上申购单位',
      '网上申购中签结果公告日及退款日', '优先申购日', '配售价格',
      '债权登记日', '优先申购缴款日', '转股代码', '交易市场', '债券名称',
    ];

    const rows = data.records.map((item: any) => [
      item.SECCODE,
      item.SECNAME,
      dateOnly(item.DECLAREDATE),
      dateOnly(item.F029D),
      dateOnly(item.F003D),
      parseNullableNumber(item.F005N),
      parseNullableNumber(item.F006N),
      parseNullableNumber(item.F007N),
      parseNullableNumber(item.F052N),
      item.F013V,
      item.F014V,
      item.F015V,
      item.F017V,
      item.F021V,
      parseNullableNumber(item.F026N),
      dateOnly(item.F027D),
      dateOnly(item.F053D),
      dateOnly(item.F051D),
      item.F031V,
      item.F032V,
      parseNullableNumber(item.F008N, true),
      parseNullableNumber(item.F066N, true),
      parseNullableNumber(item.F067N, true),
      dateOnly(item.F068D),
      dateOnly(item.F004D),
      parseNullableNumber(item.F065N),
      dateOnly(item.F028D),
      dateOnly(item.F054D),
      item.F086V,
      item.F002V,
      item.BONDNAME,
    ]);

    return createDataFrame(columns, rows);
  } catch (error) {
    return createDataFrame([], []);
  }
}

/**
 * 巨潮资讯-数据中心-专题统计-债券报表-债券发行-可转债转股
 * http://webapi.cninfo.com.cn/#/thematicStatistics
 *
 * 注意：此函数与 bond_zh_cov.ts 中的 bond_cov_stock_issue_cninfo 不同，
 * 此处为巨潮资讯数据源版本。
 */
export async function bond_cov_stock_issue_cninfo_cninfo(): Promise<DataFrame> {
  const url = 'http://webapi.cninfo.com.cn/api/sysapi/p_sysapi1124';

  try {
    const data = await httpPost<any>(url, null, {
      headers: CNINFO_HEADERS,
    });

    if (!data?.records) {
      return createDataFrame([], []);
    }

    const columns = [
      '债券代码', '债券简称', '公告日期',
      '转股代码', '转股简称', '转股价格',
      '自愿转换期起始日', '自愿转换期终止日',
      '标的股票', '债券名称',
    ];

    const rows = data.records.map((item: any) => [
      item.SECCODE,
      item.SECNAME,
      item.DECLAREDATE,
      item.F001V,
      item.F002V,
      parseFloat(item.F003N) || null,
      item.F004D,
      item.F005D,
      item.F017V,
      item.BONDNAME,
    ]);

    return createDataFrame(columns, rows);
  } catch (error) {
    return createDataFrame([], []);
  }
}
