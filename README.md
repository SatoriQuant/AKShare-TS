# AKShare-TS

AKShare-TS 是对 Python 版 [AKShare](https://github.com/akfamily/akshare) 的 TypeScript 复刻实现，目标是尽可能保持接口命名与调用习惯一致，便于在 Node.js/TypeScript 生态中直接使用。

npm package 地址: [https://www.npmjs.com/package/akshare-ts](https://www.npmjs.com/package/akshare-ts)
## 文档导航

- 中文说明（当前文档）: [README.md](README.md)
- 英文说明: [README.en.md](README.en.md)
- 接口测试状态表: [INTERFACE_TEST_TABLE.md](INTERFACE_TEST_TABLE.md)

## 项目定位

- 以 TypeScript 方式复刻 AKShare 常用数据接口
- 保持接口函数命名风格与 Python 版本尽量一致
- 面向量化研究、数据抓取与金融数据分析场景

## 快速开始

```bash
npm install akshare-ts
```

```typescript
import { stock_zh_a_hist, fund_etf_spot_em, bond_zh_us_rate } from 'akshare-ts';

const stockData = await stock_zh_a_hist('000001', 'daily', '20240101', '20240131');
const etfData = await fund_etf_spot_em();
const bondData = await bond_zh_us_rate();

console.log(stockData, etfData, bondData);
```

## 接口测试分类说明

当前统计（生成时间：2026-06-10 13:55:21）：

- 接口总数: 631
- 已测试: 442
- 未测试: 189
- 失败接口（已归入未测试）: 171

完整接口状态表见: [INTERFACE_TEST_TABLE.md](INTERFACE_TEST_TABLE.md)

## 本地开发

```bash
npm install
npm run build
npm test
```

## 许可证

MIT
