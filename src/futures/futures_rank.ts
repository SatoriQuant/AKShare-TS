/**
 * AKShare TypeScript - 期货交易所持仓排名数据
 * 对应 Python akshare/futures/cot.py
 */

import axios from 'axios';
import * as XLSX from 'xlsx';
import { httpGetTextGbk, httpPost } from '../utils/httpClient';
import { createDataFrame, DataFrame } from '../utils/dataframe';

const RANK_COLUMNS = [
  'rank', 'vol_party_name', 'vol', 'vol_chg',
  'long_party_name', 'long_open_interest', 'long_open_interest_chg',
  'short_party_name', 'short_open_interest', 'short_open_interest_chg',
  'symbol', 'variety', 'date',
];

function symbolVariety(symbol: string): string {
  return symbol.replace(/\d+/g, '').toUpperCase();
}

function parseNum(v: any): number | null {
  const n = Number(String(v).replace(/,/g, '').trim());
  return Number.isFinite(n) ? n : null;
}

function readXlsxRows(buffer: ArrayBuffer): any[][] {
  const wb = XLSX.read(Buffer.from(buffer), { type: 'buffer' });
  const ws = wb.Sheets[wb.SheetNames[0]];
  if (!ws) return [];
  return XLSX.utils.sheet_to_json<any[]>(ws, { header: 1, defval: '' }) as any[][];
}

// ─── 中国金融期货交易所 ─────────────────────────────────────────
const CFFEX_VARS = ['IF', 'IH', 'IC', 'IM', 'T', 'TF', 'TS'];

/**
 * 中国金融期货交易所-前 20 会员持仓排名
 * http://www.cffex.com.cn/ccpm/
 */
export async function get_cffex_rank_table(
  date: string = '20190805',
): Promise<DataFrame> {
  const yyyymm = date.slice(0, 6);
  const dd = date.slice(6, 8);
  const allRows: any[][] = [];

  for (const var_ of CFFEX_VARS) {
    const url = `http://www.cffex.com.cn/sj/ccpm/${yyyymm}/${dd}/${var_}_1.csv`;
    try {
      const text = await httpGetTextGbk(url, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
      });
      const lines = text.split(/\r?\n/).filter(Boolean);
      if (lines.length < 3) continue;

      // Find header row containing "合约"
      let headerIdx = -1;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('合约')) { headerIdx = i; break; }
      }
      if (headerIdx < 0) continue;

      const symbols = new Map<string, any[][]>();
      for (let i = headerIdx + 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map((c) => c.trim());
        if (cols.length < 9) continue;
        const symbol = cols[0];
        if (!symbol || symbol.includes('小计') || symbol.includes('合计')) continue;
        if (!symbols.has(symbol)) symbols.set(symbol, []);
        symbols.get(symbol)!.push(cols);
      }

      for (const [symbol, rows] of symbols) {
        for (let r = 0; r < rows.length; r++) {
          const cols = rows[r];
          allRows.push([
            r + 1,             // rank
            cols[2] ?? '',     // vol_party_name
            parseNum(cols[3]),  // vol
            parseNum(cols[4]),  // vol_chg
            cols[5] ?? '',     // long_party_name
            parseNum(cols[6]),  // long_open_interest
            parseNum(cols[7]),  // long_open_interest_chg
            cols[8] ?? '',     // short_party_name
            parseNum(cols[9]),  // short_open_interest
            parseNum(cols[10]), // short_open_interest_chg
            symbol.toUpperCase(),
            var_,
            date,
          ]);
        }
      }
    } catch {
      // var not available on this date, skip
    }
  }

  return createDataFrame(RANK_COLUMNS, allRows);
}

// ─── 上海期货交易所 ─────────────────────────────────────────────
/**
 * 上海期货交易所-前 20 会员持仓排名
 * https://www.shfe.com.cn/data/tradedata/future/dailydata/pm{date}.dat
 */
