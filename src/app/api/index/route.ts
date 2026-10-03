import { NextResponse } from "next/server";
import { hasPdfSignature, indexPdf, validatePdf } from "@/lib/indexing";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const validationError = validatePdf(file instanceof File ? file : null);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }
    if (!(await hasPdfSignature(file as File))) {
      return NextResponse.json({ error: "The uploaded file is not a valid PDF." }, { status: 400 });
    }

    const result = await indexPdf(file as File);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("PDF indexing failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to index the PDF." },
      { status: 500 },
    );
  }
}
