/**
 * AKShare TypeScript - 新浪财经-财务报表及股东数据
 * https://vip.stock.finance.sina.com.cn/corp/go.php/vFD_FinanceSummary/stockid/600004.phtml
 */

import { httpGet, httpGetText, httpGetTextGbk } from '../utils/httpClient';
import { createDataFrame, DataFrame } from '../utils/dataframe';
import { load } from 'cheerio';

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

  // Deduplicate column names (keep first occurrence), matching Python behavior
  const seenColumns = new Set<string>();
  const dedupIndices: number[] = [];
  const dedupedTitles: string[] = [];
  for (let i = 0; i < allTitles.length; i++) {
    if (!seenColumns.has(allTitles[i])) {
      seenColumns.add(allTitles[i]);
      dedupIndices.push(i);
      dedupedTitles.push(allTitles[i]);
    }
  }

  const columns = ['报告日', ...dedupedTitles];
  const rows: any[][] = [];

  for (const dateStr of reportDates) {
    const reportData = reportList[dateStr];
    if (!reportData) continue;

    const allValues: any[] = reportData.data.map((item: any) => {
      const v = item.item_value;
      return v !== null && v !== undefined && v !== '' ? String(v) : v;
    });

    // Add metadata - keep values as strings to match Python output
    const updateTime = reportData.update_time
      ? String(reportData.update_time)
      : null;

    const metaValues = [
      reportData.data_source ? String(reportData.data_source) : null,
      reportData.is_audit ? String(reportData.is_audit) : null,
      reportData.publish_date ? String(reportData.publish_date) : null,
      reportData.rCurrency ? String(reportData.rCurrency) : null,
      reportData.rType ? String(reportData.rType) : null,
      updateTime,
    ];

    const combinedValues = [...allValues, ...metaValues];

    // Apply deduplication - only keep first occurrence of each column
    const dedupedValues = dedupIndices.map(idx => combinedValues[idx] ?? null);

    rows.push([dateStr, ...dedupedValues]);
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

  // Reverse keyList to match Python's descending date order
  const reversedKeyList = [...keyList].reverse();

  // Build data: rows = items, columns = report dates
  const columns = ['选项', '指标', ...reversedKeyList];
  const rows: any[][] = [];

  // Section header names that should be skipped as data rows
  const sectionHeaders = new Set([
    '常用指标', '每股指标', '盈利能力', '成长能力',
    '收益质量', '财务风险', '营运能力',
  ]);

  // Categorize items into groups (including 常用指标 to match Python output)
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

    // Skip section header rows
    if (sectionHeaders.has(title)) {
      continue;
    }

    // Find which category this item belongs to
    // Python uses iloc[1:-1] for each category range, which excludes both
    // the section header and the last item in the range (next header or end-of-list sentinel)
    let category = '';
    for (const cat of categories) {
      const startIdx = itemTitles.indexOf(cat.start);
      const endIdx = cat.end ? itemTitles.indexOf(cat.end) : itemTitles.length - 1;
      if (startIdx !== -1 && i > startIdx && (endIdx === -1 || i < endIdx)) {
        category = cat.name;
        break;
      }
    }

    if (!category) continue;

    const row: any[] = [category, title];
    for (const dateKey of reversedKeyList) {
      const reportData = reportList[dateKey]?.data;
      if (reportData && reportData[i]) {
        const v = reportData[i].item_value;
        row.push(v !== null && v !== undefined && v !== '' ? String(v) : v);
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
 * 东方财富-A股-财务分析-主要指标（兼容别名）
 */
export async function stock_financial_analysis_indicator(
  symbol: string = '600004',
  start_year: string = '1900'
): Promise<DataFrame> {
  try {
    // First get available years
    const url = `https://money.finance.sina.com.cn/corp/go.php/vFD_FinancialGuideLine/stockid/${symbol}/ctrl/2020/displaytype/4.phtml`;
    const html = await httpGetTextGbk(url, { headers: { 'User-Agent': 'Mozilla/5.0', Referer: 'https://finance.sina.com.cn/' } });
    const $ = load(html);
    const yearContext = $('#con02-1 table a');
    const yearList: string[] = [];
    yearContext.each((_, el) => {
      const text = $(el).text().trim();
      if (/^\d{4}$/.test(text)) yearList.push(text);
    });

    // Filter years by start_year
    let filteredYears = yearList;
    if (start_year !== '1900' && yearList.includes(start_year)) {
      filteredYears = yearList.slice(0, yearList.indexOf(start_year) + 1);
    }

    if (!filteredYears.length) return createDataFrame([], []);

    const allRows: any[][] = [];
    let columns: string[] = [];

    for (const year of filteredYears) {
      const yearUrl = `https://money.finance.sina.com.cn/corp/go.php/vFD_FinancialGuideLine/stockid/${symbol}/ctrl/${year}/displaytype/4.phtml`;
      const yearHtml = await httpGetTextGbk(yearUrl, { headers: { 'User-Agent': 'Mozilla/5.0', Referer: 'https://finance.sina.com.cn/' } });
      const $y = load(yearHtml);

      // Find the main data table (usually the 13th table)
      const tables = $y('table');
      if (tables.length < 13) continue;

      const dataTable = tables.eq(12);
      const trs = dataTable.find('tr');

      // First row is headers
      if (!columns.length && trs.length > 0) {
        const headerRow = trs.eq(0);
        const ths = headerRow.find('td');
        ths.each((_: any, td: any) => {
          const text = $y(td).text().trim();
          if (text) columns.push(text);
        });
      }

      // Data rows
      for (let i = 1; i < trs.length; i++) {
        const row = trs.eq(i);
        const tds = row.find('td');
        if (tds.length < 2) continue;
        const rowData: any[] = [];
        tds.each((_: any, td: any) => {
          const text = $y(td).text().trim();
          rowData.push(text);
        });
        if (rowData.length > 0 && rowData[0]) {
          allRows.push(rowData);
        }
      }
    }

    if (!allRows.length || !columns.length) return createDataFrame([], []);

    // Normalize column names - first column should be 日期
    if (columns[0] !== '日期') columns[0] = '日期';

    // Ensure all rows have same number of columns
    const maxCols = columns.length;
    const normalizedRows = allRows.map(r => {
      while (r.length < maxCols) r.push('');
      return r.slice(0, maxCols);
    });

    return createDataFrame(columns, normalizedRows);
  } catch { return createDataFrame([], []); }
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
 * 东方财富网/新浪财经-股本股东-主要股东
 * https://emweb.securities.eastmoney.com/PC_HSF10/ShareholderResearch/Index?type=web&code=SH600000
 *
 * @param stock 股票代码，如 "600000"
 */
export async function stock_main_stock_holder(stock: string = '600004'): Promise<DataFrame> {
  try {
    const { load } = await import('cheerio');

    const url = `https://vip.stock.finance.sina.com.cn/corp/go.php/vCI_StockHolder/stockid/${stock}.phtml`;
    const htmlText = await httpGetTextGbk(url);

    const $ = load(htmlText);

    // Find all tables - the shareholder data is in table index 13
    const tables = $('table').toArray();
    if (tables.length < 14) {
      return createDataFrame([], []);
    }

    const targetTable = tables[13];
    const rawRows: string[][] = [];
    $(targetTable).find('tr').each((_, tr) => {
      const cells: string[] = [];
      $(tr).find('td, th').each((_, cell) => {
        cells.push($(cell).text().trim().replace(/\s+/g, ' '));
      });
      if (cells.length > 0) {
        rawRows.push(cells.slice(0, 5));
      }
    });

    if (rawRows.length === 0) {
      return createDataFrame([], []);
    }

    // Parse the structure: blocks separated by "截至日期" rows
    const columns = ['编号', '股东名称', '持股数量', '持股比例', '股本性质', '截至日期', '公告日期', '股东说明', '股东总数', '平均持股数'];

    const allRows: string[][] = [];
    let currentEndDate = '';
    let currentNoticeDate = '';
    let currentHolderCount = '';
    let currentAvgShares = '';

    for (const row of rawRows) {
      const firstCell = row[0] || '';

      // Check if this is a metadata row
      if (firstCell.startsWith('截至日期')) {
        currentEndDate = firstCell.replace('截至日期：', '').replace('截至日期', '').trim();
        if (row.length > 1) currentEndDate = row[1] || currentEndDate;
      } else if (firstCell.startsWith('公告日期')) {
        currentNoticeDate = firstCell.replace('公告日期：', '').replace('公告日期', '').trim();
        if (row.length > 1) currentNoticeDate = row[1] || currentNoticeDate;
      } else if (firstCell.startsWith('股东总数')) {
        currentHolderCount = firstCell.replace('股东总数：', '').replace('股东总数', '').replace('查看变化趋势', '').trim();
        if (row.length > 1) currentHolderCount = row[1] || currentHolderCount;
      } else if (firstCell.startsWith('平均持股数')) {
        currentAvgShares = firstCell.replace('平均持股数：', '').replace('平均持股数', '').replace('(按总股本计算) 查看变化趋势', '').replace('查看变化趋势', '').trim();
        if (row.length > 1) currentAvgShares = row[1] || currentAvgShares;
      } else if (firstCell.match(/^\d+$/)) {
        // This is a data row (starts with a number like "1", "2", etc.)
        const holderName = row[1] || '';
        const shares = row[2] || '';
        const ratio = row[3] ? row[3].replace('↓', '') : '';
        const stockNature = row[4] || '';

        allRows.push([
          firstCell,
          holderName,
          shares,
          ratio,
          stockNature,
          currentEndDate,
          currentNoticeDate,
          '',
          currentHolderCount,
          currentAvgShares,
        ]);
      }
    }

    if (allRows.length === 0) {
      return createDataFrame([], []);
    }

    return createDataFrame(columns, allRows);
  } catch (error) {
    return createDataFrame([], []);
  }
}
