import type { ParsedWorkbook } from "./types";

type TextItem = {
  str: string;
  transform: number[];
};

type PositionedText = {
  text: string;
  x: number;
  y: number;
};

const Y_TOLERANCE = 5;
const COLUMN_GAP = 35;

function clusterIntoRows(items: PositionedText[]): string[][] {
  const sorted = [...items].sort((a, b) => b.y - a.y || a.x - b.x);
  const rowGroups: PositionedText[][] = [];

  for (const item of sorted) {
    const existing = rowGroups.find(
      (group) => Math.abs(group[0].y - item.y) <= Y_TOLERANCE,
    );
    if (existing) {
      existing.push(item);
    } else {
      rowGroups.push([item]);
    }
  }

  return rowGroups.map((group) => {
    group.sort((a, b) => a.x - b.x);

    const cells: string[] = [];
    let buffer = group[0]?.text ?? "";
    let lastX = group[0]?.x ?? 0;

    for (let i = 1; i < group.length; i++) {
      const item = group[i];
      if (item.x - lastX > COLUMN_GAP) {
        if (buffer.trim()) cells.push(buffer.trim());
        buffer = item.text;
      } else {
        buffer = `${buffer} ${item.text}`.trim();
      }
      lastX = item.x;
    }

    if (buffer.trim()) cells.push(buffer.trim());
    return cells;
  });
}

function linesFromPlainText(text: string): string[][] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split(/\t+| {2,}/).map((p) => p.trim()).filter(Boolean);
      return parts.length > 0 ? parts : [line];
    });
}

export function textItemsToWorkbook(
  pages: string[][][],
  fileLabel = "PDF",
): ParsedWorkbook {
  const sheets: Record<string, string[][]> = {};
  let totalRows = 0;

  pages.forEach((rows, index) => {
    const name = pages.length === 1 ? fileLabel : `${fileLabel} - ${index + 1}`;
    sheets[name] = rows;
    totalRows += rows.length;
  });

  return {
    sheets,
    sheetNames: Object.keys(sheets),
    totalRows,
  };
}

export async function parsePdfFile(file: File): Promise<ParsedWorkbook> {
  const buffer = await file.arrayBuffer();
  return parsePdfBuffer(buffer);
}

export async function parsePdfBuffer(buffer: ArrayBuffer): Promise<ParsedWorkbook> {
  const pdfjs =
    typeof window !== "undefined"
      ? await import("pdfjs-dist")
      : await import("pdfjs-dist/legacy/build/pdf.mjs");

  if (typeof window !== "undefined") {
    pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.mjs";
  } else {
    const { pathToFileURL } = await import("url");
    const { join } = await import("path");
    pdfjs.GlobalWorkerOptions.workerSrc = pathToFileURL(
      join(process.cwd(), "node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs"),
    ).href;
  }

  const pdf = await pdfjs.getDocument({ data: buffer, useSystemFonts: true }).promise;

  const pageRows: string[][][] = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();

    const positioned: PositionedText[] = (content.items as TextItem[])
      .filter((item) => item.str?.trim())
      .map((item) => ({
        text: item.str.trim(),
        x: item.transform[4],
        y: item.transform[5],
      }));

    if (positioned.length > 0) {
      pageRows.push(clusterIntoRows(positioned));
    } else {
      const fallback = await page.getTextContent();
      const plain = fallback.items
        .map((item) => ("str" in item ? item.str : ""))
        .join("\n");
      pageRows.push(linesFromPlainText(plain));
    }
  }

  const mergedRows = pageRows.flat();
  return textItemsToWorkbook([mergedRows], "PDF");
}

/** Exported for unit tests */
export { clusterIntoRows, linesFromPlainText };
