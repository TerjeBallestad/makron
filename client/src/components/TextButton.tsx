import React from 'react';

/**
 * A chrome-less text button: no border, no fill, no padding. The top bar's "stop" and the
 * sidebar's "sign out" use it; the caller sets the font and the colour.
 *
 * BOB GAP (PLAN-002 rule): Bob's Button has no text variant (every variant has a border or a
 * fill, and btn-sm/btn-md set padding). This stays local until Bob has one.
 */
export function TextButton({ className, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={['cursor-pointer border-none bg-transparent p-0', className].join(' ')} {...rest} />;
}
