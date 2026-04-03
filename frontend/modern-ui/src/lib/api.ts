import type {
  CandidateGoogleDriveDeleteMutationResponse,
  ActivityListModernDataResponse,
  CandidateGoogleDriveUploadMutationResponse,
  CalendarEventMutationResponse,
  CalendarModernDataResponse,
  GdprRequestsModernDataResponse,
  CandidateResumeModernDataResponse,
  CandidateAssignToJobOrderModernDataResponse,
  CandidateAssignToJobOrderMutationResponse,
  CandidateDuplicateCheckResponse,
  CandidatesAddModernDataResponse,
  CandidatesEditModernDataResponse,
  CandidatesListModernDataResponse,
  CandidatesShowModernDataResponse,
  CompaniesAddModernDataResponse,
  CompaniesEditModernDataResponse,
  CompaniesListModernDataResponse,
  CompaniesShowModernDataResponse,
  ContactsAddModernDataResponse,
  ContactsColdCallListModernDataResponse,
  ContactsEditModernDataResponse,
  ContactsListModernDataResponse,
  ContactsShowModernDataResponse,
  DashboardModernDataResponse,
  DashboardSetPipelineStatusResponse,
  GraphsOverviewModernDataResponse,
  HomeInboxModernDataResponse,
  HomeMyNotesModernDataResponse,
  HomeOverviewModernDataResponse,
  HomeQuickSearchModernDataResponse,
  ImportLauncherModernDataResponse,
  ImportBulkResumesModernMutationResponse,
  ImportDeleteBulkResumesModernMutationResponse,
  SettingsAdministrationModernDataResponse,
  SettingsAddEmailTemplateMutationResponse,
  SettingsAddUserModernDataResponse,
  SettingsDeleteUserModernDataResponse,
  SettingsDeleteUserMutationResponse,
  SettingsDeleteEmailTemplateMutationResponse,
  SettingsCustomizeCalendarModernDataResponse,
  SettingsCustomizeCalendarMutationResponse,
  SettingsCreateBackupModernDataResponse,
  SettingsDeleteBackupMutationResponse,
  SettingsCareerPortalSettingsModernDataResponse,
  SettingsCareerPortalSettingsMutationResponse,
  SettingsCareerPortalTemplateEditModernDataResponse,
  SettingsCareerPortalTemplateEditMutationResponse,
  SettingsCareerPortalQuestionnaireModernDataResponse,
  SettingsCareerPortalQuestionnaireMutationResponse,
  SettingsCareerPortalQuestionnairePreviewModernDataResponse,
  SettingsCareerPortalQuestionnaireUpdateModernDataResponse,
  SettingsCareerPortalQuestionnaireUpdateMutationResponse,
  SettingsCareerPortalQuestionnaireQuestion,
  SettingsCareerPortalQuestionnaireAnswer,
  SettingsCareerPortalQuestionnaireListItem,
  SettingsCareerPortalTemplateRecord,
  SettingsEmailTemplatesModernDataResponse,
  SettingsEmailSettingsModernDataResponse,
  SettingsEmailSettingsMutationResponse,
  SettingsCustomizeExtraFieldsModernDataResponse,
  SettingsCustomizeExtraFieldsMutationResponse,
  SettingsEEOModernDataResponse,
  SettingsEEOMutationResponse,
  SettingsEditUserModernDataResponse,
  SettingsFeedbackSettingsModernDataResponse,
  SettingsFeedbackSettingsMutationResponse,
  SettingsGdprSettingsModernDataResponse,
  SettingsGdprSettingsMutationResponse,
  SettingsForceEmailModernDataResponse,
  SettingsForceEmailMutationResponse,
  SettingsNewInstallFinishedModernDataResponse,
  SettingsNewInstallPasswordModernDataResponse,
  SettingsNewInstallPasswordMutationResponse,
  SettingsNewSiteNameModernDataResponse,
  SettingsNewSiteNameMutationResponse,
  SettingsUpgradeSiteNameModernDataResponse,
  SettingsUpgradeSiteNameMutationResponse,
  SettingsLoginActivityModernDataResponse,
  SettingsManageUsersModernDataResponse,
  SettingsGoogleOIDCSettingsModernDataResponse,
  SettingsGoogleOIDCSettingsMutationResponse,
  SettingsRejectionReasonsModernDataResponse,
  SettingsRolePagePermissionsModernDataResponse,
  SettingsSchemaMigrationsModernDataResponse,
  SettingsTalentFitFlowSettingsModernDataResponse,
  SettingsTalentFitFlowSettingsMutationResponse,
  SettingsTagsModernDataResponse,
  SettingsShowUserModernDataResponse,
  SettingsUpdateEmailTemplateMutationResponse,
  SettingsWizardAddUserModernDataResponse,
  SettingsWizardCheckKeyModernDataResponse,
  SettingsWizardDeleteUserModernDataResponse,
  SettingsWizardEmailModernDataResponse,
  SettingsWizardFirstTimeSetupModernDataResponse,
  SettingsWizardLocalizationModernDataResponse,
  SettingsWizardImportModernDataResponse,
  SettingsWizardLicenseModernDataResponse,
  SettingsWizardPasswordModernDataResponse,
  SettingsWizardSiteNameModernDataResponse,
  SettingsWizardWebsiteModernDataResponse,
  LoginModernDataResponse,
  JobOrderAddPopupModernDataResponse,
  JobOrderCompanyContextModernDataResponse,
  JobOrderAssignCandidateModernDataResponse,
  JobOrdersAddModernDataResponse,
  JobOrdersEditModernDataResponse,
  JobOrdersPipelineMatrixModernDataResponse,
  JobOrdersPipelineMatrixViewConfig,
  JobOrdersPipelineMatrixViewMutationResponse,
  JobOrdersRecruiterAllocationModernDataResponse,
  JobOrdersRecruiterAllocationMutationResponse,
  JobOrdersShowModernDataResponse,
  JobOrdersListModernDataResponse,
  JobOrderRejectionReasonBreakdownModernDataResponse,
  KpisDetailsModernDataResponse,
  KpisListModernDataResponse,
  ListsDetailModernDataResponse,
  ListsManageModernDataResponse,
  ModernMutationResponse,
  PipelineStatusDetailsModernDataResponse,
  PipelineStatusHistoryUpdateResponse,
  PipelineRemoveModernResponse,
  QueueOverviewModernDataResponse,
  QuickActionAddToListModernDataResponse,
  ReportsCustomerDashboardModernDataResponse,
  ReportsGraphViewModernDataResponse,
  ReportsLauncherModernDataResponse,
  RssJobOrdersModernDataResponse,
  SourcingListModernDataResponse,
  SourcingSaveMutationResponse,
  SettingsMyProfileChangePasswordModernDataResponse,
  SettingsMyProfileModernDataResponse,
  SettingsViewItemHistoryModernDataResponse,
  UIModeBootstrap
} from '../types';
import { getJSON } from './httpClient';
import { assertModernContract } from './contractGuards';
import {
  MODERN_ACTIVITY_PAGE,
  MODERN_CALENDAR_PAGE,
  MODERN_CANDIDATE_RESUME_PAGE,
  MODERN_GDPR_REQUESTS_PAGE,
  MODERN_CANDIDATES_PAGE,
  MODERN_CANDIDATE_ADD_PAGE,
  MODERN_CANDIDATE_EDIT_PAGE,
  MODERN_CANDIDATE_SHOW_PAGE,
  MODERN_COMPANY_ADD_PAGE,
  MODERN_COMPANY_EDIT_PAGE,
  MODERN_COMPANIES_PAGE,
  MODERN_COMPANY_SHOW_PAGE,
  MODERN_CONTACT_ADD_PAGE,
  MODERN_CONTACT_COLD_CALL_LIST_PAGE,
  MODERN_CONTACT_EDIT_PAGE,
  MODERN_CONTACTS_PAGE,
  MODERN_CONTACT_SHOW_PAGE,
  MODERN_DASHBOARD_PAGE,
  MODERN_GRAPHS_PAGE,
  MODERN_JOBORDER_ADD_PAGE,
  MODERN_JOBORDER_ADD_POPUP_PAGE,
  MODERN_JOBORDER_PIPELINE_MATRIX_PAGE,
  MODERN_JOBORDER_EDIT_PAGE,
  MODERN_JOBORDER_RECRUITER_ALLOCATION_PAGE,
  MODERN_JOBORDER_SHOW_PAGE,
  MODERN_JOBORDERS_PAGE,
  MODERN_KPIS_PAGE,
  MODERN_LISTS_DETAIL_PAGE,
  MODERN_LISTS_PAGE,
  MODERN_HOME_OVERVIEW_PAGE,
  MODERN_HOME_QUICKSEARCH_PAGE,
  MODERN_HOME_INBOX_PAGE,
  MODERN_HOME_MYNOTES_PAGE,
  MODERN_IMPORT_LAUNCHER_PAGE,
  MODERN_LOGIN_PAGE,
  MODERN_QUEUE_PAGE,
  MODERN_RSS_JOBORDERS_PAGE,
  MODERN_REPORTS_CUSTOMER_DASHBOARD_PAGE,
  MODERN_REPORTS_GRAPH_VIEW_PAGE,
  MODERN_REPORTS_PAGE,
  MODERN_SETTINGS_ADMINISTRATION_PAGE,
  MODERN_SETTINGS_ADD_USER_PAGE,
  MODERN_SETTINGS_DELETE_USER_CONTRACT_KEY,
  MODERN_SETTINGS_DELETE_USER_MUTATION_CONTRACT_KEY,
  MODERN_SETTINGS_DELETE_USER_PAGE,
  MODERN_SETTINGS_CUSTOMIZE_CALENDAR_CONTRACT_KEY,
  MODERN_SETTINGS_CUSTOMIZE_CALENDAR_MUTATION_CONTRACT_KEY,
  MODERN_SETTINGS_CUSTOMIZE_CALENDAR_PAGE,
  MODERN_SETTINGS_CREATE_BACKUP_CONTRACT_KEY,
  MODERN_SETTINGS_CREATE_BACKUP_PAGE,
  MODERN_SETTINGS_EDIT_USER_PAGE,
  MODERN_SETTINGS_EMAIL_SETTINGS_CONTRACT_KEY,
  MODERN_SETTINGS_EMAIL_SETTINGS_MUTATION_CONTRACT_KEY,
  MODERN_SETTINGS_EMAIL_SETTINGS_PAGE,
  MODERN_SETTINGS_EMAIL_TEMPLATES_PAGE,
  MODERN_SETTINGS_EEO_CONTRACT_KEY,
  MODERN_SETTINGS_EEO_MUTATION_CONTRACT_KEY,
  MODERN_SETTINGS_EEO_PAGE,
  MODERN_SETTINGS_FEEDBACK_SETTINGS_CONTRACT_KEY,
  MODERN_SETTINGS_FEEDBACK_SETTINGS_MUTATION_CONTRACT_KEY,
  MODERN_SETTINGS_FEEDBACK_SETTINGS_PAGE,
  MODERN_SETTINGS_FORCE_EMAIL_CONTRACT_KEY,
  MODERN_SETTINGS_FORCE_EMAIL_MUTATION_CONTRACT_KEY,
  MODERN_SETTINGS_FORCE_EMAIL_PAGE,
  MODERN_SETTINGS_GDPR_SETTINGS_PAGE,
  MODERN_SETTINGS_GOOGLE_OIDC_SETTINGS_CONTRACT_KEY,
  MODERN_SETTINGS_GOOGLE_OIDC_SETTINGS_MUTATION_CONTRACT_KEY,
  MODERN_SETTINGS_GOOGLE_OIDC_SETTINGS_PAGE,
  MODERN_SETTINGS_CUSTOMIZE_EXTRA_FIELDS_CONTRACT_KEY,
  MODERN_SETTINGS_CUSTOMIZE_EXTRA_FIELDS_MUTATION_CONTRACT_KEY,
  MODERN_SETTINGS_CUSTOMIZE_EXTRA_FIELDS_PAGE,
  MODERN_SETTINGS_DELETE_BACKUP_MUTATION_CONTRACT_KEY,
  MODERN_SETTINGS_DELETE_BACKUP_PAGE,
  MODERN_SETTINGS_CAREER_PORTAL_SETTINGS_CONTRACT_KEY,
  MODERN_SETTINGS_CAREER_PORTAL_SETTINGS_MUTATION_CONTRACT_KEY,
  MODERN_SETTINGS_CAREER_PORTAL_SETTINGS_PAGE,
  MODERN_SETTINGS_CAREER_PORTAL_TEMPLATE_EDIT_CONTRACT_KEY,
  MODERN_SETTINGS_CAREER_PORTAL_TEMPLATE_EDIT_MUTATION_CONTRACT_KEY,
  MODERN_SETTINGS_CAREER_PORTAL_TEMPLATE_EDIT_PAGE,
  MODERN_SETTINGS_CAREER_PORTAL_QUESTIONNAIRE_CONTRACT_KEY,
  MODERN_SETTINGS_CAREER_PORTAL_QUESTIONNAIRE_MUTATION_CONTRACT_KEY,
  MODERN_SETTINGS_CAREER_PORTAL_QUESTIONNAIRE_PAGE,
  MODERN_SETTINGS_CAREER_PORTAL_QUESTIONNAIRE_PREVIEW_CONTRACT_KEY,
  MODERN_SETTINGS_CAREER_PORTAL_QUESTIONNAIRE_PREVIEW_PAGE,
  MODERN_SETTINGS_CAREER_PORTAL_QUESTIONNAIRE_UPDATE_CONTRACT_KEY,
  MODERN_SETTINGS_CAREER_PORTAL_QUESTIONNAIRE_UPDATE_MUTATION_CONTRACT_KEY,
  MODERN_SETTINGS_CAREER_PORTAL_QUESTIONNAIRE_UPDATE_PAGE,
  MODERN_SETTINGS_NEW_INSTALL_PASSWORD_CONTRACT_KEY,
  MODERN_SETTINGS_NEW_INSTALL_PASSWORD_MUTATION_CONTRACT_KEY,
  MODERN_SETTINGS_NEW_INSTALL_PASSWORD_PAGE,
  MODERN_SETTINGS_NEW_INSTALL_FINISHED_CONTRACT_KEY,
  MODERN_SETTINGS_NEW_INSTALL_FINISHED_PAGE,
  MODERN_SETTINGS_NEW_SITE_NAME_CONTRACT_KEY,
  MODERN_SETTINGS_NEW_SITE_NAME_MUTATION_CONTRACT_KEY,
  MODERN_SETTINGS_NEW_SITE_NAME_PAGE,
  MODERN_SETTINGS_LOGIN_ACTIVITY_PAGE,
  MODERN_SETTINGS_MANAGE_USERS_PAGE,
  MODERN_SETTINGS_MYPROFILE_CHANGE_PASSWORD_PAGE,
  MODERN_SETTINGS_MYPROFILE_PAGE,
  MODERN_SETTINGS_REJECTION_REASONS_PAGE,
  MODERN_SETTINGS_ROLE_PAGE_PERMISSIONS_PAGE,
  MODERN_SETTINGS_SCHEMA_MIGRATIONS_PAGE,
  MODERN_SETTINGS_TALENT_FIT_FLOW_SETTINGS_CONTRACT_KEY,
  MODERN_SETTINGS_TALENT_FIT_FLOW_SETTINGS_MUTATION_CONTRACT_KEY,
  MODERN_SETTINGS_TALENT_FIT_FLOW_SETTINGS_PAGE,
  MODERN_SETTINGS_TAGS_PAGE,
  MODERN_SETTINGS_SHOW_USER_PAGE,
  MODERN_SETTINGS_VIEW_ITEM_HISTORY_PAGE,
  MODERN_SOURCING_PAGE,
  MODERN_SETTINGS_UPGRADE_SITE_NAME_CONTRACT_KEY,
  MODERN_SETTINGS_UPGRADE_SITE_NAME_MUTATION_CONTRACT_KEY,
  MODERN_SETTINGS_UPGRADE_SITE_NAME_PAGE,
  MODERN_KPIS_DETAILS_PAGE,
  buildModernJSONRequestQuery
} from './modernContract';

function buildModernMutationURL(
  submitURL: string,
  backupQueryParams: Record<string, string | number | boolean | undefined> = {}
): string {
  const url = new URL(submitURL, window.location.href);
  url.searchParams.set('format', 'modern-json');

  Object.entries(backupQueryParams).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }
    const textValue = String(value).trim();
    if (textValue === '') {
      return;
    }
    url.searchParams.set(key, textValue);
  });

  return url.toString();
}

function appendModernFormFields(
  body: URLSearchParams,
  fields: Record<string, string | number | boolean | undefined>
): void {
  Object.entries(fields).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }
    const textValue = String(value).trim();
    if (textValue === '') {
      return;
    }
    body.set(key, textValue);
  });
}

