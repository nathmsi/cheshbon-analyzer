import type { FieldValue, ParsedWorkbook } from "./types";

export type FieldPattern = {
  key: string;
  labels: string[];
  type: FieldValue["type"];
};

const PAY_SLIP_PATTERNS: FieldPattern[] = [
  {
    key: "employeeName",
    labels: ["שם עובד", "שם העובד", "employee name", "name", "שם"],
    type: "text",
  },
  {
    key: "employeeId",
    labels: ["ת.ז", "ת.ז.", "תעודת זהות", "id", "employee id", "מספר זהות"],
    type: "text",
  },
  {
    key: "employerName",
    labels: ["שם מעסיק", "שם המעסיק", "employer", "company", "חברה"],
    type: "text",
  },
  {
    key: "employerId",
    labels: ["ח.פ", "ח.פ.", "ע.מ", "ע.מ.", "company id", "מספר חברה"],
    type: "text",
  },
  {
    key: "month",
    labels: ["חודש", "month", "תקופה", "period"],
    type: "text",
  },
  {
    key: "year",
    labels: ["שנה", "year", "שנת"],
    type: "text",
  },
  {
    key: "grossSalary",
    labels: [
      "שכר ברוטו",
      "ברוטו",
      "gross",
      "gross salary",
      "total gross",
      "סה\"כ ברוטו",
      "סך הכל ברוטו",
    ],
    type: "currency",
  },
  {
    key: "netSalary",
    labels: [
      "שכר נטו",
      "נטו",
      "net",
      "net salary",
      "לתשלום",
      "סה\"כ נטו",
      "סך הכל נטו",
      "נטו לתשלום",
    ],
    type: "currency",
  },
  {
    key: "incomeTax",
    labels: ["מס הכנסה", "income tax", "מס", "tax"],
    type: "currency",
  },
  {
    key: "nationalInsurance",
    labels: ["ביטוח לאומי", "national insurance", "ביטוח"],
    type: "currency",
  },
  {
    key: "healthTax",
    labels: ["מס בריאות", "health tax", "בריאות"],
    type: "currency",
  },
  {
    key: "pension",
    labels: ["פנסיה", "pension", "גמל", "קופת גמל"],
    type: "currency",
  },
  {
    key: "studyFund",
    labels: ["קרן השתלמות", "study fund", "השתלמות"],
    type: "currency",
  },
  {
    key: "compensation",
    labels: ["פיצויים", "compensation", "פיצוי"],
    type: "currency",
  },
  {
    key: "overtime",
    labels: ["שעות נוספות", "overtime", "נוספות"],
    type: "currency",
  },
  {
    key: "bonus",
    labels: ["בונוס", "bonus", "מענק", "פרמיה"],
    type: "currency",
  },
  {
    key: "travel",
    labels: ["נסיעות", "travel", "דמי נסיעות"],
    type: "currency",
  },
  {
    key: "vacationDays",
    labels: ["ימי חופשה", "vacation", "חופשה"],
    type: "number",
  },
  {
    key: "sickDays",
    labels: ["ימי מחלה", "sick days", "מחלה"],
    type: "number",
  },
  {
    key: "otherDeductions",
    labels: ["ניכויים אחרים", "other deductions", "ניכויים"],
    type: "currency",
  },
];

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[""''`]/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function parseNumber(value: string): number | null {
  const cleaned = value
    .replace(/[₪$€]/g, "")
    .replace(/,/g, "")
    .replace(/\s/g, "")
    .trim();

  if (!cleaned || cleaned === "-") return null;

  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

function isLikelyNumeric(value: string): boolean {
  return parseNumber(value) !== null;
}

function labelsMatch(cellValue: string, labels: string[]): boolean {
  const normalized = normalize(cellValue);
  return labels.some((label) => {
    const normLabel = normalize(label);
    return (
      normalized === normLabel ||
      normalized.includes(normLabel)
    );
  });
}

export function extractFieldsFromWorkbook(
  workbook: ParsedWorkbook,
  patterns: FieldPattern[],
): Map<string, { value: string | number; confidence: FieldValue["confidence"]; source: string }> {
  const found = new Map<
    string,
    { value: string | number; confidence: FieldValue["confidence"]; source: string }
  >();

  for (const [sheetName, rows] of Object.entries(workbook.sheets)) {
    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      const row = rows[rowIndex];

      for (let colIndex = 0; colIndex < row.length; colIndex++) {
        const cell = row[colIndex];
        if (!cell) continue;

        for (const pattern of patterns) {
          if (found.has(pattern.key)) continue;

          if (labelsMatch(cell, pattern.labels)) {
            // Look right first, then below
            const rightValue = row[colIndex + 1];
            const belowValue = rows[rowIndex + 1]?.[colIndex];

            let extracted: string | null = null;
            let confidence: FieldValue["confidence"] = "medium";
            let source = `${sheetName}!R${rowIndex + 1}C${colIndex + 1}`;

            if (pattern.type === "text") {
              if (rightValue && !labelsMatch(rightValue, pattern.labels)) {
                extracted = rightValue;
                confidence = "high";
              } else if (belowValue && !labelsMatch(belowValue, pattern.labels)) {
                extracted = belowValue;
                confidence = "medium";
              }
            } else {
              // For numeric fields, prefer numeric neighbors
              if (rightValue && isLikelyNumeric(rightValue)) {
                extracted = rightValue;
                confidence = "high";
              } else if (belowValue && isLikelyNumeric(belowValue)) {
                extracted = belowValue;
                confidence = "medium";
              } else if (rightValue) {
                extracted = rightValue;
                confidence = "low";
              }
            }

            if (extracted) {
              const numVal =
                pattern.type === "currency" || pattern.type === "number"
                  ? parseNumber(extracted)
                  : null;

              found.set(pattern.key, {
                value: numVal !== null ? numVal : extracted,
                confidence,
                source,
              });
            }
          }
        }
      }
    }
  }

  return found;
}

export { PAY_SLIP_PATTERNS };
