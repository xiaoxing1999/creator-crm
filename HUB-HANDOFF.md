# Amazon US Creator Hub · Phase A 交接

## 范围与运行边界

这是可交互的本地模拟原型，不是 Amazon 官方服务。Next.js 只编译 `*.hub.tsx` 页面入口；旧 CRM 源码留在仓库以便追溯，但旧后台页面和 API 不在构建路由中。Vercel 定时任务已移除。无需数据库、登录、Amazon、社交平台或邮箱凭据。无邮件发送、抓取、外部数据加载、LibreChat 集成或真实联系人。

## 复用审计

| 来源 | 采用内容 | 未采用内容 |
| --- | --- | --- |
| alongot/creator-crm 及当前分支 | 直接复用 `components/ui/table.tsx` 的语义表格家族、`components/avatar.tsx` 的图片与首字母回退；保留名单检索、阶段分组和跟进记录的交互模型 | 旧页面直接查询 Drizzle，StageMover 使用服务端更新，不能原样用于本地模拟。未导入这些业务组件 |
| oratis/influencex | 参考公开说明，将多平台发现、活动、跟进、归因分开 | 未复制代码、邮件发现或发送流程 |
| Kiranism/next-shadcn-dashboard-starter | 参考公开说明的持久侧栏、全局检索、组合筛选和列表分页 | 不引入其鉴权、计费或整套框架 |
| tigerless-labs/influencer-discovery | 仅参考平台边界与身份去重概念；演示以稳定 ID 跟踪身份 | 未复制实现，未运行采集 |
| stackinfluence/Amazon-Influencer-Finder | 仅参考类目与关键词筛选概念 | 未读取其联系人数据库、服务器函数或邮箱 |

## 组件与状态

- `app/page.hub.tsx` / `layout.hub.tsx`：薄入口与中文元数据。`components/hub/hub.tsx` 管理导航、两个独立演示工作区、目标商品、主题、状态模拟与共享记录。
- `discovery.tsx`：商品上下文、实时指标、筛选、排序、分页、展示模式、批量入围和活动。
- `profile.tsx`：抽屉与完整档案共用组件。表现、证据与协作独立；阶段与负责人即时更新，预算、日期与备注需显式保存。
- `pipeline.tsx`：九阶段横向看板，拖放与档案中的键盘可操作阶段选择使用同一更新方法。
- `shared.tsx`：原生可访问 dialog、下拉框、平台标识和证据标签。依赖 React、Lucide 与仓库已有的 UI primitives。
- `lib/hub.ts`：`service.list(): Creator[]` 返回新演示集合；`service.update(rows, ids, partial): Creator[]` 不可变更新。`factors(creator, productIndex)` 返回相关度、受众、活跃度、商业匹配四项分，最大值分别为 40/25/20/15。评分是排序启发式，不是资格认证。
- 28 位虚构创作者、六个类目、五个平台和三件模拟商品。快照日期固定为 2026-11-19，逾期相对快照计算。图片为本地生成的虚构肖像与商品插图。`example.invalid` 来源仅示范证据格式。

## 设计令牌

`app/hub.css` 中的 `--bg`、`--paper`、`--ink`、`--sub`、`--line`、`--blue`、`--tint`、`--mint` 控制背景、文本、边线、选中与证据状态，`.night` 提供暗色覆盖。品牌蓝 #265EE6，商品上下文深蓝 #152544。卡片圆角 9px，表格行高 64px。中文字体为本地 Noto Sans SC 子集，许可证见 public/hub/OFL.txt。移动端侧栏收入菜单，表格可水平滚动，卡片模式可替代密集表格。

## Codex 审查与迁移路径

1. 在 Vite 中挂载 `Hub`，保留 Tailwind、路径别名和同目录静态资源。当前主视图为内存导航，不提供独立 URL、浏览器回退或深链接；生产版引入路由和 URL 查询参数。
2. 将 service 抽为异步仓储。拟定 `/v1/creators`、`/v1/products`、`/v1/evidence` 和 `/v1/collaborations` 契约；由 FastAPI 实现 PostgreSQL、分页/排序、服务端筛选、版本校验与事务，不移植旧共享密码机制。
3. 权限、真实身份、证据来源授权与审计记录必须先于真实数据接入。地理位置不证明受众分布，Associates 链接、店铺和原生商品标记为独立证据类型。
4. 数据仅驻留在当前页面内存，刷新会重置；没有真实 API、持久化、团队并发、自动归因或发送。设置支持空数据、加载、服务不可用；预算等错误会提示。ROI 未知值不是零，后续模块均标为预览。
5. 移植时补充服务端校验、异步重试、快照刷新、未保存编辑提醒、跨路由状态及持久化测试。自由输入文字可能依赖操作系统字体回退，因为内置字库只覆盖原型文案。
