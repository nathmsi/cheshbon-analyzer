import type { FieldValue, ParsedWorkbook } from "./types";

export type FieldPattern = {
  key: string;
  labels: string[];
  type: FieldValue["type"];
};

const PAY_SLIP_PATTERNS: FieldPattern[] = [
  {
    key: "employeeName",
    labels: ["שם עובד", "שם העובד", "employee name"],
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
      "סה\"כ תשלומים",
      "סך הכל תשלומים",
      "שכר שווה כסף",
    ],
    type: "currency",
  },
  {
    key: "netSalary",
    labels: [
      "שכר נטו",
      "net salary",
      "סה\"כ נטו",
      "סך הכל נטו",
      "נטו לתשלום",
      "משולם לעובד",
    ],
    type: "currency",
  },
  {
    key: "incomeTax",
    labels: ["מס הכנסה", "income tax", "מס הכנסה שנוכה"],
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
    if (normalized === normLabel) return true;
    // Avoid partial matches on very short labels (e.g. "מס", "שם")
    if (normLabel.length < 3) return false;
    return normalized.includes(normLabel);
  });
}

function findBestPattern(
  cell: string,
  patterns: FieldPattern[],
): FieldPattern | null {
  let best: FieldPattern | null = null;
  let bestLabelLen = 0;

  const normalized = normalize(cell);
  for (const pattern of patterns) {
    for (const label of pattern.labels) {
      const normLabel = normalize(label);
      const matches =
        normalized === normLabel ||
        (normLabel.length >= 3 && normalized.includes(normLabel));
      if (matches && normLabel.length > bestLabelLen) {
        best = pattern;
        bestLabelLen = normLabel.length;
      }
    }
  }

  return best;
}

function isLabelCell(value: string, patterns: FieldPattern[]): boolean {
  return findBestPattern(value, patterns) !== null;
}

function pickNumericNeighbor(
  left: string | undefined,
  right: string | undefined,
  colIndex: number,
): { value: string; confidence: FieldValue["confidence"] } | null {
  const leftOk = left && isLikelyNumeric(left);
  const rightOk = right && isLikelyNumeric(right);

  if (leftOk && rightOk) {
    // Alternating label-value columns: label at even index → value on the right
    const preferred = colIndex % 2 === 0 ? right! : left!;
    return { value: preferred, confidence: "high" };
  }
  if (leftOk) return { value: left!, confidence: "high" };
  if (rightOk) return { value: right!, confidence: "high" };
  return null;
}

function extractValueForCell(
  row: string[],
  rowIndex: number,
  colIndex: number,
  rows: string[][],
  pattern: FieldPattern,
  patterns: FieldPattern[],
): { value: string; confidence: FieldValue["confidence"] } | null {
  const left = row[colIndex - 1];
  const right = row[colIndex + 1];
  const below = rows[rowIndex + 1]?.[colIndex];
  const above = rows[rowIndex - 1]?.[colIndex];

  const isUsableNeighbor = (val: string | undefined) =>
    val !== undefined && val !== "" && !isLabelCell(val, patterns);

  const nonEmptyInRow = row.filter((c) => c?.trim()).length;
  const isSectionHeaderOnly = nonEmptyInRow === 1;

  if (pattern.type === "text") {
    for (const [val, confidence] of [
      [right, "high"],
      [left, "high"],
      [below, "medium"],
      [above, "low"],
    ] as const) {
      if (isUsableNeighbor(val)) {
        return { value: val!, confidence };
      }
    }
    return null;
  }

  // Same cell: "230 ביטוח לאומי" — prefer embedded amount over distant neighbors
  const embedded = cellEmbeddedNumber(row[colIndex]);
  if (embedded !== null) {
    return { value: String(embedded), confidence: "medium" };
  }

  const adjacent = pickNumericNeighbor(left, right, colIndex);
  if (adjacent) return adjacent;

  if (!isSectionHeaderOnly) {
    if (below && isLikelyNumeric(below)) {
      return { value: below, confidence: "medium" };
    }
    if (above && isLikelyNumeric(above)) {
      return { value: above, confidence: "low" };
    }
  }

  // Single unambiguous numeric elsewhere in the row
  const rowNumerics = row.filter(
    (cell, i) => i !== colIndex && cell && isLikelyNumeric(cell),
  );
  if (rowNumerics.length === 1) {
    return { value: rowNumerics[0]!, confidence: "medium" };
  }

  return null;
}

function cellEmbeddedNumber(cell: string): number | null {
  const match = cell.match(/[\d,]+\.?\d*/);
  if (!match) return null;
  return parseNumber(match[0]);
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

        const pattern = findBestPattern(cell, patterns);
        if (!pattern || found.has(pattern.key)) continue;

        const extracted = extractValueForCell(
          row,
          rowIndex,
          colIndex,
          rows,
          pattern,
          patterns,
        );

        if (extracted) {
          const numVal =
            pattern.type === "currency" || pattern.type === "number"
              ? parseNumber(extracted.value)
              : null;

          found.set(pattern.key, {
            value: numVal !== null ? numVal : extracted.value,
            confidence: extracted.confidence,
            source: `${sheetName}!R${rowIndex + 1}C${colIndex + 1}`,
          });
        }
      }
    }
  }

  return found;
}

export { PAY_SLIP_PATTERNS };
