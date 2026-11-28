// SDD-002 rulings 5 & 6 (SB-025): the admin boss-review surface — a user rail → month
// segment pills → a week panel that walks another user's entries line by line, lets the
// admin correct a line (persisted via the target-id-scoped endpoint), shows the
// edited-by-admin marker, and offers Approve week / Release for edits. The feel design was
// PASSED in SB-025; this builds it. Admin-only (App gates the route).
import React from 'react';
import TT from '../../i18n';
import { StatusDot, Chip, Button } from '@terjeballestad/bob';
import { api } from '../../api';
import type { UserTimesheet, ApiError } from '../../api';
import type { AppState, User, Entry, Catalog } from '../../../../shared/types';
import type { UiActions } from '../../types';
import { clsx } from 'clsx';
import { projectText } from '../../projectColor';
import { code as codeClass, empty, errLine, headerRow, page, pageTitle, subtle } from './page';

// SDD-002 rulings 5 & 6 (SB-025): dense, 1px borders, mono metadata, the app's grammar.
const RAIL_EMPTY = 'px-1.5 py-2 text-body text-faint';
// The week panel's edit table: one grid for the head and the rows.
const EDIT_ROW = 'grid grid-cols-[56px_96px_minmax(140px,1fr)_minmax(140px,1fr)_90px] items-center gap-2 border-b';
// An edit cell: a bare input that shows a border on hover and an indigo one with focus. It is sans
// from the page: Bob's base sets `font-family: inherit` on inputs.
const EDIT_CELL =
  'min-w-0 rounded-sm border border-transparent bg-transparent px-1.25 py-0.75 text-body text-primary ' +
  'outline-none hover:border-subtle focus:border-indigo-9 focus:bg-accent/5';

interface ViewProps {
  state: AppState;
  ui: UiActions;
  /** bump the sidebar's awaiting-approval badge after an approve/release/correction */
  onReviewChanged?: () => void;
}

// The day range of a segment, from the entries that fall in it: "4–8 Jul".
function segLabel(dates: string[]): string {
  if (!dates.length) return '';
  const first = Number(dates[0].slice(8));
  const last = Number(dates[dates.length - 1].slice(8));
  const month = TT.fmtMonth(dates[0].slice(0, 7)).split(' ')[0];
  return first + '–' + last + ' ' + month;
}

