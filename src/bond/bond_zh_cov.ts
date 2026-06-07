/**
 * AKShare TypeScript - 可转债数据接口
 * 新浪财经-债券-沪深可转债-实时行情数据和历史行情数据
 * https://vip.stock.finance.sina.com.cn/mkt/#hskzz_z
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 获取可转债列表 - 东方财富
 */
export async function bond_cb_jsl(): Promise<DataFrame> {
  const url = 'https://www.jisilu.cn/data/cbnew/cb_list/';
  const params = {
    ___jsl: `LST___t=${Date.now()}`,
    page: '1',
    rp: '1000',
  };

  try {
    const data = await httpGet<any>(url, {
      params,
      headers: {
        Referer: 'https://www.jisilu.cn/data/cbnew/',
      },
    });

    if (!data?.rows) {
      return createDataFrame([], []);
    }

    const columns = [
      '债券代码', '债券名称', '正股代码', '正股名称', '正股价',
      '转股价', '转股价值', '转股溢价率', '纯债价值', '评级',
      '回售触发价', '强赎触发价', '到期时间', '剩余年限', '发行规模'
    ];

    const rows = data.rows.map((item: any) => [
      item.cell.bond_id,
      item.cell.bond_nm,
      item.cell.stock_id,
      item.cell.stock_nm,
      item.cell.price,
      item.cell.convert_price,
      item.cell.convert_value,
      item.cell.convert_price_t,
      item.cell.purevalue_rt,
      item.cell.rating_cd,
      item.cell.put_convert_price,
      item.cell.force_redeem_price,
      item.cell.maturity_dt,
      item.cell.year_left,
      item.cell.orig_iss_amt,
    ]);

    return createDataFrame(columns, rows);
  } catch (error) {
    return createDataFrame([], []);
  }
}

/**
 * 获取可转债实时行情 - 东方财富
 */
