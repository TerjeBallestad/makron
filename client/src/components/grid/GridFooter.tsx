import React from 'react';
import TT from '../../i18n';
import { isAdmin } from '../../roles';
import type { AppState, Entry } from '../../../../shared/types';

interface GridFooterProps {
  entries: Entry[];
  state: AppState;
}

export function GridFooter({ entries, state }: GridFooterProps) {
  const admin = isAdmin(state);
  const total = entries.reduce((sum, entry) => sum + TT.entryMinutes(entry), 0);
  // SDD-002 ruling 8: committed entries contribute their frozen money; uncommitted ones
  // fall back to live, so this footer stays a correct working total either way.
  const billed = entries.reduce((sum, entry) => sum + TT.effectiveBillMinutes(state, entry), 0);
  const amount = entries.reduce((sum, entry) => sum + TT.effectiveAmount(state, entry), 0);
  return (
    <div className="flex gap-4.5 px-2.25 pt-2 font-mono text-tiny text-muted">
      <span>
        {TT.t('count') + ' '}
        <span className="text-secondary">{entries.length}</span>
      </span>
      <span className="ml-auto">
        {TT.t('billable') + ' '}
        <span className="text-secondary">
          {TT.fmtHours(billed)}
          {TT.t('h')}
        </span>
        {admin ? ' · ' + TT.fmtMoney(amount, state.settings.currency) : ''}
      </span>
      <span>
        {TT.t('sum') + ' '}
        <span className="font-semibold text-primary">
          {TT.fmtHours(total)}
          {TT.t('h')}
        </span>
      </span>
    </div>
  );
}
