# Modern UI Release-Day Ownership Matrix

Use this matrix during cutover windows to clarify responsibilities and escalation path.

| Area | Primary Owner | Secondary Owner | Escalation Contact | Notes |
| --- | --- | --- | --- | --- |
| Release command execution (`quality:gate`, deploy, config switch) |  |  |  |  |
| Smoke checks in target env (`smoke:routes`, `smoke:endpoints`) |  |  |  |  |
| Route telemetry monitoring (`native/bridge/legacy`) |  |  |  |  |
| Candidate/JobOrder critical workflow validation |  |  |  |  |
| Accessibility validation spot-check |  |  |  |  |
| Incident triage + issue classification |  |  |  |  |
| Rollback execution (hybrid/disable switch) |  |  |  |  |
| Stakeholder communications/status updates |  |  |  |  |

## Escalation Rule

If a critical workflow blocker is confirmed, incident owner must notify rollback owner immediately and execute runbook rollback steps without waiting for full RCA.
