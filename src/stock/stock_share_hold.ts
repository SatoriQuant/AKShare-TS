/**
 * AKShare TypeScript - 董监高及相关人员持股变动数据接口
 * 上海证券交易所/深圳证券交易所/北京证券交易所
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
  convertColumn,
} from '../utils/dataframe';

/**
 * 上海证券交易所-披露-监管信息公开-公司监管-董监高人员股份变动
 * https://www.sse.com.cn/disclosure/credibility/supervision/change/
 *
 * @param symbol 股票代码，如 "600000"，或 "全部"
 */
export async function stock_share_hold_change_sse(
  symbol: string = '全部'
): Promise<DataFrame> {
  const url = 'https://query.sse.com.cn/commonQuery.do';
  const params: Record<string, string> = {
    isPagination: 'true',
    'pageHelp.pageSize': '100',
    'pageHelp.pageNo': '1',
    'pageHelp.beginPage': '1',
    'pageHelp.cacheSize': '1',
    'pageHelp.endPage': '1',
    sqlId: 'COMMON_SSE_XXPL_CXJL_SSGSGFBDQK_S',
    COMPANY_CODE: symbol === '全部' ? '' : symbol,
    NAME: '',
    BEGIN_DATE: '1990-01-01',
    END_DATE: '2050-01-01',
    BOARDTYPE: '',
  };

  try {
    const data = await httpGet<any>(url, {
      params,
      headers: {
        Referer: 'https://www.sse.com.cn/',
      },
    });

    if (!data?.result) {
      return createDataFrame([], []);
    }

    const columns = [
      '公司代码', '公司名称', '姓名', '职务', '股票种类', '货币种类',
      '本次变动前持股数', '变动数', '本次变动平均价格', '变动后持股数',
      '变动原因', '变动日期', '填报日期',
    ];

    const rows = data.result.map((item: any) => [
      item.COMPANY_CODE,
      item.COMPANY_ABBR,
      item.NAME,
      item.DUTY,
      item.STOCK_TYPE,
      item.CURRENCY_TYPE,
      parseInt(item.CURRENT_NUM) || NaN,
      parseInt(item.CHANGE_NUM) || NaN,
      parseFloat(item.CURRENT_AVG_PRICE) || NaN,
      parseInt(item.HOLDSTOCK_NUM) || NaN,
      item.CHANGE_REASON,
      item.CHANGE_DATE,
      item.FORM_DATE,
    ]);

    return createDataFrame(columns, rows);
  } catch (error) {
    return createDataFrame([], []);
  }
}

/**
 * 深圳证券交易所-信息披露-监管信息公开-董监高人员股份变动
 * https://www.szse.cn/disclosure/supervision/change/index.html
 *
 * @param symbol 股票代码，如 "000001"，或 "全部"
 * @param page 页码，默认 1
 */
export async function stock_share_hold_change_szse(
  symbol: string = '全部',
  page: number = 1
): Promise<DataFrame> {
  const url = 'https://www.szse.cn/api/report/ShowReport/data';
  const params: Record<string, string> = {
    SHOWTYPE: 'JSON',
    CATALOGID: '1801_cxda',
    TABKEY: 'tab1',
    PAGENO: page.toString(),
    random: Math.random().toString(),
  };

  if (symbol !== '全部') {
    params.txtDMorJC = symbol;
  }

  try {
    const data = await httpGet<any>(url, { params });

    if (!Array.isArray(data) || !data[0]?.data) {
      return createDataFrame([], []);
    }

    const columns = [
      '证券代码', '证券简称', '董监高姓名', '变动日期', '变动股份数量',
      '成交均价', '变动原因', '变动比例', '当日结存股数',
      '股份变动人姓名', '职务', '变动人与董监高的关系',
    ];

    const rows = data[0].data.map((item: any) => [
      item.zqdm,
      item.zqjc,
      item.ggxm,
      item.jyrq,
      parseInt(item.bdgs) || NaN,
      parseFloat(item.bdjj) || NaN,
      item.bdyy,
      parseFloat(item.cgbdbl) || NaN,
      parseInt((item.cgzs || '').replace(/,/g, '')) || NaN,
      item.gdxm,
      item.zw,
      item.gxlb,
    ]);

    return createDataFrame(columns, rows);
  } catch (error) {
    return createDataFrame([], []);
  }
}

/**
 * 北京证券交易所-信息披露-监管信息-董监高及相关人员持股变动
 * https://www.bse.cn/disclosure/djg_sharehold_change.html
 *
 * @param symbol 股票代码，如 "430489"，或 "全部"
 * @param page 页码，默认 0
 */
export async function stock_share_hold_change_bse(
  symbol: string = '全部',
  page: number = 0
): Promise<DataFrame> {
  const url = 'https://www.bse.cn/djgCgbdController/getDjgCgbdList.do';
  const params: Record<string, string> = {
    page: page.toString(),
    startTime: '',
    endTime: '',
    stockCode: symbol === '全部' ? '' : symbol,
    djgName: '',
    ssgs: '1',
    sortfield: 'bean.change_date desc, bean.stock_code asc, bean.change_amount desc, bean.price',
    sorttype: 'desc',
  };

  try {
    const text = await httpGet<any>(url, { params });
    let dataText: string;

    if (typeof text === 'string') {
      dataText = text;
    } else {
      dataText = JSON.stringify(text);
    }

    // Handle null() wrapper
    if (dataText.startsWith('null(')) {
      dataText = dataText.substring(5, dataText.length - 1);
    }

    const data = JSON.parse(dataText);

    if (!data?.[0]?.result?.content) {
      return createDataFrame([], []);
    }

    const columns = [
      '代码', '简称', '姓名', '职务', '变动日期',
      '变动股数', '变动前持股数', '变动后持股数', '变动均价', '变动原因',
    ];

    const rows = data[0].result.content.map((item: any) => [
      item.stockCode,
      item.stockName,
      item.djgName,
      item.duty,
      item.changeDate,
      parseInt(item.changeAmount) || NaN,
      parseInt(item.preAmount) || NaN,
      parseInt(item.newAmount) || NaN,
      parseFloat(item.price) || NaN,
      item.reason,
    ]);

    return createDataFrame(columns, rows);
  } catch (error) {
    return createDataFrame([], []);
  }
}
