/**
 * AKShare TypeScript - 深圳证券交易所-期权子网-行情数据-当日合约
 * https://www.sse.org.cn/option/quotation/contract/daycontract/index.html
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 深圳证券交易所-期权子网-行情数据-当日合约
 * https://www.sse.org.cn/option/quotation/contract/daycontract/index.html
 * @returns 深圳期权当日合约
 */
export async function option_current_day_szse(): Promise<DataFrame> {
  const url = 'https://www.sse.org.cn/api/report/ShowReport';
  const params = {
    SHOWTYPE: 'xlsx',
    CATALOGID: 'option_drhy',
    TABKEY: 'tab1',
  };

  // 注意：此接口返回xlsx文件，需要特殊处理
  // 在浏览器环境中可能需要使用其他方式解析
  // 这里返回空DataFrame，实际使用时可能需要额外的xlsx解析库
  try {
    const response = await httpGet<any>(url, { params });

    // 如果返回的是JSON格式数据
    if (Array.isArray(response)) {
      const columns = [
        '序号', '合约编码', '合约代码', '合约简称', '标的证券简称(代码)',
        '合约类型', '行权价', '合约单位', '最后交易日', '行权日', '到期日',
        '交收日', '新挂', '涨停价格', '跌停价格', '前结算价', '合约调整',
        '停牌', '合约总持仓', '挂牌原因', '原合约代码', '原合约简称',
        '原行权价格', '原合约单位', '合约到期剩余交易天数', '合约到期剩余自然天数',
        '下次合约调整剩余交易天数', '下次合约调整剩余自然天数', '交易日期'
      ];

      const rows = response.map((item: any) => [
        parseInt(item['序号']) || null,
        item['合约编码'],
        item['合约代码'],
        item['合约简称'],
        item['标的证券简称(代码)'],
        item['合约类型'],
        parseFloat(item['行权价']) || null,
        parseInt(item['合约单位']) || null,
        item['最后交易日'],
        item['行权日'],
        item['到期日'],
        item['交收日'],
        item['新挂'],
        parseFloat(item['涨停价格']) || null,
        parseFloat(item['跌停价格']) || null,
        parseFloat(item['前结算价']) || null,
        item['合约调整'],
        item['停牌'],
        parseInt(item['合约总持仓']) || null,
        item['挂牌原因'],
        item['原合约代码'],
        item['原合约简称'],
        parseFloat(item['原行权价格']) || null,
        parseInt(item['原合约单位']) || null,
        parseInt(item['合约到期剩余交易天数']) || null,
        parseInt(item['合约到期剩余自然天数']) || null,
        parseInt(item['下次合约调整剩余交易天数']) || null,
        parseInt(item['下次合约调整剩余自然天数']) || null,
        item['交易日期'],
      ]);

      return createDataFrame(columns, rows);
    }

    // 如果无法解析，返回空DataFrame
    console.warn('深交所期权数据返回格式不支持，可能需要xlsx解析库');
    return createDataFrame([], []);
  } catch (error) {
    console.error('获取深交所期权数据失败:', error);
    return createDataFrame([], []);
  }
}
