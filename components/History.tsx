"use client";

import { useState } from "react";
import { AppData, CheckIn } from "@/types";
import { deleteCheckIn } from "@/lib/storage";
import { format, parseISO } from "date-fns";

interface Props {
  data: AppData;
  onUpdate: (data: AppData) => void;
}

const METRICS = [
  { key: "mood",         label: "Mood",       color: "#10b981" },
  { key: "energy",       label: "Energy",     color: "#0ea5e9" },
  { key: "anxiety",      label: "Anxiety",    color: "#ef4444" },
  { key: "depression",   label: "Depres.",    color: "#b91c1c" },
  { key: "sleepQuality", label: "Sleep",      color: "#06b6d4" },
  { key: "appetite",     label: "Appetite",   color: "#14b8a6" },
  { key: "sexDrive",     label: "Sex Drive",  color: "#22c55e" },
] as const;

function MiniBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-12 bg-gray-100 rounded-full h-1.5">
        <div
          className="h-1.5 rounded-full"
          style={{ width: `${value * 10}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-medium text-gray-600 w-4">{value}</span>
    </div>
  );
}

function CheckInCard({ entry, onDelete }: { entry: CheckIn; onDelete: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <button
        className="w-full text-left p-4"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="font-semibold text-gray-800">
              {format(parseISO(entry.date), "EEEE, MMM d yyyy")}
            </p>
            <p className="text-xs text-brand-500 font-medium mt-0.5">
              {entry.dosage}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">
              {expanded ? "▲" : "▼"}
            </span>
          </div>
        </div>

        {/* Mini summary row */}
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
          {METRICS.filter(({ key }) => typeof entry[key] === "number").map(({ key, label, color }) => (
            <div key={key} className="flex items-center gap-1">
              <span className="text-xs text-gray-400">{label}</span>
              <span
                className="text-xs font-bold"
                style={{ color }}
              >
                {entry[key]}
              </span>
            </div>
          ))}
          {entry.exercise && (
            <span className="text-xs font-medium text-emerald-600">🏃 Exercise</span>
          )}
          {entry.breathwork && (
            <span className="text-xs font-medium text-sky-600">🧘 Breathwork</span>
          )}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-50 pt-3 space-y-3">
          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            {METRICS.filter(({ key }) => typeof entry[key] === "number").map(({ key, label, color }) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{label}</span>
                <MiniBar value={entry[key] as number} color={color} />
              </div>
            ))}
          </div>

          {(entry.exercise || entry.breathwork) && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Habits
              </p>
              <div className="flex flex-wrap gap-1.5">
                {entry.exercise && (
                  <span className="text-xs bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded-full">
                    🏃 Exercise
                  </span>
                )}
                {entry.breathwork && (
                  <span className="text-xs bg-sky-50 text-sky-600 border border-sky-100 px-2 py-0.5 rounded-full">
                    🧘 Breathwork
                  </span>
                )}
              </div>
            </div>
          )}

          {entry.sideEffects.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Side Effects
              </p>
              <div className="flex flex-wrap gap-1.5">
                {entry.sideEffects.map((e) => (
                  <span
                    key={e}
                    className="text-xs bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 rounded-full"
                  >
                    {e}
                  </span>
                ))}
              </div>
            </div>
          )}

          {entry.notes && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Notes
              </p>
              <p className="text-sm text-gray-600 italic">{entry.notes}</p>
            </div>
          )}

          <div className="pt-1">
            {confirming ? (
              <div className="flex gap-2">
                <button
                  onClick={onDelete}
                  className="text-xs bg-red-500 text-white px-3 py-1.5 rounded-lg font-medium"
                >
                  Confirm delete
                </button>
                <button
                  onClick={() => setConfirming(false)}
                  className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg font-medium"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirming(true)}
                className="text-xs text-red-400 hover:text-red-600 transition-colors"
              >
                Delete entry
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function History({ data, onUpdate }: Props) {
  const [search, setSearch] = useState("");

  const filtered = data.checkIns.filter(
    (c) =>
      !search ||
      c.date.includes(search) ||
      c.dosage.toLowerCase().includes(search.toLowerCase()) ||
      c.notes.toLowerCase().includes(search.toLowerCase())
  );

  function handleDelete(id: string) {
    const updated = deleteCheckIn(id);
    onUpdate(updated);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by date, dosage, or notes…"
          className="flex-1 text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-300"
        />
        <span className="text-sm text-gray-400 whitespace-nowrap">
          {filtered.length} entries
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
          <p className="text-4xl mb-3">🗒️</p>
          <p className="text-gray-500 text-sm">No entries found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((entry) => (
            <CheckInCard
              key={entry.id}
              entry={entry}
              onDelete={() => handleDelete(entry.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