function compactResponsePreview(bodyText: string, maxLength = 220): string {
  return String(bodyText || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

function inferMutationFailureHint(preview: string): string {
  const text = preview.toLowerCase();

  if (text.includes('invalid joborder id') || text.includes('invalid job order id')) {
    return 'Invalid job order ID payload. If file is too large, PHP can drop multipart POST fields.';
  }
  if (text.includes('invalid candidate id')) {
    return 'Invalid candidate ID payload. If file is too large, PHP can drop multipart POST fields.';
  }
  if (text.includes('invalid company id')) {
    return 'Invalid company ID payload. If file is too large, PHP can drop multipart POST fields.';
  }
  if (
    text.includes('file size is greater than system-wide size limit') ||
    text.includes('file size is greater than form size limit') ||
    text.includes('no file was uploaded') ||
    text.includes('file was only partially uploaded')
  ) {
    return 'Upload rejected by PHP upload limits or partial upload; check upload_max_filesize and post_max_size.';
  }
  if (
    text.includes('error connecting to database') ||
    text.includes('error selecting database') ||
    text.includes('mysql query failed')
  ) {
    return 'Server-side database error occurred while processing upload.';
  }
  if (text.includes('invalid start date')) {
    return 'Server handled this request as a job order form submit instead of attachment JSON. Check request URL and missing POST form fields.';
  }
  if (text.includes('required fields are missing')) {
    return 'Server rejected required form fields. Verify this call is hitting the intended modern-json mutation endpoint.';
  }
  if (text.includes('<!doctype') || text.includes('<html') || text.includes('commonerror')) {
    return 'Server returned an HTML error page instead of JSON.';
  }

  return 'Server returned a non-JSON response.';
}

async function parseModernMutationResponse(response: Response, actionLabel: string): Promise<ModernMutationResponse> {
  const responseBody = await response.text();
  const trimmed = responseBody.trim();

  if (trimmed !== '') {
    try {
      return JSON.parse(trimmed) as ModernMutationResponse;
    } catch (_error) {
      // Fall through to richer diagnostics below.
    }
  }

  const preview = compactResponsePreview(responseBody);
  const hint = inferMutationFailureHint(preview);

  if (typeof console !== 'undefined') {
    console.error('[modern-ui] mutation-response-parse-failed', {
      actionLabel,
      status: response.status,
      url: response.url || '',
      contentType: response.headers.get('content-type') || '',
      preview
    });
  }

  throw new Error(
    `${actionLabel} failed (${response.status}). ${hint}${preview === '' ? '' : ` Response preview: ${preview}`}`
  );
}

export async function fetchDashboardModernData(
  bootstrap: UIModeBootstrap,
  query: URLSearchParams
): Promise<DashboardModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'dashboard',
    action: 'my',
    modernPage: MODERN_DASHBOARD_PAGE,
    query
  });
  if (!apiQuery.get('view')) {
    apiQuery.set('view', 'kanban');
  }

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<DashboardModernDataResponse>(url);
  assertModernContract(data.meta, ['dashboard.my.readonly.v1', 'dashboard.my.interactive.v1'], 'dashboard data');

  return data;
}

export async function fetchHomeOverviewModernData(
  bootstrap: UIModeBootstrap,
  query: URLSearchParams
): Promise<HomeOverviewModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'home',
    action: 'home',
    modernPage: MODERN_HOME_OVERVIEW_PAGE,
    query
  });

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<HomeOverviewModernDataResponse>(url);
  assertModernContract(data.meta, 'home.overview.v1', 'home overview data');

  return data;
}

export async function fetchHomeQuickSearchModernData(
  bootstrap: UIModeBootstrap,
  query: URLSearchParams
): Promise<HomeQuickSearchModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'home',
    action: 'quickSearch',
    modernPage: MODERN_HOME_QUICKSEARCH_PAGE,
    query
  });

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<HomeQuickSearchModernDataResponse>(url);
  assertModernContract(data.meta, 'home.quickSearch.v1', 'home quick-search data');

  return data;
}

export async function fetchImportLauncherModernData(
  bootstrap: UIModeBootstrap,
  query: URLSearchParams
): Promise<ImportLauncherModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'import',
    action: 'import',
    modernPage: MODERN_IMPORT_LAUNCHER_PAGE,
    query
  });

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<ImportLauncherModernDataResponse>(url);
  assertModernContract(data.meta, 'import.launcher.v1', 'import launcher data');

  return data;
}

export async function fetchImportBulkResumesModernMutation(
  bootstrap: UIModeBootstrap,
  query?: URLSearchParams
): Promise<ImportBulkResumesModernMutationResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'import',
    action: 'importBulkResumes',
    modernPage: 'import-bulk-resumes',
    query
  });

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<ImportBulkResumesModernMutationResponse>(url);
  assertModernContract(data.meta, 'import.bulkResumes.v1', 'bulk resume import mutation');

  return data;
}

export async function fetchImportDeleteBulkResumesModernMutation(
  bootstrap: UIModeBootstrap,
  query?: URLSearchParams
): Promise<ImportDeleteBulkResumesModernMutationResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'import',
    action: 'deleteBulkResumes',
    modernPage: 'import-delete-bulk-resumes',
    query
  });

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<ImportDeleteBulkResumesModernMutationResponse>(url);
  assertModernContract(data.meta, 'import.deleteBulkResumes.v1', 'bulk resume delete mutation');

  return data;
}

export async function fetchSettingsMyProfileModernData(
  bootstrap: UIModeBootstrap,
  query: URLSearchParams
): Promise<SettingsMyProfileModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'settings',
    action: 'myProfile',
    modernPage: MODERN_SETTINGS_MYPROFILE_PAGE,
    query
  });

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<SettingsMyProfileModernDataResponse>(url);
  assertModernContract(data.meta, 'settings.myprofile.v1', 'settings my profile data');

  return data;
}

export async function fetchSettingsAdministrationModernData(
  bootstrap: UIModeBootstrap,
  query: URLSearchParams
): Promise<SettingsAdministrationModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'settings',
    action: 'administration',
    modernPage: MODERN_SETTINGS_ADMINISTRATION_PAGE,
    query
  });

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<SettingsAdministrationModernDataResponse>(url);
  assertModernContract(data.meta, 'settings.administration.v1', 'settings administration data');

  return data;
}

export async function fetchSettingsMyProfileChangePasswordModernData(
  bootstrap: UIModeBootstrap,
  query: URLSearchParams
): Promise<SettingsMyProfileChangePasswordModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'settings',
    action: 'myProfile',
    modernPage: MODERN_SETTINGS_MYPROFILE_CHANGE_PASSWORD_PAGE,
    query
  });
  apiQuery.set('s', 'changePassword');

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<SettingsMyProfileChangePasswordModernDataResponse>(url);
  assertModernContract(
    data.meta,
    'settings.myprofile.changePassword.v1',
    'settings my profile change password data'
  );

  return data;
}

export async function fetchSettingsLoginActivityModernData(
  bootstrap: UIModeBootstrap,
  query: URLSearchParams
): Promise<SettingsLoginActivityModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'settings',
    action: 'loginActivity',
    modernPage: MODERN_SETTINGS_LOGIN_ACTIVITY_PAGE,
    query
  });

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<SettingsLoginActivityModernDataResponse>(url);
  assertModernContract(data.meta, 'settings.loginActivity.v1', 'settings login activity data');

  return data;
}

export async function fetchSettingsEmailTemplatesModernData(
  bootstrap: UIModeBootstrap,
  query: URLSearchParams
): Promise<SettingsEmailTemplatesModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'settings',
    action: 'emailTemplates',
    modernPage: MODERN_SETTINGS_EMAIL_TEMPLATES_PAGE,
    query
  });

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<SettingsEmailTemplatesModernDataResponse>(url);
  assertModernContract(data.meta, 'settings.emailTemplates.v1', 'settings email templates data');

  return data;
}

export async function fetchSettingsGdprSettingsModernData(
  bootstrap: UIModeBootstrap,
  query: URLSearchParams
): Promise<SettingsGdprSettingsModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'settings',
    action: 'gdprSettings',
    modernPage: MODERN_SETTINGS_GDPR_SETTINGS_PAGE,
    query
  });

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<SettingsGdprSettingsModernDataResponse>(url);
  assertModernContract(data.meta, 'settings.gdprSettings.v1', 'settings GDPR settings data');

  return data;
}

export async function addSettingsEmailTemplate(
  addURL: string
): Promise<SettingsAddEmailTemplateMutationResponse> {
  const requestURL = buildModernMutationURL(addURL, {
    m: 'settings',
    a: 'addEmailTemplate',
    modernPage: MODERN_SETTINGS_EMAIL_TEMPLATES_PAGE
  });

  const response = await fetch(requestURL, {
    method: 'GET',
    credentials: 'same-origin'
  });

  const result = (await parseModernMutationResponse(
    response,
    'Add email template'
  )) as SettingsAddEmailTemplateMutationResponse;
  assertModernContract(
    result.meta,
    'settings.addEmailTemplate.mutation.v1',
    'settings add email template mutation'
  );

  return result;
}

export async function deleteSettingsEmailTemplate(
  deleteURL: string,
  templateID: number
): Promise<SettingsDeleteEmailTemplateMutationResponse> {
  const requestURL = buildModernMutationURL(deleteURL, {
    m: 'settings',
    a: 'deleteEmailTemplate',
    id: Number(templateID || 0),
    modernPage: MODERN_SETTINGS_EMAIL_TEMPLATES_PAGE
  });

  const response = await fetch(requestURL, {
    method: 'GET',
    credentials: 'same-origin'
  });

  const result = (await parseModernMutationResponse(
    response,
    'Delete email template'
  )) as SettingsDeleteEmailTemplateMutationResponse;
  assertModernContract(
    result.meta,
    'settings.deleteEmailTemplate.mutation.v1',
    'settings delete email template mutation'
  );

  return result;
}

export async function updateSettingsGdprSettings(
  submitURL: string,
  payload: {
    gdprExpirationYears: number | string;
    gdprFromAddress: string;
  }
): Promise<SettingsGdprSettingsMutationResponse> {
  const body = new URLSearchParams();
  body.set('postback', 'postback');
  body.set('format', 'modern-json');
  body.set('modernPage', MODERN_SETTINGS_GDPR_SETTINGS_PAGE);
  body.set('gdprExpirationYears', String(payload.gdprExpirationYears ?? '').trim());
  body.set('gdprFromAddress', String(payload.gdprFromAddress || ''));

  const requestURL = buildModernMutationURL(submitURL, {
    m: 'settings',
    a: 'gdprSettings',
    modernPage: MODERN_SETTINGS_GDPR_SETTINGS_PAGE
  });

  const response = await fetch(requestURL, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body.toString()
  });

  const result = (await parseModernMutationResponse(
    response,
    'Update GDPR settings'
  )) as SettingsGdprSettingsMutationResponse;
  assertModernContract(
    result.meta,
    'settings.gdprSettings.mutation.v1',
    'settings GDPR settings mutation'
  );

  return result;
}

export async function updateSettingsEmailTemplate(
  submitURL: string,
  payload: {
    templateID: number;
    emailTemplateTitle: string;
    messageText: string;
    messageTextOrigional?: string;
    useThisTemplate: boolean;
  }
): Promise<SettingsUpdateEmailTemplateMutationResponse> {
  const normalizedMessageText = String(payload.messageText || '');
  const body = new URLSearchParams();
  body.set('postback', 'postback');
  body.set('format', 'modern-json');
  body.set('modernPage', MODERN_SETTINGS_EMAIL_TEMPLATES_PAGE);
  body.set('templateID', String(Number(payload.templateID || 0)));
  body.set('emailTemplateTitle', String(payload.emailTemplateTitle || ''));
  body.set('messageText', normalizedMessageText);
  body.set('messageTextOrigional', String(payload.messageTextOrigional ?? normalizedMessageText));
  if (payload.useThisTemplate) {
    body.set('useThisTemplate', '1');
  }

  const requestURL = buildModernMutationURL(submitURL, {
    m: 'settings',
    a: 'emailTemplates',
    modernPage: MODERN_SETTINGS_EMAIL_TEMPLATES_PAGE
  });

  const response = await fetch(requestURL, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body.toString()
  });

  const result = (await parseModernMutationResponse(
    response,
    'Update email template'
  )) as SettingsUpdateEmailTemplateMutationResponse;
  assertModernContract(
    result.meta,
    'settings.emailTemplates.mutation.v1',
    'settings update email template mutation'
  );

  return result;
}

export async function fetchSettingsEmailSettingsModernData(
  bootstrap: UIModeBootstrap,
  query: URLSearchParams
): Promise<SettingsEmailSettingsModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'settings',
    action: 'emailSettings',
    modernPage: MODERN_SETTINGS_EMAIL_SETTINGS_PAGE,
    query
  });

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<SettingsEmailSettingsModernDataResponse>(url);
  assertModernContract(data.meta, MODERN_SETTINGS_EMAIL_SETTINGS_CONTRACT_KEY, 'settings email settings data');

  return data;
}

export async function updateSettingsEmailSettings(
  submitURL: string,
  payload: {
    fromAddress: string;
    statusChangeAllocated: boolean;
    statusChangeDeliveryValidated: boolean;
    statusChangeProposedToCustomer: boolean;
    statusChangeCustomerInterview: boolean;
    statusChangeCustomerApproved: boolean;
    statusChangeAvelApproved: boolean;
    statusChangeOfferNegotiation: boolean;
    statusChangeOfferAccepted: boolean;
    statusChangeHired: boolean;
    statusChangeRejected: boolean;
    templates: Array<{
      emailTemplateID: number;
      useThisTemplate: boolean;
    }>;
  }
): Promise<SettingsEmailSettingsMutationResponse> {
  const body = new URLSearchParams();
  body.set('postback', 'postback');
  body.set('format', 'modern-json');
  body.set('modernPage', MODERN_SETTINGS_EMAIL_SETTINGS_PAGE);
  body.set('fromAddress', String(payload.fromAddress || ''));
  if (payload.statusChangeAllocated) body.set('statusChangeAllocated', '1');
  if (payload.statusChangeDeliveryValidated) body.set('statusChangeDeliveryValidated', '1');
  if (payload.statusChangeProposedToCustomer) body.set('statusChangeProposedToCustomer', '1');
  if (payload.statusChangeCustomerInterview) body.set('statusChangeCustomerInterview', '1');
  if (payload.statusChangeCustomerApproved) body.set('statusChangeCustomerApproved', '1');
  if (payload.statusChangeAvelApproved) body.set('statusChangeAvelApproved', '1');
  if (payload.statusChangeOfferNegotiation) body.set('statusChangeOfferNegotiation', '1');
  if (payload.statusChangeOfferAccepted) body.set('statusChangeOfferAccepted', '1');
  if (payload.statusChangeHired) body.set('statusChangeHired', '1');
  if (payload.statusChangeRejected) body.set('statusChangeRejected', '1');
  payload.templates.forEach((template) => {
    if (template.useThisTemplate) {
      body.set(`useThisTemplate${template.emailTemplateID}`, '1');
    }
  });

  const requestURL = buildModernMutationURL(submitURL, {
    m: 'settings',
    a: 'emailSettings',
    modernPage: MODERN_SETTINGS_EMAIL_SETTINGS_PAGE
  });

  const response = await fetch(requestURL, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body.toString()
  });

  const result = (await parseModernMutationResponse(response, 'Update email settings')) as SettingsEmailSettingsMutationResponse;
  assertModernContract(
    result.meta,
    MODERN_SETTINGS_EMAIL_SETTINGS_MUTATION_CONTRACT_KEY,
    'settings email settings mutation'
  );

  return result;
}

export async function fetchSettingsFeedbackSettingsModernData(
  bootstrap: UIModeBootstrap,
  query: URLSearchParams
): Promise<SettingsFeedbackSettingsModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'settings',
    action: 'feedbackSettings',
    modernPage: MODERN_SETTINGS_FEEDBACK_SETTINGS_PAGE,
    query
  });

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<SettingsFeedbackSettingsModernDataResponse>(url);
  assertModernContract(data.meta, MODERN_SETTINGS_FEEDBACK_SETTINGS_CONTRACT_KEY, 'settings feedback settings data');

  return data;
}

export async function updateSettingsFeedbackSettings(
  submitURL: string,
  payload: {
    feedbackRecipientUserID: number;
  }
): Promise<SettingsFeedbackSettingsMutationResponse> {
  const body = new URLSearchParams();
  body.set('postback', 'postback');
  body.set('format', 'modern-json');
  body.set('modernPage', MODERN_SETTINGS_FEEDBACK_SETTINGS_PAGE);
  body.set('feedbackRecipientUserID', String(Number(payload.feedbackRecipientUserID || 0)));

  const requestURL = buildModernMutationURL(submitURL, {
    m: 'settings',
    a: 'feedbackSettings',
    modernPage: MODERN_SETTINGS_FEEDBACK_SETTINGS_PAGE
  });

  const response = await fetch(requestURL, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body.toString()
  });

  const result = (await parseModernMutationResponse(
    response,
    'Update feedback settings'
  )) as SettingsFeedbackSettingsMutationResponse;
  assertModernContract(
    result.meta,
    MODERN_SETTINGS_FEEDBACK_SETTINGS_MUTATION_CONTRACT_KEY,
    'settings feedback settings mutation'
  );

  return result;
}

export async function fetchSettingsForceEmailModernData(
  bootstrap: UIModeBootstrap,
  query: URLSearchParams
): Promise<SettingsForceEmailModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'settings',
    action: 'forceEmail',
    modernPage: MODERN_SETTINGS_FORCE_EMAIL_PAGE,
    query
  });

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<SettingsForceEmailModernDataResponse>(url);
  assertModernContract(data.meta, MODERN_SETTINGS_FORCE_EMAIL_CONTRACT_KEY, 'settings force-email data');

  return data;
}

export async function updateSettingsForceEmail(
  submitURL: string,
  payload: {
    siteName: string;
  }
): Promise<SettingsForceEmailMutationResponse> {
  const body = new URLSearchParams();
  body.set('postback', 'postback');
  body.set('format', 'modern-json');
  body.set('modernPage', MODERN_SETTINGS_FORCE_EMAIL_PAGE);
  body.set('siteName', String(payload.siteName || ''));

  const requestURL = buildModernMutationURL(submitURL, {
    m: 'settings',
    a: 'forceEmail',
    modernPage: MODERN_SETTINGS_FORCE_EMAIL_PAGE
  });

  const response = await fetch(requestURL, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body.toString()
  });

  const result = (await parseModernMutationResponse(response, 'Update force email')) as SettingsForceEmailMutationResponse;
  assertModernContract(result.meta, MODERN_SETTINGS_FORCE_EMAIL_MUTATION_CONTRACT_KEY, 'settings force-email mutation');

  return result;
}

