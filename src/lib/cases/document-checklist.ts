import type { AnalyzerId } from "@/lib/analyzers/types";

export type ClientProfileType = "EMPLOYEE" | "SELF_EMPLOYED";

export type ChecklistItemKind =
  | "form-106"
  | "pay-slip-month"
  | "advance-tax"
  | "national-insurance";

export type ChecklistItem = {
  id: string;
  kind: ChecklistItemKind;
  analyzerId: AnalyzerId;
  labelHe: string;
  labelEn: string;
  required: boolean;
  month?: number;
};

export type ChecklistItemStatus = ChecklistItem & {
  fulfilled: boolean;
  documentId?: string;
  fileName?: string;
};

export type DocumentChecklistResult = {
  items: ChecklistItemStatus[];
  requiredTotal: number;
  requiredFulfilled: number;
  completionPercent: number;
};

type StoredDoc = {
  id: string;
  fileName: string;
  analyzerId: string;
  status: string;
  periodMonth?: number | null;
};

function baseItems(profile: ClientProfileType): ChecklistItem[] {
  const form106: ChecklistItem = {
    id: "form-106",
    kind: "form-106",
    analyzerId: "form-106",
    labelHe: "טופס 106",
    labelEn: "Form 106",
    required: true,
  };

  if (profile === "SELF_EMPLOYED") {
    return [
      form106,
      {
        id: "advance-tax",
        kind: "advance-tax",
        analyzerId: "advance-tax",
        labelHe: "דוח מקדמות",
        labelEn: "Advance tax report",
        required: true,
      },
      {
        id: "national-insurance",
        kind: "national-insurance",
        analyzerId: "national-insurance",
        labelHe: "דוח ביטוח לאומי",
        labelEn: "National insurance report",
        required: false,
      },
    ];
  }

  const paySlips: ChecklistItem[] = Array.from({ length: 12 }, (_, i) => ({
    id: `pay-slip-${i + 1}`,
    kind: "pay-slip-month" as const,
    analyzerId: "pay-slip" as const,
    labelHe: `תלוש שכר — חודש ${i + 1}`,
    labelEn: `Pay slip — month ${i + 1}`,
    required: false,
    month: i + 1,
  }));

  return [form106, ...paySlips];
}

function assignPaySlipsByMonth(documents: StoredDoc[]): Map<number, StoredDoc> {
  const analyzed = documents.filter(
    (d) => d.analyzerId === "pay-slip" && d.status === "ANALYZED",
  );
  const byMonth = new Map<number, StoredDoc>();

  for (const doc of analyzed) {
    if (doc.periodMonth && doc.periodMonth >= 1 && doc.periodMonth <= 12) {
      if (!byMonth.has(doc.periodMonth)) byMonth.set(doc.periodMonth, doc);
    }
  }

  for (const doc of analyzed) {
    if (doc.periodMonth && doc.periodMonth >= 1 && doc.periodMonth <= 12) continue;
    for (let m = 1; m <= 12; m++) {
      if (!byMonth.has(m)) {
        byMonth.set(m, doc);
        break;
      }
    }
  }

  return byMonth;
}

export function buildDocumentChecklist(
  profile: ClientProfileType,
  documents: StoredDoc[],
): DocumentChecklistResult {
  const paySlipsByMonth = assignPaySlipsByMonth(documents);
  const analyzed = documents.filter((d) => d.status === "ANALYZED");

  const items = baseItems(profile).map((item): ChecklistItemStatus => {
    if (item.kind === "pay-slip-month" && item.month) {
      const doc = paySlipsByMonth.get(item.month);
      return {
        ...item,
        fulfilled: Boolean(doc),
        documentId: doc?.id,
        fileName: doc?.fileName,
      };
    }

    const doc = analyzed.find((d) => d.analyzerId === item.analyzerId);
    return {
      ...item,
      fulfilled: Boolean(doc),
      documentId: doc?.id,
      fileName: doc?.fileName,
    };
  });

  const requiredItems = items.filter((i) => i.required);
  const requiredFulfilled = requiredItems.filter((i) => i.fulfilled).length;
  const requiredTotal = requiredItems.length;
  const optionalFulfilled = items.filter((i) => !i.required && i.fulfilled).length;
  const optionalTotal = items.filter((i) => !i.required).length;

  const completionPercent =
    requiredTotal + optionalTotal === 0
      ? 0
      : Math.round(
          ((requiredFulfilled + optionalFulfilled) / (requiredTotal + optionalTotal)) * 100,
        );

  return {
    items,
    requiredTotal,
    requiredFulfilled,
    completionPercent,
  };
}
