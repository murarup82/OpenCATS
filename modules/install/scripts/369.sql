UPDATE email_template
SET
    title = 'GDPR Consent Request',
    text = '* This is an automated message. Please do not reply. *\r\n%DATETIME%\r\n\r\nHello %CANDIDATE_NAME%,\r\n\r\nTo continue processing your application and storing your personal data,\r\nwe need your consent in accordance with GDPR regulations.\r\n\r\nPlease review and respond by clicking the link below:\r\n%CONSENT_LINK%\r\n\r\nThis link will expire on %REQUEST_EXPIRES%.\r\n\r\nThank you,\r\n\r\nAvel Technologies Team',
    possible_variables = '%DATETIME%%SITENAME%%USERFULLNAME%%USERMAIL%%CANDIDATE_NAME%%CANDFIRSTNAME%%CANDFULLNAME%%CONSENT_LINK%%REQUEST_EXPIRES%'
WHERE tag = 'GDPR_CONSENT';
