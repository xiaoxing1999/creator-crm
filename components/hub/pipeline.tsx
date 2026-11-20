"use client";
import { useEffect, useState } from "react";
import { CalendarClock, GripVertical } from "lucide-react";
import {
  Creator,
  platforms,
  stages,
  products,
  today,
  moveStage,
} from "@/lib/hub";
import { Face, Platform, Select } from "./shared";
import type { Apply } from "./discovery";
export function Pipeline({
  rows,
  open,
  apply,
  memory = {},
  memoryKey = "pipeline",
}: {
  rows: Creator[];
  open: (c: Creator) => void;
  apply: Apply;
  memory?: Record<string, unknown>;
  memoryKey?: string;
}) {
  const kept = (memory[memoryKey] ?? {}) as Partial<
    Record<"p" | "a" | "s", string>
  >;
  const [p, P] = useState(kept.p ?? "全部平台"),
    [a, A] = useState(kept.a ?? "全部 ASIN"),
    [s, S] = useState(kept.s ?? "全部阶段"),
    [over, O] = useState("");
  useEffect(() => {
    memory[memoryKey] = { p, a, s };
  }, [memory, memoryKey, p, a, s]);
  const move = (id: number, stage: string) =>
    apply((r) => moveStage(r, id, stage));
  const list = rows.filter(
    (c) =>
      (p === "全部平台" || c.platform === p) &&
      (a === "全部 ASIN" ||
        (a === "未关联 ASIN"
          ? c.product < 0
          : products[c.product]?.asin === a)),
  );
  return (
    <>
      <div className="panel filterbar">
        <Select
          label="平台"
          options={["全部平台", ...platforms]}
          value={p}
          onChange={P}
        />
        <Select
          label="ASIN"
          options={[
            "全部 ASIN",
            ...products.map((x) => x.asin),
            "未关联 ASIN",
          ]}
          value={a}
          onChange={A}
        />
        <Select
          label="阶段"
          options={["全部阶段", ...stages]}
          value={s}
          onChange={S}
        />
        <small className="hint">
          共 {list.length} 位 · 拖动卡片或使用卡片下方的阶段选择器更改阶段
        </small>
      </div>
      <div className="board">
        {stages
          .filter((x) => s === "全部阶段" || s === x)
          .map((stage) => {
            const cards = list.filter((c) => c.stage === stage);
            return (
              <section
                key={stage}
                aria-label={stage}
                className={over === stage ? "over" : ""}
                onDragOver={(e) => {
                  e.preventDefault();
                  O(stage);
                }}
                onDragLeave={() => O("")}
                onDrop={(e) => {
                  e.preventDefault();
                  O("");
                  const id = Number(e.dataTransfer.getData("text/plain"));
                  if (rows.some((c) => c.id === id)) move(id, stage);
                }}
              >
                <h3>
                  {stage}
                  <span className="count">{cards.length}</span>
                </h3>
                {cards.map((c) => {
                  const late = c.due < today && c.stage !== stages[8];
                  return (
                    <article
                      className="kanbancard"
                      key={c.id}
                      draggable
                      onDragStart={(e) =>
                        e.dataTransfer.setData("text/plain", String(c.id))
                      }
                    >
                      <button className="kanban" onClick={() => open(c)}>
                        <div className="row">
                          <Face c={c} />
                          <b>{c.name}</b>
                          <GripVertical size={14} aria-hidden="true" />
                        </div>
                        <Platform p={c.platform} />
                        <small>
                          {products[c.product]?.asin ?? "未关联 ASIN"} ·{" "}
                          {c.niche}
                        </small>
                        <p>{c.next}</p>
                        <small>
                          {c.campaign || "单次合作"} ·{" "}
                          {c.budget === null
                            ? "预算未知"
                            : `$${c.budget.toLocaleString("en-US")}`}{" "}
                          · {c.operator}
                        </small>
                        <span className={late ? "late" : ""}>
                          <CalendarClock size={13} /> {c.due}{" "}
                          {late ? "已逾期" : ""}
                        </span>
                      </button>
                      <Select
                        label={"调整 " + c.name + " 的阶段"}
                        value={c.stage}
                        options={stages}
                        onChange={(next) => move(c.id, next)}
                      />
                    </article>
                  );
                })}
                {!cards.length && <small>暂无创作者，可拖入卡片</small>}
              </section>
            );
          })}
      </div>
    </>
  );
}
