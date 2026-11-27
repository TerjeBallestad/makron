import React from 'react';
import TT from '../i18n';
import { NavRow, SectionLabel, StatusDot, Chip } from '@terjeballestad/bob';
import { clsx } from 'clsx';
import { TextButton } from './TextButton';
import type { AppState, Entry } from '../../../shared/types';
import type { UiActions, Route, SetRoute } from '../types';

interface SidebarProps {
  state: AppState;
  route: Route;
  setRoute: SetRoute;
  ui: UiActions;
  running: Entry | undefined;
  todayEntries: Entry[];
  admin: boolean;
  /** SB-025: count of segments awaiting approval, badged on the Review nav item (null = unknown) */
  reviewPending: number | null;
  syncLabel: string;
  /** The sync dot's fill class: bg-green, or bg-orange-9 while offline. */
  syncDot: string;
}

export function Sidebar({
  state,
  route,
  setRoute,
  ui,
  running,
  todayEntries,
  admin,
  reviewPending,
  syncLabel,
  syncDot,
}: SidebarProps) {
  return (
    <aside className="flex w-(--sidebar-w) shrink-0 flex-col border-r border-subtle bg-sidebar px-2.5 pt-3.5 pb-3">
      <div className="mb-4 flex items-center gap-2.25 px-2.5">
        <span className="size-5 shrink-0 rounded-chip bg-[url(/turtle-64.png)] bg-cover bg-center bg-no-repeat"></span>
        <span className="text-prose font-bold tracking-[-0.005em] text-primary">Makron</span>
      </div>
      <nav className="flex flex-col gap-px">
        <NavRow
          label={TT.t('Today')}
          count={todayEntries.length || null}
          active={route.view === 'today'}
          onClick={() => setRoute({ view: 'today' })}
          dot={
            running ? (
              <StatusDot state="live" color="var(--bg-green)" size={7} />
            ) : (
              <StatusDot state="outline" color="var(--bg-accent)" size={7} />
            )
          }
        />
        <NavRow
          label={TT.t('This week')}
          active={route.view === 'week'}
          onClick={() => setRoute({ view: 'week' })}
          dot={<StatusDot state="dashed" size={7} />}
        />
        <NavRow
          label={TT.t('Reports')}
          active={route.view === 'reports'}
          onClick={() => setRoute({ view: 'reports' })}
          dot={<StatusDot state="dashed" size={7} />}
        />
        {admin && (
          <NavRow
            label={TT.t('Invoice')}
            active={route.view === 'invoice'}
            onClick={() => setRoute({ view: 'invoice' })}
            dot={<StatusDot state="dashed" size={7} />}
          />
        )}
        {admin && (
          <NavRow
            label={TT.t('Review')}
            count={reviewPending || null}
            active={route.view === 'review'}
            onClick={() => setRoute({ view: 'review' })}
            dot={<StatusDot state="dashed" size={7} />}
          />
        )}
      </nav>
      {/* SectionLabel takes no className (Bob 1.1), so its margin sits on a wrapper. The sidebar is
          a flex column, where margins do not collapse, so the wrapper places it as its own margin did. */}
      <div className="mx-2.5 mt-4.5 mb-2">
        <SectionLabel>{TT.t('Projects')}</SectionLabel>
      </div>
      <nav className="flex min-h-0 flex-col gap-px overflow-y-auto">
        {state.projects.map((project) => (
          <NavRow
            key={project.code}
            label={project.name}
            count={(() => {
              const count = state.entries.filter((entry) => TT.entryProjectCode(state, entry) === project.code).length;
              return count || null;
            })()}
            active={route.view === 'project' && route.code === project.code}
            onClick={() => setRoute({ view: 'project', code: project.code })}
            dot={<StatusDot state="solid" color={TT.projColor(state, project.code)} size={7} />}
          />
        ))}
      </nav>
      <div className="mt-auto flex flex-col gap-px">
        <NavRow
          label={TT.t('Settings')}
          active={route.view === 'settings'}
          onClick={() => setRoute({ view: 'settings' })}
        />
        {/* SB-134: a stable anchor for the browser rung. Utility class names do not name the
            element, and the claim under test here is a NEGATIVE one — that this line claims no
            file it does not write — which cannot be located by the text it must not contain. */}
        <div className="flex items-center gap-1.75 px-2.5 pt-2 pb-0.5" data-tt="sync-status">
          <span className={clsx('size-1.5 rounded-full', syncDot)}></span>
          <span className="font-mono text-[10px] text-faint">{syncLabel}</span>
        </div>
        <div className="flex items-center gap-1.75 px-2.5 pt-1">
          <span className="flex-1 truncate text-[11px] text-muted">{state.user.name}</span>
          <Chip mono={true} tone={admin ? 'green' : 'neutral'} className="shrink-0">
            {TT.t(state.user.role)}
          </Chip>
          <TextButton onClick={ui.logout} className="shrink-0 font-mono text-[10px] text-faint">
            {TT.t('sign out')}
          </TextButton>
        </div>
      </div>
    </aside>
  );
}
