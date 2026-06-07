/**
 * AKShare TypeScript - 新浪财经-财务报表及股东数据
 * https://vip.stock.finance.sina.com.cn/corp/go.php/vFD_FinanceSummary/stockid/600004.phtml
 */

import { httpGet, httpGetText } from '../utils/httpClient';
import { createDataFrame, DataFrame } from '../utils/dataframe';

/**
 * 新浪财经-财务报表-三大报表
 *
 * @param stock 股票代码，如 "sh600600", "sz000001"
 * @param symbol 报表类型: "资产负债表", "利润表", "现金流量表"
 */
export async function stock_financial_report_sina(
  stock: string = 'sh600600',
  symbol: '资产负债表' | '利润表' | '现金流量表' = '资产负债表'
): Promise<DataFrame> {
  const symbolMap: Record<string, string> = {
    '资产负债表': 'fzb',
    '利润表': 'lrb',
    '现金流量表': 'llb',
  };

  const url = 'https://quotes.sina.cn/cn/api/openapi.php/CompanyFinanceService.getFinanceReport2022';
  const params = {
    paperCode: stock,
    source: symbolMap[symbol],
    type: '0',
    page: '1',
    num: '1000',
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.result?.data?.report_list) {
    return createDataFrame([], []);
  }

  const reportList = data.result.data.report_list;
  const reportDates: string[] = data.result.data.report_date.map(
    (item: any) => item.date_value
  );

  // Build the columns from the first date's data
  const firstDateData = reportList[reportDates[0]]?.data;
  if (!firstDateData) {
    return createDataFrame([], []);
  }

  const itemTitles: string[] = firstDateData.map((item: any) => item.item_title);

  // Add metadata items
  const metaTitles = ['数据源', '是否审计', '公告日期', '币种', '类型', '更新日期'];
  const allTitles = [...itemTitles, ...metaTitles];

  const columns = ['报告日', ...allTitles];
  const rows: any[][] = [];

  for (const dateStr of reportDates) {
    const reportData = reportList[dateStr];
    if (!reportData) continue;

    const values: any[] = reportData.data.map((item: any) => {
      const v = item.item_value;
      return v !== null && v !== undefined && v !== '' ? Number(v) : v;
    });

    // Add metadata
    const updateTime = reportData.update_time
      ? new Date(reportData.update_time * 1000).toISOString()
      : null;

    const metaValues = [
      reportData.data_source || null,
      reportData.is_audit || null,
      reportData.publish_date || null,
      reportData.rCurrency || null,
      reportData.rType || null,
      updateTime,
    ];

    rows.push([dateStr, ...values, ...metaValues]);
  }

  return createDataFrame(columns, rows);
}

/**
 * 新浪财经-财务报表-关键指标
 *
 * @param symbol 股票代码，如 "600004"
 */
export async function stock_financial_abstract(symbol: string = '600004'): Promise<DataFrame> {
  const url = 'https://quotes.sina.cn/cn/api/openapi.php/CompanyFinanceService.getFinanceReport2022';
  const params = {
    paperCode: `sh${symbol}`,
    source: 'gjzb',
    type: '0',
    page: '1',
    num: '1000',
  };

  const data = await httpGet<any>(url, { params });

  if (!data?.result?.data?.report_list) {
    return createDataFrame([], []);
  }

  const reportList = data.result.data.report_list;
  const keyList: string[] = Object.keys(reportList);

  if (keyList.length === 0) {
    return createDataFrame([], []);
  }

  // Get item titles from first report
  const firstReport = reportList[keyList[0]]?.data;
  if (!firstReport) {
    return createDataFrame([], []);
  }

  const itemTitles = firstReport.map((item: any) => item.item_title);

  // Build data: rows = items, columns = report dates
  const columns = ['选项', '指标', ...keyList];
  const rows: any[][] = [];

  // Categorize items into groups
  const categories = [
    { name: '常用指标', start: '常用指标', end: '每股指标' },
    { name: '每股指标', start: '每股指标', end: '盈利能力' },
    { name: '盈利能力', start: '盈利能力', end: '成长能力' },
    { name: '成长能力', start: '成长能力', end: '收益质量' },
    { name: '收益质量', start: '收益质量', end: '财务风险' },
    { name: '财务风险', start: '财务风险', end: '营运能力' },
    { name: '营运能力', start: '营运能力', end: '' },
  ];

  for (let i = 0; i < itemTitles.length; i++) {
    const title = itemTitles[i];

    // Find which category this item belongs to
    let category = '';
    for (const cat of categories) {
      const startIdx = itemTitles.indexOf(cat.start);
      const endIdx = cat.end ? itemTitles.indexOf(cat.end) : itemTitles.length;
      if (startIdx !== -1 && i > startIdx && (endIdx === -1 || i < endIdx)) {
        category = cat.name;
        break;
      }
    }

    if (!category) continue;
    if (title === '常用指标' || title === '每股指标' || title === '盈利能力' ||
        title === '成长能力' || title === '收益质量' || title === '财务风险' || title === '营运能力') {
      continue;
    }

    const row: any[] = [category, title];
    for (const dateKey of keyList) {
      const reportData = reportList[dateKey]?.data;
      if (reportData && reportData[i]) {
        const v = reportData[i].item_value;
        row.push(v !== null && v !== undefined && v !== '' ? Number(v) : v);
      } else {
        row.push(null);
      }
    }
    rows.push(row);
  }

  return createDataFrame(columns, rows);
}

/**
 * 东方财富-A股-财务分析-主要指标
 *
 * @param symbol 股票代码（带市场标识），如 "301389.SZ"
 * @param indicator 指标类型: "按报告期" | "按单季度"
 */
