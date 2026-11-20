# CODEX-HANDOFF：Amazon US Creator Hub 前端收尾

- 审核基线：`a532e4d`（分支 `fix/hub-prototype-audit`），本轮在其上增量修改，未重建、未合并 `main`。
- 范围：仅前端原型。全部为虚构数据；未接生产数据库、未接真实达人 API、未改 LibreChat。
- 旧业务代码（`app/api/*`、`scripts/*.ts` 中的 Neon/抓取脚本）未改动，Hub 入口与之隔离。

## 564b96b 审核后 P0 修复（分支 `fix/hub-564b96b-p0-seal`）

| 文件 | 改动 |
| --- | --- |
| `lib/hub.ts` | 新增 `inProductScope` / `planBulk` / `applyBulk`：批量入围与批量加入活动共用同一 ASIN 范围判定，逐条返回跳过原因（`missing` / `other-asin` / `not-discovered` / `no-change`）。新增 `parseBudgetCents`：仅接受非负十进制与合法千分位、最多两位小数，拒绝科学计数、十六进制、前导零、全角数字等；上限 9,999,999,999.99，以整数分计算（< 2^53）。 |
| `components/hub/discovery.tsx` | 选择以 ASIN/工作区/范围为键，A→B→A 不再复活旧选择；批量加入活动显示"将加入 / 跳过"计划并走 `applyBulk`，不改阶段与收藏。 |
| `components/hub/hub.tsx` | `Discovery` 挂载键加入数据范围，切换后组件状态重置。 |
| `components/hub/profile.tsx` | 预算错误以 `role="alert"` 显示具体原因（格式无效 / 超过上限）。 |
| `public/hub/hub-cjk*.ttf` | 新增文案后用 `scripts/hub-font-subset.py` 重新生成（474 字）。 |
| `tests/hub.test.mjs` | +3：严格预算格式与上限；批量加入活动范围与原因；两种批量操作范围判定一致。 |
| `tests/hub.spec.mjs` | +2 场景（A→B→A、批量加入活动），预算场景扩充。 |

验证（本轮，提交 81ebff6，Node v24.16.0 / npm 11.13.0；日志见 `TEST-LOGS/`）：

| 检查 | 结果 |
| --- | --- |
| 隔离工作树 `npm ci`（`env -i`，无 .env） | 退出 0 |
| 隔离工作树 `npm run build` | 退出 0，路由只有 `/` 与 `/_not-found` |
| `tsc --noEmit` | 退出 0 |
| `node --test --experimental-strip-types tests/hub.test.mjs tests/glyphs.test.mjs` | 11 / 11 通过 |
| Playwright | 11 / 11 通过（含 A→B→A、跨商品加入活动、预算格式、筛选与草稿保护） |
| 旧 CRM 路由（dev 服务器 curl） | `/api/discover`、`/api/apify`、`/api/avatar`、`/campaigns`、`/creators`、`/pipeline`、`/login` 均 404 |
| 外网请求 | Playwright fixture 拦截非本源请求并断言为空；深色截图脚本同样记录为空 |
| 截图 | 1440/1024/768/390 与三张深色主题均已重拍并人工查看 |

本文件仅为开发自检记录，不构成独立审核签字。

## P1 架构问题（交给 Codex，本轮不实现）

1. **同步调用不能直接换成 API。** `discovery.tsx`、`pipeline.tsx`、`profile.tsx` 现在同步调用 `service.shortlist` / `moveStage` / `applyBulk`，然后立刻写入本地状态。只把 `service` 换成 fetch 不够。后端需要异步 Repository + UseCase 层，前端要处理 pending / 失败回滚 / 冲突提示。
2. **写操作必须有版本检查与幂等。** 每条合作记录带 `version`（乐观锁），批量操作带客户端生成的 `Idempotency-Key`。服务端按 `planBulk` 的同一规则重新判定 ASIN 范围，并返回 changed / skipped 明细。不能信任前端的计划结果。
3. **金额。** 前端 `parseBudgetCents` 只做输入校验。生产环境用 `numeric(12,2)` 或整数分 `bigint` 存储，服务端用 Decimal 或整数分计算，不用 JS Number 作为最终财务值。
4. **生产数据模型拆分**（不要在 v0 封版中开发）：
   - `Identity`（真人）1—N `SocialAccount`（平台账号、粉丝等快照）
   - `Product`（ASIN）
   - `Collaboration`（Identity × Product × Workspace，阶段、预算、负责人、版本号）：一个真人可以有多个 ASIN 合作
   - `Evidence`（关联 Collaboration 或 SocialAccount）
   - `Event`（只追加的操作历史）
   - `Bookmark`（用户 × Identity 收藏，与合作阶段独立）
