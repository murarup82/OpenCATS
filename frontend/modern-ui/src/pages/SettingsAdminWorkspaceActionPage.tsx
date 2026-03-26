import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { buildEmbeddedLegacyURL } from '../lib/embeddedLegacy';
import { ensureModernUIURL, ensureUIURL } from '../lib/navigation';
import {
  fetchSettingsLoginActivityModernData,
  fetchSettingsManageUsersModernData,
  fetchSettingsAddUserModernData,
  fetchSettingsEditUserModernData,
  fetchSettingsShowUserModernData,
  fetchSettingsGdprSettingsModernData,
  fetchSettingsRejectionReasonsModernData,
  fetchSettingsRolePagePermissionsModernData,
  fetchSettingsSchemaMigrationsModernData,
  fetchSettingsMyProfileChangePasswordModernData,
  fetchSettingsAdministrationModernData,
  fetchSettingsMyProfileModernData,
  fetchSettingsTagsModernData,
  fetchSettingsViewItemHistoryModernData,
  updateSettingsGdprSettings
} from '../lib/api';
import * as settingsApi from '../lib/api';
import { usePageRefreshEvents } from '../lib/usePageRefreshEvents';
import { useEmbeddedLegacyFrame } from '../lib/useEmbeddedLegacyFrame';
import type {
  ModernMutationResponse,
  SettingsAdministrationModernDataResponse,
  SettingsManageUsersModernDataResponse,
  SettingsAddUserModernDataResponse,
  SettingsEditUserModernDataResponse,
  SettingsShowUserModernDataResponse,
  SettingsLoginActivityModernDataResponse,
  SettingsRejectionReasonsModernDataResponse,
  SettingsRolePagePermissionsModernDataResponse,
  SettingsSchemaMigrationsModernDataResponse,
  SettingsTagsModernDataResponse,
  SettingsMyProfileChangePasswordModernDataResponse,
  SettingsMyProfileModernDataResponse,
  SettingsViewItemHistoryModernDataResponse,
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
    subtitle: 'Review and manage user access in the native settings shell.',
    panelTitle: 'User Management Workspace',
    panelSubtitle: 'Native user-management list keeps add/edit/profile actions available.',
    mode: 'embed'
  },
  'settings.adduser': {
    title: 'Add User',
    subtitle: 'Create a user account in the native settings shell.',
    panelTitle: 'Add User Workspace',
    panelSubtitle: 'Native user-creation form preserves the legacy submit payload.',
    mode: 'embed'
  },
  'settings.edituser': {
    title: 'Edit User',
    subtitle: 'Edit user profile and permissions in the native settings shell.',
    panelTitle: 'Edit User Workspace',
    panelSubtitle: 'Native user-edit form keeps legacy fields, IDs, and tokens intact.',
    mode: 'embed'
  },
  'settings.showuser': {
    title: 'User Profile',
    subtitle: 'Review user account details in the native settings shell.',
    panelTitle: 'User Profile Workspace',
    panelSubtitle: 'Native user profile view keeps legacy navigation and edit actions available.',
    mode: 'embed'
  },
  'settings.deleteuser': {
    title: 'Delete User',
    subtitle: 'Remove user accounts in the native settings shell.',
    panelTitle: 'Delete User Workspace',
    panelSubtitle: 'Native user-deletion action keeps the legacy escape path available.',
    mode: 'embed'
  },
  'settings.emailtemplates': {
    title: 'Email Templates',
    subtitle: 'Manage email templates in the native settings shell.',
    panelTitle: 'Email Templates Workspace',
    panelSubtitle: 'Native template editor keeps legacy submit field compatibility.',
    mode: 'embed'
  },
  'settings.addemailtemplate': {
    title: 'Add Email Template',
    subtitle: 'Create an email template in the native settings shell.',
    panelTitle: 'Add Email Template Workspace',
    panelSubtitle: 'Native add-template action updates the workspace without legacy forwarding.',
    mode: 'embed'
  },
  'settings.deleteemailtemplate': {
    title: 'Delete Email Template',
    subtitle: 'Remove an email template in the native settings shell.',
    panelTitle: 'Delete Email Template Workspace',
    panelSubtitle: 'Native delete-template action updates the workspace without legacy forwarding.',
    mode: 'embed'
  },
  'settings.loginactivity': {
    title: 'Login Activity',
    subtitle: 'Review recent successful and unsuccessful login attempts.',
    panelTitle: 'Login Activity Workspace',
    panelSubtitle: 'Native login-activity view keeps sorting and paging while preserving legacy actions.',
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
    subtitle: 'Configure GDPR consent defaults in the native settings shell.',
    panelTitle: 'GDPR Settings Workspace',
    panelSubtitle: 'Native GDPR settings preserves the legacy submit payload and fallback links.',
    mode: 'embed'
  },
  'settings.rejectionreasons': {
    title: 'Rejection Reasons',
    subtitle: 'Manage rejection reason labels used in pipeline workflows.',
    panelTitle: 'Rejection Reasons Workspace',
    panelSubtitle: 'Native rejection-reason editing keeps legacy submit payloads unchanged.',
    mode: 'embed'
  },
  'settings.tags': {
    title: 'Tags',
    subtitle: 'Manage parent and child tags used across candidate workflows.',
    panelTitle: 'Tags Workspace',
    panelSubtitle: 'Native tags management calls the existing legacy AJAX endpoints.',
    mode: 'embed'
  },
  'settings.viewitemhistory': {
    title: 'Item History',
    subtitle: 'Review revision history for candidates, job orders, companies, and contacts.',
    panelTitle: 'Item History Workspace',
    panelSubtitle: 'Native history timeline mirrors legacy revision data while preserving fallback access.',
    mode: 'embed'
  },
  'settings.emailsettings': {
    title: 'Email Settings',
    subtitle: 'Configure email delivery settings in the native settings shell.',
    panelTitle: 'Email Settings Workspace',
    panelSubtitle: 'Native email settings preserve the legacy field names and submit path.',
    mode: 'embed'
  },
  'settings.feedbacksettings': {
    title: 'Feedback Settings',
    subtitle: 'Configure feedback settings in the native settings shell.',
    panelTitle: 'Feedback Settings Workspace',
    panelSubtitle: 'Native feedback settings preserve the legacy recipient selector and submit path.',
    mode: 'embed'
  },
  'settings.forceemail': {
    title: 'Force Email',
    subtitle: 'Update the current account e-mail address in the native settings shell.',
    panelTitle: 'Force Email Workspace',
    panelSubtitle: 'Native force-email action preserves the legacy field name and submit path.',
    mode: 'embed'
  },
  'settings.googleoidcsettings': {
    title: 'Google OIDC Settings',
    subtitle: 'Configure Google OIDC authentication settings in the native settings shell.',
    panelTitle: 'Google OIDC Workspace',
    panelSubtitle: 'Native Google OIDC settings preserve the legacy form fields and test action.',
    mode: 'embed'
  },
  'settings.asplocalization': {
    title: 'ASP Localization',
    subtitle: 'Manage localization settings in compatibility mode.',
    panelTitle: 'Localization Workspace',
    panelSubtitle: 'Legacy localization workflow remains available while modernization continues.',
    mode: 'forward'
  },
  'settings.careerportalquestionnaire': {
    title: 'Career Portal Questionnaire',
    subtitle: 'Manage questionnaire workflow from the native settings shell.',
    panelTitle: 'Career Portal Questionnaire Workspace',
    panelSubtitle: 'Native wrapper keeps questionnaire editing visible while the legacy form remains one click away.',
    mode: 'embed'
  },
  'settings.careerportalquestionnairepreview': {
    title: 'Career Portal Questionnaire Preview',
    subtitle: 'Preview questionnaire changes from the native settings shell.',
    panelTitle: 'Questionnaire Preview Workspace',
    panelSubtitle: 'Native wrapper keeps previewing and editing linked together without auto-forwarding.',
    mode: 'embed'
  },
  'settings.careerportalquestionnaireupdate': {
    title: 'Career Portal Questionnaire Update',
    subtitle: 'Apply questionnaire changes from the native settings shell.',
    panelTitle: 'Questionnaire Update Workspace',
    panelSubtitle: 'Native wrapper keeps the update workflow explicit while the legacy submit path remains available.',
    mode: 'embed'
  },
  'settings.careerportalsettings': {
    title: 'Career Portal Settings',
    subtitle: 'Configure career portal behavior from the native settings shell.',
    panelTitle: 'Career Portal Settings Workspace',
    panelSubtitle: 'Native wrapper keeps the portal settings visible while related editors stay a click away.',
    mode: 'embed'
  },
  'settings.careerportaltemplateedit': {
    title: 'Career Portal Template',
    subtitle: 'Edit career portal templates from the native settings shell.',
    panelTitle: 'Career Portal Template Workspace',
    panelSubtitle: 'Native wrapper keeps template editing safe while the legacy form remains available.',
    mode: 'embed'
  },
  'settings.createbackup': {
    title: 'Create Backup',
    subtitle: 'Create system backups from a native settings shell.',
    panelTitle: 'Backup Creation Workspace',
    panelSubtitle: 'Native wrapper keeps the backup runner available through an explicit legacy escape hatch.',
    mode: 'embed'
  },
  'settings.customizecalendar': {
    title: 'Customize Calendar',
    subtitle: 'Configure calendar preferences in compatibility mode.',
    panelTitle: 'Calendar Customization Workspace',
    panelSubtitle: 'Legacy calendar customization workflow remains available while modernization continues.',
    mode: 'forward'
  },
  'settings.customizeextrafields': {
    title: 'Customize Extra Fields',
    subtitle: 'Configure extra field definitions from a native settings shell.',
    panelTitle: 'Extra Fields Workspace',
    panelSubtitle: 'Native wrapper keeps the legacy field editor available through an explicit escape hatch.',
    mode: 'embed'
  },
  'settings.deletebackup': {
    title: 'Delete Backup',
    subtitle: 'Remove backup files from a native settings shell.',
    panelTitle: 'Backup Deletion Workspace',
    panelSubtitle: 'Native wrapper keeps the destructive action behind an explicit legacy confirmation path.',
    mode: 'embed'
  },
  'settings.eeo': {
    title: 'EEO Settings',
    subtitle: 'Manage EEO configuration in compatibility mode.',
    panelTitle: 'EEO Workspace',
    panelSubtitle: 'Legacy EEO settings workflow remains available while modernization continues.',
    mode: 'forward'
  },
  'settings.newinstallfinished': {
    title: 'New Install Finished',
    subtitle: 'Complete installation finalization from a native completion shell.',
    panelTitle: 'Install Finalization Workspace',
    panelSubtitle: 'Native completion shell keeps the final handoff visible without a redirect loop.',
    mode: 'embed'
  },
  'settings.newinstallpassword': {
    title: 'New Install Password',
    subtitle: 'Set installation password details in compatibility mode.',
    panelTitle: 'Install Password Workspace',
    panelSubtitle: 'Legacy install-password workflow remains available while modernization continues.',
    mode: 'forward'
  },
  'settings.newsitename': {
    title: 'New Site Name',
    subtitle: 'Configure site naming during setup in compatibility mode.',
    panelTitle: 'Site Name Workspace',
    panelSubtitle: 'Legacy site-name workflow remains available while modernization continues.',
    mode: 'forward'
  },
  'settings.oncareerportaltweak': {
    title: 'Career Portal Tweak',
    subtitle: 'Apply career portal tweak operations in compatibility mode.',
    panelTitle: 'Career Portal Tweak Workspace',
    panelSubtitle: 'Legacy career portal tweak workflow remains available while modernization continues.',
    mode: 'forward'
  },
  'settings.previewpage': {
    title: 'Career Portal Preview',
    subtitle: 'Preview career portal pages in compatibility mode.',
    panelTitle: 'Career Portal Preview Workspace',
    panelSubtitle: 'Legacy career portal preview workflow remains embedded while modernization continues.',
    mode: 'embed'
  },
  'settings.previewpagetop': {
    title: 'Career Portal Preview Frame',
    subtitle: 'Preview career portal frame in compatibility mode.',
    panelTitle: 'Career Portal Preview Frame Workspace',
    panelSubtitle: 'Legacy career portal preview frame remains embedded while modernization continues.',
    mode: 'embed'
  },
  'settings.professional': {
    title: 'Professional Settings',
    subtitle: 'Manage professional package settings in compatibility mode.',
    panelTitle: 'Professional Settings Workspace',
    panelSubtitle: 'Legacy professional settings workflow remains available while modernization continues.',
    mode: 'forward'
  },
  'settings.reports': {
    title: 'Reports Settings',
    subtitle: 'Configure report settings in compatibility mode.',
    panelTitle: 'Reports Settings Workspace',
    panelSubtitle: 'Legacy reports settings workflow remains embedded while modernization continues.',
    mode: 'embed'
  },
  'settings.rolepagepermissions': {
    title: 'Role Page Permissions',
    subtitle: 'Configure page visibility and minimum access by application role.',
    panelTitle: 'Role Permissions Workspace',
    panelSubtitle: 'Native role matrix posts the same perm[role][page] payload structure.',
    mode: 'embed'
  },
  'settings.schemamigrations': {
    title: 'Schema Migrations',
    subtitle: 'Review migration status and apply pending schema updates.',
    panelTitle: 'Schema Migrations Workspace',
    panelSubtitle: 'Native migration controls preserve legacy postback and action semantics.',
    mode: 'embed'
  },
  'settings.talentfitflowsettings': {
    title: 'Talent Fit Flow Settings',
    subtitle: 'Configure Talent Fit Flow behavior in compatibility mode.',
    panelTitle: 'Talent Fit Flow Workspace',
    panelSubtitle: 'Legacy Talent Fit Flow settings workflow remains available while modernization continues.',
    mode: 'forward'
  },
  'settings.upgradesitename': {
    title: 'Upgrade Site Name',
    subtitle: 'Apply site-name upgrade changes from a native wizard shell.',
    panelTitle: 'Upgrade Site Name Workspace',
    panelSubtitle: 'Native wizard shell preserves the existing postback and hidden-field semantics.',
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

type NativeSettingsRouteMode =
  | 'administration'
  | 'myprofile'
  | 'changePassword'
  | 'gdprSettings'
  | 'manageUsers'
  | 'addUser'
  | 'editUser'
  | 'showUser'
  | 'loginActivity'
  | 'emailTemplates'
  | 'emailSettings'
  | 'feedbackSettings'
  | 'forceEmail'
  | 'googleOIDCSettings'
  | 'deleteUser'
  | 'careerPortalSettings'
  | 'careerPortalTemplateEdit'
  | 'careerPortalQuestionnaire'
  | 'careerPortalQuestionnairePreview'
  | 'careerPortalQuestionnaireUpdate'
  | 'customizeCalendar'
  | 'eeo'
  | 'talentFitFlowSettings'
  | 'newInstallPassword'
  | 'newSiteName'
  | 'createBackup'
  | 'deleteBackup'
  | 'customizeExtraFields'
  | 'newInstallFinished'
  | 'upgradeSiteName'
  | 'rejectionReasons'
  | 'tags'
  | 'rolePagePermissions'
  | 'schemaMigrations'
  | 'viewItemHistory'
  | 'fallback';

type SettingsGdprSettingsModernData = Awaited<ReturnType<typeof fetchSettingsGdprSettingsModernData>>;

function toBooleanLabel(value: boolean, onLabel: string, offLabel: string): string {
  return value ? onLabel : offLabel;
}

function toDisplayText(value: unknown): string {
  const text = String(value ?? '').trim();
  return text === '' ? '--' : text;
}

function isTruthyText(value: unknown): boolean {
  const text = String(value ?? '').trim().toLowerCase();
  return text === '1' || text === 'true' || text === 'yes' || text === 'y';
}

function getCookieValue(cookieName: string): string {
  const normalizedName = `${cookieName}=`;
  return document.cookie
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(normalizedName))
    ?.substring(normalizedName.length) || '';
}

async function fetchHTMLDocument(url: string): Promise<Document> {
  const response = await fetch(url, {
    credentials: 'same-origin'
  });
  if (!response.ok) {
    throw new Error(`Unable to load legacy settings page (${response.status}).`);
  }

  const html = await response.text();
  const document = new DOMParser().parseFromString(html, 'text/html');
  if (document.querySelector('parsererror')) {
    throw new Error('Unable to parse legacy settings page HTML.');
  }
  return document;
}

async function submitLegacyForm(url: string, payload: URLSearchParams): Promise<Document> {
  const response = await fetch(url, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: payload.toString()
  });

  if (!response.ok) {
    throw new Error(`Request failed (${response.status}).`);
  }

  const html = await response.text();
  return new DOMParser().parseFromString(html, 'text/html');
}

function buildSettingsModernJSONURL(
  bootstrap: UIModeBootstrap,
  action: string,
  modernPage: string,
  query: Record<string, string | number | boolean | null | undefined> = {}
): string {
  const params = new URLSearchParams({
    m: 'settings',
    a: action,
    format: 'modern-json',
    modernPage,
    contractVersion: '1',
    ui: 'legacy'
  });

  Object.entries(query).forEach(([key, value]) => {
    if (value !== null && value !== undefined && String(value) !== '') {
      params.set(key, String(value));
    }
  });

  return `${bootstrap.indexName}?${params.toString()}`;
}

async function fetchSettingsModernJSON<T>(
  bootstrap: UIModeBootstrap,
  action: string,
  modernPage: string,
  query: Record<string, string | number | boolean | null | undefined> = {}
): Promise<T> {
  const response = await fetch(buildSettingsModernJSONURL(bootstrap, action, modernPage, query), {
    credentials: 'same-origin'
  });

  if (!response.ok) {
    throw new Error(`Unable to load settings workspace (${response.status}).`);
  }

  const payload = await response.json() as T;
  if (!isObjectRecord(payload) || !isObjectRecord((payload as { meta?: unknown }).meta)) {
    throw new Error('Unable to parse settings workspace JSON.');
  }

  return payload;
}

async function submitSettingsModernJSON<T>(
  bootstrap: UIModeBootstrap,
  action: string,
  modernPage: string,
  payload: URLSearchParams,
  query: Record<string, string | number | boolean | null | undefined> = {}
): Promise<T> {
  const response = await fetch(buildSettingsModernJSONURL(bootstrap, action, modernPage, query), {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: payload.toString()
  });

  if (!response.ok) {
    throw new Error(`Request failed (${response.status}).`);
  }

  return response.json() as Promise<T>;
}

function readInputValue(root: ParentNode, selector: string): string {
  const input = root.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(selector);
  if (!input) {
    return '';
  }

  if (input instanceof HTMLSelectElement) {
    return input.value || '';
  }

  return input.value || '';
}

function readCheckboxValue(root: ParentNode, selector: string): boolean {
  const input = root.querySelector<HTMLInputElement>(selector);
  return Boolean(input?.checked);
}

function readSelectOptions(root: ParentNode, selector: string): SettingsLegacySelectOption[] {
  const select = root.querySelector<HTMLSelectElement>(selector);
  if (!select) {
    return [];
  }

  return Array.from(select.options).map((option) => ({
    value: option.value,
    label: option.textContent?.trim() || option.value
  }));
}

function readSelectedOptionValue(root: ParentNode, selector: string): string {
  const select = root.querySelector<HTMLSelectElement>(selector);
  return select?.value || '';
}

function readLegacyMessage(root: ParentNode): string {
  const messageNode = root.querySelector('.noteGood, .warning, .success, .failure');
  return messageNode?.textContent?.trim() || '';
}

function hasLegacyFailure(root: ParentNode): boolean {
  return root.querySelector('.warning, .failure') !== null;
}

function getLegacyRouteURL(indexName: string, action: string): string {
  return `${indexName}?m=settings&a=${action}&ui=legacy`;
}

const EMAIL_SETTINGS_STATUS_TOGGLES = [
  { name: 'statusChangeAllocated', label: 'Status Change: Allocated' },
  { name: 'statusChangeDeliveryValidated', label: 'Status Change: Delivery Validated' },
  { name: 'statusChangeProposedToCustomer', label: 'Status Change: Proposed to Customer' },
  { name: 'statusChangeCustomerInterview', label: 'Status Change: Customer Interview' },
  { name: 'statusChangeCustomerApproved', label: 'Status Change: Customer Approved' },
  { name: 'statusChangeAvelApproved', label: 'Status Change: Avel Approved' },
  { name: 'statusChangeOfferNegotiation', label: 'Status Change: Offer Negotiation' },
  { name: 'statusChangeOfferAccepted', label: 'Status Change: Offer Accepted' },
  { name: 'statusChangeHired', label: 'Status Change: Hired' },
  { name: 'statusChangeRejected', label: 'Status Change: Rejected' }
] as const;

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

type SettingsEmailTemplateToken = {
  label: string;
  value: string;
};

type SettingsEmailTemplateMutationResponse = ModernMutationResponse & {
  templateID?: number;
};

type SettingsEmailTemplate = {
  emailTemplateID: number;
  emailTemplateTitle: string;
  emailTemplateTag: string;
  text: string;
  messageTextOrigional: string;
  disabled: boolean;
  possibleVariables: string;
  canDelete: boolean;
};

type SettingsEmailTemplatesModernDataResponse = {
  meta: {
    contractVersion: number;
    contractKey: string;
    modernPage: string;
  };
  flash?: {
    saved: boolean;
    success: boolean;
    message: string;
  };
  state: {
    noGlobalTemplates: boolean;
  };
  actions: {
    routeURL: string;
    submitURL: string;
    addTemplateURL: string;
    deleteTemplateURL: string;
    backURL: string;
    legacyURL: string;
  };
  helpers: {
    mergeFields: SettingsEmailTemplateToken[];
  };
  templates: SettingsEmailTemplate[];
};

type SettingsLegacySelectOption = {
  value: string;
  label: string;
};

type SettingsLegacyToggle = {
  name: string;
  label: string;
  checked: boolean;
};

type SettingsEmailSettingsNativeData = {
  actions: {
    submitURL: string;
    legacyURL: string;
    backURL: string;
  };
  form: {
    fromAddress: string;
    testEmailAddress: string;
    statusToggles: SettingsLegacyToggle[];
    templateToggles: Array<{
      emailTemplateID: number;
      title: string;
      checked: boolean;
    }>;
  };
  flash?: {
    success: boolean;
    message: string;
  };
};

type SettingsFeedbackSettingsNativeData = {
  actions: {
    submitURL: string;
    legacyURL: string;
    backURL: string;
  };
  form: {
    recipientUserID: string;
    recipientOptions: SettingsLegacySelectOption[];
  };
  flash?: {
    success: boolean;
    message: string;
  };
};

type SettingsGoogleOIDCSettingsNativeData = {
  actions: {
    submitURL: string;
    legacyURL: string;
    backURL: string;
  };
  form: {
    enabled: boolean;
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    hostedDomain: string;
    siteId: string;
    autoProvisionEnabled: boolean;
    notifyEmail: string;
    fromEmail: string;
    requestSubject: string;
  };
  flash?: {
    success: boolean;
    message: string;
  };
  testFeedback?: {
    success: boolean;
    message: string;
  };
};

type SettingsForceEmailNativeData = {
  actions: {
    submitURL: string;
    legacyURL: string;
    backURL: string;
  };
  form: {
    siteName: string;
  };
  flash?: {
    success: boolean;
    message: string;
  };
};

type SettingsDeleteUserNativeData = {
  actions: {
    submitURL: string;
    legacyURL: string;
    backURL: string;
  };
  state: {
    userID: number;
    requested: boolean;
    automatedTester: boolean;
  };
  flash?: {
    success: boolean;
    message: string;
  };
};

type SettingsModernJSONMeta = {
  contractVersion: number;
  contractKey: string;
  modernPage: string;
};

type SettingsModernJSONActionData = {
  submitURL?: string;
  legacyURL?: string;
  backURL?: string;
  routeURL?: string;
  testURL?: string;
};

type SettingsCustomizeCalendarModernData = {
  meta: SettingsModernJSONMeta;
  actions: SettingsModernJSONActionData & {
    submitURL: string;
    backURL: string;
    legacyURL: string;
  };
  settings: Record<string, string>;
  calendarViewOptions: SettingsLegacySelectOption[];
  hourOptions: SettingsLegacySelectOption[];
};

type SettingsEEOModernData = {
  meta: SettingsModernJSONMeta;
  actions: SettingsModernJSONActionData & {
    submitURL: string;
    backURL: string;
    legacyURL: string;
  };
  settings: Record<string, string>;
};

type SettingsTalentFitFlowModernData = {
  meta: SettingsModernJSONMeta;
  state: {
    saved: boolean;
    testOk?: boolean;
    testMessage?: string;
  };
  actions: SettingsModernJSONActionData & {
    submitURL: string;
    testURL: string;
    backURL: string;
    legacyURL: string;
  };
  settings: Record<string, string>;
};

type SettingsWizardModernData = {
  meta: SettingsModernJSONMeta;
  wizard: {
    inputType: 'password' | 'siteName';
    inputTypeTextParam?: string;
    title: string;
    prompt: string;
    home: string;
  };
  actions: SettingsModernJSONActionData & {
    submitURL: string;
    legacyURL: string;
  };
};

type SettingsLegacyNoticeData = {
  actions: {
    backURL: string;
    legacyURL: string;
  };
  state: {
    title: string;
    message: string;
  };
};

type SettingsCareerPortalWorkflowData = {
  actions: {
    backURL: string;
    legacyURL: string;
    primaryURL: string;
    primaryLabel: string;
    secondaryURL?: string;
    secondaryLabel?: string;
  };
  state: {
    title: string;
    message: string;
  };
};

type SettingsDeleteBackupNativeData = SettingsLegacyNoticeData & {
  actions: SettingsLegacyNoticeData['actions'] & {
    deleteURL: string;
  };
  state: SettingsLegacyNoticeData['state'] & {
    warning: string;
  };
};

type SettingsNewInstallFinishedNativeData = {
  actions: {
    homeURL: string;
    legacyURL: string;
  };
  state: {
    message: string;
  };
};

type SettingsUpgradeSiteNameNativeData = {
  wizard: {
    inputTypeTextParam: string;
    title: string;
    prompt: string;
    home: string;
  };
  actions: {
    submitURL: string;
    legacyURL: string;
  };
};

const EMAIL_TEMPLATE_FORMATTING_TOKENS: SettingsEmailTemplateToken[] = [
  { label: 'Bold', value: '<B></B>' },
  { label: 'Italics', value: '<I></I>' },
  { label: 'Underline', value: '<U></U>' }
];

const EMAIL_TEMPLATE_GLOBAL_MERGE_TOKENS: SettingsEmailTemplateToken[] = [
  { label: 'Current Date/Time', value: '%DATETIME%' },
  { label: 'Site Name', value: '%SITENAME%' },
  { label: 'Recruiter/Current User Name', value: '%USERFULLNAME%' },
  { label: 'Recruiter/Current User E-Mail Link', value: '%USERMAIL%' }
];

