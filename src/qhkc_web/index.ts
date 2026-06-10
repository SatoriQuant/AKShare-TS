/**
 * AKShare TypeScript - 奇货可查网站版模块
 *
 * 奇货可查网站数据接口
 * 提供资金、指数、工具等数据
 */

// 资金数据接口
export {
  get_qhkc_fund_bs,
  get_qhkc_fund_position,
  get_qhkc_fund_position_change,
  get_qhkc_fund_money_change,
} from './qhkc_fund';

// 指数数据接口
export {
  get_qhkc_index,
  get_qhkc_index_trend,
  get_qhkc_index_profit_loss,
} from './qhkc_index';

// 工具数据接口
export {
  qhkc_tool_foreign,
  qhkc_tool_nebula,
  qhkc_tool_gdp,
} from './qhkc_tool';
