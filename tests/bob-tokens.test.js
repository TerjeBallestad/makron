// Bob 1.0 (DD-033): every CSS variable the client reads is one Bob defines, or one Makron
// declares itself.
//
// Bob 1.0 removed its 0.x colour names with no alias. A `var(--text-3)` that is left over has
// no fallback, so the property behaves as unset: a colour inherits, a background goes
// transparent. Nothing errors and the build passes, so this test is the only gate. It also
// catches a name Bob never had (Makron read `--text-1` and `--panel-2` for months).
//
// Tailwind classes read a variable without `var(`: `h-(--topbar-h)`, `w-(--sidebar-w)`.
// The test reads those too, because a misspelt name there fails the same silent way.
//
// ## Verified red-green: 2026-11-27 — `var(--text-muted)` in SyntaxHint.module.css put back to
//   `var(--text-3)` fails this test with that file and name in the message.
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join, resolve, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const BOB_TOKENS = join(ROOT, 'node_modules', '@terjeballestad', 'bob', 'dist', 'tokens');

const files = (dir, exts) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return files(path, exts);
    return exts.some((ext) => entry.name.endsWith(ext)) ? [path] : [];
  });

/** Every `--name:` declared in the given files. */
const declared = (paths) =>
  new Set(paths.flatMap((path) => [...readFileSync(path, 'utf8').matchAll(/(--[a-z0-9-]+)\s*:/g)].map((m) => m[1])));

describe('Bob 1.0 tokens', () => {
  it('the client reads no CSS variable that Bob and Makron do not declare', () => {
    const sources = [
      ...files(join(ROOT, 'client', 'src'), ['.css', '.ts', '.tsx']),
      join(ROOT, 'client', 'index.html'),
      join(ROOT, 'shared', 'core.js'),
    ];
    const known = new Set([...declared(files(BOB_TOKENS, ['.css'])), ...declared(sources)]);
    expect(known.has('--text-primary'), 'Bob 1.0 tokens not found: is @terjeballestad/bob 1.x installed?').toBe(true);
    const unknown = sources.flatMap((path) =>
      [...readFileSync(path, 'utf8').matchAll(/(?:var\(|-\((?:[a-z-]+:)?)(--[a-z0-9-]+)/g)]
        .filter((m) => !known.has(m[1]))
        .map((m) => `${relative(ROOT, path)}: ${m[1]}`),
    );
    expect(unknown).toEqual([]);
  });
});