export async function fetchSettingsGoogleOIDCSettingsModernData(
  bootstrap: UIModeBootstrap,
  query: URLSearchParams
): Promise<SettingsGoogleOIDCSettingsModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'settings',
    action: 'googleOIDCSettings',
    modernPage: MODERN_SETTINGS_GOOGLE_OIDC_SETTINGS_PAGE,
    query
  });

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<SettingsGoogleOIDCSettingsModernDataResponse>(url);
  assertModernContract(
    data.meta,
    MODERN_SETTINGS_GOOGLE_OIDC_SETTINGS_CONTRACT_KEY,
    'settings Google OIDC settings data'
  );

  return data;
}

export async function updateSettingsGoogleOIDCSettings(
  submitURL: string,
  payload: {
    enabled: boolean;
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    hostedDomain: string;
    siteId: number | string;
    autoProvisionEnabled: boolean;
    notifyEmail: string;
    fromEmail: string;
    requestSubject: string;
    testConfig?: boolean;
  }
): Promise<SettingsGoogleOIDCSettingsMutationResponse> {
  const body = new URLSearchParams();
  body.set('postback', 'postback');
  body.set('format', 'modern-json');
  body.set('modernPage', MODERN_SETTINGS_GOOGLE_OIDC_SETTINGS_PAGE);
  body.set('enabled', payload.enabled ? '1' : '0');
  body.set('clientId', String(payload.clientId || ''));
  body.set('clientSecret', String(payload.clientSecret || ''));
  body.set('redirectUri', String(payload.redirectUri || ''));
  body.set('hostedDomain', String(payload.hostedDomain || ''));
  body.set('siteId', String(payload.siteId || ''));
  body.set('autoProvisionEnabled', payload.autoProvisionEnabled ? '1' : '0');
  body.set('notifyEmail', String(payload.notifyEmail || ''));
  body.set('fromEmail', String(payload.fromEmail || ''));
  body.set('requestSubject', String(payload.requestSubject || ''));
  if (payload.testConfig) {
    body.set('testConfig', '1');
  }

  const requestURL = buildModernMutationURL(submitURL, {
    m: 'settings',
    a: 'googleOIDCSettings',
    modernPage: MODERN_SETTINGS_GOOGLE_OIDC_SETTINGS_PAGE
  });

  const response = await fetch(requestURL, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body.toString()
  });

  const result = (await parseModernMutationResponse(
    response,
    payload.testConfig ? 'Test Google OIDC settings' : 'Update Google OIDC settings'
  )) as SettingsGoogleOIDCSettingsMutationResponse;
  assertModernContract(
    result.meta,
    MODERN_SETTINGS_GOOGLE_OIDC_SETTINGS_MUTATION_CONTRACT_KEY,
    'settings Google OIDC settings mutation'
  );

  return result;
}

export async function fetchSettingsCustomizeCalendarModernData(
  bootstrap: UIModeBootstrap,
  query: URLSearchParams
): Promise<SettingsCustomizeCalendarModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'settings',
    action: 'customizeCalendar',
    modernPage: MODERN_SETTINGS_CUSTOMIZE_CALENDAR_PAGE,
    query
  });

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<SettingsCustomizeCalendarModernDataResponse>(url);
  assertModernContract(
    data.meta,
    MODERN_SETTINGS_CUSTOMIZE_CALENDAR_CONTRACT_KEY,
    'settings customize calendar data'
  );

  return data;
}

export async function updateSettingsCustomizeCalendar(
  submitURL: string,
  payload: {
    noAjax: boolean;
    defaultPublic: boolean;
    firstDayMonday: boolean;
    dayStart: number | string;
    dayStop: number | string;
    calendarView: string;
  }
): Promise<SettingsCustomizeCalendarMutationResponse> {
  const body = new URLSearchParams();
  body.set('postback', 'postback');
  body.set('format', 'modern-json');
  body.set('modernPage', MODERN_SETTINGS_CUSTOMIZE_CALENDAR_PAGE);
  if (payload.noAjax) body.set('noAjax', '1');
  if (payload.defaultPublic) body.set('defaultPublic', '1');
  if (payload.firstDayMonday) body.set('firstDayMonday', '1');
  body.set('dayStart', String(payload.dayStart ?? ''));
  body.set('dayStop', String(payload.dayStop ?? ''));
  body.set('calendarView', String(payload.calendarView || ''));

  const requestURL = buildModernMutationURL(submitURL, {
    m: 'settings',
    a: 'customizeCalendar',
    modernPage: MODERN_SETTINGS_CUSTOMIZE_CALENDAR_PAGE
  });

  const response = await fetch(requestURL, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body.toString()
  });

  const result = (await parseModernMutationResponse(
    response,
    'Update calendar customization'
  )) as SettingsCustomizeCalendarMutationResponse;
  assertModernContract(
    result.meta,
    MODERN_SETTINGS_CUSTOMIZE_CALENDAR_MUTATION_CONTRACT_KEY,
    'settings customize calendar mutation'
  );

  return result;
}

export async function fetchSettingsEEOModernData(
  bootstrap: UIModeBootstrap,
  query: URLSearchParams
): Promise<SettingsEEOModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'settings',
    action: 'eeo',
    modernPage: MODERN_SETTINGS_EEO_PAGE,
    query
  });

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<SettingsEEOModernDataResponse>(url);
  assertModernContract(data.meta, MODERN_SETTINGS_EEO_CONTRACT_KEY, 'settings EEO data');

  return data;
}

export async function updateSettingsEEO(
  submitURL: string,
  payload: {
    enabled: boolean;
    genderTracking: boolean;
    ethnicTracking: boolean;
    veteranTracking: boolean;
    disabilityTracking: boolean;
  }
): Promise<SettingsEEOMutationResponse> {
  const body = new URLSearchParams();
  body.set('postback', 'postback');
  body.set('format', 'modern-json');
  body.set('modernPage', MODERN_SETTINGS_EEO_PAGE);
  if (payload.enabled) body.set('enabled', '1');
  if (payload.genderTracking) body.set('genderTracking', '1');
  if (payload.ethnicTracking) body.set('ethnicTracking', '1');
  if (payload.veteranTracking) body.set('veteranTracking', '1');
  if (payload.disabilityTracking) body.set('disabilityTracking', '1');

  const requestURL = buildModernMutationURL(submitURL, {
    m: 'settings',
    a: 'eeo',
    modernPage: MODERN_SETTINGS_EEO_PAGE
  });

  const response = await fetch(requestURL, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body.toString()
  });

  const result = (await parseModernMutationResponse(response, 'Update EEO settings')) as SettingsEEOMutationResponse;
  assertModernContract(result.meta, MODERN_SETTINGS_EEO_MUTATION_CONTRACT_KEY, 'settings EEO mutation');

  return result;
}

export async function fetchSettingsTalentFitFlowSettingsModernData(
  bootstrap: UIModeBootstrap,
  query?: URLSearchParams
): Promise<SettingsTalentFitFlowSettingsModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'settings',
    action: 'talentFitFlowSettings',
    modernPage: MODERN_SETTINGS_TALENT_FIT_FLOW_SETTINGS_PAGE,
    query
  });

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<SettingsTalentFitFlowSettingsModernDataResponse>(url);
  assertModernContract(
    data.meta,
    MODERN_SETTINGS_TALENT_FIT_FLOW_SETTINGS_CONTRACT_KEY,
    'settings TalentFitFlow settings data'
  );

  return data;
}

export async function updateSettingsTalentFitFlowSettings(
  submitURL: string,
  payload: {
    baseUrl: string;
    apiKey: string;
    hmacSecret: string;
    testConnection?: boolean;
  }
): Promise<SettingsTalentFitFlowSettingsMutationResponse> {
  const body = new URLSearchParams();
  body.set('postback', 'postback');
  body.set('format', 'modern-json');
  body.set('modernPage', MODERN_SETTINGS_TALENT_FIT_FLOW_SETTINGS_PAGE);
  body.set('baseUrl', String(payload.baseUrl || ''));
  body.set('apiKey', String(payload.apiKey || ''));
  body.set('hmacSecret', String(payload.hmacSecret || ''));
  if (payload.testConnection) {
    body.set('testConnection', '1');
  }

  const requestURL = buildModernMutationURL(submitURL, {
    m: 'settings',
    a: 'talentFitFlowSettings',
    modernPage: MODERN_SETTINGS_TALENT_FIT_FLOW_SETTINGS_PAGE
  });

  const response = await fetch(requestURL, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body.toString()
  });

  const result = (await parseModernMutationResponse(
    response,
    payload.testConnection ? 'Test TalentFitFlow settings' : 'Update TalentFitFlow settings'
  )) as SettingsTalentFitFlowSettingsMutationResponse;
  assertModernContract(
    result.meta,
    MODERN_SETTINGS_TALENT_FIT_FLOW_SETTINGS_MUTATION_CONTRACT_KEY,
    'settings TalentFitFlow settings mutation'
  );

  return result;
}

export async function fetchSettingsNewInstallPasswordModernData(
  bootstrap: UIModeBootstrap,
  query?: URLSearchParams
): Promise<SettingsNewInstallPasswordModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'settings',
    action: 'newInstallPassword',
    modernPage: MODERN_SETTINGS_NEW_INSTALL_PASSWORD_PAGE,
    query
  });

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<SettingsNewInstallPasswordModernDataResponse>(url);
  assertModernContract(
    data.meta,
    MODERN_SETTINGS_NEW_INSTALL_PASSWORD_CONTRACT_KEY,
    'settings new install password data'
  );

  return data;
}

export async function updateSettingsNewInstallPassword(
  submitURL: string,
  payload: {
    password1: string;
    password2: string;
  }
): Promise<SettingsNewInstallPasswordMutationResponse> {
  const body = new URLSearchParams();
  body.set('postback', 'postback');
  body.set('format', 'modern-json');
  body.set('modernPage', MODERN_SETTINGS_NEW_INSTALL_PASSWORD_PAGE);
  body.set('password1', String(payload.password1 || ''));
  body.set('password2', String(payload.password2 || ''));

  const requestURL = buildModernMutationURL(submitURL, {
    m: 'settings',
    a: 'newInstallPassword',
    modernPage: MODERN_SETTINGS_NEW_INSTALL_PASSWORD_PAGE
  });

  const response = await fetch(requestURL, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body.toString()
  });

  const result = (await parseModernMutationResponse(
    response,
    'Update new install password'
  )) as SettingsNewInstallPasswordMutationResponse;
  assertModernContract(
    result.meta,
    MODERN_SETTINGS_NEW_INSTALL_PASSWORD_MUTATION_CONTRACT_KEY,
    'settings new install password mutation'
  );

  return result;
}

export async function fetchSettingsNewSiteNameModernData(
  bootstrap: UIModeBootstrap,
  query?: URLSearchParams
): Promise<SettingsNewSiteNameModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'settings',
    action: 'newSiteName',
    modernPage: MODERN_SETTINGS_NEW_SITE_NAME_PAGE,
    query
  });

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<SettingsNewSiteNameModernDataResponse>(url);
  assertModernContract(data.meta, MODERN_SETTINGS_NEW_SITE_NAME_CONTRACT_KEY, 'settings new site name data');

  return data;
}

export async function updateSettingsNewSiteName(
  submitURL: string,
  payload: {
    siteName: string;
  }
): Promise<SettingsNewSiteNameMutationResponse> {
  const body = new URLSearchParams();
  body.set('postback', 'postback');
  body.set('format', 'modern-json');
  body.set('modernPage', MODERN_SETTINGS_NEW_SITE_NAME_PAGE);
  body.set('siteName', String(payload.siteName || ''));

  const requestURL = buildModernMutationURL(submitURL, {
    m: 'settings',
    a: 'newSiteName',
    modernPage: MODERN_SETTINGS_NEW_SITE_NAME_PAGE
  });

  const response = await fetch(requestURL, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body.toString()
  });

  const result = (await parseModernMutationResponse(response, 'Update new site name')) as SettingsNewSiteNameMutationResponse;
  assertModernContract(
    result.meta,
    MODERN_SETTINGS_NEW_SITE_NAME_MUTATION_CONTRACT_KEY,
    'settings new site name mutation'
  );

  return result;
}

export async function fetchSettingsCreateBackupModernData(
  bootstrap: UIModeBootstrap,
  query?: URLSearchParams
): Promise<SettingsCreateBackupModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'settings',
    action: 'createBackup',
    modernPage: MODERN_SETTINGS_CREATE_BACKUP_PAGE,
    query
  });

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<SettingsCreateBackupModernDataResponse>(url);
  assertModernContract(data.meta, MODERN_SETTINGS_CREATE_BACKUP_CONTRACT_KEY, 'settings create backup data');

  return data;
}

export async function deleteSettingsBackup(
  deleteURL: string
): Promise<SettingsDeleteBackupMutationResponse> {
  const requestURL = buildModernMutationURL(deleteURL, {
    m: 'settings',
    a: 'deleteBackup',
    modernPage: MODERN_SETTINGS_DELETE_BACKUP_PAGE
  });

  const response = await fetch(requestURL, {
    method: 'GET',
    credentials: 'same-origin'
  });

  const result = (await parseModernMutationResponse(response, 'Delete backup')) as SettingsDeleteBackupMutationResponse;
  assertModernContract(
    result.meta,
    MODERN_SETTINGS_DELETE_BACKUP_MUTATION_CONTRACT_KEY,
    'settings delete backup mutation'
  );

  return result;
}

export async function fetchSettingsCustomizeExtraFieldsModernData(
  bootstrap: UIModeBootstrap,
  query?: URLSearchParams
): Promise<SettingsCustomizeExtraFieldsModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'settings',
    action: 'customizeExtraFields',
    modernPage: MODERN_SETTINGS_CUSTOMIZE_EXTRA_FIELDS_PAGE,
    query
  });

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<SettingsCustomizeExtraFieldsModernDataResponse>(url);
  assertModernContract(
    data.meta,
    MODERN_SETTINGS_CUSTOMIZE_EXTRA_FIELDS_CONTRACT_KEY,
    'settings customize extra fields data'
  );

  return data;
}

export async function updateSettingsCustomizeExtraFields(
  submitURL: string,
  payload: {
    commandList: string;
  }
): Promise<SettingsCustomizeExtraFieldsMutationResponse> {
  const body = new URLSearchParams();
  body.set('postback', 'postback');
  body.set('format', 'modern-json');
  body.set('modernPage', MODERN_SETTINGS_CUSTOMIZE_EXTRA_FIELDS_PAGE);
  body.set('commandList', String(payload.commandList || ''));

  const requestURL = buildModernMutationURL(submitURL, {
    m: 'settings',
    a: 'customizeExtraFields',
    modernPage: MODERN_SETTINGS_CUSTOMIZE_EXTRA_FIELDS_PAGE
  });

  const response = await fetch(requestURL, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body.toString()
  });

  const result = (await parseModernMutationResponse(
    response,
    'Update custom extra fields'
  )) as SettingsCustomizeExtraFieldsMutationResponse;
  assertModernContract(
    result.meta,
    MODERN_SETTINGS_CUSTOMIZE_EXTRA_FIELDS_MUTATION_CONTRACT_KEY,
    'settings customize extra fields mutation'
  );

  return result;
}

export async function fetchSettingsNewInstallFinishedModernData(
  bootstrap: UIModeBootstrap,
  query?: URLSearchParams
): Promise<SettingsNewInstallFinishedModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'settings',
    action: 'newInstallFinished',
    modernPage: MODERN_SETTINGS_NEW_INSTALL_FINISHED_PAGE,
    query
  });

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<SettingsNewInstallFinishedModernDataResponse>(url);
  assertModernContract(
    data.meta,
    MODERN_SETTINGS_NEW_INSTALL_FINISHED_CONTRACT_KEY,
    'settings new install finished data'
  );

  return data;
}

export async function fetchSettingsUpgradeSiteNameModernData(
  bootstrap: UIModeBootstrap,
  query?: URLSearchParams
): Promise<SettingsUpgradeSiteNameModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'settings',
    action: 'upgradeSiteName',
    modernPage: MODERN_SETTINGS_UPGRADE_SITE_NAME_PAGE,
    query
  });

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<SettingsUpgradeSiteNameModernDataResponse>(url);
  assertModernContract(
    data.meta,
    MODERN_SETTINGS_UPGRADE_SITE_NAME_CONTRACT_KEY,
    'settings upgrade site name data'
  );

  return data;
}

export async function updateSettingsUpgradeSiteName(
  submitURL: string,
  payload: {
    siteName: string;
  }
): Promise<SettingsUpgradeSiteNameMutationResponse> {
  const body = new URLSearchParams();
  body.set('postback', 'postback');
  body.set('format', 'modern-json');
  body.set('modernPage', MODERN_SETTINGS_UPGRADE_SITE_NAME_PAGE);
  body.set('siteName', String(payload.siteName || ''));

  const requestURL = buildModernMutationURL(submitURL, {
    m: 'settings',
    a: 'upgradeSiteName',
    modernPage: MODERN_SETTINGS_UPGRADE_SITE_NAME_PAGE
  });

  const response = await fetch(requestURL, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body.toString()
  });

  const result = (await parseModernMutationResponse(
    response,
    'Update upgrade site name'
  )) as SettingsUpgradeSiteNameMutationResponse;
  assertModernContract(
    result.meta,
    MODERN_SETTINGS_UPGRADE_SITE_NAME_MUTATION_CONTRACT_KEY,
    'settings upgrade site name mutation'
  );

  return result;
}

export async function fetchSettingsCareerPortalSettingsModernData(
  bootstrap: UIModeBootstrap,
  query?: URLSearchParams
): Promise<SettingsCareerPortalSettingsModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'settings',
    action: 'careerPortalSettings',
    modernPage: MODERN_SETTINGS_CAREER_PORTAL_SETTINGS_PAGE,
    query
  });

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<SettingsCareerPortalSettingsModernDataResponse>(url);
  assertModernContract(
    data.meta,
    MODERN_SETTINGS_CAREER_PORTAL_SETTINGS_CONTRACT_KEY,
    'settings career portal settings data'
  );

  return data;
}

