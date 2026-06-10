/**
 * AKShare TypeScript - 基金投资组合数据接口
 * 天天基金网-基金档案-投资组合
 * https://fundf10.eastmoney.com/ccmx_000001.html
 */

import { httpGetText } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

function parseLooseObject(text: string): any {
  const start = text.indexOf('{');
  if (start === -1) {
    return null;
  }
  const body = text.slice(start).replace(/;\s*$/, '');
  try {
    return JSON.parse(body);
  } catch {
    const fn = new Function(`return (${body});`);
    return fn();
  }
}

/**
 * 获取基金持仓数据 - 东方财富
 * https://fundf10.eastmoney.com/ccmx_000001.html
 *
 * @param symbol 基金代码
 * @param date 查询年份
 */
export async function fund_portfolio_hold_em(
  symbol: string = '000001',
  date: string = '2024'
): Promise<DataFrame> {
  const url = 'https://fundf10.eastmoney.com/FundArchivesDatas.aspx';
  const params = {
    type: 'jjcc',
    code: symbol,
    topline: '10000',
    year: date,
    month: '',
    rt: Math.random().toString(),
  };

  try {
    const text = await httpGetText(url, { params });
    const data = parseLooseObject(text);

    if (!data?.content) {
      return createDataFrame([], []);
    }

    const html = data.content as string;

    // 提取季度标签
    const h4Regex = /<h4 class='t'>([\s\S]*?)<\/h4>/g;
    const quarters: string[] = [];
    let h4Match;
    while ((h4Match = h4Regex.exec(html)) !== null) {
      const h4Text = h4Match[1].replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
      // Extract the full label like "2024年1季度股票投资明细"
      const qMatch = h4Text.match(/(\d{4}年\d{1,2}季度[^ ]*)/);
      if (qMatch) {
        quarters.push(qMatch[1]);
      }
    }

    // 解析表格数据
    const tableRegex = /<table[^>]*>([\s\S]*?)<\/table>/gi;
    const tables: string[] = [];
    let tableMatch;
    while ((tableMatch = tableRegex.exec(html)) !== null) {
      tables.push(tableMatch[1]);
    }

    const columns = [
      '序号', '股票代码', '股票名称', '占净值比例', '持股数', '持仓市值', '季度',
    ];

    const rows: any[][] = [];
    let seqNum = 1;

    for (let i = 0; i < tables.length; i++) {
      const tableHtml = tables[i];
      const quarter = quarters[i] || `季度${i + 1}`;

      const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
      let rowMatch;
      let isHeader = true;

      while ((rowMatch = rowRegex.exec(tableHtml)) !== null) {
        if (isHeader) {
          isHeader = false;
          continue;
        }

        const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
        const cells: string[] = [];
        let cellMatch;
        while ((cellMatch = cellRegex.exec(rowMatch[1])) !== null) {
          cells.push(cellMatch[1].replace(/<[^>]*>/g, '').trim());
        }

        if (cells.length >= 6) {
          rows.push([
            String(seqNum++),
            cells[1] || '',
            cells[2] || '',
            (cells[4] || '').replace('%', ''),
            cells[5] || '',
            (cells[6] || '').replace(/,/g, ''),
            quarter,
          ]);
        }
      }
    }

    return createDataFrame(columns, rows);
  } catch (error) {
    return createDataFrame([], []);
  }
}

/**
 * 获取基金行业配置数据 - 东方财富
 * https://fundf10.eastmoney.com/hytz_000001.html
 *
 * @param symbol 基金代码
 * @param date 查询年份
 */
export async function fund_portfolio_industry_allocation_em(
  symbol: string = '000001',
  date: string = '2023'
): Promise<DataFrame> {
  const url = 'https://api.fund.eastmoney.com/f10/HYPZ/';
  const params = {
    fundCode: symbol,
    year: date,
    callback: 'jQuery183006997159478989867_1648016188499',
  };

  try {
    const text = await httpGetText(url, {
      params,
      headers: {
        Referer: 'https://fundf10.eastmoney.com/',
      },
    });

    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    if (jsonStart === -1 || jsonEnd === -1) {
      return createDataFrame([], []);
    }

    const data = JSON.parse(text.slice(jsonStart, jsonEnd + 1));

    if (!data?.Data?.QuarterInfos) {
      return createDataFrame([], []);
    }

    const allItems: any[] = [];
    for (const quarter of data.Data.QuarterInfos) {
      if (quarter.HYPZInfo) {
        allItems.push(...quarter.HYPZInfo);
      }
    }

    const columns = [
      '序号', '行业类别', '占净值比例', '市值', '截止时间',
    ];

    const rows = allItems.map((item: any, index: number) => [
      index + 1,
      item.HYMC || '',
      parseFloat(item.ZJZBL) || null,
      parseFloat(item.MV) || null,
      item.RQ || '',
    ]);

    return createDataFrame(columns, rows);
  } catch (error) {
    return createDataFrame([], []);
  }
}

/**
 * 获取基金债券持仓数据 - 东方财富
 * https://fundf10.eastmoney.com/ccmx1_000001.html
 *
 * @param symbol 基金代码
 * @param date 查询年份
 */
