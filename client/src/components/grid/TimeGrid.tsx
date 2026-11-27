// TimeGrid — spreadsheet-style entry grid with smart time cell + task autocomplete
import React from 'react';
import TT from '../../i18n';
import { Chip } from '@terjeballestad/bob';
import { clsx } from 'clsx';
import { EntryRow } from './EntryRow';
import { NewRow } from './NewRow';
import { isAdmin } from '../../roles';
import { isApproved } from '../views/viewUtils';
import type { AppState, Entry } from '../../../../shared/types';
import type { UiActions, GridCell, RegisterCell, NavigateCell } from '../../types';

// The grid defines the shared column tracks as --tt-cols, which the header row, EntryRow and
// NewRow all read (grid-cols-(--tt-cols)). Employees have no bill column (SB-022), so their track
// set is one column shorter.
const COLS_ADMIN = '[--tt-cols:148px_224px_1fr_58px_76px_26px]';
const COLS_EMPLOYEE = '[--tt-cols:148px_224px_1fr_76px_26px]';
const HEADER_CELL = 'px-2.25 text-[10px] font-semibold tracking-[0.07em] text-muted uppercase';

interface TimeGridProps {
  date: string;
  entries: Entry[];
  state: AppState;
  ui: UiActions;
  compact?: boolean;
}

export function TimeGrid({ date, entries, state, ui, compact }: TimeGridProps) {
  const refs = React.useRef<Record<string, GridCell>>({});
  const pending = React.useRef<string | null>(null);
  const rows = entries;
  const admin = isAdmin(state);
  // SDD-002 ruling 4/5/6: the lock is a property of THE DAY, not of the role — an employee's
  // committed (week∩month) segment is read-only, and admins are exempt so they can correct
  // history. `TT.readOnlyDay` is that expression, and it lives in one place (shared/core.js).
  const locked = TT.readOnlyDay(date, { commits: state.commits, admin });
  // SDD-002 ruling 5 (SB-025): an APPROVED segment is not just committed — it is locked by
  // the admin, so the "reopen from the week header" affordance is gone.
  const lockedByAdmin = locked && isApproved(state, date);
  // A locked grid has no editable cells and no add-row, so keyboard nav has nothing to
  // trap; the ids below drive nav only for the unlocked case.
  const rowIds = rows.map((entry) => entry.id).concat(locked ? [] : ['new']);
  // SB-011/SB-022: the bill cell is column 3 and admin-only; employees have no
  // bill column at all, so their grid ends at note (col 2) and ArrowRight from
  // note has nowhere to go.
  const maxCol = admin ? 3 : 2;
  React.useEffect(() => {
    if (pending.current) {
      const el = refs.current[pending.current];
      if (el) {
        el.focus();
        if ('select' in el) el.select();
      }
      pending.current = null;
    }
  });
  const reg: RegisterCell = (id, col) => (el) => {
    if (el) refs.current[id + ':' + col] = el;
    else delete refs.current[id + ':' + col];
  };
  const nav: NavigateCell = (rowId, col, dir) => {
    const r = rowIds.indexOf(rowId);
    let nr = r,
      nc = col;
    if (dir === 'up') nr = r - 1;
    else if (dir === 'down') nr = r + 1;
    else if (dir === 'left') nc = col - 1;
    else if (dir === 'right') nc = col + 1;
    if (nr < 0 || nr >= rowIds.length || nc < 0 || nc > maxCol) return;
    if (rowIds[nr] === 'new') nc = 0;
    const el = refs.current[rowIds[nr] + ':' + nc];
    if (el) {
      el.focus();
      if ('select' in el) el.select();
    }
  };
  const focusLater = (key: string) => {
    pending.current = key;
  };

  return (
    <div className={clsx('font-sans', admin ? COLS_ADMIN : COLS_EMPLOYEE)}>
      {!compact && (
        <div className="grid grid-cols-(--tt-cols) gap-0 border-b border-subtle pb-1.25">
          {/* SDD-004: the admin column's heading is the `$` symbol, matching the chip below it.
              `TT.t` falls back to the key when there is no translation, and `$` deliberately has
              none — a symbol is not a word, so it reads the same in both languages. The employee
              list is unchanged and still ends at `note`: employees have no bill column at all
              (SB-011/SB-022), and EntryRow renders the cell behind the same admin check. */}
          {(admin ? ['time', 'task', 'note', '$'] : ['time', 'task', 'note']).map((header) => (
            <span key={header} className={HEADER_CELL}>
              {TT.t(header)}
            </span>
          ))}
          <span className={clsx(HEADER_CELL, 'text-right font-mono')}>{'Σ ' + TT.t('hours')}</span>
          <span></span>
        </div>
      )}
      {locked && (
        // SDD-002 ruling 4/5: the committed-and-read-only banner above a locked day's rows.
        <div className="flex items-center gap-2 px-2.25 pt-0.75 pb-1">
          <Chip tone={lockedByAdmin ? 'accent' : 'green'} mono={true}>
            {lockedByAdmin ? TT.t('locked') : TT.t('committed')}
          </Chip>
          <span className="text-(length:--fs-tiny) text-faint">
            {lockedByAdmin ? TT.t('approved by admin — locked') : TT.t('read-only — reopen from the week header')}
          </span>
        </div>
      )}
      {rows.map((entry) => (
        <EntryRow
          key={entry.id}
          entry={entry}
          state={state}
          ui={ui}
          reg={reg}
          nav={nav}
          admin={admin}
          locked={locked}
        />
      ))}
      {!locked && (
        <NewRow
          key="new"
          date={date}
          ui={ui}
          reg={reg}
          nav={nav}
          focusLater={focusLater}
          empty={rows.length === 0}
          admin={admin}
        />
      )}
    </div>
  );
}
