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
