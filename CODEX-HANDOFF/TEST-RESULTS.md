# 测试结果（基线 8c1f690，2026-11-19 / 20 UTC 实测）

所有原始日志在 `TEST-LOGS/`，均为本轮实际运行输出。

| 检查 | 命令 | 结果 | 日志 |
| --- | --- | --- | --- |
| 干净构建 | 新 worktree，`env -i` 空环境：`npm ci` + `next build` | **PASS**（`npm_ci_exit=0`、`build_exit=0`，路由 `/`、`/_not-found`） | `build.log` |
| 类型检查 | `npx tsc --noEmit` | **PASS**（exit 0，无诊断） | `typecheck.log` |
| 单元测试 | `node --test tests/hub.test.mjs` | **PASS 11 / 11** | `unit.log` |
| Playwright E2E | `npx playwright test tests/hub.spec.mjs`（Chromium，dev server :3000） | **PASS 11 / 11**（16.5s） | `playwright.log` |
| 路由隔离 | curl dev server | `/` 200；`/api/discover`、`/api/apify/webhook`、`/api/avatar`、`/creators`、`/pipeline`、`/login` 均 404 | `routes.log` |
| 依赖审计 | `npm audit --json` | 14 项（1 critical、4 high、9 moderate），详见 `SECURITY-AUDIT.md` | `npm-audit.json`、`npm-audit.txt` |
| Lint | — | **NOT RUN**：项目未安装 ESLint，也没有 `lint` 脚本 | — |

## 测试环境说明

- Node v24.16.0、npm 11.13.0、Next.js 16.2.4、Playwright Chromium（`npx playwright install chromium`）。
- 首次运行 Playwright 时沙箱缺少 Chromium，11 个用例全部因浏览器缺失而未执行；执行
  `npx playwright install chromium` 后重跑，11 个全部通过。`playwright.log` 为通过的那次。
- 截图：`HUB_SCREENSHOTS=<目录>` 环境变量让 spec 输出四种宽度截图；三张深色截图由一次性
  脚本拍摄（脚本未进入仓库）。

## 用例覆盖

单元（`tests/hub.test.mjs`）：预算严格解析与上限；批量加入活动不改阶段 / 收藏并记录原因；
两种批量动作 ASIN 范围一致；同列放下不写历史；跨类目不得高匹配；所有商品高匹配同类目；
CJK 字体子集无缺字等。

E2E（`tests/hub.spec.mjs`）：收藏不改阶段 + 批量入围同步看板 + 拖放与键盘；切换 ASIN
清空选择；A→B→A 旧选择不复活；批量加入活动跳过其他 ASIN；跨页面保留筛选；预算 / 备注 /
日期的取消、丢弃、保存与再次打开；完整档案切页、工作区取消、移动导航；两个工作区同 ID
隔离与三种服务状态；焦点、双快捷键、四种宽度与路由隔离。
