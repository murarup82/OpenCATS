import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { buildEmbeddedLegacyURL } from '../lib/embeddedLegacy';
import { ensureModernUIURL, ensureUIURL } from '../lib/navigation';
import {
  fetchSettingsMyProfileChangePasswordModernData,
  fetchSettingsAdministrationModernData,
  fetchSettingsMyProfileModernData
} from '../lib/api';
import { usePageRefreshEvents } from '../lib/usePageRefreshEvents';
import { useEmbeddedLegacyFrame } from '../lib/useEmbeddedLegacyFrame';
import type {
  SettingsAdministrationModernDataResponse,
  SettingsMyProfileChangePasswordModernDataResponse,
  SettingsMyProfileModernDataResponse,
  UIModeBootstrap
} from '../types';
import '../dashboard-avel.css';

type Props = {
  bootstrap: UIModeBootstrap;
};

type PageCopy = {
  title: string;
  subtitle: string;
  panelTitle: string;
  panelSubtitle: string;
  mode: 'embed' | 'forward';
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
    panelSubtitle: 'Legacy settings administration remains embedded while modernization continues.',
    mode: 'embed'
  },
  'settings.manageusers': {
    title: 'Manage Users',
    subtitle: 'Review and manage user access in compatibility mode.',
    panelTitle: 'User Management Workspace',
    panelSubtitle: 'Legacy user-management workflow remains available while modernization continues.',
    mode: 'forward'
  },
  'settings.adduser': {
    title: 'Add User',
    subtitle: 'Create a user account in compatibility mode.',
    panelTitle: 'Add User Workspace',
    panelSubtitle: 'Legacy user-creation workflow remains available while modernization continues.',
    mode: 'forward'
  },
  'settings.edituser': {
    title: 'Edit User',
    subtitle: 'Edit user profile and permissions in compatibility mode.',
    panelTitle: 'Edit User Workspace',
    panelSubtitle: 'Legacy user-edit workflow remains available while modernization continues.',
    mode: 'forward'
  },
  'settings.showuser': {
    title: 'User Profile',
    subtitle: 'Review user account details in compatibility mode.',
    panelTitle: 'User Profile Workspace',
    panelSubtitle: 'Legacy user-profile workflow remains available while modernization continues.',
    mode: 'forward'
  },
  'settings.deleteuser': {
    title: 'Delete User',
    subtitle: 'Remove user accounts in compatibility mode.',
    panelTitle: 'Delete User Workspace',
    panelSubtitle: 'Legacy user-deletion workflow remains available while modernization continues.',
    mode: 'forward'
  },
  'settings.emailtemplates': {
    title: 'Email Templates',
    subtitle: 'Manage email templates in compatibility mode.',
    panelTitle: 'Email Templates Workspace',
    panelSubtitle: 'Legacy email-template workflow remains available while modernization continues.',
    mode: 'forward'
  },
  'settings.addemailtemplate': {
    title: 'Add Email Template',
    subtitle: 'Create an email template in compatibility mode.',
    panelTitle: 'Add Email Template Workspace',
    panelSubtitle: 'Legacy email-template creation remains available while modernization continues.',
    mode: 'forward'
  },
  'settings.deleteemailtemplate': {
    title: 'Delete Email Template',
    subtitle: 'Remove an email template in compatibility mode.',
    panelTitle: 'Delete Email Template Workspace',
    panelSubtitle: 'Legacy email-template deletion remains available while modernization continues.',
    mode: 'forward'
  },
  'settings.loginactivity': {
    title: 'Login Activity',
    subtitle: 'Review user login activity in compatibility mode.',
    panelTitle: 'Login Activity Workspace',
    panelSubtitle: 'Legacy login-activity view remains embedded while modernization continues.',
    mode: 'embed'
  },
  'settings.myprofile': {
    title: 'My Profile',
    subtitle: 'Manage profile settings in compatibility mode.',
    panelTitle: 'My Profile Workspace',
    panelSubtitle: 'Legacy profile-management workflow remains embedded while modernization continues.',
    mode: 'embed'
  },
  'settings.changepassword': {
    title: 'Change Password',
    subtitle: 'Update password settings in compatibility mode.',
    panelTitle: 'Change Password Workspace',
    panelSubtitle: 'Legacy password workflow remains embedded while modernization continues.',
    mode: 'embed'
  },
  'settings.myprofile.changepassword': {
    title: 'Change Password',
    subtitle: 'Update password settings in native mode.',
    panelTitle: 'Change Password Workspace',
    panelSubtitle: 'Legacy password workflow remains available while the native card remains focused on the form.',
    mode: 'embed'
  },
  'settings.gdprsettings': {
    title: 'GDPR Settings',
    subtitle: 'Configure GDPR settings in compatibility mode.',
    panelTitle: 'GDPR Settings Workspace',
    panelSubtitle: 'Legacy GDPR settings workflow remains embedded while modernization continues.',
    mode: 'embed'
  },
  'settings.rejectionreasons': {
    title: 'Rejection Reasons',
    subtitle: 'Manage rejection reason lists in compatibility mode.',
    panelTitle: 'Rejection Reasons Workspace',
    panelSubtitle: 'Legacy rejection-reason workflow remains embedded while modernization continues.',
    mode: 'embed'
  },
  'settings.tags': {
    title: 'Tags',
    subtitle: 'Manage settings tags in compatibility mode.',
    panelTitle: 'Tags Workspace',
    panelSubtitle: 'Legacy tags workflow remains embedded while modernization continues.',
    mode: 'embed'
  },
  'settings.viewitemhistory': {
    title: 'Item History',
    subtitle: 'Review configuration item history in compatibility mode.',
    panelTitle: 'Item History Workspace',
    panelSubtitle: 'Legacy item-history workflow remains embedded while modernization continues.',
    mode: 'embed'
  },
  'settings.emailsettings': {
    title: 'Email Settings',
    subtitle: 'Configure email delivery settings in compatibility mode.',
    panelTitle: 'Email Settings Workspace',
    panelSubtitle: 'Legacy email-settings workflow remains embedded while modernization continues.',
    mode: 'embed'
  },
  'settings.feedbacksettings': {
    title: 'Feedback Settings',
    subtitle: 'Configure feedback settings in compatibility mode.',
    panelTitle: 'Feedback Settings Workspace',
    panelSubtitle: 'Legacy feedback-settings workflow remains embedded while modernization continues.',
    mode: 'embed'
  },
  'settings.forceemail': {
    title: 'Force Email',
    subtitle: 'Run force-email operations in compatibility mode.',
    panelTitle: 'Force Email Workspace',
    panelSubtitle: 'Legacy force-email workflow remains embedded while modernization continues.',
    mode: 'embed'
  },
  'settings.googleoidcsettings': {
    title: 'Google OIDC Settings',
    subtitle: 'Configure Google OIDC authentication settings in compatibility mode.',
    panelTitle: 'Google OIDC Workspace',
    panelSubtitle: 'Legacy Google OIDC workflow remains embedded while modernization continues.',
    mode: 'embed'
  },
  'settings.asplocalization': {
    title: 'ASP Localization',
    subtitle: 'Manage localization settings in compatibility mode.',
    panelTitle: 'Localization Workspace',
    panelSubtitle: 'Legacy localization workflow remains embedded while modernization continues.',
    mode: 'embed'
  },
  'settings.careerportalquestionnaire': {
    title: 'Career Portal Questionnaire',
    subtitle: 'Configure career portal questionnaire settings in compatibility mode.',
    panelTitle: 'Career Portal Questionnaire Workspace',
    panelSubtitle: 'Legacy career portal questionnaire workflow remains embedded while modernization continues.',
    mode: 'embed'
  },
  'settings.careerportalquestionnairepreview': {
    title: 'Career Portal Questionnaire Preview',
    subtitle: 'Preview the career portal questionnaire in compatibility mode.',
    panelTitle: 'Questionnaire Preview Workspace',
    panelSubtitle: 'Legacy questionnaire preview workflow remains embedded while modernization continues.',
    mode: 'embed'
  },
  'settings.careerportalquestionnaireupdate': {
    title: 'Career Portal Questionnaire Update',
    subtitle: 'Apply questionnaire updates in compatibility mode.',
    panelTitle: 'Questionnaire Update Workspace',
    panelSubtitle: 'Legacy questionnaire update workflow remains embedded while modernization continues.',
    mode: 'embed'
  },
  'settings.careerportalsettings': {
    title: 'Career Portal Settings',
    subtitle: 'Configure career portal behavior in compatibility mode.',
    panelTitle: 'Career Portal Settings Workspace',
    panelSubtitle: 'Legacy career portal settings workflow remains embedded while modernization continues.',
    mode: 'embed'
  },
  'settings.careerportaltemplateedit': {
    title: 'Career Portal Template',
    subtitle: 'Edit career portal templates in compatibility mode.',
    panelTitle: 'Career Portal Template Workspace',
    panelSubtitle: 'Legacy template-edit workflow remains embedded while modernization continues.',
    mode: 'embed'
  },
  'settings.createbackup': {
    title: 'Create Backup',
    subtitle: 'Create system backups in compatibility mode.',
    panelTitle: 'Backup Creation Workspace',
    panelSubtitle: 'Legacy backup creation workflow remains embedded while modernization continues.',
    mode: 'embed'
  },
  'settings.customizecalendar': {
    title: 'Customize Calendar',
    subtitle: 'Configure calendar preferences in compatibility mode.',
    panelTitle: 'Calendar Customization Workspace',
    panelSubtitle: 'Legacy calendar customization workflow remains embedded while modernization continues.',
    mode: 'embed'
  },
  'settings.customizeextrafields': {
    title: 'Customize Extra Fields',
    subtitle: 'Configure extra field definitions in compatibility mode.',
    panelTitle: 'Extra Fields Workspace',
    panelSubtitle: 'Legacy extra-field customization workflow remains embedded while modernization continues.',
    mode: 'embed'
  },
  'settings.deletebackup': {
    title: 'Delete Backup',
    subtitle: 'Remove backup files in compatibility mode.',
    panelTitle: 'Backup Deletion Workspace',
    panelSubtitle: 'Legacy backup deletion workflow remains embedded while modernization continues.',
    mode: 'embed'
  },
  'settings.eeo': {
    title: 'EEO Settings',
    subtitle: 'Manage EEO configuration in compatibility mode.',
    panelTitle: 'EEO Workspace',
    panelSubtitle: 'Legacy EEO settings workflow remains embedded while modernization continues.',
    mode: 'embed'
  },
  'settings.newinstallfinished': {
    title: 'New Install Finished',
    subtitle: 'Complete installation finalization steps in compatibility mode.',
    panelTitle: 'Install Finalization Workspace',
    panelSubtitle: 'Legacy installation finalization workflow remains embedded while modernization continues.',
    mode: 'embed'
  },
  'settings.newinstallpassword': {
    title: 'New Install Password',
    subtitle: 'Set installation password details in compatibility mode.',
    panelTitle: 'Install Password Workspace',
    panelSubtitle: 'Legacy install-password workflow remains embedded while modernization continues.',
    mode: 'embed'
  },
  'settings.newsitename': {
    title: 'New Site Name',
    subtitle: 'Configure site naming during setup in compatibility mode.',
    panelTitle: 'Site Name Workspace',
    panelSubtitle: 'Legacy site-name workflow remains embedded while modernization continues.',
    mode: 'embed'
  },
  'settings.oncareerportaltweak': {
    title: 'Career Portal Tweak',
    subtitle: 'Apply career portal tweak operations in compatibility mode.',
    panelTitle: 'Career Portal Tweak Workspace',
    panelSubtitle: 'Legacy career portal tweak workflow remains embedded while modernization continues.',
    mode: 'embed'
  },
  'settings.professional': {
    title: 'Professional Settings',
    subtitle: 'Manage professional package settings in compatibility mode.',
    panelTitle: 'Professional Settings Workspace',
    panelSubtitle: 'Legacy professional settings workflow remains embedded while modernization continues.',
    mode: 'embed'
  },
  'settings.rolepagepermissions': {
    title: 'Role Page Permissions',
    subtitle: 'Configure role-to-page permissions in compatibility mode.',
    panelTitle: 'Role Permissions Workspace',
    panelSubtitle: 'Legacy role-permissions workflow remains embedded while modernization continues.',
    mode: 'embed'
  },
  'settings.schemamigrations': {
    title: 'Schema Migrations',
    subtitle: 'Review and run schema migrations in compatibility mode.',
    panelTitle: 'Schema Migrations Workspace',
    panelSubtitle: 'Legacy schema-migration workflow remains embedded while modernization continues.',
    mode: 'embed'
  },
  'settings.talentfitflowsettings': {
    title: 'Talent Fit Flow Settings',
    subtitle: 'Configure Talent Fit Flow behavior in compatibility mode.',
    panelTitle: 'Talent Fit Flow Workspace',
    panelSubtitle: 'Legacy Talent Fit Flow settings workflow remains embedded while modernization continues.',
    mode: 'embed'
  },
  'settings.upgradesitename': {
    title: 'Upgrade Site Name',
    subtitle: 'Apply site-name upgrade changes in compatibility mode.',
    panelTitle: 'Upgrade Site Name Workspace',
    panelSubtitle: 'Legacy site-name upgrade workflow remains embedded while modernization continues.',
    mode: 'embed'
  }
};

