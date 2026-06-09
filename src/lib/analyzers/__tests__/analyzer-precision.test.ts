import { describe, it, expect } from "vitest";
import { analyzePaySlip } from "../pay-slip";
import { analyzeForm106 } from "../form-106";
import { extractFieldsFromWorkbook, PAY_SLIP_PATTERNS } from "../field-extractor";
import {
  paySlipWorkbook,
  form106Workbook,
  rtlPaySlipWorkbook,
  PAY_SLIP_EXPECTED,
  FORM_106_EXPECTED,
  RTL_PAY_SLIP_EXPECTED,
} from "../__fixtures__/sample-data";

function getFieldValue(
  result: ReturnType<typeof analyzePaySlip>,
  key: string,
): string | number | undefined {
  for (const section of result.sections) {
    const field = section.fields.find((f) => f.key === key);
    if (field) return field.value;
  }
  return undefined;
}

function getNumericField(
  result: ReturnType<typeof analyzePaySlip>,
  key: string,
): number | undefined {
  const val = getFieldValue(result, key);
  return typeof val === "number" ? val : undefined;
}

describe("Pay Slip Analyzer — precision", () => {
  const result = analyzePaySlip(paySlipWorkbook, "he");

  it("detects high confidence with sample data", () => {
    expect(result.confidence).toBe("high");
  });

  it("extracts employee identity fields accurately", () => {
    expect(getFieldValue(result, "employeeName")).toBe(
      PAY_SLIP_EXPECTED.employeeName,
    );
    expect(getFieldValue(result, "employeeId")).toBe(PAY_SLIP_EXPECTED.employeeId);
    expect(getFieldValue(result, "employerName")).toBe(
      PAY_SLIP_EXPECTED.employerName,
    );
    expect(getFieldValue(result, "employerId")).toBe(PAY_SLIP_EXPECTED.employerId);
  });

  it("extracts salary amounts with exact precision", () => {
    expect(getNumericField(result, "grossSalary")).toBe(
      PAY_SLIP_EXPECTED.grossSalary,
    );
    expect(getNumericField(result, "netSalary")).toBe(PAY_SLIP_EXPECTED.netSalary);
    expect(getNumericField(result, "bonus")).toBe(PAY_SLIP_EXPECTED.bonus);
    expect(getNumericField(result, "overtime")).toBe(PAY_SLIP_EXPECTED.overtime);
    expect(getNumericField(result, "travel")).toBe(PAY_SLIP_EXPECTED.travel);
  });

  it("extracts tax and deduction amounts accurately", () => {
    expect(getNumericField(result, "incomeTax")).toBe(PAY_SLIP_EXPECTED.incomeTax);
    expect(getNumericField(result, "nationalInsurance")).toBe(
      PAY_SLIP_EXPECTED.nationalInsurance,
    );
    expect(getNumericField(result, "healthTax")).toBe(PAY_SLIP_EXPECTED.healthTax);
    expect(getNumericField(result, "pension")).toBe(PAY_SLIP_EXPECTED.pension);
    expect(getNumericField(result, "studyFund")).toBe(PAY_SLIP_EXPECTED.studyFund);
  });

  it("computes correct KPI summary values", () => {
    const grossKpi = result.summary.kpis.find((k) =>
      k.label.includes("ברוטו"),
    );
    const netKpi = result.summary.kpis.find((k) => k.label.includes("נטו"));
    expect(grossKpi?.value).toContain("18,500");
    expect(netKpi?.value).toContain("14,205");
  });

  it("generates meaningful insights", () => {
    expect(result.insights.length).toBeGreaterThan(0);
    expect(result.insights.some((i) => i.type === "success")).toBe(true);
  });

  it("includes employee name in title", () => {
    expect(result.summary.title).toContain(PAY_SLIP_EXPECTED.employeeName);
  });
});

