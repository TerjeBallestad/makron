import React from 'react';
import TT from '../../i18n';
import { StatusDot, Button } from '@terjeballestad/bob';
import { clsx } from 'clsx';
import { projectText } from '../../projectColor';
import { gridRow } from './cells';
import { TimeCell } from './TimeCell';
import { TaskCell } from './TaskCell';
import { NoteCell } from './NoteCell';
import { BillCell } from './BillCell';
import type { AppState, Entry } from '../../../../shared/types';
import type { UiActions, RegisterCell, NavigateCell } from '../../types';

const HOURS_CELL = 'flex items-center justify-end gap-1.5 px-2.25';
const HOURS = 'font-mono text-caption';
const LOCKED_CELL = 'truncate px-2.25 py-1.5';
// BOB GAP: white at 1.4% has no Bob step, so the locked row's stripes keep their value.
const LOCKED_STRIPES =
  'bg-[repeating-linear-gradient(-45deg,transparent,transparent_6px,rgba(255,255,255,0.014)_6px,rgba(255,255,255,0.014)_12px)]';

interface EntryRowProps {
  entry: Entry;
  state: AppState;
  ui: UiActions;
  reg: RegisterCell;
  nav: NavigateCell;
  admin: boolean;
  /** SDD-002 ruling 5: the entry's segment is committed and the viewer is an employee. */
  locked?: boolean;
}

export function EntryRow({ entry, state, ui, reg, nav, admin, locked }: EntryRowProps) {
  const running = TT.isRunning(entry);
  const min = TT.entryMinutes(entry);
  // SDD-002 ruling 5: a committed segment is read-only for the employee. Render a static,
  // dimmed row — no editable cells (so it holds no keyboard focus) and no delete button.
  // Only employees ever get here (admins are exempt), so there is no bill column.
  if (locked) {
    const code = TT.entryProjectCode(state, entry);
    const proj = TT.projectOf(state, code);
    return (
      // Dimmed and striped, with no hover: nothing here can be edited.
      <div className={clsx(gridRow, 'opacity-72', LOCKED_STRIPES)}>
        <span className={clsx(LOCKED_CELL, 'font-mono text-caption text-muted')}>{TT.fmtTimeCell(entry) || '—'}</span>
        <span className={clsx(LOCKED_CELL, 'flex items-baseline gap-1.5 text-body text-muted')}>
          {proj && <span className={clsx('flex-none font-mono text-tiny', projectText(state, code))}>{proj.code}</span>}
          <span className="truncate font-medium text-secondary">{entry.label || ''}</span>
          {/* SDD-002 ruling 6 (SB-025): the 'edited by admin' marker on a corrected line. */}
          {entry.editedByAdmin && (
            <span className="flex-none font-mono text-tiny text-accent" title={TT.t('edited by admin')}>
              ✎ {TT.t('edited')}
            </span>
          )}
        </span>
        <span className={clsx(LOCKED_CELL, 'text-body text-muted')}>{entry.note || ''}</span>
        <div className={HOURS_CELL}>
          <span className={clsx(HOURS, 'text-faint')}>{TT.fmtHours(min)}</span>
        </div>
        <span></span>
      </div>
    );
  }
  // Row hover, the running-entry stop/hours swap and the delete-button reveal are all
  // driven by CSS (the row is the Tailwind group "row"; its children use group-hover/row) — no hover
  // state, so the row does not re-render on every mouse move over the hot path.
  return (
    <div className={clsx(gridRow, 'group/row hover:bg-gray-10')} data-tt="entry-row">
      <TimeCell entry={entry} ui={ui} reg={reg} nav={nav} />
      <TaskCell entry={entry} state={state} ui={ui} reg={reg} nav={nav} />
      <NoteCell entry={entry} ui={ui} reg={reg} nav={nav} />
      {admin && <BillCell entry={entry} ui={ui} reg={reg} nav={nav} />}
      <div className={HOURS_CELL}>
        {running && <StatusDot state="live" color="var(--bg-green)" size={7} />}
        {running && (
          // The stop button takes the hours' place while a running row is hovered.
          // BOB GAP: Bob's Button has no small danger-tint size; btn-sm's padding and border differ.
          <button
            className="hidden cursor-pointer rounded-kbd border-none bg-danger-tint px-1.5 py-px font-mono text-tiny text-danger group-hover/row:inline"
            onClick={() => ui.stop(entry.id)}
          >
            {TT.t('stop')}
          </button>
        )}
        <span className={clsx(HOURS, running ? 'text-green group-hover/row:hidden' : 'text-secondary')}>
          {TT.fmtHours(min)}
        </span>
      </div>
      {/* The delete "×", hidden until the row is hovered. */}
      <Button
        variant="text"
        className="invisible text-base text-faint group-hover/row:visible"
        onClick={() => ui.remove(entry.id)}
        tabIndex={-1}
      >
        ×
      </Button>
    </div>
  );
}
