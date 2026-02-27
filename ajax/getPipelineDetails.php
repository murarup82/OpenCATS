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

/* Output HTML. */
$canEditHistory = ($_SESSION['CATS']->getAccessLevel('settings.editStatusHistory') >= ACCESS_LEVEL_MULTI_SA);
if ($htmlObjectID === '')
{
    $canEditHistory = false;
}

$historyRows = is_array($statusHistoryRS) ? $statusHistoryRS : array();
$totalTransitions = count($historyRows);
$autoTransitions = 0;
$editedTransitions = 0;
$latestTransitionRaw = '';
$latestTransitionDisplay = '--';
foreach ($historyRows as $statusHistory)
{
    $commentForMeta = trim($statusHistory['commentText']);
    $isAutoTransition = false;
    if ($commentForMeta !== '' && strpos($commentForMeta, '[AUTO] ') === 0)
    {
        $isAutoTransition = true;
    }
    if ((int) $statusHistory['commentIsSystem'] === 1)
    {
        $isAutoTransition = true;
    }
    if ($isAutoTransition)
    {
        $autoTransitions++;
    }
    if (!empty($statusHistory['editedAt']))
    {
        $editedTransitions++;
    }
    if (!empty($statusHistory['dateRaw']) && (empty($latestTransitionRaw) || strcmp($statusHistory['dateRaw'], $latestTransitionRaw) > 0))
    {
        $latestTransitionRaw = $statusHistory['dateRaw'];
        $latestTransitionDisplay = $statusHistory['dateDisplay'];
    }
}
$fullDetailsURL = CATSUtility::getIndexName() . '?m=joborders&a=pipelineStatusDetails&pipelineID=' . (int) $candidateJobOrderID;
$purgeURL = 'ajax.php?f=purgePipelineHistory&candidateJobOrderID=' . (int) $candidateJobOrderID;
$jsHtmlObjectID = addslashes($htmlObjectID);
$jsSessionCookie = addslashes($_SESSION['CATS']->getCookie());
?>
<style type="text/css">
    .pipelineInlineDetailsWrap {
        border: 1px solid #d8e5ec;
        border-radius: 10px;
        background: #ffffff;
        padding: 10px;
        color: #223944;
        font-size: 12px;
    }
    .pipelineInlineHeader {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
    }
    .pipelineInlineHeaderTitle {
        font-size: 14px;
        font-weight: 700;
        color: #0e4d65;
    }
    .pipelineInlineHeaderActions {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
    }
    .pipelineInlineActionLink {
        color: #0d5f7b;
        font-weight: 700;
        text-decoration: none;
    }
    .pipelineInlineActionLink:hover {
        text-decoration: underline;
    }
    .pipelineInlineSummary {
        display: grid;
        grid-template-columns: repeat(4, minmax(100px, 1fr));
        gap: 8px;
        margin-bottom: 10px;
    }
    .pipelineInlineSummaryCard {
        border: 1px solid #dce7ef;
        border-radius: 8px;
        background: #f8fcff;
        padding: 7px 8px;
    }
    .pipelineInlineSummaryLabel {
        font-size: 10px;
        color: #597583;
        text-transform: uppercase;
        letter-spacing: 0.03em;
    }
    .pipelineInlineSummaryValue {
        margin-top: 2px;
        font-size: 20px;
        line-height: 1.1;
        color: #0b4c66;
        font-weight: 700;
    }
    .pipelineInlineSummaryValueCompact {
        font-size: 14px;
        line-height: 1.3;
    }
    .pipelineInlineTable {
        width: 100%;
        border-collapse: separate;
        border-spacing: 0;
        border: 1px solid #dce7ef;
        border-radius: 8px;
        overflow: hidden;
        table-layout: fixed;
    }
    .pipelineInlineTable th,
    .pipelineInlineTable td {
        padding: 7px 8px;
        border-bottom: 1px solid #e2ebf2;
        vertical-align: top;
    }
    .pipelineInlineTable tr:last-child td {
        border-bottom: 0;
    }
    .pipelineInlineTable th {
        background: #0f6886;
        color: #ffffff;
        font-size: 11px;
        text-align: left;
    }
    .pipelineInlineTable th:nth-child(1),
    .pipelineInlineTable td:nth-child(1) { width: 18%; }
    .pipelineInlineTable th:nth-child(2),
    .pipelineInlineTable td:nth-child(2) { width: 23%; }
    .pipelineInlineTable th:nth-child(3),
    .pipelineInlineTable td:nth-child(3) { width: 43%; }
    .pipelineInlineTable th:nth-child(4),
    .pipelineInlineTable td:nth-child(4) { width: 10%; text-align: center; }
    .pipelineInlineTable th:nth-child(5),
    .pipelineInlineTable td:nth-child(5) { width: 6%; text-align: right; }
    .pipelineInlineTable tbody tr:nth-child(even) td {
        background: #f9fcfe;
    }
    .pipelineStatusPill {
        display: inline-block;
        padding: 1px 7px;
        border-radius: 10px;
        border: 1px solid #d1d9de;
        background: #f2f4f6;
        font-size: 11px;
        font-weight: 700;
        color: #2a3742;
    }
    .pipelineStatusPill.status-allocated { background: #e6f0ff; color: #1d4ed8; border-color: #c7ddff; }
    .pipelineStatusPill.status-delivery-validated { background: #e6f7f4; color: #0f766e; border-color: #c5ece6; }
    .pipelineStatusPill.status-proposed-to-customer { background: #f3e8ff; color: #6b21a8; border-color: #e3d0ff; }
    .pipelineStatusPill.status-customer-interview { background: #fff7ed; color: #b45309; border-color: #fde0b6; }
    .pipelineStatusPill.status-customer-approved { background: #eef2ff; color: #4f46e5; border-color: #d6dcff; }
    .pipelineStatusPill.status-avel-approved { background: #e0f2fe; color: #0369a1; border-color: #bae6fd; }
    .pipelineStatusPill.status-offer-negotiation,
    .pipelineStatusPill.status-offer-negociation { background: #fff1f2; color: #c2410c; border-color: #fed7aa; }
    .pipelineStatusPill.status-offer-accepted { background: #ecfdf3; color: #15803d; border-color: #bbf7d0; }
    .pipelineStatusPill.status-hired { background: #dcfce7; color: #166534; border-color: #86efac; }
    .pipelineStatusPill.status-rejected { background: #fee2e2; color: #b91c1c; border-color: #fecaca; }
    .pipelineStatusPill.status-unknown { background: #f2f4f6; color: #4c5a61; border-color: #d1d9de; }
    .pipelineOriginPill {
        display: inline-block;
        padding: 1px 8px;
        border-radius: 999px;
        font-size: 10px;
        font-weight: 700;
        border: 1px solid #d4dde5;
        background: #f3f6f9;
        color: #607281;
    }
    .pipelineOriginPill--auto {
        background: #e8f7ef;
        border-color: #b7e1c8;
        color: #1f6f3c;
    }
    .pipelineNoteBlock {
        margin-top: 4px;
        padding: 4px 6px;
        border: 1px solid #dbe6ee;
        background: #f4f8fb;
        border-radius: 6px;
        color: #5f7683;
    }
    .pipelineInlineEmpty {
        border: 1px dashed #d3e0e9;
        border-radius: 8px;
        background: #fbfeff;
        color: #5f7683;
        padding: 9px 10px;
    }
</style>

<div class="pipelineInlineDetailsWrap">
    <div class="pipelineInlineHeader">
        <div class="pipelineInlineHeaderTitle">Status History</div>
        <div class="pipelineInlineHeaderActions">
            <a class="pipelineInlineActionLink" href="#" onclick="showPopWin('<?php echo(htmlspecialchars($fullDetailsURL, ENT_QUOTES)); ?>', 1220, 740, null); return false;">Open Full Details</a>
            <?php if ($canEditHistory): ?>
                <a class="pipelineInlineActionLink pipelinePurgeLink"
                    href="<?php echo(htmlspecialchars($purgeURL, ENT_QUOTES)); ?>"
                    data-candidate-joborder-id="<?php echo((int) $candidateJobOrderID); ?>"
                    data-html-object-id="<?php echo(htmlspecialchars($htmlObjectID, ENT_QUOTES)); ?>"
                    data-session-cookie="<?php echo(htmlspecialchars($_SESSION['CATS']->getCookie(), ENT_QUOTES)); ?>">
                    Purge Entry
                </a>
            <?php endif; ?>
        </div>
    </div>

    <div class="pipelineInlineSummary">
        <div class="pipelineInlineSummaryCard">
            <div class="pipelineInlineSummaryLabel">Transitions</div>
            <div class="pipelineInlineSummaryValue"><?php echo((int) $totalTransitions); ?></div>
        </div>
        <div class="pipelineInlineSummaryCard">
            <div class="pipelineInlineSummaryLabel">Auto</div>
            <div class="pipelineInlineSummaryValue"><?php echo((int) $autoTransitions); ?></div>
        </div>
        <div class="pipelineInlineSummaryCard">
            <div class="pipelineInlineSummaryLabel">Edited</div>
            <div class="pipelineInlineSummaryValue"><?php echo((int) $editedTransitions); ?></div>
        </div>
        <div class="pipelineInlineSummaryCard">
            <div class="pipelineInlineSummaryLabel">Latest</div>
            <div class="pipelineInlineSummaryValue pipelineInlineSummaryValueCompact"><?php echo(htmlspecialchars($latestTransitionDisplay)); ?></div>
        </div>
    </div>

    <?php if (empty($historyRows)): ?>
        <div class="pipelineInlineEmpty">No status history entries could be found.</div>
    <?php else: ?>
        <table class="pipelineInlineTable">
            <thead>
                <tr>
                    <th>Timestamp</th>
                    <th>Transition</th>
                    <th>Comment</th>
                    <th>Origin</th>
                    <?php if ($canEditHistory): ?>
                        <th>Action</th>
                    <?php endif; ?>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($historyRows as $statusHistory): ?>
                    <?php
                        $comment = trim($statusHistory['commentText']);
                        $auto = false;
                        if ($comment !== '' && strpos($comment, '[AUTO] ') === 0)
                        {
                            $auto = true;
                        }
                        if ((int) $statusHistory['commentIsSystem'] === 1)
                        {
                            $auto = true;
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

                        $statusFromSlug = strtolower($statusFrom);
                        $statusFromSlug = preg_replace('/[^a-z0-9]+/', '-', $statusFromSlug);
                        $statusFromSlug = trim($statusFromSlug, '-');
                        if ($statusFromSlug === '')
                        {
                            $statusFromSlug = 'unknown';
                        }
                        $statusToSlug = strtolower($statusTo);
                        $statusToSlug = preg_replace('/[^a-z0-9]+/', '-', $statusToSlug);
                        $statusToSlug = trim($statusToSlug, '-');
                        if ($statusToSlug === '')
                        {
                            $statusToSlug = 'unknown';
                        }
                    ?>
                    <tr>
                        <td><?php echo(htmlspecialchars($statusHistory['dateDisplay'])); ?></td>
                        <td>
                            <span class="pipelineStatusPill status-<?php echo($statusFromSlug); ?>"><?php echo(htmlspecialchars($statusFrom)); ?></span>
                            &nbsp;-&gt;&nbsp;
                            <span class="pipelineStatusPill status-<?php echo($statusToSlug); ?>"><?php echo(htmlspecialchars($statusTo)); ?></span>
                        </td>
                        <td>
                            <?php if ($comment !== ''): ?>
                                <div><?php echo(nl2br(htmlspecialchars($comment))); ?></div>
                            <?php else: ?>
                                <span style="color:#607684;">--</span>
                            <?php endif; ?>

                            <?php if (!empty($statusHistory['rejectionReasons']) || !empty($statusHistory['rejectionReasonOther'])): ?>
                                <div class="pipelineNoteBlock">
                                    <?php if (!empty($statusHistory['rejectionReasons'])): ?>
                                        <div>Rejection reasons: <?php echo(htmlspecialchars($statusHistory['rejectionReasons'])); ?></div>
                                    <?php endif; ?>
                                    <?php if (!empty($statusHistory['rejectionReasonOther'])): ?>
                                        <div>Other reason: <?php echo(htmlspecialchars($statusHistory['rejectionReasonOther'])); ?></div>
                                    <?php endif; ?>
                                </div>
                            <?php endif; ?>

                            <?php if (!empty($statusHistory['editedAt'])): ?>
                                <?php
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
                                ?>
                                <div class="pipelineNoteBlock">
                                    Edited by <?php echo(htmlspecialchars($editedByName)); ?> on <?php echo(htmlspecialchars($statusHistory['editedAtDisplay'])); ?>:
                                    <?php echo(htmlspecialchars($editNote)); ?>
                                </div>
                            <?php endif; ?>
                        </td>
                        <td>
                            <span class="pipelineOriginPill<?php echo($auto ? ' pipelineOriginPill--auto' : ''); ?>">
                                <?php echo($auto ? 'Auto' : 'Manual'); ?>
                            </span>
                        </td>
                        <?php if ($canEditHistory): ?>
                            <td>
                                <a class="pipelineInlineActionLink" href="javascript:void(0);" onclick="return PipelineStatusHistoryEdit(<?php echo((int) $statusHistory['historyID']); ?>, '<?php echo(addslashes($statusHistory['dateEdit'])); ?>', <?php echo((int) $candidateJobOrderID); ?>, '<?php echo($jsHtmlObjectID); ?>', '<?php echo($jsSessionCookie); ?>');">Edit</a>
                            </td>
                        <?php endif; ?>
                    </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
        <?php if ($canEditHistory): ?>
            <div style="margin-top:6px; color:#607684; font-size:11px;">
                Tip: use <b>Open Full Details</b> for bulk timeline edits and complete audit history.
            </div>
        <?php endif; ?>
    <?php endif; ?>
</div>
