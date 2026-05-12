export interface CheckIn {
  id: string;
  date: string;          // "YYYY-MM-DD"
  timestamp: number;
  mood: number;          // 1-10
  energy: number;        // 1-10
  anxiety: number;       // 1-10
  depression: number;    // 1-10
  sleepQuality: number;  // 1-10
  appetite: number;      // 1-10
  sideEffects: string[];
  notes: string;
  dosage: string;        // e.g. "150mg XL"
}

export interface DosageChange {
  id: string;
  date: string;
  timestamp: number;
  dosage: string;
  notes: string;
}

export interface AppData {
  checkIns: CheckIn[];
  dosageHistory: DosageChange[];
  currentDosage: string;
}

export type Tab = "dashboard" | "checkin" | "history" | "settings";