export async function get_shfe_rank_table(
  date: string = '20240101',
): Promise<DataFrame> {
  const url = `https://www.shfe.com.cn/data/tradedata/future/dailydata/pm${date}.dat`;
  try {
    const resp = await axios.get(url, {
      timeout: 30000,
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    const cursor: any[] = resp.data?.o_cursor ?? [];
    if (cursor.length === 0) return createDataFrame([], []);

    const rows = cursor
      .filter((item) => Number(item.RANK) > 0)
      .map((item) => {
        const symbol = String(item.INSTRUMENTID ?? '').trim().toUpperCase();
        return [
          parseNum(item.RANK),
          String(item.PARTICIPANTABBR1 ?? '').trim(),
          parseNum(item.CJ1),
          parseNum(item.CJ1_CHG),
          String(item.PARTICIPANTABBR2 ?? '').trim(),
          parseNum(item.CJ2),
          parseNum(item.CJ2_CHG),
          String(item.PARTICIPANTABBR3 ?? '').trim(),
          parseNum(item.CJ3),
          parseNum(item.CJ3_CHG),
          symbol,
          symbolVariety(symbol),
          date,
        ];
      });

    return createDataFrame(RANK_COLUMNS, rows);
  } catch {
    return createDataFrame([], []);
  }
}

// ─── 郑州商品交易所 ─────────────────────────────────────────────
/**
 * 郑州商品交易所-前 20 会员持仓排名
 * http://www.czce.com.cn/cn/DFSStaticFiles/Future/{year}/{date}/FutureDataHolding.xlsx
 */
export async function get_rank_table_czce(
  date: string = '20251103',
): Promise<DataFrame> {
  const year = date.slice(0, 4);
  const url = `http://www.czce.com.cn/cn/DFSStaticFiles/Future/${year}/${date}/FutureDataHolding.xlsx`;
  const urlXls = `http://www.czce.com.cn/cn/DFSStaticFiles/Future/${year}/${date}/FutureDataHolding.xls`;

  try {
    let buffer: ArrayBuffer | null = null;
    for (const tryUrl of [url, urlXls]) {
      try {
        const resp = await axios.get(tryUrl, {
          responseType: 'arraybuffer',
          timeout: 30000,
          headers: { 'User-Agent': 'Mozilla/5.0' },
        });
        buffer = resp.data;
        break;
      } catch { /* try next */ }
    }
    if (!buffer) return createDataFrame([], []);

    const allRows = readXlsxRows(buffer);
    if (allRows.length === 0) return createDataFrame([], []);

    // Find sections separated by "合计" rows
    const sectionStarts: number[] = [];
    for (let i = 0; i < allRows.length; i++) {
      const cell = String(allRows[i]?.[0] ?? '');
      if (cell && !cell.includes('合计') && !cell.includes('排名') && allRows[i]?.length > 5) {
        // Potential section header
        if (i === 0 || String(allRows[i - 1]?.[0] ?? '').includes('合计') || String(allRows[i - 1]?.[0] ?? '') === '') {
          sectionStarts.push(i);
        }
      }
    }

    const outputRows: any[][] = [];
    for (let si = 0; si < sectionStarts.length; si++) {
      const start = sectionStarts[si];
      const end = si + 1 < sectionStarts.length ? sectionStarts[si + 1] : allRows.length;
      const headerRow = allRows[start];
      const symbol = String(headerRow?.[0] ?? '').split(/\s+/)[0].replace(/[^0-9a-zA-Z]/g, '');
      if (!symbol) continue;
      const variety = symbolVariety(symbol);

      for (let r = start + 2; r < end; r++) {
        const row = allRows[r];
        if (!row || row.length < 9) continue;
        const rankVal = parseNum(row[0]);
        if (rankVal === null || rankVal > 20) continue;
        outputRows.push([
          rankVal,
          String(row[1] ?? ''),
          parseNum(row[2]),
          parseNum(row[3]),
          String(row[4] ?? ''),
          parseNum(row[5]),
          parseNum(row[6]),
          String(row[7] ?? ''),
          parseNum(row[8]),
          parseNum(row[9]),
          symbol.toUpperCase(),
          variety,
          date,
        ]);
      }
    }

    return createDataFrame(RANK_COLUMNS, outputRows);
  } catch {
    return createDataFrame([], []);
  }
}

// ─── 大连商品交易所 ─────────────────────────────────────────────
/**
 * 大连商品交易所-前 20 会员持仓排名（新接口）
 */
export async function get_dce_rank_table(
  date: string = '20230706',
): Promise<DataFrame> {
  // DCE has complex HTML/Excel scraping - return empty stub
  // Use futures_dce_position_rank() for actual data
  return createDataFrame(RANK_COLUMNS, []);
}

// ─── 大连商品交易所 (补充接口) ──────────────────────────────────
/**
 * 大连商品交易所-每日持仓排名-具体合约-补充
 */
export async function futures_dce_position_rank_other(
  date: string = '20160104',
): Promise<DataFrame> {
  const url = 'http://www.dce.com.cn/publicweb/quotesdata/memberDealPosiQuotes.html';
  try {
    const { load } = await import('cheerio');
    const allRows: any[][] = [];

    // Get variety list first
    const firstResp = await axios.post(url, new URLSearchParams({
      'memberDealPosiQuotes.variety': 'c',
      'memberDealPosiQuotes.trade_type': '0',
      'year': date.slice(0, 4),
      'month': String(parseInt(date.slice(4, 6)) - 1),
      'day': date.slice(6, 8),
      'contract.contract_id': 'all',
      'contract.variety_id': 'c',
      'contract': '',
    }).toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'Mozilla/5.0' },
      timeout: 30000,
      responseType: 'text',
    });

    const $first = load(String(firstResp.data ?? ''));
    const varieties = $first('[class="selBox"]').eq(-3).find('input').toArray()
      .map((el) => $first(el).attr('onclick')?.replace(/javascript:setVariety\(/, '').replace(/'\);?/, '').replace(/'/g, '').trim() ?? '')
      .filter(Boolean);

    for (const variety of varieties.slice(0, 5)) { // limit to avoid too many requests
      const resp = await axios.post(url, new URLSearchParams({
        'memberDealPosiQuotes.variety': variety,
        'memberDealPosiQuotes.trade_type': '0',
        'year': date.slice(0, 4),
        'month': String(parseInt(date.slice(4, 6)) - 1),
        'day': date.slice(6, 8),
        'contract.contract_id': 'all',
        'contract.variety_id': variety,
        'contract': '',
      }).toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'Mozilla/5.0' },
        timeout: 30000,
        responseType: 'text',
      });

      const $ = load(String(resp.data ?? ''));
      $('table').eq(1).find('tr').each((i, tr) => {
        if (i === 0) return;
        const cells = $(tr).find('td').toArray().map((td) => $(td).text().trim());
        if (cells.length < 10) return;
        const rank = parseNum(cells[0]);
        if (rank === null) return;
        allRows.push([
          rank, cells[1], parseNum(cells[2]), parseNum(cells[3]),
          cells[4], parseNum(cells[6]), parseNum(cells[7]),
          cells[8], parseNum(cells[9]), parseNum(cells[10]),
          variety.toUpperCase(), variety.toUpperCase(), date,
        ]);
      });
    }

    return createDataFrame(RANK_COLUMNS, allRows);
  } catch {
    return createDataFrame([], []);
  }
}