export async function fund_portfolio_bond_hold_em(
  symbol: string = '000001',
  date: string = '2023'
): Promise<DataFrame> {
  const url = 'https://fundf10.eastmoney.com/FundArchivesDatas.aspx';
  const params = {
    type: 'zqcc',
    code: symbol,
    year: date,
    rt: Math.random().toString(),
  };

  try {
    const text = await httpGetText(url, { params });
    const data = parseLooseObject(text);

    if (!data?.content) {
      return createDataFrame([], []);
    }

    const html = data.content as string;

    // 提取季度标签
    const h4Regex = /<h4 class='t'>([\s\S]*?)<\/h4>/g;
    const quarters: string[] = [];
    let h4Match;
    while ((h4Match = h4Regex.exec(html)) !== null) {
      const h4Text = h4Match[1].replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
      // Extract the full label like "2023年4季度债券投资明细"
      const qMatch = h4Text.match(/(\d{4}年\d{1,2}季度[^ ]*)/);
      if (qMatch) {
        quarters.push(qMatch[1]);
      }
    }

    // 解析表格数据
    const tableRegex = /<table[^>]*>([\s\S]*?)<\/table>/gi;
    const tables: string[] = [];
    let tableMatch;
    while ((tableMatch = tableRegex.exec(html)) !== null) {
      tables.push(tableMatch[1]);
    }

    const columns = [
      '序号', '债券代码', '债券名称', '占净值比例', '持仓市值', '季度',
    ];

    const rows: any[][] = [];
    let seqNum = 1;

    for (let i = 0; i < tables.length; i++) {
      const tableHtml = tables[i];
      const quarter = quarters[i] || `季度${i + 1}`;

      const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
      let rowMatch;
      let isHeader = true;

      while ((rowMatch = rowRegex.exec(tableHtml)) !== null) {
        if (isHeader) {
          isHeader = false;
          continue;
        }

        const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
        const cells: string[] = [];
        let cellMatch;
        while ((cellMatch = cellRegex.exec(rowMatch[1])) !== null) {
          cells.push(cellMatch[1].replace(/<[^>]*>/g, '').trim());
        }

        if (cells.length >= 4) {
          rows.push([
            String(seqNum++),
            cells[1] || '',
            cells[2] || '',
            (cells[3] || '').replace('%', ''),
            (cells[4] || '').replace(/,/g, ''),
            quarter,
          ]);
        }
      }
    }

    return createDataFrame(columns, rows);
  } catch (error) {
    return createDataFrame([], []);
  }
}

/**
 * 获取基金重大变动数据 - 东方财富
 * https://fundf10.eastmoney.com/ccbd_000001.html
 *
 * @param symbol 基金代码
 * @param indicator 累计买入 或 累计卖出
 * @param date 查询年份
 */
export async function fund_portfolio_change_em(
  symbol: string = '003567',
  indicator: '累计买入' | '累计卖出' = '累计买入',
  date: string = '2023'
): Promise<DataFrame> {
  const indicatorMap: Record<string, string> = {
    '累计买入': '1',
    '累计卖出': '2',
  };

  const url = 'https://fundf10.eastmoney.com/FundArchivesDatas.aspx';
  const params = {
    type: 'zdbd',
    code: symbol,
    zdbd: indicatorMap[indicator],
    year: date,
    rt: Math.random().toString(),
  };

  try {
    const text = await httpGetText(url, { params });
    const data = parseLooseObject(text);

    if (!data?.content) {
      return createDataFrame([], []);
    }

    const html = data.content as string;

    // 提取季度标签
    const h4Regex = /<h4 class='t'>([\s\S]*?)<\/h4>/g;
    const quarters: string[] = [];
    let h4Match;
    while ((h4Match = h4Regex.exec(html)) !== null) {
      const h4Text = h4Match[1].replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
      const qMatch = h4Text.match(/(\d{4}年\d{1,2}季度[^ ]*)/);
      if (qMatch) {
        quarters.push(qMatch[1]);
      }
    }

    // 解析表格
    const tableRegex = /<table[^>]*>([\s\S]*?)<\/table>/gi;
    const tables: string[] = [];
    let tableMatch;
    while ((tableMatch = tableRegex.exec(html)) !== null) {
      tables.push(tableMatch[1]);
    }

    const columns = [
      '序号', '股票代码', '股票名称', '本期累计买入金额', '占期初基金资产净值比例', '季度',
    ];

    const rows: any[][] = [];
    let seqNum = 1;

    for (let i = 0; i < tables.length; i++) {
      const tableHtml = tables[i];
      const quarter = quarters[i] || `季度${i + 1}`;

      const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
      let rowMatch;
      let isHeader = true;

      while ((rowMatch = rowRegex.exec(tableHtml)) !== null) {
        if (isHeader) {
          isHeader = false;
          continue;
        }

        const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
        const cells: string[] = [];
        let cellMatch;
        while ((cellMatch = cellRegex.exec(rowMatch[1])) !== null) {
          cells.push(cellMatch[1].replace(/<[^>]*>/g, '').trim());
        }

        if (cells.length >= 5) {
          rows.push([
            String(seqNum++),
            cells[1] || '',
            cells[2] || '',
            (cells[4] || '').replace(/,/g, ''),
            (cells[5] || '').replace('%', ''),
            quarter,
          ]);
        }
      }
    }

    return createDataFrame(columns, rows);
  } catch (error) {
    return createDataFrame([], []);
  }
}
