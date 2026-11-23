## Git rules (team: read before any change)

Several people work on this repo, and some are designers rather than engineers. If a request would break one of these rules, say so and offer the branch-and-pull-request route instead.

- `main` is production and `dev` is staging. **Never commit to, push to, merge into, rebase or force-push `main` or `dev`.**
- **Every task gets its own new branch, cut from the latest remote `dev`.** Before editing any file, check the current branch. If it is `main` or `dev`, or belongs to a different task, create a new one first:
  ```bash
  git fetch origin
  git switch -c <type>/<short-task-slug> origin/dev
  ```
  `<type>` is one of `feat`, `fix`, `design`, `docs`, `chore`. Example: `design/onboarding-empty-state`.
- If there are uncommitted changes from a different task, stop and ask the user what to do with them. Don't carry them onto the new branch silently.
- Commit only to the task branch. Push only the task branch (`git push -u origin <branch>`), and ask the user first.
- Changes reach `dev` only through a pull request into `dev`, merged by a reviewer on GitHub. Open the PR against `dev`, never `main`.
- Never delete, reset or rewrite someone else's branch.

The step-by-step workflow for designers is in `docs/WORKFLOW.md`.

## Agent skills

### Issue tracker

Issues live as local markdown files under `.scratch/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Default five-role vocabulary (needs-triage, needs-info, ready-for-agent, ready-for-human, wontfix). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout — one `CONTEXT.md` + `docs/adr/` at repo root. See `docs/agents/domain.md`.