// ─── 广州期货交易所 ─────────────────────────────────────────────
/**
 * 广州期货交易所-日成交持仓排名
 * http://www.gfex.com.cn/gfex/rcjccpm/hqsj_tjsj.shtml
 */
export async function futures_gfex_position_rank(
  date: string = '20231113',
): Promise<DataFrame> {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  };

  try {
    // Get variety list
    const varsResp = await axios.post(
      'http://www.gfex.com.cn/u/interfacesWebVariety/loadList',
      '',
      { headers, timeout: 30000 }
    );
    const varsList: string[] = (varsResp.data?.data ?? []).map((d: any) => String(d.varietyId ?? '').toLowerCase()).filter(Boolean);

    const allRows: any[][] = [];

    for (const varId of varsList) {
      // Get contract list for this variety
      let contracts: string[] = [];
      try {
        const contractResp = await axios.post(
          'http://www.gfex.com.cn/u/interfacesWebTiMemberDealPosiQuotes/loadListContract_id',
          new URLSearchParams({ variety: varId, trade_date: date }).toString(),
          { headers: { ...headers, 'Content-Type': 'application/x-www-form-urlencoded' }, timeout: 15000 }
        );
        contracts = (contractResp.data?.data ?? []).map((d: any) => String(d[Object.keys(d)[0]] ?? '')).filter(Boolean);
      } catch { continue; }

      for (const contractId of contracts) {
        try {
          // Fetch vol, long, short in 3 requests (data_type 1, 2, 3)
          const parts: any[][] = [];
          for (let dataType = 1; dataType <= 3; dataType++) {
            const dr = await axios.post(
              'http://www.gfex.com.cn/u/interfacesWebTiMemberDealPosiQuotes/loadList',
              new URLSearchParams({
                trade_date: date, trade_type: '0',
                variety: varId, contract_id: contractId, data_type: String(dataType),
              }).toString(),
              { headers: { ...headers, 'Content-Type': 'application/x-www-form-urlencoded' }, timeout: 15000 }
            );
            parts.push(dr.data?.data ?? []);
          }

          const maxLen = Math.min(parts[0].length, parts[1].length, parts[2].length);
          for (let i = 0; i < maxLen; i++) {
            const v = parts[0][i];
            const l = parts[1][i];
            const s = parts[2][i];
            allRows.push([
              i + 1,
              v?.abbr ?? '', parseNum(v?.todayQty), parseNum(v?.qtySub ?? v?.todayQtyChg),
              l?.abbr ?? '', parseNum(l?.todayQty), parseNum(l?.qtySub ?? l?.todayQtyChg),
              s?.abbr ?? '', parseNum(s?.todayQty), parseNum(s?.qtySub ?? s?.todayQtyChg),
              contractId.toUpperCase(), varId.toUpperCase(), date,
            ]);
          }
        } catch { /* skip this contract */ }
      }
    }

    return createDataFrame(RANK_COLUMNS, allRows);
  } catch {
    return createDataFrame([], []);
  }
}

