"use client";
import { useEffect, useRef } from "react";
import {
  Camera,
  Music2,
  Play,
  Pin,
  Type,
  X,
  ShieldCheck,
  ScanLine,
  CircleHelp,
  ShieldQuestionMark,
} from "lucide-react";
import { Avatar } from "@/components/avatar";
import { evidence, type Creator } from "@/lib/hub";
export function Face({ c, large = false }: { c: Creator; large?: boolean }) {
  return (
    <Avatar
      name={c.name}
      url={c.id < 16 ? `/hub/face-${c.id}.webp` : undefined}
      size={large ? "lg" : "md"}
    />
  );
}
export function Platform({ p }: { p: string }) {
  const Icon =
    {
      YouTube: Play,
      Instagram: Camera,
      TikTok: Music2,
      Facebook: Type,
      Pinterest: Pin,
    }[p] ?? Play;
  return (
    <span className={"platform " + p}>
      <Icon size={13} />
      {p}
    </span>
  );
}
export function Evidence({ v }: { v: number }) {
  const Icon = [ShieldCheck, ScanLine, ShieldQuestionMark, CircleHelp][v];
  return (
    <span className={"pill ev" + v}>
      <Icon size={13} />
      {evidence[v]}
    </span>
  );
}
export function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((x) => (
        <option key={x}>{x}</option>
      ))}
    </select>
  );
}
export function Modal({
  title,
  close,
  children,
  side = false,
}: {
  title: string;
  close: () => void;
  children: React.ReactNode;
  side?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current!;
    d.showModal();
    return () => d.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className={side ? "drawer" : ""}
      aria-label={title}
      onCancel={close}
      onClick={(e) => {
        if (e.target === ref.current) close();
      }}
    >
      <div className="modalinner">
        <header>
          <h2>{title}</h2>
          <button className="icon" aria-label="关闭" onClick={close}>
            <X />
          </button>
        </header>
        {children}
      </div>
    </dialog>
  );
}
