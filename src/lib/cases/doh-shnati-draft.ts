import type { AnalysisResult } from "@/lib/analyzers/types";
import type { Locale } from "@/lib/i18n/translations";
import { formatCurrency } from "@/lib/utils/format";
import {
  buildDocumentChecklist,
  type ClientProfileType,
  type DocumentChecklistResult,
} from "./document-checklist";
import { extractNumericField, extractTextField } from "./extract-fields";

export type CrossCheckStatus = "ok" | "warning" | "error" | "info";

export type CrossCheck = {
  id: string;
  status: CrossCheckStatus;
  messageHe: string;
  messageEn: string;
  delta?: number;
};

export type PaySlipMonthRow = {
  month: number;
  documentId?: string;
  fileName?: string;
  gross: number | null;
  net: number | null;
  incomeTax: number | null;
};

export type DohShnatiDraft = {
  clientName: string;
  clientIdNum: string | null;
  taxYear: number;
  clientProfile: ClientProfileType;
  checklist: DocumentChecklistResult;
  crossChecks: CrossCheck[];
  form106: {
    totalIncome: number | null;
    taxableIncome: number | null;
    taxPaid: number | null;
    nationalInsurance: number | null;
    employeeName: string | null;
    employerName: string | null;
  };
  paySlips: PaySlipMonthRow[];
  paySlipsTotalGross: number | null;
  paySlipsTotalTax: number | null;
  advances: { totalPaid: number | null };
  nationalInsuranceReport: { total: number | null };
  draftRows: Array<{ labelHe: string; labelEn: string; value: string; source?: string }>;
  readyForDraft: boolean;
};

type StoredDocument = {
  id: string;
  fileName: string;
  analyzerId: string;
  status: string;
  periodMonth?: number | null;
  analysisJson: AnalysisResult | null;
};

function mapPaySlipsToMonths(documents: StoredDocument[]): Map<number, StoredDocument> {
  const analyzed = documents.filter(
    (d) => d.analyzerId === "pay-slip" && d.status === "ANALYZED" && d.analysisJson,
  );
  const byMonth = new Map<number, StoredDocument>();

  for (const doc of analyzed) {
    if (doc.periodMonth && doc.periodMonth >= 1 && doc.periodMonth <= 12) {
      if (!byMonth.has(doc.periodMonth)) {
        byMonth.set(doc.periodMonth, doc);
      }
    }
  }

  const unassigned = analyzed.filter(
    (d) => !d.periodMonth || d.periodMonth < 1 || d.periodMonth > 12,
  );
  for (const doc of unassigned) {
    for (let m = 1; m <= 12; m++) {
      if (!byMonth.has(m)) {
        byMonth.set(m, doc);
        break;
      }
    }
  }

  return byMonth;
}

function buildPaySlipRows(documents: StoredDocument[]): PaySlipMonthRow[] {
  const byMonth = mapPaySlipsToMonths(documents);
  return Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const doc = byMonth.get(month);
    const analysis = doc?.analysisJson;
    return {
      month,
      documentId: doc?.id,
      fileName: doc?.fileName,
      gross: analysis ? extractNumericField(analysis, ["grossSalary"]) : null,
      net: analysis ? extractNumericField(analysis, ["netSalary"]) : null,
      incomeTax: analysis ? extractNumericField(analysis, ["incomeTax"]) : null,
    };
  });
}

