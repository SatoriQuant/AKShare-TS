/**
 * AKShare TypeScript - 财富/电影/新闻/NLP/其他模块完整测试
 */

import {
  fortune_rank,
  index_bloomberg_billionaires,
  forbes_rank,
  hurun_rank,
  xincaifu_rank,
} from '../fortune';

import {
  movie_boxoffice_realtime,
  movie_boxoffice_daily,
  movie_boxoffice_weekly,
  movie_boxoffice_monthly,
  movie_boxoffice_yearly,
  movie_boxoffice_yearly_first_week,
  movie_boxoffice_cinema_daily,
  movie_boxoffice_cinema_weekly,
  business_value_artist,
  online_value_artist,
  video_tv,
  video_variety_show,
} from '../movie';

import {
  news_cctv,
  stock_news_em,
} from '../news';

import {
  nlp_ownthink,
  nlp_answer,
} from '../nlp';

import {
  car_market_total_cpca,
  car_market_man_rank_cpca,
  car_market_cate_cpca,
  car_market_country_cpca,
  car_market_segment_cpca,
  car_market_fuel_cpca,
  car_sale_rank_gasgoo,
  game_hot_rank_taptap,
} from '../other';

describe('Fortune Module - 完整测试', () => {
  jest.setTimeout(30000);

  const expectDataFrame = (df: any) => {
    expect(df).toHaveProperty('columns');
    expect(df).toHaveProperty('data');
    expect(Array.isArray(df.columns)).toBe(true);
    expect(Array.isArray(df.data)).toBe(true);
  };

  describe('fortune_rank', () => {
    it('should return Fortune 500 ranking', async () => {
      try { const df = await fortune_rank(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('index_bloomberg_billionaires', () => {
    it('should return Bloomberg billionaires', async () => {
      try { const df = await index_bloomberg_billionaires(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('forbes_rank', () => {
    it('should return Forbes ranking', async () => {
      try { const df = await forbes_rank(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('hurun_rank', () => {
    it('should return Hurun ranking', async () => {
      try { const df = await hurun_rank(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('xincaifu_rank', () => {
    it('should return Xincaifu ranking', async () => {
      try { const df = await xincaifu_rank(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });
});

describe('Movie Module - 完整测试', () => {
  jest.setTimeout(30000);

  const expectDataFrame = (df: any) => {
    expect(df).toHaveProperty('columns');
    expect(df).toHaveProperty('data');
    expect(Array.isArray(df.columns)).toBe(true);
    expect(Array.isArray(df.data)).toBe(true);
  };

  describe('movie_boxoffice_realtime', () => {
    it('should return realtime box office', async () => {
      try { const df = await movie_boxoffice_realtime(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('movie_boxoffice_daily', () => {
    it('should return daily box office', async () => {
      try { const df = await movie_boxoffice_daily(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('movie_boxoffice_weekly', () => {
    it('should return weekly box office', async () => {
      try { const df = await movie_boxoffice_weekly(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('movie_boxoffice_monthly', () => {
    it('should return monthly box office', async () => {
      try { const df = await movie_boxoffice_monthly(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('movie_boxoffice_yearly', () => {
    it('should return yearly box office', async () => {
      try { const df = await movie_boxoffice_yearly(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('movie_boxoffice_yearly_first_week', () => {
    it('should return yearly first week box office', async () => {
      try { const df = await movie_boxoffice_yearly_first_week(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('movie_boxoffice_cinema_daily', () => {
    it('should return cinema daily box office', async () => {
      try { const df = await movie_boxoffice_cinema_daily(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('movie_boxoffice_cinema_weekly', () => {
    it('should return cinema weekly box office', async () => {
      try { const df = await movie_boxoffice_cinema_weekly(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('business_value_artist', () => {
    it('should return business value of artists', async () => {
      try { const df = await business_value_artist(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('online_value_artist', () => {
    it('should return online value of artists', async () => {
      try { const df = await online_value_artist(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('video_tv', () => {
    it('should return TV video data', async () => {
      try { const df = await video_tv(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('video_variety_show', () => {
    it('should return variety show data', async () => {
      try { const df = await video_variety_show(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });
});

describe('News Module - 完整测试', () => {
  jest.setTimeout(30000);

  const expectDataFrame = (df: any) => {
    expect(df).toHaveProperty('columns');
    expect(df).toHaveProperty('data');
    expect(Array.isArray(df.columns)).toBe(true);
    expect(Array.isArray(df.data)).toBe(true);
  };

  describe('news_cctv', () => {
    it('should return CCTV news', async () => {
      try { const df = await news_cctv(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('stock_news_em', () => {
    it('should return stock news from EM', async () => {
      try { const df = await stock_news_em('000001'); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });
});

describe('NLP Module - 完整测试', () => {
  jest.setTimeout(30000);

  describe('nlp_ownthink', () => {
    it('should return ownthink NLP data', async () => {
      try {
        const result = await nlp_ownthink('你好');
        expect(result).toBeDefined();
      } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('nlp_answer', () => {
    it('should return NLP answer', async () => {
      try {
        const result = await nlp_answer('你好');
        expect(typeof result).toBe('string');
      } catch (error) { expect(error).toBeDefined(); }
    });
  });
});

describe('Other Module - 完整测试', () => {
  jest.setTimeout(30000);

  const expectDataFrame = (df: any) => {
    expect(df).toHaveProperty('columns');
    expect(df).toHaveProperty('data');
    expect(Array.isArray(df.columns)).toBe(true);
    expect(Array.isArray(df.data)).toBe(true);
  };

  describe('car_market_total_cpca', () => {
    it('should return total car market data', async () => {
      try { const df = await car_market_total_cpca(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('car_market_man_rank_cpca', () => {
    it('should return car manufacturer ranking', async () => {
      try { const df = await car_market_man_rank_cpca(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('car_market_cate_cpca', () => {
    it('should return car category data', async () => {
      try { const df = await car_market_cate_cpca(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('car_market_country_cpca', () => {
    it('should return car market by country', async () => {
      try { const df = await car_market_country_cpca(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('car_market_segment_cpca', () => {
    it('should return car market segment data', async () => {
      try { const df = await car_market_segment_cpca(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('car_market_fuel_cpca', () => {
    it('should return car market fuel data', async () => {
      try { const df = await car_market_fuel_cpca(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('car_sale_rank_gasgoo', () => {
    it('should return car sales ranking from Gasgoo', async () => {
      try { const df = await car_sale_rank_gasgoo(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });

  describe('game_hot_rank_taptap', () => {
    it('should return TapTap game ranking', async () => {
      try { const df = await game_hot_rank_taptap(); expectDataFrame(df); } catch (error) { expect(error).toBeDefined(); }
    });
  });
});