describe("Pay Slip Analyzer — RTL PDF layout", () => {
  const result = analyzePaySlip(rtlPaySlipWorkbook, "he");

  it("extracts gross and net from value-before-label rows", () => {
    expect(getNumericField(result, "grossSalary")).toBe(
      RTL_PAY_SLIP_EXPECTED.grossSalary,
    );
    expect(getNumericField(result, "netSalary")).toBe(
      RTL_PAY_SLIP_EXPECTED.netSalary,
    );
  });

  it("ignores section headers that only label the next detail row", () => {
    expect(getNumericField(result, "netSalary")).not.toBe(21.67);
  });

  it("extracts embedded amounts from combined label cells", () => {
    const fields = extractFieldsFromWorkbook(rtlPaySlipWorkbook, PAY_SLIP_PATTERNS);
    expect(fields.get("nationalInsurance")?.value).toBe(
      RTL_PAY_SLIP_EXPECTED.nationalInsurance,
    );
  });
});

describe("Form 106 Analyzer — precision", () => {
  const result = analyzeForm106(form106Workbook, "he");

  it("detects medium or high confidence with sample data", () => {
    expect(["medium", "high"]).toContain(result.confidence);
  });

  it("extracts employee and employer identity accurately", () => {
    expect(getFieldValue(result, "employeeName")).toBe(
      FORM_106_EXPECTED.employeeName,
    );
    expect(getFieldValue(result, "employeeId")).toBe(FORM_106_EXPECTED.employeeId);
    expect(getFieldValue(result, "employerName")).toBe(
      FORM_106_EXPECTED.employerName,
    );
    expect(getFieldValue(result, "taxYear")).toBe(FORM_106_EXPECTED.taxYear);
  });

  it("extracts annual income fields with exact precision", () => {
    expect(getNumericField(result, "totalIncome")).toBe(
      FORM_106_EXPECTED.totalIncome,
    );
    expect(getNumericField(result, "taxableIncome")).toBe(
      FORM_106_EXPECTED.taxableIncome,
    );
    expect(getNumericField(result, "bonus")).toBe(FORM_106_EXPECTED.bonus);
    expect(getNumericField(result, "carBenefit")).toBe(
      FORM_106_EXPECTED.carBenefit,
    );
    expect(getNumericField(result, "otherIncome")).toBe(
      FORM_106_EXPECTED.otherIncome,
    );
  });

  it("extracts tax and social fields accurately", () => {
    expect(getNumericField(result, "taxPaid")).toBe(FORM_106_EXPECTED.taxPaid);
    expect(getNumericField(result, "nationalInsurance")).toBe(
      FORM_106_EXPECTED.nationalInsurance,
    );
    expect(getNumericField(result, "healthTax")).toBe(FORM_106_EXPECTED.healthTax);
    expect(getNumericField(result, "pension")).toBe(FORM_106_EXPECTED.pension);
    expect(getNumericField(result, "studyFund")).toBe(FORM_106_EXPECTED.studyFund);
    expect(getNumericField(result, "creditPoints")).toBe(
      FORM_106_EXPECTED.creditPoints,
    );
  });

  it("computes effective tax rate KPI correctly", () => {
    const taxRateKpi = result.summary.kpis.find((k) =>
      k.label.includes("מס אפקטיבי"),
    );
    expect(taxRateKpi).toBeDefined();
    // 34200 / 228000 ≈ 15%
    expect(taxRateKpi?.value).toMatch(/15/);
  });

  it("generates tax-related insights", () => {
    expect(result.insights.length).toBeGreaterThan(0);
  });
});

describe("Cross-locale consistency", () => {
  it("returns same numeric values in Hebrew and English", () => {
    const he = analyzePaySlip(paySlipWorkbook, "he");
    const en = analyzePaySlip(paySlipWorkbook, "en");

    const heGross = getNumericField(he, "grossSalary");
    const enGross = getNumericField(en, "grossSalary");
    expect(heGross).toBe(enGross);
    expect(heGross).toBe(18500);
  });
});
