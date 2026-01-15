<?php
/*
 * CATS
 * AJAX Pipeline Status History Timestamp Editor
 *
 * Copyright (C) 2005 - 2007 Cognizo Technologies, Inc.
 *
 * The contents of this file are subject to the CATS Public License
 * Version 1.1a (the "License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.catsone.com/.
 */

include_once(LEGACY_ROOT . '/lib/Pipelines.php');

$interface = new SecureAJAXInterface();

if ($_SESSION['CATS']->getAccessLevel('settings.editStatusHistory') < ACCESS_LEVEL_MULTI_SA)
{
    $interface->outputXMLErrorPage(-1, ERROR_NO_PERMISSION);
    die();
}

if (!$interface->isRequiredIDValid('historyID'))
{
    $interface->outputXMLErrorPage(-1, 'Invalid history ID.');
    die();
}

$newDate = $interface->getTrimmedInput('newDate');
$editNote = $interface->getTrimmedInput('editNote');

if ($newDate === '')
{
    $interface->outputXMLErrorPage(-1, 'Timestamp is required.');
    die();
}

if ($editNote === '')
{
    $interface->outputXMLErrorPage(-1, 'Edit note is required.');
    die();
}

$timestamp = strtotime($newDate);
if ($timestamp === false)
{
    $interface->outputXMLErrorPage(-1, 'Invalid timestamp format.');
    die();
}

$siteID = $interface->getSiteID();
$userID = $interface->getUserID();
$historyID = $_REQUEST['historyID'];
$formattedDate = date('Y-m-d H:i:s', $timestamp);

$pipelines = new Pipelines($siteID);
$result = $pipelines->updateStatusHistoryDate($historyID, $formattedDate, $userID, $editNote);

if (!$result)
{
    $interface->outputXMLErrorPage(-1, 'Failed to update status history.');
    die();
}

$interface->outputXMLSuccessPage();

?>
