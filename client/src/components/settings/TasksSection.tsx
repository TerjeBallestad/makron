import React from 'react';
import TT from '../../i18n';
import { SectionLabel, Button, Input } from '@terjeballestad/bob';
import { OptionSelect } from '../OptionSelect';
import { clsx } from 'clsx';
import { empty, glyphButton, headRow, hint, row, section, sectionLabel, small, th } from './section';

import type { AppState } from '../../../../shared/types';
import type { UiActions } from '../../types';

const COLS = 'grid-cols-[1fr_150px_26px]';

interface SettingsProps {
  state: AppState;
  ui: UiActions;
}

// SDD-002: tasks are per-user templates — private (label, project) stamps. No
// billable column anywhere (the project owns that default), and no cross-user reach.
export function TasksSection({ state, ui }: SettingsProps) {
  return (
    <div className={section}>
      <SectionLabel
        className={sectionLabel}
        action={
          <Button variant="ghost" size="sm" onClick={() => ui.openTaskModal('')}>
            {TT.t('+ task')}
          </Button>
        }
      >
        {TT.t('Tasks')}
      </SectionLabel>
      <div className={clsx(headRow, COLS)}>
        {['name', 'project'].map((header) => (
          <span key={header} className={th}>
            {TT.t(header)}
          </span>
        ))}
        <span></span>
      </div>
      {state.tasks.map((task) => (
        <div key={task.id} className={clsx(row, COLS)}>
          <Input
            value={task.label}
            onChange={(e) => ui.updateTask(task.id, { label: e.target.value })}
            className={small}
          />
          <OptionSelect
            value={task.project || ''}
            onChange={(value) => ui.updateTask(task.id, { project: value || null })}
            options={[{ value: '', label: '— ' + TT.t('no project') }].concat(
              // SDD-002 ruling 7: hide archived projects — a template can't target new work at one.
              state.projects
                .filter((project) => !project.archived)
                .map((project) => ({ value: project.code, label: project.code + ' · ' + project.name })),
            )}
            className={small}
          />
          <Button variant="text" onClick={() => ui.removeTask(task.id)} className={glyphButton}>
            ×
          </Button>
        </div>
      ))}
      {state.tasks.length === 0 && <div className={empty}>{TT.t('No tasks yet — create one from the time grid.')}</div>}
      <div className={hint}>
        {TT.t('templates are your own reusable (label, project) stamps; logging an hour copies them onto the entry.')}
      </div>
    </div>
  );
}
