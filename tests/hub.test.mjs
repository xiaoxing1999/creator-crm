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
import { seed, products, niches, score } from "../lib/hub.ts";

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
