/**
 * AKShare TypeScript - 中国外汇交易中心债券数据接口
 * 收盘收益率曲线历史数据 / FR007利率互换曲线 / 债券发行
 * https://www.chinamoney.com.cn/chinese/bkcurvclosedyhis/
 */

import { httpGet, httpPost } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * FR007 利率互换曲线历史数据
 * https://www.chinamoney.com.cn/chinese/bkcurvfxhis/?cfgItemType=72&curveType=FR007
 *
 * @param startDate 开始日期，格式 "20231101"（开始和结束日期不得超过一个月）
 * @param endDate 结束日期，格式 "20231204"
 */
export async function macro_china_swap_rate(
  startDate: string = '20231101',
  endDate: string = '20231204'
): Promise<DataFrame> {
  const url =
    'https://www.chinamoney.com.cn/ags/ms/cm-u-bk-shibor/IfccHis';

  const formattedStart = `${startDate.slice(0, 4)}-${startDate.slice(4, 6)}-${startDate.slice(6, 8)}`;
  const formattedEnd = `${endDate.slice(0, 4)}-${endDate.slice(4, 6)}-${endDate.slice(6, 8)}`;

  const payload = {
    cfgItemType: '72',
    interestRateType: '0',
    startDate: formattedStart,
    endDate: formattedEnd,
    bidAskType: '',
    lang: 'CN',
    quoteTime: '全部',
    pageSize: '5000',
    pageNum: '1',
  };

  try {
    const data = await httpPost<any>(url, payload, {
      headers: {
        Accept: 'application/json, text/javascript, */*; q=0.01',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'Content-Length': '0',
        Host: 'www.chinamoney.com.cn',
        Origin: 'https://www.chinamoney.com.cn',
        Pragma: 'no-cache',
        Referer:
          'https://www.chinamoney.com.cn/chinese/bkcurvfxhis/?cfgItemType=72&curveType=FR007',
        'sec-ch-ua':
          '"Google Chrome";v="107", "Chromium";v="107", "Not=A?Brand";v="24"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36',
        'X-Requested-With': 'XMLHttpRequest',
      },
    });

    if (!data?.records) {
      return createDataFrame([], []);
    }

    const columns = [
      '日期', '曲线名称', '时刻', '价格类型',
      '1M', '3M', '6M', '9M', '1Y', '2Y', '3Y', '4Y', '5Y', '7Y', '10Y',
    ];

    const rows = data.records.map((item: any) => {
      const priceData = item.data || {};
      return [
        item.dateValue || item[0] || null,
        item.curveName || item[11] || null,
        item.quoteTime || item[3] || null,
        item.priceType || item[9] || null,
        parseFloat(priceData['1M']) || null,
        parseFloat(priceData['3M']) || null,
        parseFloat(priceData['6M']) || null,
        parseFloat(priceData['9M']) || null,
        parseFloat(priceData['1Y']) || null,
        parseFloat(priceData['2Y']) || null,
        parseFloat(priceData['3Y']) || null,
        parseFloat(priceData['4Y']) || null,
        parseFloat(priceData['5Y']) || null,
        parseFloat(priceData['7Y']) || null,
        parseFloat(priceData['10Y']) || null,
      ];
    });

    return createDataFrame(columns, rows);
  } catch (error) {
    return createDataFrame([], []);
  }
}

/**
 * 中国-债券信息披露-债券发行
 * https://www.chinamoney.com.cn/chinese/xzjfx/
 */
export async function macro_china_bond_public(): Promise<DataFrame> {
  const url =
    'https://www.chinamoney.com.cn/ags/ms/cm-u-bond-an/bnBondEmit';

  try {
    // First request to get total pages
    const firstPayload = {
      enty: '',
      bondType: '',
      bondNameCode: '',
      leadUnderwriter: '',
      pageNo: '1',
      pageSize: '10',
      limit: '1',
    };

    const firstData = await httpPost<any>(url, firstPayload, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36',
      },
    });

    const totalPages = (firstData?.data?.pageTotalSize || 0) + 1;
    const allRows: any[][] = [];

    for (let page = 1; page < totalPages; page++) {
      const payload = {
        enty: '',
        bondType: '',
        bondNameCode: '',
        leadUnderwriter: '',
        pageNo: String(page),
        pageSize: '10',
        limit: '1',
      };

      try {
        const data = await httpPost<any>(url, payload, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36',
          },
        });

        if (data?.records) {
          for (const item of data.records) {
            allRows.push([
              item.bondFullName || null,     // 债券全称
              item.bondType || null,         // 债券类型
              item.issueStartDate || null,   // 发行日期
              item.interestType || null,     // 计息方式
              parseFloat(item.price) || null, // 价格
              item.term || null,             // 债券期限
              parseFloat(item.planIssueAmt) || null, // 计划发行量
              item.debtRating || null,       // 债券评级
            ]);
          }
        }
      } catch {
        continue;
      }
    }

    const columns = [
      '债券全称', '债券类型', '发行日期', '计息方式',
      '价格', '债券期限', '计划发行量', '债券评级',
    ];

    return createDataFrame(columns, allRows);
  } catch (error) {
    return createDataFrame([], []);
  }
}
