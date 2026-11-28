// Bob 1.2 (DD-038): type is set with one Bob text style per element (text-label, text-note,
// text-heading, ...). A style sets the size, line height, letter spacing and weight together, so
// a leading-*, tracking-* or font weight class next to it is a style Bob does not have.
// `uppercase` and `font-mono` are the only type classes an app writes next to a style.
//
// The test reads the client files that are on Tailwind. A file that still imports a CSS Module
// is skipped until it moves (TASK-034 PR 4); its classes are not Tailwind classes.
//
// ## Verified red-green: 2026-11-28 — `text-heading` in TopBar.tsx put back to
//   `text-body font-semibold` fails this test with that file and class in the message.
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join, resolve, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const files = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return files(path);
    return /\.(ts|tsx)$/.test(entry.name) ? [path] : [];
  });

// Tailwind's weight, line-height and letter-spacing utilities, and text-doc (now text-display).
const OFF_STYLE =
  /(?<![\w-])(?:leading-[\w[\]().%-]+|tracking-[\w[\]().%-]+|font-(?:thin|extralight|light|normal|medium|semibold|bold|extrabold|black)|text-doc)(?![\w-])/g;

/** The file without its comments, so a comment may name a class. */
const code = (text) => text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');

describe('Bob 1.2 text styles', () => {
  it('no Tailwind client file sets a weight, line height or letter spacing next to a text style', () => {
    const sources = files(join(ROOT, 'client', 'src')).filter(
      (path) => !/\.module\.css['"]/.test(readFileSync(path, 'utf8')),
    );
    expect(
      sources.some((path) => path.endsWith('TopBar.tsx')),
      'TopBar.tsx not read',
    ).toBe(true);
    const found = sources.flatMap((path) =>
      [...code(readFileSync(path, 'utf8')).matchAll(OFF_STYLE)].map((m) => `${relative(ROOT, path)}: ${m[0]}`),
    );
    expect(found).toEqual([]);
  });
});
