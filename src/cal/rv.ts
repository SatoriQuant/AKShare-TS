/**
 * AKShare TypeScript - Yang-Zhang's Realized Volatility Automated Estimation
 * https://github.com/hugogobato/Yang-Zhang-s-Realized-Volatility-Automated-Estimation-in-Python
 */

import { createDataFrame, DataFrame } from '../utils/dataframe';

/**
 * 从东方财富网获取股票的分钟级历史行情数据,并进行数据清洗和格式化为计算 yz 已实现波动率所需的数据格式
 * @param symbol 股票代码,如"000001"
 * @param start_date 开始日期时间,格式"YYYY-MM-DD HH:MM:SS"
 * @param end_date 结束日期时间,格式"YYYY-MM-DD HH:MM:SS"
 * @param period 时间周期,可选{'1','5','15','30','60'}分钟
 * @param adjust 复权方式,可选{'','qfq'(前复权),'hfq'(后复权)}
 * @returns 整理后的分钟行情数据,包含Date(索引),Open,High,Low,Close列
 */
export async function rv_from_stock_zh_a_hist_min_em(
  symbol: string = '000001',
  start_date: string = '2021-10-20 09:30:00',
  end_date: string = '2024-11-01 15:00:00',
  period: string = '1',
  adjust: string = 'hfq'
): Promise<DataFrame> {
  // This function depends on stock_zh_a_hist_min_em from stock module
  // In a real implementation, you would import and call that function
  throw new Error('This function requires stock_zh_a_hist_min_em from the stock module. Please use the stock module directly.');
}

/**
 * 从新浪财经获取期货的分钟级历史行情数据,并进行数据清洗和格式化
 * @param symbol 期货合约代码,如"IF2008"代表沪深300期货2020年8月合约
 * @param period 时间周期,可选{'1','5','15','30','60'}分钟
 * @returns 整理后的分钟行情数据,包含Date(索引),Open,High,Low,Close列
 */
export async function rv_from_futures_zh_minute_sina(
  symbol: string = 'IF2008',
  period: string = '5'
): Promise<DataFrame> {
  // This function depends on futures_zh_minute_sina from futures module
  // In a real implementation, you would import and call that function
  throw new Error('This function requires futures_zh_minute_sina from the futures module. Please use the futures module directly.');
}

/**
 * 波动率-已实现波动率-Yang-Zhang 已实现波动率(Yang-Zhang Realized Volatility)
 * https://github.com/hugogobato/Yang-Zhang-s-Realized-Volatility-Automated-Estimation-in-Python
 * 基于以下公式计算:
 * RV^2 = Vo + k*Vc + (1-k)*Vrs
 * 其中:
 * - Vo: 隔夜波动率, Vo = 1/(n-1)*sum(Oi-Obar)^2
 *     Oi为标准化开盘价, Obar为标准化开盘价均值
 * - Vc: 收盘波动率, Vc = 1/(n-1)*sum(ci-Cbar)^2
 *     ci为标准化收盘价, Cbar为标准化收盘价均值
 * - k: 权重系数, k = 0.34/(1.34+(n+1)/(n-1))
 *     n为样本数量
 * - Vrs: Rogers-Satchell波动率代理, Vrs = ui(ui-ci)+di(di-ci)
 *     ui = ln(Hi/Oi), ci = ln(Ci/Oi), di = ln(Li/Oi), oi = ln(Oi/Ci-1)
 *     Hi/Li/Ci/Oi分别为最高价/最低价/收盘价/开盘价
 *
 * @param data 包含 OHLC(开高低收) 价格的 DataFrame, 需要包含以下列: Open, High, Low, Close
 * @returns 包含 Yang-Zhang 实现波动率的 DataFrame
 */
export async function volatility_yz_rv(data: DataFrame): Promise<DataFrame> {
  if (data.columns.length < 4) {
    throw new Error('Data must contain at least 4 columns: Open, High, Low, Close');
  }

  const openIdx = data.columns.indexOf('Open');
  const highIdx = data.columns.indexOf('High');
  const lowIdx = data.columns.indexOf('Low');
  const closeIdx = data.columns.indexOf('Close');

  if (openIdx === -1 || highIdx === -1 || lowIdx === -1 || closeIdx === -1) {
    throw new Error('Data must contain Open, High, Low, Close columns');
  }

  const rows = data.data;
  if (rows.length < 2) {
    return createDataFrame(['date', 'rv'], []);
  }

  // Calculate log returns
  const ui: number[] = [];
  const ci: number[] = [];
  const di: number[] = [];
  const oi: number[] = [];

  for (let i = 1; i < rows.length; i++) {
    const high = Number(rows[i][highIdx]);
    const open = Number(rows[i][openIdx]);
    const low = Number(rows[i][lowIdx]);
    const close = Number(rows[i][closeIdx]);
    const prevClose = Number(rows[i - 1][closeIdx]);

    if (open > 0 && prevClose > 0) {
      ui.push(Math.log(high / open));
      ci.push(Math.log(close / open));
      di.push(Math.log(low / open));
      oi.push(Math.log(open / prevClose));
    }
  }

  if (ui.length === 0) {
    return createDataFrame(['date', 'rv'], []);
  }

  // Calculate Rogers-Satchell volatility
  const rs: number[] = [];
  for (let i = 0; i < ui.length; i++) {
    rs.push(ui[i] * (ui[i] - ci[i]) + di[i] * (di[i] - ci[i]));
  }

  // Calculate variances
  const meanOi = oi.reduce((a, b) => a + b, 0) / oi.length;
  const meanCi = ci.reduce((a, b) => a + b, 0) / ci.length;

  const varOi = oi.reduce((sum, val) => sum + Math.pow(val - meanOi, 2), 0) / (oi.length - 1);
  const varCi = ci.reduce((sum, val) => sum + Math.pow(val - meanCi, 2), 0) / (ci.length - 1);

  const meanRs = rs.reduce((a, b) => a + b, 0) / rs.length;

  const n = ui.length;
  const k = 0.34 / (1.34 + (n + 1) / (n - 1));

  const rv = Math.sqrt((1 - k) * meanRs + varOi + varCi * k);

  // Get date from the data
  const dateIdx = data.columns.indexOf('date');
  const date = dateIdx !== -1 ? rows[1][dateIdx] : '';

  return createDataFrame(['date', 'rv'], [[date, rv]]);
}
