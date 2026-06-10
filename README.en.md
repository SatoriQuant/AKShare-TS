# AKShare-TS

AKShare-TS is a TypeScript reimplementation of the Python [AKShare](https://github.com/akfamily/akshare) project. It aims to keep API naming and usage style as close as possible to the original Python version while providing a Node.js/TypeScript-first developer experience.

## Documentation

- Chinese README: [README.md](README.md)
- Interface test status table: [INTERFACE_TEST_TABLE.md](INTERFACE_TEST_TABLE.md)

## Project Goals

- Recreate AKShare interfaces in TypeScript
- Keep function names and call patterns aligned with Python AKShare when possible
- Serve quantitative research, data collection, and financial data analysis scenarios

## Quick Start

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

## Local Development

```bash
npm install
npm run build
npm test
```

## License

MIT
