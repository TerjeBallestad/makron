import React from 'react';
import TT from '../i18n';
import { Button, FormRow, Input } from '@terjeballestad/bob';
import { api } from '../api';
import type { FirstRunResponse } from '../../../shared/types';

interface LoginProps {
  onLogin: () => void;
  /**
   * DD-024 clause 2 — the seeded admin still carries the password this repo publishes, so say it.
   * `null` for every other caller, and that covers three different ones at once: the password has
   * been changed, an operator set their own `MK_ADMIN_PASSWORD`, or the probe 404'd because this
   * browser is not on the machine the server runs on.
   */
  defaultLogin: FirstRunResponse['defaultLogin'];
}

/**
 * THE WALL, AND WHY THIS HINT IS HERE (DD-024 clause 2). The first run sits in FRONT of the login,
 * so a person who finishes it lands here holding a credential nobody ever showed them —
 * `seedIfEmpty` announces it once on stdout, which `mk serve` redirects into a detached log file.
 *
 * WHAT IS ACTUALLY DISCLOSED, and the reason this is not a hole: the literal in `server/src/config.js`
 * of a public MIT repo (DD-004), stated back only to a caller the server has already established is
 * on a loopback SOCKET with a loopback Host header — the same predicate the first-run surface and
 * the first-run caller gate uses, never the Host header alone. The bind is every interface unless
 * `MK_HOST` narrows it, so a header-only gate would read this out to any machine on the wifi:
 * SB-162 with a password in it.
 * It retires itself the moment the password changes, because the server recomputes the answer from
 * the stored hash on every probe.
 */
/*
 * The welcome screens' glass card over the turtle picture. OnboardingCard draws the same chrome
 * a little darker and wider.
 *
 * BOB GAP (PLAN-002 rule): Bob has no alpha step for these, so they keep their values:
 * gray-3 (#0f1014) at 28/72/94% in the scrim, gray-7 (#13141a) at 55% in the card, white at
 * 10% in the border, black at 75% in the shadow. The brand's text shadow is --black-a55.
 * The card's width, min(360px, 92vw), and the turtle picture are this screen's own layout and art.
 */
export function Login({ onLogin, defaultLogin }: LoginProps) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);
  const submit = () => {
    if (!email || !password || busy) return;
    setBusy(true);
    setErr(null);
    api
      .login(email, password)
      .then(onLogin)
      .catch((e: Error) => {
        setErr(e.message);
        setBusy(false);
      });
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-app bg-[image:radial-gradient(130%_100%_at_50%_38%,rgba(15,16,20,0.28),rgba(15,16,20,0.72)_62%,rgba(15,16,20,0.94)_100%),url(/turtle-bg.jpg)] bg-cover bg-center bg-no-repeat font-sans">
      <div
        className="w-[min(360px,92vw)] rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(19,20,26,0.55)] px-6.5 py-7.5 shadow-[0_28px_64px_-22px_rgba(0,0,0,0.75)] backdrop-blur-lg backdrop-saturate-115"
        onKeyDown={(ev) => {
          if (ev.key === 'Enter') submit();
        }}
      >
        <div className="mb-6 flex items-center justify-center">
          <span className="text-[22px] font-bold tracking-heading text-primary [text-shadow:0_1px_10px_var(--black-a55)]">
            Makron
          </span>
        </div>
        <FormRow label={TT.t('Email')}>
          <Input autoFocus={true} value={email} onChange={(e) => setEmail(e.target.value)} spellCheck={false} />
        </FormRow>
        <FormRow label={TT.t('Password')}>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </FormRow>
        {err && <div className="mt-0.5 mb-2 text-caption text-danger">{err}</div>}
        <Button variant="primary" onClick={submit} disabled={!email || !password || busy} className="mt-1.5 w-full">
          {busy ? TT.t('Signing in…') : TT.t('Sign in')}
        </Button>
        {/* DD-024 clause 2: the starting-password note. Quiet, because it is a fact about this
            install, not an instruction. The credential is mono, because it is a string to be typed
            exactly. */}
        {defaultLogin && (
          <div
            className="mt-3.5 border-t border-strong pt-3 text-[11px] leading-[1.6] text-muted"
            data-tt="login-default-credentials"
          >
            {TT.t('This install still has its starting password. Sign in as')}{' '}
            <code className="font-mono text-secondary">{defaultLogin.email}</code> /{' '}
            <code className="font-mono text-secondary">{defaultLogin.password}</code>{' '}
            {TT.t('and change it under Settings → Password. This note disappears when you do.')}
          </div>
        )}
      </div>
    </div>
  );
}
