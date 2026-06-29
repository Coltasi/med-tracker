import { CheckIn } from "@/types";

const INSIGHT_KEY = "med-tracker-insight";

interface InsightCache {
  date: string; // YYYY-MM-DD this insight was generated for
  insight: string;
  generatedAt: number;
}

function today(): string {
  return new Date().toISOString().split("T")[0];
}

export function getCachedInsight(): InsightCache | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(INSIGHT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as InsightCache;
  } catch {
    return null;
  }
}

export function isInsightFresh(cache: InsightCache | null): boolean {
  return !!cache && cache.date === today();
}

export function setCachedInsight(insight: string): InsightCache {
  const cache: InsightCache = {
    date: today(),
    insight,
    generatedAt: Date.now(),
  };
  if (typeof window !== "undefined") {
    localStorage.setItem(INSIGHT_KEY, JSON.stringify(cache));
  }
  return cache;
}

export async function fetchInsight(
  checkIns: CheckIn[],
  currentDosage: string
): Promise<string> {
  const res = await fetch("/api/insight", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ checkIns, currentDosage }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error ?? "Failed to fetch insight");
  }
  return data.insight as string;
}
