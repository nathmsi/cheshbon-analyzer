import type { ParsedWorkbook } from "@/lib/analyzers/types";

/** Sample pay slip data matching scripts/generate-samples.mjs */
export const PAY_SLIP_ROWS: string[][] = [
  ["תלוש שכר", "", "", ""],
  ["", "", "", ""],
  ["שם עובד", "יוסי כהן", "שם מעסיק", "טכנולוגיות ABC בע\"מ"],
  ["ת.ז.", "123456782", "ח.פ.", "512345678"],
  ["חודש", "05/2025", "שנה", "2025"],
  ["", "", "", ""],
  ["פירוט שכר", "סכום", "ניכויים", "סכום"],
  ["שכר ברוטו", "18500", "מס הכנסה", "2850"],
  ["שעות נוספות", "1200", "ביטוח לאומי", "740"],
  ["בונוס", "3000", "מס בריאות", "520"],
  ["נסיעות", "450", "פנסיה", "1110"],
  ["", "", "קרן השתלמות", "925"],
  ["", "", "", ""],
  ["שכר נטו", "14205", "סך ניכויים", "7145"],
];

/** Sample Form 106 data matching scripts/generate-samples.mjs */
export const FORM_106_ROWS: string[][] = [
  ["טופס 106 — שנת מס 2024", "", "", ""],
  ["", "", "", ""],
  ["פרטי עובד", "", "פרטי מעסיק", ""],
  ["שם עובד", "יוסי כהן", "שם מעסיק", "טכנולוגיות ABC בע\"מ"],
  ["ת.ז.", "123456782", "ח.פ.", "512345678"],
  ["שנת מס", "2024", "", ""],
  ["", "", "", ""],
  ["הכנסות", "סכום (₪)", "ניכויים ומסים", "סכום (₪)"],
  ["סה\"כ הכנסות", "228000", "מס הכנסה שנוכה", "34200"],
  ["הכנסה חייבת", "215000", "ביטוח לאומי", "8880"],
  ["בונוס", "18000", "מס בריאות", "6240"],
  ["שווי רכב", "12000", "הפרשות לפנסיה", "13320"],
  ["הכנסות אחרות", "5000", "קרן השתלמות", "11100"],
  ["", "", "נקודות זיכוי", "2.25"],
  ["", "", "", ""],
  ["סיכום", "", "", ""],
  ["סה\"כ הפרשות סוציאליות", "24420", "מס שנוכה", "34200"],
];

export function buildWorkbook(
  sheetName: string,
  rows: string[][],
): ParsedWorkbook {
  return {
    sheets: { [sheetName]: rows },
    sheetNames: [sheetName],
    totalRows: rows.length,
  };
}

export const paySlipWorkbook = buildWorkbook("תלוש שכר", PAY_SLIP_ROWS);
export const form106Workbook = buildWorkbook("טופס 106", FORM_106_ROWS);

/** RTL summary layout (value before label) — common in Israeli PDF payslips */
export const RTL_PAY_SLIP_ROWS: string[][] = [
  ["תלוש משכורת לחודש", "1/2014"],
  ["משולם לעובד"],
  ["21.67 :", "תעריף שעה"],
  ["5,776.00", "סה\"כ תשלומים"],
  ["704.00", "סה\"כ ניכויים", "132.00", "ק. השתלמות"],
  ["5,072.00", "שכר נטו"],
  ["5,072.00", "נטו לתשלום"],
  ["230 ביטוח לאומי", "זיכוי משמרות"],
];

export const rtlPaySlipWorkbook = buildWorkbook("PDF", RTL_PAY_SLIP_ROWS);

export const RTL_PAY_SLIP_EXPECTED = {
  grossSalary: 5776,
  netSalary: 5072,
  nationalInsurance: 230,
};

/** Expected precision values for pay slip analyzer */
export const PAY_SLIP_EXPECTED = {
  employeeName: "יוסי כהן",
  employeeId: "123456782",
  employerName: 'טכנולוגיות ABC בע"מ',
  employerId: "512345678",
  grossSalary: 18500,
  netSalary: 14205,
  incomeTax: 2850,
  nationalInsurance: 740,
  healthTax: 520,
  pension: 1110,
  studyFund: 925,
  bonus: 3000,
  overtime: 1200,
  travel: 450,
};

/** Expected precision values for Form 106 analyzer */
export const FORM_106_EXPECTED = {
  employeeName: "יוסי כהן",
  employeeId: "123456782",
  employerName: 'טכנולוגיות ABC בע"מ',
  employerId: "512345678",
  taxYear: "2024",
  totalIncome: 228000,
  taxableIncome: 215000,
  taxPaid: 34200,
  nationalInsurance: 8880,
  healthTax: 6240,
  pension: 13320,
  studyFund: 11100,
  bonus: 18000,
  carBenefit: 12000,
  otherIncome: 5000,
  creditPoints: 2.25,
};
