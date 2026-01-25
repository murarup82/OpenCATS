<?php
/*
 * CATS
 * AJAX Pipeline History Purge Interface
 */

include_once(LEGACY_ROOT . '/lib/Pipelines.php');

$interface = new SecureAJAXInterface();

if ($_SESSION['CATS']->getAccessLevel('settings.editStatusHistory') < ACCESS_LEVEL_MULTI_SA)
{
    $interface->outputXMLErrorPage(-1, ERROR_NO_PERMISSION);
    die();
}

if (!$interface->isRequiredIDValid('candidateJobOrderID'))
{
    $interface->outputXMLErrorPage(-1, 'Invalid candidate-joborder ID.');
    die();
}

$siteID = $interface->getSiteID();
$candidateJobOrderID = $_REQUEST['candidateJobOrderID'];

$pipelines = new Pipelines($siteID);
$result = $pipelines->purgeHistory($candidateJobOrderID);

if (!$result)
{
    $interface->outputXMLErrorPage(-1, 'Failed to purge pipeline entry.');
    die();
}

$interface->outputXMLSuccessPage();

?>
