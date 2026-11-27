import TT from '../../shared/core.js';
import type { Catalog } from '../../shared/types';

// DD-037: a project's colour is a class from a fixed list, not an inline style. TT.projColor
// picks the palette step (a CSS variable, as Bob's StatusDot and ProgressBar take it); this maps
// each step to the Tailwind class that reads it. The class names are written out in full so that
// Tailwind's build finds them. tests/project-color.test.js checks that every step has a class.
export const PROJECT_TEXT: Record<string, string> = {
  'var(--indigo-9)': 'text-indigo-9',
  'var(--blue-9)': 'text-blue-9',
  'var(--green-9)': 'text-green-9',
  'var(--orange-9)': 'text-orange-9',
  'var(--purple-9)': 'text-purple-9',
  'var(--yellow-9)': 'text-yellow-9',
  'var(--gold-9)': 'text-gold-9',
  'var(--gray-23)': 'text-gray-23',
};

/** The text colour class of a project's code, as TT.projColor colours it. */
export const projectText = (state: Catalog, code: string | null): string => PROJECT_TEXT[TT.projColor(state, code)];
