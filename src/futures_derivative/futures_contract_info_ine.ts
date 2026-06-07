/**
 * AKShare TypeScript - 上海国际能源交易中心-业务指南-交易参数汇总(期货)
 * https://www.ine.cn/bourseService/summary/?name=currinstrumentprop
 */

import { httpGet } from '../utils/httpClient';
import { createDataFrame, DataFrame } from '../utils/dataframe';

/**
 * 上海国际能源交易中心-业务指南-交易参数汇总(期货)
 * https://www.ine.cn/bourseService/summary/?name=currinstrumentprop
 *
 * @param date 查询日期，格式 "YYYYMMDD"
 */
export async function futures_contract_info_ine(
  date: string = '20241129'
): Promise<DataFrame> {
  const url = `https://www.ine.cn/data/busiparamdata/future/ContractBaseInfo${date}.dat`;
  const params = { rnd: '0.8312696798757147' };

  const data = await httpGet<any>(url, {
    params,
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

  const columns = ['合约代码', '上市日', '到期日', '开始交割日', '最后交割日', '挂牌基准价', '交易日'];

  const rows = data.ContractBaseInfo.map((item: any) =>
    columns.map((col) => {
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
    })
  );

  return createDataFrame(columns, rows);
}