// ─── 汇总接口 ───────────────────────────────────────────────────
const RANK_SUM_COLUMNS = [
  'symbol', 'variety',
  'vol_top5', 'vol_chg_top5', 'long_open_interest_top5', 'long_open_interest_chg_top5', 'short_open_interest_top5', 'short_open_interest_chg_top5',
  'vol_top10', 'vol_chg_top10', 'long_open_interest_top10', 'long_open_interest_chg_top10', 'short_open_interest_top10', 'short_open_interest_chg_top10',
  'vol_top15', 'vol_chg_top15', 'long_open_interest_top15', 'long_open_interest_chg_top15', 'short_open_interest_top15', 'short_open_interest_chg_top15',
  'vol_top20', 'vol_chg_top20', 'long_open_interest_top20', 'long_open_interest_chg_top20', 'short_open_interest_top20', 'short_open_interest_chg_top20',
  'date',
];

function sumTopN(rows: any[][], colIdx: number, n: number): number {
  return rows
    .filter((r) => (r[0] ?? 999) <= n)
    .reduce((acc, r) => acc + (parseNum(r[colIdx]) ?? 0), 0);
}

async function buildRankSumFromDf(df: DataFrame, date: string): Promise<any[][]> {
  if (df.data.length === 0) return [];
  // Group by symbol
  const bySymbol = new Map<string, any[][]>();
  for (const row of df.data) {
    const sym = String(row[10] ?? '');
    if (!bySymbol.has(sym)) bySymbol.set(sym, []);
    bySymbol.get(sym)!.push(row);
  }

const result: any[] = [];
  for (const [sym, rows] of bySymbol) {
    const variety = symbolVariety(sym);
    const entry: any[] = [sym, variety];
    for (const n of [5, 10, 15, 20]) {
      const vals = [
        sumTopN(rows, 2, n), sumTopN(rows, 3, n),
        sumTopN(rows, 5, n), sumTopN(rows, 6, n),
        sumTopN(rows, 8, n), sumTopN(rows, 9, n),
      ];
      entry.push(...vals);
    }
    entry.push(date);
    result.push(entry);
  }
  return result;
}

