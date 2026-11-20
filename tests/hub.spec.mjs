import { test as base, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";
const test = base.extend({
  page: async ({ page, baseURL }, use) => {
    const foreign = [],
      errors = [];
    await page.route("**/*", (route) => {
      const url = new URL(route.request().url());
      if (url.origin !== new URL(baseURL).origin) {
        foreign.push(url.origin);
        return route.abort();
      }
      return route.continue();
    });
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "创作者列表" }),
    ).toBeVisible();
    await use(page);
    expect(foreign).toEqual([]);
    expect(errors).toEqual([]);
  },
});
const btn = (p, name) => p.getByRole("button", { name, exact: true });
const row = (p) => p.locator("tbody tr").filter({ hasText: "Ethan Brooks" });
const profile = async (p) => {
  await row(p).locator(".person").click();
  await btn(p, "协作").click();
};
const close = (p) => btn(p, "关闭").click();
test("搜索、排序、商品与高匹配", async ({ page: p }) => {
  const search = p.getByLabel("搜索创作者");
  await search.fill("ethan");
  await expect(p.locator("tbody tr")).toHaveCount(1);
  await search.fill("");
  await p.getByLabel("排序").selectOption("粉丝数优先");
  await expect(p.locator("tbody tr").first()).toContainText("Zoe Grant");
  await btn(p, "切换商品").click();
  await p.getByRole("button", { name: /皮划艇可调鱼竿支架/ }).click();
  await search.fill("ethan");
  await expect(row(p)).toContainText("58/100");
  await btn(p, "高匹配").click();
  await expect(p.getByText("没有符合条件的创作者")).toBeVisible();
});
test("高级条件应用、取消、Esc、重置与无效范围", async ({ page: p }) => {
  const filter = p.getByRole("button", { name: /^筛选/ });
  const count = p.locator(".resultshead .count");
  await filter.click();
  await p.getByLabel("最低粉丝数").fill("200000");
  await expect(count).toHaveText("28");
  await btn(p, "取消").click();
  await expect(count).toHaveText("28");
  await filter.click();
  await expect(p.getByLabel("最低粉丝数")).toHaveValue("");
  await p.getByLabel("最低粉丝数").fill("200000");
  await p.getByLabel("最高粉丝数").fill("1");
  await expect(btn(p, "应用筛选")).toBeDisabled();
  await p.getByLabel("最高粉丝数").fill("");
  await btn(p, "应用筛选").click();
  await expect(count).toHaveText("4");
  await filter.click();
  await btn(p, "重置高级条件").click();
  await p.keyboard.press("Escape");
  await expect(count).toHaveText("4");
  await filter.click();
  await btn(p, "重置高级条件").click();
  await btn(p, "应用筛选").click();
  await expect(count).toHaveText("28");
});
test("收藏不改阶段，批量入围同步看板，拖放及键盘调整", async ({ page: p }) => {
  await btn(p, "收藏 Ethan Brooks").click();
  await expect(row(p).locator("td").last()).toHaveText("已发现");
  await p.getByLabel("选择 Ethan Brooks").check();
  await btn(p, "批量入围").click();
  await expect(row(p).locator("td").last()).toHaveText("已入围");
  await btn(p, "收藏 Ethan Brooks").click();
  await expect(row(p).locator("td").last()).toHaveText("已入围");
  await btn(p, "合作管线").click();
  const col = (name) =>
    p
      .locator(".board section")
      .filter({ has: p.locator("h3", { hasText: name }) });
  const card = (where) => where.locator(".kanban", { hasText: "Ethan Brooks" });
  await card(col("已入围")).dragTo(col("已联系").locator("h3"));
  await expect(card(col("已联系"))).toBeVisible();
  await card(col("已联系")).focus();
  await p.keyboard.press("Enter");
  await btn(p, "协作").click();
  const stage = p.getByLabel("合作阶段", { exact: true });
  await stage.focus();
  await p.keyboard.press("ArrowDown");
  await expect(stage).toHaveValue("已回复");
  await close(p);
  await expect(card(col("已回复"))).toBeVisible();
});
test("切换 ASIN 清空选择，批量入围只作用于当前 ASIN", async ({ page: p }) => {
  const stageOf = (name) =>
    p.locator("tbody tr").filter({ hasText: name }).locator("td").last();
  await p.getByLabel("选择 Ethan Brooks").check();
  await expect(p.locator(".bulk")).toContainText("已选 1 人");
  await btn(p, "切换商品").click();
  await p.getByRole("button", { name: /皮划艇可调鱼竿支架/ }).click();
  await expect(p.locator(".bulk")).toHaveCount(0);
  await p.getByLabel("选择 Ethan Brooks").check();
  await expect(btn(p, "批量入围")).toBeDisabled();
  await btn(p, "切换商品").click();
  await p.getByRole("button", { name: /20V 无刷充电电钻套装/ }).click();
  await expect(p.locator(".bulk")).toHaveCount(0);
  await p.getByLabel("选择 Ethan Brooks").check();
  await p.getByLabel("选择 Maya Chen").check();
  await expect(p.locator(".bulk")).toContainText("可入围 1 人");
  await btn(p, "批量入围").click();
  await expect(stageOf("Ethan Brooks")).toHaveText("已入围");
  await expect(stageOf("Maya Chen")).toHaveText("已入围");
  await expect(btn(p, "收藏 Ethan Brooks")).toHaveAttribute("aria-pressed", "false");
});
test("A→B→A 切换 ASIN 后旧选择不复活，批量操作不会作用于隐藏选择", async ({ page: p }) => {
  const pick = async (name) => {
    await btn(p, "切换商品").click();
    await p.getByRole("button", { name }).click();
  };
  await p.getByLabel("选择 Ethan Brooks").check();
  await expect(p.locator(".bulk")).toContainText("已选 1 人");
  await pick(/便携汽车诊断仪/);
  await expect(p.locator(".bulk")).toHaveCount(0);
  await pick(/20V 无刷充电电钻套装/);
  await expect(p.locator(".bulk")).toHaveCount(0);
  await expect(p.getByLabel("选择 Ethan Brooks")).not.toBeChecked();
  await expect(p.locator("tbody tr").filter({ hasText: "Ethan Brooks" }).locator("td").last()).toHaveText("已发现");
});
test("批量加入活动：跳过其他 ASIN，不改变阶段", async ({ page: p }) => {
  await p.getByLabel("选择 Ethan Brooks").check();
  await p.getByLabel("选择 Maya Chen").check();
  await btn(p, "加入活动").click();
  await p.getByLabel("推广活动", { exact: true }).selectOption("冬季工具测评");
  await expect(p.locator(".bulkplan")).toContainText("将加入 1 人");
  await expect(p.locator(".bulkplan")).toContainText("关联其他 ASIN 1 人");
  await btn(p, "确认加入").click();
  await expect(p.getByText(/已加入「冬季工具测评」 1 人，跳过 1 人/)).toBeVisible();
  const stageOf = (name) =>
    p.locator("tbody tr").filter({ hasText: name }).locator("td").last();
  await expect(stageOf("Ethan Brooks")).toHaveText("已发现");
  await p.locator("tbody tr").filter({ hasText: "Maya Chen" }).locator(".person").click();
  await btn(p, "协作").click();
  await expect(p.getByText("尚未加入活动")).toBeVisible();
  await close(p);
  await profile(p);
  await expect(p.getByText(/冬季工具测评 ·/)).toBeVisible();
});
test("跨页面保留发现筛选与看板筛选，看板阶段选择器可用", async ({ page: p }) => {
  await p.getByLabel("搜索创作者").fill("ethan");
  await btn(p, "合作管线").click();
  await p.getByLabel("平台").selectOption("YouTube");
  await p.getByLabel("调整 Ethan Brooks 的阶段").selectOption("已联系");
  const col = p.locator(".board section").filter({ has: p.locator("h3", { hasText: "已联系" }) });
  await expect(col.locator(".kanban", { hasText: "Ethan Brooks" })).toBeVisible();
  await btn(p, "创作者发现").click();
  await expect(p.getByLabel("搜索创作者")).toHaveValue("ethan");
  await expect(row(p).locator("td").last()).toHaveText("已联系");
  await btn(p, "合作管线").click();
  await expect(p.getByLabel("平台")).toHaveValue("YouTube");
});
test("预算、备注与日期：取消离开、确认丢弃、保存与再次打开", async ({
  page: p,
}) => {
  await profile(p);
  const note = p.getByLabel("合作备注"),
    budget = p.getByLabel("预计预算"),
    due = p.getByLabel("截止日期");
  await note.fill("保留草稿");
  await due.fill("2027-01-01");
  await p.keyboard.press("Escape");
  await expect(btn(p, "继续编辑")).toBeFocused();
  await btn(p, "继续编辑").click();
  await expect(note).toHaveValue("保留草稿");
  await expect(due).toHaveValue("2027-01-01");
  await close(p);
  await btn(p, "放弃修改").click();
  await profile(p);
  await expect(note).toHaveValue("");
  await expect(due).toHaveValue("2026-11-17");
  for (const bad of ["1e999", "1e3", "1.005"]) {
    await budget.fill(bad);
    await btn(p, "保存合作资料").click();
    await expect(p.locator("p[role=alert]")).toContainText("保存失败：预算格式无效");
  }
  await budget.fill("10000000000");
  await btn(p, "保存合作资料").click();
  await expect(p.locator("p[role=alert]")).toContainText("预算超过上限 9,999,999,999.99");
  await budget.fill("1,234.50");
  await btn(p, "保存合作资料").click();
  await close(p);
  await profile(p);
  await expect(budget).toHaveValue("1234.5");
  await budget.fill("");
  await note.fill("已复核");
  await btn(p, "保存合作资料").click();
  await close(p);
  await profile(p);
  await expect(budget).toHaveValue("");
  await expect(note).toHaveValue("已复核");
  await budget.fill("0");
  await btn(p, "保存合作资料").click();
  await close(p);
  await profile(p);
  await expect(budget).toHaveValue("0");
});
test("完整档案切页、工作区取消和移动导航", async ({ page: p }) => {
  await profile(p);
  await p.getByLabel("合作备注").fill("临时");
  await btn(p, "完整档案").click();
  await btn(p, "继续编辑").click();
  await expect(p.getByLabel("合作备注")).toHaveValue("临时");
  await btn(p, "完整档案").click();
  await btn(p, "放弃修改").click();
  await btn(p, "协作").click();
  await p.getByLabel("截止日期").fill("2027-02-03");
  await p.locator(".ws").click();
  await btn(p, "新品试验组").click();
  await btn(p, "继续编辑").click();
  await close(p);
  await expect(p.getByLabel("截止日期")).toHaveValue("2027-02-03");
  await btn(p, "返回发现").click();
  await btn(p, "放弃修改").click();
  await p.setViewportSize({ width: 390, height: 844 });
  await expect(btn(p, "工作区设置")).toBeHidden();
  await btn(p, "折叠或展开导航").click();
  await btn(p, "工作区设置").click();
  await expect(p.getByRole("heading", { name: "模拟环境" })).toBeVisible();
});
test("两个工作区的同 ID 记录隔离，三种服务状态", async ({ page: p }) => {
  const switchTo = async (name) => {
    await p.locator(".ws").click();
    await btn(p, name).click();
  };
  const search = p.getByLabel("搜索创作者");
  await search.fill("Kai Palmer");
  await btn(p, "收藏 Kai Palmer").click();
  await switchTo("新品试验组");
  await search.fill("Kai Palmer");
  await expect(btn(p, "收藏 Kai Palmer")).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  await switchTo("美国站运营组");
  await search.fill("Kai Palmer");
  await expect(btn(p, "收藏 Kai Palmer")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  for (const [state, text] of [
    ["加载中", "正在加载模拟资料…"],
    ["服务不可用", "模拟服务暂不可用"],
    ["无创作者", "没有符合条件的创作者"],
  ]) {
    await btn(p, "工作区设置").click();
    await p.getByLabel("模拟服务状态").selectOption(state);
    await btn(p, "创作者发现").click();
    await expect(p.getByText(text, { exact: false }).first()).toBeVisible();
  }
});
test("焦点、双快捷键、四种宽度与路由隔离", async ({ page: p, request }) => {
  for (const key of ["Control+k", "Meta+k"]) {
    await btn(p, "切换商品").focus();
    await p.keyboard.press(key);
    await expect(p.getByLabel("全局搜索关键词")).toBeFocused();
    await p.keyboard.press("Escape");
    await expect(btn(p, "切换商品")).toBeFocused();
  }
  for (const path of [
    "/api/discover",
    "/api/apify/webhook",
    "/api/avatar/creator/0",
    "/creators",
    "/login",
  ])
    expect((await request.get(path)).status()).toBe(404);
  for (const width of [1440, 1024, 768, 390]) {
    await p.setViewportSize({ width, height: 900 });
    await p.evaluate(() => document.fonts.ready);
    expect(
      await p.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width);
    if (process.env.HUB_SCREENSHOTS) {
      await mkdir(process.env.HUB_SCREENSHOTS, { recursive: true });
      await p.screenshot({
        path: `${process.env.HUB_SCREENSHOTS}/hub-${width}.png`,
      });
    }
  }
});