export async function updateSettingsCareerPortalSettings(
  submitURL: string,
  payload: {
    enabled: boolean;
    allowBrowse: boolean;
    candidateRegistration: boolean;
    showCompany: boolean;
    showDepartment: boolean;
  }
): Promise<SettingsCareerPortalSettingsMutationResponse> {
  const body = new URLSearchParams();
  body.set('postback', 'postback');
  body.set('format', 'modern-json');
  body.set('modernPage', MODERN_SETTINGS_CAREER_PORTAL_SETTINGS_PAGE);
  body.set('configured', '1');
  if (payload.enabled) body.set('enabled', '1');
  if (payload.allowBrowse) body.set('allowBrowse', '1');
  if (payload.candidateRegistration) body.set('candidateRegistration', '1');
  if (payload.showCompany) body.set('showCompany', '1');
  if (payload.showDepartment) body.set('showDepartment', '1');

  const requestURL = buildModernMutationURL(submitURL, {
    m: 'settings',
    a: 'careerPortalSettings',
    modernPage: MODERN_SETTINGS_CAREER_PORTAL_SETTINGS_PAGE
  });

  const response = await fetch(requestURL, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body.toString()
  });

  const result = (await parseModernMutationResponse(
    response,
    'Update career portal settings'
  )) as SettingsCareerPortalSettingsMutationResponse;
  assertModernContract(
    result.meta,
    MODERN_SETTINGS_CAREER_PORTAL_SETTINGS_MUTATION_CONTRACT_KEY,
    'settings career portal settings mutation'
  );

  return result;
}

export async function fetchSettingsCareerPortalTemplateEditModernData(
  bootstrap: UIModeBootstrap,
  query?: URLSearchParams
): Promise<SettingsCareerPortalTemplateEditModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'settings',
    action: 'careerPortalTemplateEdit',
    modernPage: MODERN_SETTINGS_CAREER_PORTAL_TEMPLATE_EDIT_PAGE,
    query
  });

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<SettingsCareerPortalTemplateEditModernDataResponse>(url);
  assertModernContract(
    data.meta,
    MODERN_SETTINGS_CAREER_PORTAL_TEMPLATE_EDIT_CONTRACT_KEY,
    'settings career portal template edit data'
  );

  return data;
}

export async function updateSettingsCareerPortalTemplateEdit(
  submitURL: string,
  payload: {
    templateName: string;
    continueEdit?: boolean;
    fields: Record<string, string>;
  }
): Promise<SettingsCareerPortalTemplateEditMutationResponse> {
  const body = new URLSearchParams();
  body.set('postback', 'postback');
  body.set('format', 'modern-json');
  body.set('modernPage', MODERN_SETTINGS_CAREER_PORTAL_TEMPLATE_EDIT_PAGE);
  body.set('templateName', String(payload.templateName || ''));
  body.set('continueEdit', payload.continueEdit ? '1' : '0');
  appendModernFormFields(body, payload.fields);

  const requestURL = buildModernMutationURL(submitURL, {
    m: 'settings',
    a: 'careerPortalTemplateEdit',
    modernPage: MODERN_SETTINGS_CAREER_PORTAL_TEMPLATE_EDIT_PAGE
  });

  const response = await fetch(requestURL, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body.toString()
  });

  const result = (await parseModernMutationResponse(
    response,
    'Update career portal template'
  )) as SettingsCareerPortalTemplateEditMutationResponse;
  assertModernContract(
    result.meta,
    MODERN_SETTINGS_CAREER_PORTAL_TEMPLATE_EDIT_MUTATION_CONTRACT_KEY,
    'settings career portal template edit mutation'
  );

  return result;
}

export async function fetchSettingsCareerPortalQuestionnaireModernData(
  bootstrap: UIModeBootstrap,
  query?: URLSearchParams
): Promise<SettingsCareerPortalQuestionnaireModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'settings',
    action: 'careerPortalQuestionnaire',
    modernPage: MODERN_SETTINGS_CAREER_PORTAL_QUESTIONNAIRE_PAGE,
    query
  });

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<SettingsCareerPortalQuestionnaireModernDataResponse>(url);
  assertModernContract(
    data.meta,
    MODERN_SETTINGS_CAREER_PORTAL_QUESTIONNAIRE_CONTRACT_KEY,
    'settings career portal questionnaire data'
  );

  return data;
}

export async function updateSettingsCareerPortalQuestionnaire(
  submitURL: string,
  payload: {
    fields: Record<string, string | number | boolean | undefined>;
  }
): Promise<SettingsCareerPortalQuestionnaireMutationResponse> {
  const body = new URLSearchParams();
  body.set('postback', '1');
  body.set('format', 'modern-json');
  body.set('modernPage', MODERN_SETTINGS_CAREER_PORTAL_QUESTIONNAIRE_PAGE);
  appendModernFormFields(body, payload.fields);

  const requestURL = buildModernMutationURL(submitURL, {
    m: 'settings',
    a: 'careerPortalQuestionnaire',
    modernPage: MODERN_SETTINGS_CAREER_PORTAL_QUESTIONNAIRE_PAGE
  });

  const response = await fetch(requestURL, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body.toString()
  });

  const result = (await parseModernMutationResponse(
    response,
    'Update career portal questionnaire'
  )) as SettingsCareerPortalQuestionnaireMutationResponse;
  assertModernContract(
    result.meta,
    MODERN_SETTINGS_CAREER_PORTAL_QUESTIONNAIRE_MUTATION_CONTRACT_KEY,
    'settings career portal questionnaire mutation'
  );

  return result;
}

export async function fetchSettingsCareerPortalQuestionnairePreviewModernData(
  bootstrap: UIModeBootstrap,
  query?: URLSearchParams
): Promise<SettingsCareerPortalQuestionnairePreviewModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'settings',
    action: 'careerPortalQuestionnairePreview',
    modernPage: MODERN_SETTINGS_CAREER_PORTAL_QUESTIONNAIRE_PREVIEW_PAGE,
    query
  });

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<SettingsCareerPortalQuestionnairePreviewModernDataResponse>(url);
  assertModernContract(
    data.meta,
    MODERN_SETTINGS_CAREER_PORTAL_QUESTIONNAIRE_PREVIEW_CONTRACT_KEY,
    'settings career portal questionnaire preview data'
  );

  return data;
}

export async function fetchSettingsCareerPortalQuestionnaireUpdateModernData(
  bootstrap: UIModeBootstrap,
  query?: URLSearchParams
): Promise<SettingsCareerPortalQuestionnaireUpdateModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'settings',
    action: 'careerPortalQuestionnaireUpdate',
    modernPage: MODERN_SETTINGS_CAREER_PORTAL_QUESTIONNAIRE_UPDATE_PAGE,
    query
  });

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<SettingsCareerPortalQuestionnaireUpdateModernDataResponse>(url);
  assertModernContract(
    data.meta,
    MODERN_SETTINGS_CAREER_PORTAL_QUESTIONNAIRE_UPDATE_CONTRACT_KEY,
    'settings career portal questionnaire update data'
  );

  return data;
}

export async function updateSettingsCareerPortalQuestionnaireUpdate(
  submitURL: string,
  payload: Record<string, string | number | boolean | undefined>
): Promise<SettingsCareerPortalQuestionnaireUpdateMutationResponse> {
  const body = new URLSearchParams();
  body.set('postback', 'postback');
  body.set('format', 'modern-json');
  body.set('modernPage', MODERN_SETTINGS_CAREER_PORTAL_QUESTIONNAIRE_UPDATE_PAGE);
  appendModernFormFields(body, payload);

  const requestURL = buildModernMutationURL(submitURL, {
    m: 'settings',
    a: 'careerPortalQuestionnaireUpdate',
    modernPage: MODERN_SETTINGS_CAREER_PORTAL_QUESTIONNAIRE_UPDATE_PAGE
  });

  const response = await fetch(requestURL, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body.toString()
  });

  const result = (await parseModernMutationResponse(
    response,
    'Update career portal questionnaire list'
  )) as SettingsCareerPortalQuestionnaireUpdateMutationResponse;
  assertModernContract(
    result.meta,
    MODERN_SETTINGS_CAREER_PORTAL_QUESTIONNAIRE_UPDATE_MUTATION_CONTRACT_KEY,
    'settings career portal questionnaire update mutation'
  );

  return result;
}

export async function fetchSettingsDeleteUserModernData(
  bootstrap: UIModeBootstrap,
  query: URLSearchParams
): Promise<SettingsDeleteUserModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'settings',
    action: 'deleteUser',
    modernPage: MODERN_SETTINGS_DELETE_USER_PAGE,
    query
  });

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<SettingsDeleteUserModernDataResponse>(url);
  assertModernContract(data.meta, MODERN_SETTINGS_DELETE_USER_CONTRACT_KEY, 'settings delete user data');

  return data;
}

export async function deleteSettingsUser(
  submitURL: string,
  payload: {
    userID: number;
    iAmTheAutomatedTester?: boolean;
  }
): Promise<SettingsDeleteUserMutationResponse> {
  const requestURL = buildModernMutationURL(submitURL, {
    m: 'settings',
    a: 'deleteUser',
    userID: Number(payload.userID || 0),
    iAmTheAutomatedTester: payload.iAmTheAutomatedTester ? 1 : undefined,
    modernPage: MODERN_SETTINGS_DELETE_USER_PAGE
  });

  const response = await fetch(requestURL, {
    method: 'GET',
    credentials: 'same-origin'
  });

  const result = (await parseModernMutationResponse(response, 'Delete user')) as SettingsDeleteUserMutationResponse;
  assertModernContract(result.meta, MODERN_SETTINGS_DELETE_USER_MUTATION_CONTRACT_KEY, 'settings delete user mutation');

  return result;
}

export async function fetchSettingsManageUsersModernData(
  bootstrap: UIModeBootstrap,
  query: URLSearchParams
): Promise<SettingsManageUsersModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'settings',
    action: 'manageUsers',
    modernPage: MODERN_SETTINGS_MANAGE_USERS_PAGE,
    query
  });

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<SettingsManageUsersModernDataResponse>(url);
  assertModernContract(data.meta, 'settings.manageUsers.v1', 'settings manage users data');

  return data;
}

export async function fetchSettingsAddUserModernData(
  bootstrap: UIModeBootstrap,
  query: URLSearchParams
): Promise<SettingsAddUserModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'settings',
    action: 'addUser',
    modernPage: MODERN_SETTINGS_ADD_USER_PAGE,
    query
  });

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<SettingsAddUserModernDataResponse>(url);
  assertModernContract(data.meta, 'settings.addUser.v1', 'settings add user data');

  return data;
}

export async function fetchSettingsEditUserModernData(
  bootstrap: UIModeBootstrap,
  query: URLSearchParams
): Promise<SettingsEditUserModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'settings',
    action: 'editUser',
    modernPage: MODERN_SETTINGS_EDIT_USER_PAGE,
    query
  });

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<SettingsEditUserModernDataResponse>(url);
  assertModernContract(data.meta, 'settings.editUser.v1', 'settings edit user data');

  return data;
}

export async function fetchSettingsShowUserModernData(
  bootstrap: UIModeBootstrap,
  query: URLSearchParams
): Promise<SettingsShowUserModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'settings',
    action: 'showUser',
    modernPage: MODERN_SETTINGS_SHOW_USER_PAGE,
    query
  });

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<SettingsShowUserModernDataResponse>(url);
  assertModernContract(data.meta, 'settings.showUser.v1', 'settings show user data');

  return data;
}

export async function fetchSettingsRejectionReasonsModernData(
  bootstrap: UIModeBootstrap,
  query: URLSearchParams
): Promise<SettingsRejectionReasonsModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'settings',
    action: 'rejectionReasons',
    modernPage: MODERN_SETTINGS_REJECTION_REASONS_PAGE,
    query
  });

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<SettingsRejectionReasonsModernDataResponse>(url);
  assertModernContract(data.meta, 'settings.rejectionReasons.v1', 'settings rejection reasons data');

  return data;
}

export async function fetchSettingsTagsModernData(
  bootstrap: UIModeBootstrap,
  query: URLSearchParams
): Promise<SettingsTagsModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'settings',
    action: 'tags',
    modernPage: MODERN_SETTINGS_TAGS_PAGE,
    query
  });

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<SettingsTagsModernDataResponse>(url);
  assertModernContract(data.meta, 'settings.tags.v1', 'settings tags data');

  return data;
}

export async function fetchSettingsRolePagePermissionsModernData(
  bootstrap: UIModeBootstrap,
  query: URLSearchParams
): Promise<SettingsRolePagePermissionsModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'settings',
    action: 'rolePagePermissions',
    modernPage: MODERN_SETTINGS_ROLE_PAGE_PERMISSIONS_PAGE,
    query
  });

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<SettingsRolePagePermissionsModernDataResponse>(url);
  assertModernContract(data.meta, 'settings.rolePagePermissions.v1', 'settings role page permissions data');

  return data;
}

export async function fetchSettingsSchemaMigrationsModernData(
  bootstrap: UIModeBootstrap,
  query: URLSearchParams
): Promise<SettingsSchemaMigrationsModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'settings',
    action: 'schemaMigrations',
    modernPage: MODERN_SETTINGS_SCHEMA_MIGRATIONS_PAGE,
    query
  });

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<SettingsSchemaMigrationsModernDataResponse>(url);
  assertModernContract(data.meta, 'settings.schemaMigrations.v1', 'settings schema migrations data');

  return data;
}

export async function fetchSettingsViewItemHistoryModernData(
  bootstrap: UIModeBootstrap,
  query: URLSearchParams
): Promise<SettingsViewItemHistoryModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'settings',
    action: 'viewItemHistory',
    modernPage: MODERN_SETTINGS_VIEW_ITEM_HISTORY_PAGE,
    query
  });

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<SettingsViewItemHistoryModernDataResponse>(url);
  assertModernContract(data.meta, 'settings.viewItemHistory.v1', 'settings item history data');

  return data;
}

type SettingsWizardAction =
  | 'ajax_wizardAddUser'
  | 'ajax_wizardCheckKey'
  | 'ajax_wizardImport'
  | 'ajax_wizardLicense'
  | 'ajax_wizardPassword'
  | 'ajax_wizardSiteName'
  | 'ajax_wizardWebsite'
  | 'ajax_wizardFirstTimeSetup'
  | 'ajax_wizardDeleteUser'
  | 'ajax_wizardEmail'
  | 'ajax_wizardLocalization';

function getSettingsWizardModernPage(action: SettingsWizardAction): string {
  switch (action) {
    case 'ajax_wizardAddUser':
      return 'settings-wizard-add-user';
    case 'ajax_wizardCheckKey':
      return 'settings-wizard-check-key';
    case 'ajax_wizardImport':
      return 'settings-wizard-import';
    case 'ajax_wizardLicense':
      return 'settings-wizard-license';
    case 'ajax_wizardPassword':
      return 'settings-wizard-password';
    case 'ajax_wizardSiteName':
      return 'settings-wizard-site-name';
    case 'ajax_wizardWebsite':
      return 'settings-wizard-website';
    case 'ajax_wizardFirstTimeSetup':
      return 'settings-wizard-first-time-setup';
    case 'ajax_wizardDeleteUser':
      return 'settings-wizard-delete-user';
    case 'ajax_wizardEmail':
      return 'settings-wizard-email';
    case 'ajax_wizardLocalization':
      return 'settings-wizard-localization';
  }
}

async function fetchSettingsWizardModernData<T extends ModernMutationResponse>(
  bootstrap: UIModeBootstrap,
  action: SettingsWizardAction,
  query?: URLSearchParams
): Promise<T> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'settings',
    action,
    modernPage: getSettingsWizardModernPage(action),
    query
  });

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  return getJSON<T>(url);
}

export async function fetchSettingsWizardImportModernData(
  bootstrap: UIModeBootstrap,
  query?: URLSearchParams
): Promise<SettingsWizardImportModernDataResponse> {
  return fetchSettingsWizardModernData<SettingsWizardImportModernDataResponse>(bootstrap, 'ajax_wizardImport', query);
}

export async function fetchSettingsWizardLicenseModernData(
  bootstrap: UIModeBootstrap,
  query?: URLSearchParams
): Promise<SettingsWizardLicenseModernDataResponse> {
  return fetchSettingsWizardModernData<SettingsWizardLicenseModernDataResponse>(bootstrap, 'ajax_wizardLicense', query);
}

export async function fetchSettingsWizardAddUserModernData(
  bootstrap: UIModeBootstrap,
  query?: URLSearchParams
): Promise<SettingsWizardAddUserModernDataResponse> {
  return fetchSettingsWizardModernData<SettingsWizardAddUserModernDataResponse>(bootstrap, 'ajax_wizardAddUser', query);
}

export async function fetchSettingsWizardCheckKeyModernData(
  bootstrap: UIModeBootstrap,
  query?: URLSearchParams
): Promise<SettingsWizardCheckKeyModernDataResponse> {
  return fetchSettingsWizardModernData<SettingsWizardCheckKeyModernDataResponse>(bootstrap, 'ajax_wizardCheckKey', query);
}

export async function fetchSettingsWizardFirstTimeSetupModernData(
  bootstrap: UIModeBootstrap,
  query?: URLSearchParams
): Promise<SettingsWizardFirstTimeSetupModernDataResponse> {
  return fetchSettingsWizardModernData<SettingsWizardFirstTimeSetupModernDataResponse>(
    bootstrap,
    'ajax_wizardFirstTimeSetup',
    query
  );
}

export async function fetchSettingsWizardDeleteUserModernData(
  bootstrap: UIModeBootstrap,
  query?: URLSearchParams
): Promise<SettingsWizardDeleteUserModernDataResponse> {
  return fetchSettingsWizardModernData<SettingsWizardDeleteUserModernDataResponse>(
    bootstrap,
    'ajax_wizardDeleteUser',
    query
  );
}

export async function fetchSettingsWizardEmailModernData(
  bootstrap: UIModeBootstrap,
  query?: URLSearchParams
): Promise<SettingsWizardEmailModernDataResponse> {
  return fetchSettingsWizardModernData<SettingsWizardEmailModernDataResponse>(bootstrap, 'ajax_wizardEmail', query);
}