const FALLBACK_COPY: PageCopy = {
  title: 'Settings Workspace',
  subtitle: 'Manage system settings through the embedded compatibility workspace.',
  panelTitle: 'Settings Compatibility Workspace',
  panelSubtitle: 'Legacy settings workflow is embedded while modernization continues.',
  mode: 'embed'
};

type NativeSettingsRouteMode = 'administration' | 'myprofile' | 'changePassword' | 'fallback';

function toBooleanLabel(value: boolean, onLabel: string, offLabel: string): string {
  return value ? onLabel : offLabel;
}

type SettingsSummaryCard = {
  label: string;
  value: string;
  note: string;
  tone: 'info' | 'success' | 'warning';
};

function buildSettingsProfileSummaryCards(summary: {
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

function getRequestedSubpage(): string {
  return toLowerText(new URLSearchParams(window.location.search).get('s'));
}

function buildNativeRouteMode(routeKey: string, requestedSubpage: string): NativeSettingsRouteMode {
  if (routeKey === 'settings.administration' && requestedSubpage === '') {
    return 'administration';
  }

  if (routeKey === 'settings.myprofile' && requestedSubpage === 'changepassword') {
    return 'changePassword';
  }

  if (routeKey === 'settings.myprofile' && requestedSubpage === '') {
    return 'myprofile';
  }

  return 'fallback';
}

function buildCopyKey(routeKey: string, nativeRouteMode: NativeSettingsRouteMode): string {
  if (nativeRouteMode === 'changePassword') {
    return 'settings.myprofile.changepassword';
  }

  return routeKey;
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

function SettingsMyProfileNativeShell({
  data
}: {
  data: SettingsMyProfileModernDataResponse;
}) {
  const changePasswordURL = ensureModernUIURL(data.actions.changePasswordURL);
  const showProfileURL = ensureUIURL(data.actions.showProfileURL, 'legacy');
  const legacyURL = ensureUIURL(data.actions.legacyURL, 'legacy');
  const summaryCards = buildSettingsProfileSummaryCards(data.summary);

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
            {summaryCards.map((card) => (
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

          <section className="avel-list-panel">
            <div className="avel-list-panel__header">
              <h2 className="avel-list-panel__title">Legacy Workspace</h2>
              <p className="avel-list-panel__hint">
                Legacy profile navigation remains available without affecting the modern shell.
              </p>
            </div>
            <div className="modern-compat-page__actions">
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

function SettingsChangePasswordNativeShell({
  data
}: {
  data: SettingsMyProfileChangePasswordModernDataResponse;
}) {
  const backURL = ensureModernUIURL(data.actions.backURL);
  const legacyURL = ensureUIURL(data.actions.legacyURL, 'legacy');
  const summaryCards = buildSettingsProfileSummaryCards(data.summary);

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

          {toLowerText(data.summary.authMode) === 'ldap' ? (
            <section className="avel-settings-admin-flash is-warning" aria-live="polite">
              <strong>LDAP Enabled</strong>
              <span>Password changes remain managed outside OpenCATS.</span>
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

function SettingsForwardPanel({
  copy,
  backLink,
  legacyURL
}: {
  copy: PageCopy;
  backLink: BackLink;
  legacyURL: string;
}) {
  const canContinue = legacyURL !== '';

  useEffect(() => {
    if (!canContinue) {
      return;
    }

    const timer = window.setTimeout(() => {
      window.location.assign(legacyURL);
    }, 500);

    return () => window.clearTimeout(timer);
  }, [canContinue, legacyURL]);

  return (
    <div className="modern-dashboard avel-dashboard-shell">
      <section className="modern-compat-page modern-compat-page--forward">
        <header className="modern-compat-page__header">
          <div>
            <h2 className="modern-compat-page__title">{copy.panelTitle}</h2>
            <p className="modern-compat-page__subtitle">{copy.panelSubtitle}</p>
          </div>
          <div className="modern-compat-page__meta">legacy_forward=1</div>
        </header>

        <div className="modern-compat-page__actions">
          <a className="modern-btn modern-btn--secondary" href={backLink.href}>
            {backLink.label}
          </a>
          {canContinue ? (
            <>
              <a className="modern-btn modern-btn--secondary" href={legacyURL}>
                Continue to Legacy UI
              </a>
              <a className="modern-btn modern-btn--secondary" href={legacyURL} target="_blank" rel="noreferrer">
                Open In New Tab
              </a>
              <a className="modern-btn modern-btn--secondary" href={legacyURL}>
                Open Legacy UI
              </a>
            </>
          ) : null}
        </div>

        <section className="avel-list-panel">
          <div className={`modern-state${canContinue ? '' : ' modern-state--error'}`} aria-live="polite">
            {canContinue
              ? 'Preparing legacy settings redirect...'
              : 'Legacy settings URL is unavailable for this route.'}
          </div>
          {canContinue ? (
            <p className="reports-workflow-forward__note">
              The redirect keeps the legacy settings workflow available while the native shell finishes loading.
            </p>
          ) : null}
        </section>
      </section>
    </div>
  );
}

export function SettingsAdminWorkspaceActionPage({ bootstrap }: Props) {
  const routeKey = useMemo(() => buildRouteKey(bootstrap), [bootstrap]);
  const requestedSubpage = useMemo(() => getRequestedSubpage(), []);
  const nativeRouteMode = useMemo(() => buildNativeRouteMode(routeKey, requestedSubpage), [routeKey, requestedSubpage]);
  const copyKey = useMemo(() => buildCopyKey(routeKey, nativeRouteMode), [routeKey, nativeRouteMode]);
  const copy = useMemo(() => COPY_BY_ROUTE_KEY[copyKey] || FALLBACK_COPY, [copyKey]);
  const backLink = useMemo(() => resolveBackLink(routeKey, bootstrap), [routeKey, bootstrap]);
  const legacyURL = useMemo(() => ensureUIURL(bootstrap.legacyURL, 'legacy'), [bootstrap.legacyURL]);
  const embeddedURL = useMemo(() => buildEmbeddedLegacyURL(legacyURL), [legacyURL]);
  const isForwardRoute = copy.mode === 'forward';
  const isNativeRoute = nativeRouteMode !== 'fallback';
  const [nativeData, setNativeData] = useState<
    SettingsAdministrationModernDataResponse | SettingsMyProfileModernDataResponse | SettingsMyProfileChangePasswordModernDataResponse | null
  >(null);
  const [nativeError, setNativeError] = useState('');
  const [nativeLoading, setNativeLoading] = useState(isNativeRoute);
  const [reloadToken, setReloadToken] = useState(0);
  const loadRequestRef = useRef(0);
  const { frameReloadToken, frameLoading, reloadFrame, handleFrameLoad } = useEmbeddedLegacyFrame();
  const refreshNativeRoute = useCallback(() => {
    if (!isNativeRoute) {
      return;
    }
    setReloadToken((current) => current + 1);
  }, [isNativeRoute]);

  usePageRefreshEvents(refreshNativeRoute);

  useEffect(() => {
    if (!isNativeRoute) {
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
    const loadNativeData = async () => {
      switch (nativeRouteMode)
      {
        case 'administration':
          return fetchSettingsAdministrationModernData(bootstrap, query);
        case 'myprofile':
          return fetchSettingsMyProfileModernData(bootstrap, query);
        case 'changePassword':
          return fetchSettingsMyProfileChangePasswordModernData(bootstrap, query);
        default:
          throw new Error('Unsupported settings native route.');
      }
    };

    void loadNativeData()
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
        setNativeError(error.message || 'Unable to load settings workspace.');
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
  }, [bootstrap, nativeRouteMode, isNativeRoute, reloadToken]);

  if (isNativeRoute && nativeLoading && !nativeData) {
    return <div className="modern-state">Loading settings workspace...</div>;
  }

  if (isNativeRoute && nativeData && nativeError === '') {
    if (nativeRouteMode === 'administration') {
      return (
        <SettingsAdministrationNativeShell
          data={nativeData as SettingsAdministrationModernDataResponse}
          legacyURL={legacyURL}
          backLink={backLink}
        />
      );
    }

    if (nativeRouteMode === 'myprofile') {
      return <SettingsMyProfileNativeShell data={nativeData as SettingsMyProfileModernDataResponse} />;
    }

    if (nativeRouteMode === 'changePassword') {
      return (
        <SettingsChangePasswordNativeShell
          data={nativeData as SettingsMyProfileChangePasswordModernDataResponse}
        />
      );
    }
  }

  if (nativeError !== '') {
    // Fall back to the embedded legacy workspace if the native contract cannot load.
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

  if (isForwardRoute) {
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
          <SettingsForwardPanel copy={copy} backLink={backLink} legacyURL={legacyURL} />
        </PageContainer>
      </div>
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
