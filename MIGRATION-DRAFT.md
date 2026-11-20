# 验收后候选契约：React + Vite / FastAPI / PostgreSQL

仅设计草案，未建库、未发布端点。Vite 保留 UI 与独立 MockRepository；生产仓储使用同一接口。路由带工作区及档案 ID，筛选已应用值写入 URL，草稿仍留在组件内存。前端不持有平台凭据。

## HTTP（拟议）

前缀 `/v1/workspaces/{wid}`。每次读取和写入均校验登录用户在 wid 的成员资格；对象 ID 必须同时属于 wid。来源与有效期分开建模。

| 方法与路径 | 输入 | 输出 |
|---|---|---|
| GET /products | cursor、limit | `{items:[{id,asin,niche}],nextCursor}` |
| GET /creators | productId、q、platform、niche、stage、saved、fitMin、highMatch、followersMin/Max、sort、cursor | `{items,total,nextCursor}`；每项含快照、分项分及 scoreVersion。排序以 id 打破平分 |
| GET /creators/{id} | 无 | 档案、证据摘要、合作列表、可见权限 |
| PUT /creators/{id}/bookmark | `{saved:boolean}` | 当前用户的收藏；不创建或推进合作 |
| GET /creators/{id}/evidence | kind、cursor | 来源、观察时间、复核状态、置信度、权限范围；模拟来源不可提升为真实认证 |
| PATCH /collaborations/{id} | `If-Match` 版本；可选 stage、budget、due、note 等 | 新版本、审计事件；缺省字段保留，`budget:null` 清空，`0` 保留零 |
| POST /collaborations/shortlist | 选择项与预期版本、幂等键 | 仅推进已发现项；返回 changed/skipped/conflicts；不更改收藏 |

例：`PATCH .../collaborations/c1`，`If-Match: "7"`，`{"budget":null,"due":"2027-01-01"}` → `200 {"id":"c1","budget":null,"due":"2027-01-01","version":8}`。过期版本 412；无权限 403/不可见资源 404；非法日期、负额、非有限数、无效范围 422。服务端重新计算统计、高匹配与看板分组，不能信任客户端分数或 wid。

## PostgreSQL 逻辑 schema（非执行迁移）

- `workspace(id PK)`、`membership(workspace_id,user_id,role, PK(workspace_id,user_id))`。
- `creator(workspace_id,id,platform,platform_subject,display_name,niche, PK(workspace_id,id), UNIQUE(workspace_id,platform,platform_subject))`；稳定身份不以昵称识别。
- `product(workspace_id,id,market,asin,niche, PK(workspace_id,id), UNIQUE(workspace_id,market,asin))`。
- `bookmark(workspace_id,user_id,creator_id, PRIMARY KEY(workspace_id,user_id,creator_id))`；关联 membership 与 creator 的复合外键。原型是单个模拟操作者的工作区收藏。
- `metric_snapshot(workspace_id,creator_id,observed_at,followers,views,engagement_rate NULL,source_kind)`；未知不写零。`evidence(id,workspace_id,creator_id,kind,source_kind,source_ref,observed_at,status,confidence,reviewer_id)`；kind 区分受众、联盟链接、店铺、原生购物资格。
- `collaboration(workspace_id,id,creator_id,product_id NULL,stage,budget_usd numeric(12,2) NULL,due date,note,deliverable,owner_id,version, PK(workspace_id,id))`；stage 枚举九态，budget 仅允许有限非负金额，字段缺省与 NULL 含义不同。
- `collaboration_event(workspace_id,collaboration_id,id,actor_id,occurred_at,old_stage,new_stage,event_type,request_id)`；更新与事件同事务，request_id 参与幂等。所有跨表业务关系用含 workspace_id 的复合外键，按 workspace+stage、workspace+creator+observed_at 建索引。

迁移门槛：先用同一组契约测试对比内存与 FastAPI 仓储，再验收鉴权、工作区隔离、并发编辑、审计与来源授权。此阶段不执行真实 API、抓取或发送任务。