export async function fetchSettingsWizardLocalizationModernData(
  bootstrap: UIModeBootstrap,
  query?: URLSearchParams
): Promise<SettingsWizardLocalizationModernDataResponse> {
  return fetchSettingsWizardModernData<SettingsWizardLocalizationModernDataResponse>(
    bootstrap,
    'ajax_wizardLocalization',
    query
  );
}

export async function fetchSettingsWizardPasswordModernData(
  bootstrap: UIModeBootstrap,
  query?: URLSearchParams
): Promise<SettingsWizardPasswordModernDataResponse> {
  return fetchSettingsWizardModernData<SettingsWizardPasswordModernDataResponse>(bootstrap, 'ajax_wizardPassword', query);
}

export async function fetchSettingsWizardSiteNameModernData(
  bootstrap: UIModeBootstrap,
  query?: URLSearchParams
): Promise<SettingsWizardSiteNameModernDataResponse> {
  return fetchSettingsWizardModernData<SettingsWizardSiteNameModernDataResponse>(bootstrap, 'ajax_wizardSiteName', query);
}

export async function fetchSettingsWizardWebsiteModernData(
  bootstrap: UIModeBootstrap,
  query?: URLSearchParams
): Promise<SettingsWizardWebsiteModernDataResponse> {
  return fetchSettingsWizardModernData<SettingsWizardWebsiteModernDataResponse>(bootstrap, 'ajax_wizardWebsite', query);
}

export async function fetchLoginModernData(
  bootstrap: UIModeBootstrap,
  action: string,
  query: URLSearchParams
): Promise<LoginModernDataResponse> {
  const resolvedAction = String(action || '').trim() || 'showLoginForm';
  const apiQuery = buildModernJSONRequestQuery({
    module: 'login',
    action: resolvedAction,
    modernPage: MODERN_LOGIN_PAGE,
    query
  });

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<LoginModernDataResponse>(url);
  assertModernContract(data.meta, 'login.workspace.v1', 'login workspace data');

  return data;
}

export async function submitForgotPasswordModernData(
  submitURL: string,
  username: string
): Promise<LoginModernDataResponse> {
  const body = new URLSearchParams();
  body.set('postback', 'true');
  body.set('username', username || '');
  body.set('format', 'modern-json');
  body.set('modernPage', MODERN_LOGIN_PAGE);

  const response = await fetch(submitURL, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body.toString()
  });

  if (!response.ok) {
    throw new Error(`Forgot password submit failed (${response.status}).`);
  }

  const data = (await response.json()) as LoginModernDataResponse;
  assertModernContract(data.meta, 'login.workspace.v1', 'forgot password response');
  return data;
}

export async function fetchRssJobOrdersModernData(
  bootstrap: UIModeBootstrap,
  query: URLSearchParams
): Promise<RssJobOrdersModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'rss',
    action: 'jobOrders',
    modernPage: MODERN_RSS_JOBORDERS_PAGE,
    query
  });

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<RssJobOrdersModernDataResponse>(url);
  assertModernContract(data.meta, 'rss.jobOrders.v1', 'rss job orders data');

  return data;
}

export async function fetchKpisListModernData(
  bootstrap: UIModeBootstrap,
  query: URLSearchParams
): Promise<KpisListModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'kpis',
    action: '',
    modernPage: MODERN_KPIS_PAGE,
    query
  });
  apiQuery.delete('a');

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<KpisListModernDataResponse>(url);
  assertModernContract(data.meta, 'kpis.list.v1', 'kpis list data');

  return data;
}

export async function fetchKpisDetailsModernData(
  bootstrap: UIModeBootstrap,
  query: URLSearchParams
): Promise<KpisDetailsModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'kpis',
    action: 'details',
    modernPage: MODERN_KPIS_DETAILS_PAGE,
    query
  });

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<KpisDetailsModernDataResponse>(url);
  assertModernContract(data.meta, 'kpis.details.v1', 'kpis details data');

  return data;
}

export async function fetchHomeInboxModernData(
  bootstrap: UIModeBootstrap,
  query: URLSearchParams
): Promise<HomeInboxModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'home',
    action: 'inbox',
    modernPage: MODERN_HOME_INBOX_PAGE,
    query
  });

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<HomeInboxModernDataResponse>(url);
  assertModernContract(data.meta, 'home.inbox.v1', 'home inbox data');

  return data;
}

export async function fetchHomeMyNotesModernData(
  bootstrap: UIModeBootstrap,
  query: URLSearchParams
): Promise<HomeMyNotesModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'home',
    action: 'myNotes',
    modernPage: MODERN_HOME_MYNOTES_PAGE,
    query
  });

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<HomeMyNotesModernDataResponse>(url);
  assertModernContract(data.meta, 'home.mynotes.v1', 'home my-notes data');

  return data;
}

export async function setHomeMyNotesTodoStatus(
  submitURL: string,
  payload: {
    itemID: number;
    taskStatus: string;
    securityToken: string;
  }
): Promise<ModernMutationResponse> {
  const body = new URLSearchParams();
  body.set('format', 'modern-json');
  body.set('itemID', String(payload.itemID || 0));
  body.set('taskStatus', String(payload.taskStatus || '').trim() || 'open');
  body.set('securityToken', payload.securityToken || '');

  const requestURL = buildModernMutationURL(submitURL, {
    m: 'home',
    a: 'setPersonalTodoStatus',
    modernPage: MODERN_HOME_MYNOTES_PAGE
  });

  const response = await fetch(requestURL, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body.toString()
  });

  return parseModernMutationResponse(response, 'To-do status update');
}

export async function addHomeMyNotesTodo(
  submitURL: string,
  payload: {
    title: string;
    body: string;
    dueDate: string;
    priority: string;
    reminderAt: string;
    taskStatus: string;
    securityToken: string;
  }
): Promise<ModernMutationResponse> {
  const body = new URLSearchParams();
  body.set('format', 'modern-json');
  body.set('itemType', 'todo');
  body.set('title', String(payload.title || '').trim());
  body.set('body', String(payload.body || '').trim());
  body.set('dueDate', String(payload.dueDate || '').trim());
  body.set('priority', String(payload.priority || '').trim());
  body.set('reminderAt', String(payload.reminderAt || '').trim());
  body.set('taskStatus', String(payload.taskStatus || '').trim() || 'open');
  body.set('securityToken', payload.securityToken || '');

  const requestURL = buildModernMutationURL(submitURL, {
    m: 'home',
    a: 'addPersonalItem',
    modernPage: MODERN_HOME_MYNOTES_PAGE
  });

  const response = await fetch(requestURL, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body.toString()
  });

  return parseModernMutationResponse(response, 'Add to-do');
}

export async function updateHomeMyNotesTodo(
  submitURL: string,
  payload: {
    itemID: number;
    title: string;
    body: string;
    dueDate: string;
    priority: string;
    reminderAt: string;
    taskStatus: string;
    securityToken: string;
  }
): Promise<ModernMutationResponse> {
  const body = new URLSearchParams();
  body.set('format', 'modern-json');
  body.set('itemID', String(payload.itemID || 0));
  body.set('title', String(payload.title || '').trim());
  body.set('body', String(payload.body || '').trim());
  body.set('dueDate', String(payload.dueDate || '').trim());
  body.set('priority', String(payload.priority || '').trim());
  body.set('reminderAt', String(payload.reminderAt || '').trim());
  body.set('taskStatus', String(payload.taskStatus || '').trim() || 'open');
  body.set('securityToken', payload.securityToken || '');

  const requestURL = buildModernMutationURL(submitURL, {
    m: 'home',
    a: 'updatePersonalTodo',
    modernPage: MODERN_HOME_MYNOTES_PAGE
  });

  const response = await fetch(requestURL, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body.toString()
  });

  return parseModernMutationResponse(response, 'Update to-do');
}

export async function setDashboardPipelineStatus(
  bootstrap: UIModeBootstrap,
  payload: {
    url?: string;
    securityToken: string;
    candidateID: number;
    jobOrderID: number;
    statusID: number;
    enforceOwner: boolean;
    statusComment?: string;
    requireStatusComment?: boolean;
    rejectionReasonIDs?: number[];
    rejectionReasonOther?: string;
  }
): Promise<DashboardSetPipelineStatusResponse> {
  const url =
    typeof payload.url === 'string' && payload.url.trim() !== ''
      ? payload.url
      : `${bootstrap.indexName}?m=dashboard&a=setPipelineStatus`;

  const body = new URLSearchParams();
  body.set('securityToken', payload.securityToken || '');
  body.set('candidateID', String(payload.candidateID || 0));
  body.set('jobOrderID', String(payload.jobOrderID || 0));
  body.set('statusID', String(payload.statusID || 0));
  body.set('enforceOwner', payload.enforceOwner ? '1' : '0');
  if (payload.requireStatusComment === true) {
    body.set('requireStatusComment', '1');
  }
  if (typeof payload.statusComment === 'string' && payload.statusComment.trim() !== '') {
    body.set('statusComment', payload.statusComment.trim());
  }
  if (Array.isArray(payload.rejectionReasonIDs)) {
    payload.rejectionReasonIDs
      .map((value) => Number(value))
      .filter((value) => Number.isFinite(value) && value > 0)
      .forEach((value) => {
        body.append('rejectionReasonIDs[]', String(value));
      });
  }
  if (typeof payload.rejectionReasonOther === 'string' && payload.rejectionReasonOther.trim() !== '') {
    body.set('rejectionReasonOther', payload.rejectionReasonOther.trim());
  }

  const response = await fetch(url, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body.toString()
  });

  let result: DashboardSetPipelineStatusResponse | null = null;
  try {
    result = (await response.json()) as DashboardSetPipelineStatusResponse;
  } catch (_error) {
    result = null;
  }

  if (!result) {
    throw new Error(`Pipeline status update failed (${response.status}).`);
  }

  return result;
}

export async function removePipelineEntryViaLegacyURL(
  removeURL: string,
  securityToken: string,
  commentText: string
): Promise<PipelineRemoveModernResponse> {
  const parsedURL = new URL(String(removeURL || '').replace(/&amp;/g, '&'), window.location.href);
  parsedURL.searchParams.set('format', 'modern-json');
  parsedURL.searchParams.delete('display');

  const candidateID = parsedURL.searchParams.get('candidateID') || '';
  const jobOrderID = parsedURL.searchParams.get('jobOrderID') || '';

  const body = new URLSearchParams();
  body.set('candidateID', candidateID);
  body.set('jobOrderID', jobOrderID);
  body.set('comment', commentText || '');
  body.set('securityToken', securityToken || '');

  const response = await fetch(parsedURL.toString(), {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body.toString()
  });

  let payload: PipelineRemoveModernResponse | null = null;
  try {
    payload = (await response.json()) as PipelineRemoveModernResponse;
  } catch (_error) {
    payload = null;
  }

  if (!payload) {
    throw new Error(`Remove from pipeline failed (${response.status}).`);
  }

  return payload;
}

export async function fetchPipelineStatusDetailsModernData(
  bootstrap: UIModeBootstrap,
  pipelineID: number
): Promise<PipelineStatusDetailsModernDataResponse> {
  const query = new URLSearchParams();
  query.set('m', 'joborders');
  query.set('a', 'pipelineStatusDetails');
  query.set('pipelineID', String(pipelineID || 0));
  query.set('format', 'modern-json');
  query.set('modernPage', 'pipeline.status.details');

  const url = `${bootstrap.indexName}?${query.toString()}`;
  const data = await getJSON<PipelineStatusDetailsModernDataResponse>(url);
  assertModernContract(data.meta, 'pipeline.statusDetails.v1', 'pipeline details');

  return data;
}

export async function updatePipelineStatusHistoryDate(
  editURL: string,
  payload: {
    pipelineID: number;
    historyID: number;
    newDate: string;
    originalDate: string;
    editNote: string;
  }
): Promise<PipelineStatusHistoryUpdateResponse> {
  const body = new URLSearchParams();
  body.set('postback', 'postback');
  body.set('format', 'modern-json');
  body.set('pipelineID', String(payload.pipelineID || 0));
  body.set('historyID', String(payload.historyID || 0));
  body.set(`newDate[${payload.historyID}]`, payload.newDate || '');
  body.set(`originalDate[${payload.historyID}]`, payload.originalDate || '');
  body.set(`editNote[${payload.historyID}]`, payload.editNote || '');

  const response = await fetch(editURL, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body.toString()
  });

  let result: PipelineStatusHistoryUpdateResponse | null = null;
  try {
    result = (await response.json()) as PipelineStatusHistoryUpdateResponse;
  } catch (_error) {
    result = null;
  }

  if (!result) {
    throw new Error(`Pipeline history update failed (${response.status}).`);
  }

  return result;
}

export async function addJobOrderProfileComment(
  submitURL: string,
  payload: {
    jobOrderID: number;
    securityToken: string;
    commentCategory: string;
    commentText: string;
  }
): Promise<ModernMutationResponse> {
  const body = new URLSearchParams();
  body.set('format', 'modern-json');
  body.set('jobOrderID', String(payload.jobOrderID || 0));
  body.set('securityToken', payload.securityToken || '');
  body.set('commentCategory', payload.commentCategory || 'General');
  body.set('commentText', payload.commentText || '');

  const response = await fetch(submitURL, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body.toString()
  });

  let result: ModernMutationResponse | null = null;
  try {
    result = (await response.json()) as ModernMutationResponse;
  } catch (_error) {
    result = null;
  }

  if (!result) {
    throw new Error(`Comment submit failed (${response.status}).`);
  }

  return result;
}

export async function postJobOrderMessage(
  submitURL: string,
  payload: {
    jobOrderID: number;
    securityToken: string;
    messageBody: string;
  }
): Promise<ModernMutationResponse> {
  const body = new URLSearchParams();
  body.set('format', 'modern-json');
  body.set('jobOrderID', String(payload.jobOrderID || 0));
  body.set('securityToken', payload.securityToken || '');
  body.set('messageBody', payload.messageBody || '');

  const response = await fetch(submitURL, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body.toString()
  });

  let result: ModernMutationResponse | null = null;
  try {
    result = (await response.json()) as ModernMutationResponse;
  } catch (_error) {
    result = null;
  }

  if (!result) {
    throw new Error(`Message post failed (${response.status}).`);
  }

  return result;
}

export async function deleteJobOrderMessageThread(
  submitURL: string,
  payload: {
    jobOrderID: number;
    threadID: number;
    securityToken: string;
  }
): Promise<ModernMutationResponse> {
  const body = new URLSearchParams();
  body.set('format', 'modern-json');
  body.set('jobOrderID', String(payload.jobOrderID || 0));
  body.set('threadID', String(payload.threadID || 0));
  body.set('securityToken', payload.securityToken || '');

  const response = await fetch(submitURL, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body.toString()
  });

  let result: ModernMutationResponse | null = null;
  try {
    result = (await response.json()) as ModernMutationResponse;
  } catch (_error) {
    result = null;
  }

  if (!result) {
    throw new Error(`Message thread delete failed (${response.status}).`);
  }

  return result;
}

export async function addCandidateProfileComment(
  submitURL: string,
  payload: {
    candidateID: number;
    securityToken: string;
    commentCategory: string;
    commentText: string;
  }
): Promise<ModernMutationResponse> {
  const body = new URLSearchParams();
  body.set('format', 'modern-json');
  body.set('candidateID', String(payload.candidateID || 0));
  body.set('securityToken', payload.securityToken || '');
  body.set('commentCategory', payload.commentCategory || 'General');
  body.set('commentText', payload.commentText || '');

  const response = await fetch(submitURL, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body.toString()
  });

  let result: ModernMutationResponse | null = null;
  try {
    result = (await response.json()) as ModernMutationResponse;
  } catch (_error) {
    result = null;
  }

  if (!result) {
    throw new Error(`Candidate comment submit failed (${response.status}).`);
  }

  return result;
}

export async function postCandidateMessage(
  submitURL: string,
  payload: {
    candidateID: number;
    securityToken: string;
    messageBody: string;
  }
): Promise<ModernMutationResponse> {
  const body = new URLSearchParams();
  body.set('format', 'modern-json');
  body.set('candidateID', String(payload.candidateID || 0));
  body.set('securityToken', payload.securityToken || '');
  body.set('messageBody', payload.messageBody || '');

  const response = await fetch(submitURL, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body.toString()
  });

  let result: ModernMutationResponse | null = null;
  try {
    result = (await response.json()) as ModernMutationResponse;
  } catch (_error) {
    result = null;
  }

  if (!result) {
    throw new Error(`Candidate message post failed (${response.status}).`);
  }

  return result;
}

export async function deleteCandidateMessageThread(
  submitURL: string,
  payload: {
    candidateID: number;
    threadID: number;
    securityToken: string;
  }
): Promise<ModernMutationResponse> {
  const body = new URLSearchParams();
  body.set('format', 'modern-json');
  body.set('candidateID', String(payload.candidateID || 0));
  body.set('threadID', String(payload.threadID || 0));
  body.set('securityToken', payload.securityToken || '');

  const response = await fetch(submitURL, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body.toString()
  });

  let result: ModernMutationResponse | null = null;
  try {
    result = (await response.json()) as ModernMutationResponse;
  } catch (_error) {
    result = null;
  }

  if (!result) {
    throw new Error(`Candidate thread delete failed (${response.status}).`);
  }

  return result;
}

export async function deleteCandidateAttachment(
  submitURL: string,
  payload: {
    candidateID: number;
    attachmentID: number;
    securityToken: string;
  }
): Promise<ModernMutationResponse> {
  const body = new URLSearchParams();
  body.set('format', 'modern-json');
  body.set('candidateID', String(payload.candidateID || 0));
  body.set('attachmentID', String(payload.attachmentID || 0));
  body.set('securityToken', payload.securityToken || '');

  const response = await fetch(submitURL, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body.toString()
  });

  let result: ModernMutationResponse | null = null;
  try {
    result = (await response.json()) as ModernMutationResponse;
  } catch (_error) {
    result = null;
  }

  if (!result) {
    throw new Error(`Candidate attachment delete failed (${response.status}).`);
  }

  return result;
}