const EMAIL_TEMPLATE_CONDITIONAL_MERGE_TOKENS: SettingsEmailTemplateToken[] = [
  { label: 'Previous Candidate Status', value: '%CANDPREVSTATUS%' },
  { label: 'Current Candidate Status', value: '%CANDSTATUS%' },
  { label: 'Candidate Owner', value: '%CANDOWNER%' },
  { label: 'Candidate First Name', value: '%CANDFIRSTNAME%' },
  { label: 'Candidate Full Name', value: '%CANDFULLNAME%' },
  { label: 'CATS Candidate URL', value: '%CANDCATSURL%' },
  { label: 'Company Owner', value: '%CLNTOWNER%' },
  { label: 'Company Name', value: '%CLNTNAME%' },
  { label: 'CATS Company URL', value: '%CLNTCATSURL%' },
  { label: 'Contact Owner', value: '%CONTOWNER%' },
  { label: 'Contact First Name', value: '%CONTFIRSTNAME%' },
  { label: 'Contact Full Name', value: '%CONTFULLNAME%' },
  { label: 'Contacts Company Name', value: '%CONTCLIENTNAME%' },
  { label: 'CATS Contact URL', value: '%CONTCATSURL%' },
  { label: 'Job Order Owner', value: '%JBODOWNER%' },
  { label: 'Job Order Title', value: '%JBODTITLE%' },
  { label: 'Job Order Company', value: '%JBODCLIENT%' },
  { label: 'Job Order ID', value: '%JBODID%' },
  { label: 'CATS Job Order URL', value: '%JBODCATSURL%' }
];

const SETTINGS_EMAIL_TEMPLATE_FETCHER_NAMES = [
  'fetchSettingsEmailTemplatesModernData'
] as const;

const SETTINGS_EMAIL_TEMPLATE_ADD_MUTATION_NAMES = [
  'fetchSettingsAddEmailTemplateModernMutation',
  'fetchSettingsAddEmailTemplateModernData',
  'fetchSettingsEmailTemplateAddModernMutation',
  'fetchSettingsEmailTemplateAddModernData'
] as const;

const SETTINGS_EMAIL_TEMPLATE_DELETE_MUTATION_NAMES = [
  'fetchSettingsDeleteEmailTemplateModernMutation',
  'fetchSettingsDeleteEmailTemplateModernData',
  'fetchSettingsEmailTemplateDeleteModernMutation',
  'fetchSettingsEmailTemplateDeleteModernData'
] as const;

const SETTINGS_EMAIL_TEMPLATE_SAVE_MUTATION_NAMES = [
  'fetchSettingsEmailTemplatesSaveModernMutation',
  'fetchSettingsEmailTemplatesUpdateModernMutation',
  'fetchSettingsEmailTemplatesSubmitModernMutation',
  'fetchSettingsEmailTemplateSaveModernMutation',
  'fetchSettingsEmailTemplateUpdateModernMutation'
] as const;

