/**
 * AKShare TypeScript - 奇货可查 Pro API 客户端
 *
 * 对应 Python akshare/pro/client.py
 * 数据接口源代码: https://api.qhkch.com
 */

import { httpGet } from '../utils/httpClient';
import {
  createDataFrame,
  fromRecords,
  DataFrame,
} from '../utils/dataframe';

/**
 * Pro API 客户端类
 *
 * 使用 Token 进行认证，通过 RESTful API 获取期货相关数据
 */
export class DataApi {
  private token: string;
  private baseUrl: string = 'https://api.qhkch.com';
  private timeout: number;

  constructor(token: string, timeout: number = 10000) {
    this.token = token;
    this.timeout = timeout;
  }

  /**
   * 通用查询方法
   *
   * @param apiName 接口名称
   * @param fields 想要获取的字段
   * @param kwargs 其他参数
   * @returns DataFrame 数据
   */
  async query(
    apiName: string,
    fields: string = '',
    kwargs: Record<string, string> = {}
  ): Promise<DataFrame> {
    const headers: Record<string, string> = {
      'X-Token': this.token,
    };

    // 构建 URL: baseUrl/apiName/value1/value2/...
    const pathParts = [apiName, ...Object.values(kwargs)];
    const url = `${this.baseUrl}/${pathParts.join('/')}`;

    try {
      const dataJson = await httpGet<any>(url, {
        headers,
        timeout: this.timeout * 1000, // 转换为毫秒
      });

      if (fields === '') {
        // 尝试直接构建 DataFrame
        if (Array.isArray(dataJson)) {
          return fromRecords(dataJson);
        } else {
          // dict 类型: orient='index' 模式
          const records = Object.entries(dataJson).map(([key, value]) => ({
            index: key,
            [apiName]: value,
          }));
          return fromRecords(records);
        }
      } else {
        // 特殊处理 variety_all_positions
        if (apiName === 'variety_all_positions') {
          const bigRecords: Record<string, any>[] = [];
          const fieldData = dataJson[fields];
          if (fieldData && typeof fieldData === 'object') {
            for (const [code, items] of Object.entries(fieldData)) {
              if (Array.isArray(items)) {
                for (const item of items) {
                  bigRecords.push({ ...(item as Record<string, any>), code });
                }
              }
            }
          }
          return fromRecords(bigRecords);
        } else {
          const fieldData = dataJson[fields];
          if (Array.isArray(fieldData)) {
            return fromRecords(fieldData);
          } else {
            return fromRecords([fieldData]);
          }
        }
      }
    } catch (error: any) {
      throw new Error(
        '连接异常, 请检查您的Token是否过期和输入的参数是否正确'
      );
    }
  }

  // ============ 商品数据接口 ============

  /**
   * 商品-持仓数据
   *
   * @param fields 字段: longs(多头龙虎榜), shorts(空头龙虎榜)
   * @param code 合约代码，如 "rb1810"
   * @param date 日期，如 "2018-08-08"
   */
  async variety_positions(
    fields: string,
    code: string,
    date: string
  ): Promise<DataFrame> {
    return this.query('variety_positions', fields, { code, date });
  }

  /**
   * 商品-合约行情数据
   *
   * @param code 合约代码
   * @param date 日期
   */
  async variety_quotes(code: string, date: string): Promise<DataFrame> {
    return this.query('variety_quotes', '', { code, date });
  }

  /**
   * 商品-商品沉淀资金数据
   *
   * @param symbol 商品代码，如 "RB"
   * @param date 日期
   */
  async variety_money(symbol: string, date: string): Promise<DataFrame> {
    return this.query('variety_money', '', { symbol, date });
  }

  /**
   * 商品-合约多空比数据
   *
   * @param code 合约代码
   * @param date 日期
   */
  async variety_bbr(code: string, date: string): Promise<DataFrame> {
    return this.query('variety_bbr', '', { code, date });
  }

