# Project Instructions

## Product and architecture

- Build the application with Next.js and TypeScript.
- Use shadcn/ui for the user interface and keep the initial UI simple and functional.
- Use Google's SDK for the model integration.
- Use the Google open-source Gemma 4 model/token configuration requested by the project owner. Verify the exact currently available model identifier and authentication flow before implementation.
- Use Qdrant as the vector database.
- Run Qdrant locally with Docker and keep its configuration reproducible in the repository.
- Use LangChain tools only for retrieval, embeddings, model orchestration, and related agent/RAG integrations. Do not introduce a second orchestration framework without explicit approval.

## Next.js requirements

This project may use a Next.js version whose APIs and conventions differ from commonly known Next.js versions. Before writing Next.js application code, read the relevant guide in `node_modules/next/dist/docs/` resolved from this file's directory and follow its deprecation notices.

The generated Next.js agent-rules block is maintained by Next.js. Do not remove or rewrite that block when it is present in this file.

## Scope control

- For the initial setup, make small, verifiable changes.
- Do not add unrelated dependencies or services.
- Do not commit credentials, API tokens, `.env` files, or other secrets.
- Keep provider, model, Qdrant, and LangChain configuration in environment variables with a documented `.env.example` when implementation begins.
- Ask before changing the data model or introducing a hosted service in place of the local Docker setup.

## Documentation split

- Keep AI-agent and contributor instructions in this file.
- Keep human-facing project overview, setup commands, environment-variable documentation, and usage instructions in `README.md`.

## Verification

- Run the repository's available lint, type-check, and test commands after implementation changes.
- Verify Qdrant connectivity locally before validating retrieval behavior.
- Verify the configured Google model and token flow with a minimal end-to-end smoke test before building higher-level agent behavior.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
