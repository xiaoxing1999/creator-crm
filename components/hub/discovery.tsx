"use client";
import { useState } from "react";
import {
  Search,
  Bookmark,
  SlidersHorizontal,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Users,
  ScanSearch,
  ShieldCheck,
  Boxes,
  ArrowLeftRight,
  Box,
  Plus,
  Check,
  Globe,
  Star,
  Filter,
} from "lucide-react";
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Creator,
  products,
  platforms,
  niches,
  stages,
  evidence,
  score,
  compact,
} from "@/lib/hub";
import { Select, Face, Platform, Evidence, Modal } from "./shared";
export type Changed = (ids: number[], patch: Partial<Creator>) => void;
export function ProductBanner({
  product,
  change,
}: {
  product: number;
  change: () => void;
}) {
  const p = products[product];
  return (
    <section className={"productbanner product" + product}>
      <div className="blueprint" aria-hidden="true">
        {product === 0 ? (
          <img src="/hub/drill.webp" alt="" />
        ) : (
          <Box size={92} />
        )}
      </div>
      <div className="productinfo">
        <div className="eyebrow">
          <span className="live" /> PRODUCT CONTEXT{" "}
          <span className="bar">/</span> 当前匹配商品
        </div>
        <h2>{p.name}</h2>
        <div className="productmeta">
          <code>ASIN · {p.asin}</code>
          <span>{niches[p.niche]}</span>
          <span>美国站</span>
        </div>
      </div>
      <button className="switchproduct" onClick={change}>
        <ArrowLeftRight />
        切换商品
      </button>
    </section>
  );
}
export function Stats({ rows, p }: { rows: Creator[]; p: number }) {
  const items = [
    [Users, "创作者总数", rows.length, "创作者"],
    [
      ScanSearch,
      "高匹配创作者",
      rows.filter((c) => score(c, p) >= 80).length,
      "匹配分 ≥ 80",
    ],
    [
      ShieldCheck,
      "含联盟证据",
      rows.filter((c) => c.affiliate < 2).length,
      "模拟证据",
    ],
    [Bookmark, "已入围名单", rows.filter((c) => c.saved).length, "已收藏"],
  ] as const;
  return (
    <div className="metrics">
      {items.map(([Icon, label, n, hint], i) => (
        <div className={"metric tone" + i} key={label}>
          <div className="metriclabel">
            <Icon />
            {label}
          </div>
          <div className="metricvalue">
            <strong>{String(n).padStart(2, "0")}</strong>
            <small>{hint}</small>
          </div>
        </div>
      ))}
    </div>
  );
}
const empty = {
  platform: "全部平台",
  niche: "全部类目",
  loc: "全部地区",
  us: "全部受众证据",
  affiliate: "全部联盟证据",
  stage: "全部阶段",
  store: "全部店铺状态",
  min: "",
  max: "",
  views: "",
  er: "",
  days: "",
  fit: "",
};
export function Discovery({
  rows,
  p,
  update,
  open,
  savedOnly = false,
  notify,
}: {
  rows: Creator[];
  p: number;
  update: Changed;
  open: (c: Creator) => void;
  savedOnly?: boolean;
  notify: (s: string) => void;
}) {
  const [f, F] = useState(empty),
    [q, Q] = useState(""),
    [sort, S] = useState("匹配分优先"),
    [cards, C] = useState(false),
    [ids, I] = useState<number[]>([]),
    [modal, M] = useState(""),
    [page, P] = useState(0),
    [tab, T] = useState(savedOnly ? "已入围" : "全部创作者"),
    [campaign, K] = useState("新品首发");
  const change = (k: keyof typeof empty, v: string) => {
    F({ ...f, [k]: v });
    P(0);
    I([]);
  };
  const invalid = !!f.max && +f.min > +f.max;
  const filterCount = Object.keys(f).filter(
    (k) => f[k as keyof typeof f] !== empty[k as keyof typeof f],
  ).length;
  const result = rows
    .filter(
      (c) =>
        (tab !== "已入围" || c.saved) &&
        (tab !== "高匹配" || score(c, p) >= 80) &&
        [c.name, c.handle, c.niche]
          .join(" ")
          .toLowerCase()
          .includes(q.trim().toLowerCase()) &&
        (f.platform === empty.platform || c.platform === f.platform) &&
        (f.niche === empty.niche || c.niche === f.niche) &&
        (f.loc === empty.loc || c.loc === f.loc) &&
        (f.us === empty.us || f.us === evidence[c.us]) &&
        (f.affiliate === empty.affiliate ||
          f.affiliate === evidence[c.affiliate]) &&
        (f.stage === empty.stage || c.stage === f.stage) &&
        (f.store === empty.store || c.store === (f.store === "有店铺线索")) &&
        c.followers >= +f.min &&
        (!f.max || c.followers <= +f.max) &&
        c.views >= +f.views &&
        (!f.er || (c.er ?? -1) >= +f.er) &&
        (!f.days || c.days <= +f.days) &&
        score(c, p) >= +f.fit,
    )
    .sort((a, b) =>
      sort === "粉丝数优先"
        ? b.followers - a.followers
        : sort === "最近活跃"
          ? a.days - b.days
          : score(b, p) - score(a, p),
    );
  const pages = Math.max(1, Math.ceil(result.length / 7)),
    at = Math.min(page, pages - 1),
    visible = result.slice(at * 7, at * 7 + 7);
  const toggle = (id: number) =>
    I(ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]);
  const pick = (c: Creator) => (
    <input
      type="checkbox"
      aria-label={"选择 " + c.name}
      checked={ids.includes(c.id)}
      onChange={() => toggle(c.id)}
    />
  );
  const save = (c: Creator) => {
    update([c.id], {
      saved: !c.saved,
      ...(!c.saved && c.stage === stages[0] ? { stage: stages[1] } : {}),
    });
    notify(c.saved ? "已移出入围名单" : "已加入入围名单");
  };
  const reset = () => {
    F(empty);
    Q("");
    P(0);
    I([]);
  };
  const selectors = (k: keyof typeof empty, opts: string[]) => (
    <Select
      label={empty[k]}
      value={f[k]}
      options={[empty[k], ...opts]}
      onChange={(v) => change(k, v)}
    />
  );
  return (
    <section className="panel results">
      <div className="resultshead">
        <div className="row">
          <span className="squareblue">
            <Users />
          </span>
          <h2>创作者列表</h2>
          <span className="count">{result.length}</span>
        </div>
        <div className="seg">
          <button
            aria-label="列表视图"
            aria-pressed={!cards}
            onClick={() => C(false)}
          >
            <List />
          </button>
          <button
            aria-label="卡片视图"
            aria-pressed={cards}
            onClick={() => C(true)}
          >
            <LayoutGrid />
          </button>
        </div>
      </div>
      <div className="tabs">
        {["全部创作者", "高匹配", "已入围"].map((t, i) => {
          const Icon = [Users, Star, Bookmark][i];
          return (
            <button
              key={t}
              aria-pressed={tab === t}
              onClick={() => {
                T(t);
                P(0);
                I([]);
              }}
            >
              <Icon />
              {t}
            </button>
          );
        })}
      </div>
      <div className="filterbar">
        <label className="search">
          <Search />
          <input
            aria-label="搜索创作者"
            placeholder="搜索姓名、账号或类目…"
            value={q}
            onChange={(e) => {
              Q(e.target.value);
              P(0);
              I([]);
            }}
          />
        </label>
        {selectors("platform", platforms)}
        {selectors("niche", niches)}
        <button onClick={() => M("筛选条件")}>
          <SlidersHorizontal />
          筛选{filterCount || ""}
        </button>
        <label className="sort">
          <ArrowUpDown />
          <Select
            label="排序"
            value={sort}
            options={["匹配分优先", "粉丝数优先", "最近活跃"]}
            onChange={(v) => {
              S(v);
              P(0);
            }}
          />
        </label>
      </div>
      {ids.length > 0 && (
        <div className="bulk">
          已选 {ids.length} 人
          <button
            onClick={() => {
              ids.forEach((id) => {
                const c = rows.find((r) => r.id === id)!;
                update([id], {
                  saved: true,
                  ...(c.stage === stages[0] ? { stage: stages[1] } : {}),
                });
              });
              I([]);
              notify("已更新入围名单");
            }}
          >
            <Bookmark />
            批量入围
          </button>
          <button onClick={() => M("加入推广活动")}>
            <Plus />
            加入活动
          </button>
        </div>
      )}
      {invalid || !result.length ? (
        <div className="empty">
          <Filter />
          <h3>{invalid ? "粉丝数范围无效" : "没有符合条件的创作者"}</h3>
          <button onClick={reset}>重置筛选</button>
        </div>
      ) : cards ? (
        <div className="cardgrid">
          {visible.map((c) => (
            <article key={c.id}>
              <div className="split">
                {pick(c)}
                <button
                  className="icon"
                  aria-label="切换入围状态"
                  onClick={() => save(c)}
                >
                  <Bookmark fill={c.saved ? "currentColor" : "none"} />
                </button>
              </div>
              <button className="person" onClick={() => open(c)}>
                <Face c={c} />
                <div>
                  <b>{c.name}</b>
                  <small>{c.handle}</small>
                </div>
              </button>
              <Platform p={c.platform} />
              <p>
                {c.niche} · {compact(c.followers)} 粉丝
              </p>
              <Evidence v={c.affiliate} />
              <p>
                匹配分 {score(c, p)} · {c.stage}
              </p>
            </article>
          ))}
        </div>
      ) : (
        <Table className="directory">
          <TableHeader>
            <TableRow>
              <TableHead>
                <input
                  type="checkbox"
                  aria-label="选择当前页"
                  checked={visible.every((c) => ids.includes(c.id))}
                  onChange={(e) =>
                    I(
                      e.target.checked
                        ? [...new Set([...ids, ...visible.map((c) => c.id)])]
                        : ids.filter((id) => !visible.some((c) => c.id === id)),
                    )
                  }
                />
              </TableHead>
              {[
                "创作者",
                "平台 / 类目",
                "粉丝 / 均播",
                "互动率",
                "联盟证据",
                "匹配分",
                "收藏",
                "受众证据",
                "最近活跃",
                "合作阶段",
              ].map((h) => (
                <TableHead key={h}>{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.map((c) => (
              <TableRow key={c.id}>
                <TableCell>{pick(c)}</TableCell>
                <TableCell>
                  <button className="person" onClick={() => open(c)}>
                    <Face c={c} />
                    <div>
                      <b>{c.name}</b>
                      <small>{c.handle}</small>
                    </div>
                  </button>
                </TableCell>
                <TableCell>
                  <Platform p={c.platform} />
                  <small>{c.niche}</small>
                </TableCell>
                <TableCell>
                  <b>{compact(c.followers)}</b>
                  <small>{compact(c.views)} 均播</small>
                </TableCell>
                <TableCell>{c.er === null ? "—" : c.er + "%"}</TableCell>
                <TableCell>
                  <Evidence v={c.affiliate} />
                </TableCell>
                <TableCell>
                  <span className="score">
                    {score(c, p)}
                    <span>/100</span>
                  </span>
                  <i className="meter">
                    <i style={{ width: score(c, p) + "%" }} />
                  </i>
                </TableCell>
                <TableCell>
                  <button
                    aria-label={(c.saved ? "取消入围 " : "加入入围 ") + c.name}
                    className={"icon " + (c.saved ? "saved" : "")}
                    onClick={() => save(c)}
                  >
                    <Bookmark fill={c.saved ? "currentColor" : "none"} />
                  </button>
                </TableCell>
                <TableCell>
                  <Evidence v={c.us} />
                </TableCell>
                <TableCell>{c.days} 天前</TableCell>
                <TableCell>{c.stage}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <footer className="split">
        <small>
          显示 {result.length ? at * 7 + 1 : 0}–
          {Math.min((at + 1) * 7, result.length)} 条，共 {result.length} 条
        </small>
        <div className="row">
          <button
            aria-label="上一页"
            disabled={at === 0}
            onClick={() => P(at - 1)}
          >
            <ChevronLeft />
          </button>
          <span>
            {at + 1} / {pages}
          </span>
          <button
            aria-label="下一页"
            disabled={at === pages - 1}
            onClick={() => P(at + 1)}
          >
            <ChevronRight />
          </button>
        </div>
      </footer>
      {modal && (
        <Modal title={modal} close={() => M("")}>
          {modal === "筛选条件" ? (
            <>
              <div className="formgrid">
                {(
                  [
                    ["loc", ["美国", "加拿大", "英国"]],
                    ["us", evidence],
                    ["affiliate", evidence],
                    ["stage", stages],
                    ["store", ["有店铺线索", "无线索"]],
                  ] as [keyof typeof empty, string[]][]
                ).map(([k, opts]) => (
                  <label key={k}>
                    {empty[k].slice(2)}
                    {selectors(k, opts)}
                  </label>
                ))}
                {(
                  [
                    ["min", "最低粉丝数"],
                    ["max", "最高粉丝数"],
                    ["views", "最低平均播放"],
                    ["er", "最低互动率 (%)"],
                    ["days", "最近活跃天数以内"],
                    ["fit", "最低匹配分"],
                  ] as const
                ).map(([k, l]) => (
                  <label key={k}>
                    {l}
                    <input
                      type="number"
                      min="0"
                      value={f[k]}
                      onChange={(e) => change(k, e.target.value)}
                      placeholder="不限"
                    />
                  </label>
                ))}
              </div>
              {invalid && <p role="alert">最高粉丝数不能小于最低值。</p>}
              <div className="split">
                <button onClick={reset}>重置</button>
                <button
                  className="primary"
                  disabled={invalid}
                  onClick={() => M("")}
                >
                  查看 {result.length} 个结果
                </button>
              </div>
            </>
          ) : (
            <>
              <Select
                label="推广活动"
                value={campaign}
                options={["新品首发", "冬季工具测评"]}
                onChange={K}
              />
              <button
                className="primary"
                onClick={() => {
                  update(ids, { campaign });
                  I([]);
                  M("");
                  notify("已加入" + campaign);
                }}
              >
                确认加入
              </button>
            </>
          )}
        </Modal>
      )}
    </section>
  );
}
