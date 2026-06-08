import type { Locale } from "@/lib/i18n/translations";
import { translations } from "@/lib/i18n/translations";
import { formatCurrency, formatPercent } from "@/lib/utils/format";
import {
  extractFieldsFromWorkbook,
  type FieldPattern,
} from "./field-extractor";
import type {
  AnalysisResult,
  AnalyzerDefinition,
  FieldValue,
  ParsedWorkbook,
} from "./types";

export const FORM_106_PATTERNS: FieldPattern[] = [
  {
    key: "employeeName",
    labels: ["שם עובד", "שם העובד", "שם פרטי ומשפחה", "employee name", "name"],
    type: "text",
  },
  {
    key: "employeeId",
    labels: ["ת.ז", "ת.ז.", "תעודת זהות", "מספר זהות", "id number", "employee id"],
    type: "text",
  },
  {
    key: "employerName",
    labels: ["שם מעסיק", "שם המעסיק", "employer name", "employer", "חברה"],
    type: "text",
  },
  {
    key: "employerId",
    labels: ["ח.פ", "ח.פ.", "ע.מ", "ע.מ.", "מספר תיק", "company id"],
    type: "text",
  },
  {
    key: "taxYear",
    labels: ["שנת מס", "שנת הדוח", "tax year", "שנה", "year"],
    type: "text",
  },
  {
    key: "totalIncome",
    labels: [
      "סה\"כ הכנסות",
      "סך הכל הכנסות",
      "total income",
      "total gross",
      "הכנסה כוללת",
    ],
    type: "currency",
  },
  {
    key: "taxableIncome",
    labels: [
      "הכנסה חייבת",
      "taxable income",
      "הכנסה חייבת במס",
      "נטו חייב",
    ],
    type: "currency",
  },
  {
    key: "taxPaid",
    labels: [
      "מס הכנסה שנוכה",
      "מס שנוכה",
      "tax withheld",
      "tax paid",
      "ניכוי מס",
      "מס ששולם",
    ],
    type: "currency",
  },
  {
    key: "creditPoints",
    labels: ["נקודות זיכוי", "credit points", "נקודות", "tax credit points"],
    type: "number",
  },
  {
    key: "nationalInsurance",
    labels: ["ביטוח לאומי", "national insurance", "ניכוי ביטוח לאומי"],
    type: "currency",
  },
  {
    key: "healthTax",
    labels: ["מס בריאות", "health tax", "ניכוי מס בריאות"],
    type: "currency",
  },
  {
    key: "pension",
    labels: [
      "הפרשות לפנסיה",
      "פנסיה",
      "pension",
      "קופת גמל",
      "גמל",
    ],
    type: "currency",
  },
  {
    key: "studyFund",
    labels: ["קרן השתלמות", "study fund", "השתלמות"],
    type: "currency",
  },
  {
    key: "compensation",
    labels: ["פיצויים", "compensation", "מענק פרישה"],
    type: "currency",
  },
  {
    key: "bonus",
    labels: ["בונוס", "bonus", "מענקים", "פרמיות"],
    type: "currency",
  },
  {
    key: "carBenefit",
    labels: ["שווי רכב", "car benefit", "רכב", "הטבת רכב"],
    type: "currency",
  },
  {
    key: "otherIncome",
    labels: ["הכנסות אחרות", "other income", "הכנסה נוספת"],
    type: "currency",
  },
];

function getNumeric(
  fields: Map<string, { value: string | number }>,
  key: string,
): number | null {
  const val = fields.get(key)?.value;
  if (typeof val === "number") return val;
  if (typeof val === "string") {
    const num = parseFloat(val.replace(/,/g, ""));
    return isNaN(num) ? null : num;
  }
  return null;
}

function buildFieldValues(
  fields: Map<
    string,
    { value: string | number; confidence: "high" | "medium" | "low"; source: string }
  >,
  keys: string[],
  locale: Locale,
): FieldValue[] {
  const t = translations[locale].fields;
  return keys
    .filter((key) => fields.has(key))
    .map((key) => {
      const data = fields.get(key)!;
      const label = t[key as keyof typeof t] ?? key;
      const pattern = FORM_106_PATTERNS.find((p) => p.key === key);
      return {
        key,
        label,
        value: data.value,
        type: pattern?.type ?? "text",
        confidence: data.confidence,
        source: data.source,
      };
    });
}

