# Working in this repo

## PM is the store

All work state lives on the PM board (`pm` CLI, dashboard at https://pm.godstemning.dev/makron) — issues, designs, plans, decisions, and the glossary. Never keep a shadow markdown copy of something PM already holds.

## Run `pm glossary` before using domain language

```
pm glossary
```

Every term, one line each — read it once and hold it. **One word, one meaning:** a word that means two things is not one term, it is two, and each has its own word. A term with no definition is a **signpost** — an ambiguous word redirecting to the words that do have one — and using it means you're being vague. `pm get <id>` footnotes the terms in whatever it just printed, and the dashboard links the first mention of each term in any body.

Terms are created and refined in `/grill-with-docs` sessions. Fix a wrong definition rather than working around it: `pm get TERM-NNN` prints its `bodyHash`, then `pm patch TERM-NNN --body "…" --base <bodyHash>`.

## Claim before you occupy a ticket

Several sessions share this checkout at once. Any command that occupies a ticket for more than a couple of minutes — planning it, fixing it, resolving it, executing against it — claims it first:

```
pm claim <ID> --as "<command>: <short label>"
```

- **409 means another session holds it. Stop.** Do not do the work anyway; two sessions against one ticket is worse than none. Report who holds it, then pick different work or ask.
- **Release the moment your phase ends** — `pm release <ID>` — so the next phase can claim it. A plan releases when it files, not when it stops thinking; an abandoned attempt releases immediately. Closing a ticket releases automatically.
- An unreleased claim reads as work-in-progress that nobody is doing. Claims self-expire after 4h, but don't rely on that.
- Nothing to claim (a bare description with no PM item) → skip it.
- **A body write names the body it changes.** To add a block, `pm patch <id> --prepend-body @block.md` or `--append-body @block.md`: the server adds it to the body as it is. To rewrite the body, `pm get <id>` first and send its `bodyHash`: `pm patch <id> --body @new.md --base <bodyHash>`. Exit 3 means another writer changed the body since your read, and nothing was written: read it again and redo your change. Never `--force` a body that may hold someone else's text (DD-030, pm 1.2).

Refer to tickets by name, never bare ID, so a reader knows what you're talking about without a lookup.

**Withdrawing or correcting a finding:** put a superseding block at the **top of the ticket body**, quoting the retired wording. Never leave the correction in a comment — comments are append-only, so the withdrawn text always comes first and a cold reader can satisfy it before reaching the correction. Write the block with `pm patch <id> --prepend-body @block.md`, so no read comes first and none can be stale.

## Git

Agents share this checkout, so **commit straight to `main`** — branching yanks every other session onto your branch. If you need real isolation, use a worktree (`.claude/worktrees/`).

## Verification

Claims about work being done are bound to evidence, not vibes. Load the `judge-ladder` skill before asserting something works; load `two-track` before planning or building anything, to decide whether the work is agent-verifiable at all.
