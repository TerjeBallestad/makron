// Bob 1.2 (DD-038): type is set with one Bob text style per element (text-label, text-note,
// text-heading, ...). A style sets the size, line height, letter spacing and weight together, so
// a leading-*, tracking-* or font weight class next to it is a style Bob does not have.
// `uppercase` and `font-mono` are the only type classes an app writes next to a style.
//
// The test reads every client .ts/.tsx file. Since TASK-034 PR 4 no CSS Module is left, and the
// first test keeps it so: a .module.css file would hold type the other tests cannot read.
//
// ## Verified red-green: 2026-11-28 — `text-heading` in TopBar.tsx put back to
//   `text-body font-semibold` fails this test with that file and class in the message.
// ## Verified red-green: 2026-11-28 (TASK-034 PR 4) — four breaks at once fail all four tests,
//   each with its file: an empty views/x.module.css; ReviewView's panel name as
//   `text-title font-semibold`; its week title as `font-mono text-body text-subhead`;
//   ProjectPage's code as `font-mono text-[12px]`.
// ## Verified red-green: 2026-11-28 (PR 4 follow-ups) — ReviewView's EDIT_CELL with `font-sans`
//   put back before `text-body` fails the family test with that file and string. The rule did not
//   exist before: OFF_STYLE lists weights, not families, so `font-sans` next to a style passed.
//   cells.ts textCell with `font-sans` put back still passes here (the style comes from another
//   string, through clsx); tests-browser/bob-text-styles.test.js catches that one in the DOM.
//   STYLE gains text-figure (Bob 1.4): page.ts `figure` as `font-mono text-figure text-caption`
//   fails the two-styles test.
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join, resolve, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'client', 'src');

const files = (dir, pattern) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return files(path, pattern);
    return pattern.test(entry.name) ? [path] : [];
  });

// Tailwind's weight, line-height and letter-spacing utilities, and text-doc (now text-display).
const OFF_STYLE =
  /(?<![\w-])(?:leading-[\w[\]().%-]+|tracking-[\w[\]().%-]+|font-(?:thin|extralight|light|normal|medium|semibold|bold|extrabold|black)|text-doc)(?![\w-])/g;
// A size, family or weight written as a custom value: text-[12px], text-(length:--fs-tiny),
// font-[600], font-(--mono).
const ARBITRARY_TYPE = /(?<![\w-])(?:text-\[(?:\d|length:)[^\]]*\]|text-\(length:[^)]*\)|font-[[(][^\])]*[\])])/g;
// Bob's text styles. A colour (text-primary) or an alignment (text-right) is not one.
const STYLE =
  /(?<![\w-])text-(?:micro|tiny|id|label|caption|note|figure|body|subhead|item|base|prose|heading|title|headline|display)(?![\w-])/g;
// A font-* class other than font-mono: a family (font-sans, font-serif) or a weight. A container
// may set font-sans; an element with a text style sets no family but mono.
const FONT_NOT_MONO = /(?<![\w-])font-(?!mono(?![\w-]))[a-z][\w-]*/g;

/** The file without its comments, so a comment may name a class. */
const code = (text) => text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');

const sources = files(SRC, /\.(ts|tsx)$/);
const read = (path) => code(readFileSync(path, 'utf8'));
/** Every string literal in the file: the classes of one element, or a part of them. */
const literals = (path) => [...read(path).matchAll(/'[^'\n]*'|"[^"\n]*"|`[^`]*`/g)].map((m) => m[0]);
const matches = (pattern) =>
  sources.flatMap((path) => [...read(path).matchAll(pattern)].map((m) => `${relative(ROOT, path)}: ${m[0]}`));

describe('Bob 1.2 text styles', () => {
  it('reads the views and Settings, and no CSS Module is left in the client', () => {
    for (const name of ['TopBar.tsx', 'ReviewView.tsx', 'page.ts', 'section.ts', 'ProjectsSection.tsx']) {
      expect(
        sources.some((path) => path.endsWith(name)),
        `${name} not read`,
      ).toBe(true);
    }
    expect(files(SRC, /\.module\.css$/).map((path) => relative(ROOT, path))).toEqual([]);
  });

  it('no client file sets a weight, line height or letter spacing next to a text style', () => {
    expect(matches(OFF_STYLE)).toEqual([]);
  });

  it('no client file sets a size, family or weight as a custom value', () => {
    expect(matches(ARBITRARY_TYPE)).toEqual([]);
  });

  it('no class string holds two text styles', () => {
    // One string literal at a time. Constants that clsx joins are separate strings, so this does
    // not see a style in each of two; the DOM scan in tests-browser/bob-text-styles.test.js does.
    const found = sources.flatMap((path) =>
      literals(path)
        .filter((literal) => (literal.match(STYLE) ?? []).length > 1)
        .map((literal) => `${relative(ROOT, path)}: ${literal}`),
    );
    expect(found).toEqual([]);
  });

  it('no class string sets a font-* class other than font-mono next to a text style', () => {
    // Bob's base sets `font-family: inherit` on inputs, so an input with a style needs no
    // font-sans. Same limit as above: one string literal at a time.
    const found = sources.flatMap((path) =>
      literals(path)
        .filter((literal) => literal.match(STYLE) && literal.match(FONT_NOT_MONO))
        .map((literal) => `${relative(ROOT, path)}: ${literal}`),
    );
    expect(found).toEqual([]);
  });
});
