/**
 * AKShare TypeScript - 大宗商品现货价格及基差数据
 * 数据源: 生意社 https://www.100ppi.com/sf/
 */

import { load } from 'cheerio';
import { httpGetText } from '../utils/httpClient';
import { create_trade_calendar_set } from '../file_fold/calendar';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

// 中文品种名到英文代码的映射
const chineseToEnglishMap: Record<string, string> = {
  '铜': 'CU', '铝': 'AL', '锌': 'ZN', '铅': 'PB', '镍': 'NI',
  '锡': 'SN', '黄金': 'AU', '白银': 'AG', '螺纹钢': 'RB', '线材': 'WR',
  '热轧卷板': 'HC', '不锈钢': 'SS', '天然橡胶': 'RU', '燃料油': 'FU',
  '石油沥青': 'BU', '纸浆': 'SP', '原油': 'SC', '20号胶': 'NR',
  '低硫燃料油': 'LU', '国际铜': 'BC', '焦炭': 'J', '焦煤': 'JM',
  '铁矿石': 'I', '豆粕': 'M', '豆油': 'Y', '棕榈油': 'P', '玉米': 'C',
  '豆一': 'A', '豆二': 'B', '玉米淀粉': 'CS', '鸡蛋': 'JD', '粳米': 'RR',
  '生猪': 'LH', '纤维板': 'FB', '胶合板': 'BB', '聚乙烯': 'L',
  '聚氯乙烯': 'V', '聚丙烯': 'PP', '乙二醇': 'EG', '苯乙烯': 'EB',
  '液化石油气': 'PG', 'PTA': 'TA', '甲醇': 'MA', '白糖': 'SR',
  '棉花': 'CF', '菜籽油': 'OI', '菜粕': 'RM', '动力煤': 'ZC',
  '菜籽粕': 'RM', '棉纱': 'CY', '短纤': 'PF', '涤纶短纤': 'PF', '烧碱': 'SH',
  '玻璃': 'FG', '纯碱': 'SA', '尿素': 'UR', '苹果': 'AP',
  '红枣': 'CJ', '花生': 'PK', '强麦': 'WH', '普麦': 'PM',
  '硅铁': 'SF', '锰硅': 'SM',
  'BR橡胶': 'BR', '丁二烯橡胶': 'BR',
  '工业硅': 'SI', '碳酸锂': 'LC', 'PX': 'PX',
};

const marketExchangeSymbols = {
  cffex: ['IF', 'IC', 'IM', 'IH', 'T', 'TF', 'TS', 'TL'],
  dce: [
    'C', 'CS', 'A', 'B', 'M', 'Y', 'P', 'FB', 'BB', 'JD', 'L', 'V', 'PP',
    'J', 'JM', 'I', 'EG', 'RR', 'EB', 'PG', 'LH', 'LG', 'BZ',
  ],
  czce: [
    'WH', 'PM', 'CF', 'SR', 'TA', 'OI', 'RI', 'MA', 'ME', 'FG', 'RS', 'RM',
    'ZC', 'JR', 'LR', 'SF', 'SM', 'WT', 'TC', 'GN', 'RO', 'ER', 'SRX', 'SRY',
    'WSX', 'WSY', 'CY', 'AP', 'UR', 'CJ', 'SA', 'PK', 'PF', 'PX', 'SH', 'PR', 'PL',
  ],
  shfe: [
    'CU', 'AL', 'ZN', 'PB', 'NI', 'SN', 'AU', 'AG', 'RB', 'WR', 'HC', 'FU',
    'BU', 'RU', 'SC', 'NR', 'SP', 'SS', 'LU', 'BC', 'AO', 'BR', 'EC', 'AD', 'OP',
  ],
  gfex: ['SI', 'LC', 'PS'],
};

const CONTRACT_SYMBOLS: string[] = [
  ...marketExchangeSymbols.cffex,
  ...marketExchangeSymbols.dce,
  ...marketExchangeSymbols.czce,
  ...marketExchangeSymbols.shfe,
  ...marketExchangeSymbols.gfex,
];

function normalizeYmd(value: string): string {
  return String(value).replace(/-/g, '').trim();
}

function ymdToIso(ymd: string): string {
  return `${ymd.slice(0, 4)}-${ymd.slice(4, 6)}-${ymd.slice(6, 8)}`;
}

function parseHtmlTables(html: string): string[][][] {
  const $ = load(html);
  const tables: string[][][] = [];

  $('table').each((_, table) => {
    const rows: string[][] = [];
    $(table)
      .find('tr')
      .each((__, tr) => {
        const cells: string[] = [];
        $(tr)
          .find('th,td')
          .each((___, cell) => {
            cells.push($(cell).text().replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim());
          });
        if (cells.length > 0) {
          rows.push(cells);
        }
      });
    if (rows.length > 0) {
      tables.push(rows);
    }
  });

  return tables;
}