  /**
   * 商品-合约净持仓保证金变化数据
   */
  async variety_net_money_chge(
    code: string,
    date: string
  ): Promise<DataFrame> {
    return this.query('variety_net_money_chge', '', { code, date });
  }

  /**
   * 商品-合约净持仓保证金数据
   */
  async variety_net_money(code: string, date: string): Promise<DataFrame> {
    return this.query('variety_net_money', '', { code, date });
  }

  /**
   * 商品-合约总持仓保证金数据
   */
  async variety_total_money(
    code: string,
    date: string
  ): Promise<DataFrame> {
    return this.query('variety_total_money', '', { code, date });
  }

  /**
   * 商品-商品的席位盈亏数据
   */
  async variety_profit(
    symbol: string,
    startDate: string,
    endDate: string
  ): Promise<DataFrame> {
    return this.query('variety_profit', '', {
      symbol,
      start_date: startDate,
      end_date: endDate,
    });
  }

  /**
   * 商品-自研指标数据
   */
  async variety_strategies(
    code: string,
    date: string
  ): Promise<DataFrame> {
    return this.query('variety_strategies', '', { code, date });
  }

  /**
   * 商品-龙虎比排行数据
   *
   * @param fields long(多头排行) 或 short(空头排行)
   * @param date 日期
   */
  async variety_longhu_top(
    fields: string,
    date: string
  ): Promise<DataFrame> {
    return this.query('variety_longhu_top', fields, { date });
  }

  /**
   * 商品-牛熊线排行数据
   *
   * @param fields long(多头排行) 或 short(空头排行)
   * @param date 日期
   */
  async variety_niuxiong_top(
    fields: string,
    date: string
  ): Promise<DataFrame> {
    return this.query('variety_niuxiong_top', fields, { date });
  }

  /**
   * 商品-商品相关研报数据
   */
  async variety_reports(
    symbol: string,
    date: string
  ): Promise<DataFrame> {
    return this.query('variety_reports', '', { symbol, date });
  }

  /**
   * 商品-商品列表数据
   */
  async variety_all(): Promise<DataFrame> {
    return this.query('variety_all');
  }

  // ============ 席位数据接口 ============

  /**
   * 席位-商品净持仓数据
   */
  async variety_net_positions(
    symbol: string,
    broker: string,
    date: string
  ): Promise<DataFrame> {
    return this.query('variety_net_positions', '', {
      symbol,
      broker,
      date,
    });
  }

  /**
   * 席位-席位持仓数据
   */
  async broker_positions(
    broker: string,
    date: string
  ): Promise<DataFrame> {
    return this.query('broker_positions', '', { broker, date });
  }

  /**
   * 席位-席位盈亏数据
   */
  async broker_calendar(
    broker: string,
    startDate: string,
    endDate: string
  ): Promise<DataFrame> {
    return this.query('broker_calendar', '', {
      broker,
      start_date: startDate,
      end_date: endDate,
    });
  }

  /**
   * 席位-席位每日大资金流动数据
   */
  async broker_flow(
    broker: string,
    date: string,
    offset: string = '1000000'
  ): Promise<DataFrame> {
    return this.query('broker_flow', '', { broker, date, offset });
  }

  /**
   * 席位-席位多空比数据
   */
  async broker_bbr(broker: string, date: string): Promise<DataFrame> {
    return this.query('broker_bbr', '', { broker, date });
  }

  /**
   * 席位-席位净持仓保证金变化数据
   */
  async broker_net_money_chge(
    broker: string,
    date: string
  ): Promise<DataFrame> {
    return this.query('broker_net_money_chge', '', { broker, date });
  }

  /**
   * 席位-席位净持仓保证金数据
   */
  async broker_net_money(
    broker: string,
    date: string
  ): Promise<DataFrame> {
    return this.query('broker_net_money', '', { broker, date });
  }