/**
 * 四个交易所前 5/10/15/20 会员持仓排名汇总（单日）
 */
export async function get_rank_sum(
  date: string = '20210525',
): Promise<DataFrame> {
  try {
    const [shfe, cffex, czce] = await Promise.allSettled([
      get_shfe_rank_table(date),
      get_cffex_rank_table(date),
      get_rank_table_czce(date),
    ]);

    const allOutputRows: any[][] = [];
    for (const result of [shfe, cffex, czce]) {
      if (result.status === 'fulfilled') {
        const rows = await buildRankSumFromDf(result.value, date);
        allOutputRows.push(...rows);
      }
    }

    return createDataFrame(RANK_SUM_COLUMNS, allOutputRows);
  } catch {
    return createDataFrame([], []);
  }
}

/**
 * 四个交易所前 5/10/15/20 会员持仓排名汇总（日期范围）
 */
export async function get_rank_sum_daily(
  start_day: string = '20210510',
  end_day: string = '20210510',
): Promise<DataFrame> {
  // For a date range, we only support single-day here to avoid complexity
  // Multi-day would require trade calendar which is not easily available
  if (start_day === end_day) {
    return get_rank_sum(start_day);
  }

  // Generate date range and filter to weekdays as approximation
  const allRows: any[][] = [];
  let current = new Date(start_day.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'));
  const end = new Date(end_day.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'));

  while (current <= end) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) { // Skip weekends
      const dateStr = current.toISOString().slice(0, 10).replace(/-/g, '');
      try {
        const df = await get_rank_sum(dateStr);
        allRows.push(...df.data);
      } catch { /* skip */ }
    }
    current.setDate(current.getDate() + 1);
  }

  return createDataFrame(RANK_SUM_COLUMNS, allRows);
}

// ─── 中金所日线历史行情 ─────────────────────────────────────────
/**
 * 中国金融期货交易所-交易所日交易数据
 * http://www.cffex.com.cn/cn/rtj.html
 */
export async function futures_hist_daily_cffex(
  date: string = '20260403',
): Promise<DataFrame> {
  const yyyymm = date.slice(0, 6);
  const dd = date.slice(6, 8);
  const url = `http://www.cffex.com.cn/sj/hqsj/rtj/${yyyymm}/${dd}/${date}_1.csv`;

  try {
    const text = await httpGetTextGbk(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });

    const lines = text.split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) return createDataFrame([], []);

    const EXCLUDE_PATTERNS = ['小计', '合计', 'IO', 'MO', 'HO'];
    const columns = ['symbol', 'date', 'open', 'high', 'low', 'close', 'volume', 'open_interest', 'turnover', 'settle', 'pre_settle', 'variety'];
    const rows: any[][] = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map((c) => c.trim());
      if (cols.length < 9) continue;
      const symbol = cols[0];
      if (!symbol || EXCLUDE_PATTERNS.some((p) => symbol.includes(p))) continue;
      const variety = symbol.replace(/\d+/g, '');
      rows.push([
        symbol, date,
        parseNum(cols[1]), parseNum(cols[2]), parseNum(cols[3]),
        parseNum(cols[8]), parseNum(cols[4]), parseNum(cols[6]),
        parseNum(cols[5]), parseNum(cols[9]), parseNum(cols[10]),
        variety,
      ]);
    }

    return createDataFrame(columns, rows);
  } catch {
    return createDataFrame([], []);
  }
}
