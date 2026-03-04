import { FormEvent, useEffect, useMemo, useState } from 'react';
import { fetchLoginModernData, submitForgotPasswordModernData } from '../lib/api';
import { useServerQueryState } from '../lib/useServerQueryState';
import { PageContainer } from '../components/layout/PageContainer';
import { EmptyState } from '../components/states/EmptyState';
import { ErrorState } from '../components/states/ErrorState';
import type { LoginModernDataResponse, UIModeBootstrap } from '../types';
import '../dashboard-avel.css';

type Props = {
  bootstrap: UIModeBootstrap;
};

function toStringValue(value: unknown): string {
  if (typeof value !== 'string') {
    return '';
  }
  return value;
}

function toBoolValue(value: unknown): boolean {
  return value === true;
}

function resolveTitle(data: LoginModernDataResponse): string {
  if (data.state.view === 'forgot-password') {
    return 'Forgot Password';
  }
  if (data.state.view === 'request-access') {
    return 'Request Access';
  }
  if (data.state.view === 'no-cookies') {
    return 'Cookies Required';
  }
  return 'Sign In';
}

function renderMessage(data: LoginModernDataResponse) {
  const text = toStringValue(data.state.message || data.state.statusMessage);
  if (text === '') {
    return null;
  }
  const isSuccess = toBoolValue(data.state.messageSuccess) || toStringValue(data.state.status) === 'submitted';
  return (
    <p className={`modern-state${isSuccess ? '' : ' modern-state--warning'}`} role={isSuccess ? 'status' : 'alert'}>
      {text}
    </p>
  );
}

