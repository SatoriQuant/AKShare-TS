/**
 * AKShare TypeScript - 玄田数据-生猪期货相关数据
 * https://zhujia.zhuwang.com.cn
 */

import { httpPost } from '../utils/httpClient';
import { createDataFrame, DataFrame } from '../utils/dataframe';

/**
 * 玄田数据-核心数据（生猪价格）
 * https://zhujia.zhuwang.com.cn
 *
 * @param symbol 品种，choice of {"外三元", "内三元", "土杂猪"}
 */
export async function futures_hog_core(
  symbol: '外三元' | '内三元' | '土杂猪' = '外三元'
): Promise<DataFrame> {
  const ptypeMap: Record<string, string> = {
    '外三元': '1',
    '内三元': '2',
    '土杂猪': '3',
  };

  const url = 'https://xt.yangzhu.vip/data/getzhujiahitsdata';
  const params = {
    ptype: ptypeMap[symbol],
    areano: '-1',
    datetype: '0',
  };

  const data = await httpPost<any>(url, null, { params });

  if (!data?.data) {
    return createDataFrame([], []);
  }

  const columns = ['日期', '价格'];
  const rows = data.data.map((item: any) => {
    // API 返回 [value, date] 格式
    const value = Array.isArray(item) ? item[0] : item.value;
    const date = Array.isArray(item) ? item[1] : item.date;
    return [date, parseFloat(value) || 0];
  });

  return createDataFrame(columns, rows);
}

/**
 * 玄田数据-成本维度
 * https://zhujia.zhuwang.com.cn
 *
 * @param symbol 品种，choice of {"玉米", "豆粕", "二元母猪价格", "仔猪价格"}
 */
export async function futures_hog_cost(
  symbol: '玉米' | '豆粕' | '二元母猪价格' | '仔猪价格' = '玉米'
): Promise<DataFrame> {
  const coreSymbols = ['玉米', '豆粕'];
  const mapSymbols = ['二元母猪价格', '仔猪价格'];

  if (coreSymbols.includes(symbol)) {
    const ptypeMap: Record<string, string> = {
      '玉米': '4',
      '豆粕': '5',
    };

    const url = 'https://xt.yangzhu.vip/data/getzhujiahitsdata';
    const params = {
      ptype: ptypeMap[symbol],
      areano: '-1',
      datetype: '0',
    };

    const data = await httpPost<any>(url, null, { params });

    if (!data?.data) {
      return createDataFrame([], []);
    }

    const columns = ['日期', '价格'];
    const rows = data.data.map((item: any) => {
      const value = Array.isArray(item) ? item[0] : item.value;
      const date = Array.isArray(item) ? item[1] : item.date;
      return [date, parseFloat(value) || 0];
    });

    return createDataFrame(columns, rows);
  } else if (mapSymbols.includes(symbol)) {
    const ptypeMap: Record<string, string> = {
      '二元母猪价格': '1',
      '仔猪价格': '2',
    };

    const url = 'https://xt.yangzhu.vip/data/getmapdata';
    const params = {
      ptype: ptypeMap[symbol],
      areano: '-1',
    };

    const data = await httpPost<any>(url, null, { params });

    if (!data?.data) {
      return createDataFrame([], []);
    }

    const columns = ['日期', '价格'];
    const rows = data.data.map((item: any) => {
      const date = Array.isArray(item) ? item[0] : item.date;
      const value = Array.isArray(item) ? item[1] : item.value;
      return [date, parseFloat(value) || 0];
    });

    return createDataFrame(columns, rows);
  }

  return createDataFrame([], []);
}

/**
 * 玄田数据-供应维度
 * https://zhujia.zhuwang.com.cn
 *
 * @param symbol 品种，choice of {"猪肉批发价", "储备冻猪肉", "饲料原料数据", "白条肉",
 *               "生猪产能", "育肥猪", "肉类价格指数", "猪粮比价"}
 */
export async function futures_hog_supply(
  symbol:
    | '猪肉批发价'
    | '储备冻猪肉'
    | '饲料原料数据'
    | '白条肉'
    | '生猪产能'
    | '育肥猪'
    | '肉类价格指数'
    | '猪粮比价' = '猪肉批发价'
): Promise<DataFrame> {
  const ptypeMap: Record<string, string> = {
    '猪肉批发价': '3',
    '储备冻猪肉': '4',
    '饲料原料数据': '5',
    '白条肉': '6',
    '生猪产能': '7',
    '育肥猪': '9',
    '肉类价格指数': '10',
    '猪粮比价': '11',
  };

  const url = 'https://xt.yangzhu.vip/data/getmapdata';
  const params = {
    ptype: ptypeMap[symbol],
    areano: '-1',
  };

  const data = await httpPost<any>(url, null, { params });

  if (!data?.data) {
    return createDataFrame([], []);
  }

  // 根据不同 symbol 返回不同列结构
  switch (symbol) {
    case '猪肉批发价':
    case '肉类价格指数': {
      // 返回 [date, item, value]，去掉 item
      const columns = ['日期', '价格'];
      const rows = data.data.map((item: any) => {
        if (Array.isArray(item)) {
          return [item[0], parseFloat(item[2]) || 0];
        }
        return [item.date, parseFloat(item.value) || 0];
      });
      return createDataFrame(columns, rows);
    }

    case '储备冻猪肉':
    case '猪粮比价': {
      const columns = ['日期', '价格'];
      const rows = data.data.map((item: any) => {
        if (Array.isArray(item)) {
          return [item[0], parseFloat(item[1]) || 0];
        }
        return [item.date, parseFloat(item.value) || 0];
      });
      return createDataFrame(columns, rows);
    }

    case '饲料原料数据': {
      const columns = ['周期', '大豆进口金额', '大豆播种面积', '玉米进口金额', '玉米播种面积'];
      const rows = data.data.map((item: any) => {
        const arr = Array.isArray(item) ? item : Object.values(item);
        return [
          String(arr[0]),
          parseFloat(arr[1]) || 0,
          parseFloat(arr[2]) || 0,
          parseFloat(arr[3]) || 0,
          parseFloat(arr[4]) || 0,
        ];
      });
      return createDataFrame(columns, rows);
    }

    case '白条肉': {
      const columns = ['周期', '白条肉平均出厂价格', '环比', '同比'];
      const rows = data.data.map((item: any) => {
        const arr = Array.isArray(item) ? item : [item[0], item[1], item[2], item[3]];
        return [
          arr[0],
          parseFloat(arr[1]) || 0,
          parseFloat(arr[2]) || 0,
          parseFloat(arr[3]) || 0,
        ];
      });
      return createDataFrame(columns, rows);
    }

    case '生猪产能': {
      const columns = ['周期', '能繁母猪存栏', '猪肉产量', '生猪存栏', '生猪出栏'];
      const rows = data.data.map((item: any) => {
        const arr = Array.isArray(item) ? item : Object.values(item);
        return [
          arr[0],
          parseFloat(arr[1]) || 0,
          parseFloat(arr[2]) || 0,
          parseFloat(arr[3]) || 0,
          parseFloat(arr[4]) || 0,
        ];
      });
      return createDataFrame(columns, rows);
    }

    case '育肥猪': {
      const columns = ['日期', '本周价格'];
      const rows = data.data.map((item: any) => {
        const arr = Array.isArray(item) ? item : Object.values(item);
        return [arr[0], parseFloat(arr[1]) || 0];
      });
      return createDataFrame(columns, rows);
    }

    default:
      return createDataFrame([], []);
  }
}
