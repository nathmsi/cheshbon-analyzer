import { describe, expect, it } from "vitest";
import { detectPaySlipMonth } from "@/lib/cases/detect-pay-slip-month";
import { buildDocumentChecklist } from "@/lib/cases/document-checklist";
import { buildDohShnatiDraft } from "@/lib/cases/doh-shnati-draft";
import type { AnalysisResult } from "@/lib/analyzers/types";

function mockAnalysis(fields: Record<string, number>): AnalysisResult {
  return {
    analyzerId: "pay-slip",
    fileName: "test.xlsx",
    analyzedAt: new Date().toISOString(),
    confidence: "high",
    summary: { title: "Test", kpis: [] },
    sections: [
      {
        id: "main",
        title: "Main",
        fields: Object.entries(fields).map(([key, value]) => ({
          key,
          label: key,
          value,
          type: "currency" as const,
          confidence: "high" as const,
        })),
      },
    ],
    insights: [],
    meta: { sheets: [], totalRows: 1 },
  };
}

describe("detectPaySlipMonth", () => {
  it("detects month from filename pattern", () => {
    expect(detectPaySlipMonth("pay-slip-03-2024.xlsx")).toBe(3);
    expect(detectPaySlipMonth("2024-11-salary.pdf")).toBe(11);
  });
});

describe("buildDocumentChecklist", () => {
  it("marks form 106 as required for employee", () => {
    const result = buildDocumentChecklist("EMPLOYEE", []);
    expect(result.requiredTotal).toBe(1);
    expect(result.items.find((i) => i.id === "form-106")?.required).toBe(true);
    expect(result.items.filter((i) => i.kind === "pay-slip-month")).toHaveLength(12);
  });

  it("tracks fulfilled pay slip month", () => {
    const result = buildDocumentChecklist("EMPLOYEE", [
      {
        id: "1",
        fileName: "m3.xlsx",
        analyzerId: "pay-slip",
        status: "ANALYZED",
        periodMonth: 3,
      },
    ]);
    const march = result.items.find((i) => i.month === 3);
    expect(march?.fulfilled).toBe(true);
  });
});

describe("buildDohShnatiDraft", () => {
  it("flags gap between 106 income and pay slip gross", () => {
    const form106 = mockAnalysis({ totalIncome: 200_000, taxPaid: 40_000 });
    form106.analyzerId = "form-106";

    const paySlip = mockAnalysis({ grossSalary: 150_000, incomeTax: 30_000 });

    const draft = buildDohShnatiDraft(
      "Test Client",
      "123",
      2024,
      "EMPLOYEE",
      [
        {
          id: "f1",
          fileName: "106.xlsx",
          analyzerId: "form-106",
          status: "ANALYZED",
          periodMonth: null,
          analysisJson: form106,
        },
        {
          id: "p1",
          fileName: "03.xlsx",
          analyzerId: "pay-slip",
          status: "ANALYZED",
          periodMonth: 3,
          analysisJson: paySlip,
        },
      ],
      "he",
    );

    const grossCheck = draft.crossChecks.find((c) => c.id === "106-vs-payslips-gross");
    expect(grossCheck?.status).toBe("error");
    expect(draft.paySlipsTotalGross).toBe(150_000);
  });
});