export function ReviewView({ state, ui, onReviewChanged }: ViewProps) {
  const [users, setUsers] = React.useState<User[] | null>(null);
  const [selId, setSelId] = React.useState<number | null>(null);
  const [sheet, setSheet] = React.useState<UserTimesheet | null>(null);
  const [draft, setDraft] = React.useState<Entry[]>([]);
  const [dirty, setDirty] = React.useState(false);
  const [segKey, setSegKey] = React.useState<string | null>(null);
  const [nonce, setNonce] = React.useState(0); // remounts the edit inputs after a reload
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState('');

  React.useEffect(() => {
    api
      .listUsers()
      .then((r) => setUsers(r.users.filter((u) => u.id !== state.user.id)))
      .catch((e) => setErr(e.message || 'could not load users'));
  }, [state.user.id]);

  const loadSheet = React.useCallback((id: number) => {
    return api
      .getUserTimesheet(id)
      .then((t) => {
        setSheet(t);
        setDraft(t.entries);
        setDirty(false);
        setNonce((n) => n + 1);
      })
      .catch((e) => setErr(e.message || 'could not load timesheet'));
  }, []);

  React.useEffect(() => {
    if (selId == null) return;
    setSheet(null);
    setSegKey(null);
    setErr('');
    void loadSheet(selId);
  }, [selId, loadSheet]);

  // A Catalog over the SAVED ledger — money present (admin) — for the rollup + readers.
  const catalog: Catalog | null = sheet
    ? {
        settings: sheet.settings,
        clients: sheet.clients,
        projects: sheet.projects,
        tasks: sheet.tasks,
        entries: sheet.entries,
        commits: sheet.commits,
      }
    : null;

  const months = sheet ? [...new Set(sheet.entries.map((e) => e.date.slice(0, 7)))].sort().reverse() : [];

  const segDates = (key: string): string[] =>
    sheet ? [...new Set(sheet.entries.filter((e) => TT.segmentKey(e.date) === key).map((e) => e.date))].sort() : [];

  const editEntry = (id: string, patch: Partial<Entry>) => {
    setDraft((d) => d.map((e) => (e.id === id ? { ...e, ...patch } : e)));
    setDirty(true);
  };
  const applyTime = (id: string, raw: string) => {
    const parsed = TT.parseTimeCell(raw);
    if (!parsed) return;
    editEntry(
      id,
      parsed.kind === 'duration'
        ? { durMin: parsed.min, start: null, end: null }
        : { start: parsed.start, end: parsed.kind === 'range' ? parsed.end : null, durMin: null },
    );
  };

  const save = async () => {
    if (selId == null) return;
    setBusy(true);
    setErr('');
    try {
      // DC-001: send the version we loaded. A stale save (the employee logged an hour, or
      // another admin saved, since the tab loaded) 409s rather than clobbering their write.
      await api.putUserEntries(selId, draft, sheet?.version);
      await loadSheet(selId);
      ui.toast(TT.t('Corrections saved'));
      onReviewChanged?.();
    } catch (e) {
      // SB-034: on a stale-write conflict, reload the fresh sheet (dropping the draft) and
      // surface a brief notice so the admin re-applies the correction against current data.
      if ((e as ApiError).status === 409) {
        await loadSheet(selId);
        setErr(TT.t('This timesheet changed while you were editing — reloaded. Re-apply your correction.'));
      } else {
        setErr((e as Error).message || 'save failed');
      }
    }
    setBusy(false);
  };

  const lockVerb = async (verb: 'approve' | 'release', key: string) => {
    if (selId == null) return;
    setBusy(true);
    setErr('');
    try {
      if (verb === 'approve') await api.approveSegment(selId, key);
      else await api.releaseSegment(selId, key);
      await loadSheet(selId);
      ui.toast(verb === 'approve' ? TT.t('Week approved') : TT.t('Released for edits'));
      onReviewChanged?.();
    } catch (e) {
      setErr((e as Error).message || 'action failed');
    }
    setBusy(false);
  };

  const selUser = users?.find((u) => u.id === selId) || null;
  const openDates = segKey ? segDates(segKey) : [];
  const openEntries = segKey && catalog ? draft.filter((e) => TT.segmentKey(e.date) === segKey) : [];
  const openSeg =
    segKey && catalog ? TT.monthSegments(catalog, openDates[0]?.slice(0, 7) || '').find((s) => s.key === segKey) : null;

  return (
    <div className={page}>
      <div className={clsx(headerRow, 'items-center')}>
        <h1 className={pageTitle}>{TT.t('Review')}</h1>
        <span className={subtle}>{TT.t('correct and approve any user’s committed weeks')}</span>
      </div>
      {err && <div className={errLine}>{err}</div>}
      <div className="flex items-start gap-4.5">
        {/* user rail */}
        <nav className="flex w-50 flex-none flex-col gap-0.5 border-r border-subtle pr-3">
          {users == null && <div className={RAIL_EMPTY}>{TT.t('Loading…')}</div>}
          {users?.length === 0 && <div className={RAIL_EMPTY}>{TT.t('No other users yet.')}</div>}
          {users?.map((u) => (
            <button
              key={u.id}
              className={clsx(
                'flex w-full cursor-pointer items-center gap-2 rounded-chip border px-2 py-1.5 text-left hover:bg-accent/6',
                u.id === selId ? 'border-indigo-9/45 bg-accent/8' : 'border-transparent bg-transparent',
              )}
              onClick={() => setSelId(u.id)}
            >
              <StatusDot state={u.id === selId ? 'solid' : 'outline'} color="var(--bg-accent)" size={7} />
              <span className="flex-1 truncate text-body text-secondary">{u.name}</span>
              <Chip mono={true} tone={u.role === 'admin' ? 'green' : 'neutral'}>
                {TT.t(u.role)}
              </Chip>
            </button>
          ))}
        </nav>

        {/* panel */}
        <section className="min-w-0 flex-1">
          {!selUser && <div className={empty}>{TT.t('Pick a user to review their weeks.')}</div>}
          {selUser && !sheet && <div className={empty}>{TT.t('Loading…')}</div>}
          {selUser && sheet && catalog && (
            <>
              <div className="mb-3.5 flex items-baseline gap-2.5">
                <span className="text-title text-primary">{selUser.name}</span>
                <span className={subtle}>{selUser.email}</span>
              </div>
              {months.length === 0 && <div className={empty}>{TT.t('No entries logged.')}</div>}
              {months.map((month) => {
                const segs = TT.monthSegments(catalog, month);
                const good = segs.every((s) => s.committed);
                return (
                  <div key={month} className="mb-4">
                    <div className="mb-1.75 flex items-center gap-2">
                      {/* BOB GAP: the month was 12px with letter spacing .04em, which no Bob style
                          has. It keeps its size as text-body; the spacing goes. */}
                      <span className="text-body text-muted uppercase">{TT.fmtMonth(month)}</span>
                      <Chip mono={true} tone={good ? 'green' : 'neutral'}>
                        {good ? TT.t('month good') : TT.t('incomplete')}
                      </Chip>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {segs.map((seg) => {
                        const dates = segDates(seg.key);
                        const tone = seg.approved ? 'accent' : seg.committed ? 'green' : 'neutral';
                        const label = seg.approved ? TT.t('locked') : seg.committed ? TT.t('committed') : TT.t('open');
                        return (
                          <button
                            key={seg.key}
                            className={clsx(
                              'flex cursor-pointer items-center gap-2 rounded-chip border bg-transparent py-1 pr-2 pl-2.25',
                              // See-through green or indigo over the page (DD-038); a locked segment
                              // is also committed, and its indigo wins. Only an open pill shows hover.
                              seg.approved
                                ? 'border-indigo-9/45'
                                : seg.committed
                                  ? 'border-green-9/40'
                                  : 'border-subtle hover:border-indigo-9/30',
                              seg.key === segKey && 'outline-2 outline-offset-1 outline-indigo-9/55',
                            )}
                            data-committed={seg.committed}
                            data-locked={seg.approved}
                            onClick={() => setSegKey(seg.key === segKey ? null : seg.key)}
                          >
                            <StatusDot
                              state={seg.committed ? 'solid' : 'outline'}
                              color={
                                seg.approved ? 'var(--bg-accent)' : seg.committed ? 'var(--bg-green)' : 'var(--gray-22)'
                              }
                              size={7}
                            />
                            <span className="font-mono text-caption text-secondary">{segLabel(dates)}</span>
                            <Chip mono={true} tone={tone}>
                              {label}
                            </Chip>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* week panel */}
              {segKey && openSeg && (
                <div className="mt-4.5 rounded-md border border-subtle bg-card px-3.5 pt-3 pb-3.5">
                  <div className="mb-2.5 flex items-center justify-between gap-2.5">
                    <span className="font-mono text-subhead text-primary">{segLabel(openDates)}</span>
                    <span className="flex gap-1.5">
                      <Button variant="secondary" size="sm" onClick={save} disabled={busy || !dirty}>
                        {TT.t('Save corrections')}
                      </Button>
                      {openSeg.committed && !openSeg.approved ? (
                        <Button variant="primary" size="sm" onClick={() => lockVerb('approve', segKey)} disabled={busy}>
                          {TT.t('Approve week')}
                        </Button>
                      ) : null}
                      {openSeg.approved && (
                        <Button variant="ghost" size="sm" onClick={() => lockVerb('release', segKey)} disabled={busy}>
                          {TT.t('Release for edits')}
                        </Button>
                      )}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    {/* BOB GAP: the column heads were 10.5px with letter spacing .04em, which no Bob
                        style has. They keep size and weight as text-tiny; the spacing goes. */}
                    <div
                      className={clsx(
                        EDIT_ROW,
                        'border-subtle pt-0.75 pb-1.25 text-tiny text-faint uppercase *:px-0.5',
                      )}
                    >
                      <span>{TT.t('date')}</span>
                      <span>{TT.t('time')}</span>
                      <span>{TT.t('task')}</span>
                      <span>{TT.t('note')}</span>
                      <span className="text-right">{TT.t('amount')}</span>
                    </div>
                    {openEntries.length === 0 && <div className={empty}>{TT.t('No entries in this week.')}</div>}
                    {openEntries.map((entry) => {
                      const code = TT.entryProjectCode(catalog, entry);
                      return (
                        <div key={entry.id + ':' + nonce} className={clsx(EDIT_ROW, 'border-strong py-0.75')}>
                          <span className="font-mono text-caption text-secondary">{entry.date.slice(5)}</span>
                          <input
                            className={EDIT_CELL}
                            defaultValue={TT.fmtTimeCell(entry)}
                            onBlur={(e) => applyTime(entry.id, e.target.value)}
                          />
                          <span className="flex min-w-0 items-center gap-1.5">
                            <span className={clsx(codeClass, projectText(catalog, code))}>{code || '—'}</span>
                            <input
                              className={clsx(EDIT_CELL, 'w-full')}
                              defaultValue={entry.label || ''}
                              onBlur={(e) => editEntry(entry.id, { label: e.target.value })}
                            />
                            {entry.editedByAdmin && (
                              <span
                                className="flex-none font-mono text-tiny text-accent"
                                title={TT.t('edited by admin')}
                              >
                                ✎ {TT.t('edited')}
                              </span>
                            )}
                          </span>
                          <input
                            className={clsx(EDIT_CELL, 'w-full')}
                            defaultValue={entry.note || ''}
                            onBlur={(e) => editEntry(entry.id, { note: e.target.value })}
                          />
                          <span className="text-right font-mono text-caption text-primary">
                            {TT.fmtMoney(TT.effectiveAmount(catalog, entry), catalog.settings.currency)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-2.5 text-note text-faint">
                    {TT.t(
                      'Corrections are marked “edited by admin”. Approving locks the week — the employee can no longer reopen it until you release it.',
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
