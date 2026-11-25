"use client";

import { useState } from "react";
import { MAX_CHARS, MIN_CHARS, type Shot } from "@/lib/types";
import { SAMPLE_CHAPTER } from "@/lib/sample";
import { shotsToMarkdown } from "@/lib/markdown";
import { saveHistory } from "@/lib/history";
import ShotCard from "@/components/ShotCard";
import { copyText } from "@/lib/clipboard";

export default function Home() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [shots, setShots] = useState<Shot[]>([]);
  const [notice, setNotice] = useState("");

  const count = text.trim().length;
  const tooShort = count < MIN_CHARS;
  const tooLong = count > MAX_CHARS;

  function loadSample() {
    setText(SAMPLE_CHAPTER);
    setError("");
  }

  function flash(msg: string) {
    setNotice(msg);
    setTimeout(() => setNotice(""), 2000);
  }

  function exportMarkdown() {
    const blob = new Blob([shotsToMarkdown(shots)], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `分镜表-${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    // 延迟释放，避免部分手机浏览器还没开始下载就失效
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
    flash("已开始下载 Markdown 文件");
  }

  async function copyMarkdown() {
    const ok = await copyText(shotsToMarkdown(shots));
    flash(ok ? "已复制 Markdown 分镜表" : "复制失败，请改用“导出 Markdown”");
  }

  async function generate() {
    if (count === 0) {
      setError("请先粘贴一段小说章节，或点“试试示例章节”。");
      return;
    }
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
      const result = Array.isArray(data?.shots) ? (data.shots as Shot[]) : [];
      if (result.length === 0) throw new Error("没有生成任何镜头，请换一段文字再试。");
      setShots(result);
      saveHistory(text, result);
    } catch (e) {
      // 出错时保留已粘贴的文字
      // fetch 自身抛出的 TypeError（断网、服务器没开）是英文信息，统一换成中文
      const msg =
        e instanceof TypeError
          ? "连接服务器失败，请检查网络后重试。"
          : e instanceof Error && e.message
            ? e.message
            : "生成失败，请稍后再试。";
      setError(msg);
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
        <div className="sticky bottom-0 -mx-4 mt-4 flex flex-col gap-2 bg-panel/95 px-4 py-3 sm:static sm:mx-0 sm:flex-row sm:p-0">
          <button
            onClick={generate}
            disabled={loading}
            className="w-full rounded bg-blood px-6 py-3 font-medium text-bone transition hover:brightness-110 disabled:opacity-60 sm:w-auto"
          >
            {loading ? "正在生成分镜…" : "生成分镜"}
          </button>
          <button
            type="button"
            onClick={loadSample}
            disabled={loading}
            className="w-full rounded border border-gold/60 px-6 py-3 text-gold transition hover:bg-gold/10 disabled:opacity-60 sm:w-auto"
          >
            试试示例章节
          </button>
        </div>
      </section>

      {loading && (
        <div className="mt-8 rounded-md border border-blood/40 bg-panel p-6 text-center" aria-live="polite">
          <p className="animate-pulse font-display text-lg text-bone">正在把章节拆成镜头…</p>
          <p className="mt-2 text-sm text-bone/60">通常需要 20–45 秒，请不要关闭页面。</p>
        </div>
      )}

      {!loading && shots.length === 0 && (
        <div className="mt-8 rounded-md border border-dashed border-bone/20 p-6 text-center text-sm text-bone/60">
          <p>这里还没有分镜。</p>
          <p className="mt-1">粘贴 {MIN_CHARS} 字以上的章节后点“生成分镜”，会得到 8–12 个镜头。</p>
        </div>
      )}

      {!loading && shots.length > 0 && (
        <>
          <div className="mt-8 flex flex-wrap items-center gap-2">
            <h2 className="mr-auto text-xl text-bone">
              分镜 · {shots.length} 个镜头 · 约 {shots.reduce((a, s) => a + s.seconds, 0)} 秒
            </h2>
            <button
              type="button"
              onClick={exportMarkdown}
              className="rounded border border-blood/70 px-3 py-1.5 text-sm text-bone hover:bg-blood/20"
            >
              导出 Markdown
            </button>
            <button
              type="button"
              onClick={copyMarkdown}
              className="rounded border border-bone/30 px-3 py-1.5 text-sm text-bone hover:bg-bone/10"
            >
              复制
            </button>
          </div>
          {notice && <p className="mt-2 text-sm text-gold">{notice}</p>}
          <ol id="shots" className="relative mt-4 ml-2 space-y-4 border-l-2 border-blood pl-4">
            {shots.map((s) => (
              <ShotCard key={s.n} shot={s} />
            ))}
          </ol>
        </>
      )}
    </main>
  );
}

