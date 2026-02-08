<?php
/*
 * CATS
 * AJAX E-Mail Settings Testing Interface
 *
 * Copyright (C) 2005 - 2007 Cognizo Technologies, Inc.
 *
 *
 * The contents of this file are subject to the CATS Public License
 * Version 1.1a (the "License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.catsone.com/.
 *
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See the
 * License for the specific language governing rights and limitations
 * under the License.
 *
 * The Original Code is "CATS Standard Edition".
 *
 * The Initial Developer of the Original Code is Cognizo Technologies, Inc.
 * Portions created by the Initial Developer are Copyright (C) 2005 - 2007
 * (or from the year in which this file was created to the year 2007) by
 * Cognizo Technologies, Inc. All Rights Reserved.
 *
 *
 * $Id: testEmailSettings.php 2101 2007-03-06 00:20:17Z brian $
 */

include_once(LEGACY_ROOT . '/lib/Mailer.php');


$interface = new SecureAJAXInterface();

$siteID = $interface->getSiteID();

if ($_SESSION['CATS']->getAccessLevel('settings.administration') < ACCESS_LEVEL_SA)
{
    $interface->outputXMLErrorPage(
        -1, 'You do not have permission to test e-mail settings.'
    );
    die();
}

if (!isset($_REQUEST['testEmailAddress']) ||
    empty($_REQUEST['testEmailAddress']))
{
    $interface->outputXMLErrorPage(
        -1, 'Invalid test e-mail address.'
    );

    die();
}

if (!isset($_REQUEST['fromAddress']) ||
    empty($_REQUEST['fromAddress']))
{
    $interface->outputXMLErrorPage(
        -1, 'Invalid from e-mail address.'
    );

    die();
}

$testEmailAddress = $_REQUEST['testEmailAddress'];
$fromAddress      = $_REQUEST['fromAddress'];

/* Is the test e-mail address specified valid? */
// FIXME: Validate properly.
if (strpos($testEmailAddress, '@') === false)
{
    $interface->outputXMLErrorPage(
        -2, 'Invalid test e-mail address.'
    );

    die();
}

/* Is the from e-mail address specified valid? */
// FIXME: Validate properly.
if (strpos($fromAddress, '@') === false)
{
    $interface->outputXMLErrorPage(
        -2, 'Invalid from e-mail address.'
    );

    die();
}

$mailerSettings = new MailerSettings($siteID);
$mailerSettingsRS = $mailerSettings->getAll();
$mailer = new Mailer($siteID);

$debugInfo = array(
    'mailerMode' => MAIL_MAILER,
    'mailerModeLabel' => (MAIL_MAILER == MAILER_MODE_SMTP ? 'SMTP' : (MAIL_MAILER == MAILER_MODE_SENDMAIL ? 'SENDMAIL' : (MAIL_MAILER == MAILER_MODE_PHP ? 'PHP' : (MAIL_MAILER == MAILER_MODE_DISABLED ? 'DISABLED' : 'UNKNOWN')))),
    'smtpHost' => (defined('MAIL_SMTP_HOST') ? MAIL_SMTP_HOST : ''),
    'smtpPort' => (defined('MAIL_SMTP_PORT') ? MAIL_SMTP_PORT : ''),
    'smtpSecure' => (defined('MAIL_SMTP_SECURE') ? MAIL_SMTP_SECURE : ''),
    'smtpAuth' => (defined('MAIL_SMTP_AUTH') ? (MAIL_SMTP_AUTH ? 'true' : 'false') : ''),
    'smtpUsernamePresent' => (defined('MAIL_SMTP_USER') && MAIL_SMTP_USER !== ''),
    'smtpTimeout' => 10,
    'fromAddressInput' => $fromAddress,
    'testEmailAddress' => $testEmailAddress
);

if (!empty($debugInfo['smtpHost']))
{
    $resolved = @gethostbyname($debugInfo['smtpHost']);
    $debugInfo['smtpResolvedIP'] = $resolved;
    $debugInfo['smtpResolved'] = ($resolved !== $debugInfo['smtpHost']) ? 'yes' : 'no';
}

error_log('SMTP test config | ' . json_encode($debugInfo));
$mailer->enableSMTPDebugToErrorLog(2);

$mailer->overrideSetting('fromAddress', $fromAddress);

$mailerStatus = $mailer->sendToOne(
    array($testEmailAddress, ''),
    'CATS Test E-Mail',
    'This is a CATS test e-mail in HTML format.',
    true
);

if (!$mailerStatus)
{
    $errorMessage = $mailer->getError();
    error_log('SMTP test failed | ' . json_encode(array(
        'error' => $errorMessage,
        'context' => $debugInfo
    )));
    $interface->outputXMLErrorPage(-2, $errorMessage);
    die();
}

$errorMessage = $mailer->getError();
if (!empty($errorMessage))
{
    error_log('SMTP test error | ' . json_encode(array(
        'error' => $errorMessage,
        'context' => $debugInfo
    )));
    $interface->outputXMLErrorPage(-2, $errorMessage);

    die();
}

error_log('SMTP test success | ' . json_encode($debugInfo));

/* Send back the XML data. */
$interface->outputXMLSuccessPage();

?>
