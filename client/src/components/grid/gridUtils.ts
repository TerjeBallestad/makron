// Caret-position helpers for the time grid cells. These are NOT styles — they
// gate ArrowLeft/ArrowRight cell navigation on whether the caret sits at an edge.
// The cells' shared classes are in cells.ts.

export function caretAtStart(el: HTMLInputElement) {
  return el.selectionStart === 0 && el.selectionEnd === 0;
}
export function caretAtEnd(el: HTMLInputElement) {
  return el.selectionStart === el.value.length && el.selectionEnd === el.value.length;
}
