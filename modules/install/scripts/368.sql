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
    '* This is an automated message. Please do not reply. *\r\n%DATETIME%\r\n\r\nHello %CANDFIRSTNAME%,\r\n\r\nWe''d love to keep your application active and stay in touch about future opportunities at Avel Technologies but your privacy matters to us as much as your application does.\r\n\r\nTo ensure we''re following the latest GDPR guidelines while we process your candidacy, we need your consent to keep your info in our secure system.\r\n\r\nClick here to stay on our radar: %CONSENT_LINK%\r\n\r\nThank you!\r\nThe Avel Technologies Team\r\n\r\nP.S. This link expires on %REQUEST_EXPIRES%, so don''t let it sit in your inbox for too long!',
    1,
    s.site_id,
    'GDPR_CONSENT',
    'Keeping your data safe at Avel Technologies',
    '%DATETIME%%SITENAME%%USERFULLNAME%%USERMAIL%%CANDIDATE_NAME%%CANDFIRSTNAME%%CANDFULLNAME%%CONSENT_LINK%%REQUEST_EXPIRES%',
    0
FROM site s
WHERE NOT EXISTS (
    SELECT 1 FROM email_template t
    WHERE t.site_id = s.site_id
      AND t.tag = 'GDPR_CONSENT'
);