export function analyzeForm106(
  workbook: ParsedWorkbook,
  locale: Locale,
): AnalysisResult {
  const t = translations[locale];
  const fields = extractFieldsFromWorkbook(workbook, FORM_106_PATTERNS);

  const totalIncome = getNumeric(fields, "totalIncome");
  const taxableIncome = getNumeric(fields, "taxableIncome");
  const taxPaid = getNumeric(fields, "taxPaid");
  const pension = getNumeric(fields, "pension");
  const studyFund = getNumeric(fields, "studyFund");
  const nationalInsurance = getNumeric(fields, "nationalInsurance");
  const healthTax = getNumeric(fields, "healthTax");
  const creditPoints = getNumeric(fields, "creditPoints");

  const incomeBase = totalIncome ?? taxableIncome;
  const effectiveTaxRate =
    incomeBase && taxPaid ? (Math.abs(taxPaid) / incomeBase) * 100 : null;

  const totalBenefits = [pension, studyFund, nationalInsurance, healthTax]
    .filter((v): v is number => v !== null)
    .reduce((sum, v) => sum + Math.abs(v), 0);

  const insights: AnalysisResult["insights"] = [];

  if (incomeBase !== null && taxPaid !== null) {
    insights.push({
      type: "success",
      message:
        locale === "he"
          ? `מס שנוכה: ${formatCurrency(Math.abs(taxPaid), locale)} מתוך הכנסות של ${formatCurrency(incomeBase, locale)}`
          : `Tax withheld: ${formatCurrency(Math.abs(taxPaid), locale)} from income of ${formatCurrency(incomeBase, locale)}`,
    });
  }

  if (effectiveTaxRate !== null) {
    if (effectiveTaxRate > 30) {
      insights.push({
        type: "warning",
        message:
          locale === "he"
            ? `שיעור מס אפקטивי גבוה (${formatPercent(effectiveTaxRate, locale)}) — בדוק נקודות זיכוי והחזרי מס`
            : `High effective tax rate (${formatPercent(effectiveTaxRate, locale)}) — check credit points and tax refunds`,
      });
    } else {
      insights.push({
        type: "info",
        message:
          locale === "he"
            ? `שיעור מס אפקטיבי: ${formatPercent(effectiveTaxRate, locale)}`
            : `Effective tax rate: ${formatPercent(effectiveTaxRate, locale)}`,
      });
    }
  }

  if (creditPoints !== null && creditPoints < 2.25) {
    insights.push({
      type: "warning",
      message:
        locale === "he"
          ? `נקודות זיכוי נמוכות (${creditPoints}) — בדוק זכאות לנקודות נוספות`
          : `Low credit points (${creditPoints}) — check eligibility for additional points`,
    });
  }

  if (pension !== null && incomeBase !== null) {
    const pensionRate = (Math.abs(pension) / incomeBase) * 100;
    if (pensionRate < 7) {
      insights.push({
        type: "warning",
        message:
          locale === "he"
            ? `הפרשות פנסיה נמוכות (${formatPercent(pensionRate, locale)} מההכנסה)`
            : `Low pension contributions (${formatPercent(pensionRate, locale)} of income)`,
      });
    }
  }

  if (fields.size === 0) {
    insights.push({
      type: "warning",
      message:
        locale === "he"
          ? "לא זוהו שדות מוכרים — ודא שהקובץ מכיל נתוני טופס 106"
          : "No recognized fields found — ensure the file contains Form 106 data",
    });
  }

  const highConfidenceCount = [...fields.values()].filter(
    (f) => f.confidence === "high",
  ).length;
  const confidence: AnalysisResult["confidence"] =
    highConfidenceCount >= 5
      ? "high"
      : fields.size >= 3
        ? "medium"
        : "low";

  const employeeName = fields.get("employeeName")?.value;
  const taxYear = fields.get("taxYear")?.value;

  const kpis = [
    incomeBase !== null
      ? {
          label: t.fields.totalIncome,
          value: formatCurrency(incomeBase, locale),
          highlight: true,
        }
      : null,
    taxPaid !== null
      ? {
          label: t.fields.taxPaid,
          value: formatCurrency(Math.abs(taxPaid), locale),
          highlight: true,
        }
      : null,
    effectiveTaxRate !== null
      ? {
          label: t.results.effectiveTaxRate,
          value: formatPercent(effectiveTaxRate, locale),
        }
      : null,
    totalBenefits > 0
      ? {
          label: locale === "he" ? "סך הפרשות וניכויים" : "Total Benefits & Deductions",
          value: formatCurrency(totalBenefits, locale),
        }
      : null,
  ].filter(Boolean) as AnalysisResult["summary"]["kpis"];

  const titleParts: string[] = [t.analyzers["form-106"].title];
  if (typeof employeeName === "string") titleParts.push(String(employeeName));
  if (typeof taxYear === "string" || typeof taxYear === "number")
    titleParts.push(String(taxYear));

  return {
    analyzerId: "form-106",
    fileName: "",
    analyzedAt: new Date().toISOString(),
    confidence,
    summary: {
      title: titleParts.join(" — "),
      kpis,
    },
    sections: [
      {
        id: "employee",
        title: t.results.employeeInfo,
        fields: buildFieldValues(
          fields,
          ["employeeName", "employeeId", "taxYear"],
          locale,
        ),
      },
      {
        id: "employer",
        title: t.results.employerInfo,
        fields: buildFieldValues(fields, ["employerName", "employerId"], locale),
      },
      {
        id: "income",
        title: locale === "he" ? "הכנסות שנתיות" : "Annual Income",
        fields: buildFieldValues(
          fields,
          ["totalIncome", "taxableIncome", "bonus", "carBenefit", "otherIncome", "compensation"],
          locale,
        ),
      },
      {
        id: "taxes",
        title: t.results.taxes,
        fields: buildFieldValues(
          fields,
          ["taxPaid", "creditPoints", "nationalInsurance", "healthTax"],
          locale,
        ),
      },
      {
        id: "benefits",
        title: locale === "he" ? "הפרשות סוציאליות" : "Social Benefits",
        fields: buildFieldValues(fields, ["pension", "studyFund"], locale),
      },
    ].filter((section) => section.fields.length > 0),
    insights,
    meta: {
      sheets: workbook.sheetNames,
      totalRows: workbook.totalRows,
      detectedFormat: "form-106",
    },
  };
}

export const form106Analyzer: AnalyzerDefinition = {
  id: "form-106",
  icon: "file-text",
  available: true,
  analyze: analyzeForm106,
};
