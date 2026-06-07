/**
 * AKShare TypeScript - 大连商品交易所-业务/服务-业务参数-交易参数-合约信息查询
 * http://www.dce.com.cn/dalianshangpin/ywfw/ywcs/jycs/hyxxcx/index.html
 */

import { httpPost } from '../utils/httpClient';
import { createDataFrame, DataFrame } from '../utils/dataframe';

/**
 * 大连商品交易所-数据中心-业务数据-交易参数-合约信息
 * http://www.dce.com.cn/dce/channel/list/180.html
 */
export async function futures_contract_info_dce(): Promise<DataFrame> {
  const url = 'http://www.dce.com.cn/dcereport/publicweb/tradepara/contractInfo';

  const data = await httpPost<any>(url, {
    lang: 'zh',
    tradeType: '1',
    varietyId: 'all',
  });

  if (!data?.data) {
    return createDataFrame([], []);
  }

  const columnMap: Record<string, string> = {
    contractId: '合约',
    variety: '品种名称',
    varietyOrder: '品种代码',
    unit: '交易单位',
    tick: '最小变动价位',
    startTradeDate: '开始交易日',
    endTradeDate: '最后交易日',
    endDeliveryDate: '最后交割日',
  };

  const columns = ['品种名称', '合约', '交易单位', '最小变动价位', '开始交易日', '最后交易日', '最后交割日'];

  const rows = data.data.map((item: any) =>
    columns.map((col) => {
      // 找到原始 key
      const sourceKey = Object.keys(columnMap).find((key) => columnMap[key] === col);
      const val = sourceKey ? item[sourceKey] : '';

      // 数值列
      if (col === '交易单位' || col === '最小变动价位') {
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
