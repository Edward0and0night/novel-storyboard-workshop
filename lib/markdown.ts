import type { Shot } from "./types";

function cell(s: string): string {
  return (s || "—").replace(/\|/g, "\\|").replace(/\r?\n/g, "<br>");
}

export function shotsToMarkdown(shots: Shot[], title = "分镜表"): string {
  const total = shots.reduce((a, s) => a + s.seconds, 0);
  const head = [
    `# ${title}`,
    "",
    `共 ${shots.length} 个镜头，约 ${total} 秒`,
    "",
    "| # | 场景 | 运镜 | 对白 | 旁白 | 画面提示词 | 情绪 | 时长(秒) |",
    "|---|---|---|---|---|---|---|---|",
  ];
  const rows = shots.map(
    (s) =>
      `| ${s.n} | ${cell(s.scene)} | ${cell(s.camera)} | ${cell(s.dialogue)} | ${cell(s.narration)} | ${cell(s.visualPrompt)} | ${cell(s.mood)} | ${s.seconds} |`,
  );
  return [...head, ...rows, ""].join("\n");
}
