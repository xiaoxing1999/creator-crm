# Playwright 验收结果

最终运行：7 passed (10.7s)，单 worker，系统 Chromium，基址 http://localhost:3117。详情与精确断言见 `tests/hub.spec.mjs`。每个场景在独立浏览器上下文中开始，拦截所有页面 HTTP(S) 请求并拒绝非同源请求，结束时断言外部请求与页面未捕获错误均为空。

| 场景 | 最终结果（耗时） |
|---|---|
| 搜索、按粉丝排序、切换商品、跨类目被高匹配排除 | 通过（1.0s） |
| 高级筛选应用/取消/Esc/重置、倒置区间 | 通过（1.3s） |
| 收藏与批量入围独立、看板拖放、键盘选择阶段 | 通过（1.4s） |
| 空预算、零、非有限数，备注日期、保留/丢弃、保存重开 | 通过（1.8s） |
| 展开完整档案、取消工作区切换、窄屏导航 | 通过（1.8s） |
| 两工作区同 ID 互不覆盖、加载/空数据/服务不可用 | 通过（1.3s） |
| Ctrl/Cmd+K、搜索初始与返回焦点、四档截图、旧路径 404 | 通过（1.3s） |

运行方法（开发者）：先在无凭据完整工作树启动 `npm run dev`，再在测试目录所属仓库运行 `npx playwright test`。默认 localhost:3000；`HUB_TEST_URL` 可覆盖；`CHROME_BIN` 指向现有 Chrome，未设则使用 Playwright 自带浏览器；`HUB_SCREENSHOTS` 指定截图目录。原型单测在 Node 24 下使用 `node --test tests/hub.test.mjs`。

路由检查：`/api/discover`、`/api/apify/webhook`、`/api/avatar/creator/0`、`/creators`、`/login` 均返回 404，首页 200。业务运行路径不调用外部 API；浏览器证据不等同于对 OS 所有进程的网络抓包。安装 npm 依赖的网络流量不属于业务调用。未对生产环境执行测试。