5. 加入推广活动不等于入围；收藏不改变阶段。两条规则在后端 UseCase 中也必须保持。

## 上一轮改动清单（a532e4d → 564b96b）

| 文件 | 改动 |
| --- | --- |
| `lib/hub.ts` | 新增纯函数 `shortlistable` / `shortlist(rows, ids, product)`：只移动"已发现"且属于当前 ASIN（或未关联 ASIN）的达人，返回 `moved` / `skipped`，写入带 ASIN 的历史；`moveStage` 同列放下不写历史；`parseBudget` 支持 `1,200` 千分位，拒绝 `1,2` 等非法格式。均挂到 `service`，便于替换真实后端。 |
| `components/hub/hub.tsx` | 增加行级 `apply(fn)` 更新入口；增加按视图和工作区区分的 `memory`，发现页与看板筛选在切页后保留。 |
| `components/hub/discovery.tsx` | 切换 ASIN、工作区或列表范围时清空选择；批量栏显示"已选 N 人 / 可入围 M 人"，没有可入围达人时禁用按钮，并提示跳过人数；批量入围走 `service.shortlist`；不改收藏。高级筛选显示生效条件数。 |
| `components/hub/pipeline.tsx` | 卡片结构重排；每张卡片下方增加可用键盘操作的阶段选择器（`调整 {name} 的阶段`）；同列拖放不再产生变更；平台 / ASIN / 阶段筛选写入 `memory`。 |
| `app/hub.css` | 新卡片、筛选徽标、批量提示样式；深色主题下修正证据、逾期和平台标签等硬编码色的对比度。 |
| `public/hub/hub-cjk*.ttf` | 由 `scripts/hub-font-subset.py` 按源码实际用字从 Noto Sans SC 重新生成子集，修复"且"等字缺字形。 |
| `tests/glyphs.test.mjs` | 新增：校验界面全部中文字符都在两份字体子集内。 |
| `tests/hub.test.mjs` | 新增：千分位预算、批量入围仅作用于当前 ASIN 且不改收藏、同列移动不写历史。 |
| `tests/hub.spec.mjs` | 新增 E2E：切换 ASIN 清空选择且跨 ASIN 不可入围；跨页面保留发现与看板筛选，看板阶段选择器可用。 |

收藏（`saved`）与合作阶段（`stage`）在数据与界面上互相独立，单元测试和 E2E 都有断言。

## 上一轮验证结果（564b96b 时点；日志见 `TEST-LOGS/`。注：当时 E2E-RESULTS.md 写 7 passed 与此处 9/9 不一致，已在本轮以 11/11 实测结果统一）

| 检查 | 结果 |
| --- | --- |
| `node --test --experimental-strip-types tests/hub.test.mjs tests/glyphs.test.mjs` | 8 / 8 通过 |
| `tsc --noEmit` | 0 错误 |
| 隔离工作树 `npm ci` + `npm run build`（`env -i`，无任何 .env） | 退出 0，路由只有 `/` |
| Playwright（隔离 dev，端口 3117） | 9 / 9 通过 |

截图位于 `SCREENSHOTS/`：`hub-390/768/1024/1440.png`（四种宽度），`hub-dark-discovery/kanban/profile.png`（深色主题的发现页、看板、档案速览）。深色主题由"工作区设置 → 显示主题"切换，不跟随系统 `prefers-color-scheme`。

## 已知限制 / 交给 Codex

1. 状态只存在客户端内存，刷新会丢失。`lib/hub.ts` 的 `service` 集中了业务规则，但它是同步接口，接入后端时需要按上文"P1 架构问题"改为异步 UseCase，不能只替换函数实现。
2. 深色主题是应用内开关，未跟随系统设置，也未持久化。
3. 未保存草稿保护覆盖档案内的预算、备注和日期：应用内切页、关闭档案时会确认，刷新或关闭标签由 `beforeunload` 提示；草稿本身不持久化。
4. 匹配分规则（同类目且 ≥ 80 才算高匹配）是演示规则，真实评分需由后端提供。
5. 字体子集只含当前源码用字；新增中文文案后需重跑 `python3 scripts/hub-font-subset.py`，`glyphs.test.mjs` 会发现遗漏。
6. 组件仅依赖 React 与 `app/hub.css`，不依赖 Next 专有 API（入口 `app/page.hub.tsx` 除外），可直接迁移。
