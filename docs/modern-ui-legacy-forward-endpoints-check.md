# Modern UI Intentional Legacy-Forward Endpoint Guard

Generated: 2026-03-23T05:54:16.784Z

This guard tracks endpoint-style routes that intentionally remain on `LegacyUtilityForwardActionPage` to avoid breaking download, AJAX, auth, XML, and mutation compatibility behavior.

## Totals

- Actual legacy-forward routes: 28
- Expected legacy-forward routes: 28
- Unexpected routes: 0
- Missing expected routes: 0
- Missing required UI switch excludes: 0
- Duplicate route mappings detected: no

## Expected Route Inventory

| Category | Route | Status |
| --- | --- | --- |
| Calendar legacy feed endpoint | `calendar.dynamicdata` | Present |
| Attachment/export/download endpoints | `attachments.getattachment` | Present |
| Attachment/export/download endpoints | `export.export` | Present |
| Attachment/export/download endpoints | `export.exportbydatagrid` | Present |
| Attachment/export/download endpoints | `gdpr.export` | Present |
| Attachment/export/download endpoints | `xml.joborders` | Present |
| Settings AJAX and mutation endpoints | `settings.ajax_tags_add` | Present |
| Settings AJAX and mutation endpoints | `settings.ajax_tags_del` | Present |
| Settings AJAX and mutation endpoints | `settings.ajax_tags_upd` | Present |
| Settings AJAX and mutation endpoints | `settings.ajax_wizardadduser` | Present |
| Settings AJAX and mutation endpoints | `settings.ajax_wizardcheckkey` | Present |
| Settings AJAX and mutation endpoints | `settings.ajax_wizarddeleteuser` | Present |
| Settings AJAX and mutation endpoints | `settings.ajax_wizardemail` | Present |
| Settings AJAX and mutation endpoints | `settings.ajax_wizardfirsttimesetup` | Present |
| Settings AJAX and mutation endpoints | `settings.ajax_wizardimport` | Present |
| Settings AJAX and mutation endpoints | `settings.ajax_wizardlicense` | Present |
| Settings AJAX and mutation endpoints | `settings.ajax_wizardlocalization` | Present |
| Settings AJAX and mutation endpoints | `settings.ajax_wizardpassword` | Present |
| Settings AJAX and mutation endpoints | `settings.ajax_wizardsitename` | Present |
| Settings AJAX and mutation endpoints | `settings.ajax_wizardwebsite` | Present |
| Toolbar integration endpoints | `toolbar.attemptlogin` | Present |
| Toolbar integration endpoints | `toolbar.authenticate` | Present |
| Toolbar integration endpoints | `toolbar.checkemailisinsystem` | Present |
| Toolbar integration endpoints | `toolbar.getjavascriptlib` | Present |
| Toolbar integration endpoints | `toolbar.getlicensekey` | Present |
| Toolbar integration endpoints | `toolbar.getremoteversion` | Present |
| Toolbar integration endpoints | `toolbar.storemonsterresumetext` | Present |
| Wizard AJAX endpoint | `wizard.ajax_getpage` | Present |

## Unexpected Routes

None.

## Missing Expected Routes

None.

## Required UI Switch Excludes

- `wizard.ajax_getpage`
