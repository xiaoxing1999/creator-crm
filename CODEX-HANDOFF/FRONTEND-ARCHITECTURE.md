# 前端架构（基线 8c1f690）

## 1. 运行形态

- 框架：Next.js 16.2.4（App Router、Turbopack）+ React 19.2.4 + TypeScript 5。
- 唯一可路由入口：`next.config.ts` 设置 `pageExtensions: ["hub.tsx"]`，因此只有
  `app/layout.hub.tsx` 与 `app/page.hub.tsx` 参与路由，构建产物只有 `/` 与 `/_not-found`
  （见 `TEST-LOGS/build.log`、`TEST-LOGS/routes.log`）。
- `/` 渲染 `components/hub/hub.tsx` 中的 `<Hub />`，它是纯客户端组件（`"use client"`）。
- 全部数据来自 `lib/hub.ts` 的内存 Mock（`seed()`），**没有任何网络请求、数据库访问或持久化**。
  刷新页面即恢复初始数据。

## 2. 目录分层

| 路径 | 作用 | 状态 |
| --- | --- | --- |
| `app/layout.hub.tsx`、`app/page.hub.tsx` | Hub 原型入口 | 生效 |
| `app/hub.css` | Hub 全部样式与浅/深色变量 | 生效 |
| `components/hub/*.tsx` | Hub 视图组件 | 生效 |
| `lib/hub.ts` | Mock 数据、领域规则、`service` 门面 | 生效 |
| `public/hub/*` | 头像、商品图、CJK 字体子集（OFL） | 生效 |
| `tests/hub.test.mjs`、`tests/hub.spec.mjs` | 单元与 Playwright 测试 | 生效 |
| `scripts/hub-font-subset.py` | 重新生成 CJK 字体子集 | 工具 |
| `app/page.tsx`、`app/layout.tsx`、`app/api/*`、`app/{campaigns,candidates,creators,login,outreach,pipeline}`、`components/{sidebar,avatar,activity-icon}.tsx`、`components/ui/*`、`lib/{ai-scoring,apify-client,outreach-prompt,...}.ts`、`lib/db/*`、`drizzle.config.ts`、`scripts/seed-from-csv.ts` | 旧版 creator-crm（Neon + Drizzle + Anthropic + Resend + Apify） | **不可路由、不在原型中执行**，仅作参考保留 |

> 旧版代码中的 API 路由在本基线下全部返回 404（见 `routes.log`）。
> 下一阶段不应复用它们直接上线：其中包含真实发信（Resend）、真实抓取（Apify）和 LLM 调用。

## 3. 状态管理

`<Hub />` 用 `useState` 持有全部会话状态，没有全局 store：

- `sets[work]`：两个工作区各自独立的 `Creator[]`（同 ID 互不影响，有 E2E 覆盖）。
- `view`：当前导航页（0–8），`full`：是否打开完整档案页，`active`：当前创作者 ID。
- `p`：当前商品索引（ASIN），`dark`：深色主题，`sim`：模拟服务状态
  （`正常 / 加载中 / 无创作者 / 服务不可用`）。
- `dirty` + `guard(action)`：档案表单有未保存修改时拦截离开，弹出确认。
- 筛选条件在 `Hub` 层保存，跨页面切换保留（E2E 覆盖）。
- `Discovery` 以 `key` 绑定 `work / p / 数据范围`，切换 ASIN 或工作区时重新挂载，
  从而清空多选状态，避免隐藏选择在 A→B→A 后复活。

所有写操作都经过 `apply(fn)` / `update(ids, patch)`，最终调用 `lib/hub.ts` 中的纯函数
（`service.update / shortlist / applyBulk / moveStage`）。这些纯函数就是将来替换为真实
API 的接缝。

## 4. 页面与组件关系

```
Hub (hub.tsx)
├─ 侧栏导航 / 工作区切换 / 顶栏（⌘K、/ 搜索快捷键、通知）
├─ view 1 创作者发现 / view 2 创作者数据库 → ProductBanner + Stats + Discovery
├─ view 4 合作管线 → Pipeline（拖放 + 键盘 + 阶段选择器）
├─ 档案抽屉 / 完整档案 → Profile（概览 / 证据 / 协作 三个标签）
├─ view 8 工作区设置 → 主题与模拟服务状态
└─ view 0/3/5/6/7 → 只读“模块预览”（基于同一份 Mock 的简易列表）
```

## 5. 下一阶段目标架构（不在本包中实现）

下一阶段由 Codex 重新开发为**独立**的：

- 前端：React + Vite（SPA），复用本原型的交互规则、组件拆分和样式变量。
- 后端：FastAPI（Python），契约见 `API-CONTRACT.md`。
- 数据库：PostgreSQL，模型见 `DATA-MODEL.md`。
- 达人数据源接入与合作管理（阶段流转、样品、预算、交付、跟进）。

约束：不连接生产 API、不发送真实邮件、不部署生产环境、不整合 LibreChat。

迁移建议：先把 `lib/hub.ts` 的纯函数逐条翻译为 Python 领域服务并保留同名单元测试，
再让前端通过一个 `CreatorRepository` 接口（Mock 实现 / HTTP 实现）切换数据来源。
