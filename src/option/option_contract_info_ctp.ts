/**
 * AKShare TypeScript - openctp-合约信息接口
 * http://openctp.cn/instruments.html
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * openctp-合约信息接口-期权合约
 * http://openctp.cn/instruments.html
 * @returns 期权合约信息
 */
export async function option_contract_info_ctp(): Promise<DataFrame> {
  const url = 'http://dict.openctp.cn/instruments?types=option';

  try {
    const data = await httpGet<any>(url);

    if (!data?.data || data.data.length === 0) {
      return createDataFrame([], []);
    }

    const columns = [
      '交易所ID', '合约ID', '合约名称', '商品类别', '品种ID',
      '合约乘数', '最小变动价位', 'MinLimitOrderVolume', 'MaxLimitOrderVolume',
      '做多保证金率', '做空保证金率',
      '做多保证金/手', '做空保证金/手', '开仓手续费率', '开仓手续费/手',
      '平仓手续费率', '平仓手续费/手', '平今手续费率', '平今手续费/手',
      '交割年份', '交割月份', '上市日期', '最后交易日', '交割日',
      '标的合约ID', '标的合约乘数', '期权类型', '行权价', '合约状态'
    ];

    const rows = data.data.map((item: any) => [
      item.ExchangeID,
      item.InstrumentID,
      item.InstrumentName,
      item.ProductClass,
      item.ProductID,
      parseFloat(item.VolumeMultiple) || null,
      parseFloat(item.PriceTick) || null,
      item.MinLimitOrderVolume != null ? String(item.MinLimitOrderVolume) : null,
      item.MaxLimitOrderVolume != null ? String(item.MaxLimitOrderVolume) : null,
      parseFloat(item.LongMarginRatioByMoney) || null,
      parseFloat(item.ShortMarginRatioByMoney) || null,
      parseFloat(item.LongMarginRatioByVolume) || null,
      parseFloat(item.ShortMarginRatioByVolume) || null,
      parseFloat(item.OpenRatioByMoney) || null,
      parseFloat(item.OpenRatioByVolume) || null,
      parseFloat(item.CloseRatioByMoney) || null,
      parseFloat(item.CloseRatioByVolume) || null,
      parseFloat(item.CloseTodayRatioByMoney) || null,
      parseFloat(item.CloseTodayRatioByVolume) || null,
      item.DeliveryYear,
      item.DeliveryMonth,
      item.OpenDate,
      item.ExpireDate,
      item.DeliveryDate,
      item.UnderlyingInstrID,
      parseFloat(item.UnderlyingMultiple) || null,
      item.OptionsType,
      parseFloat(item.StrikePrice) || null,
      item.InstLifePhase,
    ]);

    return createDataFrame(columns, rows);
  } catch {
    return createDataFrame([], []);
  }
}
