// The shared classes of the Settings sections (formerly settings.module.css). Each row adds its
// column tracks with a grid-cols-[...] class.

/** A section: a SectionLabel, a head row, rows and a hint. */
export const section = 'mb-8';
/** The space under a section's SectionLabel. */
export const sectionLabel = 'mb-2.5';
/** A head row: the column heads, with no padding. */
export const headRow = 'grid items-center gap-2';
/** A row of inputs. */
export const row = 'grid items-center gap-2 py-1.25';
/** A column head. */
export const th = 'text-label text-muted uppercase';
/** A plain text cell. */
export const label = 'text-body text-secondary';
export const empty = 'py-2 text-body text-muted';
export const hint = 'mt-1.5 text-caption text-muted';
export const errLine = 'mt-1.5 text-caption text-danger';
/** Settings' inputs and selects are smaller than Bob's: 5px by 9px around the text. */
export const smallBox = 'px-2.25 py-1.25';
export const small = `${smallBox} text-body`;
/** A small input for a number. */
export const smallMono = `${smallBox} font-mono text-caption`;
/** A code or id: a project code, a client id.
 *  BOB GAP: these were mono 11px at weight 600. 11px is a tie between 10.5 and 11.5, and Bob has
 *  no 11.5px style with a weight, so they take text-id (10.5px, 600), the style of every other
 *  code in Makron. */
export const code = 'font-mono text-id';
/** The archive and delete glyphs (⤓, ×) at the end of a row: Bob's text button, faint.
 *  The glyph was 14px; text-prose is the nearest step (13.5px). */
export const glyphButton = 'text-prose text-faint';
