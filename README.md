# Steelman

A live collaborative research workspace. A human and an AI agent share one card-based board: the agent creates evidence, links claims, and flags contradictions; you Accept, Challenge, or Dismiss each card.

This repository is self-contained at the project root. Clone it, install, and run — no extra folders or environment variables.

## Requirements

- Node.js 20.9 or newer
- npm (comes with Node)

## Run locally

```bash
git clone <your-repo-url>
cd steelman
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build
npm start
```

builds a production server if you want to verify a clone the same way CI would.

## Test with WebMCP

1. Open Chrome and go to `chrome://flags/#enable-webmcp-testing`.
2. Enable **WebMCP Testing** and relaunch Chrome.
3. Open the Steelman app (local or deployed).
4. Confirm origin isolation: the app sends `Origin-Agent-Cluster: ?1` (required for WebMCP).
5. Ask an agent to use the page tools (search a topic, create cards, link claims, flag contradictions, summarize, or read board state).

You can also open the deployed URL in ChatGPT’s in-app browser, which supports WebMCP by default.

If WebMCP is unavailable, the board still works with mock data and a console warning.

## WebMCP tools

| Tool | Description |
| --- | --- |
| `search_topic` | Search for information and evidence about the current research topic. Returns relevant claims and their sources. |
| `create_evidence_card` | Create a new evidence card on the research board with a claim, supporting content, and source. |
| `link_cards` | Link two related cards on the research board to show their relationship. |
| `flag_contradiction` | Flag a contradiction between two existing cards and create a contradiction card explaining the conflict. |
| `summarize_research` | Generate a summary card of all accepted evidence on the board so far. |
| `get_board_state` | Get the current state of the research board including all cards and their statuses. Use this to understand what has already been researched. |

## Deploy

Deploy the repo root to Vercel (or any Next.js host). `vercel.json` repeats the WebMCP headers for production.

## License

MIT — see [LICENSE](LICENSE).