type SettingsAsyncAPIFunction = (...args: unknown[]) => Promise<unknown>;

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function toSafeNumber(value: unknown): number {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

function toSafeString(value: unknown): string {
  return typeof value === 'string' ? value : String(value ?? '');
}

function getSettingsAPIAsyncFunction(candidateNames: readonly string[]): SettingsAsyncAPIFunction | null {
  const apiRecord = settingsApi as unknown as Record<string, unknown>;
  for (const candidateName of candidateNames) {
    const candidate = apiRecord[candidateName];
    if (typeof candidate === 'function') {
      return candidate as SettingsAsyncAPIFunction;
    }
  }

  return null;
}

function parseTemplateVariableSet(possibleVariables: string): Set<string> {
  const tokens = possibleVariables.match(/%[A-Z0-9_]+%/g) || [];
  return new Set(tokens);
}

function normalizeSettingsEmailTemplateMutationResponse(
  response: unknown,
  fallbackMessage: string
): SettingsEmailTemplateMutationResponse {
  if (!isObjectRecord(response)) {
    return {
      success: true,
      message: fallbackMessage
    };
  }

  const successCandidate = response.success;
  const success = typeof successCandidate === 'boolean'
    ? successCandidate
    : String(successCandidate || '').trim().toLowerCase() !== 'false';
  const templateIDCandidate = toSafeNumber(
    response.templateID ?? response.emailTemplateID ?? response.id
  );

  return {
    success,
    code: typeof response.code === 'string' ? response.code : undefined,
    message: typeof response.message === 'string' ? response.message : fallbackMessage,
    templateID: templateIDCandidate > 0 ? templateIDCandidate : undefined
  };
}

function normalizeSettingsEmailTemplatesModernData(
  response: unknown,
  bootstrap: UIModeBootstrap
): SettingsEmailTemplatesModernDataResponse {
  const payload = isObjectRecord(response) ? response : {};
  const payloadMeta = isObjectRecord(payload.meta) ? payload.meta : {};
  const payloadActions = isObjectRecord(payload.actions) ? payload.actions : {};
  const payloadHelpers = isObjectRecord(payload.helpers) ? payload.helpers : {};
  const payloadState = isObjectRecord(payload.state) ? payload.state : {};
  const payloadFlash = isObjectRecord(payload.flash) ? payload.flash : {};
  const rawTemplates = Array.isArray(payload.templates)
    ? payload.templates
    : (Array.isArray(payload.emailTemplates) ? payload.emailTemplates : []);
  const rawMergeFields = Array.isArray(payloadHelpers.mergeFields)
    ? payloadHelpers.mergeFields
    : (Array.isArray(payload.mergeFields) ? payload.mergeFields : []);

  const normalizedMergeFields = rawMergeFields
    .map((item) => {
      if (typeof item === 'string') {
        return {
          label: item,
          value: item
        };
      }
      if (!isObjectRecord(item)) {
        return null;
      }
      const value = toSafeString(item.value || item.token || '');
      if (value.trim() === '') {
        return null;
      }
      return {
        label: toSafeString(item.label || value),
        value
      };
    })
    .filter((item): item is SettingsEmailTemplateToken => item !== null);

  const normalizedTemplates = rawTemplates
    .map((item) => {
      if (!isObjectRecord(item)) {
        return null;
      }
      const emailTemplateID = toSafeNumber(item.emailTemplateID ?? item.templateID ?? item.id);
      if (emailTemplateID <= 0) {
        return null;
      }

      const emailTemplateTitle = toSafeString(item.emailTemplateTitle ?? item.title ?? '').trim();
      const text = toSafeString(item.text ?? item.messageText ?? item.body ?? '');
      const messageTextOrigional = toSafeString(
        item.messageTextOrigional ?? item.messageTextOriginal ?? item.originalText ?? text
      );
      const emailTemplateTag = toSafeString(item.emailTemplateTag ?? item.tag ?? item.templateTag ?? '');
      const disabled = isTruthyText(item.disabled ?? 0);
      const possibleVariables = toSafeString(item.possibleVariables ?? item.variables ?? '');
      const canDeleteCandidate = item.canDelete ?? item.isCustom;
      const canDelete = typeof canDeleteCandidate === 'boolean'
        ? canDeleteCandidate
        : emailTemplateTag.toUpperCase().startsWith('CUSTOM');

      return {
        emailTemplateID,
        emailTemplateTitle: emailTemplateTitle === '' ? `Template ${emailTemplateID}` : emailTemplateTitle,
        emailTemplateTag,
        text,
        messageTextOrigional,
        disabled,
        possibleVariables,
        canDelete
      } satisfies SettingsEmailTemplate;
    })
    .filter((item): item is SettingsEmailTemplate => item !== null);

  return {
    meta: {
      contractVersion: toSafeNumber(payloadMeta.contractVersion) || 1,
      contractKey: toSafeString(payloadMeta.contractKey || 'settings.emailTemplates.v1'),
      modernPage: toSafeString(payloadMeta.modernPage || 'settings-email-templates')
    },
    flash: {
      saved: isTruthyText(payloadFlash.saved ?? payloadFlash.success ?? false),
      success: isTruthyText(payloadFlash.success ?? payloadFlash.saved ?? false),
      message: toSafeString(payloadFlash.message || '')
    },
    state: {
      noGlobalTemplates: isTruthyText(payloadState.noGlobalTemplates ?? false)
    },
    actions: {
      routeURL: toSafeString(payloadActions.routeURL || `${bootstrap.indexName}?m=settings&a=emailTemplates&ui=modern`),
      submitURL: toSafeString(payloadActions.submitURL || `${bootstrap.indexName}?m=settings&a=emailTemplates`),
      addTemplateURL: toSafeString(payloadActions.addTemplateURL || payloadActions.addURL || `${bootstrap.indexName}?m=settings&a=addEmailTemplate`),
      deleteTemplateURL: toSafeString(payloadActions.deleteTemplateURL || payloadActions.deleteURL || `${bootstrap.indexName}?m=settings&a=deleteEmailTemplate`),
      backURL: toSafeString(payloadActions.backURL || `${bootstrap.indexName}?m=settings&a=administration&ui=modern`),
      legacyURL: toSafeString(payloadActions.legacyURL || `${bootstrap.indexName}?m=settings&a=emailTemplates&ui=legacy`)
    },
    helpers: {
      mergeFields: normalizedMergeFields
    },
    templates: normalizedTemplates
  };
}

async function fetchSettingsEmailTemplatesNativeData(
  bootstrap: UIModeBootstrap,
  query: URLSearchParams
): Promise<SettingsEmailTemplatesModernDataResponse> {
  const fetcher = getSettingsAPIAsyncFunction(SETTINGS_EMAIL_TEMPLATE_FETCHER_NAMES);
  if (fetcher === null) {
    throw new Error('Email templates native fetcher is unavailable.');
  }

  const payload = await fetcher(bootstrap, query);
  return normalizeSettingsEmailTemplatesModernData(payload, bootstrap);
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

function hasPositiveIntParam(query: URLSearchParams, key: string): boolean {
  const value = Number(query.get(key) || 0);
  return Number.isFinite(value) && value > 0;
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

  if (routeKey === 'settings.loginactivity') {
    return 'loginActivity';
  }

  if (routeKey === 'settings.gdprsettings') {
    return 'gdprSettings';
  }

  if (
    routeKey === 'settings.emailtemplates' ||
    routeKey === 'settings.addemailtemplate' ||
    routeKey === 'settings.deleteemailtemplate'
  ) {
    return 'emailTemplates';
  }

  if (routeKey === 'settings.emailsettings') {
    return 'emailSettings';
  }

  if (routeKey === 'settings.feedbacksettings') {
    return 'feedbackSettings';
  }

  if (routeKey === 'settings.forceemail') {
    return 'forceEmail';
  }

  if (routeKey === 'settings.googleoidcsettings') {
    return 'googleOIDCSettings';
  }

  if (routeKey === 'settings.deleteuser') {
    return 'deleteUser';
  }

  if (routeKey === 'settings.careerportalsettings') {
    return 'careerPortalSettings';
  }

  if (routeKey === 'settings.careerportaltemplateedit') {
    return 'careerPortalTemplateEdit';
  }

  if (routeKey === 'settings.careerportalquestionnaire') {
    return 'careerPortalQuestionnaire';
  }

  if (routeKey === 'settings.careerportalquestionnairepreview') {
    return 'careerPortalQuestionnairePreview';
  }

  if (routeKey === 'settings.careerportalquestionnaireupdate') {
    return 'careerPortalQuestionnaireUpdate';
  }

  if (routeKey === 'settings.customizecalendar') {
    return 'customizeCalendar';
  }

  if (routeKey === 'settings.eeo') {
    return 'eeo';
  }

  if (routeKey === 'settings.talentfitflowsettings') {
    return 'talentFitFlowSettings';
  }

  if (routeKey === 'settings.newinstallpassword') {
    return 'newInstallPassword';
  }

  if (routeKey === 'settings.newsitename') {
    return 'newSiteName';
  }

  if (routeKey === 'settings.createbackup') {
    return 'createBackup';
  }

  if (routeKey === 'settings.deletebackup') {
    return 'deleteBackup';
  }

  if (routeKey === 'settings.customizeextrafields') {
    return 'customizeExtraFields';
  }

  if (routeKey === 'settings.newinstallfinished') {
    return 'newInstallFinished';
  }

  if (routeKey === 'settings.upgradesitename') {
    return 'upgradeSiteName';
  }

  if (routeKey === 'settings.manageusers') {
    return 'manageUsers';
  }

  if (routeKey === 'settings.adduser') {
    return 'addUser';
  }

  if (routeKey === 'settings.edituser') {
    const query = new URLSearchParams(window.location.search);
    if (hasPositiveIntParam(query, 'userID')) {
      return 'editUser';
    }
  }

  if (routeKey === 'settings.showuser') {
    const query = new URLSearchParams(window.location.search);
    if (hasPositiveIntParam(query, 'userID')) {
      return 'showUser';
    }
  }

  if (routeKey === 'settings.rejectionreasons') {
    return 'rejectionReasons';
  }

  if (routeKey === 'settings.tags') {
    return 'tags';
  }

  if (routeKey === 'settings.rolepagepermissions') {
    return 'rolePagePermissions';
  }

  if (routeKey === 'settings.schemamigrations') {
    return 'schemaMigrations';
  }

  if (routeKey === 'settings.viewitemhistory') {
    const query = new URLSearchParams(window.location.search);
    if (hasPositiveIntParam(query, 'dataItemType') && hasPositiveIntParam(query, 'dataItemID')) {
      return 'viewItemHistory';
    }
  }

  return 'fallback';
}

function buildCopyKey(routeKey: string, nativeRouteMode: NativeSettingsRouteMode): string {
  if (nativeRouteMode === 'changePassword') {
    return 'settings.myprofile.changepassword';
  }

  if (nativeRouteMode === 'emailTemplates') {
    return 'settings.emailtemplates';
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

  if (routeKey === 'settings.manageusers') {
    return {
      label: 'Back To Settings',
      href: ensureModernUIURL(`${bootstrap.indexName}?m=settings&a=administration&ui=modern`)
    };
  }

  if (routeKey === 'settings.adduser' || routeKey === 'settings.edituser' || routeKey === 'settings.showuser') {
    return {
      label: 'Back To Users',
      href: ensureModernUIURL(`${bootstrap.indexName}?m=settings&a=manageUsers&ui=modern`)
    };
  }

  return {
    label: 'Back To Settings',
    href: ensureModernUIURL(`${bootstrap.indexName}?m=settings&a=administration`)
  };
}

async function fetchNativeEmailSettingsData(bootstrap: UIModeBootstrap, legacyURL: string): Promise<SettingsEmailSettingsNativeData> {
  const document = await fetchHTMLDocument(legacyURL);
  const form = document.querySelector<HTMLFormElement>('#emailSettingsForm');
  if (!form) {
    throw new Error('Unable to locate the email settings form.');
  }

  const fromAddress = readInputValue(form, '#fromAddress');
  const testEmailAddress = readInputValue(form, '#testEmailAddress');
  const statusToggles = EMAIL_SETTINGS_STATUS_TOGGLES.map((toggle) => ({
    name: toggle.name,
    label: toggle.label,
    checked: readCheckboxValue(form, `input[name="${toggle.name}"]`)
  }));
  const templateToggles = Array.from(form.querySelectorAll<HTMLInputElement>('input[type="checkbox"][name^="useThisTemplate"]'))
    .map((checkbox) => {
      const emailTemplateID = Number(checkbox.name.replace('useThisTemplate', '') || 0);
      const rawLabel = checkbox.nextSibling?.textContent || checkbox.parentElement?.textContent || '';
      const title = String(rawLabel || '').replace(/\s+/g, ' ').trim().replace(/^:?\s*/, '');
      if (emailTemplateID <= 0) {
        return null;
      }
      return {
        emailTemplateID,
        title: title === '' ? `Template ${emailTemplateID}` : title,
        checked: checkbox.checked
      };
    })
    .filter((item): item is { emailTemplateID: number; title: string; checked: boolean } => item !== null);

  return {
    actions: {
      submitURL: `${bootstrap.indexName}?m=settings&a=emailSettings`,
      legacyURL,
      backURL: `${bootstrap.indexName}?m=settings&a=administration&ui=modern`
    },
    form: {
      fromAddress,
      testEmailAddress,
      statusToggles,
      templateToggles
    }
  };
}

async function fetchNativeFeedbackSettingsData(bootstrap: UIModeBootstrap, legacyURL: string): Promise<SettingsFeedbackSettingsNativeData> {
  const document = await fetchHTMLDocument(legacyURL);
  const form = document.querySelector<HTMLFormElement>('form[action*="feedbackSettings"]');
  if (!form) {
    throw new Error('Unable to locate the feedback settings form.');
  }

  return {
    actions: {
      submitURL: `${bootstrap.indexName}?m=settings&a=feedbackSettings`,
      legacyURL,
      backURL: `${bootstrap.indexName}?m=settings&a=administration&ui=modern`
    },
    form: {
      recipientUserID: readSelectedOptionValue(form, '#feedbackRecipientUserID'),
      recipientOptions: readSelectOptions(form, '#feedbackRecipientUserID')
    },
    flash: (() => {
      const message = readLegacyMessage(document);
      return message === '' ? undefined : {
        success: document.querySelector('.noteGood') !== null,
        message
      };
    })()
  };
}

async function fetchNativeGoogleOIDCSettingsData(bootstrap: UIModeBootstrap, legacyURL: string): Promise<SettingsGoogleOIDCSettingsNativeData> {
  const document = await fetchHTMLDocument(legacyURL);
  const form = document.querySelector<HTMLFormElement>('form[action*="googleOIDCSettings"]');
  if (!form) {
    throw new Error('Unable to locate the Google OIDC settings form.');
  }

  const message = readLegacyMessage(document);

  return {
    actions: {
      submitURL: `${bootstrap.indexName}?m=settings&a=googleOIDCSettings`,
      legacyURL,
      backURL: `${bootstrap.indexName}?m=settings&a=administration&ui=modern`
    },
    form: {
      enabled: readCheckboxValue(form, 'input[name="enabled"]'),
      clientId: readInputValue(form, '#clientId'),
      clientSecret: readInputValue(form, '#clientSecret'),
      redirectUri: readInputValue(form, '#redirectUri'),
      hostedDomain: readInputValue(form, '#hostedDomain'),
      siteId: readInputValue(form, '#siteId'),
      autoProvisionEnabled: readCheckboxValue(form, 'input[name="autoProvisionEnabled"]'),
      notifyEmail: readInputValue(form, '#notifyEmail'),
      fromEmail: readInputValue(form, '#fromEmail'),
      requestSubject: readInputValue(form, '#requestSubject')
    },
    flash: message === '' ? undefined : {
      success: document.querySelector('.noteGood') !== null,
      message
    },
    testFeedback: message === '' ? undefined : {
      success: document.querySelector('.noteGood') !== null,
      message
    }
  };
}

function buildForceEmailNativeData(bootstrap: UIModeBootstrap, legacyURL: string): SettingsForceEmailNativeData {
  return {
    actions: {
      submitURL: `${bootstrap.indexName}?m=settings&a=forceEmail`,
      legacyURL,
      backURL: `${bootstrap.indexName}?m=settings&a=administration&ui=modern`
    },
    form: {
      siteName: ''
    }
  };
}

function buildDeleteUserNativeData(bootstrap: UIModeBootstrap, legacyURL: string): SettingsDeleteUserNativeData {
  const query = new URLSearchParams(window.location.search);
  const userID = toSafeNumber(query.get('userID') || query.get('id'));
  return {
    actions: {
      submitURL: `${bootstrap.indexName}?m=settings&a=deleteUser`,
      legacyURL,
      backURL: `${bootstrap.indexName}?m=settings&a=manageUsers&ui=modern`
    },
    state: {
      userID,
      requested: userID > 0,
      automatedTester: isTruthyText(query.get('iAmTheAutomatedTester'))
    }
  };
}

function buildLegacyNoticeData(bootstrap: UIModeBootstrap, legacyURL: string, title: string, message: string): SettingsLegacyNoticeData {
  return {
    actions: {
      backURL: `${bootstrap.indexName}?m=settings&a=administration&ui=modern`,
      legacyURL
    },
    state: {
      title,
      message
    }
  };
}

function buildModernSettingsActionURL(
  bootstrap: UIModeBootstrap,
  action: string,
  query: URLSearchParams
): string {
  const modernQuery = new URLSearchParams(query);
  modernQuery.set('m', 'settings');
  modernQuery.set('a', action);
  return ensureModernUIURL(`${bootstrap.indexName}?${modernQuery.toString()}`);
}

function buildCareerPortalWorkflowData(
  bootstrap: UIModeBootstrap,
  legacyURL: string,
  routeMode: NativeSettingsRouteMode,
  query: URLSearchParams
): SettingsCareerPortalWorkflowData {
  const settingsURL = buildModernSettingsActionURL(bootstrap, 'careerPortalSettings', query);
  const templateEditURL = buildModernSettingsActionURL(bootstrap, 'careerPortalTemplateEdit', query);
  const questionnaireURL = buildModernSettingsActionURL(bootstrap, 'careerPortalQuestionnaire', query);
  const previewURL = buildModernSettingsActionURL(bootstrap, 'careerPortalQuestionnairePreview', query);
  const updateURL = buildModernSettingsActionURL(bootstrap, 'careerPortalQuestionnaireUpdate', query);
  const backToAdministrationURL = ensureModernUIURL(`${bootstrap.indexName}?m=settings&a=administration&ui=modern`);

  switch (routeMode) {
    case 'careerPortalSettings':
      return {
        actions: {
          backURL: backToAdministrationURL,
          legacyURL,
          primaryURL: questionnaireURL,
          primaryLabel: 'Open Questionnaire Editor',
          secondaryURL: templateEditURL,
          secondaryLabel: 'Open Template Editor'
        },
        state: {
          title: 'Career Portal Settings',
          message: 'Use the native shell to navigate the career portal workflow. Detailed edits remain in the legacy editor.'
        }
      };
    case 'careerPortalTemplateEdit':
      return {
        actions: {
          backURL: settingsURL,
          legacyURL,
          primaryURL: settingsURL,
          primaryLabel: 'Back to Career Portal Settings',
          secondaryURL: questionnaireURL,
          secondaryLabel: 'Open Questionnaire Editor'
        },
        state: {
          title: 'Career Portal Template',
          message: 'Template edits stay behind the legacy form, while the native shell keeps related workflow actions visible.'
        }
      };
    case 'careerPortalQuestionnaire':
      return {
        actions: {
          backURL: settingsURL,
          legacyURL,
          primaryURL: previewURL,
          primaryLabel: 'Preview Questionnaire',
          secondaryURL: updateURL,
          secondaryLabel: 'Open Update Workflow'
        },
        state: {
          title: 'Career Portal Questionnaire',
          message: 'Questionnaire editing remains in the legacy form. Use the native shell for safe navigation and preview.'
        }
      };
    case 'careerPortalQuestionnairePreview':
      return {
        actions: {
          backURL: questionnaireURL,
          legacyURL,
          primaryURL: questionnaireURL,
          primaryLabel: 'Edit Questionnaire',
          secondaryURL: settingsURL,
          secondaryLabel: 'Open Career Portal Settings'
        },
        state: {
          title: 'Career Portal Questionnaire Preview',
          message: 'Preview the questionnaire from the native shell and jump back to editing without a redirect loop.'
        }
      };
    case 'careerPortalQuestionnaireUpdate':
      return {
        actions: {
          backURL: settingsURL,
          legacyURL,
          primaryURL: settingsURL,
          primaryLabel: 'Back to Career Portal Settings',
          secondaryURL: questionnaireURL,
          secondaryLabel: 'Open Questionnaire Editor'
        },
        state: {
          title: 'Career Portal Questionnaire Update',
          message: 'Use the explicit legacy submit path to apply questionnaire updates while the native shell remains readable.'
        }
      };
    default:
      return {
        actions: {
          backURL: backToAdministrationURL,
          legacyURL,
          primaryURL: settingsURL,
          primaryLabel: 'Open Career Portal Settings'
        },
        state: {
          title: 'Career Portal Workflow',
          message: 'Open the related legacy editor from the native shell.'
        }
      };
  }
}

function buildDeleteBackupNativeData(bootstrap: UIModeBootstrap, legacyURL: string): SettingsDeleteBackupNativeData {
  return {
    actions: {
      backURL: `${bootstrap.indexName}?m=settings&a=administration&ui=modern`,
      legacyURL,
      deleteURL: `${bootstrap.indexName}?m=settings&a=deleteBackup&ui=legacy`
    },
    state: {
      title: 'Delete Backup',
      message: 'Deleting the stored backup is destructive and cannot be undone.',
      warning: 'Use the legacy confirmation path if you really need to remove the stored backup.'
    }
  };
}

function buildNewInstallFinishedNativeData(bootstrap: UIModeBootstrap, legacyURL: string): SettingsNewInstallFinishedNativeData {
  return {
    actions: {
      homeURL: `${bootstrap.indexName}?m=home`,
      legacyURL
    },
    state: {
      message: 'Initial setup is complete. Continue into OpenCATS or open the legacy finish screen.'
    }
  };
}

function buildUpgradeSiteNameNativeData(bootstrap: UIModeBootstrap, legacyURL: string): SettingsUpgradeSiteNameNativeData {
  return {
    wizard: {
      inputTypeTextParam: 'Site Name',
      title: 'Site Name',
      prompt: 'Your administrator password has been changed. Next, create a name for your OpenCATS installation.',
      home: 'home'
    },
    actions: {
      submitURL: `${bootstrap.indexName}?m=settings&a=upgradeSiteName`,
      legacyURL
    }
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

function SettingsGdprSettingsNativeShell({
  data
}: {
  data: SettingsGdprSettingsModernData;
}) {
  const backURL = ensureModernUIURL(data.actions.backURL);
  const legacyURL = ensureUIURL(data.actions.legacyURL, 'legacy');
  const submitURL = ensureUIURL(data.actions.submitURL, 'legacy');
  const [gdprExpirationYears, setGdprExpirationYears] = useState(String(data.settings.gdprExpirationYears || ''));
  const [gdprFromAddress, setGdprFromAddress] = useState(String(data.settings.gdprFromAddress || ''));
  const [isSaving, setIsSaving] = useState(false);
  const [mutationFeedback, setMutationFeedback] = useState<ModernMutationResponse | null>(null);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    setGdprExpirationYears(String(data.settings.gdprExpirationYears || ''));
    setGdprFromAddress(String(data.settings.gdprFromAddress || ''));
  }, [data.settings.gdprExpirationYears, data.settings.gdprFromAddress]);

  const resetToContractValues = useCallback(() => {
    setGdprExpirationYears(String(data.settings.gdprExpirationYears || ''));
    setGdprFromAddress(String(data.settings.gdprFromAddress || ''));
    setMutationFeedback(null);
    setSubmitError('');
  }, [data.settings.gdprExpirationYears, data.settings.gdprFromAddress]);

  const submitSettings = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSaving) {
      return;
    }

    setIsSaving(true);
    setMutationFeedback(null);
    setSubmitError('');

    try {
      const response = await updateSettingsGdprSettings(submitURL, {
        gdprExpirationYears,
        gdprFromAddress
      });
      setMutationFeedback(response);
    } catch (error: unknown) {
      setSubmitError(error instanceof Error ? error.message : 'Unable to save GDPR settings.');
    } finally {
      setIsSaving(false);
    }
  }, [gdprExpirationYears, gdprFromAddress, isSaving, submitURL]);

  return (
    <div className="avel-dashboard-page avel-settings-admin-page avel-settings-workflow-page">
      <PageContainer
        title="GDPR Settings"
        subtitle="Configure consent defaults while preserving legacy-compatible submit semantics."
        actions={(
          <>
            <a className="modern-btn modern-btn--secondary" href={backURL}>
              Back To Settings
            </a>
            <a className="modern-btn modern-btn--secondary" href={legacyURL}>
              Open Legacy UI
            </a>
          </>
        )}
      >
        <div className="modern-dashboard avel-dashboard-shell">
          {data.state.gdprSaved ? (
            <section className="avel-settings-admin-flash is-success" aria-live="polite">
              <strong>Saved</strong>
              <span>GDPR settings saved successfully.</span>
            </section>
          ) : null}
          {mutationFeedback ? (
            <section className={`avel-settings-admin-flash ${mutationFeedback.success ? 'is-success' : 'is-warning'}`} aria-live="polite">
              <strong>{mutationFeedback.success ? 'Saved' : 'Warning'}</strong>
              <span>{mutationFeedback.message || (mutationFeedback.success ? 'GDPR settings saved.' : 'Unable to save GDPR settings.')}</span>
            </section>
          ) : null}
          {submitError !== '' ? (
            <section className="avel-settings-admin-flash is-warning" aria-live="polite">
              <strong>Warning</strong>
              <span>{submitError}</span>
            </section>
          ) : null}

          <section className="avel-list-panel">
            <div className="avel-list-panel__header">
              <h2 className="avel-list-panel__title">Consent Defaults</h2>
              <p className="avel-list-panel__hint">
                Field names and postback semantics match the legacy GDPR settings form.
              </p>
            </div>

            <form className="avel-settings-user-form" action={submitURL} method="post" autoComplete="off" onSubmit={submitSettings}>
              <input type="hidden" name="postback" value="postback" />

              <div className="avel-settings-user-grid">
                <label className="avel-settings-user-field" htmlFor="gdprExpirationYears">
                  <span>Consent Expiration (Years)</span>
                  <input
                    className="avel-form-control"
                    type="text"
                    id="gdprExpirationYears"
                    name="gdprExpirationYears"
                    value={gdprExpirationYears}
                    onChange={(event) => setGdprExpirationYears(event.target.value)}
                    inputMode="numeric"
                  />
                </label>

                <label className="avel-settings-user-field avel-settings-user-field--full" htmlFor="gdprFromAddress">
                  <span>GDPR Consent From Address (Optional)</span>
                  <input
                    className="avel-form-control"
                    type="text"
                    id="gdprFromAddress"
                    name="gdprFromAddress"
                    value={gdprFromAddress}
                    onChange={(event) => setGdprFromAddress(event.target.value)}
                    autoComplete="email"
                  />
                </label>
              </div>

              <div className="modern-compat-page__actions">
                <button type="submit" className="modern-btn modern-btn--emphasis" disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Settings'}
                </button>
                <button
                  type="button"
                  className="modern-btn modern-btn--secondary"
                  onClick={resetToContractValues}
                  disabled={isSaving}
                >
                  Reset
                </button>
                <a className="modern-btn modern-btn--secondary" href={backURL}>
                  Back To Settings
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

function SettingsEmailSettingsNativeShell({
  data,
  bootstrap,
  onReload
}: {
  data: SettingsEmailSettingsNativeData;
  bootstrap: UIModeBootstrap;
  onReload: () => void;
}) {
  const submitURL = ensureUIURL(data.actions.submitURL, 'legacy');
  const backURL = ensureModernUIURL(data.actions.backURL);
  const legacyURL = ensureUIURL(data.actions.legacyURL, 'legacy');
  const [fromAddress, setFromAddress] = useState(data.form.fromAddress);
  const [testEmailAddress, setTestEmailAddress] = useState(data.form.testEmailAddress);
  const [statusToggles, setStatusToggles] = useState(data.form.statusToggles);
  const [templateToggles, setTemplateToggles] = useState(data.form.templateToggles);
  const [isSaving, setIsSaving] = useState(false);
  const [testFeedback, setTestFeedback] = useState('');
  const [testRunning, setTestRunning] = useState(false);
  const [flash, setFlash] = useState<SettingsEmailSettingsNativeData['flash'] | null>(null);

  useEffect(() => {
    setFromAddress(data.form.fromAddress);
    setTestEmailAddress(data.form.testEmailAddress);
    setStatusToggles(data.form.statusToggles);
    setTemplateToggles(data.form.templateToggles);
  }, [data.form.fromAddress, data.form.testEmailAddress, data.form.statusToggles, data.form.templateToggles]);

  const resetForm = useCallback(() => {
    setFromAddress(data.form.fromAddress);
    setTestEmailAddress(data.form.testEmailAddress);
    setStatusToggles(data.form.statusToggles);
    setTemplateToggles(data.form.templateToggles);
    setFlash(null);
    setTestFeedback('');
  }, [data.form.fromAddress, data.form.testEmailAddress, data.form.statusToggles, data.form.templateToggles]);

  const saveSettings = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSaving) {
      return;
    }

    setIsSaving(true);
    setFlash(null);

    try {
      const payload = new URLSearchParams();
      payload.set('postback', 'postback');
      payload.set('configured', '1');
      payload.set('fromAddress', fromAddress);
      statusToggles.forEach((toggle) => {
        if (toggle.checked) {
          payload.set(toggle.name, '1');
        }
      });
      templateToggles.forEach((template) => {
        if (template.checked) {
          payload.set(`useThisTemplate${template.emailTemplateID}`, 'on');
        }
      });

      const document = await submitLegacyForm(submitURL, payload);
      const message = readLegacyMessage(document);
      const success = !hasLegacyFailure(document);
      setFlash({
        success,
        message: message === '' ? (success ? 'Email settings saved.' : 'Unable to save email settings.') : message
      });
      onReload();
    } catch (error: unknown) {
      setFlash({
        success: false,
        message: error instanceof Error ? error.message : 'Unable to save email settings.'
      });
    } finally {
      setIsSaving(false);
    }
  }, [fromAddress, isSaving, onReload, statusToggles, submitURL, templateToggles]);

  const runEmailTest = useCallback(async () => {
    if (testRunning) {
      return;
    }

    setTestRunning(true);
    setTestFeedback('');

    try {
      const sessionCookie = getCookieValue('CATS');
      const response = await settingsApi.callLegacyAjaxFunction(
        'testEmailSettings',
        {
          testEmailAddress,
          fromAddress
        },
        sessionCookie
      );
      setTestFeedback(response.response || 'Test reported success.');
    } catch (error: unknown) {
      setTestFeedback(error instanceof Error ? error.message : 'Unable to test e-mail settings.');
    } finally {
      setTestRunning(false);
    }
  }, [fromAddress, testEmailAddress, testRunning]);

  return (
    <div className="avel-dashboard-page avel-settings-admin-page avel-settings-workflow-page">
      <PageContainer
        title="Email Settings"
        subtitle="Configure delivery settings while preserving the legacy field names and test workflow."
        actions={(
          <>
            <button
              type="submit"
              form="emailSettingsForm"
              className="modern-btn modern-btn--emphasis"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
            <a className="modern-btn modern-btn--secondary" href={backURL}>
              Back To Settings
            </a>
            <a className="modern-btn modern-btn--secondary" href={legacyURL}>
              Open Legacy UI
            </a>
          </>
        )}
      >
        <div className="modern-dashboard avel-dashboard-shell">
          {flash ? (
            <section className={`avel-settings-admin-flash ${flash.success ? 'is-success' : 'is-warning'}`} aria-live="polite">
              <strong>{flash.success ? 'Saved' : 'Warning'}</strong>
              <span>{flash.message}</span>
            </section>
          ) : null}
          {testFeedback !== '' ? (
            <section className="avel-settings-admin-flash is-info" aria-live="polite">
              <strong>Test</strong>
              <span>{testFeedback}</span>
            </section>
          ) : null}

          <section className="avel-list-panel">
            <div className="avel-list-panel__header">
              <h2 className="avel-list-panel__title">Delivery Settings</h2>
              <p className="avel-list-panel__hint">
                The form keeps the legacy field names, submit endpoint, and e-mail test action intact.
              </p>
            </div>

            <form id="emailSettingsForm" className="avel-settings-user-form" action={submitURL} method="post" autoComplete="off" onSubmit={saveSettings}>
              <input type="hidden" name="postback" value="postback" />
              <input type="hidden" name="configured" value="1" />

              <div className="avel-settings-user-grid">
                <label className="avel-settings-user-field avel-settings-user-field--full" htmlFor="fromAddress">
                  <span>From E-Mail Address for Outgoing Messages</span>
                  <input
                    className="avel-form-control"
                    type="email"
                    id="fromAddress"
                    name="fromAddress"
                    value={fromAddress}
                    onChange={(event) => setFromAddress(event.target.value)}
                    autoComplete="email"
                  />
                </label>

                <div className="avel-settings-user-field avel-settings-user-field--full">
                  <span>Send Test E-Mail To</span>
                  <div className="modern-compat-page__actions">
                    <input
                      className="avel-form-control"
                      type="email"
                      id="testEmailAddress"
                      name="testEmailAddress"
                      value={testEmailAddress}
                      onChange={(event) => setTestEmailAddress(event.target.value)}
                      autoComplete="email"
                    />
                    <button type="button" className="modern-btn modern-btn--secondary" onClick={() => {
                      void runEmailTest();
                    }} disabled={testRunning}>
                      {testRunning ? 'Testing...' : 'Test Configuration'}
                    </button>
                  </div>
                </div>

                <fieldset className="avel-settings-user-field avel-settings-user-field--full">
                  <legend>E-Mail Messages Generated For</legend>
                  <div className="avel-settings-form-stack">
                    {statusToggles.map((toggle, index) => (
                      <label key={toggle.name} className="modern-checkbox">
                        <input
                          type="checkbox"
                          name={toggle.name}
                          checked={toggle.checked}
                          onChange={(event) => {
                            const next = event.target.checked;
                            setStatusToggles((current) => current.map((item, itemIndex) => (
                              itemIndex === index ? { ...item, checked: next } : item
                            )));
                          }}
                        />
                        <span>{toggle.label}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <fieldset className="avel-settings-user-field avel-settings-user-field--full">
                  <legend>Template Activation</legend>
                  <div className="avel-settings-form-stack">
                    {templateToggles.map((template, index) => (
                      <label key={template.emailTemplateID} className="modern-checkbox">
                        <input
                          type="checkbox"
                          name={`useThisTemplate${template.emailTemplateID}`}
                          checked={template.checked}
                          onChange={(event) => {
                            const next = event.target.checked;
                            setTemplateToggles((current) => current.map((item, itemIndex) => (
                              itemIndex === index ? { ...item, checked: next } : item
                            )));
                          }}
                        />
                        <span>{template.title}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              </div>

              <div className="modern-compat-page__actions">
                <button type="submit" className="modern-btn modern-btn--emphasis" disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Settings'}
                </button>
                <button type="button" className="modern-btn modern-btn--secondary" onClick={resetForm} disabled={isSaving}>
                  Reset
                </button>
                <a className="modern-btn modern-btn--secondary" href={backURL}>
                  Back To Settings
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

function SettingsFeedbackSettingsNativeShell({
  data,
  bootstrap,
  onReload
}: {
  data: SettingsFeedbackSettingsNativeData;
  bootstrap: UIModeBootstrap;
  onReload: () => void;
}) {
  const submitURL = ensureUIURL(data.actions.submitURL, 'legacy');
  const backURL = ensureModernUIURL(data.actions.backURL);
  const legacyURL = ensureUIURL(data.actions.legacyURL, 'legacy');
  const [recipientUserID, setRecipientUserID] = useState(data.form.recipientUserID);
  const [isSaving, setIsSaving] = useState(false);
  const [flash, setFlash] = useState<SettingsFeedbackSettingsNativeData['flash'] | null>(data.flash || null);

  useEffect(() => {
    setRecipientUserID(data.form.recipientUserID);
    setFlash(data.flash || null);
  }, [data.form.recipientUserID, data.flash]);

  const saveSettings = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSaving) {
      return;
    }

    setIsSaving(true);
    setFlash(null);

    try {
      const payload = new URLSearchParams();
      payload.set('postback', 'postback');
      payload.set('feedbackRecipientUserID', recipientUserID);
      const document = await submitLegacyForm(submitURL, payload);
      const message = readLegacyMessage(document);
      const success = !hasLegacyFailure(document);
      setFlash({
        success,
        message: message === '' ? (success ? 'Feedback settings saved.' : 'Unable to save feedback settings.') : message
      });
      onReload();
    } catch (error: unknown) {
      setFlash({
        success: false,
        message: error instanceof Error ? error.message : 'Unable to save feedback settings.'
      });
    } finally {
      setIsSaving(false);
    }
  }, [isSaving, onReload, recipientUserID, submitURL]);

  return (
    <div className="avel-dashboard-page avel-settings-admin-page avel-settings-workflow-page">
      <PageContainer
        title="Feedback Settings"
        subtitle="Route global feedback to a selected recipient while preserving the legacy submit payload."
        actions={(
          <>
            <button type="submit" form="feedbackSettingsForm" className="modern-btn modern-btn--emphasis" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
            <a className="modern-btn modern-btn--secondary" href={backURL}>
              Back To Settings
            </a>
            <a className="modern-btn modern-btn--secondary" href={legacyURL}>
              Open Legacy UI
            </a>
          </>
        )}
      >
        <div className="modern-dashboard avel-dashboard-shell">
          {flash ? (
            <section className={`avel-settings-admin-flash ${flash.success ? 'is-success' : 'is-warning'}`} aria-live="polite">
              <strong>{flash.success ? 'Saved' : 'Warning'}</strong>
              <span>{flash.message}</span>
            </section>
          ) : null}

          <section className="avel-list-panel">
            <div className="avel-list-panel__header">
              <h2 className="avel-list-panel__title">Feedback Routing</h2>
              <p className="avel-list-panel__hint">
                The global footer feedback button sends notes to the selected user.
              </p>
            </div>

            <form id="feedbackSettingsForm" className="avel-settings-user-form" action={submitURL} method="post" autoComplete="off" onSubmit={saveSettings}>
              <input type="hidden" name="postback" value="postback" />
              <label className="avel-settings-user-field avel-settings-user-field--full" htmlFor="feedbackRecipientUserID">
                <span>Feedback recipient user</span>
                <select
                  className="avel-form-control"
                  id="feedbackRecipientUserID"
                  name="feedbackRecipientUserID"
                  value={recipientUserID}
                  onChange={(event) => setRecipientUserID(event.target.value)}
                >
                  <option value="0">-- Not configured --</option>
                  {data.form.recipientOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <div className="modern-compat-page__actions">
                <button type="submit" className="modern-btn modern-btn--emphasis" disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Settings'}
                </button>
                <a className="modern-btn modern-btn--secondary" href={backURL}>
                  Back To Settings
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

function SettingsGoogleOIDCSettingsNativeShell({
  data,
  bootstrap,
  onReload
}: {
  data: SettingsGoogleOIDCSettingsNativeData;
  bootstrap: UIModeBootstrap;
  onReload: () => void;
}) {
  const submitURL = ensureUIURL(data.actions.submitURL, 'legacy');
  const backURL = ensureModernUIURL(data.actions.backURL);
  const legacyURL = ensureUIURL(data.actions.legacyURL, 'legacy');
  const [enabled, setEnabled] = useState(data.form.enabled);
  const [clientId, setClientId] = useState(data.form.clientId);
  const [clientSecret, setClientSecret] = useState(data.form.clientSecret);
  const [redirectUri, setRedirectUri] = useState(data.form.redirectUri);
  const [hostedDomain, setHostedDomain] = useState(data.form.hostedDomain);
  const [siteId, setSiteId] = useState(data.form.siteId);
  const [autoProvisionEnabled, setAutoProvisionEnabled] = useState(data.form.autoProvisionEnabled);
  const [notifyEmail, setNotifyEmail] = useState(data.form.notifyEmail);
  const [fromEmail, setFromEmail] = useState(data.form.fromEmail);
  const [requestSubject, setRequestSubject] = useState(data.form.requestSubject);
  const [isSaving, setIsSaving] = useState(false);
  const [flash, setFlash] = useState<SettingsGoogleOIDCSettingsNativeData['flash'] | null>(data.flash || null);
  const [testFeedback, setTestFeedback] = useState<SettingsGoogleOIDCSettingsNativeData['testFeedback'] | null>(data.testFeedback || null);

  useEffect(() => {
    setEnabled(data.form.enabled);
    setClientId(data.form.clientId);
    setClientSecret(data.form.clientSecret);
    setRedirectUri(data.form.redirectUri);
    setHostedDomain(data.form.hostedDomain);
    setSiteId(data.form.siteId);
    setAutoProvisionEnabled(data.form.autoProvisionEnabled);
    setNotifyEmail(data.form.notifyEmail);
    setFromEmail(data.form.fromEmail);
    setRequestSubject(data.form.requestSubject);
    setFlash(data.flash || null);
    setTestFeedback(data.testFeedback || null);
  }, [data]);

  const submitSettings = useCallback(async (testConfig: boolean) => {
    if (isSaving) {
      return;
    }

    setIsSaving(true);
    setFlash(null);
    setTestFeedback(null);

    try {
      const payload = new URLSearchParams();
      payload.set('postback', 'postback');
      payload.set('enabled', enabled ? '1' : '0');
      payload.set('clientId', clientId);
      payload.set('clientSecret', clientSecret);
      payload.set('redirectUri', redirectUri);
      payload.set('hostedDomain', hostedDomain);
      payload.set('siteId', siteId);
      payload.set('autoProvisionEnabled', autoProvisionEnabled ? '1' : '0');
      payload.set('notifyEmail', notifyEmail);
      payload.set('fromEmail', fromEmail);
      payload.set('requestSubject', requestSubject);
      if (testConfig) {
        payload.set('testConfig', '1');
      }

      const document = await submitLegacyForm(submitURL, payload);
      const message = readLegacyMessage(document);
      const success = !hasLegacyFailure(document);

      if (testConfig) {
        setTestFeedback({
          success,
          message: message === '' ? (success ? 'Test completed.' : 'Test failed.') : message
        });
      } else {
        setFlash({
          success: true,
          message: message === '' ? 'Google OIDC settings saved.' : message
        });
        onReload();
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unable to save Google OIDC settings.';
      if (testConfig) {
        setTestFeedback({
          success: false,
          message
        });
      } else {
        setFlash({
          success: false,
          message
        });
      }
    } finally {
      setIsSaving(false);
    }
  }, [autoProvisionEnabled, clientId, clientSecret, enabled, fromEmail, hostedDomain, isSaving, notifyEmail, onReload, redirectUri, requestSubject, siteId, submitURL]);

  return (
    <div className="avel-dashboard-page avel-settings-admin-page avel-settings-workflow-page">
      <PageContainer
        title="Google OIDC Settings"
        subtitle="Configure Google sign-in and access-request routing while preserving the legacy submit/test actions."
        actions={(
          <>
            <button type="button" className="modern-btn modern-btn--emphasis" onClick={() => {
              void submitSettings(false);
            }} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
            <button type="button" className="modern-btn modern-btn--secondary" onClick={() => {
              void submitSettings(true);
            }} disabled={isSaving}>
              Test Google Config
            </button>
            <a className="modern-btn modern-btn--secondary" href={backURL}>
              Back To Settings
            </a>
            <a className="modern-btn modern-btn--secondary" href={legacyURL}>
              Open Legacy UI
            </a>
          </>
        )}
      >
        <div className="modern-dashboard avel-dashboard-shell">
          {flash ? (
            <section className={`avel-settings-admin-flash ${flash.success ? 'is-success' : 'is-warning'}`} aria-live="polite">
              <strong>{flash.success ? 'Saved' : 'Warning'}</strong>
              <span>{flash.message}</span>
            </section>
          ) : null}
          {testFeedback ? (
            <section className={`avel-settings-admin-flash ${testFeedback.success ? 'is-success' : 'is-warning'}`} aria-live="polite">
              <strong>{testFeedback.success ? 'Test Passed' : 'Test Failed'}</strong>
              <span>{testFeedback.message}</span>
            </section>
          ) : null}

          <section className="avel-list-panel">
            <div className="avel-list-panel__header">
              <h2 className="avel-list-panel__title">Google Sign-In / Access Request</h2>
              <p className="avel-list-panel__hint">
                The native form keeps the legacy fields, test action, and submit endpoint intact.
              </p>
            </div>

            <form className="avel-settings-user-form" action={submitURL} method="post" autoComplete="off">
              <input type="hidden" name="postback" value="postback" />

              <div className="avel-settings-user-grid">
                <label className="modern-checkbox avel-settings-user-field avel-settings-user-field--full">
                  <input
                    type="checkbox"
                    name="enabled"
                    checked={enabled}
                    onChange={(event) => setEnabled(event.target.checked)}
                  />
                  <span>Enable Google Sign-In</span>
                </label>

                <label className="avel-settings-user-field avel-settings-user-field--full" htmlFor="clientId">
                  <span>Google OAuth Client ID</span>
                  <input className="avel-form-control" type="text" id="clientId" name="clientId" value={clientId} onChange={(event) => setClientId(event.target.value)} />
                </label>

                <label className="avel-settings-user-field avel-settings-user-field--full" htmlFor="clientSecret">
                  <span>Google OAuth Client Secret</span>
                  <input className="avel-form-control" type="password" id="clientSecret" name="clientSecret" value={clientSecret} onChange={(event) => setClientSecret(event.target.value)} />
                </label>

                <label className="avel-settings-user-field avel-settings-user-field--full" htmlFor="redirectUri">
                  <span>Redirect URI (optional override)</span>
                  <input className="avel-form-control" type="text" id="redirectUri" name="redirectUri" value={redirectUri} onChange={(event) => setRedirectUri(event.target.value)} />
                </label>

                <label className="avel-settings-user-field avel-settings-user-field--full" htmlFor="hostedDomain">
                  <span>Allowed Google Workspace domain(s)</span>
                  <input className="avel-form-control" type="text" id="hostedDomain" name="hostedDomain" value={hostedDomain} onChange={(event) => setHostedDomain(event.target.value)} />
                </label>

                <label className="avel-settings-user-field" htmlFor="siteId">
                  <span>Default OpenCATS Site ID</span>
                  <input className="avel-form-control" type="text" id="siteId" name="siteId" value={siteId} onChange={(event) => setSiteId(event.target.value)} inputMode="numeric" />
                </label>

                <label className="modern-checkbox avel-settings-user-field avel-settings-user-field--full">
                  <input
                    type="checkbox"
                    name="autoProvisionEnabled"
                    checked={autoProvisionEnabled}
                    onChange={(event) => setAutoProvisionEnabled(event.target.checked)}
                  />
                  <span>Enable access request auto-provisioning</span>
                </label>

                <label className="avel-settings-user-field avel-settings-user-field--full" htmlFor="notifyEmail">
                  <span>Access request notification recipient</span>
                  <input className="avel-form-control" type="email" id="notifyEmail" name="notifyEmail" value={notifyEmail} onChange={(event) => setNotifyEmail(event.target.value)} />
                </label>

                <label className="avel-settings-user-field avel-settings-user-field--full" htmlFor="fromEmail">
                  <span>Access request e-mail From address</span>
                  <input className="avel-form-control" type="email" id="fromEmail" name="fromEmail" value={fromEmail} onChange={(event) => setFromEmail(event.target.value)} />
                </label>

                <label className="avel-settings-user-field avel-settings-user-field--full" htmlFor="requestSubject">
                  <span>Access request e-mail subject</span>
                  <input className="avel-form-control" type="text" id="requestSubject" name="requestSubject" value={requestSubject} onChange={(event) => setRequestSubject(event.target.value)} />
                </label>
              </div>

              <div className="modern-compat-page__actions">
                <button type="button" className="modern-btn modern-btn--emphasis" onClick={() => {
                  void submitSettings(false);
                }} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Settings'}
                </button>
                <button type="button" className="modern-btn modern-btn--secondary" onClick={() => {
                  void submitSettings(true);
                }} disabled={isSaving}>
                  Test Google Config
                </button>
                <a className="modern-btn modern-btn--secondary" href={backURL}>
                  Back To Settings
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

function SettingsForceEmailNativeShell({
  data,
  bootstrap,
  onReload
}: {
  data: SettingsForceEmailNativeData;
  bootstrap: UIModeBootstrap;
  onReload: () => void;
}) {
  const submitURL = ensureUIURL(data.actions.submitURL, 'legacy');
  const backURL = ensureModernUIURL(data.actions.backURL);
  const legacyURL = ensureUIURL(data.actions.legacyURL, 'legacy');
  const [siteName, setSiteName] = useState(data.form.siteName);
  const [isSaving, setIsSaving] = useState(false);
  const [flash, setFlash] = useState<SettingsForceEmailNativeData['flash'] | null>(data.flash || null);

  useEffect(() => {
    setSiteName(data.form.siteName);
    setFlash(data.flash || null);
  }, [data]);

  const saveSettings = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSaving) {
      return;
    }

    setIsSaving(true);
    setFlash(null);

    try {
      const payload = new URLSearchParams();
      payload.set('postback', 'postback');
      payload.set('siteName', siteName);
      const document = await submitLegacyForm(submitURL, payload);
      const message = readLegacyMessage(document);
      const success = !hasLegacyFailure(document);
      setFlash({
        success,
        message: message === '' ? (success ? 'E-Mail address saved.' : 'Please enter an e-mail address.') : message
      });
      onReload();
    } catch (error: unknown) {
      setFlash({
        success: false,
        message: error instanceof Error ? error.message : 'Please enter an e-mail address.'
      });
    } finally {
      setIsSaving(false);
    }
  }, [isSaving, onReload, siteName, submitURL]);

  return (
    <div className="avel-dashboard-page avel-settings-admin-page avel-settings-workflow-page">
      <PageContainer
        title="Force Email"
        subtitle="Set the current account e-mail address using the legacy wizard payload."
        actions={(
          <>
            <button type="submit" form="forceEmailForm" className="modern-btn modern-btn--emphasis" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Email'}
            </button>
            <a className="modern-btn modern-btn--secondary" href={backURL}>
              Back To Settings
            </a>
            <a className="modern-btn modern-btn--secondary" href={legacyURL}>
              Open Legacy UI
            </a>
          </>
        )}
      >
        <div className="modern-dashboard avel-dashboard-shell">
          {flash ? (
            <section className={`avel-settings-admin-flash ${flash.success ? 'is-success' : 'is-warning'}`} aria-live="polite">
              <strong>{flash.success ? 'Saved' : 'Warning'}</strong>
              <span>{flash.message}</span>
            </section>
          ) : null}

          <section className="avel-list-panel">
            <div className="avel-list-panel__header">
              <h2 className="avel-list-panel__title">E-Mail Address</h2>
              <p className="avel-list-panel__hint">
                This preserves the legacy `siteName` field name and postback behavior.
              </p>
            </div>

            <form id="forceEmailForm" className="avel-settings-user-form" action={submitURL} method="post" autoComplete="off" onSubmit={saveSettings}>
              <input type="hidden" name="postback" value="postback" />

              <label className="avel-settings-user-field avel-settings-user-field--full" htmlFor="siteName">
                <span>E-Mail Address</span>
                <input
                  className="avel-form-control"
                  type="email"
                  id="siteName"
                  name="siteName"
                  value={siteName}
                  onChange={(event) => setSiteName(event.target.value)}
                />
              </label>

              <div className="modern-compat-page__actions">
                <button type="submit" className="modern-btn modern-btn--emphasis" disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Email'}
                </button>
                <button type="button" className="modern-btn modern-btn--secondary" onClick={() => setSiteName(data.form.siteName)} disabled={isSaving}>
                  Reset
                </button>
                <a className="modern-btn modern-btn--secondary" href={backURL}>
                  Back To Settings
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

function SettingsDeleteUserNativeShell({
  data,
  bootstrap,
  onReload
}: {
  data: SettingsDeleteUserNativeData;
  bootstrap: UIModeBootstrap;
  onReload: () => void;
}) {
  const backURL = ensureModernUIURL(data.actions.backURL);
  const legacyURL = ensureUIURL(data.actions.legacyURL, 'legacy');
  const [flash, setFlash] = useState<SettingsDeleteUserNativeData['flash'] | null>(data.flash || null);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!data.state.requested || !data.state.automatedTester || data.state.userID <= 0 || isRunning) {
      return;
    }

    let isMounted = true;
    setIsRunning(true);
    setFlash(null);

    const runDelete = async () => {
      try {
        const query = new URLSearchParams();
        query.set('m', 'settings');
        query.set('a', 'deleteUser');
        query.set('format', 'modern-json');
        query.set('modernPage', 'settings-delete-user');
        query.set('userID', String(data.state.userID));
        query.set('iAmTheAutomatedTester', '1');
        const response = await fetch(`${bootstrap.indexName}?${query.toString()}`, {
          credentials: 'same-origin'
        });
        if (!response.ok) {
          throw new Error(`Delete request failed (${response.status}).`);
        }

        const payload = await response.json() as ModernMutationResponse;
        if (!isMounted) {
          return;
        }

        setFlash({
          success: Boolean(payload.success),
          message: payload.message || (payload.success ? 'User deleted.' : 'Unable to delete user.')
        });
        if (payload.success) {
          onReload();
        }
      } catch (error: unknown) {
        if (!isMounted) {
          return;
        }
        setFlash({
          success: false,
          message: error instanceof Error ? error.message : 'Unable to delete user.'
        });
      } finally {
        if (isMounted) {
          setIsRunning(false);
        }
      }
    };

    void runDelete();

    return () => {
      isMounted = false;
    };
  }, [bootstrap.indexName, data.state.automatedTester, data.state.requested, data.state.userID, isRunning, onReload]);

  return (
    <div className="avel-dashboard-page avel-settings-admin-page avel-settings-workflow-page">
      <PageContainer
        title="Delete User"
        subtitle="Execute the automated delete-user action through the native modern shell."
        actions={(
          <>
            <a className="modern-btn modern-btn--secondary" href={backURL}>
              Back To Users
            </a>
            <a className="modern-btn modern-btn--secondary" href={legacyURL}>
              Open Legacy UI
            </a>
          </>
        )}
      >
        <div className="modern-dashboard avel-dashboard-shell">
          {flash ? (
            <section className={`avel-settings-admin-flash ${flash.success ? 'is-success' : 'is-warning'}`} aria-live="polite">
              <strong>{flash.success ? 'Done' : 'Warning'}</strong>
              <span>{flash.message}</span>
            </section>
          ) : null}

          <section className="avel-list-panel">
            <div className="avel-list-panel__header">
              <h2 className="avel-list-panel__title">Delete User Action</h2>
              <p className="avel-list-panel__hint">
                This route remains tester-gated and executes only when the required query parameters are present.
              </p>
            </div>
            <div className="modern-state">
              {isRunning ? 'Deleting user...' : data.state.requested ? `Requested delete for user #${data.state.userID}.` : 'No user ID supplied.'}
            </div>
          </section>
        </div>
      </PageContainer>
    </div>
  );
}

function SettingsCreateBackupNativeShell({
  data,
  backLink
}: {
  data: SettingsLegacyNoticeData;
  backLink: BackLink;
}) {
  return (
    <div className="avel-dashboard-page avel-settings-admin-page avel-settings-workflow-page">
      <PageContainer
        title={data.state.title}
        subtitle="Backup creation remains available through a native wrapper and an explicit legacy escape hatch."
        actions={(
          <>
            <a className="modern-btn modern-btn--secondary" href={backLink.href}>
              {backLink.label}
            </a>
            <a className="modern-btn modern-btn--secondary" href={data.actions.legacyURL}>
              Open Legacy UI
            </a>
          </>
        )}
      >
        <div className="modern-dashboard avel-dashboard-shell">
          <section className="avel-list-panel">
            <div className="avel-list-panel__header">
              <h2 className="avel-list-panel__title">Backup Workspace</h2>
              <p className="avel-list-panel__hint">{data.state.message}</p>
            </div>
            <div className="modern-compat-page__actions">
              <a className="modern-btn modern-btn--emphasis" href={data.actions.legacyURL}>
                Open Backup Runner
              </a>
              <a className="modern-btn modern-btn--secondary" href={data.actions.legacyURL} target="_blank" rel="noreferrer">
                Open In New Tab
              </a>
            </div>
          </section>
        </div>
      </PageContainer>
    </div>
  );
}

function SettingsDeleteBackupNativeShell({
  data,
  backLink
}: {
  data: SettingsDeleteBackupNativeData;
  backLink: BackLink;
}) {
  return (
    <div className="avel-dashboard-page avel-settings-admin-page avel-settings-workflow-page">
      <PageContainer
        title={data.state.title}
        subtitle="Deletion stays behind an explicit confirmation step and the legacy escape hatch."
        actions={(
          <>
            <a className="modern-btn modern-btn--secondary" href={backLink.href}>
              {backLink.label}
            </a>
            <a className="modern-btn modern-btn--secondary" href={data.actions.legacyURL}>
              Open Legacy UI
            </a>
          </>
        )}
      >
        <div className="modern-dashboard avel-dashboard-shell">
          <section className="avel-settings-admin-flash is-warning" aria-live="polite">
            <strong>Warning</strong>
            <span>{data.state.warning}</span>
          </section>

          <section className="avel-list-panel">
            <div className="avel-list-panel__header">
              <h2 className="avel-list-panel__title">Delete Backup</h2>
              <p className="avel-list-panel__hint">{data.state.message}</p>
            </div>
            <div className="modern-compat-page__actions">
              <button
                type="button"
                className="modern-btn modern-btn--danger"
                onClick={() => {
                  if (window.confirm('Delete this backup?')) {
                    window.location.assign(data.actions.deleteURL);
                  }
                }}
              >
                Delete Backup
              </button>
              <a className="modern-btn modern-btn--secondary" href={data.actions.legacyURL}>
                Open Legacy UI
              </a>
            </div>
          </section>
        </div>
      </PageContainer>
    </div>
  );
}

function SettingsCustomizeExtraFieldsNativeShell({
  data,
  backLink
}: {
  data: SettingsLegacyNoticeData;
  backLink: BackLink;
}) {
  return (
    <div className="avel-dashboard-page avel-settings-admin-page avel-settings-workflow-page">
      <PageContainer
        title={data.state.title}
        subtitle="The native wrapper keeps the advanced extra-field editor one click away."
        actions={(
          <>
            <a className="modern-btn modern-btn--secondary" href={backLink.href}>
              {backLink.label}
            </a>
            <a className="modern-btn modern-btn--secondary" href={data.actions.legacyURL}>
              Open Legacy UI
            </a>
          </>
        )}
      >
        <div className="modern-dashboard avel-dashboard-shell">
          <section className="avel-list-panel">
            <div className="avel-list-panel__header">
              <h2 className="avel-list-panel__title">Extra Fields</h2>
              <p className="avel-list-panel__hint">{data.state.message}</p>
            </div>
            <div className="modern-compat-page__actions">
              <a className="modern-btn modern-btn--emphasis" href={data.actions.legacyURL}>
                Open Field Builder
              </a>
              <a className="modern-btn modern-btn--secondary" href={data.actions.legacyURL} target="_blank" rel="noreferrer">
                Open In New Tab
              </a>
            </div>
          </section>
        </div>
      </PageContainer>
    </div>
  );
}

function SettingsNewInstallFinishedNativeShell({
  data
}: {
  data: { actions: { homeURL: string; legacyURL: string }; state: { message: string } };
}) {
  return (
    <div className="avel-dashboard-page avel-settings-admin-page avel-settings-workflow-page">
      <PageContainer
        title="New Install Finished"
        subtitle="Finish the wizard and continue into OpenCATS."
        actions={(
          <>
            <a className="modern-btn modern-btn--emphasis" href={data.actions.homeURL}>
              Continue Using OpenCATS
            </a>
            <a className="modern-btn modern-btn--secondary" href={data.actions.legacyURL}>
              Open Legacy UI
            </a>
          </>
        )}
      >
        <div className="modern-dashboard avel-dashboard-shell">
          <section className="avel-list-panel">
            <div className="avel-list-panel__header">
              <h2 className="avel-list-panel__title">Setup Complete</h2>
              <p className="avel-list-panel__hint">{data.state.message}</p>
            </div>
            <div className="modern-compat-page__actions">
              <a className="modern-btn modern-btn--emphasis" href={data.actions.homeURL}>
                Continue Using OpenCATS
              </a>
              <a className="modern-btn modern-btn--secondary" href={data.actions.legacyURL}>
                Open Legacy UI
              </a>
            </div>
          </section>
        </div>
      </PageContainer>
    </div>
  );
}

function SettingsUpgradeSiteNameNativeShell({
  data
}: {
  data: SettingsUpgradeSiteNameNativeData;
}) {
  const [siteName, setSiteName] = useState('');

  return (
    <div className="avel-dashboard-page avel-settings-admin-page avel-settings-workflow-page">
      <PageContainer
        title={data.wizard.title}
        subtitle="Set the installation name with the same postback semantics the legacy wizard expects."
        actions={(
          <>
            <button type="submit" form="upgradeSiteNameForm" className="modern-btn modern-btn--emphasis">
              Save Site Name
            </button>
            <a className="modern-btn modern-btn--secondary" href={data.actions.legacyURL}>
              Open Legacy UI
            </a>
          </>
        )}
      >
        <div className="modern-dashboard avel-dashboard-shell">
          <section className="avel-list-panel">
            <div className="avel-list-panel__header">
              <h2 className="avel-list-panel__title">{data.wizard.title}</h2>
              <p className="avel-list-panel__hint">{data.wizard.prompt}</p>
            </div>

            <form id="upgradeSiteNameForm" className="avel-settings-password-form" action={data.actions.submitURL} method="post" autoComplete="off">
              <input type="hidden" name="postback" value="postback" />
              <div className="avel-settings-password-grid">
                <label className="avel-settings-password-field" htmlFor="siteName">
                  <span>{data.wizard.inputTypeTextParam}</span>
                  <input
                    className="avel-form-control"
                    type="text"
                    id="siteName"
                    name="siteName"
                    value={siteName}
                    onChange={(event) => setSiteName(event.target.value)}
                    autoComplete="organization"
                  />
                </label>
              </div>

              <div className="modern-compat-page__actions">
                <button type="submit" className="modern-btn modern-btn--emphasis">
                  Save Site Name
                </button>
                <button type="button" className="modern-btn modern-btn--secondary" onClick={() => setSiteName('')}>
                  Reset
                </button>
                <a className="modern-btn modern-btn--secondary" href={data.actions.legacyURL}>
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

function SettingsCareerPortalWorkflowNativeShell({
  data
}: {
  data: SettingsCareerPortalWorkflowData;
}) {
  const backURL = ensureUIURL(data.actions.backURL, 'modern');
  const legacyURL = ensureUIURL(data.actions.legacyURL, 'legacy');
  const primaryURL = ensureUIURL(data.actions.primaryURL, 'modern');
  const secondaryURL = data.actions.secondaryURL ? ensureUIURL(data.actions.secondaryURL, 'modern') : '';

  return (
    <div className="avel-dashboard-page avel-settings-admin-page avel-settings-workflow-page">
      <PageContainer
        title={data.state.title}
        subtitle="Native wrapper shell for the career portal workflow."
        actions={(
          <>
            <a className="modern-btn modern-btn--secondary" href={backURL}>
              Back
            </a>
            <a className="modern-btn modern-btn--secondary" href={legacyURL}>
              Open Legacy UI
            </a>
          </>
        )}
      >
        <div className="modern-dashboard avel-dashboard-shell">
          <section className="avel-list-panel">
            <div className="avel-list-panel__header">
              <h2 className="avel-list-panel__title">{data.state.title}</h2>
              <p className="avel-list-panel__hint">{data.state.message}</p>
            </div>

            <div className="modern-compat-page__actions">
              <a className="modern-btn modern-btn--emphasis" href={primaryURL}>
                {data.actions.primaryLabel}
              </a>
              {secondaryURL !== '' && data.actions.secondaryLabel ? (
                <a className="modern-btn modern-btn--secondary" href={secondaryURL}>
                  {data.actions.secondaryLabel}
                </a>
              ) : null}
              <a className="modern-btn modern-btn--secondary" href={legacyURL} target="_blank" rel="noreferrer">
                Open In New Tab
              </a>
            </div>

            <div className="modern-state" aria-live="polite">
              {data.state.message}
            </div>
          </section>
        </div>
      </PageContainer>
    </div>
  );
}

function buildRouteWithParams(
  routeURL: string,
  params: Record<string, string | number | null | undefined>
): string {
  const url = new URL(routeURL, window.location.href);
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || String(value).trim() === '') {
      url.searchParams.delete(key);
      return;
    }
    url.searchParams.set(key, String(value));
  });
  return ensureModernUIURL(url.toString());
}

function SettingsCustomizeCalendarNativeShell({
  data,
  bootstrap
}: {
  data: SettingsCustomizeCalendarModernData;
  bootstrap: UIModeBootstrap;
}) {
  const submitURL = ensureUIURL(data.actions.submitURL, 'legacy');
  const backURL = ensureModernUIURL(data.actions.backURL);
  const legacyURL = ensureUIURL(data.actions.legacyURL, 'legacy');
  const [calendarSettings, setCalendarSettings] = useState({
    noAjax: isTruthyText(data.settings.noAjax),
    defaultPublic: isTruthyText(data.settings.defaultPublic),
    firstDayMonday: isTruthyText(data.settings.firstDayMonday),
    dayStart: String(data.settings.dayStart || '0'),
    dayStop: String(data.settings.dayStop || '0'),
    calendarView: String(data.settings.calendarView || 'DAYVIEW')
  });
  const [isSaving, setIsSaving] = useState(false);
  const [flash, setFlash] = useState<ModernMutationResponse | null>(null);
  const resetForm = useCallback(() => {
    setCalendarSettings({
      noAjax: isTruthyText(data.settings.noAjax),
      defaultPublic: isTruthyText(data.settings.defaultPublic),
      firstDayMonday: isTruthyText(data.settings.firstDayMonday),
      dayStart: String(data.settings.dayStart || '0'),
      dayStop: String(data.settings.dayStop || '0'),
      calendarView: String(data.settings.calendarView || 'DAYVIEW')
    });
    setFlash(null);
  }, [data.settings]);
  const saveSettings = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSaving) return;
    setIsSaving(true);
    setFlash(null);
    try {
      const payload = new URLSearchParams();
      payload.set('postback', 'postback');
      if (calendarSettings.noAjax) payload.set('noAjax', '1');
      if (calendarSettings.defaultPublic) payload.set('defaultPublic', '1');
      if (calendarSettings.firstDayMonday) payload.set('firstDayMonday', '1');
      payload.set('dayStart', calendarSettings.dayStart);
      payload.set('dayStop', calendarSettings.dayStop);
      payload.set('calendarView', calendarSettings.calendarView);
      const response = await submitSettingsModernJSON<ModernMutationResponse>(bootstrap, 'customizeCalendar', 'settings-customize-calendar', payload);
      setFlash({ success: response.success, message: response.message || (response.success ? 'Calendar customization saved.' : 'Unable to save calendar settings.') });
    } catch (error: unknown) {
      setFlash({ success: false, message: error instanceof Error ? error.message : 'Unable to save calendar settings.' });
    } finally {
      setIsSaving(false);
    }
  }, [bootstrap, calendarSettings, isSaving]);
  const checkboxRows = [
    { name: 'noAjax', label: 'Disable AJAX dynamic event loading' },
    { name: 'defaultPublic', label: 'By default, all events are public' },
    { name: 'firstDayMonday', label: 'First day of the week is Monday' }
  ] as const;
  return (
    <div className="avel-dashboard-page avel-settings-admin-page avel-settings-workflow-page">
      <PageContainer
        title="Customize Calendar"
        subtitle="Adjust calendar defaults while preserving the legacy field names and postback behavior."
        actions={(
          <>
            <button type="submit" form="customizeCalendarForm" className="modern-btn modern-btn--emphasis" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Settings'}</button>
            <a className="modern-btn modern-btn--secondary" href={backURL}>Back To Settings</a>
            <a className="modern-btn modern-btn--secondary" href={legacyURL}>Open Legacy UI</a>
          </>
        )}
      >
        <div className="modern-dashboard avel-dashboard-shell">
          {flash ? <section className={`avel-settings-admin-flash ${flash.success ? 'is-success' : 'is-warning'}`} aria-live="polite"><strong>{flash.success ? 'Saved' : 'Warning'}</strong><span>{flash.message}</span></section> : null}
          <section className="avel-list-panel">
            <div className="avel-list-panel__header">
              <h2 className="avel-list-panel__title">Calendar Defaults</h2>
              <p className="avel-list-panel__hint">The native shell posts the same `customizeCalendar` payload as the legacy form.</p>
            </div>
            <form id="customizeCalendarForm" className="avel-settings-user-form" action={submitURL} method="post" autoComplete="off" onSubmit={saveSettings}>
              <input type="hidden" name="postback" value="postback" />
              <div className="avel-settings-user-grid">
                {checkboxRows.map((field) => (
                  <label key={field.name} className="modern-checkbox avel-settings-user-field avel-settings-user-field--full">
                    <input type="checkbox" name={field.name} checked={Boolean(calendarSettings[field.name as keyof typeof calendarSettings])} onChange={(event) => setCalendarSettings((current) => ({ ...current, [field.name]: event.target.checked } as typeof current))} />
                    <span>{field.label}</span>
                  </label>
                ))}
                <label className="avel-settings-user-field" htmlFor="dayStart"><span>Work day start time</span><select className="avel-form-control" id="dayStart" name="dayStart" value={calendarSettings.dayStart} onChange={(event) => setCalendarSettings((current) => ({ ...current, dayStart: event.target.value }))}>{data.hourOptions.map((option) => <option key={`day-start-${option.value}`} value={option.value}>{option.label}</option>)}</select></label>
                <label className="avel-settings-user-field" htmlFor="dayStop"><span>Work day stop time</span><select className="avel-form-control" id="dayStop" name="dayStop" value={calendarSettings.dayStop} onChange={(event) => setCalendarSettings((current) => ({ ...current, dayStop: event.target.value }))}>{data.hourOptions.map((option) => <option key={`day-stop-${option.value}`} value={option.value}>{option.label}</option>)}</select></label>
                <label className="avel-settings-user-field avel-settings-user-field--full" htmlFor="calendarView"><span>Default calendar view</span><select className="avel-form-control" id="calendarView" name="calendarView" value={calendarSettings.calendarView} onChange={(event) => setCalendarSettings((current) => ({ ...current, calendarView: event.target.value }))}>{data.calendarViewOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
              </div>
              <div className="modern-compat-page__actions">
                <button type="submit" className="modern-btn modern-btn--emphasis" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Settings'}</button>
                <button type="button" className="modern-btn modern-btn--secondary" onClick={resetForm} disabled={isSaving}>Reset</button>
                <a className="modern-btn modern-btn--secondary" href={backURL}>Back To Settings</a>
                <a className="modern-btn modern-btn--secondary" href={legacyURL}>Open Legacy UI</a>
              </div>
            </form>
          </section>
        </div>
      </PageContainer>
    </div>
  );
}

function SettingsEEONativeShell({
  data,
  bootstrap
}: {
  data: SettingsEEOModernData;
  bootstrap: UIModeBootstrap;
}) {
  const submitURL = ensureUIURL(data.actions.submitURL, 'legacy');
  const backURL = ensureModernUIURL(data.actions.backURL);
  const legacyURL = ensureUIURL(data.actions.legacyURL, 'legacy');
  const [eeoSettings, setEEOSettings] = useState({
    enabled: isTruthyText(data.settings.enabled),
    genderTracking: isTruthyText(data.settings.genderTracking),
    ethnicTracking: isTruthyText(data.settings.ethnicTracking),
    veteranTracking: isTruthyText(data.settings.veteranTracking),
    disabilityTracking: isTruthyText(data.settings.disabilityTracking)
  });
  const [isSaving, setIsSaving] = useState(false);
  const [flash, setFlash] = useState<ModernMutationResponse | null>(null);

  useEffect(() => {
    setEEOSettings({
      enabled: isTruthyText(data.settings.enabled),
      genderTracking: isTruthyText(data.settings.genderTracking),
      ethnicTracking: isTruthyText(data.settings.ethnicTracking),
      veteranTracking: isTruthyText(data.settings.veteranTracking),
      disabilityTracking: isTruthyText(data.settings.disabilityTracking)
    });
  }, [data.settings]);

  const resetForm = useCallback(() => {
    setEEOSettings({
      enabled: isTruthyText(data.settings.enabled),
      genderTracking: isTruthyText(data.settings.genderTracking),
      ethnicTracking: isTruthyText(data.settings.ethnicTracking),
      veteranTracking: isTruthyText(data.settings.veteranTracking),
      disabilityTracking: isTruthyText(data.settings.disabilityTracking)
    });
    setFlash(null);
  }, [data.settings]);

  const enableTracking = useCallback((field: keyof typeof eeoSettings, value: boolean) => {
    setEEOSettings((current) => {
      const next = { ...current, [field]: value } as typeof current;
      if (field !== 'enabled' && value) next.enabled = true;
      if (field === 'enabled' && !value) next.genderTracking = next.ethnicTracking = next.veteranTracking = next.disabilityTracking = false;
      return next;
    });
  }, []);

  const saveSettings = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSaving) return;
    setIsSaving(true);
    setFlash(null);

    try {
      const payload = new URLSearchParams();
      payload.set('postback', 'postback');
      if (eeoSettings.enabled) payload.set('enabled', '1');
      if (eeoSettings.genderTracking) payload.set('genderTracking', '1');
      if (eeoSettings.ethnicTracking) payload.set('ethnicTracking', '1');
      if (eeoSettings.veteranTracking) payload.set('veteranTracking', '1');
      if (eeoSettings.disabilityTracking) payload.set('disabilityTracking', '1');
      const response = await submitSettingsModernJSON<ModernMutationResponse>(bootstrap, 'eeo', 'settings-eeo', payload);
      setFlash({ success: response.success, message: response.message || (response.success ? 'EEO settings saved.' : 'Unable to save EEO settings.') });
    } catch (error: unknown) {
      setFlash({ success: false, message: error instanceof Error ? error.message : 'Unable to save EEO settings.' });
    } finally {
      setIsSaving(false);
    }
  }, [bootstrap, eeoSettings, isSaving]);

  const rows = [
    { name: 'enabled', label: 'Enable Candidate EEO Tracking' },
    { name: 'genderTracking', label: 'Track Gender' },
    { name: 'ethnicTracking', label: 'Track Ethnic Background' },
    { name: 'veteranTracking', label: 'Track Veteran Status' },
    { name: 'disabilityTracking', label: 'Track Disability Status' }
  ] as const;

  return (
    <div className="avel-dashboard-page avel-settings-admin-page avel-settings-workflow-page">
      <PageContainer
        title="EEO Settings"
        subtitle="Keep candidate EEO tracking aligned with the legacy form fields and toggle behavior."
        actions={(
          <>
            <button type="submit" form="eeoSettingsForm" className="modern-btn modern-btn--emphasis" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Settings'}</button>
            <a className="modern-btn modern-btn--secondary" href={backURL}>Back To Settings</a>
            <a className="modern-btn modern-btn--secondary" href={legacyURL}>Open Legacy UI</a>
          </>
        )}
      >
        <div className="modern-dashboard avel-dashboard-shell">
          {flash ? <section className={`avel-settings-admin-flash ${flash.success ? 'is-success' : 'is-warning'}`} aria-live="polite"><strong>{flash.success ? 'Saved' : 'Warning'}</strong><span>{flash.message}</span></section> : null}
          <section className="avel-list-panel">
            <div className="avel-list-panel__header">
              <h2 className="avel-list-panel__title">EEO Tracking</h2>
              <p className="avel-list-panel__hint">The native card preserves the same `eeo` contract and checkbox names.</p>
            </div>
            <form id="eeoSettingsForm" className="avel-settings-user-form" action={submitURL} method="post" autoComplete="off" onSubmit={saveSettings}>
              <input type="hidden" name="postback" value="postback" />
              <div className="avel-settings-user-grid">
                {rows.map((field) => (
                  <label key={field.name} className="modern-checkbox avel-settings-user-field avel-settings-user-field--full">
                    <input type="checkbox" name={field.name} checked={Boolean(eeoSettings[field.name as keyof typeof eeoSettings])} onChange={(event) => enableTracking(field.name, event.target.checked)} />
                    <span>{field.label}</span>
                  </label>
                ))}
              </div>
              <div className="modern-compat-page__actions">
                <button type="submit" className="modern-btn modern-btn--emphasis" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Settings'}</button>
                <button type="button" className="modern-btn modern-btn--secondary" onClick={resetForm} disabled={isSaving}>Reset</button>
                <a className="modern-btn modern-btn--secondary" href={backURL}>Back To Settings</a>
                <a className="modern-btn modern-btn--secondary" href={legacyURL}>Open Legacy UI</a>
              </div>
            </form>
          </section>
        </div>
      </PageContainer>
    </div>
  );
}

