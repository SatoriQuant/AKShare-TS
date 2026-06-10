/**
 * AKShare TypeScript - 东方财富网-行情中心-期权市场
 * https://quote.eastmoney.com/center/qqsc.html
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 东方财富网-行情中心-期权市场-中金所期权
 */
async function option_current_cffex_em(): Promise<DataFrame> {
  const url = 'https://futsseapi.eastmoney.com/list/option/221';
  const params = {
    orderBy: 'zdf',
    sort: 'desc',
    pageSize: '20000',
    pageIndex: '0',
    token: '58b2fa8f54638b60b87d69b31969089c',
    field: 'dm,sc,name,p,zsjd,zde,zdf,f152,vol,cje,ccl,xqj,syr,rz,zjsj,o',
    blockName: 'callback',
    '_:': '1706689899924',
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.list) {
    return createDataFrame([], []);
  }

  const columns = [
    '序号', '代码', '名称', '最新价', '涨跌额', '涨跌幅', '成交量', '成交额',
    '持仓量', '行权价', '剩余日', '日增', '昨结', '今开', '市场标识'
  ];

  const rows = data.list.map((item: any, index: number) => [
    index + 1,
    item.dm,
    item.name,
    parseFloat(item.p) || null,
    parseFloat(item.zde) || null,
    parseFloat(item.zdf) || null,
    parseInt(item.vol) || null,
    parseFloat(item.cje) || null,
    parseInt(item.ccl) || null,
    parseFloat(item.xqj) || null,
    parseInt(item.syr) || null,
    parseInt(item.rz) || null,
    parseFloat(item.zjsj) || null,
    parseFloat(item.o) || null,
    item.sc,
  ]);

  return createDataFrame(columns, rows);
}

/**
 * 东方财富网-行情中心-期权市场
 * https://quote.eastmoney.com/center/qqsc.html
 * @returns 期权价格
 */
export async function option_current_em(): Promise<DataFrame> {
  const url = 'https://23.push2.eastmoney.com/api/qt/clist/get';
  const params = {
    pn: '1',
    pz: '5000',
    po: '1',
    np: '1',
    ut: 'bd1d9ddb04089700cf9c27f6f7426281',
    fltt: '2',
    invt: '2',
    fid: 'f3',
    fs: 'm:10,m:12,m:140,m:141,m:151,m:163,m:226',
    fields: 'f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f12,f13,f14,f15,f16,f17,f18,f20,f21,f23,f24,f25,f22,f28,f11,f62,f128,f136,f115,f152,f133,f108,f163,f161,f162',
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.data?.diff) {
    return createDataFrame([], []);
  }

  const columns = [
    '序号', '代码', '名称', '最新价', '涨跌额', '涨跌幅', '成交量', '成交额',
    '持仓量', '行权价', '剩余日', '日增', '昨结', '今开', '市场标识'
  ];

  const rows = data.data.diff.map((item: any, index: number) => [
    index + 1,
    item.f12,  // 代码
    item.f14,  // 名称
    item.f2,   // 最新价
    item.f4,   // 涨跌额
    item.f3,   // 涨跌幅
    item.f5,   // 成交量
    item.f6,   // 成交额
    item.f28,  // 持仓量
    item.f20,  // 行权价
    item.f33,  // 剩余日
    item.f108, // 日增
    item.f62,  // 昨结
    item.f163, // 今开
    item.f13,  // 市场标识
  ]);

  // 合并中金所期权数据
  const cffexDf = await option_current_cffex_em();
  const allRows = [...rows, ...cffexDf.data];
  const reindexedRows = allRows.map((row, index) => {
    const newRow = [...row];
    newRow[0] = index + 1;
    return newRow;
  });

  return createDataFrame(columns, reindexedRows);
}

/**
 * 东方财富网-行情中心-期权市场-分时行情
 * https://wap.eastmoney.com/quote/stock/151.cu2404P61000.html
 * @param symbol 期权代码; 通过调用 option_current_em() 获取
 * @returns 指定期权的分钟频率数据
 */
export async function option_minute_em(symbol: string): Promise<DataFrame> {
  // 先获取市场标识
  const optionListUrl = 'https://23.push2.eastmoney.com/api/qt/clist/get';
  const listParams = {
    pn: '1',
    pz: '5000',
    po: '1',
    np: '1',
    ut: 'bd1d9ddb04089700cf9c27f6f7426281',
    fltt: '2',
    invt: '2',
    fid: 'f3',
    fs: 'm:10,m:12,m:140,m:141,m:151,m:163,m:226',
    fields: 'f12,f13',
  };

  const listData = await httpGet<any>(optionListUrl, { params: listParams });

  let secid = '';
  if (listData?.data?.diff) {
    const found = listData.data.diff.find((item: any) => item.f12 === symbol);
    if (found) {
      secid = `${found.f13}.${found.f12}`;
    }
  }

  if (!secid) {
    return createDataFrame([], []);
  }

  const url = 'https://push2.eastmoney.com/api/qt/stock/trends2/get';
  const params = {
    secid: secid,
    fields1: 'f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f11,f12,f13,f14,f17',
    fields2: 'f51,f53,f54,f55,f56,f57,f58',
    iscr: '0',
    iscca: '0',
    ut: 'f057cbcbce2a86e2866ab8877db1d059',
    ndays: '1',
    cb: 'quotepushdata1',
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.data?.trends) {
    return createDataFrame([], []);
  }

  const columns = ['time', 'close', 'high', 'low', 'volume', 'amount'];
  const rows = data.data.trends.map((item: string) => {
    const parts = item.split(',');
    return [
      parts[0],
      parseFloat(parts[1]) || null,
      parseFloat(parts[2]) || null,
      parseFloat(parts[3]) || null,
      parseFloat(parts[4]) || null,
      parseFloat(parts[5]) || null,
    ];
  });

  return createDataFrame(columns, rows);
}
