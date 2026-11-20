"use client";
import { useState, useEffect } from "react";
import {
  Bookmark,
  MapPin,
  ArrowUpRight,
  Package,
  Clock,
  ShieldCheck,
} from "lucide-react";
import {
  type Creator,
  products,
  stages,
  niches,
  factors,
  score,
  compact,
  parseBudget,
} from "@/lib/hub";
import { Face, Evidence, Platform, Select } from "./shared";
import type { Changed } from "./discovery";
const formValues = (c: Creator) => ({
  note: c.note,
  due: c.due,
  deliverable: c.deliverable,
  budget: c.budget?.toString() ?? "",
});
export function Profile({
  onDirty,
  guard,
  c,
  p,
  update,
  notify,
  expand,
}: {
  c: Creator;
  onDirty: (dirty: boolean) => void;
  guard: (action: () => void) => void;
  p: number;
  update: Changed;
  notify: (s: string) => void;
  expand?: () => void;
}) {
  const [tab, T] = useState("概览"),
    [draft, D] = useState(() => formValues(c)),
    [follow, F] = useState(""),
    [error, setError] = useState("");
  const dirty =
    JSON.stringify(draft) !== JSON.stringify(formValues(c)) || follow !== "";
  useEffect(() => {
    onDirty(dirty);
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => {
      onDirty(false);
      window.removeEventListener("beforeunload", warn);
    };
  }, [dirty, onDirty]);
  const patch = (x: Partial<Creator>) => update([c.id], x);
  return (
    <div className="profile">
      <div className="identity">
        <Face c={c} large />
        <div>
          <h2>{c.name}</h2>
          <p>
            {c.handle} · {c.niche}
          </p>
          <div className="row">
            <Platform p={c.platform} />
            <MapPin size={13} />
            {c.loc}
          </div>
        </div>
        <button
          className={"icon " + (c.saved ? "saved" : "")}
          aria-label="收藏"
          aria-pressed={c.saved}
          onClick={() => patch({ saved: !c.saved })}
        >
          <Bookmark fill={c.saved ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="split">
        <small>虚构档案 · 快照 2026-11-19 · {c.stage}</small>
        {expand && (
          <button onClick={expand}>
            完整档案
            <ArrowUpRight />
          </button>
        )}
      </div>
      <div className="tabs">
        {["概览", "证据", "协作"].map((x) => (
          <button key={x} aria-pressed={tab === x} onClick={() => T(x)}>
            {x}
          </button>
        ))}
      </div>
      {tab === "概览" ? (
        <>
          <h3>平台表现</h3>
          <div className="facts">
            {[
              ["粉丝", compact(c.followers)],
              ["近期均播", compact(c.views)],
              ["互动率", c.er === null ? "未知" : c.er + "%"],
              ["内容频率", `${1 + (c.id % 4)} 条 / 周`],
            ].map(([l, v]) => (
              <div key={l}>
                <small>{l}</small>
                <b>{v}</b>
              </div>
            ))}
          </div>
          <p>
            最近三条视频播放量：
            {[0.85, 1.15, 1]
              .map((v) => compact(Math.round(c.views * v)))
              .join(" / ")}
            。最近活跃于 {c.days} 天前。{c.days > 10 ? "数据待刷新。" : ""}
          </p>
          <h3>
            商品匹配 <span className="count">{score(c, p)} / 100</span>
          </h3>
          <div className="matchproduct">
            {p === 0 ? (
              <img src="/hub/drill.webp" alt="模拟电钻技术图" />
            ) : (
              <Package />
            )}
            <div>
              <b>{products[p].name}</b>
              <small>{products[p].asin} · 模拟商品</small>
              {products[p].use}
            </div>
          </div>
          <div className="factorlist">
            {factors(c, p).map((v, i) => (
              <div key={i}>
                <span>
                  {["内容相关度", "受众证据", "近期活跃度", "商业适配度"][i]}
                </span>
                <i className="meter">
                  <i style={{ width: (100 * v) / [40, 25, 20, 15][i] + "%" }} />
                </i>
                <b>
                  {v}/{[40, 25, 20, 15][i]}
                </b>
              </div>
            ))}
          </div>
          <p>
            {c.niche === niches[products[p].niche]
              ? "内容类目与商品一致，可优先评估实测合作。"
              : "内容类目并非完全一致，建议先确认使用场景。"}
            {c.us !== 0
              ? " 尚缺经复核的美国受众数据。"
              : " 模拟受众报告支持地域判断。"}{" "}
            尚未确认原生商品标记资格。
          </p>
          {c.product < 0 && <p>尚未关联合作商品；以上仅为当前商品的建议分。</p>}
        </>
      ) : tab === "证据" ? (
        <>
          <h3>
            <ShieldCheck /> Amazon 联盟证据
          </h3>
          <p>所有来源均为虚构示例，不代表 Amazon 或平台认证。</p>
          {[
            ["美国受众", c.us],
            ["Amazon Associates 联盟链接", c.affiliate],
            ["Amazon Influencer 店铺", c.store ? 1 : 3],
            ["平台原生购物标记资格", 3],
          ].map(([l, v], i) => (
            <article className="evidencecard" key={l}>
              <div className="split">
                <b>{l}</b>
                <Evidence v={Number(v)} />
              </div>
              <small>
                {Number(v) < 2
                  ? `模拟来源：https://example.invalid/${c.id}/${["audience", "associate", "storefront", "tags"][i]} · 2026-11-18`
                  : "无可核对来源或时间"}
              </small>
              <p>
                {Number(v) < 2
                  ? "方法：模拟人工审阅 · " +
                    (v === 0 ? "高置信度" : "中等置信度，待复核")
                  : "置信度未知，需补充材料。"}
              </p>
            </article>
          ))}
          <p>
            所在地不能证明美国受众占比；店铺链接不能证明原生购物标记资格。联系方式未经核验。
          </p>
          <label>
            人工复核状态
            <Select
              label="人工复核"
              value={c.review}
              options={["待复核", "已审阅", "需补充材料"]}
              onChange={(review) => patch({ review })}
            />
          </label>
        </>
      ) : (
        <>
          <h3>合作记录</h3>
          <p>
            {c.campaign || "尚未加入活动"} ·{" "}
            {c.product >= 0 ? products[c.product].asin : "未关联商品"}
          </p>
          <div className="formgrid">
            <label>
              合作阶段
              <Select
                label="合作阶段"
                value={c.stage}
                options={stages}
                onChange={(stage) =>
                  patch({
                    stage,
                    history: [...c.history, "阶段变更：" + stage],
                  })
                }
              />
            </label>
            <label>
              负责人
              <Select
                label="负责人"
                value={c.operator}
                options={["林晓", "Alex", "Mia"]}
                onChange={(operator) => patch({ operator })}
              />
            </label>
            <label>
              样品状态
              <Select
                label="样品状态"
                value={c.sample}
                options={["未寄送", "已寄出", "已签收"]}
                onChange={(sample) => patch({ sample })}
              />
            </label>
            <label>
              预计预算（USD）
              <input
                type="text"
                inputMode="decimal"
                placeholder="未知（未填写）"
                value={draft.budget}
                onChange={(e) => D({ ...draft, budget: e.target.value })}
              />
            </label>
            <label>
              截止日期
              <input
                type="date"
                value={draft.due}
                onChange={(e) => D({ ...draft, due: e.target.value })}
              />
            </label>
            <label>
              交付内容
              <input
                value={draft.deliverable}
                onChange={(e) => D({ ...draft, deliverable: e.target.value })}
              />
            </label>
          </div>
          <label>
            合作备注
            <textarea
              value={draft.note}
              onChange={(e) => D({ ...draft, note: e.target.value })}
            />
          </label>
          <button
            className="primary"
            onClick={() => {
              let budget: number | null;
              try {
                budget = parseBudget(draft.budget);
              } catch {
                setError("保存失败：预算必须是非负有限数值");
                return;
              }
              if (!draft.due || !draft.deliverable.trim()) {
                setError("保存失败：请检查日期和交付内容");
                return;
              }
              patch({
                note: draft.note,
                budget,
                due: draft.due,
                deliverable: draft.deliverable,
                history: [...c.history, "更新合作资料"],
              });
              setError("");
              D({ ...draft, budget: budget?.toString() ?? "" });
              notify("合作资料已保存");
            }}
          >
            保存合作资料
          </button>
          {error && <p role="alert">{error}</p>}
          {dirty && (
            <button
              onClick={() =>
                guard(() => {
                  setError("");
                  D(formValues(c));
                  F("");
                })
              }
            >
              放弃草稿
            </button>
          )}
          <h3>下一步：{c.next}</h3>
          <label>
            添加跟进事项
            <input
              value={follow}
              onChange={(e) => F(e.target.value)}
              placeholder="例如：索取受众报告"
            />
          </label>
          <button
            disabled={!follow.trim()}
            onClick={() => {
              patch({
                next: follow.trim(),
                history: [...c.history, "安排跟进：" + follow.trim()],
              });
              F("");
              notify("已添加跟进");
            }}
          >
            添加跟进
          </button>
          <h3>
            <Clock /> 联系与操作历史
          </h3>
          {c.history.map((h, i) => (
            <p key={i}>{h}</p>
          ))}
        </>
      )}
    </div>
  );
}
