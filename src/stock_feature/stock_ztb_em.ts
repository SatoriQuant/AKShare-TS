/**
 * AKShare TypeScript - 涨停板行情
 * https://quote.eastmoney.com/ztb/detail#type=ztgc
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 东方财富网-行情中心-涨停板行情-涨停股池
 * https://quote.eastmoney.com/ztb/detail#type=ztgc
 * @param date 交易日，格式 "20241008"
 * @returns 涨停股池数据
 */
export async function stock_zt_pool_em(
  date: string = '20241008'
): Promise<DataFrame> {
  const url = 'https://push2ex.eastmoney.com/getTopicZTPool';
  const params = {
    ut: '7eea3edcaed734bea9cbfc24409ed989',
    dpt: 'wz.ztzt',
    Pageindex: '0',
    pagesize: '10000',
    sort: 'fbt:asc',
    date: date,
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.data?.pool || data.data.pool.length === 0) {
    return createDataFrame([], []);
  }

  const columns = [
    '序号', '代码', '名称', '涨跌幅', '最新价', '成交额',
    '流通市值', '总市值', '换手率', '封板资金', '首次封板时间',
    '最后封板时间', '炸板次数', '涨停统计', '连板数', '所属行业'
  ];

  const rows = data.data.pool.map((item: any, index: number) => [
    index + 1,
    item.c,
    item.n,
    item.zdp,
    item.p / 1000,
    item.amount,
    item.ltsz,
    item.tshare,
    item.hs,
    item.fund,
    String(item.fbt).padStart(6, '0'),
    String(item.lbt).padStart(6, '0'),
    item.zbc,
    `${item.days}/${item.ct}`,
    item.lbc,
    item.hybk,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 东方财富网-行情中心-涨停板行情-昨日涨停股池
 * https://quote.eastmoney.com/ztb/detail#type=zrzt
 * @param date 交易日，格式 "20240415"
 * @returns 昨日涨停股池数据
 */
export async function stock_zt_pool_previous_em(
  date: string = '20240415'
): Promise<DataFrame> {
  const url = 'https://push2ex.eastmoney.com/getYesterdayZTPool';
  const params = {
    ut: '7eea3edcaed734bea9cbfc24409ed989',
    dpt: 'wz.ztzt',
    Pageindex: '0',
    pagesize: '5000',
    sort: 'zs:desc',
    date: date,
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.data?.pool || data.data.pool.length === 0) {
    return createDataFrame([], []);
  }

  const columns = [
    '序号', '代码', '名称', '涨跌幅', '最新价', '涨停价',
    '成交额', '流通市值', '总市值', '换手率', '涨速', '振幅',
    '昨日封板时间', '昨日连板数', '涨停统计', '所属行业'
  ];

  const rows = data.data.pool.map((item: any, index: number) => [
    index + 1,
    item.c,
    item.n,
    item.zdp,
    item.p / 1000,
    item.ztp / 1000,
    item.amount,
    item.ltsz,
    item.tshare,
    item.hs,
    item.zs,
    item.zf,
    String(item.fbts).padStart(6, '0'),
    item.lbc,
    `${item.days}/${item.ct}`,
    item.hybk,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 东方财富网-行情中心-涨停板行情-强势股池
 * https://quote.eastmoney.com/ztb/detail#type=qsgc
 * @param date 交易日，格式 "20241231"
 * @returns 强势股池数据
 */
export async function stock_zt_pool_strong_em(
  date: string = '20241231'
): Promise<DataFrame> {
  const url = 'https://push2ex.eastmoney.com/getTopicQSPool';
  const params = {
    ut: '7eea3edcaed734bea9cbfc24409ed989',
    dpt: 'wz.ztzt',
    Pageindex: '0',
    pagesize: '5000',
    sort: 'zdp:desc',
    date: date,
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.data?.pool || data.data.pool.length === 0) {
    return createDataFrame([], []);
  }

  const explainedMap: Record<number, string> = {
    1: '60日新高',
    2: '近期多次涨停',
    3: '60日新高且近期多次涨停',
  };

  const columns = [
    '序号', '代码', '名称', '涨跌幅', '最新价', '涨停价',
    '成交额', '流通市值', '总市值', '换手率', '涨速',
    '是否新高', '量比', '涨停统计', '入选理由', '所属行业'
  ];

  const rows = data.data.pool.map((item: any, index: number) => [
    index + 1,
    item.c,
    item.n,
    item.zdp,
    item.p / 1000,
    item.ztp / 1000,
    item.amount,
    item.ltsz,
    item.tshare,
    item.hs,
    item.zs,
    item.isNew ? '是' : '否',
    item.lb,
    `${item.days}/${item.ct}`,
    explainedMap[item.explained] || '',
    item.hybk,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 东方财富网-行情中心-涨停板行情-炸板股池
 * https://quote.eastmoney.com/ztb/detail#type=zbgc
 * @param date 交易日，格式 "20241011"
 * @returns 炸板股池数据
 */
export async function stock_zt_pool_zbgc_em(
  date: string = '20241011'
): Promise<DataFrame> {
  const url = 'https://push2ex.eastmoney.com/getTopicZBPool';
  const params = {
    ut: '7eea3edcaed734bea9cbfc24409ed989',
    dpt: 'wz.ztzt',
    Pageindex: '0',
    pagesize: '5000',
    sort: 'fbt:asc',
    date: date,
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.data?.pool || data.data.pool.length === 0) {
    return createDataFrame([], []);
  }

  const columns = [
    '序号', '代码', '名称', '涨跌幅', '最新价', '涨停价',
    '成交额', '流通市值', '总市值', '换手率', '涨速',
    '首次封板时间', '炸板次数', '涨停统计', '振幅', '所属行业'
  ];

  const rows = data.data.pool.map((item: any, index: number) => [
    index + 1,
    item.c,
    item.n,
    item.zdp,
    item.p / 1000,
    item.ztp / 1000,
    item.amount,
    item.ltsz,
    item.tshare,
    item.hs,
    item.zs,
    String(item.fbt).padStart(6, '0'),
    item.zbc,
    `${item.days}/${item.ct}`,
    item.zf,
    item.hybk,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 东方财富网-行情中心-涨停板行情-跌停股池
 * https://quote.eastmoney.com/ztb/detail#type=dtgc
 * @param date 交易日，格式 "20241011"
 * @returns 跌停股池数据
 */
export async function stock_zt_pool_dtgc_em(
  date: string = '20241011'
): Promise<DataFrame> {
  const url = 'https://push2ex.eastmoney.com/getTopicDTPool';
  const params = {
    ut: '7eea3edcaed734bea9cbfc24409ed989',
    dpt: 'wz.ztzt',
    Pageindex: '0',
    pagesize: '10000',
    sort: 'fund:asc',
    date: date,
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.data?.pool || data.data.pool.length === 0) {
    return createDataFrame([], []);
  }

  const columns = [
    '序号', '代码', '名称', '涨跌幅', '最新价', '成交额',
    '流通市值', '总市值', '动态市盈率', '换手率', '封单资金',
    '最后封板时间', '板上成交额', '连续跌停', '开板次数', '所属行业'
  ];

  const rows = data.data.pool.map((item: any, index: number) => [
    index + 1,
    item.c,
    item.n,
    item.zdp,
    item.p / 1000,
    item.amount,
    item.ltsz,
    item.tshare,
    item.pe,
    item.hs,
    item.fund,
    String(item.lbt).padStart(6, '0'),
    item.bamount,
    item.ztt,
    item.kbc,
    item.hybk,
  ]);

  return createDataFrame(columns, rows);
}
