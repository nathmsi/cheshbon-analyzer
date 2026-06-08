import * as XLSX from "xlsx";
import type { ParsedWorkbook } from "./types";

export async function parseFile(file: File): Promise<ParsedWorkbook> {
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