export async function uploadCandidateAttachmentToGoogleDrive(
  submitURL: string,
  payload: {
    candidateID: number;
    attachmentID: number;
    securityToken: string;
    origin: string;
  }
): Promise<CandidateGoogleDriveUploadMutationResponse> {
  const body = new URLSearchParams();
  body.set('format', 'modern-json');
  body.set('candidateID', String(payload.candidateID || 0));
  body.set('attachmentID', String(payload.attachmentID || 0));
  body.set('securityToken', payload.securityToken || '');
  body.set('origin', payload.origin || '');

  const requestURL = buildModernMutationURL(submitURL, {
    m: 'candidates',
    a: 'googleDriveUploadAttachment'
  });

  const response = await fetch(requestURL, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body.toString()
  });

  return (await parseModernMutationResponse(response, 'Google Drive upload')) as CandidateGoogleDriveUploadMutationResponse;
}

export async function deleteCandidateGoogleDriveAttachmentFile(
  submitURL: string,
  payload: {
    candidateID: number;
    attachmentID: number;
    securityToken: string;
    origin: string;
  }
): Promise<CandidateGoogleDriveDeleteMutationResponse> {
  const body = new URLSearchParams();
  body.set('format', 'modern-json');
  body.set('candidateID', String(payload.candidateID || 0));
  body.set('attachmentID', String(payload.attachmentID || 0));
  body.set('securityToken', payload.securityToken || '');
  body.set('origin', payload.origin || '');

  const requestURL = buildModernMutationURL(submitURL, {
    m: 'candidates',
    a: 'googleDriveDeleteAttachmentFile'
  });

  const response = await fetch(requestURL, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body.toString()
  });

  return (await parseModernMutationResponse(
    response,
    'Google Drive delete'
  )) as CandidateGoogleDriveDeleteMutationResponse;
}

export async function deleteJobOrderAttachment(
  submitURL: string,
  payload: {
    jobOrderID: number;
    attachmentID: number;
    securityToken: string;
  }
): Promise<ModernMutationResponse> {
  const body = new URLSearchParams();
  body.set('format', 'modern-json');
  body.set('jobOrderID', String(payload.jobOrderID || 0));
  body.set('attachmentID', String(payload.attachmentID || 0));
  body.set('securityToken', payload.securityToken || '');

  const response = await fetch(submitURL, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body.toString()
  });

  let result: ModernMutationResponse | null = null;
  try {
    result = (await response.json()) as ModernMutationResponse;
  } catch (_error) {
    result = null;
  }

  if (!result) {
    throw new Error(`Job order attachment delete failed (${response.status}).`);
  }

  return result;
}

export async function updateCandidateTags(
  submitURL: string,
  payload: {
    candidateID: number;
    tagIDs: number[];
    securityToken: string;
  }
): Promise<ModernMutationResponse> {
  const body = new URLSearchParams();
  body.set('format', 'modern-json');
  body.set('candidateID', String(payload.candidateID || 0));
  body.set('securityToken', payload.securityToken || '');
  for (const tagID of payload.tagIDs || []) {
    body.append('candidate_tags[]', String(tagID || 0));
  }

  const response = await fetch(submitURL, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body.toString()
  });

  let result: ModernMutationResponse | null = null;
  try {
    result = (await response.json()) as ModernMutationResponse;
  } catch (_error) {
    result = null;
  }

  if (!result) {
    throw new Error(`Candidate tag update failed (${response.status}).`);
  }

  return result;
}

export async function setJobOrderAdministrativeVisibility(
  actionBaseURL: string,
  payload: {
    jobOrderID: number;
    state: boolean;
  }
): Promise<ModernMutationResponse> {
  const url = new URL(actionBaseURL, window.location.href);
  url.searchParams.set('jobOrderID', String(payload.jobOrderID || 0));
  url.searchParams.set('state', payload.state ? '1' : '0');
  url.searchParams.set('format', 'modern-json');

  const response = await fetch(url.toString(), {
    method: 'GET',
    credentials: 'same-origin'
  });

  let result: ModernMutationResponse | null = null;
  try {
    result = (await response.json()) as ModernMutationResponse;
  } catch (_error) {
    result = null;
  }

  if (!result) {
    throw new Error(`Administrative visibility update failed (${response.status}).`);
  }

  return result;
}

export async function setJobOrderMonitored(
  actionBaseURL: string,
  payload: {
    state: boolean;
  }
): Promise<ModernMutationResponse> {
  const url = new URL(actionBaseURL, window.location.href);
  url.searchParams.set('value', payload.state ? '1' : '0');
  url.searchParams.set('format', 'modern-json');

  const response = await fetch(url.toString(), {
    method: 'GET',
    credentials: 'same-origin'
  });

  let result: ModernMutationResponse | null = null;
  try {
    result = (await response.json()) as ModernMutationResponse;
  } catch (_error) {
    result = null;
  }

  if (!result) {
    throw new Error(`Job order monitor update failed (${response.status}).`);
  }

  return result;
}

export async function updateJobOrderQuickAction(
  submitURL: string,
  payload: {
    jobOrderID: number;
    status?: string;
    priority?: 'low' | 'standard' | 'high' | 'hot';
    ownerUserID?: number;
    recruiterUserID?: number;
  }
): Promise<ModernMutationResponse> {
  const body = new URLSearchParams();
  body.set('format', 'modern-json');
  body.set('modernPage', MODERN_JOBORDERS_PAGE);
  body.set('jobOrderID', String(Number(payload.jobOrderID || 0)));

  if (typeof payload.status === 'string') {
    body.set('status', payload.status);
  }
  if (typeof payload.priority === 'string') {
    body.set('priority', payload.priority);
  }
  if (typeof payload.ownerUserID === 'number') {
    body.set('ownerUserID', String(Math.max(0, Math.trunc(payload.ownerUserID))));
  }
  if (typeof payload.recruiterUserID === 'number') {
    body.set('recruiterUserID', String(Math.max(0, Math.trunc(payload.recruiterUserID))));
  }

  const requestURL = buildModernMutationURL(submitURL, {
    m: 'joborders',
    a: 'quickUpdate',
    jobOrderID: Number(payload.jobOrderID || 0),
    modernPage: MODERN_JOBORDERS_PAGE
  });

  const response = await fetch(requestURL, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body.toString()
  });

  return parseModernMutationResponse(response, 'Job order quick update');
}

export async function uploadCandidateAttachment(
  submitURL: string,
  payload: {
    candidateID: number;
    file: File;
    isResume: boolean;
  }
): Promise<ModernMutationResponse> {
  const form = new FormData();
  form.set('postback', 'postback');
  form.set('format', 'modern-json');
  form.set('candidateID', String(payload.candidateID || 0));
  form.set('resume', payload.isResume ? '1' : '0');
  form.set('file', payload.file);

  const requestURL = buildModernMutationURL(submitURL, {
    m: 'candidates',
    a: 'createAttachment',
    candidateID: payload.candidateID || 0
  });
  const response = await fetch(requestURL, {
    method: 'POST',
    credentials: 'same-origin',
    body: form
  });

  return parseModernMutationResponse(response, 'Candidate attachment upload');
}

export async function uploadJobOrderAttachment(
  submitURL: string,
  payload: {
    jobOrderID: number;
    file: File;
  }
): Promise<ModernMutationResponse> {
  const form = new FormData();
  form.set('postback', 'postback');
  form.set('format', 'modern-json');
  form.set('jobOrderID', String(payload.jobOrderID || 0));
  form.set('file', payload.file);

  const requestURL = buildModernMutationURL(submitURL, {
    m: 'joborders',
    a: 'createAttachment',
    jobOrderID: payload.jobOrderID || 0
  });
  const response = await fetch(requestURL, {
    method: 'POST',
    credentials: 'same-origin',
    body: form
  });

  return parseModernMutationResponse(response, 'Job order attachment upload');
}

export async function uploadCompanyAttachment(
  submitURL: string,
  payload: {
    companyID: number;
    file: File;
  }
): Promise<ModernMutationResponse> {
  const form = new FormData();
  form.set('postback', 'postback');
  form.set('format', 'modern-json');
  form.set('companyID', String(payload.companyID || 0));
  form.set('file', payload.file);

  const requestURL = buildModernMutationURL(submitURL, {
    m: 'companies',
    a: 'createAttachment',
    companyID: payload.companyID || 0
  });
  const response = await fetch(requestURL, {
    method: 'POST',
    credentials: 'same-origin',
    body: form
  });

  return parseModernMutationResponse(response, 'Company attachment upload');
}

export async function deleteCompanyAttachment(
  submitURL: string,
  payload: {
    companyID: number;
    attachmentID: number;
    securityToken: string;
  }
): Promise<ModernMutationResponse> {
  const body = new URLSearchParams();
  body.set('format', 'modern-json');
  body.set('companyID', String(payload.companyID || 0));
  body.set('attachmentID', String(payload.attachmentID || 0));
  body.set('securityToken', payload.securityToken || '');

  const response = await fetch(submitURL, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body.toString()
  });

  let result: ModernMutationResponse | null = null;
  try {
    result = (await response.json()) as ModernMutationResponse;
  } catch (_error) {
    result = null;
  }

  if (!result) {
    throw new Error(`Company attachment delete failed (${response.status}).`);
  }

  return result;
}

export async function fetchCandidatesListModernData(
  bootstrap: UIModeBootstrap,
  query: URLSearchParams
): Promise<CandidatesListModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'candidates',
    action: 'listByView',
    modernPage: MODERN_CANDIDATES_PAGE,
    query
  });

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<CandidatesListModernDataResponse>(url);
  assertModernContract(data.meta, 'candidates.listByView.v1', 'candidates data');

  return data;
}

export async function fetchCandidateResumeModernData(
  bootstrap: UIModeBootstrap,
  query: URLSearchParams
): Promise<CandidateResumeModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'candidates',
    action: 'viewResume',
    modernPage: MODERN_CANDIDATE_RESUME_PAGE,
    query
  });

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<CandidateResumeModernDataResponse>(url);
  assertModernContract(data.meta, 'candidates.viewResume.v1', 'candidate resume preview');

  return data;
}

export async function fetchCompaniesListModernData(
  bootstrap: UIModeBootstrap,
  query: URLSearchParams
): Promise<CompaniesListModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'companies',
    action: 'listByView',
    modernPage: MODERN_COMPANIES_PAGE,
    query
  });

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<CompaniesListModernDataResponse>(url);
  assertModernContract(data.meta, 'companies.listByView.v1', 'companies');

  return data;
}

export async function fetchCompaniesShowModernData(
  bootstrap: UIModeBootstrap,
  query: URLSearchParams
): Promise<CompaniesShowModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'companies',
    action: 'show',
    modernPage: MODERN_COMPANY_SHOW_PAGE,
    query
  });

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<CompaniesShowModernDataResponse>(url);
  assertModernContract(data.meta, 'companies.show.v1', 'company profile');

  return data;
}

export async function fetchCompaniesAddModernData(
  bootstrap: UIModeBootstrap,
  query: URLSearchParams
): Promise<CompaniesAddModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'companies',
    action: 'add',
    modernPage: MODERN_COMPANY_ADD_PAGE,
    query
  });

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<CompaniesAddModernDataResponse>(url);
  assertModernContract(data.meta, 'companies.add.v1', 'company add form');

  return data;
}

export async function fetchCompaniesEditModernData(
  bootstrap: UIModeBootstrap,
  query: URLSearchParams
): Promise<CompaniesEditModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'companies',
    action: 'edit',
    modernPage: MODERN_COMPANY_EDIT_PAGE,
    query
  });

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<CompaniesEditModernDataResponse>(url);
  assertModernContract(data.meta, 'companies.edit.v1', 'company edit form');

  return data;
}

export async function fetchContactsListModernData(
  bootstrap: UIModeBootstrap,
  query: URLSearchParams
): Promise<ContactsListModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'contacts',
    action: 'listByView',
    modernPage: MODERN_CONTACTS_PAGE,
    query
  });

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<ContactsListModernDataResponse>(url);
  assertModernContract(data.meta, 'contacts.listByView.v1', 'contacts');

  return data;
}

export async function fetchContactsColdCallListModernData(
  bootstrap: UIModeBootstrap,
  query: URLSearchParams
): Promise<ContactsColdCallListModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'contacts',
    action: 'showColdCallList',
    modernPage: MODERN_CONTACT_COLD_CALL_LIST_PAGE,
    query
  });

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<ContactsColdCallListModernDataResponse>(url);
  assertModernContract(data.meta, 'contacts.coldCallList.v1', 'contacts cold call list');

  return data;
}

export async function fetchContactsShowModernData(
  bootstrap: UIModeBootstrap,
  query: URLSearchParams
): Promise<ContactsShowModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'contacts',
    action: 'show',
    modernPage: MODERN_CONTACT_SHOW_PAGE,
    query
  });

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<ContactsShowModernDataResponse>(url);
  assertModernContract(data.meta, 'contacts.show.v1', 'contact profile');

  return data;
}

export async function fetchContactsAddModernData(
  bootstrap: UIModeBootstrap,
  query: URLSearchParams
): Promise<ContactsAddModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'contacts',
    action: 'add',
    modernPage: MODERN_CONTACT_ADD_PAGE,
    query
  });

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<ContactsAddModernDataResponse>(url);
  assertModernContract(data.meta, 'contacts.add.v1', 'contact add form');

  return data;
}

export async function fetchContactsEditModernData(
  bootstrap: UIModeBootstrap,
  query: URLSearchParams
): Promise<ContactsEditModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'contacts',
    action: 'edit',
    modernPage: MODERN_CONTACT_EDIT_PAGE,
    query
  });

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<ContactsEditModernDataResponse>(url);
  assertModernContract(data.meta, 'contacts.edit.v1', 'contact edit form');

  return data;
}

export async function fetchActivityListModernData(
  bootstrap: UIModeBootstrap,
  query: URLSearchParams
): Promise<ActivityListModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'activity',
    action: 'listByViewDataGrid',
    modernPage: MODERN_ACTIVITY_PAGE,
    query
  });

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<ActivityListModernDataResponse>(url);
  assertModernContract(data.meta, 'activity.listByView.v1', 'activities');

  return data;
}

export async function fetchGdprRequestsModernData(
  bootstrap: UIModeBootstrap,
  query: URLSearchParams
): Promise<GdprRequestsModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'gdpr',
    action: 'requests',
    modernPage: MODERN_GDPR_REQUESTS_PAGE,
    query
  });

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<GdprRequestsModernDataResponse>(url);
  assertModernContract(data.meta, 'gdpr.requests.v1', 'GDPR requests');
  if (!data.actions || String(data.actions.submitURL || '').trim() === '' || String(data.actions.legacyURL || '').trim() === '') {
    throw new Error('Invalid GDPR requests contract: missing actions.submitURL or actions.legacyURL.');
  }

  return data;
}

export async function fetchCalendarModernData(
  bootstrap: UIModeBootstrap,
  query: URLSearchParams
): Promise<CalendarModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'calendar',
    action: 'showCalendar',
    modernPage: MODERN_CALENDAR_PAGE,
    query
  });

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<CalendarModernDataResponse>(url);
  assertModernContract(data.meta, 'calendar.show.v1', 'calendar');

  return data;
}

type CalendarEventMutationPayload = {
  eventID?: number;
  eventTypeID: number;
  title: string;
  description: string;
  allDay: boolean;
  dateISO: string;
  timeHHMM: string;
  duration: number;
  isPublic: boolean;
  dataItemID?: number;
  dataItemType?: number;
  jobOrderID?: number;
};

function buildCalendarEventMutationBody(
  securityToken: string,
  payload: CalendarEventMutationPayload
): URLSearchParams {
  const body = new URLSearchParams();
  body.set('format', 'modern-json');
  body.set('securityToken', securityToken || '');
  body.set('eventTypeID', String(payload.eventTypeID || 0));
  body.set('title', payload.title || '');
  body.set('description', payload.description || '');
  body.set('allDay', payload.allDay ? '1' : '0');
  body.set('dateISO', payload.dateISO || '');
  body.set('timeHHMM', payload.timeHHMM || '');
  body.set('duration', String(payload.duration || 30));
  body.set('isPublic', payload.isPublic ? '1' : '0');

  if (typeof payload.eventID === 'number' && payload.eventID > 0) {
    body.set('eventID', String(payload.eventID));
  }
  if (typeof payload.dataItemID === 'number') {
    body.set('dataItemID', String(payload.dataItemID));
  }
  if (typeof payload.dataItemType === 'number') {
    body.set('dataItemType', String(payload.dataItemType));
  }
  if (typeof payload.jobOrderID === 'number') {
    body.set('jobOrderID', String(payload.jobOrderID));
  }

  return body;
}

export async function createCalendarEvent(
  submitURL: string,
  securityToken: string,
  payload: CalendarEventMutationPayload
): Promise<CalendarEventMutationResponse> {
  const body = buildCalendarEventMutationBody(securityToken, payload);

  const response = await fetch(submitURL, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body.toString()
  });

  let result: CalendarEventMutationResponse | null = null;
  try {
    result = (await response.json()) as CalendarEventMutationResponse;
  } catch (_error) {
    result = null;
  }

  if (!result) {
    throw new Error(`Calendar event create failed (${response.status}).`);
  }

  return result;
}

export async function updateCalendarEvent(
  submitURL: string,
  securityToken: string,
  payload: CalendarEventMutationPayload
): Promise<CalendarEventMutationResponse> {
  const body = buildCalendarEventMutationBody(securityToken, payload);

  const response = await fetch(submitURL, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body.toString()
  });

  let result: CalendarEventMutationResponse | null = null;
  try {
    result = (await response.json()) as CalendarEventMutationResponse;
  } catch (_error) {
    result = null;
  }

  if (!result) {
    throw new Error(`Calendar event update failed (${response.status}).`);
  }

  return result;
}

