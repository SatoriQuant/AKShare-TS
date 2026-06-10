/**
 * AKShare TypeScript - 集思录可转债数据接口
 * 集思录：https://www.jisilu.cn/data/cbnew/#cb
 */

import { httpGet, httpGetText, httpPost } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 获取集思录可转债等权指数
 * https://www.jisilu.cn/web/data/cb/index
 */
export async function bond_cb_index_jsl(): Promise<DataFrame> {
  const url = 'https://www.jisilu.cn/webapi/cb/index_history/';

  try {
    const text = await httpGetText(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        Referer: 'https://www.jisilu.cn/web/data/cb/index',
      },
    });
    const data = JSON.parse(text);

    if (!data?.data || typeof data.data !== 'object') {
      return createDataFrame([], []);
    }

    const columns = Object.keys(data.data);
    const rowCount = Array.isArray(data.data[columns[0]]) ? data.data[columns[0]].length : 0;
    const rows = Array.from({ length: rowCount }, (_, index) => columns.map((col) => data.data[col]?.[index] ?? ''));

    return createDataFrame(columns, rows);
  } catch (error) {
    return createDataFrame([], []);
  }
}

/**
 * 获取集思录可转债强赎数据
 * https://www.jisilu.cn/data/cbnew/#redeem
 */
export async function bond_cb_redeem_jsl(): Promise<DataFrame> {
  const url = 'https://www.jisilu.cn/data/cbnew/redeem_list/';
  const params = {
    ___jsl: 'LST___t=1653394005966',
  };

  const payload = {
    rp: '50',
  };

  const headers: Record<string, string> = {
    'Accept': 'application/json, text/javascript, */*; q=0.01',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    'Cache-Control': 'no-cache',
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'Origin': 'https://www.jisilu.cn',
    'Pragma': 'no-cache',
    'Referer': 'https://www.jisilu.cn/data/cbnew/',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.67 Safari/537.36',
    'X-Requested-With': 'XMLHttpRequest',
  };

  try {
    const data = await httpPost<any>(url, payload, {
      params,
      headers,
    });

    if (!data?.rows) {
      return createDataFrame([], []);
    }

    const columns = [
      '代码', '名称', '现价', '正股代码', '正股名称', '规模', '剩余规模',
      '转股起始日', '最后交易日', '到期日', '转股价', '强赎触发比', '强赎触发价',
      '正股价', '强赎价', '强赎天计数', '强赎条款', '强赎状态'
    ];

    const statusMap: Record<string, string> = {
      'R': '已公告强赎',
      'O': '公告要强赎',
      'G': '公告不强赎',
      'B': '已满足强赎条件',
      '': '',
    };

    const rows = data.rows.map((item: any) => {
      const cell = item.cell;
      return [
        cell.bond_id,
        cell.bond_nm,
        parseFloat(cell.price) || null,
        cell.stock_id,
        cell.stock_nm,
        parseFloat(cell.orig_iss_amt) || null,
        parseFloat(cell.curr_iss_amt) || null,
        cell.convert_dt,
        cell.delist_dt,
        cell.maturity_dt,
        parseFloat(cell.convert_price) || null,
        parseFloat(cell.redeem_price_ratio) || null,
        parseFloat(cell.force_redeem_price) || null,
        parseFloat(cell.sprice) || null,
        parseFloat(cell.real_force_redeem_price) || null,
        cell.redeem_count_days,
        cell.redeem_tc,
        statusMap[cell.redeem_icon] || cell.redeem_icon,
      ];
    });

    return createDataFrame(columns, rows);
  } catch (error) {
    return createDataFrame([], []);
  }
}

/**
 * 获取可转债转股价调整记录
 * https://www.jisilu.cn/data/cbnew/#cb
 *
 * @param symbol 可转债代码
 */
export async function bond_cb_adj_logs_jsl(symbol: string = '128013'): Promise<DataFrame> {
  const url = `https://www.jisilu.cn/data/cbnew/adj_logs/?bond_id=${symbol}`;

  try {
    const html = await httpGet<string>(url, {
      responseType: 'text',
    });

    if (typeof html !== 'string' || !html.includes('</table>')) {
      return createDataFrame([], []);
    }

    // 简单的HTML表格解析
    const rows: string[][] = [];
    const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    const cellRegex = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi;

    let rowMatch;
    while ((rowMatch = rowRegex.exec(html)) !== null) {
      const cells: string[] = [];
      let cellMatch;
      while ((cellMatch = cellRegex.exec(rowMatch[1])) !== null) {
        cells.push(cellMatch[1].replace(/<[^>]+>/g, '').trim());
      }
      if (cells.length > 0) {
        rows.push(cells);
      }
    }

    if (rows.length === 0) {
      return createDataFrame([], []);
    }

    const columns = rows[0];
    const data = rows.slice(1);

    return createDataFrame(columns, data);
  } catch (error) {
    return createDataFrame([], []);
  }
}
