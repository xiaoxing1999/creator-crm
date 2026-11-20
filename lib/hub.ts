export const platforms = [
  "YouTube",
  "Instagram",
  "TikTok",
  "Facebook",
  "Pinterest",
];
export const niches = [
  "家装工具",
  "汽车维修",
  "房车养护",
  "复古灯具修复",
  "小型发动机维修",
  "皮划艇垂钓",
];
export const stages = [
  "已发现",
  "已入围",
  "已联系",
  "已回复",
  "洽谈中",
  "已寄样",
  "内容审核",
  "已发布",
  "已完成",
];
export const evidence = ["模拟已核验", "已发现证据", "未核验", "未知"];
export const products = [
  {
    name: "20V 无刷充电电钻套装",
    asin: "B0MOCK001A",
    niche: 0,
    use: "家具组装与家庭维修",
    model: "BRUSHLESS DRILL / 20V",
  },
  {
    name: "便携汽车诊断仪",
    asin: "B0MOCK002B",
    niche: 1,
    use: "汽车故障排查",
    model: "DIAGNOSTIC SCANNER",
  },
  {
    name: "皮划艇可调鱼竿支架",
    asin: "B0MOCK003C",
    niche: 5,
    use: "船载钓具安装",
    model: "KAYAK ROD HOLDER",
  },
];
const names =
  "Ethan Brooks|Maya Chen|Marcus Cole|Nora Hayes|Leo Rivera|Avery Lane|Owen Reed|Jade Carter|Finn Mercer|Isla Rowan|Cole Benson|Iris Bell|Theo West|Ruby Evans|Kai Palmer|Lena Archer|Drew Fields|Ella Stone|Miles Finch|June Harper|Reid Lawson|Zoe Grant|Seth Parker|Lucy Banks|Arlo North|Nina Ames|Eli Rhodes|Tess Wells".split(
    "|",
  );
const handles = [
  "ethanbuilds",
  "madebymaya",
  "garagewithmarc",
  "norarestores",
  "riveraworkshop",
  "averyoutdoors",
];
export function seed() {
  return names.map((name, id) => ({
    id,
    name,
    handle: "@" + (handles[id] ?? name.toLowerCase().replace(" ", ".")),
    platform: platforms[[0, 1, 0, 2, 0, 1, 3, 4][id % 8]],
    niche: niches[[0, 0, 1, 3, 4, 5, 2][id % 7]],
    followers:
      [248000, 186400, 132800, 96400, 82100, 72600, 65400][id % 7] +
      Math.floor(id / 7) * 800,
    views: Math.round(64000 / (1 + id / 8)),
    er: id % 11 === 10 ? null : Number((5.8 - (id % 9) * 0.37).toFixed(1)),
    loc: ["美国", "加拿大", "美国", "英国"][id % 4],
    us: id % 4,
    affiliate: [0, 1, 0, 2, 3][id % 5],
    store: id % 3 !== 2,
    days: 1 + (id % 17),
    stage: stages[id % 9],
    saved: id % 4 === 1,
    product: id % 12 === 11 ? -1 : id % 3,
    campaign: id % 7 === 0 ? "新品首发" : "",
    operator: ["林晓", "Alex", "Mia"][id % 3],
    note: "",
    budget: (200 + id * 25) as number | null,
    due: id % 4 === 0 ? "2026-11-17" : "2026-11-25",
    next: "复核商品与受众证据",
    sample: "未寄送",
    deliverable: "1 条商品使用演示视频",
    history: ["创建模拟档案"],
    review: "待复核",
  }));
}
export type Creator = ReturnType<typeof seed>[number];
export const today = "2026-11-19";
export const factors = (c: Creator, p: number) => [
  c.niche === niches[products[p].niche] ? 40 : 0,
  [25, 20, 14, 7][c.us],
  Math.max(4, 20 - Math.floor(c.days / 2)),
  [13, 12, 8, 5][c.affiliate],
];
export const score = (c: Creator, p: number) =>
  factors(c, p).reduce((a, b) => a + b, 0);
export const highMatch = (c: Creator, p: number) =>
  c.niche === niches[products[p].niche] && score(c, p) >= 80;
