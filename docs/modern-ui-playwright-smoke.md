# Modern UI Playwright Smoke Coverage

Playwright smoke coverage validates modern add/edit contracts for:

- `candidates`
- `companies`
- `contacts`
- `joborders`

## Command

```bash
cd frontend/modern-ui
npm run smoke:playwright
```

## Required Environment

| Variable | Purpose |
| --- | --- |
| `OPENCATS_BASE_URL` | Base URL for the OpenCATS instance (required). |
| `OPENCATS_INDEX_PATH` | Optional entrypoint path (default: `/index.php`). |
| `OPENCATS_COOKIE` | Optional authenticated session cookie. |
| `OPENCATS_CANDIDATE_ID` | Candidate ID for `candidates.edit` smoke check. |
| `OPENCATS_COMPANY_ID` | Company ID for `companies.edit` smoke check. |
| `OPENCATS_CONTACT_ID` | Contact ID for `contacts.edit` smoke check. |
| `OPENCATS_JOBORDER_ID` | Job order ID for `joborders.edit` smoke check. |

If `OPENCATS_BASE_URL` is missing, all Playwright smoke tests are skipped by design.

## GDPR Consent Visual Snapshots

Command:

```bash
cd frontend/modern-ui
npm run smoke:playwright:gdpr-consent
```

Additional environment variables:

| Variable | Purpose |
| --- | --- |
| `OPENCATS_GDPR_CONSENT_PATH` | Optional consent endpoint path (default: `/gdpr/consent.php`). |
| `OPENCATS_GDPR_CONSENT_LANG` | Optional snapshot language query (default: `en`). |
| `OPENCATS_GDPR_TOKEN_ACTIVE` | Token for active consent request snapshot. |
| `OPENCATS_GDPR_TOKEN_ACCEPTED` | Token for already accepted consent request snapshot. |
| `OPENCATS_GDPR_TOKEN_DECLINED` | Token for already declined consent request snapshot. |
| `OPENCATS_GDPR_TOKEN_EXPIRED` | Token for expired consent request snapshot. |

Notes:

- The `invalid-link` snapshot runs without a token.
- State-specific snapshots are skipped when their token variable is not set.
