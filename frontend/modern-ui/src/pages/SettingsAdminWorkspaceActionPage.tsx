import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { buildEmbeddedLegacyURL } from '../lib/embeddedLegacy';
import { ensureModernUIURL, ensureUIURL } from '../lib/navigation';
import { fetchSettingsAdministrationModernData } from '../lib/api';
import { usePageRefreshEvents } from '../lib/usePageRefreshEvents';
import { useEmbeddedLegacyFrame } from '../lib/useEmbeddedLegacyFrame';
import type { SettingsAdministrationModernDataResponse, UIModeBootstrap } from '../types';
import '../dashboard-avel.css';

type Props = {
  bootstrap: UIModeBootstrap;
};

type PageCopy = {
  title: string;
  subtitle: string;
  panelTitle: string;
  panelSubtitle: string;
};

type BackLink = {
  label: string;
  href: string;
};

const COPY_BY_ROUTE_KEY: Record<string, PageCopy> = {
  'settings.administration': {
    title: 'Settings Administration',
    subtitle: 'Manage system configuration in compatibility mode.',
    panelTitle: 'Settings Administration Workspace',
    panelSubtitle: 'Legacy settings administration remains embedded while modernization continues.'
  },
  'settings.manageusers': {
    title: 'Manage Users',
    subtitle: 'Review and manage user access in compatibility mode.',
    panelTitle: 'User Management Workspace',
    panelSubtitle: 'Legacy user-management workflow remains embedded while modernization continues.'
  },
  'settings.adduser': {
    title: 'Add User',
    subtitle: 'Create a user account in compatibility mode.',
    panelTitle: 'Add User Workspace',
    panelSubtitle: 'Legacy user-creation workflow remains embedded while modernization continues.'
  },
  'settings.edituser': {
    title: 'Edit User',
    subtitle: 'Edit user profile and permissions in compatibility mode.',
    panelTitle: 'Edit User Workspace',
    panelSubtitle: 'Legacy user-edit workflow remains embedded while modernization continues.'
  },
  'settings.showuser': {
    title: 'User Profile',
    subtitle: 'Review user account details in compatibility mode.',
    panelTitle: 'User Profile Workspace',
    panelSubtitle: 'Legacy user-profile workflow remains embedded while modernization continues.'
  },
  'settings.deleteuser': {
    title: 'Delete User',
    subtitle: 'Remove user accounts in compatibility mode.',
    panelTitle: 'Delete User Workspace',
    panelSubtitle: 'Legacy user-deletion workflow remains embedded while modernization continues.'
  },
  'settings.emailtemplates': {
    title: 'Email Templates',
    subtitle: 'Manage email templates in compatibility mode.',
    panelTitle: 'Email Templates Workspace',
    panelSubtitle: 'Legacy email-template workflow remains embedded while modernization continues.'
  },
  'settings.addemailtemplate': {
    title: 'Add Email Template',
    subtitle: 'Create an email template in compatibility mode.',
    panelTitle: 'Add Email Template Workspace',
    panelSubtitle: 'Legacy email-template creation remains embedded while modernization continues.'
  },
  'settings.deleteemailtemplate': {
    title: 'Delete Email Template',
    subtitle: 'Remove an email template in compatibility mode.',
    panelTitle: 'Delete Email Template Workspace',
    panelSubtitle: 'Legacy email-template deletion remains embedded while modernization continues.'
  },
  'settings.loginactivity': {
    title: 'Login Activity',
    subtitle: 'Review user login activity in compatibility mode.',
    panelTitle: 'Login Activity Workspace',
    panelSubtitle: 'Legacy login-activity view remains embedded while modernization continues.'
  },
  'settings.myprofile': {
    title: 'My Profile',
    subtitle: 'Manage profile settings in compatibility mode.',
    panelTitle: 'My Profile Workspace',
    panelSubtitle: 'Legacy profile-management workflow remains embedded while modernization continues.'
  },
  'settings.changepassword': {
    title: 'Change Password',
    subtitle: 'Update password settings in compatibility mode.',
    panelTitle: 'Change Password Workspace',
    panelSubtitle: 'Legacy password workflow remains embedded while modernization continues.'
  },
  'settings.gdprsettings': {
    title: 'GDPR Settings',
    subtitle: 'Configure GDPR settings in compatibility mode.',
    panelTitle: 'GDPR Settings Workspace',
    panelSubtitle: 'Legacy GDPR settings workflow remains embedded while modernization continues.'
  },
  'settings.rejectionreasons': {
    title: 'Rejection Reasons',
    subtitle: 'Manage rejection reason lists in compatibility mode.',
    panelTitle: 'Rejection Reasons Workspace',
    panelSubtitle: 'Legacy rejection-reason workflow remains embedded while modernization continues.'
  },
  'settings.tags': {
    title: 'Tags',
    subtitle: 'Manage settings tags in compatibility mode.',
    panelTitle: 'Tags Workspace',
    panelSubtitle: 'Legacy tags workflow remains embedded while modernization continues.'
  },
  'settings.viewitemhistory': {
    title: 'Item History',
    subtitle: 'Review configuration item history in compatibility mode.',
    panelTitle: 'Item History Workspace',
    panelSubtitle: 'Legacy item-history workflow remains embedded while modernization continues.'
  },
  'settings.emailsettings': {
    title: 'Email Settings',
    subtitle: 'Configure email delivery settings in compatibility mode.',
    panelTitle: 'Email Settings Workspace',
    panelSubtitle: 'Legacy email-settings workflow remains embedded while modernization continues.'
  },
  'settings.feedbacksettings': {
    title: 'Feedback Settings',
    subtitle: 'Configure feedback settings in compatibility mode.',
    panelTitle: 'Feedback Settings Workspace',
    panelSubtitle: 'Legacy feedback-settings workflow remains embedded while modernization continues.'
  },
  'settings.forceemail': {
    title: 'Force Email',
    subtitle: 'Run force-email operations in compatibility mode.',
    panelTitle: 'Force Email Workspace',
    panelSubtitle: 'Legacy force-email workflow remains embedded while modernization continues.'
  },
  'settings.googleoidcsettings': {
    title: 'Google OIDC Settings',
    subtitle: 'Configure Google OIDC authentication settings in compatibility mode.',
    panelTitle: 'Google OIDC Workspace',
    panelSubtitle: 'Legacy Google OIDC workflow remains embedded while modernization continues.'
  },
  'settings.asplocalization': {
    title: 'ASP Localization',
    subtitle: 'Manage localization settings in compatibility mode.',
    panelTitle: 'Localization Workspace',
    panelSubtitle: 'Legacy localization workflow remains embedded while modernization continues.'
  },
  'settings.careerportalquestionnaire': {
    title: 'Career Portal Questionnaire',
    subtitle: 'Configure career portal questionnaire settings in compatibility mode.',
    panelTitle: 'Career Portal Questionnaire Workspace',
    panelSubtitle: 'Legacy career portal questionnaire workflow remains embedded while modernization continues.'
  },
  'settings.careerportalquestionnairepreview': {
    title: 'Career Portal Questionnaire Preview',
    subtitle: 'Preview the career portal questionnaire in compatibility mode.',
    panelTitle: 'Questionnaire Preview Workspace',
    panelSubtitle: 'Legacy questionnaire preview workflow remains embedded while modernization continues.'
  },
  'settings.careerportalquestionnaireupdate': {
    title: 'Career Portal Questionnaire Update',
    subtitle: 'Apply questionnaire updates in compatibility mode.',
    panelTitle: 'Questionnaire Update Workspace',
    panelSubtitle: 'Legacy questionnaire update workflow remains embedded while modernization continues.'
  },
  'settings.careerportalsettings': {
    title: 'Career Portal Settings',
    subtitle: 'Configure career portal behavior in compatibility mode.',
    panelTitle: 'Career Portal Settings Workspace',
    panelSubtitle: 'Legacy career portal settings workflow remains embedded while modernization continues.'
  },
  'settings.careerportaltemplateedit': {
    title: 'Career Portal Template',
    subtitle: 'Edit career portal templates in compatibility mode.',
    panelTitle: 'Career Portal Template Workspace',
    panelSubtitle: 'Legacy template-edit workflow remains embedded while modernization continues.'
  },
  'settings.createbackup': {
    title: 'Create Backup',
    subtitle: 'Create system backups in compatibility mode.',
    panelTitle: 'Backup Creation Workspace',
    panelSubtitle: 'Legacy backup creation workflow remains embedded while modernization continues.'
  },
  'settings.customizecalendar': {
    title: 'Customize Calendar',
    subtitle: 'Configure calendar preferences in compatibility mode.',
    panelTitle: 'Calendar Customization Workspace',
    panelSubtitle: 'Legacy calendar customization workflow remains embedded while modernization continues.'
  },
  'settings.customizeextrafields': {
    title: 'Customize Extra Fields',
    subtitle: 'Configure extra field definitions in compatibility mode.',
    panelTitle: 'Extra Fields Workspace',
    panelSubtitle: 'Legacy extra-field customization workflow remains embedded while modernization continues.'
  },
  'settings.deletebackup': {
    title: 'Delete Backup',
    subtitle: 'Remove backup files in compatibility mode.',
    panelTitle: 'Backup Deletion Workspace',
    panelSubtitle: 'Legacy backup deletion workflow remains embedded while modernization continues.'
  },
  'settings.eeo': {
    title: 'EEO Settings',
    subtitle: 'Manage EEO configuration in compatibility mode.',
    panelTitle: 'EEO Workspace',
    panelSubtitle: 'Legacy EEO settings workflow remains embedded while modernization continues.'
  },
  'settings.newinstallfinished': {
    title: 'New Install Finished',
    subtitle: 'Complete installation finalization steps in compatibility mode.',
    panelTitle: 'Install Finalization Workspace',
    panelSubtitle: 'Legacy installation finalization workflow remains embedded while modernization continues.'
  },
  'settings.newinstallpassword': {
    title: 'New Install Password',
    subtitle: 'Set installation password details in compatibility mode.',
    panelTitle: 'Install Password Workspace',
    panelSubtitle: 'Legacy install-password workflow remains embedded while modernization continues.'
  },
  'settings.newsitename': {
    title: 'New Site Name',
    subtitle: 'Configure site naming during setup in compatibility mode.',
    panelTitle: 'Site Name Workspace',
    panelSubtitle: 'Legacy site-name workflow remains embedded while modernization continues.'
  },
  'settings.oncareerportaltweak': {
    title: 'Career Portal Tweak',
    subtitle: 'Apply career portal tweak operations in compatibility mode.',
    panelTitle: 'Career Portal Tweak Workspace',
    panelSubtitle: 'Legacy career portal tweak workflow remains embedded while modernization continues.'
  },
  'settings.professional': {
    title: 'Professional Settings',
    subtitle: 'Manage professional package settings in compatibility mode.',
    panelTitle: 'Professional Settings Workspace',
    panelSubtitle: 'Legacy professional settings workflow remains embedded while modernization continues.'
  },
  'settings.rolepagepermissions': {
    title: 'Role Page Permissions',
    subtitle: 'Configure role-to-page permissions in compatibility mode.',
    panelTitle: 'Role Permissions Workspace',
    panelSubtitle: 'Legacy role-permissions workflow remains embedded while modernization continues.'
  },
  'settings.schemamigrations': {
    title: 'Schema Migrations',
    subtitle: 'Review and run schema migrations in compatibility mode.',
    panelTitle: 'Schema Migrations Workspace',
    panelSubtitle: 'Legacy schema-migration workflow remains embedded while modernization continues.'
  },
  'settings.talentfitflowsettings': {
    title: 'Talent Fit Flow Settings',
    subtitle: 'Configure Talent Fit Flow behavior in compatibility mode.',
    panelTitle: 'Talent Fit Flow Workspace',
    panelSubtitle: 'Legacy Talent Fit Flow settings workflow remains embedded while modernization continues.'
  },
  'settings.upgradesitename': {
    title: 'Upgrade Site Name',
    subtitle: 'Apply site-name upgrade changes in compatibility mode.',
    panelTitle: 'Upgrade Site Name Workspace',
    panelSubtitle: 'Legacy site-name upgrade workflow remains embedded while modernization continues.'
  }
};