export async function bond_cov_stock_issue_cninfo(): Promise<DataFrame> {
  const url = 'https://79.push2.eastmoney.com/api/qt/clist/get';
  const params = {
    pn: '1',
    pz: '1000',
    po: '1',
    np: '1',
    ut: 'bd1d9ddb04089700cf9c27f6f7426281',
    fltt: '2',
    invt: '2',
    fid: 'f243',
    fs: 'b:MK0354',
    fields: 'f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f12,f13,f14,f15,f16,f17,f18,f20,f21,f23,f24,f25,f26,f22,f33,f11,f62,f128,f136,f115,f152,f124,f107,f104,f105,f243',
    _: Date.now(),
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.data?.diff) {
    return createDataFrame([], []);
  }

  const columns = [
    '债券代码', '债券名称', '最新价', '涨跌幅', '涨跌额', '成交量', '成交额',
    '振幅', '换手率', '纯债价值', '转股价值', '转股溢价率'
  ];

  const rows = data.data.diff.map((item: any) => [
    item.f12,  // 债券代码
    item.f14,  // 债券名称
    item.f2,   // 最新价
    item.f3,   // 涨跌幅
    item.f4,   // 涨跌额
    item.f5,   // 成交量
    item.f6,   // 成交额
    item.f7,   // 振幅
    item.f8,   // 换手率
    item.f243, // 纯债价值
    item.f244, // 转股价值
    item.f245, // 转股溢价率
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 获取可转债历史行情 - 东方财富
 *
 * @param symbol 转债代码
 * @param period 周期：daily, weekly, monthly
 * @param startDate 开始日期
 * @param endDate 结束日期
 */
export async function bond_zh_cov_daily(
  symbol: string,
  period: 'daily' | 'weekly' | 'monthly' = 'daily',
  startDate?: string,
  endDate?: string
): Promise<DataFrame> {
  const periodMap: Record<string, string> = {
    daily: '101',
    weekly: '102',
    monthly: '103',
  };

  const url = 'https://push2his.eastmoney.com/api/qt/stock/kline/get';
  const params = {
    fields1: 'f1,f2,f3,f4,f5,f6',
    fields2: 'f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61',
    klt: periodMap[period],
    fqt: '1',
    secid: `0.${symbol}`,
    beg: startDate || '19700101',
    end: endDate || '20500101',
    lmt: '1000000',
    _: Date.now(),
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.data?.klines) {
    return createDataFrame([], []);
  }

  const columns = [
    '日期', '开盘', '收盘', '最高', '最低', '成交量', '成交额',
    '振幅', '涨跌幅', '涨跌额', '换手率'
  ];

  const rows = data.data.klines.map((item: string) => {
    const parts = item.split(',');
    return [
      parts[0],
      parseFloat(parts[1]),
      parseFloat(parts[2]),
      parseFloat(parts[3]),
      parseFloat(parts[4]),
      parseInt(parts[5]),
      parseFloat(parts[6]),
      parseFloat(parts[7]),
      parseFloat(parts[8]),
      parseFloat(parts[9]),
      parseFloat(parts[10]),
    ];
  });

  return createDataFrame(columns, rows);
}

/**
 * 获取可转债比价表 - 东方财富
 * https://quote.eastmoney.com/center/fullscreenlist.html#convertible_comparison
 */
export async function bond_cov_comparison(): Promise<DataFrame> {
  const url = 'https://16.push2.eastmoney.com/api/qt/clist/get';
  const params = {
    pn: '1',
    pz: '1000',
    po: '1',
    np: '1',
    ut: 'bd1d9ddb04089700cf9c27f6f7426281',
    fltt: '2',
    invt: '2',
    fid: 'f243',
    fs: 'b:MK0354',
    fields: 'f1,f152,f2,f3,f12,f13,f14,f227,f228,f229,f230,f231,f232,f233,f234,f235,f236,f237,f238,f239,f240,f241,f242,f26,f243',
    _: Date.now(),
  };

  try {
    const data = await httpGet<any>(url, { params });

    if (!data?.data?.diff) {
      return createDataFrame([], []);
    }

    const columns = [
      '序号', '转债代码', '转债名称', '转债最新价', '转债涨跌幅',
      '正股代码', '正股名称', '正股最新价', '正股涨跌幅',
      '转股价', '转股价值', '转股溢价率', '纯债溢价率',
      '回售触发价', '强赎触发价', '到期赎回价', '纯债价值',
      '开始转股日', '上市日期', '申购日期'
    ];

    const rows = data.data.diff.map((item: any) => [
      item.f1,
      item.f12,
      item.f14,
      item.f2,
      item.f3,
      item.f234,
      item.f232,
      item.f229,
      item.f230,
      item.f235,
      item.f236,
      item.f237,
      item.f238,
      item.f239,
      item.f240,
      item.f241,
      item.f229,
      item.f233,
      item.f227,
      item.f26,
    ]);

    return createDataFrame(columns, rows);
  } catch (error) {
    return createDataFrame([], []);
  }
}

/**
 * 获取可转债数据 - 东方财富
 * https://data.eastmoney.com/kzz/default.html
 */
export async function bond_zh_cov(): Promise<DataFrame> {
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const params = {
    sortColumns: 'PUBLIC_START_DATE',
    sortTypes: '-1',
    pageSize: '500',
    pageNumber: '1',
    reportName: 'RPT_BOND_CB_LIST',
    columns: 'ALL',
    quoteColumns: 'f2~01~CONVERT_STOCK_CODE~CONVERT_STOCK_PRICE,f235~10~SECURITY_CODE~TRANSFER_PRICE,f236~10~SECURITY_CODE~TRANSFER_VALUE,f2~10~SECURITY_CODE~CURRENT_BOND_PRICE,f237~10~SECURITY_CODE~TRANSFER_PREMIUM_RATIO,f239~10~SECURITY_CODE~RESALE_TRIG_PRICE,f240~10~SECURITY_CODE~REDEEM_TRIG_PRICE,f23~01~CONVERT_STOCK_CODE~PBV_RATIO',
    source: 'WEB',
    client: 'WEB',
    _: Date.now(),
  };

  try {
    const data = await httpGet<any>(url, { params });

    if (!data?.result?.data) {
      return createDataFrame([], []);
    }

    const columns = [
      '债券代码', '债券简称', '申购日期', '申购代码', '申购上限',
      '正股代码', '正股简称', '正股价', '转股价', '转股价值',
      '债现价', '转股溢价率', '原股东配售-股权登记日', '原股东配售-每股配售额',
      '发行规模', '中签号发布日', '中签率', '上市时间', '信用评级'
    ];

    const rows = data.result.data.map((item: any) => [
      item.SECURITY_CODE,
      item.SECURITY_NAME_ABBR,
      item.PUBLIC_START_DATE,
      item.APPLY_CODE,
      item.APPLY_LIMIT,
      item.CONVERT_STOCK_CODE,
      item.CONVERT_STOCK_NAME_ABBR,
      item.CONVERT_STOCK_PRICE,
      item.TRANSFER_PRICE,
      item.TRANSFER_VALUE,
      item.CURRENT_BOND_PRICE,
      item.TRANSFER_PREMIUM_RATIO,
      item.ORIGINAL_STOCK_RECORD_DATE,
      item.ORIGINAL_STOCK_PER_ALLOTMENT,
      item.ISSUE_SCALE,
      item.BALLOT_NUMBER_DATE,
      item.SUCCESS_RATE,
      item.LISTING_DATE,
      item.CREDIT_RATING,
    ]);

    return createDataFrame(columns, rows);
  } catch (error) {
    return createDataFrame([], []);
  }
}
