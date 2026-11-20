# 组件清单

## Hub 原型（生效代码）

| 组件 / 模块 | 文件 | 行数 | 职责 |
| --- | --- | --- | --- |
| `Hub` | `components/hub/hub.tsx` | 594 | 外壳：导航、工作区切换、顶栏、搜索、通知、模拟状态、各 view 分发、未保存拦截、toast |
| `ProductBanner` | `components/hub/discovery.tsx` | — | 当前商品卡片与“切换商品” |
| `Stats` | `components/hub/discovery.tsx` | — | 四个指标卡（总数 / 高匹配 / 含联盟证据 / 收藏） |
| `Discovery` | `components/hub/discovery.tsx` | 645（文件） | 创作者列表：标签、搜索、平台 / 类目筛选、排序、列表 / 网格、多选、批量入围、批量加入活动 |
| `Pipeline` | `components/hub/pipeline.tsx` | 153 | 9 列看板：平台 / ASIN / 阶段筛选，拖放与键盘移动，阶段选择器 |
| `Profile` | `components/hub/profile.tsx` | 363 | 档案：概览 / 证据 / 协作标签；合作表单（阶段、负责人、样品、预算、截止日期、交付、备注）、跟进事项、历史 |
| `Face` | `components/hub/shared.tsx` | — | 头像（图片或首字母） |
| `Platform` | `components/hub/shared.tsx` | — | 平台图标 + 名称 |
| `Evidence` | `components/hub/shared.tsx` | — | 联盟证据徽标 |
| `Select` | `components/hub/shared.tsx` | — | 带无障碍标签的原生下拉 |
| `Modal` | `components/hub/shared.tsx` | — | 对话框（焦点管理、Esc 关闭） |

## 领域模块 `lib/hub.ts`（240 行，纯函数）

| 导出 | 说明 |
| --- | --- |
| `platforms / niches / stages / evidence / products` | 枚举与 3 个虚构商品 |
| `seed()` / `Creator` | 28 条虚构创作者 |
| `factors / score / highMatch` | 匹配评分（同类目且 ≥ 80 为高匹配） |
| `parseBudgetCents / parseBudget / BUDGET_MAX_*` | 严格十进制预算解析 |
| `inProductScope / UNASSIGNED` | ASIN 范围判定 |
| `bulkSkipReason / planBulk / applyBulk / summarizeSkips / skipLabels` | 批量操作计划与跳过原因 |
| `shortlistable / shortlist` | 批量入围 |
| `moveStage` | 阶段移动（同阶段不写历史） |
| `service` | 未来替换为 HTTP 的门面：`list / update / shortlist / applyBulk / moveStage` |

## 视图完成度

| view | 页面 | 状态 |
| --- | --- | --- |
| 1 | 创作者发现 | 完整 Mock 功能 |
| 2 | 创作者数据库 | 完整 Mock 功能（复用 Discovery） |
| 4 | 合作管线 | 完整 Mock 功能 |
| — | 档案抽屉 / 完整档案 | 完整 Mock 功能 |
| 8 | 工作区设置 | 完整 Mock 功能（主题、模拟服务状态） |
| 0 | 工作概览 | 模块预览（只读简表） |
| 3 | ASIN 匹配 | 模块预览（商品目录，点击跳转发现） |
| 5 | 内容核验 | 模块预览（只读列表） |
| 6 | 活动 ROI | 模块预览（只读） |
| 7 | 跟进任务 | 模块预览（只读列表） |

## 旧版 creator-crm（不可路由，仅参考）

`components/sidebar.tsx`、`components/avatar.tsx`、`components/activity-icon.tsx`、
`components/ui/*`（shadcn 风格基础组件）、`app/page.tsx`、`app/today-task-row.tsx` 等。