const FALLBACK_COPY: PageCopy = {
  title: 'Settings Workspace',
  subtitle: 'Manage system settings through the embedded compatibility workspace.',
  panelTitle: 'Settings Compatibility Workspace',
  panelSubtitle: 'Legacy settings workflow is embedded while modernization continues.'
};

function toBooleanLabel(value: boolean, onLabel: string, offLabel: string): string {
  return value ? onLabel : offLabel;
}

function SettingsAdministrationNativeShell({
  data,
  legacyURL,
  backLink
}: {
  data: SettingsAdministrationModernDataResponse;
  legacyURL: string;
  backLink: BackLink;
}) {
  const dashboardURL = ensureModernUIURL(data.actions.dashboardURL);
  const flashTone = data.flash?.success ? 'is-success' : 'is-warning';

  const summaryCards = [
    {
      label: 'Site',
      value: data.summary.siteName || '--',
      note: `Version ${data.summary.version}`,
      tone: 'info'
    },
    {
      label: 'Signed in as',
      value: data.summary.fullName || '--',
      note: data.summary.systemAdministration ? 'System administrator' : 'Restricted administration',
      tone: data.summary.systemAdministration ? 'success' : 'warning'
    },
    {
      label: 'Career portal',
      value: toBooleanLabel(data.summary.careerPortalUnlock, 'Unlocked', 'Locked'),
      note: 'Legacy careers-website settings remain available',
      tone: data.summary.careerPortalUnlock ? 'success' : 'warning'
    },
    {
      label: 'Role matrix',
      value: toBooleanLabel(data.summary.rolePermissionsEnabled, 'Enabled', 'Hidden'),
      note: 'Controls page visibility by role',
      tone: data.summary.rolePermissionsEnabled ? 'success' : 'warning'
    },
    {
      label: 'Candidate records',
      value: String(data.summary.totalCandidates),
      note: data.summary.totalCandidates > 0 ? 'Data import remains optional' : 'Import highlighted for first-time setup',
      tone: data.summary.totalCandidates > 0 ? 'info' : 'warning'
    },
    {
      label: 'Update checks',
      value: data.summary.versionCheckPref ? 'Enabled' : 'Disabled',
      note: data.summary.newVersionAvailable ? 'Update available' : 'No update detected',
      tone: data.summary.newVersionAvailable ? 'warning' : 'info'
    }
  ] as const;

  return (
    <div className="avel-dashboard-page avel-settings-admin-page">
      <PageContainer
        title="Settings Administration"
        subtitle="Modern overview for the configuration hub. Detail edits still route to the legacy forms."
        actions={(
          <>
            <a className="modern-btn modern-btn--secondary" href={dashboardURL}>
              Back To Dashboard
            </a>
            <a className="modern-btn modern-btn--secondary" href={legacyURL}>
              Open Legacy UI
            </a>
          </>
        )}
      >
        <div className="modern-dashboard avel-dashboard-shell">
          {data.flash?.message ? (
            <section className={`avel-settings-admin-flash ${flashTone}`} aria-live="polite">
              <strong>{data.flash.success ? 'Saved' : 'Notice'}</strong>
              <span>{data.flash.message}</span>
            </section>
          ) : null}

          <section className="avel-settings-admin-summary">
            {summaryCards.map((card) => (
              <article key={card.label} className={`avel-settings-admin-summary-card is-${card.tone}`}>
                <span className="avel-settings-admin-summary-label">{card.label}</span>
                <strong className="avel-settings-admin-summary-value">{card.value}</strong>
                <span className="avel-settings-admin-summary-note">{card.note}</span>
              </article>
            ))}
          </section>

          {data.sections.map((section) => (
            <section className="avel-list-panel" key={section.key}>
              <div className="avel-list-panel__header">
                <h2 className="avel-list-panel__title">{section.title}</h2>
                <p className="avel-list-panel__hint">{section.description}</p>
              </div>

              <div className="avel-settings-admin-links">
                {section.items.map((item) => {
                  const href = item.external ? item.href : ensureUIURL(item.href, 'legacy');
                  return (
                    <a
                      key={`${section.key}:${item.label}`}
                      className={`avel-settings-admin-link${item.highlight ? ' is-highlighted' : ''}`}
                      href={href}
                      target={item.external ? '_blank' : undefined}
                      rel={item.external ? 'noreferrer' : undefined}
                    >
                      <span className="avel-settings-admin-link__label-row">
                        <span className="avel-settings-admin-link__label">{item.label}</span>
                        {item.badge ? <span className="avel-settings-admin-link__badge">{item.badge}</span> : null}
                      </span>
                      <span className="avel-settings-admin-link__description">{item.description}</span>
                    </a>
                  );
                })}
              </div>
            </section>
          ))}

          <section className="avel-list-panel">
            <div className="avel-list-panel__header">
              <h2 className="avel-list-panel__title">Legacy Workspace</h2>
              <p className="avel-list-panel__hint">
                Use the embedded legacy workspace for edit-heavy subpages and submit flows.
              </p>
            </div>
            <div className="modern-compat-page__actions">
              <a className="modern-btn modern-btn--secondary" href={backLink.href}>
                {backLink.label}
              </a>
              <a className="modern-btn modern-btn--secondary" href={legacyURL} target="_blank" rel="noreferrer">
                Open In New Tab
              </a>
              <a className="modern-btn modern-btn--secondary" href={legacyURL}>
                Open Legacy UI
              </a>
            </div>
          </section>
        </div>
      </PageContainer>
    </div>
  );
}