export async function stock_financial_analysis_indicator_em(
  symbol: string = '301389.SZ',
  indicator: '按报告期' | '按单季度' = '按报告期'
): Promise<DataFrame> {
  let url: string;
  let params: Record<string, string>;

  if (indicator === '按报告期') {
    url = 'https://datacenter.eastmoney.com/securities/api/data/get';
    params = {
      type: 'RPT_F10_FINANCE_MAINFINADATA',
      sty: 'APP_F10_MAINFINADATA',
      quoteColumns: '',
      filter: `(SECUCODE="${symbol}")`,
      p: '1',
      ps: '200',
      sr: '-1',
      st: 'REPORT_DATE',
      source: 'HSF10',
      client: 'PC',
    };
  } else {
    url = 'https://datacenter.eastmoney.com/securities/api/data/v1/get';
    params = {
      reportName: 'RPT_F10_QTR_MAINFINADATA',
      columns: 'ALL',
      quoteColumns: '',
      filter: `(SECUCODE="${symbol}")`,
      pageNumber: '1',
      pageSize: '200',
      sortTypes: '-1',
      sortColumns: 'REPORT_DATE',
      source: 'HSF10',
      client: 'PC',
    };
  }

  const data = await httpGet<any>(url, { params });

  if (!data?.result?.data) {
    return createDataFrame([], []);
  }

  const resultData = data.result.data;
  if (resultData.length === 0) {
    return createDataFrame([], []);
  }

  // Use the keys from the first record as columns
  const columns = Object.keys(resultData[0]);
  const rows = resultData.map((item: any) => columns.map(col => item[col]));

  return createDataFrame(columns, rows);
}

/**
 * 新浪财经-发行与分配-历史分红
 * https://vip.stock.finance.sina.com.cn/q/go.php/vInvestConsult/kind/lsfh/index.phtml
 */
export async function stock_history_dividend(): Promise<DataFrame> {
  const url = 'https://vip.stock.finance.sina.com.cn/q/go.php/vInvestConsult/kind/lsfh/index.phtml';
  const params = { p: '1', num: '50000' };

  const html = await httpGetText(url, { params });

  // Parse HTML table - this is a simplified version that extracts data from the table
  // In production, you'd want to use a proper HTML parser
  const columns = [
    '代码', '名称', '上市日期', '累计股息', '年均股息',
    '分红次数', '融资总额', '融资次数',
  ];

  // This function requires HTML parsing which is complex in TypeScript
  // Return empty DataFrame for now - users should use the API-based functions
  return createDataFrame(columns, []);
}

/**
 * 新浪财经-发行与分配-分红配股详情
 *
 * @param symbol 股票代码，如 "000002"
 * @param indicator "分红" 或 "配股"
 */
export async function stock_history_dividend_detail(
  symbol: string = '000002',
  indicator: '分红' | '配股' = '分红'
): Promise<DataFrame> {
  const url = `https://vip.stock.finance.sina.com.cn/corp/go.php/vISSUE_ShareBonus/stockid/${symbol}.phtml`;

  if (indicator === '分红') {
    const columns = [
      '公告日期', '送股', '转增', '派息', '进度',
      '除权除息日', '股权登记日', '红股上市日',
    ];
    // Requires HTML parsing
    return createDataFrame(columns, []);
  } else {
    const columns = [
      '公告日期', '配股方案', '配股价格', '基准股本', '除权日',
      '股权登记日', '缴款起始日', '缴款终止日', '配股上市日', '募集资金合计',
    ];
    return createDataFrame(columns, []);
  }
}

/**
 * 新浪财经-发行与分配-新股发行
 *
 * @param stock 股票代码，如 "600004"
 */
export async function stock_ipo_info(stock: string = '600004'): Promise<DataFrame> {
  const columns = ['item', 'value'];
  // Requires HTML parsing
  return createDataFrame(columns, []);
}

/**
 * 新浪财经-发行分配-限售解禁
 *
 * @param symbol 股票代码，如 "600000"
 */
export async function stock_restricted_release_queue_sina(symbol: string = '600000'): Promise<DataFrame> {
  const columns = [
    '代码', '名称', '解禁日期', '解禁数量', '解禁股流通市值',
    '上市批次', '公告日期',
  ];
  // Requires HTML parsing
  return createDataFrame(columns, []);
}

/**
 * 新浪财经-股本股东-流通股东
 *
 * @param symbol 股票代码，如 "600000"
 */
export async function stock_circulate_stock_holder(symbol: string = '600000'): Promise<DataFrame> {
  const columns = [
    '截止日期', '公告日期', '编号', '股东名称',
    '持股数量', '占流通股比例', '股本性质',
  ];
  // Requires HTML parsing
  return createDataFrame(columns, []);
}

/**
 * 新浪财经-股本股东-基金持股
 *
 * @param symbol 股票代码，如 "600004"
 */
export async function stock_fund_stock_holder(symbol: string = '600004'): Promise<DataFrame> {
  const columns = [
    '基金名称', '基金代码', '持仓数量', '占流通股比例',
    '持股市值', '占净值比例', '截止日期',
  ];
  // Requires HTML parsing
  return createDataFrame(columns, []);
}

/**
 * 新浪财经-股本股东-主要股东
 *
 * @param stock 股票代码，如 "600004"
 */
export async function stock_main_stock_holder(stock: string = '600004'): Promise<DataFrame> {
  const columns = [
    '截至日期', '公告日期', '股东总数', '平均持股数',
    '编号', '股东名称', '持股数量', '持股比例',
  ];
  // Requires HTML parsing
  return createDataFrame(columns, []);
}
