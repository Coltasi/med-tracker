"use client";

import { useState } from "react";
import { AppData } from "@/types";
import { updateDosage, exportData, importData, getData } from "@/lib/storage";
import { format, parseISO } from "date-fns";

interface Props {
  data: AppData;
  onUpdate: (data: AppData) => void;
}

const DOSAGE_OPTIONS = [
  "75mg",
  "100mg",
  "150mg",
  "150mg XL",
  "200mg",
  "300mg",
  "300mg XL",
  "450mg",
  "450mg XL",
];

export default function Settings({ data, onUpdate }: Props) {
  const [dosage, setDosage] = useState(data.currentDosage);
  const [customDosage, setCustomDosage] = useState("");
  const [dosageNotes, setDosageNotes] = useState("");
  const [dosageSaved, setDosageSaved] = useState(false);
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState("");
  const [importSuccess, setImportSuccess] = useState(false);

  function handleDosageSave() {
    const finalDosage = customDosage.trim() || dosage;
    if (!finalDosage) return;
    const updated = updateDosage(finalDosage, dosageNotes);
    setDosageSaved(true);
    setDosageNotes("");
    setCustomDosage("");
    onUpdate(updated);
    setTimeout(() => setDosageSaved(false), 2500);
  }

  function handleExport() {
    const json = exportData();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `med-tracker-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport() {
    setImportError("");
    setImportSuccess(false);
    if (!importText.trim()) return;
    const ok = importData(importText.trim());
    if (ok) {
      setImportSuccess(true);
      setImportText("");
      onUpdate(getData());
    } else {
      setImportError("Invalid backup file. Please check and try again.");
    }
  }

  return (
    <div className="space-y-4">
      {/* Dosage update */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h2 className="font-bold text-gray-800 mb-1">Update Dosage</h2>
        <p className="text-xs text-gray-400 mb-4">
          Current: <strong className="text-brand-600">{data.currentDosage}</strong>
        </p>

        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          New Dosage
        </label>
        <div className="grid grid-cols-3 gap-2 mb-3">
          {DOSAGE_OPTIONS.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                setDosage(opt);
                setCustomDosage("");
              }}
              className={`text-sm py-2 rounded-xl border font-medium transition-colors ${
                dosage === opt && !customDosage
                  ? "bg-brand-500 text-white border-brand-500"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>

        <input
          type="text"
          value={customDosage}
          onChange={(e) => setCustomDosage(e.target.value)}
          placeholder="Or type custom (e.g. 200mg XL)"
          className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-300 mb-3"
        />

        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Notes <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <input
          type="text"
          value={dosageNotes}
          onChange={(e) => setDosageNotes(e.target.value)}
          placeholder="e.g. Increased by doctor on follow-up"
          className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-300 mb-4"
        />

        <button
          onClick={handleDosageSave}
          disabled={dosageSaved}
          className={`w-full font-bold py-3 rounded-2xl text-sm transition-colors ${
            dosageSaved
              ? "bg-emerald-500 text-white"
              : "bg-brand-500 hover:bg-brand-600 text-white"
          }`}
        >
          {dosageSaved ? "✓ Dosage Updated" : "Save New Dosage"}
        </button>
      </div>

      {/* Dosage history */}
      {data.dosageHistory.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-800 mb-3">Dosage Log</h2>
          <div className="space-y-2">
            {data.dosageHistory.map((d, i) => (
              <div
                key={d.id}
                className="flex items-start gap-3 text-sm"
              >
                <div className="mt-1.5 w-2 h-2 rounded-full bg-brand-400 flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-brand-700">
                      {d.dosage}
                    </span>
                    {i === 0 && (
                      <span className="text-xs bg-brand-100 text-brand-600 px-1.5 py-0.5 rounded-full">
                        Current
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">
                    {format(parseISO(d.date), "MMMM d, yyyy")}
                  </span>
                  {d.notes && (
                    <p className="text-xs text-gray-500 italic mt-0.5">
                      {d.notes}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Data management */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h2 className="font-bold text-gray-800 mb-1">Backup & Restore</h2>
        <p className="text-xs text-gray-400 mb-4">
          Export your data as JSON to back it up or transfer between browsers.
        </p>

        <button
          onClick={handleExport}
          className="w-full border-2 border-brand-200 text-brand-600 font-semibold py-2.5 rounded-xl text-sm hover:bg-brand-50 transition-colors mb-4"
        >
          ↓ Export Backup
        </button>

        <div className="border-t border-gray-100 pt-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Import from backup</p>
          <textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder="Paste backup JSON here…"
            className="w-full text-xs border border-gray-200 rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-brand-300 font-mono"
            rows={4}
          />
          {importError && (
            <p className="text-xs text-red-500 mt-1">{importError}</p>
          )}
          {importSuccess && (
            <p className="text-xs text-emerald-500 mt-1">✓ Data imported successfully</p>
          )}
          <button
            onClick={handleImport}
            className="mt-2 w-full border border-gray-200 text-gray-600 font-medium py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors"
          >
            Import
          </button>
        </div>
      </div>

      {/* About */}
      <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
        <p className="text-xs text-gray-400 text-center">
          Data stored locally in your browser. Nothing is sent to any server.
        </p>
      </div>
    </div>
  );
}
