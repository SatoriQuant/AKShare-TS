/**
 * AKShare TypeScript - TapTap 游戏榜单数据
 * https://www.taptap.cn/top/played
 */

import { httpGet } from '../utils/httpClient';
import { createDataFrame, DataFrame } from '../utils/dataframe';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TAPTAP_BASE_URL = 'https://www.taptap.cn/webapiv2/app-top/v2/hits';

const TAPTAP_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) ' +
    'AppleWebKit/605.1.15 (KHTML, like Gecko) ' +
    'Version/18.0 Mobile/15E148 Safari/604.1',
  'Referer': 'https://www.taptap.cn/',
  'Accept': 'application/json, text/plain, */*',
};

const TAPTAP_X_UA =
  'V=1&PN=WebM&LANG=zh_CN&VN_CODE=102&LOC=CN&PLT=iOS&DS=Android' +
  '&UID=12f0a48b-bd25-4dce-9d50-27924e83da1d&OS=iOS&OSV=18.5';

const TAPTAP_PAGE_SIZE = 10;
const TAPTAP_MAX_LOOPS = 200;
const TAPTAP_SLEEP_MS = 400;

const RANK_TYPE_MAP: Record<string, string> = {
  '热玩榜': 'pop',
  '热门榜': 'hot',
  '新品榜': 'new',
  '预约榜': 'reserve',
  '热卖榜': 'sell',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function cleanHtml(text: string | null | undefined): string {
  if (text == null) return '';
  let t = String(text);
  t = t.replace(/<br[^>]*\/?>/gi, '\n');
  t = t.replace(/<[^>]+>/g, '');
  const replacements: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&#34;': '"',
    "&#39;": "'",
    '&quot;': '"',
    '&nbsp;': ' ',
  };
  for (const [k, v] of Object.entries(replacements)) {
    t = t.split(k).join(v);
  }
  return t.replace(/\n{3,}/g, '\n\n').trim();
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// TapTap 游戏榜单
// ---------------------------------------------------------------------------

/**
 * TapTap-游戏榜单
 * https://www.taptap.cn/top/played
 *
 * @param symbol 榜单类型: "热玩榜" | "热门榜" | "新品榜" | "预约榜" | "热卖榜"
 */
export async function game_hot_rank_taptap(
  symbol: '热玩榜' | '热门榜' | '新品榜' | '预约榜' | '热卖榜' = '热玩榜'
): Promise<DataFrame> {
  const typeName = RANK_TYPE_MAP[symbol];
  if (!typeName) {
    throw new Error(`symbol 仅支持 ${Object.keys(RANK_TYPE_MAP).join(', ')}, 当前传入: ${symbol}`);
  }

  const allGames: any[] = [];
  let total: number | null = null;
  let offset = 0;

  for (let loop = 0; loop < TAPTAP_MAX_LOOPS; loop++) {
    const params: Record<string, any> = {
      from: offset,
      limit: TAPTAP_PAGE_SIZE,
      type_name: typeName,
      'X-UA': TAPTAP_X_UA,
    };

    const js = await httpGet<any>(TAPTAP_BASE_URL, {
      params,
      headers: TAPTAP_HEADERS,
      timeout: 15000,
    });

    if (!js?.success) {
      throw new Error(`TapTap 接口返回失败: ${JSON.stringify(js)}`);
    }

    const pageData = js.data || {};
    const pageList = pageData.list || [];

    if (total === null) {
      total = pageData.total || 0;
    }

    if (!pageList.length) break;

    allGames.push(...pageList);

    if (total && allGames.length >= total) break;

    offset += TAPTAP_PAGE_SIZE;
    await sleep(TAPTAP_SLEEP_MS);
  }

  if (!allGames.length) return createDataFrame([], []);

  // Build rows from nested JSON
  const columns = [
    '排名', '游戏名称', '评分', '总点击量', '游玩次数', '评论数',
    '粉丝数', '标签', '推荐语', '发布时间', '游戏ID', '图标链接', '简介',
  ];

  const rows = allGames.map((item, index) => {
    const app = item.app || {};
    const stat = app.stat || {};
    const rating = stat.rating || {};
    const description = app.description || {};
    const tags = (app.tags || []).map((t: any) => t.value || '').join(', ');

    const releasedTime = app.released_time;
    let releaseDate = null;
    if (releasedTime) {
      try {
        releaseDate = new Date(releasedTime * 1000).toISOString().slice(0, 19).replace('T', ' ');
      } catch {
        releaseDate = null;
      }
    }

    return [
      index + 1,                           // 排名
      (app.title ?? '').trim(),            // 游戏名称
      rating.score != null ? Number(rating.score) : null,  // 评分
      stat.hits_total != null ? Number(stat.hits_total) : null,  // 总点击量
      stat.play_total != null ? Number(stat.play_total) : null,  // 游玩次数
      stat.review_count != null ? Number(stat.review_count) : null,  // 评论数
      stat.fans_count != null ? Number(stat.fans_count) : null,  // 粉丝数
      tags,                                // 标签
      (app.rec_text ?? '').trim(),         // 推荐语
      releaseDate,                         // 发布时间
      app.id ?? '',                        // 游戏ID
      (app.icon?.url ?? '').trim(),        // 图标链接
      cleanHtml(description.text ?? ''),   // 简介
    ];
  });

  // Deduplicate by 游戏ID
  const seen = new Set<string>();
  const dedupedRows = rows.filter(row => {
    const id = String(row[10]); // 游戏ID
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });

  return createDataFrame(columns, dedupedRows);
}
