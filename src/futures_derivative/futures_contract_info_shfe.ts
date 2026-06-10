/**
 * AKShare TypeScript - 上海期货交易所-交易所服务-业务数据-交易参数汇总查询
 * https://tsite.shfe.com.cn/bourseService/businessdata/summaryinquiry/
 */

import { httpGet } from '../utils/httpClient';
import { createDataFrame, DataFrame } from '../utils/dataframe';

/**
 * 上海期货交易所-交易所服务-业务数据-交易参数汇总查询
 * https://tsite.shfe.com.cn/bourseService/businessdata/summaryinquiry/
 *
 * @param date 查询日期，格式 "YYYYMMDD"
 */
export async function futures_contract_info_shfe(
  date: string = '20240513'
): Promise<DataFrame> {
  const url = `https://www.shfe.com.cn/data/busiparamdata/future/ContractBaseInfo${date}.dat`;

  const data = await httpGet<any>(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    },
  });

  if (!data?.ContractBaseInfo) {
    return createDataFrame([], []);
  }

  const columnMap: Record<string, string> = {
    BASISPRICE: '挂牌基准价',
    ENDDELIVDATE: '最后交割日',
    EXPIREDATE: '到期日',
    INSTRUMENTID: '合约代码',
    OPENDATE: '上市日',
    STARTDELIVDATE: '开始交割日',
    TRADINGDAY: '交易日',
  };

  const columns = ['合约代码', '上市日', '到期日', '开始交割日', '最后交割日', '挂牌基准价', '交易日', '更新时间'];

  const updateTime = data.update_date || '';

  const rows = data.ContractBaseInfo.map((item: any) => {
    const row = columns.slice(0, -1).map((col) => {
      const sourceKey = Object.keys(columnMap).find((key) => columnMap[key] === col);
      const val = sourceKey ? item[sourceKey] : '';

      // 数值列
      if (col === '挂牌基准价') {
        const num = parseFloat(val);
        return isNaN(num) ? val : num;
      }

      // 日期列
      if (['上市日', '到期日', '开始交割日', '最后交割日', '交易日'].includes(col)) {
        if (typeof val === 'string' && val.length === 8) {
          return `${val.slice(0, 4)}-${val.slice(4, 6)}-${val.slice(6)}`;
        }
      }

      return val;
    });

    row.push(updateTime);
    return row;
  });

  return createDataFrame(columns, rows);
}
