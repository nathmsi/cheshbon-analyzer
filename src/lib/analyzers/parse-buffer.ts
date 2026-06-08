import * as XLSX from "xlsx";
import { parsePdfBuffer } from "./pdf-parser";
import type { ParsedWorkbook } from "./types";
import { getFileExtension } from "./excel-parser";

export async function parseBuffer(
  buffer: ArrayBuffer,
  fileName: string,
): Promise<ParsedWorkbook> {
  const ext = getFileExtension(fileName);

  if (ext === "pdf") {
    return parsePdfBuffer(buffer);
  }

  if (ext === "xlsx" || ext === "xls" || ext === "csv") {
    const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
    const sheets: Record<string, string[][]> = {};
    let totalRows = 0;

    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json<(string | number | boolean | Date)[]>(
        sheet,
        { header: 1, defval: "", raw: false },
      );
      const stringRows = rows.map((row) =>
        row.map((cell) => {
          if (cell instanceof Date) return cell.toLocaleDateString("he-IL");
          return String(cell ?? "").trim();
        }),
      );
      sheets[sheetName] = stringRows;
      totalRows += stringRows.length;
    }

    return { sheets, sheetNames: workbook.SheetNames, totalRows };
  }

  throw new Error(`Unsupported file type: .${ext ?? "unknown"}`);
}

export async function analyzeFileBuffer(
  buffer: ArrayBuffer,
  fileName: string,
  analyzerId: string,
  locale: "he" | "en" = "he",
) {
  const { getAnalyzer } = await import("./registry");
  const analyzer = getAnalyzer(analyzerId as import("./types").AnalyzerId);
  if (!analyzer) throw new Error(`Unknown analyzer: ${analyzerId}`);

  const workbook = await parseBuffer(buffer, fileName);
  const result = analyzer.analyze(workbook, locale);
  result.fileName = fileName;
  return result;
}