function buildCrossChecks(
  profile: ClientProfileType,
  form106: DohShnatiDraft["form106"],
  paySlipsTotalGross: number | null,
  paySlipsTotalTax: number | null,
  advancesTotal: number | null,
  checklist: DocumentChecklistResult,
): CrossCheck[] {
  const checks: CrossCheck[] = [];

  const missingRequired = checklist.items.filter((i) => i.required && !i.fulfilled);
  if (missingRequired.length > 0) {
    checks.push({
      id: "missing-required",
      status: "warning",
      messageHe: `חסרים ${missingRequired.length} מסמכים חובה לדוח שנתי`,
      messageEn: `${missingRequired.length} required document(s) missing for annual report`,
    });
  }

  const missingPaySlips = checklist.items.filter(
    (i) => i.kind === "pay-slip-month" && !i.fulfilled,
  );
  if (profile === "EMPLOYEE" && missingPaySlips.length > 0) {
    checks.push({
      id: "missing-pay-slips",
      status: "info",
      messageHe: `חסרים ${missingPaySlips.length} תלושי שכר (מתוך 12)`,
      messageEn: `${missingPaySlips.length} pay slip month(s) still missing`,
    });
  }

  if (
    form106.totalIncome !== null &&
    paySlipsTotalGross !== null &&
    paySlipsTotalGross > 0
  ) {
    const delta = Math.abs(form106.totalIncome - paySlipsTotalGross);
    const tolerance = Math.max(500, form106.totalIncome * 0.02);
    if (delta > tolerance) {
      checks.push({
        id: "106-vs-payslips-gross",
        status: "error",
        messageHe: `פער של ${formatCurrency(delta, "he")} בין הכנסות ב-106 לסכום ברוטו בתלושים`,
        messageEn: `${formatCurrency(delta, "en")} gap between Form 106 income and pay slip gross total`,
        delta,
      });
    } else {
      checks.push({
        id: "106-vs-payslips-gross",
        status: "ok",
        messageHe: "הכנסות 106 תואמות לסכום ברוטו בתלושים",
        messageEn: "Form 106 income matches pay slip gross total",
      });
    }
  }

  if (form106.taxPaid !== null && paySlipsTotalTax !== null && paySlipsTotalTax > 0) {
    const delta = Math.abs(form106.taxPaid - paySlipsTotalTax);
    const tolerance = Math.max(300, form106.taxPaid * 0.02);
    if (delta > tolerance) {
      checks.push({
        id: "106-vs-payslips-tax",
        status: "warning",
        messageHe: `פער של ${formatCurrency(delta, "he")} במס הכנסה בין 106 לתלושים`,
        messageEn: `${formatCurrency(delta, "en")} gap in income tax between Form 106 and pay slips`,
        delta,
      });
    } else {
      checks.push({
        id: "106-vs-payslips-tax",
        status: "ok",
        messageHe: "מס הכנסה ב-106 תואם לסכום בתלושים",
        messageEn: "Form 106 tax matches pay slip tax total",
      });
    }
  }

  if (
    profile === "SELF_EMPLOYED" &&
    form106.taxPaid !== null &&
    advancesTotal !== null &&
    advancesTotal > 0
  ) {
    const delta = Math.abs(form106.taxPaid - advancesTotal);
    const tolerance = Math.max(500, form106.taxPaid * 0.05);
    if (delta > tolerance) {
      checks.push({
        id: "106-vs-advances",
        status: "warning",
        messageHe: `פער של ${formatCurrency(delta, "he")} בין מס ב-106 למקדמות ששולמו`,
        messageEn: `${formatCurrency(delta, "en")} gap between Form 106 tax and advance payments`,
        delta,
      });
    } else {
      checks.push({
        id: "106-vs-advances",
        status: "ok",
        messageHe: "מקדמות תואמות למס ב-106",
        messageEn: "Advance payments align with Form 106 tax",
      });
    }
  }

  return checks;
}

