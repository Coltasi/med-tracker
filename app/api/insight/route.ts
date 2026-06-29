import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { CheckIn } from "@/types";

export const runtime = "nodejs";

interface InsightRequestBody {
  checkIns: CheckIn[];
  currentDosage: string;
}

function summarizeForPrompt(checkIns: CheckIn[], currentDosage: string): string {
  // Oldest first reads more naturally as a timeline for the model.
  const ordered = [...checkIns].reverse();
  const lines = ordered.map((c) => {
    const parts = [
      `${c.date}:`,
      `mood ${c.mood}/10,`,
      `energy ${c.energy}/10,`,
      `anxiety ${c.anxiety}/10,`,
      `depression ${c.depression}/10,`,
      `sleep quality ${c.sleepQuality}/10,`,
      typeof c.sleepHours === "number" ? `slept ${c.sleepHours}h,` : null,
      `appetite ${c.appetite}/10,`,
      typeof c.sexDrive === "number" ? `sex drive ${c.sexDrive}/10,` : null,
      `exercise: ${c.exercise ? "yes" : "no"},`,
      `breathwork: ${c.breathwork ? "yes" : "no"},`,
      c.sideEffects.length ? `side effects: ${c.sideEffects.join(", ")},` : null,
      `dosage ${c.dosage}`,
      c.notes ? `notes: "${c.notes}"` : null,
    ].filter(Boolean);
    return parts.join(" ");
  });

  return [
    `Current dosage: ${currentDosage}.`,
    `Daily check-in log, oldest to newest (1-10 scales unless noted; for anxiety and depression, lower is better):`,
    ...lines,
  ].join("\n");
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is not set on the server." },
      { status: 500 }
    );
  }

  let body: InsightRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!Array.isArray(body.checkIns) || body.checkIns.length === 0) {
    return NextResponse.json(
      { error: "No check-in data to analyze yet." },
      { status: 400 }
    );
  }

  const client = new Anthropic({ apiKey });

  const summary = summarizeForPrompt(body.checkIns, body.currentDosage ?? "unknown");

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 300,
      system:
        "You are a concise, supportive assistant helping someone track how they respond to a medication (bupropion) using daily self-reported metrics. " +
        "Given their recent check-in log, write a short daily insight in 3-5 sentences, plain prose, no headers or bullet points. " +
        "Cover: how they're doing right now, any clear trend (improving, worsening, or stable) across mood/energy/anxiety/depression/sleep, " +
        "and one concrete, specific thing to pay attention to or try next. " +
        "Be honest about uncertainty if the data is sparse or noisy. Do not give medical advice or suggest dosage changes; " +
        "if something looks concerning (e.g. worsening depression or anxiety), gently suggest they mention it to their prescriber. " +
        "Do not use the word 'genuinely' or 'honestly'. Avoid being saccharine.",
      messages: [
        {
          role: "user",
          content: summary,
        },
      ],
    });

    const text = message.content
      .filter((block) => block.type === "text")
      .map((block) => (block.type === "text" ? block.text : ""))
      .join("\n")
      .trim();

    return NextResponse.json({ insight: text });
  } catch (err) {
    console.error("Insight generation failed:", err);
    return NextResponse.json(
      { error: "Failed to generate insight." },
      { status: 502 }
    );
  }
}
