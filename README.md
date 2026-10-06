# LaunchBoard — Novu Web Chat demo

**This is a demo app, not a real product.** It exists to be the running
example for the article *"Add your existing agent to your React app with
Novu Web Chat."* LaunchBoard is a fictional release dashboard with one
static problem card. Everything about the chat, however, is real: it talks
to an existing Novu-connected agent through `@novu/react`'s `useWebChat`
hook, and a successful demo run creates a real Linear issue through that
agent's own Linear tool.

Nothing in this app fabricates an agent reply, a tool call, or an issue
link. If the agent or its Linear connection isn't set up, the chat shows the
real error instead of a fake success.

## What's here vs. what you need to bring

This repo has:
- The LaunchBoard dashboard UI (release summary + one checkout error card).
- A chat drawer wired to `useWebChat`, rendering text, tool activity,
  approval prompts, and MCP-connection prompts.
- A small server route (`/api/session`) that mints a per-browser demo
  subscriber id and computes the HMAC hashes Novu's security model expects,
  without ever sending the Novu secret key to the browser.

It does **not** include: a Novu account, an agent, or a Linear connection.
Those already exist (or need to be created) in your own Novu workspace —
see "Novu-side setup" below.

## Install and run

```bash
npm install
cp .env.example .env.local   # then fill in the values, see below
npm run dev
```

Open http://localhost:3000 (Next.js will pick the next free port if 3000 is
taken, and prints the actual URL). Build and type-check with:

```bash
npm run build
```

## Environment variables

See `.env.example` for the full list with inline descriptions. Summary:

