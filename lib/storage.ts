import { AppData, CheckIn, DosageChange } from "@/types";

const STORAGE_KEY = "med-tracker-data";

function defaultData(): AppData {
  return {
    checkIns: [],
    dosageHistory: [
      {
        id: "initial",
        date: new Date().toISOString().split("T")[0],
        timestamp: Date.now(),
        dosage: "150mg XL",
        notes: "Starting dose",
      },
    ],
    currentDosage: "150mg XL",
  };
}

export function getData(): AppData {
  if (typeof window === "undefined") return defaultData();
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return defaultData();
  try {
    return JSON.parse(raw) as AppData;
  } catch {
    return defaultData();
  }
}

export function saveData(data: AppData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function addCheckIn(
  entry: Omit<CheckIn, "id" | "timestamp">
): AppData {
  const data = getData();
  const newEntry: CheckIn = {
    ...entry,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  };
  data.checkIns = [newEntry, ...data.checkIns];
  saveData(data);
  return data;
}

export function deleteCheckIn(id: string): AppData {
  const data = getData();
  data.checkIns = data.checkIns.filter((c) => c.id !== id);
  saveData(data);
  return data;
}

export function updateDosage(dosage: string, notes: string = ""): AppData {
  const data = getData();
  const change: DosageChange = {
    id: crypto.randomUUID(),
    date: new Date().toISOString().split("T")[0],
    timestamp: Date.now(),
    dosage,
    notes,
  };
  data.currentDosage = dosage;
  data.dosageHistory = [change, ...data.dosageHistory];
  saveData(data);
  return data;
}

export function exportData(): string {
  return JSON.stringify(getData(), null, 2);
}

export function importData(json: string): boolean {
  try {
    const parsed = JSON.parse(json) as AppData;
    if (!parsed.checkIns || !parsed.dosageHistory) return false;
    saveData(parsed);
    return true;
  } catch {
    return false;
  }
}
