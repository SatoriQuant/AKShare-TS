/**
 * AKShare TypeScript - 新浪股票数据接口
 */

import { httpGetText, httpGet } from '../utils/httpClient';
import { decodeSinaData } from '../utils/jsDecode';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

function parseLooseJsObject(text: string): any {
  const body = text.split('=')[1]?.split('\n')[0]?.trim();
  if (!body) {
    return null;
  }
  try {
    return JSON.parse(body);
  } catch {
    try {
      const fn = new Function(`return (${body});`);
      return fn();
    } catch {
      return null;
    }
  }
}

function formatDateString(value: any): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return date.toISOString().split('T')[0];
}

function toNumberOrNull(value: any): number | null {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function toPandasFloatString(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return '';
  }
  if (Math.abs(value % 1) < 1e-12) {
    return value.toFixed(1);
  }
  return String(value);
}

/**
 * 股票日线行情数据 - 新浪
 *
 * @param symbol 股票代码，如 "sh000001" 或 "sz000001"
 * @param startDate 开始日期
 * @param endDate 结束日期
 * @param adjust 复权类型：qfq 前复权, hfq 后复权, "" 不复权
 */
export async function stock_zh_a_daily(
  symbol: string = 'sh603843',
  startDate: string = '19900101',
  endDate: string = '21000118',
  adjust: 'qfq' | 'hfq' | '' | 'hfq-factor' | 'qfq-factor' = ''
): Promise<DataFrame> {
  const histUrl = `https://finance.sina.com.cn/realstock/company/${symbol}/hisdata_klc2/klc_kl.js`;
  const hfqUrl = `https://finance.sina.com.cn/realstock/company/${symbol}/hfq.js`;
  const qfqUrl = `https://finance.sina.com.cn/realstock/company/${symbol}/qfq.js`;
  const amountUrl = `https://stock.finance.sina.com.cn/stock/api/jsonp.php/var%20KKE_ShareAmount_${symbol}=/StockService.getAmountBySymbol?_=20&symbol=${symbol}`;

  const sliceStart = `${startDate.slice(0, 4)}-${startDate.slice(4, 6)}-${startDate.slice(6, 8)}`;
  const sliceEnd = `${endDate.slice(0, 4)}-${endDate.slice(4, 6)}-${endDate.slice(6, 8)}`;

  try {
    if (adjust === 'hfq-factor' || adjust === 'qfq-factor') {
      const factorMethod = adjust.split('-')[0];
      const factorText = await httpGetText(factorMethod === 'hfq' ? hfqUrl : qfqUrl);
      const factorObj = parseLooseJsObject(factorText);
      const factorData = Array.isArray(factorObj?.data) ? factorObj.data : [];
      const factorRows = factorData.map((item: any[]) => [
        formatDateString(item?.[0]),
        toNumberOrNull(item?.[1]),
      ]);
      return createDataFrame(['date', `${factorMethod}_factor`], factorRows);
    }

    const histText = await httpGetText(histUrl);
    const encoded = histText.split('=')[1]?.split(';')[0]?.replace(/"/g, '');
    if (!encoded) {
      return createDataFrame([], []);
    }

    const decoded = decodeSinaData(encoded);
    if (!Array.isArray(decoded) || decoded.length === 0) {
      return createDataFrame([], []);
    }

    const amountText = await httpGetText(amountUrl);
    const leftBracket = amountText.indexOf('[');
    const rightBracket = amountText.lastIndexOf(']');
    let amountData: any[] = [];
    if (leftBracket >= 0 && rightBracket > leftBracket) {
      const amountPart = amountText.slice(leftBracket, rightBracket + 1);
      try {
        amountData = JSON.parse(amountPart);
      } catch {
        try {
          const fn = new Function(`return (${amountPart});`);
          amountData = fn();
        } catch {
          amountData = [];
        }
      }
    }

    const amountMap = new Map<string, number>();
    for (const item of amountData) {
      const d = formatDateString(item?.date ?? item?.[0]);
      const v = toNumberOrNull(item?.amount ?? item?.[1]);
      if (d && v !== null) {
        amountMap.set(d, v);
      }
    }

    const normalized = decoded
      .map((item: any) => {
        const d = formatDateString(item?.date);
        const open = toNumberOrNull(item?.open);
        const high = toNumberOrNull(item?.high);
        const low = toNumberOrNull(item?.low);
        const close = toNumberOrNull(item?.close);
        const volume = toNumberOrNull(item?.volume);
        const amount = toNumberOrNull(item?.amount);
        if (!d || open === null || high === null || low === null || close === null || volume === null || amount === null) {
          return null;
        }
        return { d, open, high, low, close, volume, amount };
      })
      .filter((item): item is { d: string; open: number; high: number; low: number; close: number; volume: number; amount: number } => item !== null)
      .sort((a, b) => a.d.localeCompare(b.d));

    if (normalized.length === 0) {
      return createDataFrame([], []);
    }

    // 前向填充流通股本
    let lastOutstanding: number | null = null;
    const withOutstanding = normalized.map((item) => {
      const current = amountMap.get(item.d);
      if (current !== undefined) {
        lastOutstanding = current;
      }
      const outstanding = lastOutstanding !== null ? lastOutstanding * 10000 : null;
      const turnover = outstanding && outstanding !== 0 ? item.volume / outstanding : null;
      return {
        ...item,
        outstanding,
        turnover,
      };
    });

    let adjustedRows = withOutstanding;
    if (adjust === 'hfq' || adjust === 'qfq') {
      const factorText = await httpGetText(adjust === 'hfq' ? hfqUrl : qfqUrl);
      const factorObj = parseLooseJsObject(factorText);
      const factorData = Array.isArray(factorObj?.data) ? factorObj.data : [];
      const factorMap = new Map<string, number>();
      for (const item of factorData) {
        const d = formatDateString(item?.[0]);
        const factor = toNumberOrNull(item?.[1]);
        if (d && factor !== null) {
          factorMap.set(d, factor);
        }
      }

      let lastFactor: number | null = null;
      adjustedRows = withOutstanding
        .map((item) => {
          const current = factorMap.get(item.d);
          if (current !== undefined) {
            lastFactor = current;
          }
          if (lastFactor === null) {
            return null;
          }

          const f = lastFactor;
          const open = adjust === 'hfq' ? item.open * f : item.open / f;
          const high = adjust === 'hfq' ? item.high * f : item.high / f;
          const low = adjust === 'hfq' ? item.low * f : item.low / f;
          const close = adjust === 'hfq' ? item.close * f : item.close / f;

          return {
            ...item,
            open,
            high,
            low,
            close,
          };
        })
        .filter((item): item is typeof withOutstanding[number] => item !== null);
    }

    const rows = adjustedRows
      .filter((item) => item.d >= sliceStart && item.d <= sliceEnd)
      .map((item) => [
        item.d,
        Number(item.open.toFixed(2)),
        Number(item.high.toFixed(2)),
        Number(item.low.toFixed(2)),
        Number(item.close.toFixed(2)),
        toPandasFloatString(item.volume),
        toPandasFloatString(item.amount),
        toPandasFloatString(item.outstanding),
        item.turnover === null ? '' : String(item.turnover),
      ]);

    return createDataFrame(
      ['date', 'open', 'high', 'low', 'close', 'volume', 'amount', 'outstanding_share', 'turnover'],
      rows
    );
  } catch (error) {
    return createDataFrame([], []);
  }
}

/**
 * 获取A股实时行情 - 新浪
 *
 * @param symbols 股票代码列表，如 ["sh000001", "sz000002"]
 */
export async function stock_zh_a_spot_sina(
  symbols: string[]
): Promise<DataFrame> {
  if (symbols.length === 0) {
    return createDataFrame([], []);
  }

  const symbolStr = symbols.join(',');
  const url = `https://hq.sinajs.cn/list=${symbolStr}`;

  try {
    const text = await httpGetText(url, {
      headers: {
        Referer: 'https://finance.sina.com.cn',
      },
    });

    const lines = text.split('\n').filter(line => line.trim());
    const columns = [
      '代码', '名称', '今开', '昨收', '最新价', '最高', '最低',
      '买一', '卖一', '成交量', '成交额', '时间'
    ];

    const rows = lines.map(line => {
      const match = line.match(/var hq_str_(\w+)="(.*)"/);
      if (!match) return null;

      const code = match[1];
      const data = match[2].split(',');

      return [
        code,
        data[0],           // 名称
        parseFloat(data[1]), // 今开
        parseFloat(data[2]), // 昨收
        parseFloat(data[3]), // 最新价
        parseFloat(data[4]), // 最高
        parseFloat(data[5]), // 最低
        parseFloat(data[6]), // 买一
        parseFloat(data[7]), // 卖一
        parseInt(data[8]),   // 成交量
        parseFloat(data[9]), // 成交额
        data[30] + ' ' + data[31], // 时间
      ];
    }).filter(row => row !== null);

    return createDataFrame(columns, rows as any[][]);
  } catch (error) {
    return createDataFrame([], []);
  }
}

/**
 * 获取股票分钟级行情 - 新浪
 *
 * @param symbol 股票代码，如 "sh000001"
 * @param period 周期：1, 5, 15, 30, 60 分钟
 */
export async function stock_zh_a_minute(
  symbol: string = 'sh600519',
  period: 1 | 5 | 15 | 30 | 60 | string = '1',
  adjust: 'qfq' | 'hfq' | '' = ''
): Promise<DataFrame> {
  const periodStr = String(period);
  const baseUrl = 'https://quotes.sina.cn/cn/api/jsonp_v2.php/=/CN_MarketDataService.getKLineData';

  const params = {
    symbol,
    scale: periodStr,
    ma: 'no',
    datalen: '1970',
  };

  try {
    let text = await httpGetText(baseUrl, { params });
    let payload = text.split('=(')[1]?.split(');')[0];

    if (!payload) {
      const fallbackUrl = `https://quotes.sina.cn/cn/api/jsonp_v2.php/var%20_${symbol}_${periodStr}_1658852984203=/CN_MarketDataService.getKLineData`;
      text = await httpGetText(fallbackUrl, { params });
      payload = text.split('=(')[1]?.split(');')[0];
    }

    if (!payload) {
      return createDataFrame([], []);
    }

    const dataJson = JSON.parse(payload);
    let rows = (Array.isArray(dataJson) ? dataJson : []).map((item: any) => [
      item?.day ?? '',
      item?.open ?? '',
      item?.high ?? '',
      item?.low ?? '',
      item?.close ?? '',
      item?.volume ?? '',
      item?.amount ?? '',
    ]);

    if (rows.length === 0) {
      return createDataFrame([], []);
    }

    if (adjust === 'qfq' || adjust === 'hfq') {
      const dayCloseMap = new Map<string, number>();
      for (const row of rows) {
        const [dayTime, , , , close] = row;
        const [datePart, timePart] = String(dayTime).split(' ');
        if (!datePart || !timePart) continue;
        if (timePart >= '09:31:00' && timePart <= '15:00:00') {
          const c = Number(close);
          if (Number.isFinite(c)) {
            dayCloseMap.set(datePart, c);
          }
        }
      }

      const dailyDf = await stock_zh_a_daily(symbol, '19900101', '21000118', adjust);
      const dailyRows = dailyDf.data;
      const dailyCloseByDate = new Map<string, number>();
      for (const row of dailyRows) {
        const d = String(row[0] ?? '');
        const c = Number(row[4]);
        if (d && Number.isFinite(c)) {
          dailyCloseByDate.set(d, c);
        }
      }

      rows = rows.map((row) => {
        const [dayTime, open, high, low, close, volume, amount] = row;
        const datePart = String(dayTime).split(' ')[0] || '';
        const minClose = dayCloseMap.get(datePart);
        const dailyClose = dailyCloseByDate.get(datePart);

        if (minClose && dailyClose && minClose !== 0) {
          const ratio = dailyClose / minClose;
          return [
            dayTime,
            Number(Number(open) * ratio),
            Number(Number(high) * ratio),
            Number(Number(low) * ratio),
            Number(Number(close) * ratio),
            volume,
            amount,
          ];
        }
        return row;
      });
    }

    return createDataFrame(['day', 'open', 'high', 'low', 'close', 'volume', 'amount'], rows);
  } catch (error) {
    return createDataFrame([], []);
  }
}

/**
 * 获取股票历史分笔数据 - 新浪
 *
 * @param symbol 股票代码，如 "sh000001"
 * @param date 日期，格式 "2024-01-01"
 */
export async function stock_zh_a_tick_sina(
  symbol: string,
  date: string
): Promise<DataFrame> {
  const market = symbol.startsWith('sh') ? 'sh' : 'sz';
  const code = symbol.replace(/^(sh|sz)/, '');
  const dateStr = date.replace(/-/g, '');

  const url = `https://vip.stock.finance.sina.com.cn/quotes_service/api/json_v2.php/CN_Transactions.getAllPageTime`;

  const params = {
    date: dateStr,
    symbol: `${market}${code}`,
  };

  try {
    const text = await httpGetText(url, { params });

    // 解析响应
    const data = JSON.parse(text);

    const columns = ['时间', '价格', '成交量', '类型'];
    const rows = data.map((item: any) => [
      item.ticktime,
      parseFloat(item.price),
      parseInt(item.volume),
      item.type,
    ]);

    return createDataFrame(columns, rows);
  } catch (error) {
    return createDataFrame([], []);
  }
}
