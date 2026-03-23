import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { buildEmbeddedLegacyURL } from '../lib/embeddedLegacy';
import { ensureModernUIURL, ensureUIURL } from '../lib/navigation';
import {
  fetchSettingsLoginActivityModernData,
  fetchSettingsManageUsersModernData,
  fetchSettingsAddUserModernData,
  fetchSettingsEditUserModernData,
  fetchSettingsShowUserModernData,
  fetchSettingsRejectionReasonsModernData,
  fetchSettingsRolePagePermissionsModernData,
  fetchSettingsSchemaMigrationsModernData,
  fetchSettingsMyProfileChangePasswordModernData,
  fetchSettingsAdministrationModernData,
  fetchSettingsMyProfileModernData,
  fetchSettingsTagsModernData,
  fetchSettingsViewItemHistoryModernData
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
    subtitle: 'Remove user accounts in compatibility mode.',
    panelTitle: 'Delete User Workspace',
    panelSubtitle: 'Legacy user-deletion workflow remains available while modernization continues.',
    mode: 'forward'
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
    subtitle: 'Configure GDPR settings in compatibility mode.',
    panelTitle: 'GDPR Settings Workspace',
    panelSubtitle: 'Legacy GDPR settings workflow remains available while modernization continues.',
    mode: 'forward'
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
    subtitle: 'Configure email delivery settings in compatibility mode.',
    panelTitle: 'Email Settings Workspace',
    panelSubtitle: 'Legacy email-settings workflow remains available while modernization continues.',
    mode: 'forward'
  },
  'settings.feedbacksettings': {
    title: 'Feedback Settings',
    subtitle: 'Configure feedback settings in compatibility mode.',
    panelTitle: 'Feedback Settings Workspace',
    panelSubtitle: 'Legacy feedback-settings workflow remains available while modernization continues.',
    mode: 'forward'
  },
  'settings.forceemail': {
    title: 'Force Email',
    subtitle: 'Run force-email operations in compatibility mode.',
    panelTitle: 'Force Email Workspace',
    panelSubtitle: 'Legacy force-email workflow remains available while modernization continues.',
    mode: 'forward'
  },
  'settings.googleoidcsettings': {
    title: 'Google OIDC Settings',
    subtitle: 'Configure Google OIDC authentication settings in compatibility mode.',
    panelTitle: 'Google OIDC Workspace',
    panelSubtitle: 'Legacy Google OIDC workflow remains available while modernization continues.',
    mode: 'forward'
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
    subtitle: 'Configure career portal questionnaire settings in compatibility mode.',
    panelTitle: 'Career Portal Questionnaire Workspace',
    panelSubtitle: 'Legacy career portal questionnaire workflow remains available while modernization continues.',
    mode: 'forward'
  },
  'settings.careerportalquestionnairepreview': {
    title: 'Career Portal Questionnaire Preview',
    subtitle: 'Preview the career portal questionnaire in compatibility mode.',
    panelTitle: 'Questionnaire Preview Workspace',
    panelSubtitle: 'Legacy questionnaire preview workflow remains available while modernization continues.',
    mode: 'forward'
  },
  'settings.careerportalquestionnaireupdate': {
    title: 'Career Portal Questionnaire Update',
    subtitle: 'Apply questionnaire updates in compatibility mode.',
    panelTitle: 'Questionnaire Update Workspace',
    panelSubtitle: 'Legacy questionnaire update workflow remains available while modernization continues.',
    mode: 'forward'
  },
  'settings.careerportalsettings': {
    title: 'Career Portal Settings',
    subtitle: 'Configure career portal behavior in compatibility mode.',
    panelTitle: 'Career Portal Settings Workspace',
    panelSubtitle: 'Legacy career portal settings workflow remains available while modernization continues.',
    mode: 'forward'
  },
  'settings.careerportaltemplateedit': {
    title: 'Career Portal Template',
    subtitle: 'Edit career portal templates in compatibility mode.',
    panelTitle: 'Career Portal Template Workspace',
    panelSubtitle: 'Legacy template-edit workflow remains available while modernization continues.',
    mode: 'forward'
  },
  'settings.createbackup': {
    title: 'Create Backup',
    subtitle: 'Create system backups in compatibility mode.',
    panelTitle: 'Backup Creation Workspace',
    panelSubtitle: 'Legacy backup creation workflow remains available while modernization continues.',
    mode: 'forward'
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
    subtitle: 'Configure extra field definitions in compatibility mode.',
    panelTitle: 'Extra Fields Workspace',
    panelSubtitle: 'Legacy extra-field customization workflow remains available while modernization continues.',
    mode: 'forward'
  },
  'settings.deletebackup': {
    title: 'Delete Backup',
    subtitle: 'Remove backup files in compatibility mode.',
    panelTitle: 'Backup Deletion Workspace',
    panelSubtitle: 'Legacy backup deletion workflow remains available while modernization continues.',
    mode: 'forward'
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
    subtitle: 'Complete installation finalization steps in compatibility mode.',
    panelTitle: 'Install Finalization Workspace',
    panelSubtitle: 'Legacy installation finalization workflow remains available while modernization continues.',
    mode: 'forward'
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
  'settings.professional': {
    title: 'Professional Settings',
    subtitle: 'Manage professional package settings in compatibility mode.',
    panelTitle: 'Professional Settings Workspace',
    panelSubtitle: 'Legacy professional settings workflow remains available while modernization continues.',
    mode: 'forward'
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
    subtitle: 'Apply site-name upgrade changes in compatibility mode.',
    panelTitle: 'Upgrade Site Name Workspace',
    panelSubtitle: 'Legacy site-name upgrade workflow remains available while modernization continues.',
    mode: 'forward'
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
  | 'manageUsers'
  | 'addUser'
  | 'editUser'
  | 'showUser'
  | 'loginActivity'
  | 'emailTemplates'
  | 'rejectionReasons'
  | 'tags'
  | 'rolePagePermissions'
  | 'schemaMigrations'
  | 'viewItemHistory'
  | 'fallback';

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

  if (
    routeKey === 'settings.emailtemplates' ||
    routeKey === 'settings.addemailtemplate' ||
    routeKey === 'settings.deleteemailtemplate'
  ) {
    return 'emailTemplates';
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
    | SettingsEmailTemplatesModernDataResponse
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
        case 'emailTemplates':
          return fetchSettingsEmailTemplatesNativeData(bootstrap, query);
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