export async function deleteCalendarEvent(
  submitURL: string,
  securityToken: string,
  eventID: number
): Promise<CalendarEventMutationResponse> {
  const body = new URLSearchParams();
  body.set('format', 'modern-json');
  body.set('securityToken', securityToken || '');
  body.set('eventID', String(eventID || 0));

  const response = await fetch(submitURL, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body.toString()
  });

  let result: CalendarEventMutationResponse | null = null;
  try {
    result = (await response.json()) as CalendarEventMutationResponse;
  } catch (_error) {
    result = null;
  }

  if (!result) {
    throw new Error(`Calendar event delete failed (${response.status}).`);
  }

  return result;
}

export async function fetchListsManageModernData(
  bootstrap: UIModeBootstrap,
  query: URLSearchParams
): Promise<ListsManageModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'lists',
    action: 'listByView',
    modernPage: MODERN_LISTS_PAGE,
    query
  });

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<ListsManageModernDataResponse>(url);
  assertModernContract(data.meta, 'lists.listByView.v1', 'lists');

  return data;
}

export async function fetchListsDetailModernData(
  bootstrap: UIModeBootstrap,
  query: URLSearchParams
): Promise<ListsDetailModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'lists',
    action: 'showList',
    modernPage: MODERN_LISTS_DETAIL_PAGE,
    query
  });

  const actionName = String(query.get('a') || '').toLowerCase();
  if (actionName === 'show') {
    apiQuery.set('a', 'show');
  }

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<ListsDetailModernDataResponse>(url);
  assertModernContract(data.meta, 'lists.detail.v1', 'list details');

  return data;
}

export async function fetchReportsLauncherModernData(
  bootstrap: UIModeBootstrap,
  query: URLSearchParams
): Promise<ReportsLauncherModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'reports',
    action: 'reports',
    modernPage: MODERN_REPORTS_PAGE,
    query
  });

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<ReportsLauncherModernDataResponse>(url);
  assertModernContract(data.meta, 'reports.launcher.v1', 'reports');

  return data;
}

export async function fetchReportsCustomerDashboardModernData(
  bootstrap: UIModeBootstrap,
  query: URLSearchParams
): Promise<ReportsCustomerDashboardModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'reports',
    action: 'customerDashboard',
    modernPage: MODERN_REPORTS_CUSTOMER_DASHBOARD_PAGE,
    query
  });

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<ReportsCustomerDashboardModernDataResponse>(url);
  assertModernContract(data.meta, 'reports.customerDashboard.v1', 'reports customer dashboard');

  return data;
}

export async function fetchReportsGraphViewModernData(
  bootstrap: UIModeBootstrap,
  query: URLSearchParams
): Promise<ReportsGraphViewModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'reports',
    action: 'graphView',
    modernPage: MODERN_REPORTS_GRAPH_VIEW_PAGE,
    query
  });

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<ReportsGraphViewModernDataResponse>(url);
  assertModernContract(data.meta, 'reports.graphView.v1', 'reports graph view');

  return data;
}

export async function fetchSourcingListModernData(
  bootstrap: UIModeBootstrap,
  query: URLSearchParams
): Promise<SourcingListModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'sourcing',
    action: '',
    modernPage: MODERN_SOURCING_PAGE,
    query
  });
  apiQuery.delete('a');

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<SourcingListModernDataResponse>(url);
  assertModernContract(data.meta, 'sourcing.list.v1', 'sourcing workspace');

  return data;
}

export async function saveSourcingListModernData(
  saveURL: string,
  rows: Array<{ weekYear: number; weekNumber: number; count: number }>
): Promise<SourcingSaveMutationResponse> {
  const body = new URLSearchParams();
  body.set('format', 'modern-json');
  body.set('modernPage', MODERN_SOURCING_PAGE);

  rows.forEach((row) => {
    body.append('weekYear[]', String(row.weekYear));
    body.append('weekNumber[]', String(row.weekNumber));
    body.append('sourcedCount[]', String(Math.max(0, Math.round(Number(row.count) || 0))));
  });

  const response = await fetch(saveURL, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body.toString()
  });

  let result: SourcingSaveMutationResponse | null = null;
  try {
    result = (await response.json()) as SourcingSaveMutationResponse;
  } catch (_error) {
    result = null;
  }

  if (!result) {
    throw new Error(`Sourcing save failed (${response.status}).`);
  }

  return result;
}

export async function fetchQueueOverviewModernData(
  bootstrap: UIModeBootstrap,
  query: URLSearchParams
): Promise<QueueOverviewModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'queue',
    action: '',
    modernPage: MODERN_QUEUE_PAGE,
    query
  });
  apiQuery.delete('a');

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<QueueOverviewModernDataResponse>(url);
  assertModernContract(data.meta, 'queue.overview.v1', 'queue workspace');

  return data;
}

export async function fetchGraphsOverviewModernData(
  bootstrap: UIModeBootstrap,
  query: URLSearchParams
): Promise<GraphsOverviewModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'graphs',
    action: '',
    modernPage: MODERN_GRAPHS_PAGE,
    query
  });
  apiQuery.delete('a');

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<GraphsOverviewModernDataResponse>(url);
  assertModernContract(data.meta, 'graphs.overview.v1', 'graphs workspace');

  return data;
}

export async function fetchCandidatesShowModernData(
  bootstrap: UIModeBootstrap,
  query: URLSearchParams
): Promise<CandidatesShowModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'candidates',
    action: 'show',
    modernPage: MODERN_CANDIDATE_SHOW_PAGE,
    query
  });

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<CandidatesShowModernDataResponse>(url);
  assertModernContract(data.meta, 'candidates.show.v1', 'candidate profile');

  return data;
}

export async function fetchCandidatesEditModernData(
  bootstrap: UIModeBootstrap,
  query: URLSearchParams
): Promise<CandidatesEditModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'candidates',
    action: 'edit',
    modernPage: MODERN_CANDIDATE_EDIT_PAGE,
    query
  });

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<CandidatesEditModernDataResponse>(url);
  assertModernContract(data.meta, 'candidates.edit.v1', 'candidate edit form');

  return data;
}

export async function fetchCandidatesAddModernData(
  bootstrap: UIModeBootstrap,
  query: URLSearchParams
): Promise<CandidatesAddModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'candidates',
    action: 'add',
    modernPage: MODERN_CANDIDATE_ADD_PAGE,
    query
  });

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<CandidatesAddModernDataResponse>(url);
  assertModernContract(data.meta, 'candidates.add.v1', 'candidate add form');

  return data;
}

export async function submitCandidatesAddResumeAction(
  bootstrap: UIModeBootstrap,
  formData: FormData
): Promise<CandidatesAddModernDataResponse> {
  const query = new URLSearchParams();
  query.set('m', 'candidates');
  query.set('a', 'add');
  query.set('ui', 'modern');
  query.set('format', 'modern-json');
  query.set('modernPage', MODERN_CANDIDATE_ADD_PAGE);

  const response = await fetch(`${bootstrap.indexName}?${query.toString()}`, {
    method: 'POST',
    credentials: 'same-origin',
    body: formData
  });

  if (!response.ok) {
    throw new Error(`Resume import failed (${response.status}).`);
  }

  const data = (await response.json()) as CandidatesAddModernDataResponse;
  assertModernContract(data.meta, 'candidates.add.v1', 'candidate add form');
  return data;
}

type TalentFitFlowCandidateParseAJAXResponse = {
  jobID: string;
  status: string;
  candidate: Record<string, unknown> | null;
  warnings: unknown[];
  errorCode: string;
  errorMessage: string;
  providerErrorCode: string;
  providerErrorMessage: string;
  retryable: boolean | null;
};

function getXMLTagValue(doc: Document, tagName: string): string {
  const node = doc.getElementsByTagName(tagName).item(0);
  return node && node.textContent ? String(node.textContent) : '';
}

function parseTalentFitFlowCandidateParseXML(xmlText: string): TalentFitFlowCandidateParseAJAXResponse {
  const xml = new DOMParser().parseFromString(xmlText, 'application/xml');
  if (xml.getElementsByTagName('parsererror').length > 0) {
    throw new Error('Invalid XML response from AI parse endpoint.');
  }

  const errorCode = getXMLTagValue(xml, 'errorcode');
  const errorMessage = getXMLTagValue(xml, 'errormessage');
  const providerErrorCode = getXMLTagValue(xml, 'error_code');
  const providerErrorMessage = getXMLTagValue(xml, 'error_message');
  const retryableRaw = getXMLTagValue(xml, 'retryable').trim().toLowerCase();
  const retryable =
    retryableRaw === '1' || retryableRaw === 'true'
      ? true
      : retryableRaw === '0' || retryableRaw === 'false'
        ? false
        : null;
  const jobID = getXMLTagValue(xml, 'jobid');
  const status = getXMLTagValue(xml, 'status');
  const candidateRaw = getXMLTagValue(xml, 'candidate_json');
  const warningsRaw = getXMLTagValue(xml, 'warnings_json');

  let candidate: Record<string, unknown> | null = null;
  if (candidateRaw.trim() !== '') {
    try {
      candidate = JSON.parse(candidateRaw) as Record<string, unknown>;
    } catch (_error) {
      candidate = null;
    }
  }

  let warnings: unknown[] = [];
  if (warningsRaw.trim() !== '') {
    try {
      const parsed = JSON.parse(warningsRaw) as unknown;
      warnings = Array.isArray(parsed) ? parsed : [];
    } catch (_error) {
      warnings = [];
    }
  }

  return {
    jobID,
    status,
    candidate,
    warnings,
    errorCode,
    errorMessage,
    providerErrorCode,
    providerErrorMessage,
    retryable
  };
}

function buildDefaultTalentFitFlowConsent(actor: string): string {
  return JSON.stringify({
    consent_given: true,
    timestamp: new Date().toISOString(),
    actor
  });
}

export async function createTalentFitFlowCandidateParseJob(payload: {
  documentTempFile?: string;
  attachmentID?: number;
  candidateID?: number;
  requestedFields?: string;
  idempotencyKey?: string;
  actor?: string;
}): Promise<TalentFitFlowCandidateParseAJAXResponse> {
  const body = new URLSearchParams();
  body.set('f', 'talentFitFlowCandidateParse');
  body.set('action', 'create');

  const documentTempFile = String(payload.documentTempFile || '').trim();
  if (documentTempFile !== '') {
    body.set('documentTempFile', documentTempFile);
  }

  const attachmentID = Number(payload.attachmentID || 0);
  if (attachmentID > 0) {
    body.set('attachmentID', String(attachmentID));
  }

  const candidateID = Number(payload.candidateID || 0);
  if (candidateID > 0) {
    body.set('candidateID', String(candidateID));
  }

  const requestedFields =
    String(payload.requestedFields || '').trim() ||
    '["first_name","last_name","email","phone","location","country_name","skills","summary","experience_years","seniority_band","current_employer","employment_recent"]';
  body.set('requested_fields', requestedFields);
  body.set('consent', buildDefaultTalentFitFlowConsent(String(payload.actor || 'modern-ui')));

  const idempotencyKey = String(payload.idempotencyKey || '').trim();
  if (idempotencyKey !== '') {
    body.set('idempotency_key', idempotencyKey);
  }

  const response = await fetch('ajax.php', {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body.toString()
  });

  if (!response.ok) {
    throw new Error(`AI parse request failed (${response.status}).`);
  }

  const parsed = parseTalentFitFlowCandidateParseXML(await response.text());
  if (parsed.errorCode !== '0') {
    throw new Error(parsed.errorMessage || 'AI parse request failed.');
  }
  if (parsed.jobID.trim() === '') {
    throw new Error('AI parse request did not return a job ID.');
  }
  return parsed;
}

export async function fetchTalentFitFlowCandidateParseStatus(
  jobID: string
): Promise<TalentFitFlowCandidateParseAJAXResponse> {
  const body = new URLSearchParams();
  body.set('f', 'talentFitFlowCandidateParse');
  body.set('action', 'status');
  body.set('jobId', String(jobID || '').trim());

  const response = await fetch('ajax.php', {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body.toString()
  });

  if (!response.ok) {
    throw new Error(`AI parse status check failed (${response.status}).`);
  }

  const parsed = parseTalentFitFlowCandidateParseXML(await response.text());
  if (parsed.errorCode !== '0') {
    throw new Error(parsed.errorMessage || 'AI parse status check failed.');
  }
  return parsed;
}

export async function fetchCandidateDuplicateCheck(
  fields: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    city: string;
    country: string;
  }
): Promise<CandidateDuplicateCheckResponse> {
  const body = new URLSearchParams();
  body.set('f', 'candidates:checkDuplicates');
  body.set('firstName', fields.firstName || '');
  body.set('lastName', fields.lastName || '');
  body.set('email', fields.email || '');
  body.set('phone', fields.phone || '');
  body.set('city', fields.city || '');
  body.set('country', fields.country || '');
  body.set('rhash', String(Math.floor(Math.random() * 100000000)));

  const response = await fetch('ajax.php', {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body.toString()
  });

  if (!response.ok) {
    throw new Error(`Duplicate check failed (${response.status}).`);
  }

  const payload = (await response.json()) as CandidateDuplicateCheckResponse;
  if (!payload || Number(payload.success) !== 1) {
    throw new Error(payload?.message || 'Duplicate check failed.');
  }

  return {
    success: 1,
    hardMatches: Array.isArray(payload.hardMatches) ? payload.hardMatches : [],
    softMatches: Array.isArray(payload.softMatches) ? payload.softMatches : []
  };
}

export async function fetchJobOrdersListModernData(
  bootstrap: UIModeBootstrap,
  query: URLSearchParams
): Promise<JobOrdersListModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'joborders',
    action: 'listByView',
    modernPage: MODERN_JOBORDERS_PAGE,
    query
  });

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<JobOrdersListModernDataResponse>(url);
  assertModernContract(data.meta, 'joborders.listByView.v1', 'job orders data');

  return data;
}

export async function fetchJobOrderRejectionReasonBreakdownModernData(
  bootstrap: UIModeBootstrap,
  jobOrderID: number
): Promise<JobOrderRejectionReasonBreakdownModernDataResponse> {
  const query = new URLSearchParams();
  query.set('jobOrderID', String(Number(jobOrderID || 0)));

  const apiQuery = buildModernJSONRequestQuery({
    module: 'joborders',
    action: 'rejectionReasonBreakdown',
    modernPage: MODERN_JOBORDERS_PAGE,
    query
  });

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<JobOrderRejectionReasonBreakdownModernDataResponse>(url);
  assertModernContract(data.meta, 'joborders.rejectionReasonBreakdown.v1', 'job order rejection reason breakdown');

  return data;
}

export async function fetchJobOrdersRecruiterAllocationModernData(
  bootstrap: UIModeBootstrap,
  query: URLSearchParams
): Promise<JobOrdersRecruiterAllocationModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'joborders',
    action: 'recruiterAllocation',
    modernPage: MODERN_JOBORDER_RECRUITER_ALLOCATION_PAGE,
    query
  });

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<JobOrdersRecruiterAllocationModernDataResponse>(url);
  assertModernContract(data.meta, 'joborders.recruiterAllocation.v1', 'job orders recruiter allocation');

  return data;
}

export async function fetchJobOrdersPipelineMatrixModernData(
  bootstrap: UIModeBootstrap,
  query: URLSearchParams
): Promise<JobOrdersPipelineMatrixModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'joborders',
    action: 'pipelineMatrix',
    modernPage: MODERN_JOBORDER_PIPELINE_MATRIX_PAGE,
    query
  });

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<JobOrdersPipelineMatrixModernDataResponse>(url);
  assertModernContract(data.meta, 'joborders.pipelineMatrix.v1', 'job orders pipeline matrix');

  return data;
}

export async function saveJobOrdersPipelineMatrixView(
  submitURL: string,
  payload: {
    viewID?: number;
    viewName: string;
    viewConfig: JobOrdersPipelineMatrixViewConfig;
  }
): Promise<JobOrdersPipelineMatrixViewMutationResponse> {
  const body = new URLSearchParams();
  body.set('format', 'modern-json');
  body.set('modernPage', MODERN_JOBORDER_PIPELINE_MATRIX_PAGE);
  body.set('viewName', String(payload.viewName || '').trim());
  body.set('viewConfig', JSON.stringify(payload.viewConfig || {}));
  if (Number(payload.viewID || 0) > 0) {
    body.set('viewID', String(Number(payload.viewID || 0)));
  }

  const requestURL = buildModernMutationURL(submitURL, {
    m: 'joborders',
    a: 'pipelineMatrixSaveView',
    modernPage: MODERN_JOBORDER_PIPELINE_MATRIX_PAGE
  });

  const response = await fetch(requestURL, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body.toString()
  });

  return (await parseModernMutationResponse(response, 'Save pipeline matrix view')) as JobOrdersPipelineMatrixViewMutationResponse;
}

export async function deleteJobOrdersPipelineMatrixView(
  submitURL: string,
  viewID: number
): Promise<JobOrdersPipelineMatrixViewMutationResponse> {
  const body = new URLSearchParams();
  body.set('format', 'modern-json');
  body.set('modernPage', MODERN_JOBORDER_PIPELINE_MATRIX_PAGE);
  body.set('viewID', String(Number(viewID || 0)));

  const requestURL = buildModernMutationURL(submitURL, {
    m: 'joborders',
    a: 'pipelineMatrixDeleteView',
    modernPage: MODERN_JOBORDER_PIPELINE_MATRIX_PAGE
  });

  const response = await fetch(requestURL, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body.toString()
  });

  return (await parseModernMutationResponse(response, 'Delete pipeline matrix view')) as JobOrdersPipelineMatrixViewMutationResponse;
}

