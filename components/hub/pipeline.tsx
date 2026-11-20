"use client";
import { useState } from "react";
import { CalendarClock, GripVertical } from "lucide-react";
import { Creator, platforms, stages, products, today } from "@/lib/hub";
import { Face, Platform, Select } from "./shared";
import type { Changed } from "./discovery";
export function Pipeline({
  rows,
  open,
  update,
}: {
  rows: Creator[];
  open: (c: Creator) => void;
  update: Changed;
}) {
  const [p, P] = useState("全部平台"),
    [a, A] = useState("全部 ASIN"),
    [s, S] = useState("全部阶段");
  const list = rows.filter(
    (c) =>
      (p === "全部平台" || c.platform === p) &&
      (a === "全部 ASIN" || products[c.product]?.asin === a),
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
          options={["全部 ASIN", ...products.map((x) => x.asin)]}
          value={a}
          onChange={A}
        />
        <Select
          label="阶段"
          options={["全部阶段", ...stages]}
          value={s}
          onChange={S}
        />
      </div>
      <p className="hint">
        拖动卡片更改阶段，也可在创作者的「协作」标签中选择阶段。
      </p>
      <div className="board">
        {stages
          .filter((x) => s === "全部阶段" || s === x)
          .map((stage) => (
            <section
              key={stage}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const id = e.dataTransfer.getData("text/plain");
                const c = rows.find((c) => String(c.id) === id);
                if (c)
                  update([c.id], {
                    stage,
                    history: [...c.history, "阶段变更：" + stage],
                  });
              }}
            >
              <h3>
                {stage}
                <span className="count">
                  {list.filter((c) => c.stage === stage).length}
                </span>
              </h3>
              {list
                .filter((c) => c.stage === stage)
                .map((c) => (
                  <button
                    className="kanban"
                    draggable
                    onDragStart={(e) =>
                      e.dataTransfer.setData("text/plain", String(c.id))
                    }
                    key={c.id}
                    onClick={() => open(c)}
                  >
                    <div className="row">
                      <Face c={c} />
                      <b>{c.name}</b>
                      <GripVertical size={14} />
                    </div>
                    <Platform p={c.platform} />
                    <small>
                      {products[c.product]?.asin ?? "未关联 ASIN"} · {c.niche}
                    </small>
                    <p>{c.next}</p>
                    <small>
                      {c.campaign || "单次合作"} · ${c.budget} · {c.operator}
                    </small>
                    <span
                      className={
                        c.due < today && c.stage !== stages[8] ? "late" : ""
                      }
                    >
                      <CalendarClock size={13} /> {c.due}{" "}
                      {c.due < today && c.stage !== stages[8] ? "已逾期" : ""}
                    </span>
                  </button>
                ))}
              {!list.some((c) => c.stage === stage) && (
                <small>暂无创作者，可拖入卡片</small>
              )}
            </section>
          ))}
      </div>
    </>
  );
}
