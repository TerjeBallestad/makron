import React from 'react';
import TT from '../../i18n';
import { Kbd } from '@terjeballestad/bob';

export function SyntaxHint() {
  // Kbd's public API is style-only (frozen), so the 2px inline-key spacing lives on a
  // wrapping span class rather than a Kbd prop — the bare Enter/⌫ keys stay marginless.
  const k = (s: string) => (
    <span className="mx-0.5">
      <Kbd>{s}</Kbd>
    </span>
  );
  return (
    <div className="mt-3.5 text-caption leading-loose text-muted">
      {TT.t('time formats — ')}
      {k('12:00-13:00')}
      {' ' + TT.t('range') + ' · '}
      {k('12:30→')}
      {' ' + TT.t('running timer') + ' · '}
      {k('5h')} {k('1h30m')} {k('45m')}
      {' ' + TT.t('duration.') + ' '}
      {TT.t('Overnight ranges roll to the next day. ')}
      <Kbd>Enter</Kbd>
      {' ' + TT.t('adds') + ' · '}
      <Kbd>⌫</Kbd>
      {' ' + TT.t('on empty deletes.')}
    </div>
  );
}
