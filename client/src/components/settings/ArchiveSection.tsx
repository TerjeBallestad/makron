import React from 'react';
import TT from '../../i18n';
import { SectionLabel, Button } from '@terjeballestad/bob';
import type { AppState } from '../../../../shared/types';
import type { UiActions } from '../../types';
import { clsx } from 'clsx';
import { projectText } from '../../projectColor';
import { code, hint, label, row, section, sectionLabel, th } from './section';

const COLS = 'grid-cols-[130px_1fr_70px_auto]';

interface SettingsProps {
  state: AppState;
  ui: UiActions;
}

// SDD-002 ruling 7 (PLAN-006): the Archive surface. Archived clients & projects live here,
// out of the active lists and creation pickers but still resolving for history, each with a
// Restore that un-hides it. Admin-only (rendered only in the admin branch of SettingsView).
// NOTE: the exact rendering (how archived attribution reads) is the Track F probe — this is
// a faithful strong-executor pass, not the final feel verdict.
export function ArchiveSection({ state, ui }: SettingsProps) {
  const archivedClients = state.clients.filter((client) => client.archived);
  const archivedProjects = state.projects.filter((project) => project.archived);
  if (archivedClients.length === 0 && archivedProjects.length === 0) return null;
  return (
    <div className={section}>
      <SectionLabel className={sectionLabel}>{TT.t('Archive')}</SectionLabel>
      {archivedProjects.map((project) => (
        <div key={'p:' + project.code} className={clsx(row, COLS)}>
          <span className={clsx(code, projectText(state, project.code))}>{project.code}</span>
          <span className={label}>{project.name}</span>
          <span className={th}>{TT.t('project')}</span>
          <Button variant="ghost" size="sm" onClick={() => ui.restoreProject(project.code)}>
            {TT.t('Restore')}
          </Button>
        </div>
      ))}
      {archivedClients.map((client) => (
        <div key={'c:' + client.id} className={clsx(row, COLS)}>
          <span className={code}>{client.id}</span>
          <span className={label}>{client.name}</span>
          <span className={th}>{TT.t('client')}</span>
          <Button variant="ghost" size="sm" onClick={() => ui.restoreClient(client.id)}>
            {TT.t('Restore')}
          </Button>
        </div>
      ))}
      <div className={hint}>
        {TT.t('archived items keep resolving for old reports & invoices; they are only hidden from new work.')}
      </div>
    </div>
  );
}
