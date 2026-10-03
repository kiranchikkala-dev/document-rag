"use client";

import { FormEvent, useState } from "react";
import { MarkdownAnswer } from "@/components/markdown-answer";

type Source = { source: string; page: number | null; score: number };
type Message = {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
};

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [indexedFile, setIndexedFile] = useState<string | null>(null);
  const [indexStatus, setIndexStatus] = useState<string | null>(null);
  const [isIndexing, setIsIndexing] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  async function handleIndex(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      setIndexStatus("Choose a PDF to get started.");
      return;
    }
    setIsIndexing(true);
    setIndexStatus("Preparing your notebook…");
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch("/api/index", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Indexing failed.");
      setIndexedFile(file.name);
      setIndexStatus(
        `${result.pages} page${result.pages === 1 ? "" : "s"} · ${result.chunks} chunks ready`,
      );
      setMessages([]);
      setChatError(null);
    } catch (error) {
      setIndexStatus(
        error instanceof Error ? error.message : "Indexing failed.",
      );
    } finally {
      setIsIndexing(false);
    }
  }

  async function handleQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion || isLoading) return;

    setMessages((current) => [
      ...current,
      { role: "user", content: trimmedQuestion },
    ]);
    setQuestion("");
    setChatError(null);
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
    } catch (error) {
      setChatError(
        error instanceof Error
          ? error.message
          : "Unable to answer the question.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f8f7f4] text-[#292825]">
      <header className="flex h-16 items-center justify-between border-b border-[#e6e3dc] bg-white px-5 sm:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#5146d8] text-lg font-bold text-white">
            H
          </div>
          <div>
            <p className="text-[15px] font-semibold tracking-tight">DocRAG</p>
            <p className="text-[11px] text-[#85827a]">Document notebook</p>
          </div>
        </div>
        <span className="hidden rounded-full bg-[#f1f0ff] px-3 py-1.5 text-xs font-medium text-[#5146d8] sm:inline-flex">
          PDF workspace
        </span>
      </header>

      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-[1440px] grid-cols-1 lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="border-b border-[#e6e3dc] bg-white px-5 py-6 lg:min-h-[calc(100vh-4rem)] lg:border-b-0 lg:border-r lg:px-6">
          <div className="mb-7">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8c8981]">
              Sources
            </p>
            <h1 className="mt-2 text-xl font-semibold tracking-tight">
              Your notebook
            </h1>
            <p className="mt-2 text-sm leading-5 text-[#77746d]">
              Add a PDF and ask questions about what is inside.
            </p>
          </div>

          <form onSubmit={handleIndex}>
            <label className="group flex cursor-pointer flex-col items-center rounded-2xl border border-dashed border-[#c9c5bc] bg-[#fbfaf8] px-4 py-7 text-center transition hover:border-[#5146d8] hover:bg-[#f8f7ff]">
              <span
                className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[#eeecff] text-[#5146d8]"
                aria-hidden="true"
              >
                ↑
              </span>
              <span className="text-sm font-semibold">Upload PDF</span>
              <span className="mt-1 text-xs text-[#8c8981]">10 MB maximum</span>
              <input
                className="sr-only"
                type="file"
                accept="application/pdf,.pdf"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              />
            </label>
            {file && (
              <p
                className="mt-3 truncate rounded-lg bg-[#f3f2ed] px-3 py-2 text-xs text-[#5f5c55]"
                title={file.name}
              >
                {file.name}
              </p>
            )}
            <button
              className="mt-3 w-full rounded-xl bg-[#5146d8] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4339c7] disabled:cursor-not-allowed disabled:opacity-50"
              type="submit"
              disabled={isIndexing}
            >
              {isIndexing ? "Indexing…" : "Add to notebook"}
            </button>
          </form>

          {indexStatus && (
            <p className="mt-4 text-xs leading-5 text-[#6e6b63]" role="status">
              {indexStatus}
            </p>
          )}
          {indexedFile && (
            <div className="mt-7 border-t border-[#eeeae2] pt-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#8c8981]">
                Indexed source
              </p>
              <div className="flex items-center gap-2 rounded-xl bg-[#f6f5f1] px-3 py-3">
                <span className="text-[#5146d8]" aria-hidden="true">
                  ▤
                </span>
                <span
                  className="truncate text-sm font-medium"
                  title={indexedFile}
                >
                  {indexedFile}
                </span>
              </div>
            </div>
          )}
        </aside>

        <section className="flex min-h-[calc(100vh-4rem)] min-w-0 flex-col overflow-y-auto">
          <div className="border-b border-[#e6e3dc] bg-[#f8f7f4] px-5 py-6 sm:px-10 sm:py-8">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8c8981]">
              Conversation
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              Ask your document
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[#77746d]">
              Answers are generated from the passages retrieved from your
              indexed PDF.
            </p>
          </div>

          <div
            className="flex-1 space-y-5 overflow-y-auto px-5 py-7 sm:px-10"
            aria-live="polite"
          >
            {messages.length === 0 && (
              <div className="mx-auto flex min-h-[280px] max-w-xl items-center justify-center text-center">
                <div>
                  <div
                    className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eeecff] text-xl text-[#5146d8]"
                    aria-hidden="true"
                  >
                    ✦
                  </div>
                  <p className="mt-4 text-base font-semibold">
                    {indexedFile
                      ? "Your document is ready"
                      : "Start with a source"}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#85827a]">
                    {indexedFile
                      ? "Ask a question on the right and I’ll find the relevant passages."
                      : "Upload a PDF from the Sources panel to activate document chat."}
                  </p>
                </div>
              </div>
            )}
            {messages.map((message, index) => (
              <article
                className={
                  message.role === "user"
                    ? "ml-auto max-w-[min(680px,90%)]"
                    : "max-w-[min(760px,92%)]"
                }
                key={`${message.role}-${index}`}
              >
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9a978f]">
                  {message.role === "user" ? "You" : "DocRAG"}
                </p>
                <div
                  className={
                    message.role === "user"
                      ? "rounded-2xl rounded-tr-md bg-[#5146d8] px-4 py-3 text-sm leading-6 text-white"
                      : "rounded-2xl rounded-tl-md border border-[#e6e3dc] bg-white px-4 py-4 text-sm leading-6 text-[#45423c] shadow-sm"
                  }
                >
                  {message.role === "assistant" ? <MarkdownAnswer content={message.content} /> : <p className="whitespace-pre-wrap">{message.content}</p>}
                  {message.sources && message.sources.length > 0 && (
                    <p className="mt-3 border-t border-[#eeeae2] pt-2 text-xs text-[#8c8981]">
                      Sources:{" "}
                      {message.sources
                        .map(
                          (source) =>
                            `${source.source}${source.page ? ` · p. ${source.page}` : ""}`,
                        )
                        .join("; ")}
                    </p>
                  )}
                </div>
              </article>
            ))}
            {isLoading && (
              <p className="text-sm text-[#85827a]" role="status">
                Searching your document…
              </p>
            )}
            {chatError && (
              <p
                className="max-w-xl rounded-xl border border-[#edc9c5] bg-[#fff5f3] px-4 py-3 text-sm text-[#a24940]"
                role="alert"
              >
                {chatError}
              </p>
            )}
          </div>

          <form
            className="border-t border-[#e6e3dc] bg-white px-5 py-4 sm:px-10 sm:py-5"
            onSubmit={handleQuestion}
          >
            <label className="sr-only" htmlFor="question">
              Ask about your document
            </label>
            <div className="mx-auto flex max-w-4xl items-center gap-3 rounded-2xl border border-[#d8d5cd] bg-[#fbfaf8] p-2 pl-4 transition focus-within:border-[#5146d8] focus-within:ring-2 focus-within:ring-[#5146d8]/10">
              <input
                className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none placeholder:text-[#aaa79e]"
                id="question"
                maxLength={1000}
                placeholder={
                  indexedFile
                    ? "Ask anything about your PDF…"
                    : "Upload a PDF to start chatting"
                }
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                disabled={!indexedFile || isLoading}
              />
              <button
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#5146d8] text-lg text-white transition hover:bg-[#4339c7] disabled:cursor-not-allowed disabled:opacity-40"
                type="submit"
                aria-label="Send question"
                disabled={!indexedFile || !question.trim() || isLoading}
              >
                ↑
              </button>
            </div>
            <p className="mx-auto mt-2 max-w-4xl text-[11px] text-[#aaa79e]">
              DocRAG can make mistakes. Check important answers against the
              source document.
            </p>
          </form>
        </section>
      </div>
    </main>
  );
}
