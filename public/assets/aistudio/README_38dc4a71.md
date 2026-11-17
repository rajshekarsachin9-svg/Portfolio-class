# ORCHESTRA MVP frontend

A responsive React/Vite frontend prototype for the ORCHESTRA multi-agent workflow automation concept.

## Run locally
1. Install Node.js (LTS).
2. Open this folder in a terminal.
3. Run `npm install`
4. Run `npm run dev`
5. Open the local URL printed by Vite.

## Included
- Overview command centre
- Workflow task list and task detail
- Agent directory
- Execution timeline
- Demo workflow runner with simulated state transitions
- Meeting brief and email draft artifacts
- Human-approval warning; no email is sent
- Responsive layout

## Important
This is a frontend-only demo. Agent execution, research and verification are simulated with sample data. It does not call an LLM, access external accounts or send messages. Connect a backend and real agent tools only after defining permissions, logging and approval policies.
