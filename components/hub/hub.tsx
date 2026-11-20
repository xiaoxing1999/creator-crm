"use client";
import { useEffect, useRef, useState } from "react";
import {
  Layers3,
  LayoutDashboard,
  Compass,
  Database,
  ScanLine,
  Kanban,
  ShieldCheck,
  ChartNoAxesCombined,
  ListTodo,
  Settings2,
  Store,
  ChevronsUpDown,
  ChevronRight,
  PanelLeft,
  Search,
  Bell,
  Bookmark,
  FlaskConical,
  Box,
  ArrowRight,
  Check,
  Command,
  RefreshCw,
  ChevronDown,
  Building2,
  Menu,
  Package,
  UserRound,
} from "lucide-react";
import { Creator, service, products, niches, stages, today } from "@/lib/hub";
import { Discovery, ProductBanner, Stats } from "./discovery";
import { Pipeline } from "./pipeline";
import { Profile } from "./profile";
import { Face, Modal, Select } from "./shared";
const nav = [
  "工作概览",
  "创作者发现",
  "创作者数据库",
  "ASIN 匹配",
  "合作管线",
  "内容核验",
  "活动 ROI",
  "跟进任务",
  "工作区设置",
];
const icons = [
  LayoutDashboard,
  Compass,
  Database,
  ScanLine,
  Kanban,
  ShieldCheck,
  ChartNoAxesCombined,
  ListTodo,
  Settings2,
];
const english = [
  "WORKSPACE OVERVIEW",
  "CREATOR INTELLIGENCE",
  "CREATOR DIRECTORY",
  "PRODUCT MATCHING",
  "COLLABORATION PIPELINE",
  "CONTENT VERIFICATION",
  "CAMPAIGN PERFORMANCE",
  "FOLLOW-UP TASKS",
  "WORKSPACE SETTINGS",
];
const desc = [
  "查看当前商品的创作者覆盖与待跟进合作。",
  "围绕目标商品发现创作者，通过证据与数据评估合作潜力。",
  "查看创作者档案，管理收藏名单与合作记录。",
  "选择模拟商品，查看创作者的匹配理由。",
  "从首次发现到内容发布，在同一看板推进合作。",
  "核对内容披露、商品链接与交付进度。",
  "区分合作预算、实际支出与已确认销售。",
  "复核临近截止日期与逾期的跟进事项。",
  "管理本次模拟会话的显示与测试状态。",
];
export function Hub() {
  const [work, W] = useState(0),
    [sets, S] = useState(() => [service.list(), service.list().slice(14)]),
    [view, V] = useState(1),
    [p, P] = useState(0),
    [collapsed, C] = useState(false),
    [mobile, B] = useState(false),
    [modal, M] = useState(""),
    [active, A] = useState<number | null>(null),
    [full, H] = useState(false),
    [q, Q] = useState(""),
    [toast, T] = useState(""),
    [sim, E] = useState("正常"),
    [dark, D] = useState(false),
    [savedOnly, Y] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [pending, setPending] = useState<(() => void) | null>(null);
  const guard = (action: () => void) => {
    if (dirty) setPending(() => action);
    else action();
  };
  const time = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rows = sets[work],
    data = sim === "无创作者" ? [] : rows,
    c = data.find((x) => x.id === active),
    workspace = ["美国站运营组", "新品试验组"][work];
  const notify = (s: string) => {
    T(s);
    if (time.current) clearTimeout(time.current);
    time.current = setTimeout(() => T(""), 2600);
  };
  const update = (ids: number[], patch: Partial<Creator>) =>
    S((old) =>
      old.map((r, i) => (i === work ? service.update(r, ids, patch) : r)),
    );
  const go = (v: number, s = false, nextWork = work) =>
    guard(() => {
      W(nextWork);
      V(v);
      H(false);
      A(null);
      M("");
      B(false);
      Y(s);
    });
  const open = (r: Creator) =>
    guard(() => {
      H(false);
      A(r.id);
      M("档案速览");
    });
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (document.querySelector("dialog[open]")) return;
        Q("");
        M("全局搜索");
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);
  const tasks = data
    .filter((r) => r.stage !== stages[8])
    .sort((a, b) => a.due.localeCompare(b.due));
  const heading = full ? "创作者档案" : nav[view];
  const showlist = (list: Creator[], detail: (r: Creator) => string) => (
    <div className="minilist">
      {list.map((r) => (
        <button key={r.id} onClick={() => open(r)}>
          <Face c={r} />
          <div>
            <b>{r.name}</b>
            <small>{detail(r)}</small>
          </div>
          <ChevronRight />
        </button>
      ))}
      {!list.length && <p>暂无记录。</p>}
    </div>
  );
  return (
    <div
      className={
        "hub " +
        (collapsed ? "collapsed " : "") +
        (mobile ? "mobileopen " : "") +
        (dark ? "night" : "")
      }
    >
      <button
        className="scrim"
        aria-label="关闭导航"
        onClick={() => B(false)}
      />
      <aside className="rail">
        <div className="brand">
          <span className="brandmark">
            <Layers3 />
          </span>
          <div>
            <b>Creator Hub</b>
            <small>AMAZON US</small>
          </div>
        </div>
        <button className="ws" onClick={() => M("切换工作区")}>
          <span className="wsicon">
            <Store />
          </span>
          <div>
            <small>当前工作区</small>
            <b>{workspace}</b>
          </div>
          <ChevronsUpDown />
        </button>
        <nav>
          {nav.map((n, i) => {
            const Icon = icons[i];
            return (
              <div key={n}>
                {[0, 3, 7].includes(i) && (
                  <div className="navlabel">
                    {i === 0 ? "工作空间" : i === 3 ? "合作管理" : "系统管理"}
                  </div>
                )}
                <button
                  title={n}
                  aria-current={i === view ? "page" : undefined}
                  onClick={() => go(i)}
                >
                  <Icon />
                  <span>{n}</span>
                  {i === 7 && (
                    <i>{tasks.filter((r) => r.due < today).length}</i>
                  )}
                </button>
              </div>
            );
          })}
        </nav>
        <div className="railbottom">
          <div className="sandbox">
            <FlaskConical />
            <div>
              <b>模拟工作空间</b>
              <small>仅使用虚构演示数据</small>
            </div>
          </div>
          <button className="user" onClick={() => M("用户资料")}>
            <span>LX</span>
            <div>
              <b>林晓</b>
              <small>工作区管理员</small>
            </div>
            <ChevronsUpDown />
          </button>
        </div>
      </aside>
      <div className="bodycol">
        <header className="top">
          <div className="row">
            <button
              className="icon"
              aria-label="折叠或展开导航"
              onClick={() =>
                window.innerWidth <= 800 ? B(!mobile) : C(!collapsed)
              }
            >
              <PanelLeft />
            </button>
            <i />
            <small>工作空间</small>
            <ChevronRight size={13} />
            <b>{heading}</b>
          </div>
          <div className="row">
            <button
              className="global"
              aria-label="全局搜索"
              onClick={() => {
                Q("");
                M("全局搜索");
              }}
            >
              <Search /> <span>全局搜索...</span>
              <kbd>⌘ K</kbd>
            </button>
            <button
              className="icon bell"
              aria-label="通知"
              onClick={() => M("通知")}
            >
              <Bell />
            </button>
            <span className="topavatar" aria-label="个人资料">
              <button onClick={() => M("用户资料")}>LX</button>
            </span>
          </div>
        </header>
        <main>
          <div className="pagehead">
            <div>
              <div className="eyebrow intro">
                <i />
                {full ? "CREATOR PROFILE" : english[view]}
              </div>
              <h1>{heading}</h1>
              <p>
                {full ? "查看创作者表现、资格证据和合作记录。" : desc[view]}
              </p>
            </div>
            {view === 1 && !full && (
              <button className="primary" onClick={() => go(2, true)}>
                <Bookmark />
                收藏名单<span>{data.filter((x) => x.saved).length}</span>
              </button>
            )}
            {full && <button onClick={() => go(1)}>返回发现</button>}
          </div>
          {view !== 8 && sim === "服务不可用" ? (
            <div className="panel empty">
              <h2>模拟服务暂不可用</h2>
              <p>当前数据未更改。</p>
              <button onClick={() => E("正常")}>重新加载</button>
            </div>
          ) : view !== 8 && sim === "加载中" ? (
            <div className="panel empty" role="status">
              正在加载模拟资料…
              <button onClick={() => E("正常")}>结束模拟加载</button>
            </div>
          ) : full && c ? (
            <div className="panel pad">
              <Profile
                key={c.id}
                onDirty={setDirty}
                guard={guard}
                c={c}
                p={p}
                update={update}
                notify={notify}
              />
            </div>
          ) : view === 1 || view === 2 ? (
            <>
              {view === 1 && (
                <>
                  <ProductBanner product={p} change={() => M("选择目标商品")} />
                  <Stats rows={data} p={p} />
                </>
              )}
              <Discovery
                key={view + "-" + work + "-" + savedOnly}
                rows={data}
                p={p}
                update={update}
                open={open}
                notify={notify}
                savedOnly={savedOnly}
              />
            </>
          ) : view === 4 ? (
            <Pipeline rows={data} open={open} update={update} />
          ) : view === 8 ? (
            <section className="panel pad">
              <h2>模拟环境</h2>
              <div className="formgrid">
                <label>
                  显示主题
                  <Select
                    label="显示主题"
                    value={dark ? "深色" : "浅色"}
                    options={["浅色", "深色"]}
                    onChange={(v) => D(v === "深色")}
                  />
                </label>
                <label>
                  数据服务状态
                  <Select
                    label="模拟服务状态"
                    value={sim}
                    options={["正常", "加载中", "无创作者", "服务不可用"]}
                    onChange={E}
                  />
                </label>
              </div>
              <p>设置仅影响本次会话；修改后切换到其他页面查看效果。</p>
            </section>
          ) : (
            <>
              <div className="previewlabel">
                <FlaskConical /> 模块预览 · 虚构数据
              </div>
              {view === 0 ? (
                <>
                  <Stats rows={data} p={p} />
                  <div className="panel pad">
                    <h2>优先跟进</h2>
                    {showlist(tasks.slice(0, 5), (r) => r.next + " · " + r.due)}
                  </div>
                </>
              ) : view === 3 ? (
                <section className="panel pad">
                  <h2>商品目录</h2>
                  {products.map((item, i) => (
                    <button
                      key={item.asin}
                      className="productrow"
                      onClick={() => {
                        P(i);
                        go(1);
                      }}
                    >
                      <Package />
                      <div>
                        <b>{item.name}</b>
                        <small>
                          {item.asin} · {niches[item.niche]}
                        </small>
                      </div>
                      <ArrowRight />
                    </button>
                  ))}
                </section>
              ) : view === 5 ? (
                <section className="panel pad">
                  <h2>待核验交付物</h2>
                  {showlist(
                    data.filter((r) =>
                      [stages[6], stages[7]].includes(r.stage),
                    ),
                    (r) => r.deliverable + " · 披露与商品链接待核对",
                  )}
                </section>
              ) : view === 6 ? (
                <section className="panel pad">
                  <h2>活动归因概览</h2>
                  <p>
                    已填写的合作预算小计：$
                    {data
                      .filter((r) => r.campaign)
                      .reduce((s, r) => s + (r.budget ?? 0), 0)
                      .toLocaleString()}
                    ；另有{" "}
                    {data.filter((r) => r.campaign && r.budget === null).length}{" "}
                    条预算未知。此金额为估算，不是实际支出。
                  </p>
                  <p>
                    已确认销售、归因点击与实际付款：暂无数据，无法计算 ROI。
                  </p>
                </section>
              ) : (
                <section className="panel pad">
                  <h2>待跟进事项</h2>
                  {showlist(
                    tasks,
                    (r) =>
                      (r.due < today ? "已逾期 · " : "") +
                      r.due +
                      " · " +
                      r.next +
                      " · " +
                      r.operator,
                  )}
                </section>
              )}
            </>
          )}
          <div className="footnote">
            <span className="live" />
            本地模拟数据 <span>·</span> 独立原型，非 Amazon 官方产品
          </div>
        </main>
      </div>
      {modal && (
        <Modal
          key={modal}
          title={modal}
          close={() => (modal === "档案速览" ? guard(() => M("")) : M(""))}
          side={modal === "档案速览"}
        >
          {modal === "档案速览" && c ? (
            <Profile
              key={c.id}
              c={c}
              p={p}
              update={update}
              notify={notify}
              onDirty={setDirty}
              guard={guard}
              expand={() =>
                guard(() => {
                  H(true);
                  M("");
                })
              }
            />
          ) : modal === "选择目标商品" ? (
            products.map((x, i) => (
              <button
                key={x.asin}
                className="productrow"
                onClick={() => {
                  P(i);
                  M("");
                }}
              >
                <Box />
                <div>
                  <b>{x.name}</b>
                  <small>{x.asin} · 模拟商品</small>
                </div>
                {i === p ? <Check /> : <ChevronRight />}
              </button>
            ))
          ) : modal === "全局搜索" ? (
            <>
              <label className="search">
                <Search />
                <input
                  data-initial-focus
                  aria-label="全局搜索关键词"
                  value={q}
                  onChange={(e) => Q(e.target.value)}
                  placeholder="输入创作者姓名、账号、类目或模块"
                />
              </label>
              {nav.map((n, i) =>
                n.includes(q) && q ? (
                  <button key={n} onClick={() => go(i)}>
                    {n}
                  </button>
                ) : null,
              )}
              {showlist(
                data
                  .filter((r) =>
                    [r.name, r.handle, r.niche]
                      .join(" ")
                      .toLowerCase()
                      .includes(q.toLowerCase()),
                  )
                  .slice(0, 8),
                (r) => r.handle + " · " + r.niche,
              )}
            </>
          ) : modal === "通知" ? (
            <>
              <p>模拟快照 · {today}</p>
              {showlist(
                tasks.filter((r) => r.due < today).slice(0, 5),
                (r) => "跟进已逾期 · " + r.due,
              )}
            </>
          ) : modal === "切换工作区" ? (
            ["美国站运营组", "新品试验组"].map((w, i) => (
              <button
                key={w}
                className="productrow"
                onClick={() => {
                  go(1, false, i);
                }}
              >
                <Building2 />
                {w}
                {work === i && <Check />}
              </button>
            ))
          ) : (
            <>
              <h3>林晓 · 工作区管理员</h3>
              <p>{workspace} · 虚构演示账号，无登录凭据。</p>
              <button onClick={() => go(8)}>工作区设置</button>
            </>
          )}
        </Modal>
      )}
      {pending && (
        <Modal title="放弃未保存的草稿？" close={() => setPending(null)}>
          <p>备注、日期、预算或跟进事项仍有未保存的修改。</p>
          <div className="row">
            <button data-initial-focus onClick={() => setPending(null)}>
              继续编辑
            </button>
            <button
              onClick={() => {
                setPending(null);
                pending();
              }}
            >
              放弃修改
            </button>
          </div>
        </Modal>
      )}
      {toast && (
        <div role="status" className="toast">
          {toast}
        </div>
      )}
    </div>
  );
}