| Variable | Where to get it | Exposed to browser? |
|---|---|---|
| `NEXT_PUBLIC_NOVU_APPLICATION_IDENTIFIER` | [Novu dashboard → API Keys](https://dashboard.novu.co/api-keys) | Yes (by design) |
| `NEXT_PUBLIC_NOVU_AGENT_IDENTIFIER` | The agent's public identifier, from its page in the Novu dashboard | Yes (by design) |
| `NOVU_SECRET_KEY` | Novu dashboard → API Keys (environment secret) | **No** — server-only |
| `NEXT_PUBLIC_NOVU_REGION` | `us` (default) or `eu` | Yes |
| `NEXT_PUBLIC_NOVU_API_URL` / `NEXT_PUBLIC_NOVU_SOCKET_URL` | Only for a non-default/self-hosted Novu instance | Yes |

`NOVU_SECRET_KEY` is optional only while you're prototyping locally with
HMAC turned off in Novu's dashboard. See "Security" below before showing
this to anyone else.

## Novu-side setup

You need an existing agent already configured in Novu — this app does not
create one. Steps, in order:

1. **Have an active agent.** Open it in the Novu dashboard and confirm its
   status is active/reachable. A custom code agent needs its bridge running
   and publicly reachable by Novu; a managed agent just needs to be enabled.
2. **Enable the Web Chat channel** on that agent. Novu creates the
   `novu-web-chat` integration automatically if it doesn't exist yet. Full
   guide: https://docs.novu.co/agents/channels/web-chat
3. **Confirm the Linear connection.** The agent needs a real Linear tool or
   MCP connection, with the target team (Platform, per the demo script)
   accessible. For a managed agent, enable and authorize its Linear MCP
   server: https://docs.novu.co/agents/managed-agent/configure-mcp-servers.
   Check whether this requires **per-subscriber OAuth** — if so, the chat UI
   here already renders the resulting `mcp-connection` authorization link;
   you'll click through it once during the demo.
4. **Decide on tool approval.** If the agent's Linear tool is gated behind
   approval, the chat renders an Approve/Deny prompt automatically — no
   extra setup needed here, but confirm in your agent config whether
   approval is required.
5. **Turn on HMAC before sharing this demo with anyone.** In the Novu
   dashboard, enable "Security HMAC encryption" on both the In-App
   integration (for `subscriberHash`) and the Web Chat integration (for
   `agentHash`). Full guide: https://docs.novu.co/agents/channels/web-chat/security.
   This app computes both hashes server-side in `/api/session` whenever
   `NOVU_SECRET_KEY` is set — no code changes needed once you flip the
   toggles.
6. **Gather the identifiers** for `.env.local`: application identifier and
   secret from API Keys, and the agent's public identifier from its
   dashboard page.

Hook reference: https://docs.novu.co/platform/sdks/react/hooks/use-web-chat
Tool calls / approval / MCP connect: https://docs.novu.co/agents/channels/web-chat/tools

## Running the demo

1. Open the dashboard. The **Fall checkout release** card shows the
   checkout error (Area: Checkout, Environment: Staging, Team: Platform).
2. Click **Ask the release agent**. In the empty chat state, click
   **Use suggested prompt** to fill the composer with the exact tested
   prompt (you can still edit it before sending):

   > Create a Linear issue for the checkout error in this release. Put it
   > in the Platform team and include that applying a coupon returns a 500
   > in staging.

3. Send it. Watch for:
   - A tool-activity block once the agent calls its Linear tool.
   - An **approval** prompt if the agent's tool is gated — Approve to let
     it proceed.
   - An **mcp-connection** prompt if Linear needs per-subscriber
     authorization — click through the link, then continue the
     conversation.
4. The agent's final reply should include the real Linear issue identifier
   and/or URL. Click it — it's a plain link to the issue Novu's agent
   actually created.
5. Verify independently:
   - Open the issue in Linear and confirm it exists, in the Platform team,
     with the checkout/staging/500 details.
   - In the Novu dashboard, go to **Activity Feed → Agent Conversations**
     and find this exchange. Docs: https://docs.novu.co/agents/conversations

Also exercise the unhappy paths once: send with the agent/network broken to
see the error banner and **Retry**, and (if applicable) the real OAuth or
approval path end to end.

## Limitations

Documented here instead of hidden behind a silent fallback:

- **Static dashboard data.** The release and error card are fixtures, not
  read from a real release-management backend.
- **Local-only identity.** The "subscriber" is a random id minted per
  browser and stored in an httpOnly cookie (`/api/session`). It is not tied
  to real authentication. Fine for a demo/article recording; replace with
  your real session→subscriber mapping before showing this to real users.
- **No conversation-history sidebar.** The app resumes at most one
  conversation per browser (the last `conversationId`, kept in
  `localStorage`). There's no UI to list or switch between past
  conversations. See https://docs.novu.co/agents/channels/web-chat/conversations
  if you want to add that.
- **No automatic page context.** The agent doesn't read the dashboard on
  its own — the checkout-error facts have to be in the message text, which
  is why the composer offers to prefill the exact suggested prompt.
- **No assignment, priority, or duplicate-detection promises.** The demo
  only claims what it verified: issue creation with the given team and
  description.
- **HMAC is optional locally.** If `NOVU_SECRET_KEY` isn't set, the chat
  still works (useful for a first local pass) and the drawer shows a small
  "HMAC disabled — local prototype only" badge as a reminder. Don't deploy
  or share the app in that state.

## Security

- The Novu secret key never reaches the browser — it's read only in
  `src/lib/novu-env.ts` (marked `server-only`) and used inside the
  `/api/session` route handler to compute `subscriberHash` and `agentHash`
  via HMAC-SHA256, per https://docs.novu.co/agents/channels/web-chat/security.
- No Linear credentials live in this app at all — Linear access belongs to
  the agent's own tool/MCP configuration in Novu.

## Assets captured for the article

See the article author's shared notes for the exact tested prompt, agent
response, chosen agent runtime, any approval/authorization step exercised,
and the recording/screenshots — captured from a real run against a live
Novu agent and Linear workspace, not reproduced here to avoid embedding
identifiers.
