import type { FormEvent } from 'react';
import { LoginForm } from '../LoginForm';
import { Notice } from '../Notice';
import './AuthSection.scss';

type AuthSectionProps = {
  formError: string | null;
  isLoggingIn: boolean;
  verificationRequired: boolean;
  onLogin: (event: FormEvent<HTMLFormElement>) => void;
};

export function AuthSection({ formError, isLoggingIn, verificationRequired, onLogin }: AuthSectionProps) {
  if (verificationRequired) {
    return (
      <section className="auth-layout">
        <Notice error>
          The credentials were accepted, but another verification step is required. TOTP is not available in this demo.
        </Notice>
      </section>
    );
  }

  return (
    <section className="auth-layout">
      <LoginForm formError={formError} isLoggingIn={isLoggingIn} onSubmit={onLogin} />
    </section>
  );
}
