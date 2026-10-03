import { describe, expect, it } from "vitest";
import { MAX_QUESTION_LENGTH, validateQuestion } from "./retrieval";

describe("validateQuestion", () => {
  it("accepts a non-empty question", () => {
    expect(validateQuestion("What is this document about?")).toBeNull();
  });

  it("rejects empty questions", () => {
    expect(validateQuestion("  ")).toBe("Ask a question about the indexed PDF.");
  });

  it("rejects questions over the request limit", () => {
    expect(validateQuestion("x".repeat(MAX_QUESTION_LENGTH + 1))).toContain("1000");
  });
});
