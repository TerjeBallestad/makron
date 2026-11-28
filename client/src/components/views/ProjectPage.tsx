import React from 'react';
import TT from '../../i18n';
import { Chip, StatusDot } from '@terjeballestad/bob';
import { isAdmin } from '../../roles';
import { sumMin } from './viewUtils';
import type { AppState } from '../../../../shared/types';
import type { UiActions } from '../../types';
import { clsx } from 'clsx';
import { projectText } from '../../projectColor';
import { bodyRow, cell, empty, num, page, pageTitle, table } from './page';

const COLS = 'grid-cols-[110px_130px_170px_1fr_60px_70px]';

interface ProjectPageProps {
  state: AppState;
  ui: UiActions;
  code: string;
}

export function ProjectPage({ state, ui, code }: ProjectPageProps) {
  const admin = isAdmin(state);
  const project = TT.projectOf(state, code);
  if (!project)
    return (
      <div className={page}>
        <p className="text-body text-muted">{TT.t('Project not found — it may have been removed.')}</p>
      </div>
    );
  const client = TT.clientOf(state, project);
  const entries = state.entries
    .filter((entry) => TT.entryProjectCode(state, entry) === code)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
  const min = sumMin(entries),
    // SDD-002 ruling 8: committed entries read their frozen snapshot (shared reader).
    amount = entries.reduce((sum, entry) => sum + TT.effectiveAmount(state, entry), 0);
  return (
    <div className={page}>
      <div className="mb-1.5 flex items-baseline gap-2.5">
        <StatusDot state="solid" color={TT.projColor(state, code)} size={9} className="self-center" />
        <span className={clsx('font-mono text-subhead', projectText(state, code))}>{code}</span>
        <h1 className={pageTitle}>{project.name}</h1>
      </div>
      <div className="mb-5 flex gap-2">
        {client && <Chip>{client.name}</Chip>}
        <Chip mono={true}>{TT.fmtHours(min) + TT.t('h') + ' ' + TT.t('total')}</Chip>
        {admin && (
          <Chip mono={true} tone="green">
            {TT.fmtMoney(amount, state.settings.currency)}
          </Chip>
        )}
        {admin && (
          <Chip mono={true}>{TT.fmtMoney(TT.rateOf(state, code), state.settings.currency) + '/' + TT.t('h')}</Chip>
        )}
      </div>
      <div className={table}>
        {entries.length === 0 && <div className={empty}>{TT.t('No hours on this project yet.')}</div>}
        {entries.map((entry) => {
          return (
            <div key={entry.id} className={clsx(bodyRow, COLS)}>
              <span className={clsx(cell, 'font-mono text-caption text-secondary')}>{entry.date.slice(5)}</span>
              <span
                className={clsx(cell, 'font-mono text-caption', TT.isRunning(entry) ? 'text-green' : 'text-primary')}
              >
                {TT.fmtTimeCell(entry)}
              </span>
              <span className={clsx(cell, 'truncate text-body text-primary')}>{entry.label || ''}</span>
              <span className={clsx(cell, 'truncate text-body text-secondary')}>{entry.note || ''}</span>
              {/* The bill cell has 4px of padding top and bottom, not the 8px of a cell. */}
              <span className="px-3 py-1 text-body text-primary">
                {/* SDD-004: the same chip the day grid renders (BillCell), over the same
                    `entry.billable` field — so it has to read the same way. One entry's
                    billability has one spelling wherever it appears. */}
                <Chip
                  mono={true}
                  tone={entry.billable ? 'green' : 'neutral'}
                  className={entry.billable ? undefined : 'text-faint'}
                >
                  {'$'}
                </Chip>
              </span>
              <span className={clsx(cell, num, 'text-primary')}>{TT.fmtHours(TT.entryMinutes(entry))}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
