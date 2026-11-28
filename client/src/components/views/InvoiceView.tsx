import React from 'react';
import TT from '../../i18n';
import { Chip, Button } from '@terjeballestad/bob';
import { OptionSelect } from '../OptionSelect';
import type { AppState } from '../../../../shared/types';
import type { UiActions } from '../../types';
import { clsx } from 'clsx';
import { projectText } from '../../projectColor';
import {
  bodyRow,
  cell,
  code as codeClass,
  empty,
  headerRow,
  headRow,
  num,
  page,
  pageTitle,
  table,
  th,
  totalRow,
} from './page';

const COLS = 'grid-cols-[110px_170px_1fr_70px_110px]';
// The selects are smaller than Bob's: 5px by 10px around the text, at a fixed width.
const SELECT = 'px-2.5 py-1.25';

interface ViewProps {
  state: AppState;
  ui: UiActions;
}

export function InvoiceView({ state, ui }: ViewProps) {
  const months = [...new Set(state.entries.map((entry) => entry.date.slice(0, 7)))].sort().reverse();
  const [clientId, setClientId] = React.useState(state.clients[0] ? state.clients[0].id : '');
  const [month, setMonth] = React.useState(months[0] || TT.todayStr().slice(0, 7));
  // SB-087: the selected id is LOCAL state seeded once from the first client, so anything
  // that changes a client id out from under it leaves a dangling selection — and a dangling
  // selection fails silently rather than loudly: `client` is undefined, the <Select> matches
  // no option (the trigger then shows the raw, dangling id instead of a client name),
  // and the table renders an empty invoice for a real, billable month. A client-id rename is
  // now reachable (fix 3 above), and it reloads the whole state under every mounted view.
  // Fall back to the first client whenever the selection stops resolving.
  React.useEffect(() => {
    if (state.clients.some((candidate) => candidate.id === clientId)) return;
    setClientId(state.clients[0] ? state.clients[0].id : '');
  }, [state.clients, clientId]);
  const client = state.clients.find((candidate) => candidate.id === clientId);
  const entries = state.entries
    .filter((entry) => {
      if (!entry.date.startsWith(month) || !entry.billable) return false;
      const project = TT.projectOf(state, TT.entryProjectCode(state, entry));
      return project && project.clientId === clientId && !TT.isRunning(entry);
    })
    .sort((a, b) => (a.date < b.date ? -1 : 1));
  // SDD-002 ruling 8: read the FROZEN snapshot for a committed entry and live money
  // otherwise, via the shared snapshot-preferring readers — so a rate renegotiation
  // moves an uncommitted month but never a committed one. This admin view carries full
  // snapshots (an admin's money is never stripped).
  const totBill = entries.reduce((sum, entry) => sum + TT.effectiveBillMinutes(state, entry), 0);
  const totAmt = entries.reduce((sum, entry) => sum + TT.effectiveAmount(state, entry), 0);
  const currency = state.settings.currency;
  const copyMd = () => {
    const lines = [
      '# Invoice — ' + (client ? client.name : '') + ' — ' + TT.fmtMonth(month),
      '',
      '| date | project | note | hours | amount |',
      '|---|---|---|---:|---:|',
    ];
    entries.forEach((entry) => {
      lines.push(
        '| ' +
          entry.date +
          ' | ' +
          (entry.label || '') +
          ' | ' +
          (entry.note || '') +
          ' | ' +
          TT.fmtHours(TT.effectiveBillMinutes(state, entry)) +
          ' | ' +
          TT.fmtMoney(TT.effectiveAmount(state, entry), currency) +
          ' |',
      );
    });
    lines.push('| | | **total** | **' + TT.fmtHours(totBill) + '** | **' + TT.fmtMoney(totAmt, currency) + '** |');
    navigator.clipboard.writeText(lines.join('\n')).then(() => ui.toast(TT.t('Invoice copied as markdown')));
  };
  return (
    <div className={page}>
      <div className={clsx(headerRow, 'items-center')}>
        <h1 className={pageTitle}>{TT.t('Invoice')}</h1>
        <span className="ml-auto flex items-center gap-2">
          <OptionSelect
            value={clientId}
            onChange={(value) => setClientId(value)}
            options={state.clients.map((clientOption) => ({ value: clientOption.id, label: clientOption.name }))}
            className={clsx(SELECT, 'w-42.5')}
          />
          <OptionSelect
            value={month}
            onChange={(value) => setMonth(value)}
            options={months.map((monthKey) => ({ value: monthKey, label: TT.fmtMonth(monthKey) }))}
            className={clsx(SELECT, 'w-32.5')}
          />
          <Button variant="secondary" size="sm" onClick={copyMd} disabled={!entries.length}>
            {TT.t('copy as markdown')}
          </Button>
        </span>
      </div>
      {client && (
        <div className="mb-5 flex gap-2">
          <Chip mono={true}>
            {TT.t('round: ') + (client.rounding === 'exact' ? TT.t('exact') : client.rounding + ' min ↑')}
          </Chip>
          <Chip mono={true}>
            {TT.t('rate: ') +
              (client.rate != null ? TT.fmtMoney(client.rate, currency) + '/' + TT.t('h') : TT.t('per project'))}
          </Chip>
        </div>
      )}
      <div className={table}>
        <div className={clsx(headRow, COLS)}>
          {['date', 'task', 'note'].map((header) => (
            <span key={header} className={th}>
              {TT.t(header)}
            </span>
          ))}
          <span className={clsx(th, 'text-right')}>{TT.t('hours')}</span>
          <span className={clsx(th, 'text-right')}>{TT.t('amount')}</span>
        </div>
        {entries.length === 0 && (
          <div className={empty}>
            {TT.t('No billable hours for ') + (client ? client.name : '?') + TT.t(' in ') + TT.fmtMonth(month) + '.'}
          </div>
        )}
        {entries.map((entry) => {
          const code = TT.entryProjectCode(state, entry);
          return (
            <div key={entry.id} className={clsx(bodyRow, COLS)}>
              <span className={clsx(cell, 'font-mono text-caption text-secondary')}>{entry.date.slice(5)}</span>
              <span className={clsx(cell, 'flex min-w-0 items-baseline gap-1.75 text-body text-primary')}>
                <span className={clsx(codeClass, projectText(state, code))}>{code}</span>
                <span className="truncate">{entry.label || ''}</span>
              </span>
              <span className={clsx(cell, 'truncate text-body text-secondary')}>{entry.note || ''}</span>
              <span className={clsx(cell, num, 'text-primary')}>
                {TT.fmtHours(TT.effectiveBillMinutes(state, entry))}
              </span>
              <span className={clsx(cell, num, 'text-primary')}>
                {TT.fmtMoney(TT.effectiveAmount(state, entry), currency)}
              </span>
            </div>
          );
        })}
        {/* BOB GAP: the totals were mono 11.5px at weight 600, and Bob has no 11.5px style with a
            weight. They keep the size (text-caption) and lose the weight; the label keeps 600. */}
        <div className={clsx(totalRow, COLS)}>
          <span className={clsx(cell, 'col-start-1 col-end-4 text-subhead text-primary')}>
            {TT.t('total') + ' — ' + (client ? client.name : '') + ' · ' + TT.fmtMonth(month)}
          </span>
          <span className={clsx(cell, num, 'text-primary')}>{TT.fmtHours(totBill)}</span>
          <span className={clsx(cell, num, 'text-primary')}>{TT.fmtMoney(totAmt, currency)}</span>
        </div>
      </div>
    </div>
  );
}
