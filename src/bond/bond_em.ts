/**
 * AKShare TypeScript - 东方财富债券数据接口
 * 东方财富网-数据中心-经济数据-中美国债收益率
 * https://data.eastmoney.com/cjsj/zmgzsyl.html
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  DataFrame,
} from '../utils/dataframe';

/**
 * 东方财富网-数据中心-经济数据-中美国债收益率
 * https://data.eastmoney.com/cjsj/zmgzsyl.html
 *
 * @param startDate 开始统计时间，格式 "19901219"
 */
export async function bond_zh_us_rate_em(
  startDate: string = '19901219'
): Promise<DataFrame> {
  const url = 'https://datacenter.eastmoney.com/api/data/get';

  try {
    // First request to get total pages
    const firstParams = {
      type: 'RPTA_WEB_TREASURYYIELD',
      sty: 'ALL',
      st: 'SOLAR_DATE',
      sr: '-1',
      token: '894050c76af8597a853f5b408b759f5d',
      p: '1',
      ps: '500',
      pageNo: '1',
      pageNum: '1',
    };

    const firstData = await httpGet<any>(url, { params: firstParams });
    const totalPages = firstData?.result?.pages || 1;

    const allRows: any[][] = [];
    const startTimestamp = new Date(
      `${startDate.slice(0, 4)}-${startDate.slice(4, 6)}-${startDate.slice(6, 8)}`
    ).getTime();

    for (let page = 1; page <= totalPages; page++) {
      const params = {
        type: 'RPTA_WEB_TREASURYYIELD',
        sty: 'ALL',
        st: 'SOLAR_DATE',
        sr: '-1',
        token: '894050c76af8597a853f5b408b759f5d',
        p: String(page),
        ps: '500',
        pageNo: String(page),
        pageNum: String(page),
      };

      try {
        const data = await httpGet<any>(url, { params });

        if (!data?.result?.data) {
          continue;
        }

        for (const item of data.result.data) {
          const dateStr = item.SOLAR_DATE;
          const itemDate = new Date(dateStr).getTime();

          allRows.push([
            dateStr,
            item.EMM00588704 || null,  // 中国国债收益率2年
            item.EMM00166462 || null,  // 中国国债收益率5年
            item.EMM00166466 || null,  // 中国国债收益率10年
            item.EMM00166469 || null,  // 中国国债收益率30年
            item.EMM01276014 || null,  // 中国国债收益率10年-2年
            item.EMM00000024 || null,  // 中国GDP年增率
            item.EMG00001306 || null,  // 美国国债收益率2年
            item.EMG00001308 || null,  // 美国国债收益率5年
            item.EMG00001310 || null,  // 美国国债收益率10年
            item.EMG00001312 || null,  // 美国国债收益率30年
            item.EMG01339436 || null,  // 美国国债收益率10年-2年
            item.EMG0159635 || null,   // 美国GDP年增率
          ]);

          // Check if we've reached the start date
          if (itemDate <= startTimestamp) {
            break;
          }
        }

        // Check last item date
        const lastItem = data.result.data[data.result.data.length - 1];
        if (lastItem) {
          const lastDate = new Date(lastItem.SOLAR_DATE).getTime();
          if (lastDate <= startTimestamp) {
            break;
          }
        }
      } catch {
        continue;
      }
    }

    // Sort by date ascending
    allRows.sort((a, b) => {
      const dateA = new Date(a[0] as string).getTime();
      const dateB = new Date(b[0] as string).getTime();
      return dateA - dateB;
    });

    // Filter by start date
    const filteredRows = allRows.filter((row) => {
      const rowDate = new Date(row[0] as string).getTime();
      return rowDate >= startTimestamp;
    });

    const columns = [
      '日期',
      '中国国债收益率2年',
      '中国国债收益率5年',
      '中国国债收益率10年',
      '中国国债收益率30年',
      '中国国债收益率10年-2年',
      '中国GDP年增率',
      '美国国债收益率2年',
      '美国国债收益率5年',
      '美国国债收益率10年',
      '美国国债收益率30年',
      '美国国债收益率10年-2年',
      '美国GDP年增率',
    ];

    return createDataFrame(columns, filteredRows);
  } catch (error) {
    return createDataFrame([], []);
  }
}