export function buildDohShnatiDraft(
  clientName: string,
  clientIdNum: string | null,
  taxYear: number,
  clientProfile: ClientProfileType,
  documents: StoredDocument[],
  locale: Locale = "he",
): DohShnatiDraft {
  const checklist = buildDocumentChecklist(
    clientProfile,
    documents.map((d) => ({
      id: d.id,
      fileName: d.fileName,
      analyzerId: d.analyzerId,
      status: d.status,
      periodMonth: d.periodMonth,
    })),
  );

  const form106Doc = documents.find(
    (d) => d.analyzerId === "form-106" && d.status === "ANALYZED" && d.analysisJson,
  );
  const form106Analysis = form106Doc?.analysisJson;

  const form106 = {
    totalIncome: form106Analysis
      ? extractNumericField(form106Analysis, ["totalIncome", "taxableIncome"])
      : null,
    taxableIncome: form106Analysis
      ? extractNumericField(form106Analysis, ["taxableIncome"])
      : null,
    taxPaid: form106Analysis
      ? extractNumericField(form106Analysis, ["taxPaid", "incomeTax"])
      : null,
    nationalInsurance: form106Analysis
      ? extractNumericField(form106Analysis, ["nationalInsurance"])
      : null,
    employeeName: form106Analysis
      ? extractTextField(form106Analysis, ["employeeName"])
      : null,
    employerName: form106Analysis
      ? extractTextField(form106Analysis, ["employerName"])
      : null,
  };

  const paySlips = buildPaySlipRows(documents);
  const paySlipsWithData = paySlips.filter((p) => p.gross !== null);
  const paySlipsTotalGross =
    paySlipsWithData.length > 0
      ? paySlipsWithData.reduce((sum, p) => sum + (p.gross ?? 0), 0)
      : null;
  const paySlipsTotalTax =
    paySlipsWithData.length > 0
      ? paySlipsWithData.reduce((sum, p) => sum + (p.incomeTax ?? 0), 0)
      : null;

  const advanceDoc = documents.find(
    (d) => d.analyzerId === "advance-tax" && d.status === "ANALYZED" && d.analysisJson,
  );
  const advancesTotal = advanceDoc?.analysisJson
    ? extractNumericField(advanceDoc.analysisJson, ["totalAdvancePaid"])
    : null;

  const niDoc = documents.find(
    (d) =>
      d.analyzerId === "national-insurance" && d.status === "ANALYZED" && d.analysisJson,
  );
  const niTotal = niDoc?.analysisJson
    ? extractNumericField(niDoc.analysisJson, ["totalNI", "nationalInsurance"])
    : null;

  const crossChecks = buildCrossChecks(
    clientProfile,
    form106,
    paySlipsTotalGross,
    paySlipsTotalTax,
    advancesTotal,
    checklist,
  );

  const draftRows: DohShnatiDraft["draftRows"] = [];

  const pushRow = (
    labelHe: string,
    labelEn: string,
    value: number | null,
    source?: string,
  ) => {
    if (value === null) return;
    draftRows.push({
      labelHe,
      labelEn,
      value: formatCurrency(value, locale),
      source,
    });
  };

  pushRow("הכנסות שנתיות (106)", "Annual income (106)", form106.totalIncome, "form-106");
  pushRow("מס הכנסה שנוכה (106)", "Tax withheld (106)", form106.taxPaid, "form-106");
  pushRow(
    "ביטוח לאומי (106)",
    "National insurance (106)",
    form106.nationalInsurance,
    "form-106",
  );
  pushRow("סה״כ ברוטו (תלושים)", "Total gross (pay slips)", paySlipsTotalGross, "pay-slip");
  pushRow("סה״כ מס (תלושים)", "Total tax (pay slips)", paySlipsTotalTax, "pay-slip");
  pushRow("מקדמות ששולמו", "Advance tax paid", advancesTotal, "advance-tax");
  pushRow("ביטוח לאומי (דוח)", "National insurance (report)", niTotal, "national-insurance");

  const has106 = Boolean(form106Doc);
  const readyForDraft =
    has106 &&
    crossChecks.every((c) => c.status !== "error") &&
    checklist.requiredFulfilled === checklist.requiredTotal;

  return {
    clientName,
    clientIdNum,
    taxYear,
    clientProfile,
    checklist,
    crossChecks,
    form106,
    paySlips,
    paySlipsTotalGross,
    paySlipsTotalTax,
    advances: { totalPaid: advancesTotal },
    nationalInsuranceReport: { total: niTotal },
    draftRows,
    readyForDraft,
  };
}
