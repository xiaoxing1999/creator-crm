# API 契约草案（FastAPI，供下一阶段实现）

> 状态：**设计草案，尚未实现**。当前原型没有任何 HTTP 接口，下列接口由
> `lib/hub.ts` 中已被测试覆盖的纯函数反推得到。实现时以这些函数的行为与
> `tests/hub.test.mjs` 为准。

## 通用约定

- 前缀 `/api/v1`，JSON，UTF-8，时间为 ISO 8601（UTC），日期为 `YYYY-MM-DD`。
- 所有资源都属于工作区：路径带 `/workspaces/{workspace_id}`，服务端必须按工作区和
  当前用户授权过滤（原型已验证两个工作区同 ID 记录互相隔离）。
- 金额：字符串十进制或整数分，禁止浮点。字段 `budget` 对应 `numeric(12,2)`，
  上限 `9,999,999,999.99`，最多两位小数（规则同 `parseBudgetCents`）。
- 并发：可修改资源返回 `version`（整数）。`PATCH` 必须带 `If-Match: <version>`，
  不匹配返回 `409 Conflict`。
- 幂等：所有 `POST` 写操作支持 `Idempotency-Key` 请求头，24 小时内重复请求返回首次结果。
- 错误体：`{ "error": { "code": "string", "message": "string", "details": {} } }`。
- 分页：`?cursor=&limit=`（默认 50，最大 200），返回 `{ items, next_cursor }`。

## 商品（ASIN）

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/workspaces/{ws}/products` | 商品列表：`id, asin, name, niche, use, model` |

## 创作者与匹配

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/workspaces/{ws}/creators` | 查询：`q, platform, niche, product_id, tab=all\|high\|saved, sort=score\|followers\|er\|recent` |
| GET | `/workspaces/{ws}/creators/{id}` | 档案详情（含证据、合作记录、历史） |
| GET | `/workspaces/{ws}/creators/{id}/match?product_id=` | 返回 `score` 与四项 `factors`（类目 40 / 美国受众 25 / 活跃度 20 / 联盟证据 13） |
| PUT | `/workspaces/{ws}/creators/{id}/saved` | 收藏 / 取消收藏，**不改变阶段** |

高匹配定义：同类目 **且** `score >= 80`（`highMatch`）。

## 合作记录（每个创作者 × 商品一条）

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| PATCH | `/workspaces/{ws}/collaborations/{id}` | 修改 `stage, operator, sample, budget, due, deliverable, note`；需 `If-Match` |
| POST | `/workspaces/{ws}/collaborations/{id}/stage` | `{ "stage": "已联系" }`；同阶段为空操作且**不写历史** |
| POST | `/workspaces/{ws}/collaborations/{id}/tasks` | 添加跟进事项 `{ text, due }` |

## 批量操作

`POST /workspaces/{ws}/bulk`

```json
{ "action": "shortlist" | "add_to_campaign", "product_id": "...", "creator_ids": ["..."], "campaign": "新品首发" }
```

响应：

```json
{ "applied": ["id"], "skipped": [{ "id": "...", "reason": "missing|other-asin|not-discovered|no-change" }] }
```

规则（与 `planBulk / bulkSkipReason` 一致）：

- 两种动作使用同一套 ASIN 范围判定：创作者必须属于当前商品；未关联 ASIN 视为范围外。
- `shortlist` 只作用于 `已发现` 阶段，改为 `已入围`。
- `add_to_campaign` 只写 `campaign`，**不改变阶段和收藏**。
- 每条跳过都返回原因，前端汇总展示。

## 历史

`GET /workspaces/{ws}/creators/{id}/history` — 只追加的事件列表：`{ at, actor, type, payload }`。

## 达人数据源（下一阶段）

`POST /workspaces/{ws}/sources/{source}/sync` 发起同步任务，`GET /jobs/{id}` 查询状态。
仅允许测试/沙箱凭据，凭据只存放在服务端环境变量，永不下发前端。

## 明确不做

不发送真实邮件、不调用生产第三方 API、不部署生产、不整合 LibreChat。
