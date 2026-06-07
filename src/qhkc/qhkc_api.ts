/**
 * AKShare TypeScript - 奇货可查 API 接口
 *
 * 对应 Python akshare/qhkc/qhkc_api.py
 * 奇货可查网站: https://qhkch.com
 *
 * 注：期货价格为收盘价; 现货价格来自网络;
 * 基差=现货价格-期货价格; 基差率=(现货价格-期货价格)/现货价格 * 100%
 */

import { httpPost } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

// ============ API URL 常量 ============

/** 奇货可查-指数详情 URL */
const QHKC_INDEX_URL = 'https://www.qhkch.com/ajax/index_show.php';

/** 奇货可查-大资金动向 URL */
const QHKC_INDEX_TREND_URL = 'https://qhkch.com/ajax/indexes_trend.php';

/** 奇货可查-盈亏详情 URL */
const QHKC_INDEX_PROFIT_LOSS_URL = 'https://qhkch.com/ajax/indexes_profit_loss.php';

/** 奇货可查-净持仓分布 URL */
const QHKC_FUND_BS_URL = 'https://qhkch.com/ajax/fund_bs_pie.php';

/** 奇货可查-总持仓分布 URL */
const QHKC_FUND_POSITION_URL = 'https://qhkch.com/ajax/fund_position_pie.php';

/** 奇货可查-净持仓变化分布 URL */
const QHKC_FUND_POSITION_CHANGE_URL = 'https://qhkch.com/ajax/fund_position_chge_pie.php';

/** 奇货可查-成交额分布 URL */
const QHKC_FUND_DEAL_URL = 'https://qhkch.com/ajax/fund_deal_pie.php';

/** 奇货可查-外盘比价 URL */
const QHKC_TOOL_FOREIGN_URL = 'https://qhkch.com/ajax/toolbox_foreign.php';

/** 奇货可查-各地区经济数据 URL */
const QHKC_TOOL_GDP_URL = 'https://qhkch.com/dist/views/toolbox/gdp.html?v=1.10.7.1';

// ============ 辅助函数 ============

/**
 * 格式化日期: "20190924" -> "2019-09-24"
 */