function SettingsTalentFitFlowNativeShell({
  data,
  bootstrap
}: {
  data: SettingsTalentFitFlowModernData;
  bootstrap: UIModeBootstrap;
}) {
  const submitURL = ensureUIURL(data.actions.submitURL, 'legacy');
  const backURL = ensureModernUIURL(data.actions.backURL);
  const legacyURL = ensureUIURL(data.actions.legacyURL, 'legacy');
  const [formState, setFormState] = useState({
    baseUrl: String(data.settings.baseUrl || ''),
    apiKey: String(data.settings.apiKey || ''),
    hmacSecret: String(data.settings.hmacSecret || '')
  });
  const [isSaving, setIsSaving] = useState(false);
  const [flash, setFlash] = useState<{ success: boolean; message: string } | null>(data.state.saved ? { success: true, message: 'TalentFitFlow settings saved successfully.' } : null);
  const [testFeedback, setTestFeedback] = useState<string>(data.state.testMessage || '');

  useEffect(() => {
    setFormState({
      baseUrl: String(data.settings.baseUrl || ''),
      apiKey: String(data.settings.apiKey || ''),
      hmacSecret: String(data.settings.hmacSecret || '')
    });
    setFlash(data.state.saved ? { success: true, message: 'TalentFitFlow settings saved successfully.' } : null);
    setTestFeedback(data.state.testMessage || '');
  }, [data.settings, data.state.saved, data.state.testMessage]);

  const resetForm = useCallback(() => {
    setFormState({
      baseUrl: String(data.settings.baseUrl || ''),
      apiKey: String(data.settings.apiKey || ''),
      hmacSecret: String(data.settings.hmacSecret || '')
    });
    setFlash(null);
    setTestFeedback('');
  }, [data.settings]);

  const submitSettings = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSaving) return;
    setIsSaving(true);
    setFlash(null);
    try {
      const payload = new URLSearchParams();
      payload.set('postback', 'postback');
      payload.set('baseUrl', formState.baseUrl);
      payload.set('apiKey', formState.apiKey);
      payload.set('hmacSecret', formState.hmacSecret);
      const response = await submitSettingsModernJSON<ModernMutationResponse & { state?: { saved?: boolean; testOk?: boolean; testMessage?: string } }>(bootstrap, 'talentFitFlowSettings', 'settings-talent-fit-flow-settings', payload);
      setFlash({ success: response.success, message: response.message || (response.success ? 'TalentFitFlow settings saved.' : 'Unable to save TalentFitFlow settings.') });
      if (typeof response.state?.testMessage === 'string' && response.state.testMessage !== '') setTestFeedback(response.state.testMessage);
    } catch (error: unknown) {
      setFlash({ success: false, message: error instanceof Error ? error.message : 'Unable to save TalentFitFlow settings.' });
    } finally {
      setIsSaving(false);
    }
  }, [bootstrap, formState.apiKey, formState.baseUrl, formState.hmacSecret, isSaving]);

  const testConnection = useCallback(async () => {
    if (isSaving) return;
    setIsSaving(true);
    setFlash(null);
    setTestFeedback('');
    try {
      const payload = new URLSearchParams();
      payload.set('postback', 'postback');
      payload.set('baseUrl', formState.baseUrl);
      payload.set('apiKey', formState.apiKey);
      payload.set('hmacSecret', formState.hmacSecret);
      payload.set('testConnection', '1');
      const response = await submitSettingsModernJSON<ModernMutationResponse & { state?: { saved?: boolean; testOk?: boolean; testMessage?: string } }>(bootstrap, 'talentFitFlowSettings', 'settings-talent-fit-flow-settings', payload);
      setFlash({ success: response.success, message: response.message || (response.success ? 'TalentFitFlow connection test completed.' : 'Unable to test TalentFitFlow connection.') });
      setTestFeedback(response.state?.testMessage || response.message || (response.success ? 'Ping OK.' : 'Unable to test connection.'));
    } catch (error: unknown) {
      setFlash({ success: false, message: error instanceof Error ? error.message : 'Unable to test TalentFitFlow connection.' });
    } finally {
      setIsSaving(false);
    }
  }, [bootstrap, formState.apiKey, formState.baseUrl, formState.hmacSecret, isSaving]);

  return (
    <div className="avel-dashboard-page avel-settings-admin-page avel-settings-workflow-page">
      <PageContainer
        title="TalentFitFlow Settings"
        subtitle="Keep the integration form native while preserving the legacy save and test behavior."
        actions={(
          <>
            <button type="submit" form="tffSettingsForm" className="modern-btn modern-btn--emphasis" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Settings'}</button>
            <button type="button" className="modern-btn modern-btn--secondary" onClick={() => { void testConnection(); }} disabled={isSaving}>Test Connection</button>
            <a className="modern-btn modern-btn--secondary" href={backURL}>Back To Settings</a>
            <a className="modern-btn modern-btn--secondary" href={legacyURL}>Open Legacy UI</a>
          </>
        )}
      >
        <div className="modern-dashboard avel-dashboard-shell">
          {flash ? <section className={`avel-settings-admin-flash ${flash.success ? 'is-success' : 'is-warning'}`} aria-live="polite"><strong>{flash.success ? 'Saved' : 'Warning'}</strong><span>{flash.message}</span></section> : null}
          {testFeedback !== '' ? <section className="avel-settings-admin-flash is-info" aria-live="polite"><strong>Test</strong><span>{testFeedback}</span></section> : null}
          <section className="avel-list-panel">
            <div className="avel-list-panel__header">
              <h2 className="avel-list-panel__title">Integration Settings</h2>
              <p className="avel-list-panel__hint">The native shell keeps the legacy field names and test payload intact.</p>
            </div>
            <form id="tffSettingsForm" className="avel-settings-user-form" action={submitURL} method="post" autoComplete="off" onSubmit={submitSettings}>
              <input type="hidden" name="postback" value="postback" />
              <div className="avel-settings-user-grid">
                <label className="avel-settings-user-field avel-settings-user-field--full" htmlFor="baseUrl"><span>Base URL</span><input className="avel-form-control" type="text" id="baseUrl" name="baseUrl" value={formState.baseUrl} onChange={(event) => setFormState((current) => ({ ...current, baseUrl: event.target.value }))} /><div className="noteUnsized">Leave blank to use `TALENTFIT_BASE_URL` from the environment.</div></label>
                <label className="avel-settings-user-field avel-settings-user-field--full" htmlFor="apiKey"><span>API Key</span><input className="avel-form-control" type="text" id="apiKey" name="apiKey" value={formState.apiKey} onChange={(event) => setFormState((current) => ({ ...current, apiKey: event.target.value }))} /><div className="noteUnsized">Leave blank to use `OPENCATS_API_KEY` from the environment.</div></label>
                <label className="avel-settings-user-field avel-settings-user-field--full" htmlFor="hmacSecret"><span>HMAC Secret</span><input className="avel-form-control" type="password" id="hmacSecret" name="hmacSecret" value={formState.hmacSecret} onChange={(event) => setFormState((current) => ({ ...current, hmacSecret: event.target.value }))} /><div className="noteUnsized">Leave blank to use `OPENCATS_HMAC_SECRET` from the environment.</div></label>
              </div>
              <div className="modern-compat-page__actions">
                <button type="submit" className="modern-btn modern-btn--emphasis" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Settings'}</button>
                <button type="button" className="modern-btn modern-btn--secondary" onClick={resetForm} disabled={isSaving}>Reset</button>
                <a className="modern-btn modern-btn--secondary" href={backURL}>Back To Settings</a>
                <a className="modern-btn modern-btn--secondary" href={legacyURL}>Open Legacy UI</a>
              </div>
            </form>
          </section>
        </div>
      </PageContainer>
    </div>
  );
}

