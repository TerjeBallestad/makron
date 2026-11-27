import React from 'react';

/**
 * A chrome-less text button: no border, no fill, no padding. The top bar's "stop" and the
 * sidebar's "sign out" use it; the caller sets the font and the colour. It is type="button" unless
 * the caller says otherwise, so it never submits a form by accident.
 *
 * BOB GAP (PLAN-002 rule): Bob's Button has no text variant (every variant has a border or a
 * fill, and btn-sm/btn-md set padding). This stays local until Bob has one.
 */
export function TextButton({ className, type = 'button', ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      className={['cursor-pointer border-none bg-transparent p-0', className].filter(Boolean).join(' ')}
      {...rest}
    />
  );
}
