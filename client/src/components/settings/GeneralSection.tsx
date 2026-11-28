import React from 'react';
import TT from '../../i18n';
import { SectionLabel, Input } from '@terjeballestad/bob';
import { OptionSelect } from '../OptionSelect';
import { clsx } from 'clsx';
import { label, section, sectionLabel, small } from './section';
import type { AppState } from '../../../../shared/types';
import type { UiActions } from '../../types';

interface GeneralSectionProps {
  state: AppState;
  ui: UiActions;
  admin: boolean;
}

export function GeneralSection({ state, ui, admin }: GeneralSectionProps) {
  return (
    <div className={section}>
      <SectionLabel className={sectionLabel}>{TT.t('General')}</SectionLabel>
      <div className="flex items-center gap-2.5">
        {admin && <span className={label}>{TT.t('Currency')}</span>}
        {admin && (
          <Input
            value={state.settings.currency}
            onChange={(e) => ui.setCurrency(e.target.value)}
            className={clsx(small, 'w-17.5 font-mono')}
          />
        )}
        <span className={clsx(label, admin && 'ml-4')}>{TT.t('Language')}</span>
        <OptionSelect
          value={TT.lang}
          onChange={(value) => ui.setLanguage(value)}
          options={[
            { value: 'en', label: 'English' },
            { value: 'no', label: 'Norsk' },
          ]}
          className={clsx(small, 'w-30')}
        />
      </div>
    </div>
  );
}