function SettingsNewInstallPasswordNativeShell({
  data,
  bootstrap
}: {
  data: SettingsWizardModernData;
  bootstrap: UIModeBootstrap;
}) {
  const submitURL = ensureUIURL(data.actions.submitURL, 'legacy');
  const legacyURL = ensureUIURL(data.actions.legacyURL, 'legacy');
  const [password1, setPassword1] = useState('');
  const [password2, setPassword2] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [flash, setFlash] = useState<ModernMutationResponse | null>(null);

  const submitSettings = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSaving) return;
    setIsSaving(true);
    setFlash(null);
    try {
      const payload = new URLSearchParams();
      payload.set('postback', 'postback');
      payload.set('password1', password1);
      payload.set('password2', password2);
      const response = await submitSettingsModernJSON<ModernMutationResponse & { actions?: { routeURL?: string } }>(bootstrap, 'newInstallPassword', 'settings-new-install-password', payload);
      if (response.success && response.actions?.routeURL) {
        window.location.assign(response.actions.routeURL);
        return;
      }
      setFlash({ success: response.success, message: response.message || (response.success ? 'Administrator password saved.' : 'Unable to save administrator password.') });
    } catch (error: unknown) {
      setFlash({ success: false, message: error instanceof Error ? error.message : 'Unable to save administrator password.' });
    } finally {
      setIsSaving(false);
    }
  }, [bootstrap, isSaving, password1, password2]);

  return (
    <div className="avel-dashboard-page avel-settings-admin-page avel-settings-workflow-page">
      <PageContainer
        title={data.wizard.title}
        subtitle="Create the initial administrator password without changing the legacy wizard fields."
        actions={(
          <>
            <button type="submit" form="newInstallPasswordForm" className="modern-btn modern-btn--emphasis" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Password'}</button>
            <a className="modern-btn modern-btn--secondary" href={legacyURL}>Open Legacy UI</a>
          </>
        )}
      >
        <div className="modern-dashboard avel-dashboard-shell">
          {flash ? <section className={`avel-settings-admin-flash ${flash.success ? 'is-success' : 'is-warning'}`} aria-live="polite"><strong>{flash.success ? 'Saved' : 'Warning'}</strong><span>{flash.message}</span></section> : null}
          <section className="avel-list-panel">
            <div className="avel-list-panel__header">
              <h2 className="avel-list-panel__title">{data.wizard.title}</h2>
              <p className="avel-list-panel__hint">{data.wizard.prompt}</p>
            </div>
            <form id="newInstallPasswordForm" className="avel-settings-password-form" action={submitURL} method="post" autoComplete="off" onSubmit={submitSettings}>
              <input type="hidden" name="postback" value="postback" />
              <div className="avel-settings-password-grid">
                <label className="avel-settings-password-field" htmlFor="password1"><span>New Password</span><input className="avel-form-control" type="password" id="password1" name="password1" value={password1} onChange={(event) => setPassword1(event.target.value)} autoComplete="new-password" /></label>
                <label className="avel-settings-password-field" htmlFor="password2"><span>Confirm New Password</span><input className="avel-form-control" type="password" id="password2" name="password2" value={password2} onChange={(event) => setPassword2(event.target.value)} autoComplete="new-password" /></label>
              </div>
              <div className="modern-compat-page__actions">
                <button type="submit" className="modern-btn modern-btn--emphasis" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Password'}</button>
                <button type="button" className="modern-btn modern-btn--secondary" onClick={() => { setPassword1(''); setPassword2(''); setFlash(null); }} disabled={isSaving}>Reset</button>
                <a className="modern-btn modern-btn--secondary" href={legacyURL}>Open Legacy UI</a>
              </div>
            </form>
          </section>
        </div>
      </PageContainer>
    </div>
  );
}

function SettingsNewSiteNameNativeShell({
  data,
  bootstrap
}: {
  data: SettingsWizardModernData;
  bootstrap: UIModeBootstrap;
}) {
  const submitURL = ensureUIURL(data.actions.submitURL, 'legacy');
  const legacyURL = ensureUIURL(data.actions.legacyURL, 'legacy');
  const [siteName, setSiteName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [flash, setFlash] = useState<ModernMutationResponse | null>(null);

  const submitSettings = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSaving) return;
    setIsSaving(true);
    setFlash(null);
    try {
      const payload = new URLSearchParams();
      payload.set('postback', 'postback');
      payload.set('siteName', siteName);
      const response = await submitSettingsModernJSON<ModernMutationResponse & { actions?: { routeURL?: string } }>(bootstrap, 'newSiteName', 'settings-new-site-name', payload);
      if (response.success && response.actions?.routeURL) {
        window.location.assign(response.actions.routeURL);
        return;
      }
      setFlash({ success: response.success, message: response.message || (response.success ? 'Site name saved.' : 'Unable to save site name.') });
    } catch (error: unknown) {
      setFlash({ success: false, message: error instanceof Error ? error.message : 'Unable to save site name.' });
    } finally {
      setIsSaving(false);
    }
  }, [bootstrap, isSaving, siteName]);

  return (
    <div className="avel-dashboard-page avel-settings-admin-page avel-settings-workflow-page">
      <PageContainer
        title={data.wizard.title}
        subtitle="Set the site name to finish initial setup without leaving the native wizard shell."
        actions={(
          <>
            <button type="submit" form="newSiteNameForm" className="modern-btn modern-btn--emphasis" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Site Name'}</button>
            <a className="modern-btn modern-btn--secondary" href={legacyURL}>Open Legacy UI</a>
          </>
        )}
      >
        <div className="modern-dashboard avel-dashboard-shell">
          {flash ? <section className={`avel-settings-admin-flash ${flash.success ? 'is-success' : 'is-warning'}`} aria-live="polite"><strong>{flash.success ? 'Saved' : 'Warning'}</strong><span>{flash.message}</span></section> : null}
          <section className="avel-list-panel">
            <div className="avel-list-panel__header">
              <h2 className="avel-list-panel__title">{data.wizard.title}</h2>
              <p className="avel-list-panel__hint">{data.wizard.prompt}</p>
            </div>
            <form id="newSiteNameForm" className="avel-settings-password-form" action={submitURL} method="post" autoComplete="off" onSubmit={submitSettings}>
              <input type="hidden" name="postback" value="postback" />
              <div className="avel-settings-password-grid">
                <label className="avel-settings-password-field" htmlFor="siteName"><span>{data.wizard.inputTypeTextParam || 'Site Name'}</span><input className="avel-form-control" type="text" id="siteName" name="siteName" value={siteName} onChange={(event) => setSiteName(event.target.value)} autoComplete="organization" /></label>
              </div>
              <div className="modern-compat-page__actions">
                <button type="submit" className="modern-btn modern-btn--emphasis" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Site Name'}</button>
                <button type="button" className="modern-btn modern-btn--secondary" onClick={() => { setSiteName(''); setFlash(null); }} disabled={isSaving}>Reset</button>
                <a className="modern-btn modern-btn--secondary" href={legacyURL}>Open Legacy UI</a>
              </div>
            </form>
          </section>
        </div>
      </PageContainer>
    </div>
  );
}

