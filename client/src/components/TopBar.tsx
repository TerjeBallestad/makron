import React from 'react';
import TT from '../i18n';
import { StatusDot, Button } from '@terjeballestad/bob';
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
    // BOB GAP: Bob's --topbar-h token has no Tailwind class, so the height reads the token.
    <header className="flex h-(--topbar-h) shrink-0 items-center gap-3 border-b border-subtle px-5">
      <span className="text-heading text-primary">{title}</span>
      <span className="ml-auto flex items-center gap-2.5">
        {running && (
          <span className="flex items-center gap-1.75 rounded-btn border border-green-9/25 bg-green-tint px-2.25 py-0.75">
            <StatusDot state="live" color="var(--bg-green)" size={7} />
            <span className="font-mono text-tiny text-green">
              {(runningCode || TT.t('timer')) + ' ' + TT.fmtDur(TT.entryMinutes(running))}
            </span>
            <Button variant="text" className="font-mono text-tiny text-muted" onClick={() => ui.stop(running.id)}>
              {TT.t('stop')}
            </Button>
          </span>
        )}
        <span className="font-mono text-tiny text-muted">
          {TT.t('today') + ' '}
          <span className="text-secondary">{TT.fmtHours(todayMin)}h</span>
        </span>
      </span>
    </header>
  );
}