export async function saveJobOrderRecruiterAllocation(
  submitURL: string,
  payload: {
    scope: string;
    ownerUserID: number;
    recruiterUserID: number;
    search: string;
    page: number;
    assignments: Record<number, number>;
    currentAssignments: Record<number, number>;
  }
): Promise<JobOrdersRecruiterAllocationMutationResponse> {
  const body = new URLSearchParams();
  body.set('postback', '1');
  body.set('format', 'modern-json');
  body.set('modernPage', MODERN_JOBORDER_RECRUITER_ALLOCATION_PAGE);
  body.set('scope', payload.scope || 'all');
  body.set('ownerUserID', String(payload.ownerUserID || 0));
  body.set('recruiterUserID', String(payload.recruiterUserID));
  body.set('search', payload.search || '');
  body.set('page', String(payload.page || 1));

  Object.entries(payload.assignments || {}).forEach(([jobOrderIDRaw, recruiterUserID]) => {
    const jobOrderID = Number(jobOrderIDRaw);
    if (!Number.isFinite(jobOrderID) || jobOrderID <= 0) {
      return;
    }
    body.set(`recruiterAssignment[${jobOrderID}]`, String(recruiterUserID || 0));
  });

  Object.entries(payload.currentAssignments || {}).forEach(([jobOrderIDRaw, recruiterUserID]) => {
    const jobOrderID = Number(jobOrderIDRaw);
    if (!Number.isFinite(jobOrderID) || jobOrderID <= 0) {
      return;
    }
    body.set(`currentRecruiterAssignment[${jobOrderID}]`, String(recruiterUserID || 0));
  });

  const response = await fetch(submitURL, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body.toString()
  });

  let result: JobOrdersRecruiterAllocationMutationResponse | null = null;
  try {
    result = (await response.json()) as JobOrdersRecruiterAllocationMutationResponse;
  } catch (_error) {
    result = null;
  }

  if (!result) {
    throw new Error(`Recruiter allocation update failed (${response.status}).`);
  }

  return result;
}

export async function fetchJobOrdersShowModernData(
  bootstrap: UIModeBootstrap,
  query: URLSearchParams
): Promise<JobOrdersShowModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'joborders',
    action: 'show',
    modernPage: MODERN_JOBORDER_SHOW_PAGE,
    query
  });

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<JobOrdersShowModernDataResponse>(url);
  assertModernContract(data.meta, 'joborders.show.v1', 'job order profile');

  return data;
}

export async function fetchJobOrdersAddModernData(
  bootstrap: UIModeBootstrap,
  query: URLSearchParams
): Promise<JobOrdersAddModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'joborders',
    action: 'add',
    modernPage: MODERN_JOBORDER_ADD_PAGE,
    query
  });

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<JobOrdersAddModernDataResponse>(url);
  assertModernContract(data.meta, 'joborders.add.v1', 'job order add form');

  return data;
}

export async function fetchJobOrderAddPopupModernData(
  bootstrap: UIModeBootstrap,
  query: URLSearchParams
): Promise<JobOrderAddPopupModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'joborders',
    action: 'addJobOrderPopup',
    modernPage: MODERN_JOBORDER_ADD_POPUP_PAGE,
    query
  });

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<JobOrderAddPopupModernDataResponse>(url);
  assertModernContract(data.meta, 'joborders.addPopup.v1', 'job order add-popup action');

  return data;
}

export async function fetchJobOrdersEditModernData(
  bootstrap: UIModeBootstrap,
  query: URLSearchParams
): Promise<JobOrdersEditModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'joborders',
    action: 'edit',
    modernPage: MODERN_JOBORDER_EDIT_PAGE,
    query
  });

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<JobOrdersEditModernDataResponse>(url);
  assertModernContract(data.meta, 'joborders.edit.v1', 'job order edit form');

  return data;
}

export async function fetchJobOrderCompanyContextModernData(
  bootstrap: UIModeBootstrap,
  companyID: number
): Promise<JobOrderCompanyContextModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'joborders',
    action: 'companyContext',
    modernPage: 'joborders-company-context'
  });
  apiQuery.set('companyID', String(companyID || 0));

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<JobOrderCompanyContextModernDataResponse>(url);
  assertModernContract(data.meta, 'joborders.companyContext.v1', 'job order company context');

  return data;
}

export async function fetchQuickActionAddToListData(
  bootstrap: UIModeBootstrap,
  dataItemType: number,
  dataItemID: number
): Promise<QuickActionAddToListModernDataResponse> {
  const query = new URLSearchParams();
  query.set('m', 'lists');
  query.set('a', 'quickActionAddToListModal');
  query.set('format', 'modern-json');
  query.set('modernPage', 'lists-quick-action-add');
  query.set('dataItemType', String(dataItemType));
  query.set('dataItemID', String(dataItemID));
  const url = `${bootstrap.indexName}?${query.toString()}`;

  const data = await getJSON<QuickActionAddToListModernDataResponse>(url);
  assertModernContract(data.meta, 'lists.quickActionAddToList.v1', 'list modal data');

  return data;
}

export async function fetchAddToListDataFromPopupURL(
  bootstrap: UIModeBootstrap,
  popupURL: string
): Promise<QuickActionAddToListModernDataResponse> {
  const url = new URL(String(popupURL || '').replace(/&amp;/g, '&'), window.location.href);
  url.searchParams.set('format', 'modern-json');
  url.searchParams.set('modernPage', 'lists-quick-action-add');
  if (!url.searchParams.get('m')) {
    url.searchParams.set('m', 'lists');
  }
  if (!url.searchParams.get('a')) {
    url.searchParams.set('a', 'quickActionAddToListModal');
  }

  const data = await getJSON<QuickActionAddToListModernDataResponse>(url.toString());
  assertModernContract(data.meta, 'lists.quickActionAddToList.v1', 'list modal data');

  return data;
}

export async function fetchCandidateAssignToJobOrderData(
  bootstrap: UIModeBootstrap,
  popupURL: string
): Promise<CandidateAssignToJobOrderModernDataResponse> {
  const rawURL = String(popupURL || `${bootstrap.indexName}?m=candidates&a=considerForJobSearch`).replace(/&amp;/g, '&');
  const url = new URL(rawURL, window.location.href);
  url.searchParams.set('format', 'modern-json');
  url.searchParams.set('modernPage', 'candidate-assign-joborder');
  if (!url.searchParams.get('m')) {
    url.searchParams.set('m', 'candidates');
  }
  if (!url.searchParams.get('a')) {
    url.searchParams.set('a', 'considerForJobSearch');
  }

  const data = await getJSON<CandidateAssignToJobOrderModernDataResponse>(url.toString());
  assertModernContract(data.meta, 'candidates.considerForJobSearch.v1', 'add-to-job modal data');
  return data;
}

export async function assignCandidateToJobOrder(
  submitURL: string,
  payload: {
    candidateID: number;
    jobOrderID: number;
    securityToken: string;
    confirmReapplyRejected?: boolean;
    assignmentStatusID?: number;
  }
): Promise<CandidateAssignToJobOrderMutationResponse> {
  const body = new URLSearchParams();
  body.set('format', 'modern-json');
  body.set('candidateID', String(payload.candidateID || 0));
  body.set('jobOrderID', String(payload.jobOrderID || 0));
  body.set('securityToken', payload.securityToken || '');
  body.set('confirmReapplyRejected', payload.confirmReapplyRejected ? '1' : '0');
  if (Number(payload.assignmentStatusID || 0) > 0) {
    body.set('assignmentStatusID', String(payload.assignmentStatusID || 0));
  }

  const response = await fetch(submitURL, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body.toString()
  });

  let result: CandidateAssignToJobOrderMutationResponse | null = null;
  try {
    result = (await response.json()) as CandidateAssignToJobOrderMutationResponse;
  } catch (_error) {
    result = null;
  }

  if (!result) {
    throw new Error(`Candidate assign failed (${response.status}).`);
  }
  return result;
}

export async function fetchJobOrderAssignCandidateData(
  bootstrap: UIModeBootstrap,
  popupURL: string,
  query = ''
): Promise<JobOrderAssignCandidateModernDataResponse> {
  const rawURL = String(popupURL || `${bootstrap.indexName}?m=joborders&a=considerCandidateSearch`).replace(/&amp;/g, '&');
  const url = new URL(rawURL, window.location.href);
  url.searchParams.set('format', 'modern-json');
  url.searchParams.set('modernPage', 'joborder-consider-candidate');
  if (!url.searchParams.get('m')) {
    url.searchParams.set('m', 'joborders');
  }
  if (!url.searchParams.get('a')) {
    url.searchParams.set('a', 'considerCandidateSearch');
  }

  const normalizedQuery = String(query || '').trim();
  if (normalizedQuery === '') {
    url.searchParams.delete('wildCardString');
  } else {
    url.searchParams.set('wildCardString', normalizedQuery);
  }

  const data = await getJSON<JobOrderAssignCandidateModernDataResponse>(url.toString());
  assertModernContract(data.meta, 'joborders.considerCandidateSearch.v1', 'candidate search data');
  return data;
}

type LegacyAjaxResponse = {
  response: string;
  errorCode: string;
  errorMessage: string;
};

export type TransformJobOrderSearchResult = {
  totalElements: number;
  jobOrders: Array<{
    jobOrderID: number;
    title: string;
    companyName: string;
  }>;
};

export type TalentFitFlowTransformCreateResponse = {
  jobID: string;
  status: string;
};

export type TalentFitFlowTransformStatusResponse = {
  status: string;
  cvDownloadURL: string;
  analysisPdfState: string;
  analysisPdfAttached: boolean;
  analysisPdfRetryAfter: string;
  errorCodeText: string;
  errorMessageText: string;
};

export type TalentFitFlowTransformStoreResponse = {
  attachmentID: number;
  attachmentFilename: string;
  retrievalURL: string;
};

function getTextNodeValue(xml: Document, tagName: string): string {
  const node = xml.getElementsByTagName(tagName).item(0);
  if (!node || !node.textContent) {
    return '';
  }

  return node.textContent.trim();
}

function getElementTextNodeValue(element: Element, tagName: string): string {
  const node = element.getElementsByTagName(tagName).item(0);
  if (!node || !node.textContent) {
    return '';
  }

  return node.textContent.trim();
}

function compactLegacyAjaxPreview(bodyText: string, maxLength = 220): string {
  return String(bodyText || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

async function postLegacyAjaxXML(
  functionName: string,
  fields: Record<string, string>,
  actionLabel: string
): Promise<Document> {
  const body = new URLSearchParams();
  body.set('f', functionName);
  Object.entries(fields).forEach(([key, value]) => {
    body.set(key, String(value || ''));
  });
  body.set('rhash', String(Math.floor(Math.random() * 100000000)));

  const response = await fetch('ajax.php', {
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

  const responseText = await response.text();
  const xml = new DOMParser().parseFromString(responseText, 'application/xml');
  if (xml.getElementsByTagName('parsererror').length > 0) {
    const preview = compactLegacyAjaxPreview(responseText);
    throw new Error(
      `${actionLabel} failed. Invalid XML response.${preview === '' ? '' : ` Response preview: ${preview}`}`
    );
  }

  const errorCode = getTextNodeValue(xml, 'errorcode');
  const errorMessage = getTextNodeValue(xml, 'errormessage');
  if (errorCode !== '' && errorCode !== '0') {
    throw new Error(errorMessage || `${actionLabel} failed.`);
  }

  return xml;
}

function parseSessionCookie(sessionCookie: string): { key: string; value: string } | null {
  const normalized = String(sessionCookie || '').trim();
  if (normalized === '') {
    return null;
  }

  const separatorIndex = normalized.indexOf('=');
  if (separatorIndex <= 0) {
    return null;
  }

  const key = normalized.substring(0, separatorIndex).trim();
  const value = normalized.substring(separatorIndex + 1).trim();
  if (key === '' || value === '') {
    return null;
  }

  return { key, value };
}

export async function callLegacyAjaxFunction(
  functionName: string,
  fields: Record<string, string>,
  sessionCookie: string
): Promise<LegacyAjaxResponse> {
  const body = new URLSearchParams();
  body.set('f', functionName);
  Object.keys(fields).forEach((key) => {
    body.set(key, fields[key]);
  });
  body.set('rhash', String(Math.floor(Math.random() * 100000000)));

  const cookieKV = parseSessionCookie(sessionCookie);
  if (cookieKV) {
    body.set(cookieKV.key, cookieKV.value);
  }

  const response = await fetch('ajax.php', {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body.toString()
  });

  if (!response.ok) {
    throw new Error(`AJAX request failed (${response.status}).`);
  }

  const responseText = await response.text();
  const xml = new DOMParser().parseFromString(responseText, 'application/xml');
  if (xml.getElementsByTagName('parsererror').length > 0) {
    throw new Error('Invalid server response for AJAX request.');
  }

  const errorCode = getTextNodeValue(xml, 'errorcode');
  const errorMessage = getTextNodeValue(xml, 'errormessage');
  if (errorCode !== '' && errorCode !== '0') {
    throw new Error(errorMessage || 'Server returned an error.');
  }

  return {
    response: getTextNodeValue(xml, 'response'),
    errorCode,
    errorMessage
  };
}

export async function searchJobOrdersForTransform(
  query: string,
  maxResults: number,
  offset: number
): Promise<TransformJobOrderSearchResult> {
  const xml = await postLegacyAjaxXML(
    'searchJobOrders',
    {
      query: String(query || '').trim(),
      maxResults: String(Math.max(1, Number(maxResults || 50))),
      offset: String(Math.max(0, Number(offset || 0)))
    },
    'Job order search'
  );

  const jobOrderNodes = xml.getElementsByTagName('joborder');
  const jobOrders: TransformJobOrderSearchResult['jobOrders'] = [];
  for (let index = 0; index < jobOrderNodes.length; index += 1) {
    const node = jobOrderNodes.item(index);
    if (!node) {
      continue;
    }
    const jobOrderID = Number(getElementTextNodeValue(node, 'id') || 0);
    if (jobOrderID <= 0) {
      continue;
    }
    jobOrders.push({
      jobOrderID,
      title: getElementTextNodeValue(node, 'title'),
      companyName: getElementTextNodeValue(node, 'companyname')
    });
  }

  const totalElements = Number(getTextNodeValue(xml, 'totalelements') || jobOrders.length);
  return {
    totalElements: Number.isFinite(totalElements) ? totalElements : jobOrders.length,
    jobOrders
  };
}

export async function createTalentFitFlowTransformJob(payload: {
  candidateID: number;
  attachmentID: number;
  jobOrderID: number;
  language?: string;
  roleType?: string;
  anonymous?: boolean;
}): Promise<TalentFitFlowTransformCreateResponse> {
  const xml = await postLegacyAjaxXML(
    'talentFitFlowTransform',
    {
      action: 'create',
      candidateID: String(Number(payload.candidateID || 0)),
      attachmentID: String(Number(payload.attachmentID || 0)),
      jobOrderID: String(Number(payload.jobOrderID || 0)),
      language: String(payload.language || '').trim(),
      roleType: String(payload.roleType || '').trim(),
      anonymous: payload.anonymous ? '1' : '0'
    },
    'CV transform create'
  );

  const jobID = getTextNodeValue(xml, 'jobid');
  const status = getTextNodeValue(xml, 'status');
  if (jobID === '') {
    throw new Error('CV transform create failed. Missing job ID.');
  }

  return {
    jobID,
    status
  };
}

export async function fetchTalentFitFlowTransformStatus(payload: {
  jobID: string;
  candidateID: number;
  jobOrderID: number;
  anonymous?: boolean;
}): Promise<TalentFitFlowTransformStatusResponse> {
  const xml = await postLegacyAjaxXML(
    'talentFitFlowTransform',
    {
      action: 'status',
      jobId: String(payload.jobID || '').trim(),
      candidateID: String(Number(payload.candidateID || 0)),
      jobOrderID: String(Number(payload.jobOrderID || 0)),
      anonymous: payload.anonymous ? '1' : '0'
    },
    'CV transform status'
  );

  return {
    status: getTextNodeValue(xml, 'status'),
    cvDownloadURL: getTextNodeValue(xml, 'cv_download_url'),
    analysisPdfState: getTextNodeValue(xml, 'analysis_pdf_state'),
    analysisPdfAttached: getTextNodeValue(xml, 'analysis_pdf_attached') === '1',
    analysisPdfRetryAfter: getTextNodeValue(xml, 'analysis_pdf_retry_after'),
    errorCodeText: getTextNodeValue(xml, 'error_code'),
    errorMessageText: getTextNodeValue(xml, 'error_message')
  };
}

export async function storeTalentFitFlowTransformedAttachment(payload: {
  candidateID: number;
  attachmentID: number;
  jobOrderID: number;
  jobID: string;
  anonymous?: boolean;
}): Promise<TalentFitFlowTransformStoreResponse> {
  const xml = await postLegacyAjaxXML(
    'talentFitFlowTransform',
    {
      action: 'store',
      candidateID: String(Number(payload.candidateID || 0)),
      attachmentID: String(Number(payload.attachmentID || 0)),
      jobOrderID: String(Number(payload.jobOrderID || 0)),
      jobId: String(payload.jobID || '').trim(),
      anonymous: payload.anonymous ? '1' : '0'
    },
    'CV transform store'
  );

  return {
    attachmentID: Number(getTextNodeValue(xml, 'attachment_id') || 0),
    attachmentFilename: getTextNodeValue(xml, 'attachment_filename'),
    retrievalURL: getTextNodeValue(xml, 'retrieval_url')
  };
}

export async function sendGdprRequest(
  sendURL: string,
  candidateID: number
): Promise<ModernMutationResponse> {
  const body = new URLSearchParams();
  body.set('format', 'modern-json');
  body.set('action', 'sendCandidate');
  body.set('candidateID', String(candidateID || 0));

  const response = await fetch(sendURL, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body.toString()
  });

  let result: ModernMutationResponse | null = null;
  try {
    result = (await response.json()) as ModernMutationResponse;
  } catch (_error) {
    result = null;
  }

  if (!result) {
    throw new Error(`Send GDPR request failed (${response.status}).`);
  }

  return result;
}
