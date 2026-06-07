# AKShare TypeScript

基于 Python [AKShare](https://github.com/akfamily/akshare) 项目复刻的 TypeScript 版本，提供股票、期货、期权、基金、债券、外汇、加密货币等金融产品的数据接口。

## 安装

```bash
npm install akshare-ts
```

## 快速开始

```typescript
import { stock_zh_a_hist, fund_etf_spot_em, bond_zh_us_rate } from 'akshare-ts';

// 获取股票日线数据
const stockData = await stock_zh_a_hist('000001', 'daily', '20240101', '20240131');
console.log(stockData);

// 获取 ETF 实时行情
const etfData = await fund_etf_spot_em();
console.log(etfData);

// 获取中美债券收益率
const bondData = await bond_zh_us_rate();
console.log(bondData);
```

## 功能模块

### 股票 (Stock)

- `stock_zh_a_hist` - A股历史行情
- `stock_zh_a_spot_em` - A股实时行情
- `stock_board_concept_name_em` - 概念板块列表
- `stock_board_industry_name_em` - 行业板块列表
- `stock_hsgt_fund_flow_summary` - 沪深港通资金流向

### 基金 (Fund)

- `fund_etf_spot_em` - ETF实时行情
- `fund_etf_hist_em` - ETF历史行情
- `fund_open_fund_info_em` - 开放式基金净值

### 债券 (Bond)

- `bond_cov_stock_issue_cninfo` - 可转债数据
- `bond_zh_us_rate` - 中美国债收益率
- `bond_china_yield` - 中国国债收益率曲线

### 期货 (Futures)

- `futures_zh_spot` - 国内期货实时行情
- `futures_foreign_detail` - 外盘期货实时行情
- `futures_inventory_em` - 期货库存数据

### 外汇 (Forex)

- `forex_spot_em` - 外汇实时行情
- `forex_hist_em` - 外汇历史行情
- `currency_boc_safe` - 主要货币汇率

### 指数 (Index)

- `stock_zh_index_spot_em` - 指数实时行情
- `stock_zh_index_daily_em` - 指数历史行情
- `index_us_stock_sina` - 美国指数行情

### 宏观经济 (Macro)

- `macro_china_gdp` - 中国GDP
- `macro_china_cpi` - 中国CPI
- `macro_china_ppi` - 中国PPI
- `macro_china_pmi` - 中国PMI
- `macro_usa_gdp` - 美国GDP
- `macro_usa_cpi` - 美国CPI
- `macro_usa_non_farm` - 美国非农就业

### 能源 (Energy)

- `energy_spot_em` - 能源品种实时行情
- `energy_oil_hist` - 原油历史行情
- `energy_coal_spot` - 煤炭价格

### 加密货币 (Crypto)

- `crypto_spot_em` - 加密货币实时行情
- `crypto_hist_em` - 加密货币历史行情
- `crypto_bitcoin_cme` - 比特币CME期货

## 数据结构

所有接口返回 `DataFrame` 类型，结构如下：

```typescript
interface DataFrame {
  columns: string[];  // 列名
  data: any[][];      // 数据
}
```

## 配置

```typescript
import { initConfig } from 'akshare-ts';

initConfig({
  logLevel: 'info',
  timeout: 30000,
  retries: 3,
  proxy: {
    host: '127.0.0.1',
    port: 7890,
    protocol: 'http',
  },
});
```

## 开发

```bash
# 安装依赖
npm install

# 编译
npm run build

# 测试
npm test
```

## 许可证

MIT License

## 致谢

感谢 [AKShare](https://github.com/akfamily/akshare) 项目提供的数据接口设计思路。
