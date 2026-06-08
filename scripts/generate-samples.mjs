/**
 * Generates sample Excel files for testing analyzers.
 * Run: node scripts/generate-samples.mjs
 */
import * as XLSX from "xlsx";
import { mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "..", "public", "samples");
mkdirSync(outDir, { recursive: true });

// ── Sample Pay Slip (תלוש שכר) ──────────────────────────────────────────
const paySlipData = [
  ["תלוש שכר", "", "", ""],
  ["", "", "", ""],
  ["שם עובד", "יוסי כהן", "שם מעסיק", "טכנולוגיות ABC בע\"מ"],
  ["ת.ז.", "123456782", "ח.פ.", "512345678"],
  ["חודש", "05/2025", "שנה", "2025"],
  ["", "", "", ""],
  ["פירוט שכר", "סכום", "ניכויים", "סכום"],
  ["שכר ברוטו", 18500, "מס הכנסה", 2850],
  ["שעות נוספות", 1200, "ביטוח לאומי", 740],
  ["בונוס", 3000, "מס בריאות", 520],
  ["נסיעות", 450, "פנסיה", 1110],
  ["", "", "קרן השתלמות", 925],
  ["", "", "", ""],
  ["שכר נטו", 14205, "סך ניכויים", 7145],
];

const paySlipWs = XLSX.utils.aoa_to_sheet(paySlipData);
const paySlipWb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(paySlipWb, paySlipWs, "תלוש שכר");
XLSX.writeFile(paySlipWb, join(outDir, "sample-pay-slip.xlsx"));
console.log("✓ public/samples/sample-pay-slip.xlsx");

// ── Sample Form 106 (טופס 106) ───────────────────────────────────────────
const form106Data = [
  ["טופס 106 — שנת מס 2024", "", "", ""],
  ["", "", "", ""],
  ["פרטי עובד", "", "פרטי מעסיק", ""],
  ["שם עובד", "יוסי כהן", "שם מעסיק", "טכנולוגיות ABC בע\"מ"],
  ["ת.ז.", "123456782", "ח.פ.", "512345678"],
  ["שנת מס", "2024", "", ""],
  ["", "", "", ""],
  ["הכנסות", "סכום (₪)", "ניכויים ומסים", "סכום (₪)"],
  ["סה\"כ הכנסות", 228000, "מס הכנסה שנוכה", 34200],
  ["הכנסה חייבת", 215000, "ביטוח לאומי", 8880],
  ["בונוס", 18000, "מס בריאות", 6240],
  ["שווי רכב", 12000, "הפרשות לפנסיה", 13320],
  ["הכנסות אחרות", 5000, "קרן השתלמות", 11100],
  ["", "", "נקודות זיכוי", 2.25],
  ["", "", "", ""],
  ["סיכום", "", "", ""],
  ["סה\"כ הפרשות סוציאליות", 24420, "מס שנוכה", 34200],
];

const form106Ws = XLSX.utils.aoa_to_sheet(form106Data);
const form106Wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(form106Wb, form106Ws, "טופס 106");
XLSX.writeFile(form106Wb, join(outDir, "sample-form-106.xlsx"));
console.log("✓ public/samples/sample-form-106.xlsx");

console.log("\nDone! Test files ready in public/samples/");