// Mirrors a future numeric(12,2) column. The JS number returned here is only for
// the mock UI; production must carry amounts as Decimal or integer cents.
// Integer cents stay below 2^53, so plain numbers are exact here.
export const BUDGET_MAX_CENTS = 999_999_999_999;
export const BUDGET_MAX_LABEL = "9,999,999,999.99";
const BUDGET_PATTERN = /^(0|[1-9]\d{0,2}(?:,\d{3})+|[1-9]\d*)(?:\.(\d{1,2}))?$/;
export function parseBudgetCents(raw: string): number | null {
  const text = raw.trim();
  if (!text) return null;
  const m = BUDGET_PATTERN.exec(text);
  if (!m)
    throw new RangeError(
      "预算格式无效：仅支持非负十进制、合法千分位，最多两位小数",
    );
  const whole = m[1].replace(/,/g, "");
  const tooLarge = () => new RangeError("预算超过上限 " + BUDGET_MAX_LABEL);
  if (whole.length > 10) throw tooLarge();
  const cents = Number(whole) * 100 + Number((m[2] ?? "").padEnd(2, "0"));
  if (cents > BUDGET_MAX_CENTS) throw tooLarge();
  return cents;
}
export function parseBudget(raw: string): number | null {
  const cents = parseBudgetCents(raw);
  return cents === null ? null : cents / 100;
}
export const compact = (n: number) =>
  Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
export const UNASSIGNED = -1;
export const inProductScope = (c: Creator, p: number) =>
  c.product === p || c.product === UNASSIGNED;
export type BulkAction =
  | { kind: "shortlist" }
  | { kind: "campaign"; campaign: string };
export type SkipReason = "missing" | "other-asin" | "not-discovered" | "no-change";
export const skipLabels: Record<SkipReason, string> = {
  missing: "不在当前数据中",
  "other-asin": "关联其他 ASIN",
  "not-discovered": "非已发现阶段",
  "no-change": "无需变更",
};
export function bulkSkipReason(
  c: Creator | undefined,
  p: number,
  action: BulkAction,
): SkipReason | null {
  if (!c) return "missing";
  if (!inProductScope(c, p)) return "other-asin";
  if (action.kind === "shortlist" && c.stage !== stages[0])
    return "not-discovered";
  if (action.kind === "campaign" && c.campaign === action.campaign)
    return "no-change";
  return null;
}
function bulkPatch(c: Creator, p: number, action: BulkAction): Creator {
  const asin = products[p].asin;
  return action.kind === "shortlist"
    ? {
        ...c,
        stage: stages[1],
        product: p,
        history: [...c.history, `阶段变更：已入围（${asin}）`],
      }
    : {
        ...c,
        campaign: action.campaign,
        product: p,
        history: [...c.history, `加入活动：${action.campaign}（${asin}）`],
      };
}
export function planBulk(
  rows: Creator[],
  ids: number[],
  p: number,
  action: BulkAction,
) {
  const changed: number[] = [];
  const skipped: { id: number; reason: SkipReason }[] = [];
  for (const id of new Set(ids)) {
    const reason = bulkSkipReason(
      rows.find((c) => c.id === id),
      p,
      action,
    );
    if (reason) skipped.push({ id, reason });
    else changed.push(id);
  }
  return { changed, skipped };
}
export function applyBulk(
  rows: Creator[],
  ids: number[],
  p: number,
  action: BulkAction,
) {
  const plan = planBulk(rows, ids, p, action);
  return {
    ...plan,
    rows: rows.map((c) =>
      plan.changed.includes(c.id) ? bulkPatch(c, p, action) : c,
    ),
  };
}
export const shortlistable = (c: Creator, p: number) =>
  bulkSkipReason(c, p, { kind: "shortlist" }) === null;
export function shortlist(rows: Creator[], ids: number[], p: number) {
  const r = applyBulk(rows, ids, p, { kind: "shortlist" });
  return {
    moved: r.changed,
    skipped: r.skipped.filter((s) => s.reason !== "missing").length,
    rows: r.rows,
  };
}
export function summarizeSkips(skipped: { reason: SkipReason }[]) {
  const counts = new Map<SkipReason, number>();
  for (const s of skipped) counts.set(s.reason, (counts.get(s.reason) ?? 0) + 1);
  return [...counts].map(([r, n]) => `${skipLabels[r]} ${n} 人`).join("、");
}
export const moveStage = (rows: Creator[], id: number, stage: string) =>
  rows.map((c) =>
    c.id === id && c.stage !== stage
      ? { ...c, stage, history: [...c.history, "阶段变更：" + stage] }
      : c,
  );
export const service = {
  list: seed,
  update: (rows: Creator[], ids: number[], patch: Partial<Creator>) =>
    rows.map((c) => (ids.includes(c.id) ? { ...c, ...patch } : c)),
  shortlist,
  applyBulk,
  moveStage,
};
