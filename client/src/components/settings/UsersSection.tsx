import React from 'react';
import TT from '../../i18n';
import { Chip, SectionLabel, Button, Input } from '@terjeballestad/bob';
import { OptionSelect } from '../OptionSelect';
import { clsx } from 'clsx';
import { glyphButton, headRow, row, section, sectionLabel, small, th } from './section';

const COLS = 'grid-cols-[1fr_1fr_110px_76px_26px]';
import type { AppState, User, Role } from '../../../../shared/types';
import type { UiActions } from '../../types';

interface UserForm {
  name: string;
  email: string;
  password: string;
  role: Role;
}
interface UsersSectionProps {
  state: AppState;
  ui: UiActions;
}

export function UsersSection({ state, ui }: UsersSectionProps) {
  const [users, setUsers] = React.useState<User[] | null>(null);
  const [form, setForm] = React.useState<UserForm | null>(null);
  // the user whose password is being reset, and the pending value
  const [reset, setReset] = React.useState<{ id: number; password: string } | null>(null);
  const reload = () =>
    ui.users
      .list()
      .then(setUsers)
      .catch(() => setUsers([]));
  React.useEffect(() => {
    reload();
  }, []);
  const submit = () => {
    if (!form) return;
    ui.users.create(form).then(() => {
      setForm(null);
      reload();
    });
  };
  const submitReset = () => {
    if (!reset?.password) return;
    ui.users.setPassword(reset.id, reset.password).then((ok) => {
      if (ok) setReset(null);
    });
  };
  return (
    <div className={section}>
      <SectionLabel
        className={sectionLabel}
        action={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setForm(form ? null : { name: '', email: '', password: '', role: 'employee' })}
          >
            {TT.t('+ user')}
          </Button>
        }
      >
        {TT.t('Users')}
      </SectionLabel>
      <div className={clsx(headRow, COLS)}>
        {['name', 'Email', 'role'].map((header) => (
          <span key={header} className={th}>
            {TT.t(header)}
          </span>
        ))}
        <span></span>
        <span></span>
      </div>
      {(users || []).map((user) => (
        <React.Fragment key={user.id}>
          <div className={clsx(row, COLS)}>
            <span className="text-body">{user.name}</span>
            <span className="font-mono text-body text-secondary">{user.email}</span>
            <Chip mono={true} tone={user.role === 'admin' ? 'green' : 'neutral'}>
              {TT.t(user.role)}
            </Chip>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setReset(reset?.id === user.id ? null : { id: user.id, password: '' })}
            >
              {TT.t('password')}
            </Button>
            {user.id !== state.user.id ? (
              <Button variant="text" onClick={() => ui.users.remove(user.id).then(reload)} className={glyphButton}>
                ×
              </Button>
            ) : (
              <span></span>
            )}
          </div>
          {reset?.id === user.id && (
            <div
              className="grid grid-cols-[1fr_auto_auto] items-center gap-2 pb-2"
              onKeyDown={(ev) => {
                if (ev.key === 'Enter') submitReset();
              }}
            >
              <Input
                type="password"
                autoComplete="new-password"
                autoFocus={true}
                placeholder={TT.t('New password for ') + user.email}
                value={reset.password}
                onChange={(e) => setReset({ ...reset, password: e.target.value })}
                className={small}
              />
              <Button variant="primary" size="sm" disabled={!reset.password} onClick={submitReset}>
                {TT.t('Set password')}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setReset(null)}>
                {TT.t('cancel')}
              </Button>
            </div>
          )}
        </React.Fragment>
      ))}
      {form && (
        <div className="mt-2 grid grid-cols-[1fr_1fr_130px_110px_auto] items-center gap-2 rounded-md border border-subtle p-3">
          <Input
            placeholder={TT.t('Name')}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={small}
          />
          <Input
            placeholder={TT.t('Email')}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className={small}
          />
          <Input
            placeholder={TT.t('Password')}
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className={small}
          />
          <OptionSelect
            value={form.role}
            onChange={(value) => setForm({ ...form, role: value as Role })}
            options={[
              { value: 'employee', label: TT.t('employee') },
              { value: 'admin', label: TT.t('admin') },
            ]}
            className={small}
          />
          <Button variant="primary" size="sm" disabled={!(form.name && form.email && form.password)} onClick={submit}>
            {TT.t('Create user')}
          </Button>
        </div>
      )}
    </div>
  );
}
