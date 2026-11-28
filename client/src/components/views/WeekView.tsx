import React from 'react';
import TT from '../../i18n';
import { StatusDot, SectionLabel, Button, Chip } from '@terjeballestad/bob';
import { TimeGrid } from '../grid/TimeGrid';
import { GridFooter } from '../grid/GridFooter';
import { SyntaxHint } from '../grid/SyntaxHint';
import { entriesOn, sumMin, committedKeys, approvedKeys } from './viewUtils';
import { clsx } from 'clsx';
import { headerRow, page, pageTitle, subtle } from './page';
import type { AppState } from '../../../../shared/types';
import type { UiActions } from '../../types';

// A segment lives inside one calendar month, so its range is always "d–d Mon". The
// month abbrev goes through the i18n-aware fmtMonth ("Jul 2026" → "Jul") so the chips
// localize with the rest of the week header (fmtDayShort) instead of hardcoding English.
function segRange(dates: string[]): string {
  const firstDay = Number(dates[0].slice(8));
  const lastDay = Number(dates[dates.length - 1].slice(8));
  const month = TT.fmtMonth(dates[0].slice(0, 7)).split(' ')[0];
  return firstDay + '–' + lastDay + ' ' + month;
}

interface ViewProps {
  state: AppState;
  ui: UiActions;
}

export function WeekView({ state, ui }: ViewProps) {
  const [offset, setOffset] = React.useState(0);
  const anchor = TT.addDays(TT.todayStr(), offset * 7);
  const days = TT.weekDates(anchor);
  const weekInfo = TT.isoWeek(days[0]);
  const allEntries = state.entries.filter((entry) => days.includes(entry.date));
  const today = TT.todayStr();
  // SDD-002 ruling 4 (SB-024): one commit chip per (week∩month) segment — a month-
  // straddling week shows two, each independently committable. State is per-user, so
  // these are always the logged-in user's own segments.
  const segments = TT.weekSegments(anchor);
  const committed = committedKeys(state);
  // SDD-002 ruling 5 (SB-025): an admin-APPROVED segment is LOCKED — the employee can no
  // longer reopen it, so its reopen verb is gone and the chip reads 'locked'.
  const approved = approvedKeys(state);
  return (
    <div className={page}>
      <div className={clsx(headerRow, 'items-baseline')}>
        <h1 className={pageTitle}>{TT.t('Week') + ' ' + weekInfo.week}</h1>
        <span className={subtle}>
          {TT.fmtDayShort(days[0]) + ' → ' + TT.fmtDayShort(days[6]) + ' · ' + weekInfo.year}
        </span>
        <span className="ml-auto flex gap-1.5">
          <Button variant="ghost" size="sm" onClick={() => setOffset(offset - 1)}>
            ‹
          </Button>
          {offset !== 0 && (
            <Button variant="ghost" size="sm" onClick={() => setOffset(0)}>
              {TT.t('this week')}
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => setOffset(offset + 1)}>
            ›
          </Button>
        </span>
      </div>
      {/* Unconditional: TT.weekSegments walks the week's 7 dates and always returns at least one
          segment, so there is no empty-row case to guard. It was guarded while a shape could turn
          committing off entirely (SB-181 removed that). */}
      <div className="-mt-1.5 mb-4.5 flex flex-wrap gap-2.5" data-tt="week-seg-row">
        {segments.map((segment) => {
          const isCommitted = committed.has(segment.key);
          const isLocked = approved.has(segment.key);
          return (
            <div
              key={segment.key}
              className={clsx(
                'flex items-center gap-2 rounded-chip border bg-card py-0.75 pr-1.25 pl-2.5',
                // The border is see-through green or indigo over the chip (DD-038). A locked
                // segment is also committed, and its indigo wins.
                isLocked ? 'border-indigo-9/45' : isCommitted ? 'border-green-9/40' : 'border-subtle',
              )}
              data-committed={isCommitted}
              data-locked={isLocked}
            >
              <StatusDot
                state={isCommitted ? 'solid' : 'outline'}
                color={isLocked ? 'var(--bg-accent)' : isCommitted ? 'var(--bg-green)' : 'var(--gray-22)'}
                size={7}
              />
              <span className="font-mono text-caption text-secondary">{segRange(segment.dates)}</span>
              <Chip tone={isLocked ? 'accent' : isCommitted ? 'green' : 'neutral'} mono={true}>
                {isLocked ? TT.t('locked') : isCommitted ? TT.t('committed') : TT.t('open')}
              </Chip>
              {isLocked ? (
                // Approved by an admin: no reopen verb — the segment is theirs to release now.
                <span className="pr-1.25 text-tiny text-muted">{TT.t('approved by admin')}</span>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => (isCommitted ? ui.uncommitSegment(segment.key) : ui.commitSegment(segment.key))}
                >
                  {isCommitted ? TT.t('reopen') : TT.t('commit')}
                </Button>
              )}
            </div>
          );
        })}
      </div>
      {days.map((day) => {
        const entries = entriesOn(state, day);
        if (!entries.length && day !== today && TT.parseDate(day) > new Date()) return null;
        return (
          <div key={day} className="mb-5.5">
            <div className="mb-1 flex items-baseline gap-2">
              <SectionLabel
                dot={day === today ? <StatusDot state="outline" color="var(--bg-accent)" size={7} /> : null}
              >
                {TT.fmtDayShort(day) + (day === today ? ' · ' + TT.t('today') : '')}
              </SectionLabel>
              <span className={clsx('ml-auto font-mono text-tiny', entries.length ? 'text-secondary' : 'text-faint')}>
                {entries.length ? TT.fmtHours(sumMin(entries)) + TT.t('h') : '—'}
              </span>
            </div>
            <TimeGrid date={day} entries={entries} state={state} ui={ui} compact={true} />
          </div>
        );
      })}
      <GridFooter entries={allEntries} state={state} />
      <SyntaxHint />
    </div>
  );
}
