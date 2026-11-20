# 数据模型

## 1. 当前 Mock 模型（`lib/hub.ts`）

原型把所有字段放在一个扁平的 `Creator` 对象里（`seed()` 生成 28 条虚构记录）：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | number | 0–27，工作区内唯一 |
| `name`, `handle` | string | 虚构姓名与账号 |
| `platform` | YouTube / Instagram / TikTok / Facebook / Pinterest | |
| `niche` | 6 个类目之一 | 家装工具、汽车维修、房车养护、复古灯具修复、小型发动机维修、皮划艇垂钓 |
| `followers`, `views` | number | 粉丝与均播 |
| `er` | number \| null | 互动率，null 表示未知 |
| `loc`, `us` | string, 0–3 | 所在地与美国受众档位 |
| `affiliate` | 0–3 | 联盟证据档位（模拟已核验 / 已发现证据 / 未核验 / 未知） |
| `store` | boolean | 是否有店铺 |
| `days` | number | 最近发布距今天数 |
| `stage` | 9 阶段之一 | 已发现 → 已入围 → 已联系 → 已回复 → 洽谈中 → 已寄样 → 内容审核 → 已发布 → 已完成 |
| `saved` | boolean | 收藏 |
| `product` | number | 商品索引，`-1` = 未关联 ASIN |
| `campaign` | string | 活动名，空 = 未加入 |
| `operator`, `sample`, `budget`, `due`, `deliverable`, `note`, `next` | | 合作字段 |
| `history` | string[] | 操作历史（仅追加） |
| `review` | string | 内容审核状态 |

商品：3 个虚构 ASIN（`B0MOCK001A / 002B / 003C`）。“今天”固定为 `2026-11-19`，
保证逾期判定与截图可复现。

## 2. 建议的 PostgreSQL 模型（下一阶段）

扁平对象需拆分：创作者是全局实体，合作关系是“工作区 × 创作者 × 商品”。

```sql
create table workspaces (
  id uuid primary key, name text not null, created_at timestamptz not null default now()
);
create table products (
  id uuid primary key, workspace_id uuid not null references workspaces,
  asin text not null, name text not null, niche text not null, use_case text, model text,
  unique (workspace_id, asin)
);
create table creators (
  id uuid primary key, display_name text not null, handle text not null,
  platform text not null, niche text, location text, us_audience_tier smallint,
  followers integer, avg_views integer, engagement_rate numeric(5,2),
  affiliate_evidence smallint, has_storefront boolean, last_post_at date,
  source text not null, source_ref text, unique (platform, handle)
);
create table workspace_creators (            -- 收藏等工作区级状态
  workspace_id uuid references workspaces, creator_id uuid references creators,
  saved boolean not null default false, primary key (workspace_id, creator_id)
);
create table collaborations (
  id uuid primary key, workspace_id uuid not null references workspaces,
  creator_id uuid not null references creators, product_id uuid references products,
  stage text not null check (stage in ('已发现','已入围','已联系','已回复','洽谈中','已寄样','内容审核','已发布','已完成')),
  campaign text, operator_id uuid, sample_status text, budget numeric(12,2) check (budget >= 0),
  due_date date, deliverable text, note text, review_status text,
  version integer not null default 1, updated_at timestamptz not null default now(),
  unique (workspace_id, creator_id, product_id)
);
create table follow_up_tasks (
  id uuid primary key, collaboration_id uuid not null references collaborations,
  text text not null, due_date date, done boolean not null default false
);
create table activity_events (               -- 只追加
  id bigserial primary key, workspace_id uuid not null, collaboration_id uuid,
  actor_id uuid, type text not null, payload jsonb not null, at timestamptz not null default now()
);
create table idempotency_keys (
  key text primary key, workspace_id uuid not null, response jsonb not null,
  created_at timestamptz not null default now()
);
```

映射要点：`product = -1` → `product_id is null`；`history` → `activity_events`；
`saved` 从合作记录移到 `workspace_creators`；匹配分数在服务端实时计算，不落库。
