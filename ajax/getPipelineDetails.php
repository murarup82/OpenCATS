<?php
/*
 * CATS
 * AJAX Pipeline Details Interface
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
 * $Id: getPipelineDetails.php 2976 2007-08-30 18:18:48Z andrew $
 */

include_once(LEGACY_ROOT . '/lib/Pipelines.php');


$interface = new SecureAJAXInterface();

if (!$interface->isRequiredIDValid('candidateJobOrderID', false))
{
    $interface->outputXMLErrorPage(-1, 'Invalid candidate-joborder ID.');
    die();
}

$siteID = $interface->getSiteID();

$candidateJobOrderID = $_REQUEST['candidateJobOrderID'];
$htmlObjectID = '';
if (isset($_REQUEST['htmlObjectID']))
{
    $htmlObjectID = preg_replace('/[^A-Za-z0-9_]/', '', $_REQUEST['htmlObjectID']);
}

/* Get an array of the company's contacts data. */
$pipelines = new Pipelines($siteID);
$statusHistoryRS = $pipelines->getStatusHistory($candidateJobOrderID);
$pipelineActivitiesRS = $pipelines->getPipelineDetails($candidateJobOrderID);

foreach ($pipelineActivitiesRS as $rowIndex => $row)
{
    if (empty($pipelineActivitiesRS[$rowIndex]['notes']))
    {
        $pipelineActivitiesRS[$rowIndex]['notes'] = '(No Notes)';
    }
}

/* Output HTML. */
$canEditHistory = ($_SESSION['CATS']->getAccessLevel('settings.editStatusHistory') >= ACCESS_LEVEL_MULTI_SA);
if ($htmlObjectID === '')
{
    $canEditHistory = false;
}

echo '<div class="noteUnsizedSpan">Status History:</div>',
     '<table>';

if (empty($statusHistoryRS))
{
    echo '<tr><td>No status history entries could be found.</td></tr>';
}
else
{
    foreach ($statusHistoryRS as $statusHistory)
    {
        $comment = trim($statusHistory['commentText']);
        if ($comment === '')
        {
            $comment = '(No Comment)';
        }

        $statusFrom = $statusHistory['statusFrom'];
        $statusTo = $statusHistory['statusTo'];
        if ($statusFrom === null || $statusFrom === '')
        {
            $statusFrom = 'None';
        }
        if ($statusTo === null || $statusTo === '')
        {
            $statusTo = 'None';
        }

        echo '<tr>';
        echo '<td style="padding-right: 6px; width: 160px;">',
             htmlspecialchars($statusHistory['dateDisplay']),
             '</td>';
        echo '<td style="padding-right: 6px; width: 220px;">',
             htmlspecialchars($statusFrom),
             ' -> ',
             htmlspecialchars($statusTo),
             '</td>';
        echo '<td style="padding-right: 6px;">',
             htmlspecialchars($comment),
             '<br />';

        if (!empty($statusHistory['rejectionReasons']))
        {
            echo '<span class="noteUnsizedSpan">Rejection reasons: ',
                 htmlspecialchars($statusHistory['rejectionReasons']),
                 '</span><br />';
        }

        if (!empty($statusHistory['rejectionReasonOther']))
        {
            echo '<span class="noteUnsizedSpan">Other reason: ',
                 htmlspecialchars($statusHistory['rejectionReasonOther']),
                 '</span><br />';
        }

        if (!empty($statusHistory['editedAt']))
        {
            $editedByName = trim($statusHistory['editedByFirstName'] . ' ' . $statusHistory['editedByLastName']);
            if ($editedByName === '')
            {
                $editedByName = 'Unknown';
            }

            $editNote = trim($statusHistory['editNote']);
            if ($editNote === '')
            {
                $editNote = '(No edit note)';
            }

            echo '<span class="noteUnsizedSpan">Edited by ',
                 htmlspecialchars($editedByName),
                 ' on ',
                 htmlspecialchars($statusHistory['editedAtDisplay']),
                 ': ',
                 htmlspecialchars($editNote),
                 '</span><br />';
        }

        echo '</td>';

        if ($canEditHistory)
        {
            echo '<td style="width: 60px; text-align: right;">',
                 '<a href="javascript:void(0);" onclick="PipelineStatusHistoryEdit(',
                 (int) $statusHistory['historyID'],
                 ', \'',
                 addslashes($statusHistory['dateEdit']),
                 '\', ',
                 (int) $candidateJobOrderID,
                 ', \'',
                 htmlspecialchars($htmlObjectID, ENT_QUOTES),
                 '\', \'',
                 $_SESSION['CATS']->getCookie(),
                 '\');">Edit</a>',
                 '</td>';
        }

        echo '</tr>';
    }
}

echo '</table>',
     '<br />',
     '<div class="noteUnsizedSpan">Activity History:</div>',
     '<table>';

if (empty($pipelineActivitiesRS))
{
    echo '<tr><td>No activity entries could be found.</td></tr>';
}
else
{
    foreach ($pipelineActivitiesRS as $activity)
    {

        echo '<tr>';
        echo '<td style="padding-right: 6px; width: 160px;">',
             $activity['dateModified'],
             '</td>';
        echo '<td style="padding-right: 6px; width: 125px">(',
             $activity['enteredByFirstName'],
             ' ',
             $activity['enteredByLastName'],
             ')</td>';
        echo '<td style="padding-right: 6px; width: 625px;">',
             $activity['notes'],
             '<br /></td>';
        echo '</tr>';
    }
}

echo '</table>';

?>
