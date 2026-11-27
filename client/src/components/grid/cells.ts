import { clsx, type ClassValue } from 'clsx';

// The shared base of the four spreadsheet cell inputs (time, task, note, new). Each cell adds its
// own font and colours, so no two utilities on one input set the same property.
// outline-none sits in the utilities layer, over Bob's :focus-visible ring in the base layer: a
// cell shows its focus with the caret alone, as it did with its CSS Module.
const CELL = 'w-full min-w-0 rounded-chip border bg-transparent px-2 py-1.25 outline-none';

/** A grid row (EntryRow, NewRow): the column tracks come from TimeGrid's --mk-cols. */
export const gridRow = 'grid grid-cols-(--mk-cols) items-center border-b border-subtle py-0.5';

/** The time cell and the new row: mono, with a red border while the text does not parse.
 *  border-danger is red-9 at 50%, the value the cells had; Bob's border-invalid is solid red-9. */
export const timeCell = (invalid: boolean, ...rest: ClassValue[]) =>
  clsx(CELL, 'mx-px font-mono text-caption', invalid ? 'border-danger' : 'border-transparent', rest);

/** The task and note cells: sans at body size, with the cell's own text colour. */
export const textCell = (...rest: ClassValue[]) => clsx(CELL, 'border-transparent font-sans text-body', rest);