function toLowerText(value: unknown): string {
  return String(value || '').trim().toLowerCase();
}

function buildRouteKey(bootstrap: UIModeBootstrap): string {
  return `${toLowerText(bootstrap.targetModule)}.${toLowerText(bootstrap.targetAction)}`;
}

function resolveBackLink(routeKey: string, bootstrap: UIModeBootstrap): BackLink {
  if (routeKey === 'settings.administration') {
    return {
      label: 'Back To Dashboard',
      href: ensureModernUIURL(`${bootstrap.indexName}?m=dashboard&a=my`)
    };
  }

  return {
    label: 'Back To Settings',
    href: ensureModernUIURL(`${bootstrap.indexName}?m=settings&a=administration`)
  };
}

export function SettingsAdminWorkspaceActionPage({ bootstrap }: Props) {
  const routeKey = useMemo(() => buildRouteKey(bootstrap), [bootstrap]);
  const copy = useMemo(() => COPY_BY_ROUTE_KEY[routeKey] || FALLBACK_COPY, [routeKey]);
  const backLink = useMemo(() => resolveBackLink(routeKey, bootstrap), [routeKey, bootstrap]);
  const legacyURL = useMemo(() => ensureUIURL(bootstrap.legacyURL, 'legacy'), [bootstrap.legacyURL]);
  const embeddedURL = useMemo(() => buildEmbeddedLegacyURL(legacyURL), [legacyURL]);
  const isNativeAdministrationRoute = routeKey === 'settings.administration' && String(new URLSearchParams(window.location.search).get('s') || '').trim() === '';
  const [nativeData, setNativeData] = useState<SettingsAdministrationModernDataResponse | null>(null);
  const [nativeError, setNativeError] = useState('');
  const [nativeLoading, setNativeLoading] = useState(isNativeAdministrationRoute);
  const [reloadToken, setReloadToken] = useState(0);
  const loadRequestRef = useRef(0);
  const { frameReloadToken, frameLoading, reloadFrame, handleFrameLoad } = useEmbeddedLegacyFrame();
  const refreshNativeAdministration = useCallback(() => {
    if (!isNativeAdministrationRoute) {
      return;
    }
    setReloadToken((current) => current + 1);
  }, [isNativeAdministrationRoute]);

  usePageRefreshEvents(refreshNativeAdministration);

  useEffect(() => {
    if (!isNativeAdministrationRoute) {
      setNativeData(null);
      setNativeError('');
      setNativeLoading(false);
      return;
    }

    let isMounted = true;
    const requestID = loadRequestRef.current + 1;
    loadRequestRef.current = requestID;
    setNativeLoading(true);
    setNativeError('');

    const query = new URLSearchParams(window.location.search);
    fetchSettingsAdministrationModernData(bootstrap, query)
      .then((result) => {
        if (!isMounted || requestID !== loadRequestRef.current) {
          return;
        }
        setNativeData(result);
      })
      .catch((error: Error) => {
        if (!isMounted || requestID !== loadRequestRef.current) {
          return;
        }
        setNativeError(error.message || 'Unable to load settings administration.');
        setNativeData(null);
      })
      .finally(() => {
        if (isMounted && requestID === loadRequestRef.current) {
          setNativeLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [bootstrap, isNativeAdministrationRoute, reloadToken]);

  if (isNativeAdministrationRoute && nativeLoading && !nativeData) {
    return <div className="modern-state">Loading settings administration...</div>;
  }

  if (isNativeAdministrationRoute && nativeData && nativeError === '') {
    return (
      <SettingsAdministrationNativeShell
        data={nativeData}
        legacyURL={legacyURL}
        backLink={backLink}
      />
    );
  }

  return (
    <div className="avel-dashboard-page">
      <PageContainer
        title={copy.title}
        subtitle={copy.subtitle}
        actions={(
          <>
            <a className="modern-btn modern-btn--secondary" href={backLink.href}>
              {backLink.label}
            </a>
            <a className="modern-btn modern-btn--secondary" href={legacyURL}>
              Open Legacy UI
            </a>
          </>
        )}
      >
        <div className="modern-dashboard avel-dashboard-shell">
          <section className="modern-compat-page">
            <header className="modern-compat-page__header">
              <div>
                <h2 className="modern-compat-page__title">{copy.panelTitle}</h2>
                <p className="modern-compat-page__subtitle">{copy.panelSubtitle}</p>
              </div>
              <div className="modern-compat-page__meta">ui_embed=1</div>
            </header>

            <div className="modern-compat-page__actions">
              <a className="modern-btn modern-btn--secondary" href={backLink.href}>
                {backLink.label}
              </a>
              <button type="button" className="modern-btn modern-btn--secondary" onClick={reloadFrame}>
                Reload
              </button>
              <a className="modern-btn modern-btn--secondary" href={legacyURL} target="_blank" rel="noreferrer">
                Open In New Tab
              </a>
              <a className="modern-btn modern-btn--secondary" href={legacyURL}>
                Open Legacy UI
              </a>
            </div>

            <div className={`modern-compat-page__frame-wrap${frameLoading ? ' is-loading' : ''}`}>
              {frameLoading ? (
                <div className="modern-compat-page__frame-loader" aria-live="polite">
                  Loading legacy workspace...
                </div>
              ) : null}
              <iframe
                key={frameReloadToken}
                title={`${copy.title} legacy workspace`}
                className={`modern-compat-page__frame${frameLoading ? ' is-loading' : ''}`}
                src={embeddedURL}
                onLoad={handleFrameLoad}
              />
            </div>
          </section>
        </div>
      </PageContainer>
    </div>
  );
}