export function LoginPage({ bootstrap }: Props) {
  const [data, setData] = useState<LoginModernDataResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [submittingForgot, setSubmittingForgot] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [forgotUsername, setForgotUsername] = useState<string>('');
  const [requestReason, setRequestReason] = useState<string>('');
  const { serverQueryString } = useServerQueryState(bootstrap.indexName);

  const requestedAction = useMemo(() => {
    const query = new URLSearchParams(serverQueryString);
    return String(bootstrap.targetAction || query.get('a') || 'showLoginForm');
  }, [bootstrap.targetAction, serverQueryString]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError('');

    const query = new URLSearchParams(serverQueryString);
    fetchLoginModernData(bootstrap, requestedAction, query)
      .then((result) => {
        if (!mounted) {
          return;
        }
        setData(result);
        if (result.state.view === 'forgot-password') {
          setForgotUsername(toStringValue(result.state.username));
        }
        if (result.state.view === 'request-access') {
          setRequestReason(toStringValue(result.state.reason));
        }
      })
      .catch((err: Error) => {
        if (!mounted) {
          return;
        }
        setError(err.message || 'Unable to load login workspace.');
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [bootstrap, requestedAction, serverQueryString]);

  const handleForgotSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!data) {
      return;
    }
    if (forgotUsername.trim() === '') {
      setError('Username is required.');
      return;
    }
    const submitURL = toStringValue(data.actions.forgotPasswordSubmitURL || `${bootstrap.indexName}?m=login&a=forgotPassword`);
    setSubmittingForgot(true);
    setError('');
    try {
      const result = await submitForgotPasswordModernData(submitURL, forgotUsername);
      setData(result);
      setForgotUsername(toStringValue(result.state.username || forgotUsername));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Forgot password submit failed.';
      setError(message);
    } finally {
      setSubmittingForgot(false);
    }
  };

  if (loading && !data) {
    return <div className="modern-state">Loading login workspace...</div>;
  }

  if (error) {
    return <ErrorState message={error} actionLabel="Open Legacy UI" actionURL={bootstrap.legacyURL} />;
  }

  if (!data) {
    return <EmptyState message="Login workspace is unavailable." />;
  }

  const loginSubmitURL = toStringValue(data.actions.loginSubmitURL || `${bootstrap.indexName}?m=login&a=attemptLogin`);
  const requestAccessSubmitURL = toStringValue(
    data.actions.requestAccessSubmitURL || `${bootstrap.indexName}?m=login&a=requestAccess&ui=modern`
  );
  const requestAccessURL = toStringValue(data.actions.requestAccessURL || `${bootstrap.indexName}?m=login&a=requestAccess&ui=modern`);
  const showLoginURL = toStringValue(data.actions.showLoginURL || `${bootstrap.indexName}?m=login&a=showLoginForm&ui=modern`);
  const forgotPasswordURL = toStringValue(
    data.actions.forgotPasswordURL || `${bootstrap.indexName}?m=login&a=forgotPassword&ui=modern`
  );
  const legacyURL = toStringValue(data.actions.legacyURL || bootstrap.legacyURL);

  return (
    <div className="avel-dashboard-page">
      <PageContainer
        title={resolveTitle(data)}
        subtitle="Modern login workspace with compatibility-safe authentication flows."
        actions={
          <>
            <a className="modern-btn modern-btn--secondary" href={showLoginURL}>
              Sign In
            </a>
            <a className="modern-btn modern-btn--secondary" href={requestAccessURL}>
              Request Access
            </a>
            <a className="modern-btn modern-btn--secondary" href={legacyURL}>
              Open Legacy UI
            </a>
          </>
        }
      >
        <div className="modern-dashboard avel-dashboard-shell">
          <section className="avel-list-panel">
            {renderMessage(data)}

            {data.state.view === 'login-form' ? (
              <form action={loginSubmitURL} method="post" autoComplete="off">
                {toStringValue(data.state.siteName) !== '' ? (
                  <input type="hidden" name="siteName" value={toStringValue(data.state.siteName)} />
                ) : null}
                {toStringValue(data.state.reloginVars) !== '' ? (
                  <input type="hidden" name="reloginVars" value={toStringValue(data.state.reloginVars)} />
                ) : null}
                {toBoolValue(data.state.siteNameError) ? (
                  <p className="modern-state modern-state--warning" role="alert">
                    This site does not exist. Check the URL or sign in with a different site context.
                  </p>
                ) : null}
                <div className="avel-candidate-edit-grid">
                  <label className="modern-command-field">
                    <span className="modern-command-label">Username</span>
                    <input
                      type="text"
                      name="username"
                      className="avel-form-control"
                      defaultValue={toStringValue(data.state.username)}
                      autoComplete="username"
                      required
                    />
                  </label>
                  <label className="modern-command-field">
                    <span className="modern-command-label">Password</span>
                    <input type="password" name="password" className="avel-form-control" autoComplete="current-password" required />
                  </label>
                </div>
                <div className="modern-table-actions" style={{ marginTop: '12px' }}>
                  <button type="submit" className="modern-btn modern-btn--emphasis">
                    Login
                  </button>
                  <button type="reset" className="modern-btn modern-btn--secondary">
                    Reset
                  </button>
                  {toBoolValue(data.state.googleAuthEnabled) && toStringValue(data.state.googleLoginURL) !== '' ? (
                    <a className="modern-btn modern-btn--secondary" href={toStringValue(data.state.googleLoginURL)}>
                      Sign In With Google
                    </a>
                  ) : null}
                  <a className="modern-btn modern-btn--secondary" href={forgotPasswordURL}>
                    Forgot Password
                  </a>
                  <a className="modern-btn modern-btn--secondary" href={requestAccessURL}>
                    Request Access
                  </a>
                </div>
              </form>
            ) : null}

            {data.state.view === 'forgot-password' ? (
              <>
                {toBoolValue(data.state.complete) ? (
                  <div className="modern-state">
                    Password reset completed for <strong>{toStringValue(data.state.username)}</strong>.
                  </div>
                ) : (
                  <form onSubmit={handleForgotSubmit} autoComplete="off">
                    <div className="avel-candidate-edit-grid">
                      <label className="modern-command-field">
                        <span className="modern-command-label">Username</span>
                        <input
                          type="text"
                          className="avel-form-control"
                          value={forgotUsername}
                          onChange={(event) => setForgotUsername(event.target.value)}
                          autoComplete="username"
                          required
                        />
                      </label>
                    </div>
                    <div className="modern-table-actions" style={{ marginTop: '12px' }}>
                      <button type="submit" className="modern-btn modern-btn--emphasis" disabled={submittingForgot}>
                        {submittingForgot ? 'Submitting...' : 'Email My Password'}
                      </button>
                      <a className="modern-btn modern-btn--secondary" href={showLoginURL}>
                        Back To Login
                      </a>
                    </div>
                  </form>
                )}
              </>
            ) : null}

            {data.state.view === 'request-access' ? (
              <>
                {toStringValue(data.state.status) !== '' && toStringValue(data.state.status) !== 'form' ? (
                  <div className={`modern-state${toStringValue(data.state.status) === 'submitted' ? '' : ' modern-state--warning'}`}>
                    {toStringValue(data.state.statusMessage)}
                  </div>
                ) : (
                  <form action={requestAccessSubmitURL} method="post">
                    <input type="hidden" name="postback" value="postback" />
                    <div className="avel-candidate-edit-grid">
                      <label className="modern-command-field">
                        <span className="modern-command-label">Name</span>
                        <input type="text" className="avel-form-control" value={toStringValue(data.state.fullName)} readOnly />
                      </label>
                      <label className="modern-command-field">
                        <span className="modern-command-label">Email</span>
                        <input type="text" className="avel-form-control" value={toStringValue(data.state.email)} readOnly />
                      </label>
                      <label className="modern-command-field avel-candidate-edit-field--full">
                        <span className="modern-command-label">Reason (optional)</span>
                        <textarea
                          className="avel-form-control"
                          rows={4}
                          name="reason"
                          value={requestReason}
                          onChange={(event) => setRequestReason(event.target.value)}
                          maxLength={2000}
                        />
                      </label>
                    </div>
                    <div className="modern-table-actions" style={{ marginTop: '12px' }}>
                      <button type="submit" className="modern-btn modern-btn--emphasis">
                        Request Access
                      </button>
                      <a className="modern-btn modern-btn--secondary" href={showLoginURL}>
                        Back To Login
                      </a>
                    </div>
                  </form>
                )}
              </>
            ) : null}

            {data.state.view === 'no-cookies' ? (
              <div>
                <p className="modern-state modern-state--warning" role="alert">
                  {toStringValue(data.state.message || data.state.title)}
                </p>
                <div className="modern-table-actions" style={{ marginTop: '12px' }}>
                  <a className="modern-btn modern-btn--emphasis" href={toStringValue(data.actions.retryURL || showLoginURL)}>
                    Retry
                  </a>
                </div>
              </div>
            ) : null}
          </section>
        </div>
      </PageContainer>
    </div>
  );
}
