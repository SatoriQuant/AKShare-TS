/**
 * AKShare TypeScript - 期货衍生指标模块
 *
 * 包含以下子模块:
 * - futures_index_sina: 新浪财经-期货的主力合约数据
 * - futures_cot_sina: 新浪财经-期货-成交持仓
 * - futures_hog: 玄田数据-生猪期货相关数据
 * - futures_spot_sys: 生意社-商品与期货-现期图
 * - futures_contract_info_cffex: 中国金融期货交易所-交易参数
 * - futures_contract_info_czce: 郑州商品交易所-参考数据
 * - futures_contract_info_dce: 大连商品交易所-合约信息
 * - futures_contract_info_gfex: 广州期货交易所-合约信息
 * - futures_contract_info_ine: 上海国际能源交易中心-交易参数
 * - futures_contract_info_shfe: 上海期货交易所-交易参数
 */

// 新浪财经-期货的主力合约数据
export {
  zh_subscribe_exchange_symbol,
  match_main_contract,
  futures_display_main_sina,
  futures_main_sina,
} from './futures_index_sina';

// 新浪财经-期货-成交持仓
export { futures_hold_pos_sina } from './futures_cot_sina';

// 玄田数据-生猪期货相关数据
export {
  futures_hog_core,
  futures_hog_cost,
  futures_hog_supply,
} from './futures_hog';

// 生意社-商品与期货-现期图
export { futures_spot_sys } from './futures_spot_sys';

// 各交易所合约信息
export { futures_contract_info_cffex } from './futures_contract_info_cffex';
export { futures_contract_info_czce } from './futures_contract_info_czce';
export { futures_contract_info_dce } from './futures_contract_info_dce';
export { futures_contract_info_gfex } from './futures_contract_info_gfex';
export { futures_contract_info_ine } from './futures_contract_info_ine';
export { futures_contract_info_shfe } from './futures_contract_info_shfe';
