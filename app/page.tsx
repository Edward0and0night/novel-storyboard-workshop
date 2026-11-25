"use client";

import { useState } from "react";
import { MAX_CHARS, MIN_CHARS, type Shot } from "@/lib/types";

export default function Home() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [shots, setShots] = useState<Shot[]>([]);

  const count = text.trim().length;
  const tooShort = count < MIN_CHARS;
  const tooLong = count > MAX_CHARS;

  async function generate() {
    if (tooShort) {
      setError(`再多写一点吧：章节至少需要 ${MIN_CHARS} 个字（目前 ${count} 个字）。`);
      return;
    }
    if (tooLong) {
      setError(`章节太长了，请控制在 ${MAX_CHARS} 个字以内（目前 ${count} 个字）。`);
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/storyboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chapter: text }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "生成失败，请稍后再试。");
      setShots(data.shots as Shot[]);
    } catch (e) {
      // 出错时保留已粘贴的文字
      setError(e instanceof Error && e.message ? e.message : "生成失败，请稍后再试。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
      <header className="mb-8 border-b border-blood/60 pb-4">
        <h1 className="text-3xl text-bone">小说分镜工坊</h1>
        <p className="mt-2 text-sm text-bone/70">粘贴章节，生成竖屏短剧分镜表</p>
      </header>

      <section id="input" className="rounded-md bg-panel p-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`在此粘贴小说章节（${MIN_CHARS}–${MAX_CHARS} 字）…`}
          rows={12}
          className="w-full resize-y rounded border border-bone/20 bg-background p-3 text-bone placeholder:text-bone/40 focus:border-blood focus:outline-none"
        />
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className={tooShort || tooLong ? "text-blood" : "text-bone/70"}>
            {count} / {MAX_CHARS} 字
          </span>
          {tooShort && count > 0 && (
            <span className="text-bone/60">至少需要 {MIN_CHARS} 字</span>
          )}
        </div>
        {error && (
          <p role="alert" className="mt-3 rounded border border-blood/60 bg-blood/10 p-2 text-sm">
            {error}
          </p>
        )}
        <div className="sticky bottom-0 -mx-4 mt-4 bg-panel/95 px-4 py-3 sm:static sm:mx-0 sm:p-0">
          <button
            onClick={generate}
            disabled={loading}
            className="w-full rounded bg-blood px-6 py-3 font-medium text-bone transition hover:brightness-110 disabled:opacity-60 sm:w-auto"
          >
            {loading ? "正在生成分镜…" : "生成分镜"}
          </button>
        </div>
      </section>

      <section id="shots" className="relative mt-8 border-l-2 border-blood pl-4">
        {/* Task 4: 分镜卡片（当前已有 {shots.length} 个镜头数据） */}
      </section>
    </main>
  );
}