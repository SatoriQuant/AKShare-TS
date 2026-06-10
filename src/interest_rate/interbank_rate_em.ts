/**
 * AKShare TypeScript - 东方财富网-经济数据-银行间拆借利率
 * https://data.eastmoney.com/shibor/shibor.aspx
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  concat,
  DataFrame,
} from '../utils/dataframe';

/** 市场映射 */
const MARKET_MAP: Record<string, string> = {
  '上海银行同业拆借市场': '001',
  '中国银行同业拆借市场': '002',
  '伦敦银行同业拆借市场': '003',
  '欧洲银行同业拆借市场': '004',
  '香港银行同业拆借市场': '005',
  '新加坡银行同业拆借市场': '006',
};

/** 品种映射 */
const SYMBOL_MAP: Record<string, string> = {
  'Shibor人民币': 'CNY',
  'Chibor人民币': 'CNY',
  'Libor英镑': 'GBP',
  'Libor欧元': 'EUR',
  'Libor美元': 'USD',
  'Libor日元': 'JPY',
  'Euribor欧元': 'EUR',
  'Hibor美元': 'USD',
  'Hibor人民币': 'CNH',
  'Hibor港币': 'HKD',
  'Sibor星元': 'SGD',
  'Sibor美元': 'USD',
};

/** 指标映射 */
const INDICATOR_MAP: Record<string, string> = {
  '隔夜': '001',
  '1周': '101',
  '2周': '102',
  '3周': '103',
  '1月': '201',
  '2月': '202',
  '3月': '203',
  '4月': '204',
  '5月': '205',
  '6月': '206',
  '7月': '207',
  '8月': '208',
  '9月': '209',
  '10月': '210',
  '11月': '211',
  '1年': '301',
};

/**
 * 拆借利率一览 - 具体市场的具体品种的具体指标的拆借利率数据
 * 东方财富-拆借利率一览
 * @param market 市场选择，如 "上海银行同业拆借市场"
 * @param symbol 品种选择，如 "Shibor人民币"
 * @param indicator 指标选择，如 "隔夜"
 * @returns 拆借利率数据
 */
export async function rate_interbank(
  market: string = '上海银行同业拆借市场',
  symbol: string = 'Shibor人民币',
  indicator: string = '隔夜'
): Promise<DataFrame> {
  const marketCode = MARKET_MAP[market];
  const currencyCode = SYMBOL_MAP[symbol];
  const indicatorId = INDICATOR_MAP[indicator];

  if (!marketCode || !currencyCode || !indicatorId) {
    return createDataFrame([], []);
  }

  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const baseParams: Record<string, string> = {
    reportName: 'RPT_IMP_INTRESTRATEN',
    columns: 'REPORT_DATE,REPORT_PERIOD,IR_RATE,CHANGE_RATE,INDICATOR_ID,LATEST_RECORD,MARKET,MARKET_CODE,CURRENCY,CURRENCY_CODE',
    quoteColumns: '',
    filter: `(MARKET_CODE="${marketCode}")(CURRENCY_CODE="${currencyCode}")(INDICATOR_ID="${indicatorId}")`,
    pageNumber: '1',
    pageSize: '500',
    sortTypes: '-1',
    sortColumns: 'REPORT_DATE',
    source: 'WEB',
    client: 'WEB',
    p: '1',
    pageNo: '1',
    pageNum: '1',
  };

  // First request to get total pages
  const firstResponse = await httpGet<any>(url, { params: baseParams });

  if (!firstResponse?.result?.data) {
    return createDataFrame([], []);
  }

  const totalPages = firstResponse.result.pages || 1;
  const columns = ['报告日', '利率', '涨跌'];
  const allDataFrames: DataFrame[] = [];

  // Process first page
  const firstRows = firstResponse.result.data.map((item: any) => [
    item.REPORT_DATE ? item.REPORT_DATE.split(' ')[0] : item.REPORT_DATE,
    Number(item.IR_RATE),
    Number(item.CHANGE_RATE),
  ]);
  allDataFrames.push(createDataFrame(columns, firstRows));

  // Fetch remaining pages
  for (let page = 2; page <= totalPages; page++) {
    const pageParams = {
      ...baseParams,
      pageNumber: String(page),
      p: String(page),
      pageNo: String(page),
      pageNum: String(page),
    };

    const pageResponse = await httpGet<any>(url, { params: pageParams });

    if (pageResponse?.result?.data) {
      const pageRows = pageResponse.result.data.map((item: any) => [
        item.REPORT_DATE ? item.REPORT_DATE.split(' ')[0] : item.REPORT_DATE,
        Number(item.IR_RATE),
        Number(item.CHANGE_RATE),
      ]);
      allDataFrames.push(createDataFrame(columns, pageRows));
    }
  }

  if (allDataFrames.length === 0) {
    return createDataFrame(columns, []);
  }

  const combined = concat(allDataFrames);
  // Sort by 报告日 ascending (the API returns descending)
  const sortedData = [...combined.data].sort((a, b) => {
    const dateA = String(a[0]);
    const dateB = String(b[0]);
    return dateA.localeCompare(dateB);
  });

  return createDataFrame(columns, sortedData);
}
