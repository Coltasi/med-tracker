"use client";

import { useEffect, useState } from "react";
import { AppData, CheckIn, DosageChange } from "@/types";
import { addCheckIn, updateCheckIn } from "@/lib/storage";

interface Props {
  data: AppData;
  initialDate?: string;
  onSaved: (data: AppData) => void;
}

const SIDE_EFFECTS = [
  "Dry mouth",
  "Headache",
  "Insomnia",
  "Nausea",
  "Irritability",
  "Increased heart rate",
  "Sweating",
  "Dizziness",
  "Decreased appetite",
  "Constipation",
];

interface SliderProps {
  label: string;
  description: string;
  value: number;
  onChange: (v: number) => void;
  color: string;
  lowLabel: string;
  highLabel: string;
}

function Slider({
  label,
  description,
  value,
  onChange,
  color,
  lowLabel,
  highLabel,
}: SliderProps) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="font-semibold text-gray-800">{label}</p>
          <p className="text-xs text-gray-400">{description}</p>
        </div>
        <span
          className="text-2xl font-bold min-w-[2rem] text-right"
          style={{ color }}
        >
          {value}
        </span>
      </div>
      <input
        type="range"
        min={1}
        max={10}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
        style={{
          background: `linear-gradient(to right, ${color} 0%, ${color} ${
            (value - 1) * (100 / 9)
          }%, #e2e8f0 ${(value - 1) * (100 / 9)}%, #e2e8f0 100%)`,
        }}
      />
      <div className="flex justify-between mt-1">
        <span className="text-xs text-gray-400">{lowLabel}</span>
        <span className="text-xs text-gray-400">{highLabel}</span>
      </div>
    </div>
  );
}

interface FormState {
  mood: number;
  energy: number;
  anxiety: number;
  depression: number;
  sleepQuality: number;
  appetite: number;
  sexDrive: number;
  exercise: boolean;
  breathwork: boolean;
  sideEffects: string[];
  notes: string;
  dosage: string;
}

// Best-guess dosage for a given date: the most recent dosage change on/before it.
function dosageAtDate(history: DosageChange[], date: string): string | undefined {
  const applicable = history
    .filter((h) => h.date <= date)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  return applicable[0]?.dosage;
}

function defaultsFor(entry: CheckIn | undefined, fallbackDosage: string): FormState {
  return {
    mood: entry?.mood ?? 5,
    energy: entry?.energy ?? 5,
    anxiety: entry?.anxiety ?? 5,
    depression: entry?.depression ?? 5,
    sleepQuality: entry?.sleepQuality ?? 5,
    appetite: entry?.appetite ?? 5,
    sexDrive: entry?.sexDrive ?? 5,
    exercise: entry?.exercise ?? false,
    breathwork: entry?.breathwork ?? false,
    sideEffects: entry?.sideEffects ?? [],
    notes: entry?.notes ?? "",
    dosage: entry?.dosage ?? fallbackDosage,
  };
}

