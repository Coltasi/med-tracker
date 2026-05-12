"use client";

import { useState } from "react";
import { AppData, CheckIn } from "@/types";
import { addCheckIn } from "@/lib/storage";

interface Props {
  data: AppData;
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

export default function CheckInForm({ data, onSaved }: Props) {
  const today = new Date().toISOString().split("T")[0];

  const alreadyCheckedIn = data.checkIns.some((c) => c.date === today);

  const [mood, setMood] = useState(5);
  const [energy, setEnergy] = useState(5);
  const [anxiety, setAnxiety] = useState(5);
  const [depression, setDepression] = useState(5);
  const [sleepQuality, setSleepQuality] = useState(5);
  const [appetite, setAppetite] = useState(5);
  const [sideEffects, setSideEffects] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);

  function toggleSideEffect(effect: string) {
    setSideEffects((prev) =>
      prev.includes(effect) ? prev.filter((e) => e !== effect) : [...prev, effect]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const entry: Omit<CheckIn, "id" | "timestamp"> = {
      date: today,
      mood,
      energy,
      anxiety,
      depression,
      sleepQuality,
      appetite,
      sideEffects,
      notes,
      dosage: data.currentDosage,
    };
    const updated = addCheckIn(entry);
    setSaved(true);
    onSaved(updated);
  }

  if (saved) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Logged!</h2>
        <p className="text-gray-500 text-sm">
          Check-in saved for today. See your trends on the dashboard.
        </p>
      </div>
    );
  }

  if (alreadyCheckedIn) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
        <div className="text-4xl mb-3">📝</div>
        <p className="font-semibold text-gray-800">Already checked in today</p>
        <p className="text-gray-400 text-sm mt-1">Come back tomorrow to log again.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-gradient-to-r from-brand-50 to-brand-100 rounded-2xl p-4 border border-brand-200">
        <p className="text-brand-700 font-semibold text-sm">
          Today&apos;s check-in
        </p>
        <p className="text-brand-500 text-xs mt-0.5">
          Current dose: <strong>{data.currentDosage}</strong>
        </p>
      </div>

      <Slider
        label="Mood"
        description="Overall emotional state"
        value={mood}
        onChange={setMood}
        color="#0ea5e9"
        lowLabel="Very low"
        highLabel="Excellent"
      />
      <Slider
        label="Energy"
        description="Physical & mental energy levels"
        value={energy}
        onChange={setEnergy}
        color="#10b981"
        lowLabel="Exhausted"
        highLabel="Very energised"
      />
      <Slider
        label="Anxiety"
        description="Nervousness, tension, worry"
        value={anxiety}
        onChange={setAnxiety}
        color="#f59e0b"
        lowLabel="None"
        highLabel="Severe"
      />
      <Slider
        label="Depression"
        description="Low mood, hopelessness, motivation"
        value={depression}
        onChange={setDepression}
        color="#8b5cf6"
        lowLabel="None"
        highLabel="Severe"
      />
      <Slider
        label="Sleep Quality"
        description="How well you slept last night"
        value={sleepQuality}
        onChange={setSleepQuality}
        color="#06b6d4"
        lowLabel="Terrible"
        highLabel="Excellent"
      />
      <Slider
        label="Appetite"
        description="Hunger & enjoyment of food"
        value={appetite}
        onChange={setAppetite}
        color="#f97316"
        lowLabel="No appetite"
        highLabel="Normal"
      />

      {/* Side effects */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <p className="font-semibold text-gray-800 mb-3">Side Effects Today</p>
        <div className="grid grid-cols-2 gap-2">
          {SIDE_EFFECTS.map((effect) => (
            <label
              key={effect}
              className={`flex items-center gap-2 text-sm p-2 rounded-xl cursor-pointer border transition-colors ${
                sideEffects.includes(effect)
                  ? "bg-red-50 border-red-300 text-red-700"
                  : "border-gray-100 text-gray-600 hover:bg-gray-50"
              }`}
            >
              <input
                type="checkbox"
                checked={sideEffects.includes(effect)}
                onChange={() => toggleSideEffect(effect)}
                className="sr-only"
              />
              <span
                className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center ${
                  sideEffects.includes(effect)
                    ? "bg-red-400 border-red-400"
                    : "border-gray-300"
                }`}
              >
                {sideEffects.includes(effect) && (
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
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any other observations, events, or context..."
          className="w-full text-sm text-gray-700 placeholder-gray-300 border border-gray-200 rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-brand-300"
          rows={3}
        />
      </div>

      <button
        type="submit"
        className="w-full bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white font-bold py-3.5 rounded-2xl text-base transition-colors shadow-md"
      >
        Save Check-In
      </button>
    </form>
  );
}