function formatDate(date: string | number): string {
  const dateStr = String(date);
  return `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;
}

/**
 * 获取官方指数列表，返回 name -> id 映射
 */
async function getOfficialIndexMap(): Promise<Record<string, string>> {
  const url = 'https://qhkch.com/ajax/official_indexes.php';
  const dataJson = await httpPost<any>(url);
  const nameIdDict: Record<string, string> = {};
  for (const item of dataJson.data) {
    nameIdDict[item.name] = item.id;
  }
  return nameIdDict;
}

// ============ 资金数据接口 ============

/**
 * 奇货可查-资金-净持仓分布
 *
 * 可获取数据的时间段为: "2016-10-10" 至 "2019-09-30"
 *
 * @param date 日期，格式 "20190924" 或 "2019-09-24"
 * @returns [symbolDf, longShortDf] 品种净持仓分布和多空分布
 */
export async function get_qhkc_fund_bs(
  date: string = '20190924'
): Promise<[DataFrame, DataFrame]> {
  const formattedDate = date.includes('-') ? date : formatDate(date);
  const payload = { date: formattedDate };

  const dataJson = await httpPost<any>(QHKC_FUND_BS_URL, payload);

  // 品种净持仓分布
  const symbolData = dataJson.data.datas1.map((item: any) => ({
    name: item.name,
    value: item.value,
  }));
  const totalValue = symbolData.reduce((sum: number, item: any) => sum + item.value, 0);
  const symbolRecords = symbolData.map((item: any) => ({
    name: item.name,
    value: item.value,
    ratio: item.value / totalValue,
    date: formattedDate,
  }));

  // 多空分布
  const longShortData = dataJson.data.datas2.map((item: any) => ({
    name: item.name,
    value: item.value,
  }));
  const totalLs = longShortData.reduce((sum: number, item: any) => sum + item.value, 0);
  const longShortRecords = longShortData.map((item: any) => ({
    name: item.name,
    value: item.value,
    ratio: item.value / totalLs,
    date: formattedDate,
  }));

  const symbolDf = createDataFrame(
    ['name', 'value', 'ratio', 'date'],
    symbolRecords.map((r: any) => [r.name, r.value, r.ratio, r.date])
  );

  const longShortDf = createDataFrame(
    ['name', 'value', 'ratio', 'date'],
    longShortRecords.map((r: any) => [r.name, r.value, r.ratio, r.date])
  );

  return [symbolDf, longShortDf];
}

/**
 * 奇货可查-资金-总持仓分布
 *
 * 可获取数据的时间段为: "2016-10-10" 至 "2019-09-30"
 *
 * @param date 日期，格式 "20190924" 或 "2019-09-24"
 * @returns [symbolDf, longShortDf] 品种总持仓分布和多空分布
 */
export async function get_qhkc_fund_position(
  date: string = '20190924'
): Promise<[DataFrame, DataFrame]> {
  const formattedDate = date.includes('-') ? date : formatDate(date);
  const payload = { date: formattedDate };

  const dataJson = await httpPost<any>(QHKC_FUND_POSITION_URL, payload);

  // 品种总持仓分布
  const symbolData = dataJson.data.datas1.map((item: any) => ({
    name: item.name,
    value: item.value,
  }));
  const totalValue = symbolData.reduce((sum: number, item: any) => sum + item.value, 0);
  const symbolRecords = symbolData.map((item: any) => ({
    name: item.name,
    value: item.value,
    ratio: item.value / totalValue,
    date: formattedDate,
  }));

  // 多空分布
  const longShortData = dataJson.data.datas2.map((item: any) => ({
    name: item.name,
    value: item.value,
  }));
  const totalLs = longShortData.reduce((sum: number, item: any) => sum + item.value, 0);
  const longShortRecords = longShortData.map((item: any) => ({
    name: item.name,
    value: item.value,
    ratio: item.value / totalLs,
    date: formattedDate,
  }));

  const symbolDf = createDataFrame(
    ['name', 'value', 'ratio', 'date'],
    symbolRecords.map((r: any) => [r.name, r.value, r.ratio, r.date])
  );

  const longShortDf = createDataFrame(
    ['name', 'value', 'ratio', 'date'],
    longShortRecords.map((r: any) => [r.name, r.value, r.ratio, r.date])
  );

  return [symbolDf, longShortDf];
}

/**
 * 奇货可查-资金-净持仓变化分布
 *
 * 可获取数据的时间段为: "2016-10-10" 至 "2019-09-30"
 *
 * @param date 日期，格式 "20190924" 或 "2019-09-24"
 * @returns [symbolDf, longShortDf] 品种净持仓变化分布和多空分布
 */
export async function get_qhkc_fund_position_change(
  date: string = '20190924'
): Promise<[DataFrame, DataFrame]> {
  const formattedDate = date.includes('-') ? date : formatDate(date);
  const payload = { date: formattedDate };

  const dataJson = await httpPost<any>(QHKC_FUND_POSITION_CHANGE_URL, payload);

  // 品种净持仓变化分布
  const symbolData = dataJson.data.datas1.map((item: any) => ({
    name: item.name,
    value: item.value,
  }));
  const totalValue = symbolData.reduce((sum: number, item: any) => sum + item.value, 0);
  const symbolRecords = symbolData.map((item: any) => ({
    name: item.name,
    value: item.value,
    ratio: item.value / totalValue,
    date: formattedDate,
  }));

  // 多空分布
  const longShortData = dataJson.data.datas2.map((item: any) => ({
    name: item.name,
    value: item.value,
  }));
  const totalLs = longShortData.reduce((sum: number, item: any) => sum + item.value, 0);
  const longShortRecords = longShortData.map((item: any) => ({
    name: item.name,
    value: item.value,
    ratio: item.value / totalLs,
    date: formattedDate,
  }));

  const symbolDf = createDataFrame(
    ['name', 'value', 'ratio', 'date'],
    symbolRecords.map((r: any) => [r.name, r.value, r.ratio, r.date])
  );

  const longShortDf = createDataFrame(
    ['name', 'value', 'ratio', 'date'],
    longShortRecords.map((r: any) => [r.name, r.value, r.ratio, r.date])
  );

  return [symbolDf, longShortDf];
}

/**
 * 奇货可查-资金-成交额分布
 *
 * 可获取数据的时间段为: "2016-10-10" 至 "2019-09-30"
 *
 * @param date 日期，格式 "20190924" 或 "2019-09-24"
 * @returns 成交额分布 DataFrame
 */
export async function get_qhkc_fund_money_change(
  date: string = '20190924'
): Promise<DataFrame> {
  const formattedDate = date.includes('-') ? date : formatDate(date);
  const payload = { date: formattedDate };

  const dataJson = await httpPost<any>(QHKC_FUND_DEAL_URL, payload);

  const symbolData = dataJson.data.datas.map((item: any) => ({
    name: item.name,
    value: item.value,
  }));
  const totalValue = symbolData.reduce((sum: number, item: any) => sum + item.value, 0);

  const columns = ['name', 'value', 'ratio', 'date'];
  const data = symbolData.map((item: any) => [
    item.name,
    item.value,
    item.value / totalValue,
    formattedDate,
  ]);

  return createDataFrame(columns, data);
}

// ============ 指数数据接口 ============

/**
 * 奇货可查-指数-指数详情
 *
 * 获得奇货可查的指数数据:
 * '奇货黑链', '奇货商品', '奇货谷物', '奇货贵金属', '奇货饲料',
 * '奇货软商品', '奇货化工', '奇货有色', '奇货股指', '奇货铁合金', '奇货油脂'
 *
 * @param name 指数名称
 * @returns 指数详情 DataFrame
 */
export async function get_qhkc_index(
  name: string = '奇货商品'
): Promise<DataFrame> {
  const nameIdDict = await getOfficialIndexMap();
  const payloadId = { id: nameIdDict[name] };

  const dataJson = await httpPost<any>(QHKC_INDEX_URL, payloadId);

  const date = dataJson.data.date;
  const price = dataJson.data.price;
  const volume = dataJson.data.volume;
  const openInterest = dataJson.data.openint;
  const totalValue = dataJson.data.total_value;
  const profit = dataJson.data.profit;
  const longShortRatio = dataJson.data.line;

  const columns = [
    'date', 'price', 'volume', 'open_interest', 'margin', 'profit', 'long_short_ratio',
  ];

  // 每个字段都是数组，需要按索引组合成行
  const rowCount = date.length;
  const data: any[][] = [];
  for (let i = 0; i < rowCount; i++) {
    data.push([
      date[i],
      price[i],
      volume[i],
      openInterest[i],
      totalValue[i],
      profit[i],
      longShortRatio[i],
    ]);
  }

  return createDataFrame(columns, data);
}

/**
 * 奇货可查-指数-大资金动向
 *
 * 获得奇货可查的指数数据:
 * '奇货黑链', '奇货商品', '奇货谷物', '奇货贵金属', '奇货饲料',
 * '奇货软商品', '奇货化工', '奇货有色', '奇货股指', '奇货铁合金', '奇货油脂'
 *
 * @param name 指数名称
 * @returns 大资金动向 DataFrame
 */
export async function get_qhkc_index_trend(
  name: string = '奇货商品'
): Promise<DataFrame> {
  const nameIdDict = await getOfficialIndexMap();
  const payloadId = {
    page: 1,
    limit: 10,
    index: nameIdDict[name],
    date: '',
  };

  const dataJson = await httpPost<any>(QHKC_INDEX_TREND_URL, payloadId);

  const columns = ['broker', 'grade', 'money', 'open_order', 'variety'];
  const data = dataJson.data.map((item: any) => [
    item.broker,
    item.grade,
    item.money,
    item.order_money,
    item.variety,
  ]);

  return createDataFrame(columns, data);
}

/**
 * 奇货可查-指数-盈亏详情
 *
 * 获得奇货可查的指数数据:
 * '奇货黑链', '奇货商品', '奇货谷物', '奇货贵金属', '奇货饲料',
 * '奇货软商品', '奇货化工', '奇货有色', '奇货股指', '奇货铁合金', '奇货油脂'
 *
 * @param name 指数名称
 * @param startDate 开始日期（可选）
 * @param endDate 结束日期（可选），格式 "20190716"
 * @returns 盈亏详情 DataFrame
 */
export async function get_qhkc_index_profit_loss(
  name: string = '奇货商品',
  startDate: string = '',
  endDate: string = ''
): Promise<DataFrame> {
  const nameIdDict = await getOfficialIndexMap();
  const payloadId = {
    index: nameIdDict[name],
    date1: startDate,
    date2: endDate,
  };

  const dataJson = await httpPost<any>(QHKC_INDEX_PROFIT_LOSS_URL, payloadId);

  const indexes = dataJson.data.indexes;
  const values = dataJson.data.value;
  const transDate = dataJson.data.trans_date;

  const columns = ['indexes', 'value', 'trans_date'];
  const data = indexes.map((idx: string, i: number) => [
    idx,
    values[i],
    transDate,
  ]);

  return createDataFrame(columns, data);
}

// ============ 工具数据接口 ============

/**
 * 奇货可查-工具-外盘比价
 *
 * 实时更新数据，暂不能查询历史数据
 *
 * @returns 外盘比价 DataFrame
 */
export async function qhkc_tool_foreign(): Promise<DataFrame> {
  const payloadId = { page: 1, limit: 10 };

  const dataJson = await httpPost<any>(QHKC_TOOL_FOREIGN_URL, payloadId);

  const columns = ['name', 'base_time', 'base_price', 'latest_price', 'rate'];
  const data = dataJson.data.map((item: any) => [
    item.name,
    item.base_time,
    item.base_price,
    item.latest_price,
    item.rate,
  ]);

  return createDataFrame(columns, data);
}

/**
 * 奇货可查-工具-龙虎星云图
 *
 * @returns 龙虎星云图数据 DataFrame（与外盘比价格式相同）
 */
export async function qhkc_tool_nebula(): Promise<DataFrame> {
  const payloadId = { page: 1, limit: 10 };

  const dataJson = await httpPost<any>(QHKC_TOOL_FOREIGN_URL, payloadId);

  const columns = ['name', 'base_time', 'base_price', 'latest_price', 'rate'];
  const data = dataJson.data.map((item: any) => [
    item.name,
    item.base_time,
    item.base_price,
    item.latest_price,
    item.rate,
  ]);

  return createDataFrame(columns, data);
}