export default function CheckInForm({ data, initialDate, onSaved }: Props) {
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(initialDate ?? today);

  const existing = data.checkIns.find((c) => c.date === date);

  const [form, setForm] = useState<FormState>(() =>
    defaultsFor(existing, dosageAtDate(data.dosageHistory, date) ?? data.currentDosage)
  );
  const [saved, setSaved] = useState(false);

  // Re-sync the form whenever the selected date changes, loading the existing
  // entry for that date if there is one, otherwise resetting to sensible defaults.
  useEffect(() => {
    const entry = data.checkIns.find((c) => c.date === date);
    setForm(defaultsFor(entry, dosageAtDate(data.dosageHistory, date) ?? data.currentDosage));
    setSaved(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  const dosageOptions = Array.from(
    new Set([data.currentDosage, ...data.dosageHistory.map((d) => d.dosage)])
  );

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleSideEffect(effect: string) {
    setForm((f) => ({
      ...f,
      sideEffects: f.sideEffects.includes(effect)
        ? f.sideEffects.filter((e) => e !== effect)
        : [...f.sideEffects, effect],
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const entry: Omit<CheckIn, "id" | "timestamp"> = { date, ...form };
    const updated = existing ? updateCheckIn(existing.id, entry) : addCheckIn(entry);
    setSaved(true);
    onSaved(updated);
  }

  if (saved) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          {existing ? "Updated!" : "Logged!"}
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          Check-in saved for {date}. See your trends on the dashboard.
        </p>
        <button
          onClick={() => setSaved(false)}
          className="text-sm font-semibold text-brand-600 hover:text-brand-700"
        >
          Log another date
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-gradient-to-r from-brand-50 to-brand-100 rounded-2xl p-4 border border-brand-200">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-brand-700 font-semibold text-sm">
              {existing ? "Editing check-in" : "New check-in"}
            </p>
            <p className="text-brand-500 text-xs mt-0.5">
              {existing ? "This date already has an entry" : "No entry yet for this date"}
            </p>
          </div>
          <input
            type="date"
            value={date}
            max={today}
            onChange={(e) => setDate(e.target.value)}
            className="text-sm font-medium text-brand-700 bg-white border border-brand-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-300"
          />
        </div>
      </div>

      {/* Dosage at time of this entry */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <label className="block font-semibold text-gray-800 mb-2">Dosage</label>
        <select
          value={form.dosage}
          onChange={(e) => update("dosage", e.target.value)}
          className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-300"
        >
          {dosageOptions.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      <Slider
        label="Mood"
        description="Overall emotional state"
        value={form.mood}
        onChange={(v) => update("mood", v)}
        color="#10b981"
        lowLabel="Very low"
        highLabel="Excellent"
      />
      <Slider
        label="Energy"
        description="Physical & mental energy levels"
        value={form.energy}
        onChange={(v) => update("energy", v)}
        color="#0ea5e9"
        lowLabel="Exhausted"
        highLabel="Very energised"
      />
      <Slider
        label="Anxiety"
        description="Nervousness, tension, worry"
        value={form.anxiety}
        onChange={(v) => update("anxiety", v)}
        color="#ef4444"
        lowLabel="None"
        highLabel="Severe"
      />
      <Slider
        label="Depression"
        description="Low mood, hopelessness, motivation"
        value={form.depression}
        onChange={(v) => update("depression", v)}
        color="#b91c1c"
        lowLabel="None"
        highLabel="Severe"
      />
      <Slider
        label="Sleep Quality"
        description="How well you slept last night"
        value={form.sleepQuality}
        onChange={(v) => update("sleepQuality", v)}
        color="#06b6d4"
        lowLabel="Terrible"
        highLabel="Excellent"
      />
      <Slider
        label="Appetite"
        description="Hunger & enjoyment of food"
        value={form.appetite}
        onChange={(v) => update("appetite", v)}
        color="#14b8a6"
        lowLabel="No appetite"
        highLabel="Normal"
      />
      <Slider
        label="Sex Drive"
        description="Interest & desire"
        value={form.sexDrive}
        onChange={(v) => update("sexDrive", v)}
        color="#22c55e"
        lowLabel="None"
        highLabel="Very high"
      />

      {/* Habits */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <p className="font-semibold text-gray-800 mb-3">Habits</p>
        <div className="grid grid-cols-2 gap-2">
          <label
            className={`flex items-center gap-2 text-sm p-2 rounded-xl cursor-pointer border transition-colors ${
              form.exercise
                ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                : "border-gray-100 text-gray-600 hover:bg-gray-50"
            }`}
          >
            <input
              type="checkbox"
              checked={form.exercise}
              onChange={() => update("exercise", !form.exercise)}
              className="sr-only"
            />
            <span
              className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center ${
                form.exercise ? "bg-emerald-500 border-emerald-500" : "border-gray-300"
              }`}
            >
              {form.exercise && (
                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </span>
            Got meaningful exercise
          </label>
          <label
            className={`flex items-center gap-2 text-sm p-2 rounded-xl cursor-pointer border transition-colors ${
              form.breathwork
                ? "bg-sky-50 border-sky-300 text-sky-700"
                : "border-gray-100 text-gray-600 hover:bg-gray-50"
            }`}
          >
            <input
              type="checkbox"
              checked={form.breathwork}
              onChange={() => update("breathwork", !form.breathwork)}
              className="sr-only"
            />
            <span
              className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center ${
                form.breathwork ? "bg-sky-500 border-sky-500" : "border-gray-300"
              }`}
            >
              {form.breathwork && (
                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </span>
            Did breathwork
          </label>
        </div>
      </div>

      {/* Side effects */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <p className="font-semibold text-gray-800 mb-3">Side Effects</p>
        <div className="grid grid-cols-2 gap-2">
          {SIDE_EFFECTS.map((effect) => (
            <label
              key={effect}
              className={`flex items-center gap-2 text-sm p-2 rounded-xl cursor-pointer border transition-colors ${
                form.sideEffects.includes(effect)
                  ? "bg-red-50 border-red-300 text-red-700"
                  : "border-gray-100 text-gray-600 hover:bg-gray-50"
              }`}
            >
              <input
                type="checkbox"
                checked={form.sideEffects.includes(effect)}
                onChange={() => toggleSideEffect(effect)}
                className="sr-only"
              />
              <span
                className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center ${
                  form.sideEffects.includes(effect)
                    ? "bg-red-400 border-red-400"
                    : "border-gray-300"
                }`}
              >
                {form.sideEffects.includes(effect) && (
                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </span>
              {effect}
            </label>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <label className="block font-semibold text-gray-800 mb-2">
          Notes <span className="text-gray-400 font-normal text-sm">(optional)</span>
        </label>
        <textarea
          value={form.notes}
          onChange={(e) => update("notes", e.target.value)}
          placeholder="Any other observations, events, or context..."
          className="w-full text-sm text-gray-700 placeholder-gray-300 border border-gray-200 rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-brand-300"
          rows={3}
        />
      </div>

      <button
        type="submit"
        className="w-full bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white font-bold py-3.5 rounded-2xl text-base transition-colors shadow-md"
      >
        {existing ? "Update Check-In" : "Save Check-In"}
      </button>
    </form>
  );
}
