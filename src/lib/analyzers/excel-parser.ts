import * as XLSX from "xlsx";
import { parsePdfFile } from "./pdf-parser";
import type { ParsedWorkbook } from "./types";

export const ACCEPTED_EXTENSIONS = ["xlsx", "xls", "csv", "pdf"] as const;

export type AcceptedExtension = (typeof ACCEPTED_EXTENSIONS)[number];

export function getFileExtension(fileName: string): string | null {
  const ext = fileName.split(".").pop()?.toLowerCase();
  return ext ?? null;
}

export function isAcceptedFile(fileName: string): boolean {
  const ext = getFileExtension(fileName);
  return ext !== null && ACCEPTED_EXTENSIONS.includes(ext as AcceptedExtension);
}

async function parseExcelFile(file: File): Promise<ParsedWorkbook> {
  const buffer = await file.arrayBuffer();
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
        if (cell instanceof Date) {
          return cell.toLocaleDateString("he-IL");
        }
        return String(cell ?? "").trim();
      }),
    );

    sheets[sheetName] = stringRows;
    totalRows += stringRows.length;
  }

  return {
    sheets,
    sheetNames: workbook.SheetNames,
    totalRows,
  };
}

export async function parseFile(file: File): Promise<ParsedWorkbook> {
  const ext = getFileExtension(file.name);

  if (ext === "pdf") {
    return parsePdfFile(file);
  }

  if (ext === "xlsx" || ext === "xls" || ext === "csv") {
    return parseExcelFile(file);
  }

  throw new Error(`Unsupported file type: .${ext ?? "unknown"}`);
}

export function getAllCells(workbook: ParsedWorkbook): Array<{
  sheet: string;
  row: number;
  col: number;
  value: string;
}> {
  const cells: Array<{ sheet: string; row: number; col: number; value: string }> =
    [];

  for (const [sheetName, rows] of Object.entries(workbook.sheets)) {
    rows.forEach((row, rowIndex) => {
      row.forEach((value, colIndex) => {
        if (value) {
          cells.push({ sheet: sheetName, row: rowIndex, col: colIndex, value });
        }
      });
    });
  }

  return cells;
}

export function flattenSheet(rows: string[][]): string[] {
  return rows.flat().filter(Boolean);
}
