import React from 'react';
import TT from '../i18n';
import { StatusDot } from '@terjeballestad/bob';
import { TextButton } from './TextButton';
import type { Entry } from '../../../shared/types';
import type { UiActions } from '../types';

interface TopBarProps {
  title: string;
  running: Entry | undefined;
  runningCode: string | null;
  todayMin: number;
  ui: UiActions;
}

export function TopBar({ title, running, runningCode, todayMin, ui }: TopBarProps) {
  return (
    <header className="flex h-(--topbar-h) shrink-0 items-center gap-3 border-b border-subtle px-5">
      <span className="text-(length:--fs-body) font-semibold text-primary">{title}</span>
      <span className="ml-auto flex items-center gap-2.5">
        {running && (
          // BOB GAP: green-9 at 25% has no alpha step (Bob has green-9-a10, -a18, -a70), so the
          // border keeps its value.
          <span className="flex items-center gap-1.75 rounded-btn border border-[rgba(70,194,136,0.25)] bg-green-tint px-2.25 py-0.75">
            <StatusDot state="live" color="var(--bg-green)" size={7} />
            <span className="font-mono text-(length:--fs-tiny) text-green">
              {(runningCode || TT.t('timer')) + ' ' + TT.fmtDur(TT.entryMinutes(running))}
            </span>
            <TextButton className="font-mono text-[10px] text-muted" onClick={() => ui.stop(running.id)}>
              {TT.t('stop')}
            </TextButton>
          </span>
        )}
        <span className="font-mono text-(length:--fs-tiny) text-muted">
          {TT.t('today') + ' '}
          <span className="text-secondary">{TT.fmtHours(todayMin)}h</span>
        </span>
      </span>
    </header>
  );
}
