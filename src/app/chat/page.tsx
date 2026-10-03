"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { MarkdownAnswer } from "@/components/markdown-answer";

type Source = { source: string; page: number | null; score: number };
type Message = {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
};

export default function ChatPage() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion || isLoading) return;

    setMessages((current) => [
      ...current,
      { role: "user", content: trimmedQuestion },
    ]);
    setQuestion("");
    setError(null);
    setIsLoading(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmedQuestion }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error ?? "Unable to answer the question.");
      setMessages((current) => [
        ...current,
        { role: "assistant", content: result.answer, sources: result.sources },
      ]);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to answer the question.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen justify-center bg-slate-950 px-4 py-8 text-slate-100 sm:px-6">
      <section className="flex min-h-[calc(100vh-4rem)] w-full max-w-3xl flex-col rounded-3xl border border-slate-800 bg-slate-900">
        <header className="flex items-center justify-between border-b border-slate-800 px-6 py-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-400">
              DocRAG · Phase 2
            </p>
            <h1 className="mt-1 text-2xl font-semibold">Ask your document</h1>
          </div>
          <Link
            className="text-sm text-slate-400 transition hover:text-cyan-300"
            href="/"
          >
            Index another PDF
          </Link>
        </header>

        <div
          className="flex-1 space-y-5 overflow-y-auto p-6"
          aria-live="polite"
        >
          {messages.length === 0 && (
            <div className="flex min-h-64 items-center justify-center text-center">
              <div>
                <p className="text-lg font-medium text-slate-300">
                  Your indexed document is ready.
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Ask a question and I’ll retrieve relevant passages before
                  answering.
                </p>
              </div>
            </div>
          )}
          {messages.map((message, index) => (
            <article
              className={
                message.role === "user"
                  ? "ml-auto max-w-[85%] rounded-2xl bg-cyan-400 px-4 py-3 text-slate-950"
                  : "max-w-[90%] rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-200"
              }
              key={`${message.role}-${index}`}
            >
              {message.role === "assistant" ? <MarkdownAnswer content={message.content} /> : <p className="whitespace-pre-wrap text-sm leading-6">{message.content}</p>}
              {message.sources && message.sources.length > 0 && (
                <p className="mt-3 border-t border-slate-800 pt-2 text-xs text-slate-500">
                  Sources:{" "}
                  {message.sources
                    .map(
                      (source) =>
                        `${source.source}${source.page ? ` · p. ${source.page}` : ""}`,
                    )
                    .join("; ")}
                </p>
              )}
            </article>
          ))}
          {isLoading && (
            <p className="text-sm text-slate-500" role="status">
              Searching the document and drafting an answer…
            </p>
          )}
          {error && (
            <p
              className="rounded-xl border border-red-900/60 bg-red-950/30 px-4 py-3 text-sm text-red-300"
              role="alert"
            >
              {error}
            </p>
          )}
        </div>

        <form
          className="border-t border-slate-800 p-4 sm:p-6"
          onSubmit={handleSubmit}
        >
          <label className="sr-only" htmlFor="question">
            Ask about the document
          </label>
          <div className="flex gap-3">
            <input
              className="min-w-0 flex-1 rounded-full border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-cyan-400"
              id="question"
              maxLength={1000}
              placeholder="What is this document about?"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              disabled={isLoading}
            />
            <button
              className="rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
              type="submit"
              disabled={!question.trim() || isLoading}
            >
              Ask
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
