import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.mjs",
  import.meta.url,
).href;

export async function extractPdfText(file: File, maxChars = 6000): Promise<string> {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  const pages: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    if (pageText) pages.push(pageText);
    if (pages.join("\n").length > maxChars) break;
  }

  return pages.join("\n").slice(0, maxChars);
}

export const CODE_EXTENSIONS = /\.(py|ipynb|js|ts|jsx|tsx|r|m|cpp|c|cs|java|go|rs|sh|sql|yaml|yml|json|xml|html|css|md|rst|tex|nb|wl)$/i;
export const PDF_EXTENSIONS = /\.pdf$/i;
export const TEXT_EXTENSIONS = /\.(txt|md|rst|csv|log)$/i;

export function isCodeFile(filename: string): boolean {
  return CODE_EXTENSIONS.test(filename);
}

export function isPdfFile(file: File): boolean {
  return file.type === "application/pdf" || PDF_EXTENSIONS.test(file.name);
}

export function isTextFile(file: File): boolean {
  return TEXT_EXTENSIONS.test(file.name) || file.type === "text/plain";
}

export function isReadableFile(file: File): boolean {
  return isPdfFile(file) || isTextFile(file) || isCodeFile(file.name) || file.type.startsWith("image/");
}

export function docTypFromFilename(filename: string): string {
  if (/pitch|deck|slide|present/i.test(filename)) return "pitch";
  if (/paper|research|journal|study|thesis|white/i.test(filename)) return "paper";
  if (/chart|graph|plot|figure/i.test(filename)) return "chart";
  if (CODE_EXTENSIONS.test(filename)) return "technical";
  return "other";
}
