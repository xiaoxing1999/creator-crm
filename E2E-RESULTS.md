# Playwright 验收结果

最终运行：11 passed (13.8s)，单 worker，Playwright 自带 Chromium headless shell（v1255），基址 http://localhost:3000（`npm run dev`）。`tests/hub.spec.mjs` 共 11 个场景，下表与之一一对应。每个场景在独立浏览器上下文中开始，拦截所有页面 HTTP(S) 请求并拒绝非同源请求，结束时断言外部请求与页面未捕获错误均为空。

| # | 场景（spec 行号） | 最终结果 |
|---|---|---|
| 1 | 搜索、排序、商品与高匹配（32） | 通过 |
| 2 | 高级条件应用、取消、Esc、重置与无效范围（46） | 通过 |
| 3 | 收藏不改阶段，批量入围同步看板，拖放及键盘调整（71） | 通过 |
| 4 | 切换 ASIN 清空选择，批量入围只作用于当前 ASIN（97） | 通过 |
| 5 | A→B→A 切换 ASIN 后旧选择不复活，批量操作不会作用于隐藏选择（118，新增） | 通过 |
| 6 | 批量加入活动：跳过其他 ASIN，不改变阶段（132，新增） | 通过 |
| 7 | 跨页面保留发现筛选与看板筛选，看板阶段选择器可用（151） | 通过 |
| 8 | 预算（含 1e3、1.005、超上限、千分位）、备注与日期：取消离开、确认丢弃、保存与再次打开（164，扩充） | 通过 |
| 9 | 完整档案切页、工作区取消和移动导航（209） | 通过 |
| 10 | 两个工作区的同 ID 记录隔离，三种服务状态（232） | 通过 |
| 11 | 焦点、双快捷键、四种宽度与路由隔离（263） | 通过 |

首次运行因沙箱缺少 Playwright 浏览器而 0 个执行；`npx playwright install chromium` 后，第二次 9 通过 2 失败（均为测试定位器歧义：`getByLabel("推广活动")` 同时命中对话框与下拉框；`getByRole("alert")` 命中 Next.js 路由播报节点），修正定位器后 11/11 通过。应用代码未因此修改。

运行方法（开发者）：先在无凭据完整工作树启动 `npm run dev`，再在测试目录所属仓库运行 `npx playwright test`。默认 localhost:3000；`HUB_TEST_URL` 可覆盖；`CHROME_BIN` 指向现有 Chrome，未设则使用 Playwright 自带浏览器；`HUB_SCREENSHOTS` 指定截图目录。原型单测在 Node 24 下使用 `node --test tests/hub.test.mjs`。

路由检查：`/api/discover`、`/api/apify/webhook`、`/api/avatar/creator/0`、`/creators`、`/login` 均返回 404，首页 200。业务运行路径不调用外部 API；浏览器证据不等同于对 OS 所有进程的网络抓包。安装 npm 依赖的网络流量不属于业务调用。未对生产环境执行测试。
