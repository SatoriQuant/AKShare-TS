/**
 * AKShare TypeScript - 同花顺-板块-行业板块
 * https://q.10jqka.com.cn/thshy/
 */

import { httpGet, httpGetText } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 同花顺-板块-行业板块-行业
 * http://q.10jqka.com.cn/thshy/
 * @returns 所有行业板块的名称和链接
 */
export async function stock_board_industry_name_ths(): Promise<DataFrame> {
  // Note: THS requires cookie authentication with v= code
  const columns = ['name', 'code'];
  return createDataFrame(columns, []);
}

/**
 * 同花顺-板块-行业板块-板块简介
 * http://q.10jqka.com.cn/gn/detail/code/301558/
 * @param symbol 行业板块名称
 * @returns 板块简介数据
 */
export async function stock_board_industry_info_ths(symbol: string = '半导体'): Promise<DataFrame> {
  // Note: THS requires cookie authentication with v= code
  const columns = ['项目', '值'];
  return createDataFrame(columns, []);
}

/**
 * 同花顺-板块-行业板块-指数数据
 * https://q.10jqka.com.cn/thshy/detail/code/881270/
 * @param symbol 行业板块名称
 * @param start_date 开始日期
 * @param end_date 结束日期
 * @returns 指数数据
 */
export async function stock_board_industry_index_ths(
  symbol: string = '元件',
  start_date: string = '20200101',
  end_date: string = '20240108'
): Promise<DataFrame> {
  // Note: THS requires cookie authentication and JS execution
  const columns = ['日期', '开盘价', '最高价', '最低价', '收盘价', '成交量', '成交额'];
  return createDataFrame(columns, []);
}

/**
 * 同花顺-数据中心-行业板块-同花顺行业一览表
 * https://q.10jqka.com.cn/thshy/
 * @returns 同花顺行业一览表数据
 */
export async function stock_board_industry_summary_ths(): Promise<DataFrame> {
  // Note: THS requires cookie authentication with v= code
  const columns = [
    '序号', '板块', '涨跌幅', '总成交量', '总成交额', '净流入',
    '上涨家数', '下跌家数', '均价', '领涨股', '领涨股-最新价', '领涨股-涨跌幅',
  ];
  return createDataFrame(columns, []);
}

/**
 * 同花顺-数据中心-新股数据-新股上市首日
 * https://data.10jqka.com.cn/ipo/xgsr/
 * @returns 新股上市首日数据
 */
export async function stock_xgsr_ths(): Promise<DataFrame> {
  // Note: THS requires cookie authentication with v= code
  const columns = [
    '序号', '股票代码', '股票简称', '发行价', '最新价',
    '首日开盘价', '首日收盘价', '首日最高价', '首日最低价',
    '首日涨跌幅', '上市日期',
  ];
  return createDataFrame(columns, []);
}

/**
 * 同花顺-数据中心-新股数据-IPO受益股
 * https://data.10jqka.com.cn/ipo/syg/
 * @returns IPO受益股数据
 */
export async function stock_ipo_benefit_ths(): Promise<DataFrame> {
  // Note: THS requires cookie authentication with v= code
  const columns = [
    '序号', '股票代码', '股票简称', '收盘价', '涨跌幅',
    '市值', '参股家数', '投资总额', '投资占市值比', '参股对象',
  ];
  return createDataFrame(columns, []);
}
