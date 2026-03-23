import { useEffect, useMemo, useRef, useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { ErrorState } from '../components/states/ErrorState';
import { fetchSettingsMyProfileChangePasswordModernData, fetchSettingsMyProfileModernData } from '../lib/api';
import { ensureModernUIURL, ensureUIURL } from '../lib/navigation';
import type { SettingsMyProfileChangePasswordModernDataResponse, SettingsMyProfileModernDataResponse, UIModeBootstrap } from '../types';
import '../dashboard-avel.css';

type Props = {
  bootstrap: UIModeBootstrap;
};

type SettingsSummaryCard = {
  label: string;
  value: string;
  note: string;
  tone: 'info' | 'success' | 'warning';
};

function toBooleanLabel(value: boolean, onLabel: string, offLabel: string): string {
  return value ? onLabel : offLabel;
}

function toKey(value: string | null): string {
  return String(value || '').trim().toLowerCase();
}

function buildSummaryCards(summary: {
  userID: number;
  fullName: string;
  isDemoUser: boolean;
  authMode: string;
}): SettingsSummaryCard[] {
  return [
    {
      label: 'Signed in as',
      value: summary.fullName || '--',
      note: `User ID ${summary.userID}`,
      tone: 'info'
    },
    {
      label: 'Authentication',
      value: summary.authMode || '--',
      note: summary.isDemoUser ? 'Demo account' : 'Standard account',
      tone: summary.isDemoUser ? 'warning' : 'success'
    },
    {
      label: 'Demo access',
      value: toBooleanLabel(summary.isDemoUser, 'Enabled', 'Disabled'),
      note: 'Legacy settings stay available',
      tone: summary.isDemoUser ? 'warning' : 'info'
    }
  ];
}

function SettingsMyProfileSummary({
  data,
  legacyURL
}: {
  data: SettingsMyProfileModernDataResponse;
  legacyURL: string;
}) {
  const cards = buildSummaryCards(data.summary);
  const showProfileURL = ensureUIURL(data.actions.showProfileURL, 'legacy');
  const changePasswordURL = ensureModernUIURL(data.actions.changePasswordURL);

  return (
    <div className="avel-dashboard-page avel-settings-admin-page avel-settings-profile-page">
      <PageContainer
        title="My Profile"
        subtitle="Review your account and jump to password changes from the native shell."
        actions={(
          <>
            <a className="modern-btn modern-btn--secondary" href={changePasswordURL}>
              Change Password
            </a>
            <a className="modern-btn modern-btn--secondary" href={legacyURL}>
              Open Legacy UI
            </a>
          </>
        )}
      >
        <div className="modern-dashboard avel-dashboard-shell">
          {data.summary.isDemoUser ? (
            <section className="avel-settings-admin-flash is-warning" aria-live="polite">
              <strong>Notice</strong>
              <span>Demo users cannot modify settings.</span>
            </section>
          ) : null}

          <section className="avel-settings-admin-summary">
            {cards.map((card) => (
              <article key={card.label} className={`avel-settings-admin-summary-card is-${card.tone}`}>
                <span className="avel-settings-admin-summary-label">{card.label}</span>
                <strong className="avel-settings-admin-summary-value">{card.value}</strong>
                <span className="avel-settings-admin-summary-note">{card.note}</span>
              </article>
            ))}
          </section>

          <section className="avel-list-panel">
            <div className="avel-list-panel__header">
              <h2 className="avel-list-panel__title">Profile Shortcuts</h2>
              <p className="avel-list-panel__hint">
                Open the legacy profile view or jump straight to the native password card route.
              </p>
            </div>

            <div className="avel-settings-admin-links">
              <a className="avel-settings-admin-link" href={showProfileURL}>
                <span className="avel-settings-admin-link__label-row">
                  <span className="avel-settings-admin-link__label">View Profile</span>
                </span>
                <span className="avel-settings-admin-link__description">
                  Open the existing legacy profile details view.
                </span>
              </a>
              <a className="avel-settings-admin-link is-highlighted" href={changePasswordURL}>
                <span className="avel-settings-admin-link__label-row">
                  <span className="avel-settings-admin-link__label">Change Password</span>
                </span>
                <span className="avel-settings-admin-link__description">
                  Open the native change-password card route.
                </span>
              </a>
            </div>
          </section>
        </div>
      </PageContainer>
    </div>
  );
}

function SettingsMyProfileChangePassword({
  data,
  legacyURL
}: {
  data: SettingsMyProfileChangePasswordModernDataResponse;
  legacyURL: string;
}) {
  const cards = buildSummaryCards(data.summary);
  const backURL = ensureModernUIURL(data.actions.backURL);

  return (
    <div className="avel-dashboard-page avel-settings-admin-page avel-settings-password-page">
      <PageContainer
        title="Change Password"
        subtitle="Keep the legacy submit flow while presenting the password form in a native card."
        actions={(
          <>
            <a className="modern-btn modern-btn--secondary" href={backURL}>
              Back To My Profile
            </a>
            <a className="modern-btn modern-btn--secondary" href={legacyURL}>
              Open Legacy UI
            </a>
          </>
        )}
      >
        <div className="modern-dashboard avel-dashboard-shell">
          {data.summary.isDemoUser ? (
            <section className="avel-settings-admin-flash is-warning" aria-live="polite">
              <strong>Notice</strong>
              <span>Demo users cannot modify settings.</span>
            </section>
          ) : null}

          {toKey(data.summary.authMode) === 'ldap' ? (
            <section className="avel-settings-admin-flash is-warning" aria-live="polite">
              <strong>LDAP Enabled</strong>
              <span>Password changes remain managed outside OpenCATS.</span>
            </section>
          ) : null}

          <section className="avel-settings-admin-summary">
            {cards.map((card) => (
              <article key={card.label} className={`avel-settings-admin-summary-card is-${card.tone}`}>
                <span className="avel-settings-admin-summary-label">{card.label}</span>
                <strong className="avel-settings-admin-summary-value">{card.value}</strong>
                <span className="avel-settings-admin-summary-note">{card.note}</span>
              </article>
            ))}
          </section>

          <section className="avel-list-panel">
            <div className="avel-list-panel__header">
              <h2 className="avel-list-panel__title">Password Form</h2>
              <p className="avel-list-panel__hint">
                This card posts to the existing legacy password-change endpoint without changing field names.
              </p>
            </div>

            <form className="avel-settings-password-form" action={data.actions.submitURL} method="post" name="changePasswordForm" id="changePasswordForm">
              <input type="hidden" name="postback" id="postback" value="postback" />

              <div className="avel-settings-password-grid">
                <label className="avel-settings-password-field" htmlFor="currentPassword">
                  <span>Current Password</span>
                  <input className="avel-form-control" type="password" id="currentPassword" name="currentPassword" />
                </label>

                <label className="avel-settings-password-field" htmlFor="newPassword">
                  <span>New Password</span>
                  <input className="avel-form-control" type="password" id="newPassword" name="newPassword" />
                </label>

                <label className="avel-settings-password-field" htmlFor="retypeNewPassword">
                  <span>Retype New Password</span>
                  <input className="avel-form-control" type="password" id="retypeNewPassword" name="retypeNewPassword" />
                </label>
              </div>

              <div className="modern-compat-page__actions">
                <button type="submit" className="modern-btn modern-btn--emphasis">
                  Change Password
                </button>
                <button type="reset" className="modern-btn modern-btn--secondary">
                  Reset
                </button>
                <a className="modern-btn modern-btn--secondary" href={backURL}>
                  Back
                </a>
                <a className="modern-btn modern-btn--secondary" href={legacyURL}>
                  Open Legacy UI
                </a>
              </div>
            </form>
          </section>
        </div>
      </PageContainer>
    </div>
  );
}

export function SettingsMyProfilePage({ bootstrap }: Props) {
  const queryString = useMemo(() => new URLSearchParams(window.location.search), []);
  const requestedSubpage = useMemo(() => toKey(queryString.get('s')), [queryString]);
  const isChangePassword = requestedSubpage === 'changepassword';
  const isSupportedRoute = requestedSubpage === '' || isChangePassword;
  const legacyURL = useMemo(() => ensureUIURL(bootstrap.legacyURL, 'legacy'), [bootstrap.legacyURL]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profileData, setProfileData] = useState<SettingsMyProfileModernDataResponse | null>(null);
  const [changePasswordData, setChangePasswordData] = useState<SettingsMyProfileChangePasswordModernDataResponse | null>(null);
  const requestIDRef = useRef(0);

  useEffect(() => {
    let mounted = true;
    const requestID = requestIDRef.current + 1;
    requestIDRef.current = requestID;
    setLoading(true);
    setError('');

    if (!isSupportedRoute) {
      setLoading(false);
      setProfileData(null);
      setChangePasswordData(null);
      return () => {
        mounted = false;
      };
    }

    const load = isChangePassword
      ? fetchSettingsMyProfileChangePasswordModernData(bootstrap, queryString)
      : fetchSettingsMyProfileModernData(bootstrap, queryString);

    load
      .then((data) => {
        if (!mounted || requestID !== requestIDRef.current) {
          return;
        }
        if (isChangePassword) {
          setChangePasswordData(data as SettingsMyProfileChangePasswordModernDataResponse);
          setProfileData(null);
        } else {
          setProfileData(data as SettingsMyProfileModernDataResponse);
          setChangePasswordData(null);
        }
      })
      .catch((loadError: Error) => {
        if (!mounted || requestID !== requestIDRef.current) {
          return;
        }
        setError(loadError.message || 'Unable to load profile settings.');
        setProfileData(null);
        setChangePasswordData(null);
      })
      .finally(() => {
        if (mounted && requestID === requestIDRef.current) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [bootstrap, isChangePassword, isSupportedRoute, queryString]);

  if (loading) {
    return <div className="modern-state">Loading profile settings...</div>;
  }

  if (!isSupportedRoute) {
    return (
      <ErrorState
        message="Unsupported profile subpage for native shell."
        actionLabel="Open Legacy UI"
        actionURL={legacyURL}
      />
    );
  }

  if (error !== '') {
    return <ErrorState message={error} actionLabel="Open Legacy UI" actionURL={legacyURL} />;
  }

  if (isChangePassword && changePasswordData) {
    return <SettingsMyProfileChangePassword data={changePasswordData} legacyURL={legacyURL} />;
  }

  if (!isChangePassword && profileData) {
    return <SettingsMyProfileSummary data={profileData} legacyURL={legacyURL} />;
  }

  return <ErrorState message="Profile settings are unavailable." actionLabel="Open Legacy UI" actionURL={legacyURL} />;
}
