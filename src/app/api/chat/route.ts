import { NextResponse } from "next/server";
import { answerQuestion, validateQuestion } from "@/lib/retrieval";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validationError = validateQuestion(body?.question);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    return NextResponse.json({ ok: true, ...(await answerQuestion(body.question.trim())) });
  } catch (error) {
    console.error("RAG question failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to answer the question." },
      { status: 500 },
    );
  }
}
