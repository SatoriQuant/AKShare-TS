/**
 * AKShare TypeScript - 广州期货交易所-业务/服务-合约信息
 * http://www.gfex.com.cn/gfex/hyxx/ywcs.shtml
 */

import { httpPost } from '../utils/httpClient';
import { createDataFrame, DataFrame } from '../utils/dataframe';

/**
 * 广州期货交易所-业务/服务-合约信息
 * http://www.gfex.com.cn/gfex/hyxx/ywcs.shtml
 */
export async function futures_contract_info_gfex(): Promise<DataFrame> {
  const url = 'http://www.gfex.com.cn/u/interfacesWebTtQueryContractInfo/loadList';
  const params = {
    variety: '',
    trade_type: '0',
  };

  const data = await httpPost<any>(url, null, {
    params,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    },
  });

  if (!data?.data) {
    return createDataFrame([], []);
  }

  const columnMap: Record<string, string> = {
    variety: '品种',
    contractId: '合约代码',
    unit: '交易单位',
    tick: '最小变动单位',
    startTradeDate: '开始交易日',
    endTradeDate: '最后交易日',
    endDeliveryDate0: '最后交割日',
  };

  const columns = ['品种', '合约代码', '交易单位', '最小变动单位', '开始交易日', '最后交易日', '最后交割日'];

  const rows = data.data.map((item: any) =>
    columns.map((col) => {
      const sourceKey = Object.keys(columnMap).find((key) => columnMap[key] === col);
      const val = sourceKey ? item[sourceKey] : '';

      // 数值列
      if (col === '交易单位' || col === '最小变动单位') {
        const num = parseFloat(val);
        return isNaN(num) ? val : num;
      }

      // 日期列: YYYYMMDD -> YYYY-MM-DD
      if (['开始交易日', '最后交易日', '最后交割日'].includes(col)) {
        if (typeof val === 'string' && val.length === 8) {
          return `${val.slice(0, 4)}-${val.slice(4, 6)}-${val.slice(6)}`;
        }
      }

      return val;
    })
  );

  return createDataFrame(columns, rows);
}