  /**
   * 席位-席位总持仓保证金数据
   */
  async broker_total_money(
    broker: string,
    date: string
  ): Promise<DataFrame> {
    return this.query('broker_total_money', '', { broker, date });
  }

  /**
   * 席位-席位的商品盈亏数据
   */
  async broker_profit(
    broker: string,
    startDate: string,
    endDate: string
  ): Promise<DataFrame> {
    return this.query('broker_profit', '', {
      broker,
      start_date: startDate,
      end_date: endDate,
    });
  }

  /**
   * 席位-席位盈利排行
   */
  async broker_in_profit_list(
    startDate: string,
    endDate: string,
    count: string = '10'
  ): Promise<DataFrame> {
    return this.query('broker_in_profit_list', '', {
      start_date: startDate,
      end_date: endDate,
      count,
    });
  }

  /**
   * 席位-席位亏损排行
   */
  async broker_in_loss_list(
    startDate: string,
    endDate: string,
    count: string = '10'
  ): Promise<DataFrame> {
    return this.query('broker_in_loss_list', '', {
      start_date: startDate,
      end_date: endDate,
      count,
    });
  }

  /**
   * 席位-所有席位数据
   *
   * @param offsetDays 偏移天数，如 "365"
   */
  async broker_all(offsetDays: string = '365'): Promise<DataFrame> {
    return this.query('broker_all', '', { offset_days: offsetDays });
  }

  /**
   * 席位-建仓过程
   */
  async broker_positions_process(
    broker: string,
    code: string,
    startDate: string,
    endDate: string
  ): Promise<DataFrame> {
    return this.query('broker_positions_process', '', {
      broker,
      code,
      start_date: startDate,
      end_date: endDate,
    });
  }

  /**
   * 席位-席位对对碰
   */
  async broker_pk(
    broker1: string,
    broker2: string,
    symbol: string
  ): Promise<DataFrame> {
    return this.query('broker_pk', '', { broker1, broker2, symbol });
  }

  // ============ 指数数据接口 ============

  /**
   * 指数-指数信息
   */
  async index_info(indexId: string): Promise<DataFrame> {
    return this.query('index_info', '', { index_id: indexId });
  }

  /**
   * 指数-指数权重数据
   */
  async index_weights(
    indexId: string,
    date: string
  ): Promise<DataFrame> {
    return this.query('index_weights', '', {
      index_id: indexId,
      date,
    });
  }

  /**
   * 指数-指数行情数据
   */
  async index_quotes(
    indexId: string,
    date: string
  ): Promise<DataFrame> {
    return this.query('index_quotes', '', {
      index_id: indexId,
      date,
    });
  }

  /**
   * 指数-指数沉淀资金数据
   */
  async index_money(
    indexId: string,
    date: string
  ): Promise<DataFrame> {
    return this.query('index_money', '', {
      index_id: indexId,
      date,
    });
  }

  /**
   * 指数-公共指数列表
   */
  async index_official(): Promise<DataFrame> {
    return this.query('index_official');
  }

  /**
   * 指数-个人指数列表
   */
  async index_mine(): Promise<DataFrame> {
    return this.query('index_mine');
  }

  /**
   * 指数-指数资金动向
   */
  async index_trend(
    indexId: string,
    date: string
  ): Promise<DataFrame> {
    return this.query('index_trend', '', {
      index_id: indexId,
      date,
    });
  }

  /**
   * 指数-指数的席位盈亏数据
   */
  async index_profit(
    indexId: string,
    startDate: string,
    endDate: string
  ): Promise<DataFrame> {
    return this.query('index_profit', '', {
      index_id: indexId,
      start_date: startDate,
      end_date: endDate,
    });
  }

  // ============ 基本面数据接口 ============

  /**
   * 基本面-基差
   */
  async basis(variety: string, date: string): Promise<DataFrame> {
    return this.query('basis', '', { variety, date });
  }

  /**
   * 基本面-期限结构
   */
  async term_structure(
    variety: string,
    date: string
  ): Promise<DataFrame> {
    return this.query('term_structure', '', { variety, date });
  }

