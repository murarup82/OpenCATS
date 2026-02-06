INSERT INTO email_template (
    text,
    allow_substitution,
    site_id,
    tag,
    title,
    possible_variables,
    disabled
)
SELECT
    '* This is an auto-generated message. Please do not reply. *\r\n%DATETIME%\r\n\r\nHello %CANDIDATE_NAME%,\r\n\r\nPlease review and respond to our GDPR consent request by visiting the link below:\r\n%CONSENT_LINK%\r\n\r\nThis link expires on %REQUEST_EXPIRES%.\r\n\r\nThank you,\r\n%SITENAME%',
    1,
    s.site_id,
    'GDPR_CONSENT',
    'GDPR Consent Request',
    '%DATETIME%%SITENAME%%USERFULLNAME%%USERMAIL%%CANDIDATE_NAME%%CANDFIRSTNAME%%CANDFULLNAME%%CONSENT_LINK%%REQUEST_EXPIRES%',
    0
FROM site s
WHERE NOT EXISTS (
    SELECT 1 FROM email_template t
    WHERE t.site_id = s.site_id
      AND t.tag = 'GDPR_CONSENT'
);