function formatContract(symbol: string, monthRaw: string): { contract: string; month: string } {
  const monthDigits = String(monthRaw ?? '').replace(/[^0-9]/g, '');
  if (!monthDigits) {
    return { contract: '', month: '' };
  }

  const month = String(parseInt(monthDigits, 10));
  let contract = `${symbol}${month}`;

  if (marketExchangeSymbols.shfe.includes(symbol) || marketExchangeSymbols.dce.includes(symbol)) {
    contract = contract.toLowerCase();
  }
  if (marketExchangeSymbols.czce.includes(symbol) && month.length >= 3) {
    contract = `${symbol}${month.slice(-3)}`;
  }

  return { contract, month };
}

function toPandasNumericString(value: any): string {
  const raw = String(value ?? '').trim();
  if (!raw) {
    return '';
  }
  const num = Number(raw);
  if (!Number.isFinite(num)) {
    return raw;
  }
  return Number.isInteger(num) ? num.toFixed(1) : num.toString();
}

/**
 * 生意社-大宗商品现货价格及基差（指定日期）
 * https://www.100ppi.com/sf/
 */
export async function futures_spot_price(
  date: string = '20240430',
  varsList: string[] = CONTRACT_SYMBOLS
): Promise<DataFrame> {
  const ymd = normalizeYmd(date);
  if (ymd.length !== 8 || ymd < '20110104') {
    throw new Error('数据源开始日期为 20110104, 请将获取数据时间点设置在 20110104 后');
  }

  const tradeCalendar = await create_trade_calendar_set();
  if (!tradeCalendar.has(ymd)) {
    return createDataFrame([], []);
  }

  const targetUrl = `https://www.100ppi.com/sf/day-${ymdToIso(ymd)}.html`;

  try {
    for (const url of [targetUrl]) {
      const html = await httpGetText(url, {
        headers: {
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });

      const tables = parseHtmlTables(html);
      if (tables.length < 2) {
        continue;
      }

      const mainTable = tables[1];
      const dataRows: any[][] = [];

      for (const row of mainTable) {
        if (row.length < 9) {
          continue;
        }

        if (!/^\d{3,4}$/.test(String(row[2] ?? '').trim()) || !/^\d{3,4}$/.test(String(row[7] ?? '').trim())) {
          continue;
        }

        const rawName = String(row[0] ?? '');
        const chineseNameMatch = rawName.match(/[\u4e00-\u9fa5]+/g);
        const chineseName = chineseNameMatch ? chineseNameMatch.join('') : rawName.trim();

        if (!chineseName || [
          '商品',
          '价格',
          '上海期货交易所',
          '郑州商品交易所',
          '大连商品交易所',
          '广州期货交易所',
          '暂无数据',
        ].includes(chineseName)) {
          continue;
        }

        const symbol = chineseToEnglishMap[chineseName] || chineseName.toUpperCase();
        if (!varsList.includes(symbol)) {
          continue;
        }

        let spotPrice = Number(row[1]);
        const nearPrice = Number(row[3]);
        const dominantPrice = Number(row[8]);
        if (!Number.isFinite(spotPrice) || !Number.isFinite(nearPrice) || !Number.isFinite(dominantPrice)) {
          continue;
        }

        if (symbol === 'JD') {
          spotPrice *= 500;
        } else if (symbol === 'FG') {
          spotPrice *= 80;
        } else if (symbol === 'LH') {
          spotPrice *= 1000;
        }

        const nearInfo = formatContract(symbol, row[2]);
        const dominantInfo = formatContract(symbol, row[7]);
        if (!nearInfo.contract || !dominantInfo.contract) {
          continue;
        }

        dataRows.push([
          ymd,
          symbol,
          toPandasNumericString(spotPrice),
          nearInfo.contract,
          toPandasNumericString(nearPrice),
          dominantInfo.contract,
          toPandasNumericString(dominantPrice),
          nearInfo.month,
          dominantInfo.month,
          toPandasNumericString(nearPrice - spotPrice),
          toPandasNumericString(dominantPrice - spotPrice),
          nearPrice / spotPrice - 1,
          dominantPrice / spotPrice - 1,
        ]);
      }

      const orderedMap = new Map<string, any[]>();
      for (const row of dataRows) {
        orderedMap.set(String(row[1]), row);
      }
      const orderedRows = varsList
        .filter((symbol) => orderedMap.has(symbol))
        .map((symbol) => orderedMap.get(symbol) as any[]);

      return createDataFrame(
        [
          'date',
          'symbol',
          'spot_price',
          'near_contract',
          'near_contract_price',
          'dominant_contract',
          'dominant_contract_price',
          'near_month',
          'dominant_month',
          'near_basis',
          'dom_basis',
          'near_basis_rate',
          'dom_basis_rate',
        ],
        orderedRows
      );
    }

    return createDataFrame([], []);
  } catch {
    return createDataFrame([], []);
  }
}

/**
 * 生意社-大宗商品现货价格及基差（日期范围）
 */
export async function futures_spot_price_daily(
  startDay: string = '20210201',
  endDay: string = '20210208',
  varsList: string[] = CONTRACT_SYMBOLS
): Promise<DataFrame> {
  const startYmd = normalizeYmd(startDay);
  const endYmd = normalizeYmd(endDay);

  const startDate = new Date(
    parseInt(startYmd.substring(0, 4), 10),
    parseInt(startYmd.substring(4, 6), 10) - 1,
    parseInt(startYmd.substring(6, 8), 10)
  );
  const endDate = new Date(
    parseInt(endYmd.substring(0, 4), 10),
    parseInt(endYmd.substring(4, 6), 10) - 1,
    parseInt(endYmd.substring(6, 8), 10)
  );

  const allRows: any[][] = [];
  let columns: string[] = [];

  const current = new Date(startDate);
  while (current <= endDate) {
    const dateStr =
      current.getFullYear().toString() +
      (current.getMonth() + 1).toString().padStart(2, '0') +
      current.getDate().toString().padStart(2, '0');

    const df = await futures_spot_price(dateStr, varsList);
    if (df.columns.length > 0 && columns.length === 0) {
      columns = df.columns;
    }
    allRows.push(...df.data);

    current.setDate(current.getDate() + 1);
  }

  return createDataFrame(columns, allRows);
}

/**
 * 生意社-大宗商品现货价格及基差（新版）
 * https://www.100ppi.com/sf2/
 */
export async function futures_spot_price_previous(date: string = '20240430'): Promise<DataFrame> {
  const ymd = normalizeYmd(date);
  if (ymd.length !== 8 || ymd < '20110104') {
    throw new Error('数据源开始日期为 20110104, 请将获取数据时间点设置在 20110104 后');
  }

  const tradeCalendar = await create_trade_calendar_set();
  if (!tradeCalendar.has(ymd)) {
    return createDataFrame([], []);
  }

  const url = `https://www.100ppi.com/sf2/day-${ymdToIso(ymd)}.html`;

  try {
    const html = await httpGetText(url, {
      headers: {
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    const tables = parseHtmlTables(html);
    if (tables.length < 2) {
      return createDataFrame([], []);
    }

    const mainTable = tables[1];
    if (mainTable.length < 2) {
      return createDataFrame([], []);
    }

    const values = mainTable.slice(2).filter((row) => String(row[4] || '').trim().endsWith('%'));

    const basisRows = tables
      .slice(2, -1)
      .map((table) => table[0])
      .filter((row) => Array.isArray(row) && row.length >= 2);

    const rows = values.map((row, i) => {
      const basis = basisRows[i] || ['', ''];
      const cells = row.map((item) => String(item ?? '').trim()).filter((item) => item.length > 0);

      const product = cells[0] || '';
      const spot = cells[1] || '';

      const codePos = cells.findIndex((item, idx) => idx >= 2 && /^\d{3,4}$/.test(item));
      const code = codePos >= 0 ? cells[codePos] : (cells[2] || '');
      let price = '';
      for (let j = codePos + 1; j < cells.length; j++) {
        const candidate = cells[j];
        if (candidate === code) {
          continue;
        }
        if (candidate.includes('%')) {
          continue;
        }
        const num = Number(candidate);
        if (Number.isFinite(num)) {
          price = candidate;
          break;
        }
      }

      const tail = cells.slice(-3);
      return [
        product,
        spot,
        code,
        price,
        toPandasNumericString(basis[0]),
        String(basis[1] ?? '').replace('%', ''),
        tail[0] ?? '',
        tail[1] ?? '',
        tail[2] ?? '',
      ];
    });

    return createDataFrame(
      [
        '商品',
        '现货价格',
        '主力合约代码',
        '主力合约价格',
        '主力合约基差',
        '主力合约变动百分比',
        '180日内主力基差最高',
        '180日内主力基差最低',
        '180日内主力基差平均',
      ],
      rows
    );
  } catch {
    return createDataFrame([], []);
  }
}