  /**
   * 基本面-库存数据
   */
  async inventory(variety: string, date: string): Promise<DataFrame> {
    return this.query('inventory', '', { variety, date });
  }

  /**
   * 基本面-利润数据
   */
  async profit(variety: string, date: string): Promise<DataFrame> {
    return this.query('profit', '', { variety, date });
  }

  /**
   * 基本面-现货贸易商报价
   */
  async trader_prices(
    variety: string,
    date: string
  ): Promise<DataFrame> {
    return this.query('trader_prices', '', { variety, date });
  }

  /**
   * 基本面-跨期套利数据
   */
  async intertemporal_arbitrage(
    variety: string,
    code1: string,
    code2: string,
    date: string
  ): Promise<DataFrame> {
    return this.query('intertemporal_arbitrage', '', {
      variety,
      code1,
      code2,
      date,
    });
  }

  /**
   * 基本面-自由价差数据
   */
  async free_spread(
    variety1: string,
    code1: string,
    variety2: string,
    code2: string,
    date: string
  ): Promise<DataFrame> {
    return this.query('free_spread', '', {
      variety1,
      code1,
      variety2,
      code2,
      date,
    });
  }

  /**
   * 基本面-自由价比数据
   */
  async free_ratio(
    variety1: string,
    code1: string,
    variety2: string,
    code2: string,
    date: string
  ): Promise<DataFrame> {
    return this.query('free_ratio', '', {
      variety1,
      code1,
      variety2,
      code2,
      date,
    });
  }

  /**
   * 基本面-仓单数据
   */
  async warehouse_receipt(
    variety: string,
    date: string
  ): Promise<DataFrame> {
    return this.query('warehouse_receipt', '', { variety, date });
  }

  /**
   * 基本面-仓单汇总数据（不指定 variety 时获取汇总）
   */
  async warehouse_receipt_summary(date: string): Promise<DataFrame> {
    return this.query('warehouse_receipt', '', { date });
  }

  /**
   * 基本面-虚实盘比数据
   */
  async virtual_real(
    variety: string,
    code: string,
    date: string
  ): Promise<DataFrame> {
    return this.query('virtual_real', '', { variety, code, date });
  }

  // ============ 工具数据接口 ============

  /**
   * 商品-品种无期货数据
   *
   * @param symbol 商品代码，如 "RB"
   * @param date 日期，如 "2018-08-08"
   */
  async variety_no_futures(symbol: string, date: string): Promise<DataFrame> {
    return this.query('variety_no_futures', '', { symbol, date });
  }

  /**
   * 工具-龙虎牛熊多头合约池
   */
  async long_pool(date: string): Promise<DataFrame> {
    return this.query('long_pool', '', { date });
  }

  /**
   * 工具-龙虎牛熊空头合约池
   */
  async short_pool(date: string): Promise<DataFrame> {
    return this.query('short_pool', '', { date });
  }

  // ============ 资金数据接口 ============

  /**
   * 资金-每日净流多列表(商品)
   */
  async commodity_flow_long(date: string): Promise<DataFrame> {
    return this.query('commodity_flow_long', '', { date });
  }

  /**
   * 资金-每日净流空列表(商品)
   */
  async commodity_flow_short(date: string): Promise<DataFrame> {
    return this.query('commodity_flow_short', '', { date });
  }

  /**
   * 资金-每日净流多列表(指数)
   */
  async stock_flow_long(date: string): Promise<DataFrame> {
    return this.query('stock_flow_long', '', { date });
  }

  /**
   * 资金-每日净流空列表(指数)
   */
  async stock_flow_short(date: string): Promise<DataFrame> {
    return this.query('stock_flow_short', '', { date });
  }

  /**
   * 资金-每日商品保证金沉淀变化
   */
  async money_in_out(date: string): Promise<DataFrame> {
    return this.query('money_in_out', '', { date });
  }
}
