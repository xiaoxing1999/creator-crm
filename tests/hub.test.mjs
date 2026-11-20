import { test } from "node:test";
import assert from "node:assert/strict";
import { parseBudget } from "../lib/hub.ts";
test("预算：未知、明确零、有限小数与非法数值", () => {
  for (const v of ["", "  "]) assert.equal(parseBudget(v), null);
  assert.equal(parseBudget("0"), 0);
  assert.equal(parseBudget("13.50"), 13.5);
  for (const v of ["Infinity", "NaN", "1e999", "-1", "e"])
    assert.throws(() => parseBudget(v));
});
import {
  seed,
  products,
  niches,
  score,
  shortlist,
  moveStage,
  stages,
  parseBudgetCents,
  applyBulk,
  planBulk,
  inProductScope,
} from "../lib/hub.ts";

test("预算：千分位逗号可解析，非法逗号格式拒绝", () => {
  assert.equal(parseBudget("1,200"), 1200);
  assert.equal(parseBudget("12,345.5"), 12345.5);
  for (const v of ["1,2", "12,00", ",100"]) assert.throws(() => parseBudget(v));
});
test("批量入围：只移动当前 ASIN 的已发现候选，其他保持不变", () => {
  const rows = seed();
  const ethan = rows[0], maya = rows[1];
  const other = rows.find((c) => c.stage === stages[0] && c.product !== 0 && c.product !== -1);
  const ids = [ethan.id, maya.id, ...(other ? [other.id] : [])];
  const r = shortlist(rows, ids, 0);
  assert.deepEqual(r.moved, [ethan.id]);
  assert.equal(r.skipped, ids.length - 1);
  assert.equal(r.rows[0].stage, stages[1]);
  assert.equal(r.rows[1].stage, maya.stage);
  if (other) assert.equal(r.rows.find((c) => c.id === other.id).stage, stages[0]);
  assert.equal(r.rows[0].saved, ethan.saved, "入围不改收藏");
});
test("预算：严格十进制、最多两位小数、明示上限", () => {
  assert.equal(parseBudget("1,234.50"), 1234.5);
  assert.equal(parseBudget("0.5"), 0.5);
  assert.equal(parseBudgetCents("9,999,999,999.99"), 999999999999);
  for (const v of ["1e3", "1E3", "0x10", "0b1", "1.005", "+1", ".5", "1.", "007", "1 000", "１２"])
    assert.throws(() => parseBudget(v), /格式无效/, v);
  for (const v of ["10000000000", "10,000,000,000.00"])
    assert.throws(() => parseBudget(v), /超过上限/, v);
});
test("批量加入活动：与入围共用 ASIN 范围，不改阶段与收藏，记录原因", () => {
  const rows = seed();
  const ethan = rows[0], maya = rows[1];
  const action = { kind: "campaign", campaign: "冬季工具测评" };
  const r = applyBulk(rows, [ethan.id, maya.id, 99999, ethan.id], 0, action);
  assert.deepEqual(r.changed, [ethan.id]);
  assert.deepEqual(
    r.skipped.map((s) => s.reason).sort(),
    ["missing", "other-asin"],
  );
  const e = r.rows[0];
  assert.equal(e.campaign, "冬季工具测评");
  assert.equal(e.stage, ethan.stage);
  assert.equal(e.saved, ethan.saved);
  assert.equal(r.rows[1].campaign, maya.campaign, "其他 ASIN 不被修改");
  const again = planBulk(r.rows, [ethan.id], 0, action);
  assert.deepEqual(again.skipped, [{ id: ethan.id, reason: "no-change" }]);
});
test("批量入围与加入活动对 ASIN 范围的判定一致", () => {
  const rows = seed();
  for (const p of products.keys()) {
    const ids = rows.map((c) => c.id);
    const other = (a) =>
      planBulk(rows, ids, p, a).skipped
        .filter((s) => s.reason === "other-asin")
        .map((s) => s.id);
    assert.deepEqual(
      other({ kind: "shortlist" }),
      other({ kind: "campaign", campaign: "__new__" }),
    );
    for (const c of rows)
      assert.equal(!other({ kind: "shortlist" }).includes(c.id), inProductScope(c, p));
  }
});
test("阶段移动：同列放下不写历史，收藏不受影响", () => {
  const rows = seed();
  assert.equal(moveStage(rows, 0, rows[0].stage)[0].history.length, rows[0].history.length);
  const moved = moveStage(rows, 0, stages[2])[0];
  assert.equal(moved.stage, stages[2]);
  assert.equal(moved.saved, rows[0].saved);
});

test("编号 0：家装达人不能高匹配皮划艇鱼竿支架", () => {
  const ethan = seed()[0];
  assert.ok(score(ethan, 2) < 80, `跨类目得分 ${score(ethan, 2)}`);
  assert.ok(score(ethan, 0) >= 80);
});
test("所有商品：高匹配必须同类目，结果有界且不依赖任意身份编号", () => {
  for (const c of seed())
    for (const [p, product] of products.entries()) {
      const n = score(c, p);
      assert.ok(n >= 0 && n <= 100);
      if (n >= 80) assert.equal(c.niche, niches[product.niche]);
      assert.equal(n, score({ ...c, id: 999 }, p));
    }
});
