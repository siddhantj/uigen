# Plan: Record build fixes in `./CLAUDE.md`

## Context

This session debugged three failures while getting UIGen to build on the user's Windows machine. The fixes are already in code, but the *why* behind one of them (the `USERPROFILE` redirect in `node-compat.cjs`) is non-obvious and easy to "clean up" by accident. The user invoked `/memory` to write this down. Goal: append a small Gotchas entry to `./CLAUDE.md` so future sessions and teammates understand why those lines exist.

## What was fixed this session

| # | Symptom | Root cause | Fix (already in code) |
|---|---------|------------|------------------------|
| 1 | `Module not found: @/generated/prisma` | Prisma client never generated | `npx prisma generate` — repeat after schema changes. Already covered in CLAUDE.md gotchas. |
| 2 | `Module not found: @vercel/turbopack-next/internal/font/google/font` on `next build` | `next/font/google` requires build-time download of woff2; failed (network) and webpack can't resolve the placeholder URL | Replaced with a Google Fonts `<link>` in `src/app/layout.tsx`; updated `--font-sans` / `--font-mono` in `src/app/globals.css` |
| 3 | `EPERM: scandir 'C:\Users\siddh\Application Data'` during `next build` | Something in the build pipeline globs `%USERPROFILE%`, and Windows' legacy `Application Data` junction throws EPERM to every process | `node-compat.cjs` now reassigns `process.env.USERPROFILE` and `process.env.HOME` to the project root before any Next code loads |

#1 is already in the file. #2 and #3 are not — and #3 is the dangerous one to lose.

## Proposed change to `./CLAUDE.md`

Append two bullets to the existing **Gotchas** section (after the current three bullets, lines 57–59):

```markdown
- Windows only: `node-compat.cjs` reassigns `process.env.USERPROFILE` and `process.env.HOME` to the project root. This prevents `next build` from crashing on `EPERM: scandir 'C:\Users\<you>\Application Data'` — a legacy NTFS junction that throws to every process. Don't remove those lines without testing a Windows build.
- Fonts are loaded via a Google Fonts `<link>` in `src/app/layout.tsx`, not `next/font/google`. `next/font/google` requires a build-time woff2 download and broke `next build` when fonts.gstatic.com was unreachable. If you switch back, gate it behind reliable network or self-host the fonts.
```

No other sections need to change. The Commands section is still accurate.

## File to edit
- `E:\playground\personalworkspaces\uigen\CLAUDE.md` — append the two bullets at end of the Gotchas section.

## Why `./CLAUDE.md` (project) and not `~/.claude/CLAUDE.md` (user)
Both fixes are repo-specific. They should ride with the repo so teammates and future Claude sessions in *this* checkout pick them up, not bleed into every project the user opens.

## Verification
1. Re-read `./CLAUDE.md` and confirm the two new bullets are present at the end of the Gotchas section.
2. Run `npm run build` once more from a fresh PowerShell — should complete with the route table printed.
3. Open a new Claude Code session in this directory and confirm `/memory` lists the updated `./CLAUDE.md` (it will, since the file is in CWD).

## Notes for the user on `/memory`
- `/memory` opens whichever memory file you pick in `$EDITOR` / `$VISUAL`, falling back to Notepad on Windows. Closing Notepad without saving produces the `Cancelled memory editing` line — not an error.
- For one-line additions, typing a message that starts with `#` lets you append a memory line without opening any editor. Faster than `/memory` for small updates.
- To use VS Code instead of Notepad: in your PowerShell profile, `$env:EDITOR = "code --wait"`. The `--wait` flag is required or `/memory` thinks you closed the editor instantly.
