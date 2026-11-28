// The shared page and table classes of the views and Settings (formerly views.module.css).
// Each cell adds its own text style and colour, so no two utilities on one element set the same
// property.

/** A page's box with no width. Settings adds max-w-190 (760px). */
export const pageBox = 'mx-auto px-8 pt-7 pb-20';
/** A view's page: centred, 880px wide. */
export const page = `${pageBox} max-w-220`;
/** The page title. */
export const pageTitle = 'text-display text-primary';
/** The row over a view: title, subtitle and controls. The view adds items-center or
 *  items-baseline. */
export const headerRow = 'mb-5 flex gap-3';
/** The subtitle next to a page title. */
export const subtle = 'text-body text-muted';
/** A one-line error under the header. */
export const errLine = 'mb-3 text-body text-danger';

/** A table: a bordered, rounded box of grid rows. Each row sets its own column tracks. */
export const table = 'overflow-hidden rounded-md border border-subtle bg-card-dim';
export const headRow = 'grid border-b border-subtle';
export const bodyRow = 'grid items-center border-b border-subtle';
export const totalRow = 'grid bg-card';
/** A column head. */
export const th = 'px-3 py-2 text-label text-muted uppercase';
/** A table cell's box. The cell adds its text style and colour. */
export const cell = 'px-3 py-2';
/** A number in a cell: mono, at the caption size, right-aligned. */
export const num = 'text-right font-mono text-caption';
/** The text of an empty table. */
export const empty = 'px-3 py-3.5 text-body text-muted';
/** A project code before a name. */
export const code = 'shrink-0 font-mono text-id';
