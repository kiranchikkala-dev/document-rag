import { Document } from "@langchain/core/documents";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { QdrantVectorStore } from "@langchain/qdrant";
import { PDFParse } from "pdf-parse";
import path from "node:path";
import { pathToFileURL } from "node:url";

export const MAX_PDF_BYTES = 10 * 1024 * 1024;
export const CHUNK_SIZE = 1_000;
export const CHUNK_OVERLAP = 150;

let pdfWorkerConfigured = false;

export function configurePdfWorker() {
  if (pdfWorkerConfigured) return;
  const workerPath = path.join(
    process.cwd(),
    "node_modules/pdf-parse/dist/pdf-parse/cjs/pdf.worker.mjs",
  );
  PDFParse.setWorker(pathToFileURL(workerPath).href);
  pdfWorkerConfigured = true;
}

export type UploadedPdf = Pick<File, "name" | "size" | "type" | "arrayBuffer">;

export function validatePdf(file: UploadedPdf | null): string | null {
  if (!file) return "A PDF file is required.";
  if (file.type !== "application/pdf") return "Only PDF files are supported.";
  if (!file.name.toLowerCase().endsWith(".pdf"))
    return "Only PDF files are supported.";
  if (file.size === 0) return "The uploaded PDF is empty.";
  if (file.size > MAX_PDF_BYTES) return "PDF files must be 10 MB or smaller.";
  return null;
}

export async function hasPdfSignature(file: UploadedPdf): Promise<boolean> {
  const header = new Uint8Array(await file.arrayBuffer()).slice(0, 5);
  return new TextDecoder().decode(header) === "%PDF-";
}

export function splitText(
  text: string,
  chunkSize = CHUNK_SIZE,
  overlap = CHUNK_OVERLAP,
): string[] {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return [];
  if (overlap >= chunkSize)
    throw new Error("Chunk overlap must be smaller than chunk size.");

  const chunks: string[] = [];
  let start = 0;
  while (start < normalized.length) {
    const end = Math.min(start + chunkSize, normalized.length);
    const chunk = normalized.slice(start, end).trim();
    if (chunk) chunks.push(chunk);
    if (end === normalized.length) break;
    start = end - overlap;
  }
  return chunks;
}

function createEmbeddings() {
  return new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GOOGLE_API_KEY,
    modelName: process.env.GOOGLE_EMBEDDING_MODEL ?? "gemini-embedding-001",
  });
}

export async function indexPdf(file: File) {
  configurePdfWorker();
  const loader = new PDFLoader(file, { splitPages: true });
  const pages = await loader.load();
  const chunks = pages.flatMap((page) =>
    splitText(page.pageContent).map(
      (pageContent, chunkIndex) =>
        new Document({
          pageContent,
          metadata: {
            source: file.name,
            page:
              page.metadata.loc?.pageNumber ?? page.metadata.pageNumber ?? null,
            chunk: chunkIndex,
          },
        }),
    ),
  );

  if (chunks.length === 0)
    throw new Error("No readable text was found in the PDF.");

  const vectorStore = await QdrantVectorStore.fromDocuments(
    chunks,
    createEmbeddings(),
    {
      url: process.env.QDRANT_URL ?? "http://localhost:6333",
      apiKey: process.env.QDRANT_API_KEY,
      collectionName: process.env.QDRANT_COLLECTION ?? "doc_rag_documents",
    },
  );

  return {
    chunks: chunks.length,
    pages: pages.length,
    collection: vectorStore.collectionName,
  };
}
