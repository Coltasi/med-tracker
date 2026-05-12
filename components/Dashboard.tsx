"use client";

import { AppData } from "@/types";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format, parseISO } from "date-fns";

interface Props {
  data: AppData;
  onNewCheckIn: () => void;
}

const METRIC_COLORS: Record<string, string> = {
  mood:         "#0ea5e9",
  energy:       "#10b981",
  anxiety:      "#f59e0b",
  depression:   "#8b5cf6",
  sleepQuality: "#06b6d4",
  appetite:     "#f97316",
};

const METRIC_LABELS: Record<string, string> = {
  mood:         "Mood",
  energy:       "Energy",
  anxiety:      "Anxiety",
  depression:   "Depression",
  sleepQuality: "Sleep",
  appetite:     "Appetite",
};

function ScoreCard({
  label,
  value,
  color,
  trend,
}: {
  label: string;
  value: number;
  color: string;
  trend: number;
}) {
  const trendIcon = trend > 0 ? "↑" : trend < 0 ? "↓" : "→";
  const isPositive = (label === "Anxiety" || label === "Depression")
    ? trend < 0
    : trend > 0;
  const trendColor =
    trend === 0
      ? "text-gray-400"
      : isPositive
      ? "text-emerald-500"
      : "text-red-400";

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col gap-1">
      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
        {label}
      </span>
      <div className="flex items-end justify-between">
        <span
          className="text-3xl font-bold"
          style={{ color }}
        >
          {value.toFixed(1)}
        </span>
        <span className={`text-sm font-semibold ${trendColor}`}>
          {trendIcon} {Math.abs(trend).toFixed(1)}
        </span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
        <div
          className="h-1.5 rounded-full transition-all"
          style={{ width: `${(value / 10) * 100}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export default function Dashboard({ data, onNewCheckIn }: Props) {
  const recent = data.checkIns.slice(0, 14).reverse();

  const chartData = recent.map((c) => ({
    date: format(parseISO(c.date), "MMM d"),
    mood: c.mood,
    energy: c.energy,
    anxiety: c.anxiety,
    depression: c.depression,
    sleepQuality: c.sleepQuality,
    appetite: c.appetite,
    dosage: c.dosage,
  }));

  // Latest vs previous averages for trend
  const latest = data.checkIns[0];
  const prev = data.checkIns[1];

  const metrics = ["mood", "energy", "anxiety", "depression", "sleepQuality", "appetite"] as const;

  function avg(key: typeof metrics[number]) {
    if (!data.checkIns.length) return 0;
    return data.checkIns.slice(0, 7).reduce((s, c) => s + c[key], 0) /
      Math.min(7, data.checkIns.length);
  }

  function trend(key: typeof metrics[number]) {
    if (!latest || !prev) return 0;
    return latest[key] - prev[key];
  }

  const todayCheckedIn =
    latest?.date === new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-500 rounded-2xl p-5 text-white shadow-md">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-brand-100 text-sm font-medium mb-1">Current Dosage</p>
            <p className="text-2xl font-bold">{data.currentDosage}</p>
            <p className="text-brand-200 text-xs mt-1">
              {data.dosageHistory.length > 0
                ? `Updated ${format(parseISO(data.dosageHistory[0].date), "MMM d, yyyy")}`
                : ""}
            </p>
          </div>
          <div className="text-right">
            <p className="text-brand-100 text-sm font-medium mb-1">Check-ins</p>
            <p className="text-2xl font-bold">{data.checkIns.length}</p>
            <p className="text-brand-200 text-xs mt-1">total logged</p>
          </div>
        </div>
      </div>

      {/* Daily prompt */}
      {!todayCheckedIn && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="font-semibold text-amber-800">No check-in yet today</p>
            <p className="text-amber-600 text-sm">How are you feeling?</p>
          </div>
          <button
            onClick={onNewCheckIn}
            className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-colors"
          >
            Log now
          </button>
        </div>
      )}

      {data.checkIns.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-gray-700 font-semibold">No data yet</p>
          <p className="text-gray-400 text-sm mt-1">
            Complete your first check-in to see trends here.
          </p>
          <button
            onClick={onNewCheckIn}
            className="mt-4 bg-brand-500 hover:bg-brand-600 text-white font-semibold px-6 py-2 rounded-xl text-sm transition-colors"
          >
            Start tracking
          </button>
        </div>
      ) : (
        <>
          {/* Score cards */}
          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              7-Day Averages
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {metrics.map((key) => (
                <ScoreCard
                  key={key}
                  label={METRIC_LABELS[key]}
                  value={avg(key)}
                  color={METRIC_COLORS[key]}
                  trend={trend(key)}
                />
              ))}
            </div>
          </div>

          {/* Trend chart */}
          {chartData.length > 1 && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                14-Day Trend
              </h2>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 4px 6px -1px rgba(0,0,0,0.07)",
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
                  />
                  {metrics.map((key) => (
                    <Line
                      key={key}
                      type="monotone"
                      dataKey={key}
                      name={METRIC_LABELS[key]}
                      stroke={METRIC_COLORS[key]}
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Dosage history */}
          {data.dosageHistory.length > 1 && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Dosage History
              </h2>
              <div className="space-y-2">
                {data.dosageHistory.map((d) => (
                  <div key={d.id} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-brand-400 flex-shrink-0" />
                    <span className="text-sm font-semibold text-brand-700">
                      {d.dosage}
                    </span>
                    <span className="text-xs text-gray-400">
                      {format(parseISO(d.date), "MMM d, yyyy")}
                    </span>
                    {d.notes && (
                      <span className="text-xs text-gray-500 italic">
                        — {d.notes}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
