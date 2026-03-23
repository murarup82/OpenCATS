import { useCallback, useEffect, useMemo, useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import {
  fetchSettingsWizardAddUserModernData,
  fetchSettingsWizardCheckKeyModernData,
  fetchSettingsWizardDeleteUserModernData,
  fetchSettingsWizardEmailModernData,
  fetchSettingsWizardFirstTimeSetupModernData,
  fetchSettingsWizardImportModernData,
  fetchSettingsWizardLicenseModernData,
  fetchSettingsWizardLocalizationModernData,
  fetchSettingsWizardPasswordModernData,
  fetchSettingsWizardSiteNameModernData,
  fetchSettingsWizardWebsiteModernData
} from '../lib/api';
import { ensureModernUIURL, ensureUIURL } from '../lib/navigation';
import type { ModernMutationResponse, UIModeBootstrap } from '../types';
import '../dashboard-avel.css';

type Props = {
  bootstrap: UIModeBootstrap;
};

type ExecutionState = 'loading' | 'success' | 'error';

type SettingsWizardActionKey =
  | 'ajax_wizardadduser'
  | 'ajax_wizardcheckkey'
  | 'ajax_wizarddeleteuser'
  | 'ajax_wizardemail'
  | 'ajax_wizardfirsttimesetup'
  | 'ajax_wizardimport'
  | 'ajax_wizardlicense'
  | 'ajax_wizardlocalization'
  | 'ajax_wizardpassword'
  | 'ajax_wizardsitename'
  | 'ajax_wizardwebsite';

type SettingsWizardActionResult = {
  success: boolean;
  code?: string;
  message?: string;
};

type SettingsWizardActionHandler = (
  bootstrap: UIModeBootstrap,
  query: URLSearchParams
) => Promise<ModernMutationResponse>;

const SETTINGS_WIZARD_ACTIONS: Record<SettingsWizardActionKey, SettingsWizardActionHandler> = {
  ajax_wizardadduser: fetchSettingsWizardAddUserModernData,
  ajax_wizardcheckkey: fetchSettingsWizardCheckKeyModernData,
  ajax_wizarddeleteuser: fetchSettingsWizardDeleteUserModernData,
  ajax_wizardemail: fetchSettingsWizardEmailModernData,
  ajax_wizardfirsttimesetup: fetchSettingsWizardFirstTimeSetupModernData,
  ajax_wizardimport: fetchSettingsWizardImportModernData,
  ajax_wizardlicense: fetchSettingsWizardLicenseModernData,
  ajax_wizardlocalization: fetchSettingsWizardLocalizationModernData,
  ajax_wizardpassword: fetchSettingsWizardPasswordModernData,
  ajax_wizardsitename: fetchSettingsWizardSiteNameModernData,
  ajax_wizardwebsite: fetchSettingsWizardWebsiteModernData
};

const SETTINGS_WIZARD_TITLES: Record<SettingsWizardActionKey, string> = {
  ajax_wizardadduser: 'Add User',
  ajax_wizardcheckkey: 'Check License Key',
  ajax_wizarddeleteuser: 'Delete User',
  ajax_wizardemail: 'Email Settings',
  ajax_wizardfirsttimesetup: 'First Time Setup',
  ajax_wizardimport: 'Import',
  ajax_wizardlicense: 'License',
  ajax_wizardlocalization: 'Localization',
  ajax_wizardpassword: 'Password',
  ajax_wizardsitename: 'Site Name',
  ajax_wizardwebsite: 'Website'
};

function normalizeAction(value: string): SettingsWizardActionKey | '' {
  const normalized = String(value || '').trim().toLowerCase();
  return normalized in SETTINGS_WIZARD_ACTIONS ? (normalized as SettingsWizardActionKey) : '';
}

function buildRequestQuery(query: URLSearchParams): URLSearchParams {
  return new URLSearchParams(query.toString());
}

function getModernAdminURL(indexName: string): string {
  return ensureModernUIURL(`${indexName}?m=settings&a=administration`);
}

function getLegacyURL(rawURL: string): string {
  return ensureUIURL(rawURL, 'legacy');
}

function formatDetailLabel(label: string, value: string): string {
  const normalized = String(value || '').trim();
  return normalized === '' ? '' : `${label}: ${normalized}`;
}

export function SettingsWizardActionPage({ bootstrap }: Props) {
  const actionKey = useMemo(() => normalizeAction(bootstrap.targetAction), [bootstrap.targetAction]);
  const requestQuery = useMemo(() => buildRequestQuery(new URLSearchParams(window.location.search)), []);
  const modernAdminURL = useMemo(() => getModernAdminURL(bootstrap.indexName), [bootstrap.indexName]);
  const legacyURL = useMemo(() => getLegacyURL(bootstrap.legacyURL), [bootstrap.legacyURL]);
  const title = useMemo(() => {
    if (!actionKey) {
      return 'Settings Wizard Action';
    }
    return `${SETTINGS_WIZARD_TITLES[actionKey]} Wizard`;
  }, [actionKey]);

  const [executionState, setExecutionState] = useState<ExecutionState>('loading');
  const [result, setResult] = useState<SettingsWizardActionResult | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [attemptID, setAttemptID] = useState(0);

  const executeAction = useCallback(async () => {
    if (!actionKey) {
      setExecutionState('error');
      setResult(null);
      setErrorMessage(`Unsupported settings wizard action "${bootstrap.targetAction || '(default)'}".`);
      return;
    }

    const handler = SETTINGS_WIZARD_ACTIONS[actionKey];
    if (!handler) {
      setExecutionState('error');
      setResult(null);
      setErrorMessage(`Unsupported settings wizard action "${bootstrap.targetAction || '(default)'}".`);
      return;
    }

    setExecutionState('loading');
    setResult(null);
    setErrorMessage('');

    try {
      const response = await handler(bootstrap, new URLSearchParams(requestQuery.toString()));
      const nextResult = {
        success: Boolean(response.success),
        code: response.code || '',
        message: response.message || ''
      };
      setResult(nextResult);
      setExecutionState(nextResult.success ? 'success' : 'error');
      setErrorMessage(nextResult.success ? '' : nextResult.message || 'Settings wizard action failed.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Settings wizard action failed.';
      setExecutionState('error');
      setResult(null);
      setErrorMessage(message);
    }
  }, [actionKey, bootstrap, requestQuery]);

  useEffect(() => {
    void executeAction();
  }, [attemptID, executeAction]);

  const stateLabel = useMemo(() => {
    if (executionState === 'loading') {
      return 'Executing settings wizard action...';
    }

    if (executionState === 'success') {
      return 'Settings wizard action completed successfully.';
    }

    return errorMessage || 'Settings wizard action failed.';
  }, [errorMessage, executionState]);

  const detailLine = useMemo(() => {
    if (!result) {
      return '';
    }

    return [formatDetailLabel('Code', result.code), formatDetailLabel('Message', result.message)]
      .filter((value) => value !== '')
      .join(' | ');
  }, [result]);

  return (
    <div className="avel-dashboard-page">
      <PageContainer
        title={title}
        subtitle={`Processing ${bootstrap.targetModule || 'settings'}.${bootstrap.targetAction || 'action'} in modern mode.`}
        actions={
          <>
            <a className="modern-btn modern-btn--secondary" href={modernAdminURL}>
              Back To Settings
            </a>
            <a className="modern-btn modern-btn--secondary" href={legacyURL}>
              Open Legacy UI
            </a>
            <button
              type="button"
              className="modern-btn modern-btn--secondary"
              onClick={() => {
                setAttemptID((current) => current + 1);
              }}
            >
              Retry
            </button>
          </>
        }
      >
        <div className="modern-dashboard avel-dashboard-shell">
          <section className="avel-list-panel">
            <div className={`modern-state${executionState === 'error' ? ' modern-state--error' : executionState === 'success' ? ' modern-state--success' : ''}`}>
              <div>{stateLabel}</div>
              {detailLine !== '' ? <div>{detailLine}</div> : null}
            </div>
          </section>
        </div>
      </PageContainer>
    </div>
  );
}