function SettingsLoginActivityNativeShell({
  data
}: {
  data: SettingsLoginActivityModernDataResponse;
}) {
  const routeURL = ensureModernUIURL(data.actions.routeURL);
  const backURL = ensureModernUIURL(data.actions.backURL);
  const legacyURL = ensureUIURL(data.actions.legacyURL, 'legacy');
  const currentSortDirection = data.meta.sortDirection === 'ASC' ? 'ASC' : 'DESC';

  const buildPageURL = (page: number): string => buildRouteWithParams(routeURL, {
    view: data.meta.view,
    page,
    sortBy: data.meta.sortBy,
    sortDirection: currentSortDirection
  });

  const buildSortURL = (sortBy: string): string => {
    const nextDirection = data.meta.sortBy === sortBy && currentSortDirection === 'ASC' ? 'DESC' : 'ASC';
    return buildRouteWithParams(routeURL, {
      view: data.meta.view,
      page: data.meta.page,
      sortBy,
      sortDirection: nextDirection
    });
  };

  return (
    <div className="avel-dashboard-page avel-settings-admin-page avel-settings-workflow-page">
      <PageContainer
        title="Login Activity"
        subtitle="Track successful and unsuccessful logins without leaving the modern workspace."
        actions={(
          <>
            <a className="modern-btn modern-btn--secondary" href={backURL}>
              Back To Settings
            </a>
            <a className="modern-btn modern-btn--secondary" href={legacyURL}>
              Open Legacy UI
            </a>
          </>
        )}
      >
        <div className="modern-dashboard avel-dashboard-shell">
          <section className="avel-settings-admin-summary">
            <article className="avel-settings-admin-summary-card is-info">
              <span className="avel-settings-admin-summary-label">Current View</span>
              <strong className="avel-settings-admin-summary-value">
                {data.meta.view === 'unsuccessful' ? 'Unsuccessful Logins' : 'Successful Logins'}
              </strong>
              <span className="avel-settings-admin-summary-note">Switch views without leaving this page.</span>
            </article>
            <article className="avel-settings-admin-summary-card is-info">
              <span className="avel-settings-admin-summary-label">Rows</span>
              <strong className="avel-settings-admin-summary-value">{data.meta.totalRows}</strong>
              <span className="avel-settings-admin-summary-note">
                Page {data.meta.page} of {Math.max(1, data.meta.totalPages)}
              </span>
            </article>
          </section>

          <section className="avel-list-panel">
            <div className="avel-list-panel__header">
              <h2 className="avel-list-panel__title">View</h2>
              <p className="avel-list-panel__hint">Choose which login stream to inspect.</p>
            </div>
            <div className="modern-compat-page__actions">
              <a
                className={`modern-btn ${data.meta.view === 'successful' ? 'modern-btn--emphasis' : 'modern-btn--secondary'}`}
                href={buildRouteWithParams(routeURL, { view: 'successful', page: 1 })}
              >
                Successful Logins
              </a>
              <a
                className={`modern-btn ${data.meta.view === 'unsuccessful' ? 'modern-btn--emphasis' : 'modern-btn--secondary'}`}
                href={buildRouteWithParams(routeURL, { view: 'unsuccessful', page: 1 })}
              >
                Unsuccessful Logins
              </a>
            </div>
          </section>

          <section className="avel-list-panel">
            <div className="avel-list-panel__header">
              <h2 className="avel-list-panel__title">Recent Entries</h2>
              <p className="avel-list-panel__hint">Sort by user, endpoint, browser fingerprint, or timestamp.</p>
            </div>

            <div className="avel-settings-table-wrap">
              <table className="avel-settings-table">
                <thead>
                  <tr>
                    <th><a href={buildSortURL('firstName')}>First Name</a></th>
                    <th><a href={buildSortURL('lastName')}>Last Name</a></th>
                    <th><a href={buildSortURL('ip')}>IP</a></th>
                    <th><a href={buildSortURL('hostname')}>Hostname</a></th>
                    <th><a href={buildSortURL('shortUserAgent')}>User Agent</a></th>
                    <th><a href={buildSortURL('dateSort')}>Date / Time</a></th>
                  </tr>
                </thead>
                <tbody>
                  {data.rows.length === 0 ? (
                    <tr>
                      <td colSpan={6}>No login entries found for this view.</td>
                    </tr>
                  ) : (
                    data.rows.map((row) => (
                      <tr key={row.userLoginID}>
                        <td><a href={ensureUIURL(row.userURL, 'legacy')}>{row.firstName || '--'}</a></td>
                        <td><a href={ensureUIURL(row.userURL, 'legacy')}>{row.lastName || '--'}</a></td>
                        <td>{row.ip || '--'}</td>
                        <td>{row.hostname || '--'}</td>
                        <td>{row.shortUserAgent || '--'}</td>
                        <td>{row.date || '--'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="modern-compat-page__actions">
              <a
                className="modern-btn modern-btn--secondary"
                href={buildPageURL(Math.max(1, data.meta.page - 1))}
                aria-disabled={data.meta.page <= 1}
              >
                Previous
              </a>
              <span className="avel-settings-page-indicator">
                Page {data.meta.page} / {Math.max(1, data.meta.totalPages)}
              </span>
              <a
                className="modern-btn modern-btn--secondary"
                href={buildPageURL(Math.min(Math.max(1, data.meta.totalPages), data.meta.page + 1))}
                aria-disabled={data.meta.page >= data.meta.totalPages}
              >
                Next
              </a>
            </div>
          </section>
        </div>
      </PageContainer>
    </div>
  );
}

function SettingsRejectionReasonsNativeShell({
  data
}: {
  data: SettingsRejectionReasonsModernDataResponse;
}) {
  const backURL = ensureModernUIURL(data.actions.backURL);
  const legacyURL = ensureUIURL(data.actions.legacyURL, 'legacy');

  return (
    <div className="avel-dashboard-page avel-settings-admin-page avel-settings-workflow-page">
      <PageContainer
        title="Rejection Reasons"
        subtitle="Maintain pipeline rejection labels while preserving the legacy postback contract."
        actions={(
          <>
            <a className="modern-btn modern-btn--secondary" href={backURL}>
              Back To Settings
            </a>
            <a className="modern-btn modern-btn--secondary" href={legacyURL}>
              Open Legacy UI
            </a>
          </>
        )}
      >
        <div className="modern-dashboard avel-dashboard-shell">
          {data.flash.saved ? (
            <section className="avel-settings-admin-flash is-success" aria-live="polite">
              <strong>Saved</strong>
              <span>{data.flash.message}</span>
            </section>
          ) : null}

          <section className="avel-list-panel">
            <div className="avel-list-panel__header">
              <h2 className="avel-list-panel__title">Add New Reason</h2>
              <p className="avel-list-panel__hint">Adds a reusable reason for rejection flows.</p>
            </div>
            <form className="avel-settings-inline-form" action={data.actions.submitURL} method="post" autoComplete="off">
              <input type="hidden" name="postback" value="postback" />
              <input type="hidden" name="action" value="add" />
              <label className="avel-settings-inline-field" htmlFor="newLabel">
                <span>New Reason</span>
                <input className="avel-form-control" type="text" name="newLabel" id="newLabel" />
              </label>
              <button type="submit" className="modern-btn modern-btn--emphasis">Add</button>
            </form>
          </section>

          <section className="avel-list-panel">
            <div className="avel-list-panel__header">
              <h2 className="avel-list-panel__title">Existing Reasons</h2>
              <p className="avel-list-panel__hint">Reasons cannot be deleted; update labels to keep history intact.</p>
            </div>

            <div className="avel-settings-form-stack">
              {data.rejectionReasons.map((reason) => (
                <form key={reason.rejectionReasonID} className="avel-settings-inline-form" action={data.actions.submitURL} method="post" autoComplete="off">
                  <input type="hidden" name="postback" value="postback" />
                  <input type="hidden" name="action" value="update" />
                  <input type="hidden" name="reasonID" value={reason.rejectionReasonID} />
                  <label className="avel-settings-inline-field">
                    <span>Reason Label</span>
                    <input className="avel-form-control" type="text" name="label" defaultValue={reason.label} />
                  </label>
                  <button type="submit" className="modern-btn modern-btn--secondary">Save</button>
                </form>
              ))}
            </div>
          </section>
        </div>
      </PageContainer>
    </div>
  );
}

type SettingsEmailTemplateRouteActionMode = 'view' | 'add' | 'delete';

function resolveSettingsEmailTemplateRouteActionMode(routeKey: string): SettingsEmailTemplateRouteActionMode {
  if (routeKey === 'settings.addemailtemplate') {
    return 'add';
  }
  if (routeKey === 'settings.deleteemailtemplate') {
    return 'delete';
  }
  return 'view';
}

function SettingsEmailTemplatesNativeShell({
  data,
  bootstrap,
  routeKey,
  onReload
}: {
  data: SettingsEmailTemplatesModernDataResponse;
  bootstrap: UIModeBootstrap;
  routeKey: string;
  onReload: () => void;
}) {
  const routeActionMode = useMemo(
    () => resolveSettingsEmailTemplateRouteActionMode(routeKey),
    [routeKey]
  );
  const routeURL = ensureModernUIURL(data.actions.routeURL);
  const submitURL = ensureUIURL(data.actions.submitURL, 'legacy');
  const addTemplateURL = ensureUIURL(data.actions.addTemplateURL, 'legacy');
  const deleteTemplateURL = ensureUIURL(data.actions.deleteTemplateURL, 'legacy');
  const backURL = ensureModernUIURL(data.actions.backURL);
  const legacyURL = ensureUIURL(data.actions.legacyURL, 'legacy');
  const [selectedTemplateID, setSelectedTemplateID] = useState(0);
  const [emailTemplateTitle, setEmailTemplateTitle] = useState('');
  const [messageText, setMessageText] = useState('');
  const [messageTextOrigional, setMessageTextOrigional] = useState('');
  const [useThisTemplate, setUseThisTemplate] = useState(true);
  const [busyAction, setBusyAction] = useState('');
  const [feedback, setFeedback] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [autoActionHandled, setAutoActionHandled] = useState(false);
  const messageTextRef = useRef<HTMLTextAreaElement | null>(null);

  const selectedTemplate = useMemo(
    () => data.templates.find((template) => template.emailTemplateID === selectedTemplateID) ?? null,
    [data.templates, selectedTemplateID]
  );

  const availableMergeTokens = useMemo(() => {
    const helperTokens = data.helpers.mergeFields.length > 0
      ? data.helpers.mergeFields
      : EMAIL_TEMPLATE_CONDITIONAL_MERGE_TOKENS;
    const uniqueByValue = new Map<string, SettingsEmailTemplateToken>();
    helperTokens.forEach((token) => {
      const value = String(token.value || '').trim();
      if (value === '') {
        return;
      }
      uniqueByValue.set(value, {
        label: String(token.label || value).trim() || value,
        value
      });
    });
    return Array.from(uniqueByValue.values());
  }, [data.helpers.mergeFields]);

  const templateVariableSet = useMemo(
    () => parseTemplateVariableSet(selectedTemplate?.possibleVariables || ''),
    [selectedTemplate?.possibleVariables]
  );

  const visibleMergeTokens = useMemo(() => {
    if (templateVariableSet.size === 0) {
      return availableMergeTokens;
    }

    return availableMergeTokens.filter((token) => templateVariableSet.has(token.value));
  }, [availableMergeTokens, templateVariableSet]);

  const initializeEditorFromTemplate = useCallback((template: SettingsEmailTemplate | null) => {
    if (template === null) {
      setEmailTemplateTitle('');
      setMessageText('');
      setMessageTextOrigional('');
      setUseThisTemplate(true);
      return;
    }

    setEmailTemplateTitle(template.emailTemplateTitle);
    setMessageText(template.text);
    setMessageTextOrigional(template.messageTextOrigional);
    setUseThisTemplate(!template.disabled);
  }, []);

  useEffect(() => {
    if (data.templates.length === 0) {
      setSelectedTemplateID(0);
      initializeEditorFromTemplate(null);
      return;
    }

    if (selectedTemplateID > 0 && data.templates.some((template) => template.emailTemplateID === selectedTemplateID)) {
      return;
    }

    const query = new URLSearchParams(window.location.search);
    const requestedTemplateID = toSafeNumber(query.get('templateID') || query.get('id'));
    const preferredTemplateID = data.templates.some((template) => template.emailTemplateID === requestedTemplateID)
      ? requestedTemplateID
      : data.templates[data.templates.length - 1].emailTemplateID;
    setSelectedTemplateID(preferredTemplateID);
  }, [data.templates, initializeEditorFromTemplate, selectedTemplateID]);

  useEffect(() => {
    initializeEditorFromTemplate(selectedTemplate);
  }, [initializeEditorFromTemplate, selectedTemplate]);

  const applyMutation = useCallback(async (
    actionLabel: string,
    fetcherNames: readonly string[],
    mutationPayload: URLSearchParams,
    fallbackRequest: () => Promise<Response>
  ) => {
    const mutationFetcher = getSettingsAPIAsyncFunction(fetcherNames);
    if (mutationFetcher !== null) {
      const mutationResponse = await mutationFetcher(bootstrap, mutationPayload);
      return normalizeSettingsEmailTemplateMutationResponse(mutationResponse, `${actionLabel} complete.`);
    }

    const response = await fallbackRequest();
    if (!response.ok) {
      throw new Error(`${actionLabel} failed (${response.status}).`);
    }
    return {
      success: true,
      message: `${actionLabel} complete.`
    } satisfies SettingsEmailTemplateMutationResponse;
  }, [bootstrap]);

  const saveTemplate = useCallback(async () => {
    if (selectedTemplate === null) {
      return;
    }

    setBusyAction('save');
    setFeedback('');
    setErrorMessage('');

    const postBody = new URLSearchParams();
    postBody.set('postback', 'postback');
    postBody.set('templateID', String(selectedTemplate.emailTemplateID));
    if (selectedTemplate.canDelete) {
      postBody.set('emailTemplateTitle', emailTemplateTitle);
    }
    postBody.set('messageText', messageText);
    postBody.set('messageTextOrigional', messageTextOrigional);
    if (useThisTemplate) {
      postBody.set('useThisTemplate', 'on');
    }

    try {
      const mutationResponse = await applyMutation(
        'Save template',
        SETTINGS_EMAIL_TEMPLATE_SAVE_MUTATION_NAMES,
        postBody,
        async () => fetch(submitURL, {
          method: 'POST',
          credentials: 'same-origin',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: postBody.toString()
        })
      );

      if (!mutationResponse.success) {
        throw new Error(mutationResponse.message || 'Unable to save template.');
      }

      setFeedback(mutationResponse.message || 'Template saved.');
      onReload();
    } catch (error: unknown) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to save template.');
    } finally {
      setBusyAction('');
    }
  }, [
    applyMutation,
    emailTemplateTitle,
    messageText,
    messageTextOrigional,
    onReload,
    selectedTemplate,
    submitURL,
    useThisTemplate
  ]);

  const addTemplate = useCallback(async (redirectToWorkspace: boolean) => {
    setBusyAction('add');
    setFeedback('');
    setErrorMessage('');

    try {
      const mutationResponse = await applyMutation(
        'Add template',
        SETTINGS_EMAIL_TEMPLATE_ADD_MUTATION_NAMES,
        new URLSearchParams(),
        async () => fetch(addTemplateURL, {
          credentials: 'same-origin'
        })
      );

      if (!mutationResponse.success) {
        throw new Error(mutationResponse.message || 'Unable to add template.');
      }

      if (redirectToWorkspace) {
        window.location.assign(routeURL);
        return;
      }

      setFeedback(mutationResponse.message || 'Template added.');
      onReload();
    } catch (error: unknown) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to add template.');
    } finally {
      setBusyAction('');
    }
  }, [addTemplateURL, applyMutation, onReload, routeURL]);

  const deleteTemplate = useCallback(async (templateID: number, redirectToWorkspace: boolean) => {
    if (templateID <= 0) {
      setErrorMessage('Template ID is required.');
      return;
    }

    setBusyAction('delete');
    setFeedback('');
    setErrorMessage('');

    const deletePayload = new URLSearchParams();
    deletePayload.set('id', String(templateID));

    try {
      const mutationResponse = await applyMutation(
        'Delete template',
        SETTINGS_EMAIL_TEMPLATE_DELETE_MUTATION_NAMES,
        deletePayload,
        async () => {
          const requestURL = new URL(deleteTemplateURL, window.location.href);
          requestURL.searchParams.set('id', String(templateID));
          return fetch(requestURL.toString(), {
            credentials: 'same-origin'
          });
        }
      );

      if (!mutationResponse.success) {
        throw new Error(mutationResponse.message || 'Unable to delete template.');
      }

      if (redirectToWorkspace) {
        window.location.assign(routeURL);
        return;
      }

      setFeedback(mutationResponse.message || 'Template deleted.');
      onReload();
    } catch (error: unknown) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to delete template.');
    } finally {
      setBusyAction('');
    }
  }, [applyMutation, deleteTemplateURL, onReload, routeURL]);

  useEffect(() => {
    if (routeActionMode === 'view' || autoActionHandled) {
      return;
    }

    setAutoActionHandled(true);

    if (routeActionMode === 'add') {
      void addTemplate(true);
      return;
    }

    const query = new URLSearchParams(window.location.search);
    const templateID = toSafeNumber(query.get('id') || query.get('templateID'));
    void deleteTemplate(templateID, true);
  }, [addTemplate, autoActionHandled, deleteTemplate, routeActionMode]);

  const resetTemplateDraft = useCallback(() => {
    initializeEditorFromTemplate(selectedTemplate);
  }, [initializeEditorFromTemplate, selectedTemplate]);

  const insertAtCursor = useCallback((insertText: string) => {
    const textArea = messageTextRef.current;
    if (!textArea) {
      setMessageText((currentValue) => `${currentValue}${insertText}`);
      return;
    }

    const startPos = textArea.selectionStart ?? textArea.value.length;
    const endPos = textArea.selectionEnd ?? textArea.value.length;
    setUseThisTemplate(true);
    setMessageText((currentValue) => {
      const currentStart = Math.max(0, Math.min(startPos, currentValue.length));
      const currentEnd = Math.max(currentStart, Math.min(endPos, currentValue.length));
      const nextValue = `${currentValue.slice(0, currentStart)}${insertText}${currentValue.slice(currentEnd)}`;
      window.requestAnimationFrame(() => {
        const nextPosition = currentStart + insertText.length;
        if (messageTextRef.current) {
          messageTextRef.current.focus();
          messageTextRef.current.setSelectionRange(nextPosition, nextPosition);
        }
      });
      return nextValue;
    });
  }, []);

  const isBusy = busyAction !== '';
  const canDeleteSelectedTemplate = selectedTemplate?.canDelete === true;

  return (
    <div className="avel-dashboard-page avel-settings-admin-page avel-settings-workflow-page avel-settings-user-page">
      <PageContainer
        title="Email Templates"
        subtitle="Manage template copy, merge fields, and activation settings without leaving the modern shell."
        actions={(
          <>
            <button
              type="button"
              className="modern-btn modern-btn--emphasis"
              onClick={() => {
                void addTemplate(false);
              }}
              disabled={isBusy}
            >
              {busyAction === 'add' ? 'Adding...' : 'Add Template'}
            </button>
            <a className="modern-btn modern-btn--secondary" href={backURL}>
              Back To Settings
            </a>
            <a className="modern-btn modern-btn--secondary" href={legacyURL}>
              Open Legacy UI
            </a>
          </>
        )}
      >
        <div className="modern-dashboard avel-dashboard-shell">
          {data.flash?.saved && data.flash.message !== '' ? (
            <section className={`avel-settings-admin-flash ${data.flash.success ? 'is-success' : 'is-warning'}`} aria-live="polite">
              <strong>{data.flash.success ? 'Saved' : 'Notice'}</strong>
              <span>{data.flash.message}</span>
            </section>
          ) : null}
          {feedback !== '' ? (
            <section className="avel-settings-admin-flash is-success" aria-live="polite">
              <strong>Done</strong>
              <span>{feedback}</span>
            </section>
          ) : null}
          {errorMessage !== '' ? (
            <section className="avel-settings-admin-flash is-warning" aria-live="polite">
              <strong>Error</strong>
              <span>{errorMessage}</span>
            </section>
          ) : null}
          {(routeActionMode === 'add' || routeActionMode === 'delete') ? (
            <section className="modern-state" aria-live="polite">
              {routeActionMode === 'add' ? 'Running native add-template action...' : 'Running native delete-template action...'}
            </section>
          ) : null}

          <div className="avel-settings-user-layout">
            <section className="avel-list-panel avel-settings-user-layout__main">
              <div className="avel-list-panel__header">
                <h2 className="avel-list-panel__title">Template Workspace</h2>
                <p className="avel-list-panel__hint">
                  Select a template, edit the message body, and save through the existing settings payload contract.
                </p>
              </div>

              {data.templates.length === 0 ? (
                <div className="modern-state">No email templates are available for this site.</div>
              ) : (
                <>
                  <label className="avel-settings-inline-field" htmlFor="emailTemplateIDSelect">
                    <span>Template</span>
                    <select
                      className="avel-form-control"
                      id="emailTemplateIDSelect"
                      value={selectedTemplateID > 0 ? String(selectedTemplateID) : ''}
                      onChange={(event) => {
                        setSelectedTemplateID(toSafeNumber(event.target.value));
                      }}
                    >
                      {data.templates.map((template) => (
                        <option key={template.emailTemplateID} value={template.emailTemplateID}>
                          {template.emailTemplateTitle}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="avel-settings-inline-actions">
                    {data.templates.map((template) => (
                      <button
                        key={template.emailTemplateID}
                        type="button"
                        className={`modern-btn ${template.emailTemplateID === selectedTemplateID ? 'modern-btn--emphasis' : 'modern-btn--secondary'} modern-btn--mini`}
                        onClick={() => {
                          setSelectedTemplateID(template.emailTemplateID);
                        }}
                      >
                        {template.emailTemplateTitle}
                      </button>
                    ))}
                  </div>

                  {selectedTemplate ? (
                    <form
                      className="avel-settings-user-form"
                      action={submitURL}
                      method="post"
                      autoComplete="off"
                      onSubmit={(event) => {
                        event.preventDefault();
                        void saveTemplate();
                      }}
                    >
                      <input type="hidden" name="postback" value="postback" />
                      <input type="hidden" name="templateID" value={selectedTemplate.emailTemplateID} />
                      <input type="hidden" name="messageTextOrigional" value={messageTextOrigional} />
                      {selectedTemplate.canDelete ? (
                        <label className="avel-settings-user-field avel-settings-user-field--full" htmlFor="emailTemplateTitle">
                          <span>Template Title</span>
                          <input
                            className="avel-form-control"
                            id="emailTemplateTitle"
                            name="emailTemplateTitle"
                            type="text"
                            value={emailTemplateTitle}
                            onChange={(event) => {
                              setEmailTemplateTitle(event.target.value);
                            }}
                          />
                        </label>
                      ) : null}

                      <div className="avel-settings-long-field">
                        <h3>Message</h3>
                        <textarea
                          ref={messageTextRef}
                          className="avel-form-control avel-settings-prewrap"
                          id="messageText"
                          name="messageText"
                          rows={14}
                          value={messageText}
                          onChange={(event) => {
                            setMessageText(event.target.value);
                          }}
                          disabled={!useThisTemplate}
                        />
                        <label className="avel-settings-user-field--check" htmlFor={`useThisTemplate-${selectedTemplate.emailTemplateID}`}>
                          <input
                            id={`useThisTemplate-${selectedTemplate.emailTemplateID}`}
                            name="useThisTemplate"
                            type="checkbox"
                            checked={useThisTemplate}
                            onChange={(event) => {
                              setUseThisTemplate(event.target.checked);
                            }}
                          />
                          <span>Use this Template / Feature</span>
                        </label>
                      </div>

                      <div className="modern-compat-page__actions">
                        <button type="submit" className="modern-btn modern-btn--emphasis" disabled={isBusy}>
                          {busyAction === 'save' ? 'Saving...' : 'Save Template'}
                        </button>
                        <button type="button" className="modern-btn modern-btn--secondary" onClick={resetTemplateDraft} disabled={isBusy}>
                          Reset Template
                        </button>
                        {canDeleteSelectedTemplate ? (
                          <button
                            type="button"
                            className="modern-btn modern-btn--danger"
                            onClick={() => {
                              if (selectedTemplate === null) {
                                return;
                              }
                              if (!window.confirm('Delete this custom template?')) {
                                return;
                              }
                              void deleteTemplate(selectedTemplate.emailTemplateID, false);
                            }}
                            disabled={isBusy}
                          >
                            {busyAction === 'delete' ? 'Deleting...' : 'Delete Template'}
                          </button>
                        ) : null}
                      </div>
                    </form>
                  ) : null}
                </>
              )}
            </section>

            <aside className="avel-list-panel avel-settings-user-layout__sidebar">
              <div className="avel-list-panel__header">
                <h2 className="avel-list-panel__title">Template Helpers</h2>
                <p className="avel-list-panel__hint">
                  Insert formatting and merge variables directly into the active message.
                </p>
              </div>

              <div className="avel-settings-form-stack">
                <article className="avel-settings-admin-summary-card is-info">
                  <span className="avel-settings-admin-summary-label">Active Template</span>
                  <strong className="avel-settings-admin-summary-value">{selectedTemplate?.emailTemplateTitle || '--'}</strong>
                  <span className="avel-settings-admin-summary-note">
                    {selectedTemplate ? `Template #${selectedTemplate.emailTemplateID}` : 'Select a template to begin editing.'}
                  </span>
                </article>
                <article className="avel-settings-admin-summary-card is-info">
                  <span className="avel-settings-admin-summary-label">Status</span>
                  <strong className="avel-settings-admin-summary-value">{useThisTemplate ? 'Enabled' : 'Disabled'}</strong>
                  <span className="avel-settings-admin-summary-note">
                    {useThisTemplate
                      ? 'Template text will be used by the legacy send flow.'
                      : 'Template falls back to stored original text.'}
                  </span>
                </article>
              </div>

              <div className="avel-settings-form-stack">
                <div>
                  <h3 className="avel-list-panel__title">Insert Formatting</h3>
                  <div className="avel-settings-inline-actions">
                    {EMAIL_TEMPLATE_FORMATTING_TOKENS.map((token) => (
                      <button
                        key={token.value}
                        type="button"
                        className="modern-btn modern-btn--secondary modern-btn--mini"
                        onClick={() => {
                          insertAtCursor(token.value);
                        }}
                        disabled={selectedTemplate === null}
                      >
                        {token.label}
                      </button>
                    ))}
                  </div>
                </div>

                {!data.state.noGlobalTemplates ? (
                  <div>
                    <h3 className="avel-list-panel__title">Global Merge Fields</h3>
                    <div className="avel-settings-inline-actions">
                      {EMAIL_TEMPLATE_GLOBAL_MERGE_TOKENS.map((token) => (
                        <button
                          key={token.value}
                          type="button"
                          className="modern-btn modern-btn--secondary modern-btn--mini"
                          onClick={() => {
                            insertAtCursor(token.value);
                          }}
                          disabled={selectedTemplate === null}
                        >
                          {token.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div>
                  <h3 className="avel-list-panel__title">Mail Merge Fields</h3>
                  {visibleMergeTokens.length === 0 ? (
                    <div className="modern-state">No merge fields available for the selected template.</div>
                  ) : (
                    <div className="avel-settings-inline-actions">
                      {visibleMergeTokens.map((token) => (
                        <button
                          key={token.value}
                          type="button"
                          className="modern-btn modern-btn--secondary modern-btn--mini"
                          onClick={() => {
                            insertAtCursor(token.value);
                          }}
                          disabled={selectedTemplate === null}
                        >
                          {token.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="modern-compat-page__actions">
                <button
                  type="button"
                  className="modern-btn modern-btn--emphasis"
                  onClick={() => {
                    void addTemplate(false);
                  }}
                  disabled={isBusy}
                >
                  {busyAction === 'add' ? 'Adding...' : 'Add Template'}
                </button>
                <a className="modern-btn modern-btn--secondary" href={routeURL}>
                  Reload Templates
                </a>
                <a className="modern-btn modern-btn--secondary" href={backURL}>
                  Back To Settings
                </a>
                <a className="modern-btn modern-btn--secondary" href={legacyURL}>
                  Open Legacy UI
                </a>
              </div>
            </aside>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}

function SettingsTagsNativeShell({
  data,
  onReload
}: {
  data: SettingsTagsModernDataResponse;
  onReload: () => void;
}) {
  const backURL = ensureModernUIURL(data.actions.backURL);
  const legacyURL = ensureUIURL(data.actions.legacyURL, 'legacy');
  const [newRootTag, setNewRootTag] = useState('');
  const [childDraftByParentID, setChildDraftByParentID] = useState<Record<string, string>>({});
  const [editDraftByTagID, setEditDraftByTagID] = useState<Record<string, string>>({});
  const [busyAction, setBusyAction] = useState('');
  const [feedback, setFeedback] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const parentTags = useMemo(
    () => data.tags.filter((tag) => Number(tag.parentTagID || 0) <= 0),
    [data.tags]
  );

  const childTagsByParentID = useMemo(() => {
    const map: Record<number, Array<SettingsTagsModernDataResponse['tags'][number]>> = {};
    data.tags.forEach((tag) => {
      const parentID = Number(tag.parentTagID || 0);
      if (parentID <= 0) {
        return;
      }
      if (!map[parentID]) {
        map[parentID] = [];
      }
      map[parentID].push(tag);
    });
    return map;
  }, [data.tags]);

  const runTagMutation = useCallback(async (actionLabel: string, url: string, body: URLSearchParams) => {
    setBusyAction(actionLabel);
    setErrorMessage('');
    setFeedback('');

    try {
      const response = await fetch(url, {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: body.toString()
      });

      if (!response.ok) {
        throw new Error(`${actionLabel} failed (${response.status}).`);
      }

      setFeedback(`${actionLabel} complete.`);
      onReload();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : `${actionLabel} failed.`;
      setErrorMessage(message);
    } finally {
      setBusyAction('');
    }
  }, [onReload]);

  const addRootTag = useCallback(() => {
    const title = newRootTag.trim();
    if (title === '') {
      return;
    }

    const body = new URLSearchParams();
    body.set('tag_title', title);
    void runTagMutation('Add tag', data.actions.addURL, body).then(() => {
      setNewRootTag('');
    });
  }, [data.actions.addURL, newRootTag, runTagMutation]);

  const addChildTag = useCallback((parentID: number) => {
    const key = String(parentID);
    const title = String(childDraftByParentID[key] || '').trim();
    if (title === '') {
      return;
    }

    const body = new URLSearchParams();
    body.set('tag_parent_id', String(parentID));
    body.set('tag_title', title);
    void runTagMutation('Add child tag', data.actions.addURL, body).then(() => {
      setChildDraftByParentID((current) => ({
        ...current,
        [key]: ''
      }));
    });
  }, [childDraftByParentID, data.actions.addURL, runTagMutation]);

  const updateTag = useCallback((tagID: number, fallbackTitle: string) => {
    const key = String(tagID);
    const title = String(editDraftByTagID[key] || fallbackTitle || '').trim();
    if (title === '') {
      return;
    }

    const body = new URLSearchParams();
    body.set('tag_id', String(tagID));
    body.set('tag_title', title);
    void runTagMutation('Update tag', data.actions.updateURL, body);
  }, [data.actions.updateURL, editDraftByTagID, runTagMutation]);

  const deleteTag = useCallback((tagID: number) => {
    if (!window.confirm('Are you sure you want to delete this tag?')) {
      return;
    }

    const body = new URLSearchParams();
    body.set('tag_id', String(tagID));
    void runTagMutation('Delete tag', data.actions.deleteURL, body);
  }, [data.actions.deleteURL, runTagMutation]);

  return (
    <div className="avel-dashboard-page avel-settings-admin-page avel-settings-workflow-page">
      <PageContainer
        title="Tags"
        subtitle="Add, rename, and remove hierarchical tags with legacy-compatible endpoints."
        actions={(
          <>
            <a className="modern-btn modern-btn--secondary" href={backURL}>
              Back To Settings
            </a>
            <a className="modern-btn modern-btn--secondary" href={legacyURL}>
              Open Legacy UI
            </a>
          </>
        )}
      >
        <div className="modern-dashboard avel-dashboard-shell">
          {feedback !== '' ? (
            <section className="avel-settings-admin-flash is-success" aria-live="polite">
              <strong>Saved</strong>
              <span>{feedback}</span>
            </section>
          ) : null}
          {errorMessage !== '' ? (
            <section className="avel-settings-admin-flash is-warning" aria-live="polite">
              <strong>Warning</strong>
              <span>{errorMessage}</span>
            </section>
          ) : null}

          <section className="avel-list-panel">
            <div className="avel-list-panel__header">
              <h2 className="avel-list-panel__title">Top-Level Tags</h2>
              <p className="avel-list-panel__hint">Create root tags first, then nest child tags below each parent.</p>
            </div>
            <div className="avel-settings-inline-form">
              <label className="avel-settings-inline-field" htmlFor="newRootTag">
                <span>Tag Name</span>
                <input
                  id="newRootTag"
                  className="avel-form-control"
                  type="text"
                  value={newRootTag}
                  onChange={(event) => setNewRootTag(event.target.value)}
                />
              </label>
              <button
                type="button"
                className="modern-btn modern-btn--emphasis"
                onClick={addRootTag}
                disabled={busyAction !== '' || newRootTag.trim() === ''}
              >
                Add Tag
              </button>
            </div>
          </section>

          <section className="avel-list-panel">
            <div className="avel-list-panel__header">
              <h2 className="avel-list-panel__title">Tag Hierarchy</h2>
              <p className="avel-list-panel__hint">Delete a parent to remove it together with all child tags.</p>
            </div>

            <div className="avel-settings-tag-groups">
              {parentTags.map((parent) => {
                const childTags = childTagsByParentID[parent.tagID] || [];
                return (
                  <article key={parent.tagID} className="avel-settings-tag-group">
                    <header className="avel-settings-tag-group__header">
                      <strong>{parent.tagTitle || '--'}</strong>
                      <button
                        type="button"
                        className="modern-btn modern-btn--danger"
                        onClick={() => deleteTag(parent.tagID)}
                        disabled={busyAction !== ''}
                      >
                        Delete
                      </button>
                    </header>

                    <div className="avel-settings-tag-group__children">
                      {childTags.map((tag) => {
                        const tagKey = String(tag.tagID);
                        const value = editDraftByTagID[tagKey] ?? tag.tagTitle;
                        return (
                          <div key={tag.tagID} className="avel-settings-tag-row">
                            <input
                              className="avel-form-control"
                              type="text"
                              value={value}
                              onChange={(event) => {
                                const next = event.target.value;
                                setEditDraftByTagID((current) => ({
                                  ...current,
                                  [tagKey]: next
                                }));
                              }}
                            />
                            <button
                              type="button"
                              className="modern-btn modern-btn--secondary"
                              onClick={() => updateTag(tag.tagID, tag.tagTitle)}
                              disabled={busyAction !== '' || String(value || '').trim() === ''}
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              className="modern-btn modern-btn--danger"
                              onClick={() => deleteTag(tag.tagID)}
                              disabled={busyAction !== ''}
                            >
                              Delete
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    <div className="avel-settings-inline-form">
                      <label className="avel-settings-inline-field">
                        <span>Add Child Tag</span>
                        <input
                          className="avel-form-control"
                          type="text"
                          value={childDraftByParentID[String(parent.tagID)] || ''}
                          onChange={(event) => {
                            const next = event.target.value;
                            setChildDraftByParentID((current) => ({
                              ...current,
                              [String(parent.tagID)]: next
                            }));
                          }}
                        />
                      </label>
                      <button
                        type="button"
                        className="modern-btn modern-btn--secondary"
                        onClick={() => addChildTag(parent.tagID)}
                        disabled={busyAction !== '' || String(childDraftByParentID[String(parent.tagID)] || '').trim() === ''}
                      >
                        Add Child
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      </PageContainer>
    </div>
  );
}

function SettingsRolePagePermissionsNativeShell({
  data
}: {
  data: SettingsRolePagePermissionsModernDataResponse;
}) {
  const backURL = ensureModernUIURL(data.actions.backURL);
  const legacyURL = ensureUIURL(data.actions.legacyURL, 'legacy');
  const schemaMigrationsURL = ensureModernUIURL(data.actions.schemaMigrationsURL);
  const hasWarning = toLowerText(data.message).includes('failed');

  return (
    <div className="avel-dashboard-page avel-settings-admin-page avel-settings-workflow-page">
      <PageContainer
        title="Role Access Matrix"
        subtitle="Control page visibility and minimum access level for each user role."
        actions={(
          <>
            <a className="modern-btn modern-btn--secondary" href={backURL}>
              Back To Settings
            </a>
            <a className="modern-btn modern-btn--secondary" href={legacyURL}>
              Open Legacy UI
            </a>
          </>
        )}
      >
        <div className="modern-dashboard avel-dashboard-shell">
          {data.message.trim() !== '' ? (
            <section className={`avel-settings-admin-flash ${hasWarning ? 'is-warning' : 'is-success'}`} aria-live="polite">
              <strong>{hasWarning ? 'Warning' : 'Saved'}</strong>
              <span>{data.message}</span>
            </section>
          ) : null}

          {!data.rolePermissionsEnabled ? (
            <section className="avel-list-panel">
              <div className="modern-state modern-state--error">
                Role/page permission schema is not available yet.
              </div>
              <p className="reports-workflow-forward__note">
                Apply pending migrations first, then return to this matrix page.
              </p>
              <div className="modern-compat-page__actions">
                <a className="modern-btn modern-btn--secondary" href={schemaMigrationsURL}>
                  Open Schema Migrations
                </a>
              </div>
            </section>
          ) : (
            <form action={data.actions.submitURL} method="post" className="avel-list-panel">
              <div className="avel-list-panel__header">
                <h2 className="avel-list-panel__title">Permissions Matrix</h2>
                <p className="avel-list-panel__hint">Each cell maps to `perm[roleID][pageKey]` in the legacy submit payload.</p>
              </div>

              <input type="hidden" name="postback" value="postback" />

              <div className="avel-settings-table-wrap">
                <table className="avel-settings-table avel-settings-table--dense">
                  <thead>
                    <tr>
                      <th>Page</th>
                      {data.roles.map((role) => (
                        <th key={role.roleID}>{role.roleName}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.pages.map((page) => (
                      <tr key={page.pageKey}>
                        <td>{page.label}</td>
                        {data.roles.map((role) => {
                          const roleMatrix = data.matrix[String(role.roleID)] || {};
                          const selectedOption = roleMatrix[page.pageKey]?.option || 'read';
                          return (
                            <td key={`${role.roleID}:${page.pageKey}`}>
                              <select
                                className="avel-form-control"
                                name={`perm[${role.roleID}][${page.pageKey}]`}
                                defaultValue={selectedOption}
                              >
                                {data.accessOptions.map((option) => (
                                  <option key={option.optionKey} value={option.optionKey}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="modern-compat-page__actions">
                <button type="submit" className="modern-btn modern-btn--emphasis">
                  Save Matrix
                </button>
                <a className="modern-btn modern-btn--secondary" href={backURL}>
                  Back
                </a>
                <a className="modern-btn modern-btn--secondary" href={legacyURL}>
                  Open Legacy UI
                </a>
              </div>
            </form>
          )}
        </div>
      </PageContainer>
    </div>
  );
}

function SettingsSchemaMigrationsNativeShell({
  data
}: {
  data: SettingsSchemaMigrationsModernDataResponse;
}) {
  const backURL = ensureModernUIURL(data.actions.backURL);
  const legacyURL = ensureUIURL(data.actions.legacyURL, 'legacy');

  return (
    <div className="avel-dashboard-page avel-settings-admin-page avel-settings-workflow-page">
      <PageContainer
        title="Schema Migrations"
        subtitle="Review migration status and apply pending scripts with legacy-compatible submit actions."
        actions={(
          <>
            <a className="modern-btn modern-btn--secondary" href={backURL}>
              Back To Settings
            </a>
            <a className="modern-btn modern-btn--secondary" href={legacyURL}>
              Open Legacy UI
            </a>
          </>
        )}
      >
        <div className="modern-dashboard avel-dashboard-shell">
          {data.errorMessage.trim() !== '' ? (
            <section className="avel-settings-admin-flash is-warning" aria-live="polite">
              <strong>Error</strong>
              <span>{data.errorMessage}</span>
            </section>
          ) : data.message.trim() !== '' ? (
            <section className="avel-settings-admin-flash is-success" aria-live="polite">
              <strong>Notice</strong>
              <span>{data.message}</span>
            </section>
          ) : null}

          {data.dirMissing ? (
            <section className="avel-list-panel">
              <div className="modern-state modern-state--error">Migrations directory not found.</div>
            </section>
          ) : (
            <>
              <section className="avel-list-panel">
                <div className="avel-list-panel__header">
                  <h2 className="avel-list-panel__title">Pending Migrations</h2>
                  <p className="avel-list-panel__hint">{data.pendingCount} pending migration(s).</p>
                </div>
                <form className="modern-compat-page__actions" method="post" action={data.actions.submitURL}>
                  <input type="hidden" name="postback" value="postback" />
                  <input type="hidden" name="applyAll" value="1" />
                  <button
                    type="submit"
                    className="modern-btn modern-btn--emphasis"
                    disabled={data.pendingCount <= 0}
                  >
                    Apply All Pending
                  </button>
                </form>
              </section>

              <section className="avel-list-panel">
                <div className="avel-settings-table-wrap">
                  <table className="avel-settings-table avel-settings-table--dense">
                    <thead>
                      <tr>
                        <th>Version</th>
                        <th>Status</th>
                        <th>Applied At</th>
                        <th>Applied By</th>
                        <th>Checksum</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.migrations.length === 0 ? (
                        <tr>
                          <td colSpan={6}>No migrations found.</td>
                        </tr>
                      ) : (
                        data.migrations.map((migration) => {
                          const statusLabel = migration.applied
                            ? (migration.checksumMatches ? 'Applied' : 'Applied (checksum mismatch)')
                            : 'Pending';
                          return (
                            <tr key={migration.version}>
                              <td>{migration.version}</td>
                              <td>{statusLabel}</td>
                              <td>{migration.appliedAt || '--'}</td>
                              <td>{migration.appliedBy || '--'}</td>
                              <td className="avel-settings-code-cell">{migration.checksum}</td>
                              <td>
                                <form className="avel-settings-inline-actions" method="post" action={data.actions.submitURL}>
                                  <input type="hidden" name="postback" value="postback" />
                                  <input type="hidden" name="version" value={migration.version} />
                                  <button
                                    type="submit"
                                    className="modern-btn modern-btn--secondary"
                                    disabled={migration.applied}
                                  >
                                    Apply
                                  </button>
                                  <button
                                    type="submit"
                                    className="modern-btn modern-btn--secondary"
                                    name="markApplied"
                                    value="Mark Applied"
                                    disabled={migration.applied}
                                    onClick={(event) => {
                                      if (!window.confirm('Mark this migration as applied without running it?')) {
                                        event.preventDefault();
                                      }
                                    }}
                                  >
                                    Mark Applied
                                  </button>
                                </form>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}
        </div>
      </PageContainer>
    </div>
  );
}

function SettingsViewItemHistoryNativeShell({
  data
}: {
  data: SettingsViewItemHistoryModernDataResponse;
}) {
  const backURL = ensureModernUIURL(data.actions.backURL);
  const legacyURL = ensureUIURL(data.actions.legacyURL, 'legacy');
  const shortFields = data.fields.filter((field) => !field.isLongField);
  const longFields = data.fields.filter((field) => field.isLongField);
  const fieldRevisions = data.revisions.filter((revision) => revision.isFieldRevision && revision.description.trim() !== '');
  const otherRevisions = data.revisions.filter((revision) => !revision.isFieldRevision && revision.description.trim() !== '');

  return (
    <div className="avel-dashboard-page avel-settings-admin-page avel-settings-workflow-page">
      <PageContainer
        title={data.summary.title || 'Item History'}
        subtitle={data.summary.subtitle || 'Review item-level revision activity.'}
        actions={(
          <>
            <a className="modern-btn modern-btn--secondary" href={backURL}>
              Back To Item
            </a>
            <a className="modern-btn modern-btn--secondary" href={legacyURL}>
              Open Legacy UI
            </a>
          </>
        )}
      >
        <div className="modern-dashboard avel-dashboard-shell">
          <section className="avel-list-panel">
            <div className="avel-list-panel__header">
              <h2 className="avel-list-panel__title">Current Snapshot</h2>
              <p className="avel-list-panel__hint">Latest field values for the selected item.</p>
            </div>
            <div className="avel-settings-table-wrap">
              <table className="avel-settings-table avel-settings-table--dense">
                <tbody>
                  {shortFields.map((field) => (
                    <tr key={field.key}>
                      <th>{field.label}</th>
                      <td className="avel-settings-prewrap">{field.value || '--'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {longFields.map((field) => (
              <article key={field.key} className="avel-settings-long-field">
                <h3>{field.label}</h3>
                <div className="avel-settings-prewrap">{field.value || '--'}</div>
              </article>
            ))}
          </section>

          <section className="avel-list-panel">
            <div className="avel-list-panel__header">
              <h2 className="avel-list-panel__title">Field Revision History</h2>
              <p className="avel-list-panel__hint">Chronological list of field-level changes.</p>
            </div>
            <div className="avel-settings-history-list">
              {fieldRevisions.length === 0 ? (
                <div className="modern-state">No field-level revision history available.</div>
              ) : (
                fieldRevisions.map((revision) => (
                  <article key={revision.revisionID} className="avel-settings-history-item">
                    <header>
                      <strong>{revision.dateModified || '--'}</strong>
                      <span>{revision.description || revision.theField}</span>
                    </header>
                    <div className="avel-settings-history-values">
                      <div>
                        <span>Old Value</span>
                        <p className="avel-settings-prewrap">{revision.previousValue || '--'}</p>
                      </div>
                      <div>
                        <span>New Value</span>
                        <p className="avel-settings-prewrap">{revision.newValue || '--'}</p>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>

          <section className="avel-list-panel">
            <div className="avel-list-panel__header">
              <h2 className="avel-list-panel__title">Other History</h2>
              <p className="avel-list-panel__hint">System events, workflow actions, and non-field history entries.</p>
            </div>
            <div className="avel-settings-history-list">
              {otherRevisions.length === 0 ? (
                <div className="modern-state">No additional history entries.</div>
              ) : (
                otherRevisions.map((revision) => (
                  <article key={revision.revisionID} className="avel-settings-history-item">
                    <header>
                      <strong>{revision.dateModified || '--'}</strong>
                      <span>{revision.description || revision.theField || 'History entry'}</span>
                    </header>
                    <div className="avel-settings-history-values">
                      <div>
                        <span>Old Value</span>
                        <p className="avel-settings-prewrap">{revision.previousValue || '--'}</p>
                      </div>
                      <div>
                        <span>New Value</span>
                        <p className="avel-settings-prewrap">{revision.newValue || '--'}</p>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        </div>
      </PageContainer>
    </div>
  );
}

function SettingsManageUsersNativeShell({
  data,
  legacyURL,
  backLink,
  onReload
}: {
  data: SettingsManageUsersModernDataResponse;
  legacyURL: string;
  backLink: BackLink;
  onReload: () => void;
}) {
  const addUserURL = ensureModernUIURL(data.actions.addUserURL);
  const backURL = ensureModernUIURL(data.actions.backURL);
  const canAddUsers = data.permissions.canAddUsers && data.state.authMode !== 'ldap';
  const showApplicationRoles = data.state.userRolesEnabled;
  const [busyUserID, setBusyUserID] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const summaryCards = [
    {
      label: 'Users',
      value: String(data.summary.totalUsers),
      note: 'Native list mirrors the legacy user-management set.',
      tone: 'info'
    },
    {
      label: 'Licensed seats',
      value: data.summary.unlimitedLicenses ? 'Unlimited' : String(data.summary.totalLicensedUsers),
      note: data.summary.unlimitedLicenses
        ? 'License pool is not capped.'
        : `${data.summary.availableSlots} slot${data.summary.availableSlots === 1 ? '' : 's'} available`,
      tone: data.summary.unlimitedLicenses ? 'success' : 'warning'
    },
    {
      label: 'Access mode',
      value: data.state.authMode || '--',
      note: data.state.userRolesEnabled ? 'Application roles are enabled' : 'Application roles are hidden',
      tone: data.state.userRolesEnabled ? 'success' : 'info'
    }
  ] as const;

  const deleteUser = useCallback(
    async (userID: number) => {
      if (!data.permissions.canDeleteUsers || busyUserID !== null || userID <= 0) {
        return;
      }

      if (!window.confirm('Delete this user?')) {
        return;
      }

      setBusyUserID(userID);
      setErrorMessage('');
      setFeedback('');

      try {
        const deleteURL = new URL(data.actions.deleteActionURL, window.location.href);
        deleteURL.searchParams.set('userID', String(userID));
        const response = await fetch(deleteURL.toString(), {
          credentials: 'same-origin'
        });
        const responseText = (await response.text()).trim();

        if (!response.ok || responseText !== 'Ok') {
          throw new Error(responseText || 'Unable to delete user.');
        }

        setFeedback('User deleted.');
        onReload();
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Unable to delete user.');
      } finally {
        setBusyUserID(null);
      }
    },
    [busyUserID, data.actions.deleteActionURL, data.permissions.canDeleteUsers, onReload]
  );

  return (
    <div className="avel-dashboard-page avel-settings-admin-page avel-settings-workflow-page avel-settings-user-page">
      <PageContainer
        title="Manage Users"
        subtitle="Review user accounts, open profiles, and edit access from the native settings shell."
        actions={(
          <>
            {canAddUsers ? (
              <a className="modern-btn modern-btn--emphasis" href={addUserURL}>
                Add User
              </a>
            ) : null}
            <a className="modern-btn modern-btn--secondary" href={backURL}>
              Back To Settings
            </a>
            <a className="modern-btn modern-btn--secondary" href={legacyURL}>
              Open Legacy UI
            </a>
          </>
        )}
      >
        <div className="modern-dashboard avel-dashboard-shell">
          {errorMessage !== '' ? (
            <section className="avel-settings-admin-flash is-warning" aria-live="polite">
              <strong>Error</strong>
              <span>{errorMessage}</span>
            </section>
          ) : null}
          {feedback !== '' ? (
            <section className="avel-settings-admin-flash is-success" aria-live="polite">
              <strong>Done</strong>
              <span>{feedback}</span>
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

          <div className="avel-settings-user-layout">
            <section className="avel-list-panel avel-settings-user-layout__main">
              <div className="avel-list-panel__header">
                <h2 className="avel-list-panel__title">User List</h2>
                <p className="avel-list-panel__hint">
                  Open a profile to inspect details, or edit a user directly from the native list.
                </p>
              </div>

              <div className="avel-settings-table-wrap">
                <table className="avel-settings-table avel-settings-user-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Username</th>
                      {showApplicationRoles ? <th>Role</th> : null}
                      <th>Access</th>
                      <th>Last Success</th>
                      <th>Last Failure</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.rows.length === 0 ? (
                      <tr>
                        <td colSpan={showApplicationRoles ? 7 : 6}>No users found.</td>
                      </tr>
                    ) : (
                      data.rows.map((row) => (
                        <tr key={row.userID}>
                          <td>
                            <strong>{toDisplayText(`${row.firstName} ${row.lastName}`)}</strong>
                            <div className="avel-settings-prewrap">{`#${row.userID}`}</div>
                          </td>
                          <td>{toDisplayText(row.username)}</td>
                          {showApplicationRoles ? <td>{toDisplayText(row.applicationRole)}</td> : null}
                          <td>
                            <span className="modern-chip modern-chip--info">
                              {toDisplayText(row.accessLevelDescription)}
                            </span>
                          </td>
                          <td>{toDisplayText(row.successfulDate)}</td>
                          <td>{toDisplayText(row.unsuccessfulDate)}</td>
                          <td>
                            <div className="avel-settings-inline-actions">
                              <a className="modern-btn modern-btn--secondary modern-btn--mini" href={ensureModernUIURL(row.showURL)}>
                                View
                              </a>
                              <a className="modern-btn modern-btn--secondary modern-btn--mini" href={ensureModernUIURL(row.editURL)}>
                                Edit
                              </a>
                              {data.permissions.canDeleteUsers && row.canDelete ? (
                                <button
                                  type="button"
                                  className="modern-btn modern-btn--danger modern-btn--mini"
                                  onClick={() => {
                                    void deleteUser(row.userID);
                                  }}
                                  disabled={busyUserID !== null}
                                >
                                  {busyUserID === row.userID ? 'Deleting...' : 'Delete'}
                                </button>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <aside className="avel-list-panel avel-settings-user-layout__sidebar">
              <div className="avel-list-panel__header">
                <h2 className="avel-list-panel__title">Workspace</h2>
                <p className="avel-list-panel__hint">
                  Add users from the native shell or return to the legacy flow if you need an older view.
                </p>
              </div>

              <div className="avel-settings-form-stack">
                <article className="avel-settings-admin-summary-card is-info">
                  <span className="avel-settings-admin-summary-label">Permissions</span>
                  <strong className="avel-settings-admin-summary-value">
                    {toBooleanLabel(data.permissions.canAddUsers, 'Can Add', 'Read Only')}
                  </strong>
                  <span className="avel-settings-admin-summary-note">
                    {data.permissions.canDeleteUsers ? 'Delete access is available for eligible users.' : 'Delete access is restricted.'}
                  </span>
                </article>
                <article className="avel-settings-admin-summary-card is-info">
                  <span className="avel-settings-admin-summary-label">Current user</span>
                  <strong className="avel-settings-admin-summary-value">User #{data.state.currentUserID}</strong>
                  <span className="avel-settings-admin-summary-note">Modern list keeps the current account protected.</span>
                </article>
              </div>

              <div className="modern-compat-page__actions">
                {canAddUsers ? (
                  <a className="modern-btn modern-btn--emphasis" href={addUserURL}>
                    Add User
                  </a>
                ) : null}
                <a className="modern-btn modern-btn--secondary" href={backLink.href}>
                  {backLink.label}
                </a>
                <a className="modern-btn modern-btn--secondary" href={legacyURL}>
                  Open Legacy UI
                </a>
              </div>
            </aside>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}

function SettingsAddUserNativeShell({
  data,
  legacyURL,
  backLink
}: {
  data: SettingsAddUserModernDataResponse;
  legacyURL: string;
  backLink: BackLink;
}) {
  const manageUsersURL = ensureModernUIURL(data.actions.manageUsersURL);
  const submitURL = ensureUIURL(data.actions.submitURL, 'legacy');
  const showLicenseWarning = data.state.showLicenseWarning || (!data.summary.totalLicensedUsers && !data.summary.availableSlots);
  const isLdapMode = toLowerText(data.state.authMode) === 'ldap';
  const accessLevelDefault = String(data.state.defaultAccessLevel || '');
  const roleIDDefault = String(data.state.defaultUserRoleID || '');
  const roleDefault = 'none';

  return (
    <div className="avel-dashboard-page avel-settings-admin-page avel-settings-workflow-page avel-settings-user-page">
      <PageContainer
        title="Add User"
        subtitle="Create a user account without leaving the modern settings shell."
        actions={(
          <>
            <a className="modern-btn modern-btn--secondary" href={manageUsersURL}>
              Back To Users
            </a>
            <a className="modern-btn modern-btn--secondary" href={legacyURL}>
              Open Legacy UI
            </a>
          </>
        )}
      >
        <div className="modern-dashboard avel-dashboard-shell">
          {showLicenseWarning ? (
            <section className="avel-settings-admin-flash is-warning" aria-live="polite">
              <strong>License</strong>
              <span>
                {data.state.authMode === 'ldap'
                  ? 'LDAP mode can restrict new user creation.'
                  : 'User licensing is tight; verify a seat before saving.'}
              </span>
            </section>
          ) : null}
          {isLdapMode ? (
            <section className="avel-settings-admin-flash is-warning" aria-live="polite">
              <strong>LDAP Mode</strong>
              <span>LDAP authentication is enabled. Adding site users is disabled.</span>
            </section>
          ) : null}

          <section className="avel-settings-admin-summary">
            <article className="avel-settings-admin-summary-card is-info">
              <span className="avel-settings-admin-summary-label">Seats</span>
              <strong className="avel-settings-admin-summary-value">{data.summary.availableSlots}</strong>
              <span className="avel-settings-admin-summary-note">Open slots available now</span>
            </article>
            <article className="avel-settings-admin-summary-card is-info">
              <span className="avel-settings-admin-summary-label">Default access</span>
              <strong className="avel-settings-admin-summary-value">{toDisplayText(data.state.defaultAccessLevel)}</strong>
              <span className="avel-settings-admin-summary-note">Matches the legacy add-user form default</span>
            </article>
            <article className="avel-settings-admin-summary-card is-info">
              <span className="avel-settings-admin-summary-label">Roles</span>
              <strong className="avel-settings-admin-summary-value">
                {toBooleanLabel(data.state.userRolesEnabled, 'Enabled', 'Hidden')}
              </strong>
              <span className="avel-settings-admin-summary-note">
                {data.state.userRolesEnabled ? 'Application roles can be assigned.' : 'Role assignment stays off for this site.'}
              </span>
            </article>
          </section>

          <div className="avel-settings-user-layout">
            <section className="avel-list-panel avel-settings-user-layout__main">
              <div className="avel-list-panel__header">
                <h2 className="avel-list-panel__title">User Details</h2>
                <p className="avel-list-panel__hint">These fields post to the existing add-user endpoint.</p>
              </div>

              <form className="avel-settings-user-form" action={submitURL} method="post" autoComplete="off">
                <input type="hidden" name="postback" value="postback" />
                <div className="avel-settings-user-grid">
                  <label className="avel-settings-user-field" htmlFor="firstName">
                    <span>First Name</span>
                    <input className="avel-form-control" id="firstName" name="firstName" type="text" defaultValue="" />
                  </label>
                  <label className="avel-settings-user-field" htmlFor="lastName">
                    <span>Last Name</span>
                    <input className="avel-form-control" id="lastName" name="lastName" type="text" defaultValue="" />
                  </label>
                  <label className="avel-settings-user-field avel-settings-user-field--full" htmlFor="email">
                    <span>Email</span>
                    <input className="avel-form-control" id="email" name="email" type="email" defaultValue="" />
                  </label>
                  <label className="avel-settings-user-field avel-settings-user-field--full" htmlFor="username">
                    <span>Username</span>
                    <input className="avel-form-control" id="username" name="username" type="text" defaultValue="" />
                  </label>
                  <label className="avel-settings-user-field" htmlFor="accessLevel">
                    <span>Access Level</span>
                    <select className="avel-form-control" id="accessLevel" name="accessLevel" defaultValue={accessLevelDefault}>
                      {data.accessLevels.map((accessLevel) => (
                        <option key={accessLevel.accessID} value={accessLevel.accessID}>
                          {accessLevel.shortDescription}
                          {accessLevel.isDefault ? ' (Default)' : ''}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="avel-settings-user-field" htmlFor="roleID">
                    <span>Application Role</span>
                    {data.state.userRolesEnabled && data.roles.length > 0 ? (
                      <select className="avel-form-control" id="roleID" name="roleID" defaultValue={roleIDDefault}>
                        {data.roles.map((role) => (
                          <option key={role.roleID} value={role.roleID}>
                            {role.roleName}
                            {role.isActive ? '' : ' (Inactive)'}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input type="hidden" name="roleID" value="0" />
                    )}
                  </label>
                  <label className="avel-settings-user-field avel-settings-user-field--full" htmlFor="role">
                    <span>Category</span>
                    {data.categories.length > 0 ? (
                      <select className="avel-form-control" id="role" name="role" defaultValue={roleDefault}>
                        <option value="none">Normal User</option>
                        {data.categories.map((category) => (
                          <option key={category.value} value={category.value} title={category.description}>
                            {category.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input type="hidden" name="role" value="none" />
                    )}
                  </label>
                  {data.state.eeoEnabled ? (
                    <label className="avel-settings-user-field avel-settings-user-field--check" htmlFor="eeoIsVisible">
                      <input id="eeoIsVisible" name="eeoIsVisible" type="checkbox" defaultChecked={false} />
                      <span>EEO Visible</span>
                    </label>
                  ) : null}
                </div>

                <div className="avel-list-panel__header">
                  <h3 className="avel-list-panel__title">Password</h3>
                  <p className="avel-list-panel__hint">Passwords post as `password` and `retypePassword`.</p>
                </div>

                <div className="avel-settings-user-grid">
                  {isLdapMode ? (
                    <>
                      <input type="hidden" name="password" value="password" />
                      <input type="hidden" name="retypePassword" value="password" />
                      <div className="modern-state">LDAP authentication is enabled, so password fields are not required.</div>
                    </>
                  ) : (
                    <>
                      <label className="avel-settings-user-field" htmlFor="password">
                        <span>Password</span>
                        <input className="avel-form-control" id="password" name="password" type="password" autoComplete="new-password" />
                      </label>
                      <label className="avel-settings-user-field" htmlFor="retypePassword">
                        <span>Retype Password</span>
                        <input className="avel-form-control" id="retypePassword" name="retypePassword" type="password" autoComplete="new-password" />
                      </label>
                    </>
                  )}
                </div>

                <div className="modern-compat-page__actions">
                  <button type="submit" className="modern-btn modern-btn--emphasis" disabled={isLdapMode}>
                    Add User
                  </button>
                  <a className="modern-btn modern-btn--secondary" href={backLink.href}>
                    {backLink.label}
                  </a>
                  <a className="modern-btn modern-btn--secondary" href={legacyURL}>
                    Open Legacy UI
                  </a>
                </div>
              </form>
            </section>

            <aside className="avel-list-panel avel-settings-user-layout__sidebar">
              <div className="avel-list-panel__header">
                <h2 className="avel-list-panel__title">Workspace</h2>
                <p className="avel-list-panel__hint">Keep the legacy add-user flow one click away.</p>
              </div>
              <div className="avel-settings-form-stack">
                <article className="avel-settings-admin-summary-card is-info">
                  <span className="avel-settings-admin-summary-label">Access mode</span>
                  <strong className="avel-settings-admin-summary-value">{toDisplayText(data.state.authMode)}</strong>
                  <span className="avel-settings-admin-summary-note">Contract-compatible submit flow</span>
                </article>
                <article className="avel-settings-admin-summary-card is-info">
                  <span className="avel-settings-admin-summary-label">Role defaults</span>
                  <strong className="avel-settings-admin-summary-value">
                    {data.state.userRolesEnabled ? 'Enabled' : 'Disabled'}
                  </strong>
                  <span className="avel-settings-admin-summary-note">
                    {data.state.userRolesEnabled
                      ? 'Select an application role if needed.'
                      : 'Application roles are not available on this site.'}
                  </span>
                </article>
              </div>
              <div className="modern-compat-page__actions">
                <a className="modern-btn modern-btn--secondary" href={manageUsersURL}>
                  Back To Users
                </a>
                <a className="modern-btn modern-btn--secondary" href={legacyURL}>
                  Open Legacy UI
                </a>
              </div>
            </aside>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}

function SettingsEditUserNativeShell({
  data,
  legacyURL,
  backLink
}: {
  data: SettingsEditUserModernDataResponse;
  legacyURL: string;
  backLink: BackLink;
}) {
  const manageUsersURL = ensureModernUIURL(data.actions.manageUsersURL);
  const showUserURL = ensureModernUIURL(data.actions.showUserURL);
  const submitURL = ensureUIURL(data.actions.submitURL, 'legacy');
  const accessLevelValue = String(data.user.accessLevel || '');
  const roleIDValue = String(data.state.selectedUserRoleID || '');
  const roleValue = data.categories.find((category) => category.isSelected)?.value || 'none';
  const disableRoleSelect = data.state.disableAccessChange || data.state.currentUserID === data.user.userID;
  const summaryCards = [
    {
      label: 'User',
      value: toDisplayText(`${data.user.firstName} ${data.user.lastName}`),
      note: `User ID ${data.meta.userID}`,
      tone: 'info'
    },
    {
      label: 'Access level',
      value: toDisplayText(data.user.accessLevelDescription),
      note: data.state.disableAccessChange ? 'Access changes are locked for this record.' : data.user.accessLevelLongDescription,
      tone: data.state.disableAccessChange ? 'warning' : 'success'
    },
    {
      label: 'Seats',
      value: String(data.summary.availableSlots),
      note: `${data.summary.totalLicensedUsers} licensed user${data.summary.totalLicensedUsers === 1 ? '' : 's'}`,
      tone: 'info'
    }
  ] as const;

  return (
    <div className="avel-dashboard-page avel-settings-admin-page avel-settings-workflow-page avel-settings-user-page">
      <PageContainer
        title="Edit User"
        subtitle={`Edit ${toDisplayText(`${data.user.firstName} ${data.user.lastName}`)} without changing the legacy submit contract.`}
        actions={(
          <>
            <a className="modern-btn modern-btn--secondary" href={showUserURL}>
              View Profile
            </a>
            <a className="modern-btn modern-btn--secondary" href={manageUsersURL}>
              Back To Users
            </a>
            <a className="modern-btn modern-btn--secondary" href={legacyURL}>
              Open Legacy UI
            </a>
          </>
        )}
      >
        <div className="modern-dashboard avel-dashboard-shell">
          {data.state.cannotEnableMessage ? (
            <section className="avel-settings-admin-flash is-warning" aria-live="polite">
              <strong>Access</strong>
              <span>License availability is too low to promote this user.</span>
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

          <div className="avel-settings-user-layout">
            <section className="avel-list-panel avel-settings-user-layout__main">
              <div className="avel-list-panel__header">
                <h2 className="avel-list-panel__title">User Details</h2>
                <p className="avel-list-panel__hint">All field names match the legacy edit-user submit payload.</p>
              </div>

              <form className="avel-settings-user-form" action={submitURL} method="post" autoComplete="off">
                <input type="hidden" name="postback" value="postback" />
                <input type="hidden" name="userID" value={data.meta.userID} />
                <input type="hidden" name="passwordIsReset" value="0" />
                <div className="avel-settings-user-grid">
                  <label className="avel-settings-user-field" htmlFor="firstName">
                    <span>First Name</span>
                    <input className="avel-form-control" id="firstName" name="firstName" type="text" defaultValue={data.user.firstName} />
                  </label>
                  <label className="avel-settings-user-field" htmlFor="lastName">
                    <span>Last Name</span>
                    <input className="avel-form-control" id="lastName" name="lastName" type="text" defaultValue={data.user.lastName} />
                  </label>
                  <label className="avel-settings-user-field avel-settings-user-field--full" htmlFor="email">
                    <span>Email</span>
                    <input className="avel-form-control" id="email" name="email" type="email" defaultValue={data.user.email} />
                  </label>
                  <label className="avel-settings-user-field avel-settings-user-field--full" htmlFor="username">
                    <span>Username</span>
                    <input className="avel-form-control" id="username" name="username" type="text" defaultValue={data.user.username} />
                  </label>
                  <label className="avel-settings-user-field" htmlFor="accessLevel">
                    <span>Access Level</span>
                    {data.state.disableAccessChange ? (
                      <input type="hidden" name="accessLevel" value={accessLevelValue} />
                    ) : null}
                    <select
                      className="avel-form-control"
                      id="accessLevel"
                      name="accessLevel"
                      defaultValue={accessLevelValue}
                      disabled={data.state.disableAccessChange}
                    >
                      {data.accessLevels.map((accessLevel) => (
                        <option key={accessLevel.accessID} value={accessLevel.accessID} disabled={accessLevel.isDisabled}>
                          {accessLevel.shortDescription}
                          {accessLevel.isSelected ? ' (Selected)' : ''}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="avel-settings-user-field" htmlFor="roleID">
                    <span>Application Role</span>
                    {data.state.userRolesEnabled && data.roles.length > 0 ? (
                      <>
                        <select
                          className="avel-form-control"
                          id="roleID"
                          name="roleID"
                          defaultValue={roleIDValue}
                          disabled={disableRoleSelect}
                        >
                          {data.roles.map((role) => (
                            <option key={role.roleID} value={role.roleID} disabled={role.isActive === 0}>
                              {role.roleName}
                              {role.roleID === data.state.selectedUserRoleID ? ' (Selected)' : ''}
                            </option>
                          ))}
                        </select>
                        {disableRoleSelect ? <input type="hidden" name="roleID" value={roleIDValue || '0'} /> : null}
                      </>
                    ) : (
                      <input type="hidden" name="roleID" value="0" />
                    )}
                  </label>
                  <label className="avel-settings-user-field avel-settings-user-field--full" htmlFor="role">
                    <span>Category</span>
                    {data.categories.length > 0 ? (
                      <select className="avel-form-control" id="role" name="role" defaultValue={roleValue}>
                        <option value="none">Normal User</option>
                        {data.categories.map((category) => (
                          <option key={category.value} value={category.value}>
                            {category.label}
                            {category.isSelected ? ' (Selected)' : ''}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input type="hidden" name="role" value="none" />
                    )}
                  </label>
                  {data.state.eeoEnabled ? (
                    <label className="avel-settings-user-field avel-settings-user-field--check" htmlFor="eeoIsVisible">
                      <input
                        id="eeoIsVisible"
                        name="eeoIsVisible"
                        type="checkbox"
                        defaultChecked={data.user.canSeeEEOInfo}
                      />
                      <span>EEO Visible</span>
                    </label>
                  ) : null}
                </div>

                {data.state.canResetPassword ? (
                  <>
                    <div className="avel-list-panel__header">
                      <h3 className="avel-list-panel__title">Password Reset</h3>
                      <p className="avel-list-panel__hint">Leave blank to keep the current password.</p>
                    </div>

                    <div className="avel-settings-user-grid">
                      <label className="avel-settings-user-field" htmlFor="password1">
                        <span>New Password</span>
                        <input className="avel-form-control" id="password1" name="password1" type="password" autoComplete="new-password" />
                      </label>
                      <label className="avel-settings-user-field" htmlFor="password2">
                        <span>Retype New Password</span>
                        <input className="avel-form-control" id="password2" name="password2" type="password" autoComplete="new-password" />
                      </label>
                      <label className="avel-settings-user-field avel-settings-user-field--check" htmlFor="passwordIsResetToggle">
                        <input id="passwordIsResetToggle" name="passwordIsReset" type="checkbox" value="1" />
                        <span>Reset password</span>
                      </label>
                    </div>
                  </>
                ) : null}

                <div className="modern-compat-page__actions">
                  <button type="submit" className="modern-btn modern-btn--emphasis">
                    Save User
                  </button>
                  <a className="modern-btn modern-btn--secondary" href={backLink.href}>
                    {backLink.label}
                  </a>
                  <a className="modern-btn modern-btn--secondary" href={legacyURL}>
                    Open Legacy UI
                  </a>
                </div>
              </form>
            </section>

            <aside className="avel-list-panel avel-settings-user-layout__sidebar">
              <div className="avel-list-panel__header">
                <h2 className="avel-list-panel__title">Workspace</h2>
                <p className="avel-list-panel__hint">
                  Keep the profile view and legacy edit path close while making the form easier to scan.
                </p>
              </div>

              <div className="avel-settings-form-stack">
                <article className="avel-settings-admin-summary-card is-info">
                  <span className="avel-settings-admin-summary-label">Current role</span>
                  <strong className="avel-settings-admin-summary-value">
                    {toDisplayText(data.user.accessLevelDescription)}
                  </strong>
                  <span className="avel-settings-admin-summary-note">
                    {data.state.disableAccessChange ? 'Locked for this edit session.' : data.user.accessLevelLongDescription}
                  </span>
                </article>
                <article className="avel-settings-admin-summary-card is-info">
                  <span className="avel-settings-admin-summary-label">EEO</span>
                  <strong className="avel-settings-admin-summary-value">
                    {toBooleanLabel(data.user.canSeeEEOInfo, 'Visible', 'Hidden')}
                  </strong>
                  <span className="avel-settings-admin-summary-note">
                    {data.state.eeoEnabled ? 'EEO visibility is enabled on this site.' : 'EEO visibility is disabled on this site.'}
                  </span>
                </article>
              </div>

              <div className="modern-compat-page__actions">
                <a className="modern-btn modern-btn--secondary" href={showUserURL}>
                  View Profile
                </a>
                <a className="modern-btn modern-btn--secondary" href={manageUsersURL}>
                  Back To Users
                </a>
                <a className="modern-btn modern-btn--secondary" href={legacyURL}>
                  Open Legacy UI
                </a>
              </div>
            </aside>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}

function SettingsShowUserNativeShell({
  data,
  legacyURL,
  backLink
}: {
  data: SettingsShowUserModernDataResponse;
  legacyURL: string;
  backLink: BackLink;
}) {
  const editURL = ensureModernUIURL(data.actions.editURL);
  const manageUsersURL = ensureModernUIURL(data.actions.manageUsersURL);
  const settingsURL = ensureModernUIURL(data.actions.settingsURL);
  const canManage = data.state.privledged;
  const summaryCards = [
    {
      label: 'User',
      value: toDisplayText(data.user.fullName),
      note: `User ID ${data.meta.userID}`,
      tone: 'info'
    },
    {
      label: 'Role',
      value: toDisplayText(data.user.applicationRole.roleName || data.user.accessLevelLongDescription),
      note: data.user.category.label || 'Category not assigned',
      tone: 'success'
    },
    {
      label: 'Visibility',
      value: toBooleanLabel(data.user.canSeeEEOInfo, 'EEO Visible', 'EEO Hidden'),
      note: data.state.privledged ? 'Privileged profile view enabled' : 'Read-only profile view',
      tone: data.state.privledged ? 'success' : 'warning'
    }
  ] as const;

  return (
    <div className="avel-dashboard-page avel-settings-admin-page avel-settings-workflow-page avel-settings-user-page">
      <PageContainer
        title="User Profile"
        subtitle={
          canManage
            ? `Profile view for ${toDisplayText(data.user.fullName)} with edit and navigation actions kept native.`
            : 'Read-only profile view. Contact your site administrator to change these settings.'
        }
        actions={(
          <>
            {canManage ? (
              <a className="modern-btn modern-btn--emphasis" href={editURL}>
                Edit User
              </a>
            ) : null}
            <a className="modern-btn modern-btn--secondary" href={canManage ? backLink.href : settingsURL}>
              {canManage ? backLink.label : 'Back To Settings'}
            </a>
            <a className="modern-btn modern-btn--secondary" href={legacyURL}>
              Open Legacy UI
            </a>
          </>
        )}
      >
        <div className="modern-dashboard avel-dashboard-shell">
          {!canManage ? (
            <section className="avel-settings-admin-flash is-warning" aria-live="polite">
              <strong>Read only</strong>
              <span>Contact your site administrator to modify this account.</span>
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

          <div className="avel-settings-user-layout">
            <section className="avel-list-panel avel-settings-user-layout__main">
              <div className="avel-list-panel__header">
                <h2 className="avel-list-panel__title">User Details</h2>
                <p className="avel-list-panel__hint">Read-only profile view with a direct path back to edit.</p>
              </div>

              <div className="avel-settings-user-profile">
                <div className="avel-settings-user-profile__field">
                  <span>Name</span>
                  <strong>{toDisplayText(data.user.fullName)}</strong>
                </div>
                <div className="avel-settings-user-profile__field">
                  <span>Username</span>
                  <strong>{toDisplayText(data.user.username)}</strong>
                </div>
                <div className="avel-settings-user-profile__field">
                  <span>Email</span>
                  <strong>{toDisplayText(data.user.email)}</strong>
                </div>
                <div className="avel-settings-user-profile__field">
                  <span>Access Level</span>
                  <strong>{toDisplayText(data.user.accessLevelLongDescription)}</strong>
                </div>
                <div className="avel-settings-user-profile__field">
                  <span>Application Role</span>
                  <strong>{toDisplayText(data.user.applicationRole.roleName)}</strong>
                </div>
                <div className="avel-settings-user-profile__field">
                  <span>Category</span>
                  <strong>{toDisplayText(data.user.category.label)}</strong>
                </div>
                <div className="avel-settings-user-profile__field">
                  <span>Successful Login</span>
                  <strong>{toDisplayText(data.user.successfulDate)}</strong>
                </div>
                <div className="avel-settings-user-profile__field">
                  <span>Unsuccessful Login</span>
                  <strong>{toDisplayText(data.user.unsuccessfulDate)}</strong>
                </div>
              </div>

              {canManage ? (
                <>
                  <div className="avel-list-panel__header">
                    <h3 className="avel-list-panel__title">Login Attempts</h3>
                    <p className="avel-list-panel__hint">Recent logins and browser metadata from the native profile response.</p>
                  </div>

                  <div className="avel-settings-table-wrap">
                    <table className="avel-settings-table avel-settings-table--dense">
                      <thead>
                        <tr>
                          <th>Status</th>
                          <th>Date</th>
                          <th>IP</th>
                          <th>Hostname</th>
                          <th>User Agent</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.loginAttempts.length === 0 ? (
                          <tr>
                            <td colSpan={5}>No login attempts recorded.</td>
                          </tr>
                        ) : (
                          data.loginAttempts.map((attempt, index) => (
                            <tr key={`${attempt.date}-${index}`}>
                              <td>
                                <span className={`modern-chip ${isTruthyText(attempt.successful) ? 'modern-chip--success' : 'modern-chip--critical'}`}>
                                  {isTruthyText(attempt.successful) ? 'Successful' : 'Unsuccessful'}
                                </span>
                              </td>
                              <td>{toDisplayText(attempt.date)}</td>
                              <td>{toDisplayText(attempt.ip)}</td>
                              <td>{toDisplayText(attempt.hostname)}</td>
                              <td>{toDisplayText(attempt.shortUserAgent)}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : null}
            </section>

            <aside className="avel-list-panel avel-settings-user-layout__sidebar">
              <div className="avel-list-panel__header">
                <h2 className="avel-list-panel__title">Workspace</h2>
                <p className="avel-list-panel__hint">
                  Keep profile navigation and legacy access one click away.
                </p>
              </div>

              <div className="avel-settings-form-stack">
                <article className="avel-settings-admin-summary-card is-info">
                  <span className="avel-settings-admin-summary-label">EEO</span>
                  <strong className="avel-settings-admin-summary-value">
                    {toBooleanLabel(data.user.canSeeEEOInfo, 'Visible', 'Hidden')}
                  </strong>
                  <span className="avel-settings-admin-summary-note">
                    {data.state.eeoEnabled ? 'EEO fields are supported on this site.' : 'EEO fields are disabled on this site.'}
                  </span>
                </article>
                <article className="avel-settings-admin-summary-card is-info">
                  <span className="avel-settings-admin-summary-label">Role access</span>
                  <strong className="avel-settings-admin-summary-value">
                    {data.state.userRolesEnabled ? 'Enabled' : 'Disabled'}
                  </strong>
                  <span className="avel-settings-admin-summary-note">Application role metadata stays visible in the profile.</span>
                </article>
              </div>

              <div className="modern-compat-page__actions">
                {canManage ? (
                  <a className="modern-btn modern-btn--emphasis" href={editURL}>
                    Edit User
                  </a>
                ) : null}
                {canManage ? (
                  <a className="modern-btn modern-btn--secondary" href={manageUsersURL}>
                    Back To Users
                  </a>
                ) : null}
                <a className="modern-btn modern-btn--secondary" href={settingsURL}>
                  Back To Settings
                </a>
                <a className="modern-btn modern-btn--secondary" href={legacyURL}>
                  Open Legacy UI
                </a>
              </div>
            </aside>
          </div>
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
    | SettingsAdministrationModernDataResponse
    | SettingsMyProfileModernDataResponse
    | SettingsMyProfileChangePasswordModernDataResponse
    | SettingsManageUsersModernDataResponse
    | SettingsAddUserModernDataResponse
    | SettingsEditUserModernDataResponse
    | SettingsShowUserModernDataResponse
    | SettingsLoginActivityModernDataResponse
    | SettingsGdprSettingsModernData
    | SettingsEmailTemplatesModernDataResponse
    | SettingsEmailSettingsNativeData
    | SettingsFeedbackSettingsNativeData
    | SettingsGoogleOIDCSettingsNativeData
    | SettingsForceEmailNativeData
    | SettingsDeleteUserNativeData
    | SettingsCareerPortalWorkflowData
    | SettingsLegacyNoticeData
    | SettingsDeleteBackupNativeData
    | SettingsNewInstallFinishedNativeData
    | SettingsUpgradeSiteNameNativeData
    | SettingsCustomizeCalendarModernData
    | SettingsEEOModernData
    | SettingsTalentFitFlowModernData
    | SettingsWizardModernData
    | SettingsRejectionReasonsModernDataResponse
    | SettingsTagsModernDataResponse
    | SettingsRolePagePermissionsModernDataResponse
    | SettingsSchemaMigrationsModernDataResponse
    | SettingsViewItemHistoryModernDataResponse
    | null
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
        case 'manageUsers':
          return fetchSettingsManageUsersModernData(bootstrap, query);
        case 'addUser':
          return fetchSettingsAddUserModernData(bootstrap, query);
        case 'editUser':
          return fetchSettingsEditUserModernData(bootstrap, query);
        case 'showUser':
          return fetchSettingsShowUserModernData(bootstrap, query);
        case 'loginActivity':
          return fetchSettingsLoginActivityModernData(bootstrap, query);
        case 'gdprSettings':
          return fetchSettingsGdprSettingsModernData(bootstrap, query);
        case 'emailTemplates':
          return fetchSettingsEmailTemplatesNativeData(bootstrap, query);
        case 'emailSettings':
          return fetchNativeEmailSettingsData(bootstrap, legacyURL);
        case 'feedbackSettings':
          return fetchNativeFeedbackSettingsData(bootstrap, legacyURL);
        case 'forceEmail':
          return buildForceEmailNativeData(bootstrap, legacyURL);
        case 'googleOIDCSettings':
          return fetchNativeGoogleOIDCSettingsData(bootstrap, legacyURL);
        case 'deleteUser':
          return buildDeleteUserNativeData(bootstrap, legacyURL);
        case 'careerPortalSettings':
        case 'careerPortalTemplateEdit':
        case 'careerPortalQuestionnaire':
        case 'careerPortalQuestionnairePreview':
        case 'careerPortalQuestionnaireUpdate':
          return buildCareerPortalWorkflowData(bootstrap, legacyURL, nativeRouteMode, query);
        case 'createBackup':
          return buildLegacyNoticeData(
            bootstrap,
            `${bootstrap.indexName}?m=settings&a=createBackup&ui=legacy`,
            'Create Backup',
            'Use the legacy backup runner for full database or attachments backups.'
          );
        case 'deleteBackup':
          return buildDeleteBackupNativeData(
            bootstrap,
            `${bootstrap.indexName}?m=settings&a=deleteBackup&ui=legacy`
          );
        case 'customizeExtraFields':
          return buildLegacyNoticeData(
            bootstrap,
            `${bootstrap.indexName}?m=settings&a=customizeExtraFields&ui=legacy`,
            'Customize Extra Fields',
            'Use the legacy field builder for add, remove, rename, and reorder operations.'
          );
        case 'newInstallFinished':
          return buildNewInstallFinishedNativeData(
            bootstrap,
            `${bootstrap.indexName}?m=settings&a=newInstallFinished&ui=legacy`
          );
        case 'upgradeSiteName':
          return buildUpgradeSiteNameNativeData(
            bootstrap,
            `${bootstrap.indexName}?m=settings&a=upgradeSiteName&ui=legacy`
          );
        case 'customizeCalendar':
          return fetchSettingsModernJSON<SettingsCustomizeCalendarModernData>(bootstrap, 'customizeCalendar', 'settings-customize-calendar');
        case 'eeo':
          return fetchSettingsModernJSON<SettingsEEOModernData>(bootstrap, 'eeo', 'settings-eeo');
        case 'talentFitFlowSettings':
          return fetchSettingsModernJSON<SettingsTalentFitFlowModernData>(bootstrap, 'talentFitFlowSettings', 'settings-talent-fit-flow-settings');
        case 'newInstallPassword':
          return fetchSettingsModernJSON<SettingsWizardModernData>(bootstrap, 'newInstallPassword', 'settings-new-install-password');
        case 'newSiteName':
          return fetchSettingsModernJSON<SettingsWizardModernData>(bootstrap, 'newSiteName', 'settings-new-site-name');
        case 'rejectionReasons':
          return fetchSettingsRejectionReasonsModernData(bootstrap, query);
        case 'tags':
          return fetchSettingsTagsModernData(bootstrap, query);
        case 'rolePagePermissions':
          return fetchSettingsRolePagePermissionsModernData(bootstrap, query);
        case 'schemaMigrations':
          return fetchSettingsSchemaMigrationsModernData(bootstrap, query);
        case 'viewItemHistory':
          return fetchSettingsViewItemHistoryModernData(bootstrap, query);
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

    if (nativeRouteMode === 'manageUsers') {
      return (
        <SettingsManageUsersNativeShell
          data={nativeData as SettingsManageUsersModernDataResponse}
          legacyURL={legacyURL}
          backLink={backLink}
          onReload={refreshNativeRoute}
        />
      );
    }

    if (nativeRouteMode === 'addUser') {
      return (
        <SettingsAddUserNativeShell
          data={nativeData as SettingsAddUserModernDataResponse}
          legacyURL={legacyURL}
          backLink={backLink}
        />
      );
    }

    if (nativeRouteMode === 'editUser') {
      return (
        <SettingsEditUserNativeShell
          data={nativeData as SettingsEditUserModernDataResponse}
          legacyURL={legacyURL}
          backLink={backLink}
        />
      );
    }

    if (nativeRouteMode === 'showUser') {
      return (
        <SettingsShowUserNativeShell
          data={nativeData as SettingsShowUserModernDataResponse}
          legacyURL={legacyURL}
          backLink={backLink}
        />
      );
    }

    if (nativeRouteMode === 'loginActivity') {
      return (
        <SettingsLoginActivityNativeShell
          data={nativeData as SettingsLoginActivityModernDataResponse}
        />
      );
    }

    if (nativeRouteMode === 'gdprSettings') {
      return (
        <SettingsGdprSettingsNativeShell
          data={nativeData as SettingsGdprSettingsModernData}
        />
      );
    }

    if (nativeRouteMode === 'emailSettings') {
      return (
        <SettingsEmailSettingsNativeShell
          data={nativeData as SettingsEmailSettingsNativeData}
          bootstrap={bootstrap}
          onReload={refreshNativeRoute}
        />
      );
    }

    if (nativeRouteMode === 'feedbackSettings') {
      return (
        <SettingsFeedbackSettingsNativeShell
          data={nativeData as SettingsFeedbackSettingsNativeData}
          bootstrap={bootstrap}
          onReload={refreshNativeRoute}
        />
      );
    }

    if (nativeRouteMode === 'forceEmail') {
      return (
        <SettingsForceEmailNativeShell
          data={nativeData as SettingsForceEmailNativeData}
          bootstrap={bootstrap}
          onReload={refreshNativeRoute}
        />
      );
    }

    if (nativeRouteMode === 'googleOIDCSettings') {
      return (
        <SettingsGoogleOIDCSettingsNativeShell
          data={nativeData as SettingsGoogleOIDCSettingsNativeData}
          bootstrap={bootstrap}
          onReload={refreshNativeRoute}
        />
      );
    }

    if (nativeRouteMode === 'deleteUser') {
      return (
        <SettingsDeleteUserNativeShell
          data={nativeData as SettingsDeleteUserNativeData}
          bootstrap={bootstrap}
          onReload={refreshNativeRoute}
        />
      );
    }

    if (
      nativeRouteMode === 'careerPortalSettings' ||
      nativeRouteMode === 'careerPortalTemplateEdit' ||
      nativeRouteMode === 'careerPortalQuestionnaire' ||
      nativeRouteMode === 'careerPortalQuestionnairePreview' ||
      nativeRouteMode === 'careerPortalQuestionnaireUpdate'
    ) {
      return (
        <SettingsCareerPortalWorkflowNativeShell
          data={nativeData as SettingsCareerPortalWorkflowData}
        />
      );
    }

    if (nativeRouteMode === 'createBackup') {
      return (
        <SettingsCreateBackupNativeShell
          data={nativeData as SettingsLegacyNoticeData}
          backLink={backLink}
        />
      );
    }

    if (nativeRouteMode === 'deleteBackup') {
      return (
        <SettingsDeleteBackupNativeShell
          data={nativeData as SettingsDeleteBackupNativeData}
          backLink={backLink}
        />
      );
    }

    if (nativeRouteMode === 'customizeExtraFields') {
      return (
        <SettingsCustomizeExtraFieldsNativeShell
          data={nativeData as SettingsLegacyNoticeData}
          backLink={backLink}
        />
      );
    }

    if (nativeRouteMode === 'newInstallFinished') {
      return (
        <SettingsNewInstallFinishedNativeShell
          data={nativeData as SettingsNewInstallFinishedNativeData}
        />
      );
    }

    if (nativeRouteMode === 'upgradeSiteName') {
      return (
        <SettingsUpgradeSiteNameNativeShell
          data={nativeData as SettingsUpgradeSiteNameNativeData}
        />
      );
    }

    if (nativeRouteMode === 'customizeCalendar') {
      return (
        <SettingsCustomizeCalendarNativeShell
          data={nativeData as SettingsCustomizeCalendarModernData}
          bootstrap={bootstrap}
        />
      );
    }

    if (nativeRouteMode === 'eeo') {
      return (
        <SettingsEEONativeShell
          data={nativeData as SettingsEEOModernData}
          bootstrap={bootstrap}
        />
      );
    }

    if (nativeRouteMode === 'talentFitFlowSettings') {
      return (
        <SettingsTalentFitFlowNativeShell
          data={nativeData as SettingsTalentFitFlowModernData}
          bootstrap={bootstrap}
        />
      );
    }

    if (nativeRouteMode === 'newInstallPassword') {
      return (
        <SettingsNewInstallPasswordNativeShell
          data={nativeData as SettingsWizardModernData}
          bootstrap={bootstrap}
        />
      );
    }

    if (nativeRouteMode === 'newSiteName') {
      return (
        <SettingsNewSiteNameNativeShell
          data={nativeData as SettingsWizardModernData}
          bootstrap={bootstrap}
        />
      );
    }

    if (nativeRouteMode === 'emailTemplates') {
      return (
        <SettingsEmailTemplatesNativeShell
          data={nativeData as SettingsEmailTemplatesModernDataResponse}
          bootstrap={bootstrap}
          routeKey={routeKey}
          onReload={refreshNativeRoute}
        />
      );
    }

    if (nativeRouteMode === 'rejectionReasons') {
      return (
        <SettingsRejectionReasonsNativeShell
          data={nativeData as SettingsRejectionReasonsModernDataResponse}
        />
      );
    }

    if (nativeRouteMode === 'tags') {
      return (
        <SettingsTagsNativeShell
          data={nativeData as SettingsTagsModernDataResponse}
          onReload={refreshNativeRoute}
        />
      );
    }

    if (nativeRouteMode === 'rolePagePermissions') {
      return (
        <SettingsRolePagePermissionsNativeShell
          data={nativeData as SettingsRolePagePermissionsModernDataResponse}
        />
      );
    }

    if (nativeRouteMode === 'schemaMigrations') {
      return (
        <SettingsSchemaMigrationsNativeShell
          data={nativeData as SettingsSchemaMigrationsModernDataResponse}
        />
      );
    }

    if (nativeRouteMode === 'viewItemHistory') {
      return (
        <SettingsViewItemHistoryNativeShell
          data={nativeData as SettingsViewItemHistoryModernDataResponse}
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
