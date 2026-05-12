"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { AppData, Tab } from "@/types";
import { getData } from "@/lib/storage";

// Dynamic imports to prevent SSR issues with localStorage + recharts
const Dashboard = dynamic(() => import("@/components/Dashboard"), { ssr: false });
const CheckInForm = dynamic(() => import("@/components/CheckInForm"), { ssr: false });
const History = dynamic(() => import("@/components/History"), { ssr: false });
const Settings = dynamic(() => import("@/components/Settings"), { ssr: false });

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "dashboard", label: "Dashboard", icon: "📊" },
  { id: "checkin",   label: "Check In",  icon: "✏️" },
  { id: "history",   label: "History",   icon: "📋" },
  { id: "settings",  label: "Settings",  icon: "⚙️" },
];

export default function Home() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [data, setData] = useState<AppData | null>(null);

  useEffect(() => {
    setData(getData());
  }, []);

  function handleDataChange(updated: AppData) {
    setData(updated);
  }

  function handleNewCheckIn() {
    setTab("checkin");
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Top header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">💊</span>
          <div>
            <h1 className="text-sm font-bold text-gray-900 leading-none">
              Med Tracker
            </h1>
            <p className="text-xs text-gray-400 leading-none mt-0.5">
              Bupropion Journal
            </p>
          </div>
        </div>
        <span className="text-xs bg-brand-100 text-brand-700 font-semibold px-2.5 py-1 rounded-full">
          {data.currentDosage}
        </span>
      </header>

      {/* Content */}
      <main className="max-w-lg mx-auto px-4 pt-5">
        {tab === "dashboard" && (
          <Dashboard data={data} onNewCheckIn={handleNewCheckIn} />
        )}
        {tab === "checkin" && (
          <CheckInForm
            data={data}
            onSaved={(updated) => {
              handleDataChange(updated);
            }}
          />
        )}
        {tab === "history" && (
          <History data={data} onUpdate={handleDataChange} />
        )}
        {tab === "settings" && (
          <Settings data={data} onUpdate={handleDataChange} />
        )}
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 inset-x-0 bg-white/90 backdrop-blur border-t border-gray-100 px-4 py-2 flex justify-around z-10">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl transition-colors ${
              tab === t.id
                ? "text-brand-600"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <span className={`text-xl leading-none ${tab === t.id ? "scale-110" : ""} transition-transform`}>
              {t.icon}
            </span>
            <span
              className={`text-xs font-medium ${
                tab === t.id ? "text-brand-600" : "text-gray-400"
              }`}
            >
              {t.label}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
}
