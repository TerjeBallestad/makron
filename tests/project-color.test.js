// DD-037: a project's code is coloured by a class from a fixed list (client/src/projectColor.ts),
// not by an inline style. The list maps each step TT.projColor returns to its class. A step with
// no class leaves the code with no colour class at all, and nothing else would catch it.
//
// ## Verified red-green: 2026-11-27 — the 'var(--gold-9)' entry removed fails this test.
import { describe, it, expect } from 'vitest';
import TT from '../shared/core.js';
import { PROJECT_TEXT, projectText } from '../client/src/projectColor.ts';

describe('project colour classes', () => {
  it('every palette step TT.projColor returns has a text class that reads that step', () => {
    const projects = Array.from({ length: 9 }, (_, i) => ({ code: 'P' + i }));
    const state = { projects };
    const codes = [...projects.map((project) => project.code), 'NOPE', null];
    for (const code of codes) {
      const step = TT.projColor(state, code);
      const name = /^var\(--([a-z]+-\d+)\)$/.exec(step)?.[1];
      expect(name, step).toBeTruthy();
      expect(projectText(state, code)).toBe('text-' + name);
    }
    expect(Object.keys(PROJECT_TEXT).length).toBe(8);
  });
});
