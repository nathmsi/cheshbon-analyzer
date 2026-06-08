import { describe, it, expect } from "vitest";
import {
  clusterIntoRows,
  linesFromPlainText,
  textItemsToWorkbook,
} from "../pdf-parser";

describe("PDF parser", () => {
  it("clusters positioned text into rows and columns", () => {
    const rows = clusterIntoRows([
      { text: "שם עובד", x: 10, y: 100 },
      { text: "יוסי כהן", x: 120, y: 100 },
      { text: "שכר ברוטו", x: 10, y: 80 },
      { text: "18500", x: 120, y: 80 },
    ]);

    expect(rows).toHaveLength(2);
    expect(rows[0]).toEqual(["שם עובד", "יוסי כהן"]);
    expect(rows[1]).toEqual(["שכר ברוטו", "18500"]);
  });

  it("parses plain text lines into rows", () => {
    const rows = linesFromPlainText(
      "שם עובד\tיוסי כהן\nשכר ברוטו  18500",
    );
    expect(rows[0]).toEqual(["שם עובד", "יוסי כהן"]);
    expect(rows[1][0]).toContain("שכר ברוטו");
  });

  it("builds a ParsedWorkbook from PDF rows", () => {
    const workbook = textItemsToWorkbook([
      [
        ["שם עובד", "יוסי כהן"],
        ["שכר ברוטו", "18500"],
      ],
    ]);

    expect(workbook.sheetNames).toEqual(["PDF"]);
    expect(workbook.totalRows).toBe(2);
    expect(workbook.sheets.PDF[1][1]).toBe("18500");
  });
});
