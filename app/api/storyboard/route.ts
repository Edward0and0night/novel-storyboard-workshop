import { NextResponse } from "next/server";
import { MAX_CHARS, MIN_CHARS, type Shot } from "@/lib/types";
import { RETRY_INSTRUCTION, SYSTEM_PROMPT, buildUserPrompt } from "@/lib/prompt";

const BASE_URL = "https://tokenfuture.si/v1";
const DEFAULT_MODEL = "cn:deepseek-v4.1-flash"; // 可用 LLM_MODEL 覆盖

type Msg = { role: "system" | "user" | "assistant"; content: string };

function fail(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

async function callLLM(apiKey: string, messages: Msg[]): Promise<string> {
  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: process.env.LLM_MODEL || DEFAULT_MODEL,
      messages,
      response_format: { type: "json_object" },
      temperature: 0.7,
    }),
    signal: AbortSignal.timeout(55_000),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error(`[storyboard] upstream ${res.status}: ${detail.slice(0, 200)}`);
    throw new Error(`upstream ${res.status}`);
  }
  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string") throw new Error("empty response");
  return content;
}

function parseShots(text: string): Shot[] | null {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  try {
    const obj = JSON.parse(cleaned);
    const arr = Array.isArray(obj) ? obj : obj?.shots;
    if (!Array.isArray(arr) || arr.length === 0) return null;
    // 字段缺失（如没有 scene / visualPrompt）视为格式不合格，触发重试
    const ok = arr.every(
      (s) => s && typeof s.scene === "string" && s.scene && typeof s.visualPrompt === "string" && s.visualPrompt,
    );
    if (!ok) return null;
    return arr.map((s, i): Shot => {
      const sec = Math.round(Number(s?.seconds));
      return {
        n: i + 1,
        scene: String(s?.scene ?? ""),
        camera: String(s?.camera ?? ""),
        dialogue: String(s?.dialogue ?? ""),
        narration: String(s?.narration ?? ""),
        visualPrompt: String(s?.visualPrompt ?? ""),
        mood: String(s?.mood ?? ""),
        seconds: Math.min(15, Math.max(5, Number.isFinite(sec) ? sec : 8)),
      };
    });
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return fail("服务器未配置 GEMINI_API_KEY，请在 .env.local 中设置。", 500);

  let chapter = "";
  try {
    const body = await req.json();
    chapter = typeof body?.chapter === "string" ? body.chapter.trim() : "";
  } catch {
    return fail("请求格式不正确。", 400);
  }
  if (chapter.length < MIN_CHARS) return fail(`章节至少需要 ${MIN_CHARS} 个字。`, 400);
  if (chapter.length > MAX_CHARS) return fail(`章节最多 ${MAX_CHARS} 个字。`, 400);

  // 该网关实测会忽略 system 角色，因此把指令并入 user 消息
  const messages: Msg[] = [
    { role: "user", content: `${SYSTEM_PROMPT}\n\n${buildUserPrompt(chapter)}\n\n现在只输出 JSON 对象。` },
  ];

  try {
    let text = await callLLM(apiKey, messages);
    let shots = parseShots(text);
    if (!shots) {
      // 仅重试一次：要求只返回 JSON
      text = await callLLM(apiKey, [
        ...messages,
        { role: "assistant", content: text },
        { role: "user", content: RETRY_INSTRUCTION },
      ]);
      shots = parseShots(text);
    }
    if (!shots) {
      console.error(`[storyboard] unparseable after retry: ${text.slice(0, 200)}`);
      return fail("模型返回的内容无法解析，请稍后再试。", 502);
    }
    return NextResponse.json({ shots });
  } catch (e) {
    console.error("[storyboard] call failed:", e instanceof Error ? e.message : e);
    return fail("生成失败，请检查网络或稍后再试。", 502);
  }
}