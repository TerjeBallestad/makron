import React from 'react';
import TT from '../../i18n';
import { Chip } from '@terjeballestad/bob';
import { clsx } from 'clsx';
import { TimeGrid } from '../grid/TimeGrid';
import { GridFooter } from '../grid/GridFooter';
import { SyntaxHint } from '../grid/SyntaxHint';
import { entriesOn } from './viewUtils';
import { headerRow, page, pageTitle, subtle } from './page';
import type { AppState } from '../../../../shared/types';
import type { UiActions } from '../../types';

interface ViewProps {
  state: AppState;
  ui: UiActions;
}

export function TodayView({ state, ui }: ViewProps) {
  const date = TT.todayStr();
  const entries = entriesOn(state, date);
  const weekInfo = TT.isoWeek(date);
  return (
    <div className={page}>
      <div className={clsx(headerRow, 'items-baseline')}>
        <h1 className={pageTitle}>{TT.t('Today')}</h1>
        <span className={subtle}>{TT.fmtDayLong(date)}</span>
        <Chip mono={true} className="ml-auto">
          {TT.t('week') + ' ' + weekInfo.week}
        </Chip>
      </div>
      <TimeGrid date={date} entries={entries} state={state} ui={ui} />
      <GridFooter entries={entries} state={state} />
      <SyntaxHint />
    </div>
  );
}
