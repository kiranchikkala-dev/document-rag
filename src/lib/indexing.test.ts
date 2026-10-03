import { describe, expect, it } from "vitest";
import { configurePdfWorker, MAX_PDF_BYTES, splitText, validatePdf } from "./indexing";
import { PDFParse } from "pdf-parse";

describe("validatePdf", () => {
  const validFile = { name: "guide.pdf", size: 42, type: "application/pdf", arrayBuffer: async () => new ArrayBuffer(0) };

  it("accepts a PDF within the size limit", () => {
    expect(validatePdf(validFile)).toBeNull();
  });

  it("rejects non-PDF uploads", () => {
    expect(validatePdf({ ...validFile, name: "guide.txt", type: "text/plain" })).toContain("Only PDF");
  });

  it("rejects oversized uploads", () => {
    expect(validatePdf({ ...validFile, size: MAX_PDF_BYTES + 1 })).toContain("10 MB");
  });
});

describe("splitText", () => {
  it("normalizes whitespace and preserves all text across overlapping chunks", () => {
    const chunks = splitText("alpha   beta\n gamma", 10, 2);
    expect(chunks).toEqual(["alpha beta", "ta gamma"]);
    expect(chunks.join(" ")).toContain("alpha beta");
    expect(chunks.join(" ")).toContain("gamma");
  });

  it("returns no chunks for blank text", () => {
    expect(splitText(" \n\t ")).toEqual([]);
  });
});

describe("PDF worker configuration", () => {
  it("points PDF.js at the packaged Node worker", () => {
    configurePdfWorker();
    expect(PDFParse.setWorker()).toContain("pdf-parse/dist/pdf-parse/cjs/pdf.worker.mjs");
  });
});
