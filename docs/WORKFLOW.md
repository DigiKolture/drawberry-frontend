# How we build features with Claude

This guide is for designers working on Drawberry. You don't need to write code: you describe the work, answer Claude's questions, and check the result. Claude handles git, code and tests.

Drawberry has two repos:

- **Web** (`drawberry-frontend`): what users see in the browser.
- **API** (`drawberry-backend`): the server, database and integrations.

Do UI work in the web repo. If a feature needs both, Claude will tell you, and you'll run the same steps in the API repo.

## Words you'll see

| Word                  | What it means                                                                         |
| --------------------- | ------------------------------------------------------------------------------------- |
| **Branch**            | Your own copy of the project for one task. Changes on it don't affect anyone else.    |
| **`dev`**             | The shared staging version. Nobody works on it directly.                              |
| **`main`**            | The live product. Nobody works on it directly.                                        |
| **Commit**            | A saved checkpoint of your work on your branch.                                       |
| **Pull request (PR)** | A request to add your branch to `dev`. An engineer reviews it, then merges it.        |
| **Spec**              | A written description of the feature: the problem, the solution and every user story. |
| **Ticket**            | One small, testable piece of the spec.                                                |

## The golden rule

**One task, one new branch, started from the latest `dev`.** Never work on `dev` or `main`. Claude follows this rule automatically, but check before you start: the branch name appears at the bottom of the Claude app.

## One-time setup

1. Install the [Claude desktop app](https://claude.ai/download) and open the **Code** tab.
2. Ask an engineer to give you access to both GitHub repos and to clone them onto your computer.
3. Install the workflow skills. In the Code tab, open the repo folder and paste:
   ```bash
   npx skills add mattpocock/skills
   ```
   ```bash
   npx skills add emilkowalski/skills
   ```
   When it asks which skills to install, pick at least `grill-with-docs`, `grilling`, `domain-modeling`, `to-spec`, `to-tickets`, `implement`, `tdd`, `code-review` and `prototype`.

## The workflow

Start every new feature in a **new chat**, and start the chat with:

> Start a new branch from the latest dev for: _<one sentence about the feature>_

Then work through these steps in order. Each step's command is something you type into the chat.

### 1. Grill the plan (`/grill-with-docs`)

Describe the feature in plain words, then type `/grill-with-docs`. Claude interviews you one question at a time about who it's for, what happens when things go wrong, edge cases and naming. Answer until there are no questions left. "I don't know, what do you suggest?" is a fine answer.

Along the way Claude records shared vocabulary in the glossary ([CONTEXT.md](../CONTEXT.md)) and records big decisions as ADRs ([docs/adr](adr/)), so the next person doesn't have to ask the same questions again.

### 2. Write the spec (`/to-spec`)

Type `/to-spec`. Claude turns the whole conversation into one spec file at `.scratch/<feature>/spec.md`. Read it. If something is wrong or missing, say so and Claude will fix it.

Example: [connector framework spec](https://github.com/DigiKolture/drawberry-backend/blob/dev/.scratch/connector-framework/spec.md).

### 3. Design the UI (`/prototype` or Figma)

- **There's already a Figma design:** paste the Figma link, or drag screenshots of the frames into the chat, and say "this is the design for the spec". Claude adds it to the spec.
- **There's no design yet:** type `/prototype` and describe the piece of UI (for example, "the empty state of the projects page"). Claude builds three or more genuinely different working versions behind a picker, so you can flip between them in the browser. Pick one, and Claude adds that decision to the spec.

Prototypes stay separate from the real product until you choose one.

### 4. Break the spec into tickets (`/to-tickets`)

Type `/to-tickets`. Claude splits the spec into small tickets, one file each, at `.scratch/<feature>/issues/01-<name>.md`, `02-...` and so on. Each ticket delivers one working, checkable slice and lists the tickets it waits on ("Blocked by"). Claude shows you the list first, so you can say "merge these two" or "this one is too big" before it saves them.

Example: [Mailgun connector ticket](https://github.com/DigiKolture/drawberry-backend/blob/dev/.scratch/connector-framework/issues/02-mailgun-connector.md).

### 5. Build each ticket (`/implement`)

`/implement` builds one ticket for real. Claude writes tests first, then writes code until the tests pass, runs the project's checks, reviews its own work and saves a commit on your branch.

Use a **fresh chat for each ticket**, and start with the lowest-numbered ticket that isn't blocked. Example:

```text
/implement .scratch/onboarding-empty-state/issues/01-empty-projects-page.md
```

When it finishes, check the result yourself:

> Run the app and show me the empty projects page.

Claude opens it in the browser panel. If something looks off, say what ("the button should be under the illustration, not beside it") and Claude fixes it on the same branch. When the ticket looks right, tell Claude to mark it done and move on to the next ticket.

### 6. Send it for review

When every ticket is done, type:

> Push this branch and open a pull request into dev.

Claude pushes your branch and opens the PR. Send the link to an engineer. They review it and merge it into `dev`. You never merge yourself.

## When you're stuck

- Ask Claude: "Explain what just happened in plain words."
- If Claude wants to push to `dev` or `main`, or says it's on one of them, stop and ask an engineer.
- If you're mid-task and want to start something else, say "start a new branch for that", so the two tasks never mix.
