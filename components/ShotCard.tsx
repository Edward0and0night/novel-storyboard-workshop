"use client";

import { useState } from "react";
import type { Shot } from "@/lib/types";
import { copyText } from "@/lib/clipboard";

export default function ShotCard({ shot }: { shot: Shot }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState<"" | "ok" | "fail">("");

  async function copyPrompt(e: React.MouseEvent) {
    e.stopPropagation();
    const ok = await copyText(shot.visualPrompt);
    setCopied(ok ? "ok" : "fail");
    setTimeout(() => setCopied(""), 1500);
  }

  return (
    <li className="relative">
      {/* 红线上的节点 */}
      <span className="absolute -left-[23px] top-5 h-3 w-3 rounded-full border-2 border-blood bg-background" />
      <div
        role="button"
        tabIndex={0}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), setOpen((v) => !v))}
        className="cursor-pointer rounded-md border border-bone/10 bg-panel p-4 transition hover:border-blood/60"
      >
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="font-display text-xl text-gold">#{String(shot.n).padStart(2, "0")}</span>
          <h3 className="min-w-0 flex-1 break-words text-base text-bone">{shot.scene}</h3>
          <span className="rounded border border-blood/60 px-2 py-0.5 text-xs text-blood">{shot.mood || "—"}</span>
          <span className="text-xs text-bone/60">{shot.seconds} 秒</span>
        </div>
        <p className="mt-2 break-words text-sm text-bone/70">🎥 {shot.camera}</p>
        {shot.dialogue && (
          <p className="mt-2 whitespace-pre-line break-words border-l-2 border-gold/60 pl-3 text-sm text-bone">
            {shot.dialogue}
          </p>
        )}
        {shot.narration && <p className="mt-2 break-words text-sm italic text-bone/60">{shot.narration}</p>}
        {open ? (
          <div className="mt-3 rounded bg-background p-3">
            <p className="select-text break-words font-mono text-xs leading-relaxed text-bone/80">{shot.visualPrompt || "（该镜头没有画面提示词）"}</p>
            <button
              type="button"
              onClick={copyPrompt}
              className="mt-2 rounded border border-gold/60 px-3 py-1 text-xs text-gold hover:bg-gold/10"
            >
              {copied === "ok" ? "已复制" : copied === "fail" ? "复制失败，请长按文字手动复制" : "复制画面提示词"}
            </button>
          </div>
        ) : (
          <p className="mt-2 truncate text-xs text-bone/40">画面：{shot.visualPrompt || "（无）"}（点击展开）</p>
        )}
      </div>
    </li>
  );
}
