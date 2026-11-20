import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";

function codepoints(file) {
  const b = readFileSync(file);
  const tables = b.readUInt16BE(4);
  let cmap = 0;
  for (let i = 0; i < tables; i++) {
    const at = 12 + i * 16;
    if (b.toString("latin1", at, at + 4) === "cmap") cmap = b.readUInt32BE(at + 8);
  }
  const set = new Set();
  const subtables = b.readUInt16BE(cmap + 2);
  for (let i = 0; i < subtables; i++) {
    const off = cmap + b.readUInt32BE(cmap + 4 + i * 8 + 4);
    const format = b.readUInt16BE(off);
    if (format === 4) {
      const segs = b.readUInt16BE(off + 6) / 2;
      const ends = off + 14,
        starts = ends + segs * 2 + 2;
      for (let s = 0; s < segs; s++) {
        const end = b.readUInt16BE(ends + s * 2),
          start = b.readUInt16BE(starts + s * 2);
        if (start !== 0xffff) for (let c = start; c <= end; c++) set.add(c);
      }
    } else if (format === 12) {
      const groups = b.readUInt32BE(off + 12);
      for (let g = 0; g < groups; g++) {
        const at = off + 16 + g * 12;
        for (let c = b.readUInt32BE(at); c <= b.readUInt32BE(at + 4); c++) set.add(c);
      }
    }
  }
  return set;
}

const sources = [
  ...readdirSync("components/hub").map((f) => "components/hub/" + f),
  "lib/hub.ts",
  "app/layout.hub.tsx",
  "app/page.hub.tsx",
];

for (const font of ["public/hub/hub-cjk.ttf", "public/hub/hub-cjk-bold.ttf"])
  test(`${font} 覆盖界面中的全部中文字符`, () => {
    const have = codepoints(font);
    const missing = new Set();
    for (const file of sources)
      for (const ch of readFileSync(file, "utf8").replace(/\/\/.*$/gm, ""))
        if (/[\u3000-\u9fff\uff00-\uffef]/.test(ch) && !have.has(ch.codePointAt(0)))
          missing.add(ch);
    assert.deepEqual([...missing], []);
  });
