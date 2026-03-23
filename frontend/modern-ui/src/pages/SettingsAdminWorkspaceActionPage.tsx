import { useMemo } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { buildEmbeddedLegacyURL } from '../lib/embeddedLegacy';
import { ensureModernUIURL, ensureUIURL } from '../lib/navigation';
import { useEmbeddedLegacyFrame } from '../lib/useEmbeddedLegacyFrame';
import type { UIModeBootstrap } from '../types';
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
  }
};

const FALLBACK_COPY: PageCopy = {
  title: 'Settings Workspace',
  subtitle: 'Manage system settings through the embedded compatibility workspace.',
  panelTitle: 'Settings Compatibility Workspace',
  panelSubtitle: 'Legacy settings workflow is embedded while modernization continues.'
};

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
  const { frameReloadToken, frameLoading, reloadFrame, handleFrameLoad } = useEmbeddedLegacyFrame();

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
