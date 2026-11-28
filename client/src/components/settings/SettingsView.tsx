// Settings: clients, projects, tasks, users (admin), password, general
import React from 'react';
import TT from '../../i18n';
import { isAdmin } from '../../roles';
import { clsx } from 'clsx';
import { pageBox, pageTitle } from '../views/page';
import { ClientsSection } from './ClientsSection';
import { ProjectsSection } from './ProjectsSection';
import { ArchiveSection } from './ArchiveSection';
import { TasksSection } from './TasksSection';
import { UsersSection } from './UsersSection';
import { PasswordSection } from './PasswordSection';
import { GeneralSection } from './GeneralSection';
import type { AppState } from '../../../../shared/types';
import type { UiActions } from '../../types';

interface SettingsProps {
  state: AppState;
  ui: UiActions;
}

export function SettingsView({ state, ui }: SettingsProps) {
  const admin = isAdmin(state);
  return (
    <div className={clsx(pageBox, 'max-w-190')}>
      {/* No margin under the title: the CSS Module's 24px (.mb24) always lost to .h1's margin: 0,
          and the sections start with their own label. */}
      <h1 className={pageTitle}>{TT.t('Settings')}</h1>
      {admin && <ClientsSection state={state} ui={ui} />}
      {admin && <ProjectsSection state={state} ui={ui} />}
      {admin && <ArchiveSection state={state} ui={ui} />}
      <TasksSection state={state} ui={ui} />
      {admin && <UsersSection state={state} ui={ui} />}
      <PasswordSection ui={ui} />
      <GeneralSection state={state} ui={ui} admin={admin} />
    </div>
  );
}
