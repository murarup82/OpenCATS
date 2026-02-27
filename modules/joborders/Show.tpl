<?php /* $Id: Show.tpl 3814 2007-12-06 17:54:28Z brian $ */
include_once('./vendor/autoload.php');
use OpenCATS\UI\QuickActionMenu;
?>
<?php if ($this->isPopup): ?>
    <?php TemplateUtility::printHeader('Job Order - '.$this->data['title'], array('js/sorttable.js', 'js/match.js', 'js/pipeline.js', 'js/attachment.js', 'js/mentionAutocomplete.js')); ?>
<?php else: ?>
    <?php TemplateUtility::printHeader('Job Order - '.$this->data['title'], array('js/sorttable.js', 'js/match.js', 'js/pipeline.js', 'js/attachment.js', 'js/mentionAutocomplete.js')); ?>
    <?php TemplateUtility::printHeaderBlock(); ?>
    <?php TemplateUtility::printTabs($this->active); ?>
        <div id="main">
            <?php TemplateUtility::printQuickSearch(); ?>
<?php endif; ?>

        <div id="contents"<?php echo TemplateUtility::getUI2WrapperAttribute(); ?>>
            <div class="ui2-page jobOrderShowPage">
                <div class="ui2-header">
                    <div class="ui2-header-title">
                        <table>
                            <tr>
                                <td width="3%">
                                    <img src="images/job_orders.gif" width="24" height="24" border="0" alt="Job Orders" style="margin-top: 3px;" />&nbsp;
                                </td>
                                <td><h2>Job Orders: Job Order Details</h2></td>
                            </tr>
                        </table>
                    </div>
                    <?php if (!$this->isPopup): ?>
                        <?php
                            $showJobOrderDangerActions =
                                ($this->getUserAccessLevel('joborders.delete') >= ACCESS_LEVEL_DELETE) ||
                                ($this->getUserAccessLevel('joborders.hidden') >= ACCESS_LEVEL_MULTI_SA);
                        ?>
                        <div class="ui2-header-actions">
                            <div class="ui2-action-group">
                                <?php if ($this->getUserAccessLevel('joborders.edit') >= ACCESS_LEVEL_EDIT): ?>
                                    <a id="edit_link" class="ui2-button ui2-button--primary" href="<?php echo(CATSUtility::getIndexName()); ?>?m=joborders&amp;a=edit&amp;jobOrderID=<?php echo($this->jobOrderID); ?>">
                                        <img src="images/actions/edit.gif" width="16" height="16" class="absmiddle" alt="edit" border="0" />Edit
                                    </a>
                                <?php endif; ?>
                                <?php if (!empty($this->data['public']) && $this->careerPortalEnabled): ?>
                                    <a id="public_link" class="ui2-button" href="<?php echo(CATSUtility::getAbsoluteURI()); ?>careers/<?php echo(CATSUtility::getIndexName()); ?>?p=showJob&amp;ID=<?php echo($this->jobOrderID); ?>">
                                        <img src="images/public.gif" width="16" height="16" class="absmiddle" alt="Online Application" border="0" />Online Application
                                    </a>
                                <?php endif; ?>
                                <a id="report_link" class="ui2-button" href="<?php echo(CATSUtility::getIndexName()); ?>?m=reports&amp;a=customizeJobOrderReport&amp;jobOrderID=<?php echo($this->jobOrderID); ?>">
                                    <img src="images/reportsSmall.gif" width="16" height="16" class="absmiddle" alt="report" border="0" />Generate Report
                                </a>
                                <?php if ($this->privledgedUser): ?>
                                    <a id="history_link" class="ui2-button" href="<?php echo(CATSUtility::getIndexName()); ?>?m=settings&amp;a=viewItemHistory&amp;dataItemType=400&amp;dataItemID=<?php echo($this->jobOrderID); ?>">
                                        <img src="images/icon_clock.gif" width="16" height="16" class="absmiddle"  border="0" />View History
                                    </a>
                                <?php endif; ?>
                                <?php if ($this->getUserAccessLevel('joborders.considerCandidateSearch') >= ACCESS_LEVEL_EDIT && !isset($this->frozen)): ?>
                                    <a id="add_candidate_to_joborder_link" class="ui2-button ui2-button--secondary" href="#" onclick="showPopWin('<?php echo(CATSUtility::getIndexName()); ?>?m=joborders&amp;a=considerCandidateSearch&amp;jobOrderID=<?php echo($this->jobOrderID); ?>', 1120, 760, null); return false;">
                                        <img src="images/consider.gif" width="16" height="16" class="absmiddle" alt="add candidate" border="0" />Add Candidate
                                    </a>
                                <?php endif; ?>
                            </div>
                            <?php if ($showJobOrderDangerActions): ?>
                                <div class="ui2-action-group ui2-action-group--danger">
                                    <?php if ($this->getUserAccessLevel('joborders.delete') >= ACCESS_LEVEL_DELETE): ?>
                                        <a id="delete_link" class="ui2-button ui2-button--danger" href="<?php echo(CATSUtility::getIndexName()); ?>?m=joborders&amp;a=delete&amp;jobOrderID=<?php echo($this->jobOrderID); ?>" onclick="javascript:return confirm('Delete this job order?');">
                                            <img src="images/actions/delete.gif" width="16" height="16" class="absmiddle" alt="delete" border="0" />Delete
                                        </a>
                                    <?php endif; ?>
                                    <?php if ($this->getUserAccessLevel('joborders.hidden') >= ACCESS_LEVEL_MULTI_SA): ?>
                                        <?php if ($this->data['isAdminHidden'] == 1): ?>
                                            <a class="ui2-button ui2-button--danger" href="<?php echo(CATSUtility::getIndexName()); ?>?m=joborders&amp;a=administrativeHideShow&amp;jobOrderID=<?php echo($this->jobOrderID); ?>&amp;state=0">
                                                <img src="images/resume_preview_inline.gif" width="16" height="16" class="absmiddle" alt="delete" border="0" />Administrative Show
                                            </a>
                                        <?php else: ?>
                                            <a class="ui2-button ui2-button--danger" href="<?php echo(CATSUtility::getIndexName()); ?>?m=joborders&amp;a=administrativeHideShow&amp;jobOrderID=<?php echo($this->jobOrderID); ?>&amp;state=1">
                                                <img src="images/resume_preview_inline.gif" width="16" height="16" class="absmiddle" alt="delete" border="0" />Administrative Hide
                                            </a>
                                        <?php endif; ?>
                                    <?php endif; ?>
                                </div>
                            <?php endif; ?>
                        </div>
                    <?php endif; ?>
                </div>

            <?php if ($this->data['isAdminHidden'] == 1): ?>
                <p class="warning">This Job Order is hidden.  Only CATS Administrators can view it or search for it.  To make it visible by the site users, click <a href="<?php echo(CATSUtility::getIndexName()); ?>?m=joborders&amp;a=administrativeHideShow&amp;jobOrderID=<?php echo($this->jobOrderID); ?>&amp;state=0" style="font-weight:bold;">Here.</a></p>
            <?php endif; ?>

            <?php if (isset($this->frozen)): ?>
                <table style="font-weight:bold; border: 1px solid #000; background-color: #ffed1a; padding:5px; margin-bottom:7px;" width="100%" id="candidateAlreadyInSystemTable">
                    <tr>
                        <td class="tdVertical">
                            This Job Order is <?php $this->_($this->data['status']); ?> and can not be modified.
                           <?php if ($this->getUserAccessLevel('joborders.edit') >= ACCESS_LEVEL_EDIT): ?>
                               <a id="edit_link" class="ui2-button ui2-button--secondary" href="<?php echo(CATSUtility::getIndexName()); ?>?m=joborders&amp;a=edit&amp;jobOrderID=<?php echo($this->jobOrderID); ?>">
                                   <img src="images/actions/edit.gif" width="16" height="16" class="absmiddle" alt="edit" border="0" />Edit
                               </a>
                               the Job Order to make it Active.&nbsp;&nbsp;
                           <?php endif; ?>
                        </td>
                    </tr>
                </table>
            <?php endif; ?>

            <style type="text/css">
                .jobOrderShowPage
                {
                    max-width: 1480px;
                    margin: 0 auto;
                    padding-bottom: 18px;
                }

                .jobOrderShowPage .ui2-header
                {
                    border: 1px solid #d8e5ec;
                    border-radius: 12px;
                    background: #ffffff;
                    box-shadow: 0 1px 3px rgba(13, 45, 72, 0.06);
                    padding: 10px 12px;
                    margin-bottom: 10px;
                }

                .jobOrderShowPage .ui2-grid
                {
                    gap: 10px;
                }

                .jobOrderShowPage .ui2-col-main,
                .jobOrderShowPage .ui2-col-side
                {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .jobOrderShowPage .ui2-card
                {
                    border: 1px solid #d8e5ec;
                    border-radius: 12px;
                    background: #ffffff;
                    box-shadow: 0 1px 3px rgba(13, 45, 72, 0.06);
                    overflow: hidden;
                    padding: 0;
                }

                .jobOrderShowPage .ui2-card-header
                {
                    background: #f3f8fb;
                    border-bottom: 1px solid #d8e5ec;
                    padding: 9px 12px;
                    margin-bottom: 0;
                }

                .jobOrderShowPage .ui2-card-title
                {
                    font-size: 14px;
                    color: #124f66;
                }

                .jobOrderShowPage .ui2-card--section
                {
                    margin-bottom: 0;
                }

                .jobOrderShowPage .ui2-details-table
                {
                    border-color: #dce6ec;
                }

                .jobOrderShowPage .ui2-details-table .vertical
                {
                    width: 168px;
                    background: #f9fcfe;
                    color: #3f6170;
                    font-weight: bold;
                }

                .jobOrderShowPage .ui2-details-table .data
                {
                    color: #1e3843;
                }

                .jobOrderShowPage .ui2-table th
                {
                    background: #0f6886;
                    border: 1px solid #0f6886;
                    color: #ffffff;
                }

                .jobOrderShowPage .ui2-table td
                {
                    border-color: #dce6ec;
                }

                .jobOrderShowSummary
                {
                    display: grid;
                    grid-template-columns: repeat(4, minmax(180px, 1fr));
                    gap: 10px;
                    margin: 0 0 10px 0;
                }

                .jobOrderShowMetric
                {
                    border: 1px solid #d8e5ec;
                    border-radius: 12px;
                    background: #ffffff;
                    padding: 11px;
                    box-shadow: 0 1px 3px rgba(13, 45, 72, 0.06);
                }

                .jobOrderShowMetricLabel
                {
                    color: #486777;
                    font-size: 12px;
                    margin-bottom: 4px;
                }

                .jobOrderShowMetricValue
                {
                    font-size: 26px;
                    color: #0a4f69;
                    font-weight: bold;
                    line-height: 1.05;
                }

                .jobOrderShowMetricMeta
                {
                    margin-top: 5px;
                    color: #5f7380;
                    font-size: 11px;
                }

                .jobOrderShowName
                {
                    font-weight: bold;
                    color: #0a4f69;
                }

                .jobOrderShowPublicNotice
                {
                    margin: 0 0 10px 0;
                    border: 1px solid #cde0e8;
                    border-radius: 12px;
                    padding: 10px 12px;
                    background: linear-gradient(90deg, #f6fbfd 0%, #ffffff 100%);
                    color: #1f4f63;
                }

                .jobOrderShowSectionActions
                {
                    padding: 9px 12px;
                    border-top: 1px solid #dce6ec;
                    background: #f9fcfe;
                }

                .jobOrderShowSectionActions a
                {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                }

                .jobOrderShowInlineTools
                {
                    margin: 0;
                    padding: 9px 12px;
                    border-bottom: 1px solid #dce6ec;
                    background: #f9fcfe;
                }

                .jobOrderShowPipelineFooter
                {
                    padding: 8px 12px 10px 12px;
                    border-top: 1px solid #dce6ec;
                    background: #f9fcfe;
                }

                .jobOrderShowPage .pipelineClosedTag
                {
                    display: inline-block;
                    margin-left: 6px;
                    padding: 1px 7px;
                    border-radius: 999px;
                    border: 1px solid #d6dde3;
                    background: #f4f7f9;
                    color: #5b6770;
                    font-size: 10px;
                    line-height: 1.5;
                    text-transform: uppercase;
                }

                @media (max-width: 1200px)
                {
                    .jobOrderShowSummary
                    {
                        grid-template-columns: repeat(2, minmax(180px, 1fr));
                    }
                }

                @media (max-width: 760px)
                {
                    .jobOrderShowSummary
                    {
                        grid-template-columns: 1fr;
                    }
                }

                .jobOrderCommentsBadge
                {
                    display: inline-block;
                    margin-left: 8px;
                    min-width: 20px;
                    padding: 1px 7px;
                    border-radius: 999px;
                    background: #e9f7ee;
                    border: 1px solid #9ecab1;
                    color: #1f6f3c;
                    font-size: 11px;
                    line-height: 16px;
                    text-align: center;
                    font-weight: bold;
                    vertical-align: middle;
                }

                #jobOrderCommentsToggleButton.jobOrderCommentsHasItems
                {
                    background: #e8f7ef;
                    border-color: #8cc8a4;
                    color: #1f6f3c;
                    font-weight: 600;
                }

                #jobOrderCommentsToggleButton.jobOrderCommentsHasItems.is-open
                {
                    background: #ffeef5;
                    border-color: #e5a6c1;
                    color: #8c2e58;
                }
            </style>

            <?php
                $jobOrderPipelineCount = isset($this->data['pipeline']) ? (int) $this->data['pipeline'] : 0;
                $jobOrderSubmittedCount = isset($this->data['submitted']) ? (int) $this->data['submitted'] : 0;
                $jobOrderOpeningsTotal = isset($this->data['openings']) ? (int) $this->data['openings'] : 0;
                $jobOrderOpeningsAvailable = isset($this->data['openingsAvailable']) ? (int) $this->data['openingsAvailable'] : 0;
                $jobOrderDaysOld = isset($this->data['daysOld']) ? (int) $this->data['daysOld'] : 0;
                $jobOrderAttachmentCount = is_array($this->attachmentsRS) ? count($this->attachmentsRS) : 0;
                $jobOrderHiringPlanRows = is_array($this->hiringPlanRS) ? count($this->hiringPlanRS) : 0;
            ?>
            <div class="jobOrderShowSummary">
                <div class="jobOrderShowMetric">
                    <div class="jobOrderShowMetricLabel">Openings</div>
                    <div class="jobOrderShowMetricValue"><?php echo((int) $jobOrderOpeningsTotal); ?></div>
                    <div class="jobOrderShowMetricMeta">Available now: <?php echo((int) $jobOrderOpeningsAvailable); ?></div>
                </div>
                <div class="jobOrderShowMetric">
                    <div class="jobOrderShowMetricLabel">Pipeline Candidates</div>
                    <div class="jobOrderShowMetricValue"><?php echo((int) $jobOrderPipelineCount); ?></div>
                    <div class="jobOrderShowMetricMeta">Proposed to customer: <?php echo((int) $jobOrderSubmittedCount); ?></div>
                </div>
                <div class="jobOrderShowMetric">
                    <div class="jobOrderShowMetricLabel">Days Open</div>
                    <div class="jobOrderShowMetricValue"><?php echo((int) $jobOrderDaysOld); ?></div>
                    <div class="jobOrderShowMetricMeta">Current status: <?php $this->_($this->data['status']); ?></div>
                </div>
                <div class="jobOrderShowMetric">
                    <div class="jobOrderShowMetricLabel">Attachments</div>
                    <div class="jobOrderShowMetricValue"><?php echo((int) $jobOrderAttachmentCount); ?></div>
                    <div class="jobOrderShowMetricMeta">Hiring plan entries: <?php echo((int) $jobOrderHiringPlanRows); ?></div>
                </div>
            </div>

            <div class="ui2-grid">
                <div class="ui2-col-main">
                    <div class="ui2-card ui2-card--section">
                        <div class="ui2-card-header">
                            <div class="ui2-card-title">Job Order Details</div>
                        </div>
                        <table class="detailsInside ui2-details-table" height="100%">
                            <tr>
                                <td class="vertical">Title:</td>
                                <td class="data" width="300">
                                    <span class="jobOrderShowName <?php echo($this->data['titleClass']); ?>"><?php $this->_($this->data['title']); ?></span>
                                    <?php echo($this->data['public']) ?>
                                    <?php TemplateUtility::printSingleQuickActionMenu(new QuickActionMenu(DATA_ITEM_JOBORDER, $this->data['jobOrderID'], $_SESSION['CATS']->getAccessLevel('joborders.edit'))); ?>
                                </td>
                            </tr>

                            <tr>
                                <td class="vertical">Company Name:</td>
                                <td class="data">
                                    <a href="<?php echo(CATSUtility::getIndexName()); ?>?m=companies&amp;a=show&amp;companyID=<?php echo($this->data['companyID']); ?>">
                                        <?php echo($this->data['companyName']); ?>
                                    </a>
                                </td>
                            </tr>

                            <tr>
                                <td class="vertical">Department:</td>
                                <td class="data">
                                    <?php echo($this->data['department']); ?>
                                </td>
                            </tr>

                            <tr>
                                <td class="vertical">CATS Job ID:</td>
                                <td class="data" width="300"><?php $this->_($this->data['jobOrderID']); ?></td>
                            </tr>

                            <tr>
                                <td class="vertical">Company Job ID:</td>
                                <td class="data"><?php echo($this->data['companyJobID']); ?></td>
                            </tr>

                            <!-- CONTACT INFO -->
                            <tr>
                                <td class="vertical">Contact Name:</td>
                                <td class="data">
                                    <a href="<?php echo(CATSUtility::getIndexName()); ?>?m=contacts&amp;a=show&amp;contactID=<?php echo($this->data['contactID']); ?>">
                                        <?php echo($this->data['contactFullName']); ?>
                                    </a>
                                </td>
                            </tr>

                            <tr>
                                <td class="vertical">Contact Phone:</td>
                                <td class="data"><?php echo($this->data['contactWorkPhone']); ?></td>
                            </tr>

                            <tr>
                                <td class="vertical">Contact Email:</td>
                                <td class="data">
                                    <a href="mailto:<?php $this->_($this->data['contactEmail']); ?>"><?php $this->_($this->data['contactEmail']); ?></a>
                                </td>
                            </tr>
                            <!-- /CONTACT INFO -->

                            <tr>
                                <td class="vertical">Location:</td>
                                <td class="data"><?php $this->_($this->data['cityAndState']); ?></td>
                            </tr>

                            <tr>
                                <td class="vertical">Max Rate:</td>
                                <td class="data"><?php $this->_($this->data['maxRate']); ?></td>
                            </tr>

                            <tr>
                                <td class="vertical">Salary:</td>
                                <td class="data"><?php $this->_($this->data['salary']); ?></td>
                            </tr>

                            <tr>
                                <td class="vertical">Start Date:</td>
                                <td class="data"><?php $this->_($this->data['startDate']); ?></td>
                            </tr>

                            <?php for ($i = 0; $i < intval(count($this->extraFieldRS)/2); $i++): ?>
                               <?php if(($this->extraFieldRS[$i]['extraFieldType']) != EXTRA_FIELD_TEXTAREA): ?>
                                   <tr>
                                        <td class="vertical"><?php $this->_($this->extraFieldRS[$i]['fieldName']); ?>:</td>
                                        <td class="data"><?php echo($this->extraFieldRS[$i]['display']); ?></td>
                                   </tr>
                                <?php endif; ?>
                            <?php endfor; ?>

                            <?php eval(Hooks::get('JO_TEMPLATE_SHOW_BOTTOM_OF_LEFT')); ?>

                        </table>
                    </div>
                </div>
                <div class="ui2-col-side">
                    <div class="ui2-card ui2-card--section">
                        <div class="ui2-card-header">
                            <div class="ui2-card-title">Status &amp; Ownership</div>
                        </div>
                        <table class="detailsInside ui2-details-table" height="100%">
                            <tr>
                                <td class="vertical">Duration:</td>
                                <td class="data"><?php $this->_($this->data['duration']); ?></td>
                            </tr>

                            <tr>
                                <td class="vertical">Openings:</td>
                                <td class="data"><?php $this->_($this->data['openings']); if ($this->data['openingsAvailable'] != $this->data['openings']): ?> (<?php $this->_($this->data['openingsAvailable']); ?> Available)<?php endif; ?></td>
                            </tr>

                            <tr>
                                <td class="vertical">Type:</td>
                                <td class="data"><?php $this->_($this->data['typeDescription']); ?></td>
                            </tr>

                            <tr>
                                <td class="vertical">Status:</td>
                                <td class="data"><?php $this->_($this->data['status']); ?></td>
                            </tr>

                            <tr>
                                <td class="vertical">Candidates:</td>
                                <td class="data"><?php $this->_($this->data['pipeline']) ?></td>
                            </tr>

                            <tr>
                                <td class="vertical">Proposed to Customer:</td>
                                <td class="data"><?php $this->_($this->data['submitted']) ?></td>
                            </tr>

                            <tr>
                                <td class="vertical">Days Old:</td>
                                <td class="data"><?php $this->_($this->data['daysOld']); ?></td>
                            </tr>

                            <tr>
                                <td class="vertical">Created:</td>
                                <td class="data"><?php $this->_($this->data['dateCreated']); ?> (<?php $this->_($this->data['enteredByFullName']); ?>)</td>
                            </tr>

                            <tr>
                                <td class="vertical">Recruiter:</td>
                                <td class="data"><?php $this->_($this->data['recruiterFullName']); ?></td>
                            </tr>

                            <tr>
                                <td class="vertical">Owner:</td>
                                <td class="data"><?php $this->_($this->data['ownerFullName']); ?></td>
                            </tr>

                            <?php for ($i = (intval(count($this->extraFieldRS))/2); $i < (count($this->extraFieldRS)); $i++): ?>
                                <?php if(($this->extraFieldRS[$i]['extraFieldType']) != EXTRA_FIELD_TEXTAREA): ?>
                                    <tr>
                                        <td class="vertical"><?php $this->_($this->extraFieldRS[$i]['fieldName']); ?>:</td>
                                        <td class="data"><?php echo($this->extraFieldRS[$i]['display']); ?></td>
                                    </tr>
                                <?php endif; ?>
                            <?php endfor; ?>

                            <?php eval(Hooks::get('JO_TEMPLATE_SHOW_BOTTOM_OF_RIGHT')); ?>
                        </table>
                    </div>
                </div>
            </div>

            <?php if ($this->isPublic): ?>
            <div class="jobOrderShowPublicNotice">
                <b>This job order is public<?php if ($this->careerPortalURL === false): ?>.</b><?php else: ?>
                    and will be shown on your
                    <?php if ($this->getUserAccessLevel('joborders.careerPortalUrl') >= ACCESS_LEVEL_SA): ?>
                        <a style="font-weight: bold;" href="<?php $this->_($this->careerPortalURL); ?>">Careers Website</a>.
                    <?php else: ?>
                        Careers Website.
                    <?php endif; ?></b>
                <?php endif; ?>

                <?php if ($this->questionnaireID !== false): ?>
                    <br />Applicants must complete the "<i><?php echo $this->questionnaireData['title']; ?></i>" (<a href="<?php echo CATSUtility::getIndexName(); ?>?m=settings&a=careerPortalQuestionnaire&questionnaireID=<?php echo $this->questionnaireID; ?>">edit</a>) questionnaire when applying.
                <?php else: ?>
                    <br />You have not attached any
                    <?php if ($this->getUserAccessLevel('setting.carrerPortalSettings') >= ACCESS_LEVEL_SA): ?>
                        <a href="<?php echo CATSUtility::getIndexName(); ?>?m=settings&a=careerPortalSettings">Questionnaires</a>.
                    <?php else: ?>
                        Questionnaires.
                    <?php endif; ?>
                <?php endif; ?>
            </div>
            <?php endif; ?>

            <div class="ui2-card ui2-card--section">
                <div class="ui2-card-header">
                    <div class="ui2-card-title">Description, Notes &amp; Attachments</div>
                </div>
                <table class="detailsOutside ui2-details-table">
                    <tr>
                        <td>
                            <table class="detailsInside ui2-details-table">
                            <tr>
                                <td valign="top" class="vertical">Attachments:</td>
                                <td valign="top" class="data">
                                    <table class="attachmentsTable ui2-attachments-table">
                                        <?php foreach ($this->attachmentsRS as $rowNumber => $attachmentsData): ?>
                                            <tr>
                                                <td>
                                                    <?php echo $attachmentsData['retrievalLink']; ?>
                                                        <img src="<?php $this->_($attachmentsData['attachmentIcon']) ?>" alt="" width="16" height="16" border="0" />
                                                        &nbsp;
                                                        <?php $this->_($attachmentsData['originalFilename']) ?>
                                                    </a>
                                                </td>
                                                <td><?php $this->_($attachmentsData['dateCreated']) ?></td>
                                                <td>
                                                    <?php if (!$this->isPopup): ?>
                                                        <?php if ($this->getUserAccessLevel('joborders.deleteAttachment') >= ACCESS_LEVEL_DELETE): ?>
                                                            <form method="post" action="<?php echo(CATSUtility::getIndexName()); ?>?m=joborders&amp;a=deleteAttachment" style="display:inline;" onsubmit="javascript:return confirm('Delete this attachment?');">
                                                                <input type="hidden" name="jobOrderID" value="<?php echo($this->jobOrderID); ?>" />
                                                                <input type="hidden" name="attachmentID" value="<?php $this->_($attachmentsData['attachmentID']); ?>" />
                                                                <input type="hidden" name="securityToken" value="<?php $this->_($this->deleteAttachmentToken); ?>" />
                                                                <button type="submit" class="ui2-button ui2-button--danger" title="Delete">
                                                                    <img src="images/actions/delete.gif" alt="" width="16" height="16" border="0" />
                                                                </button>
                                                            </form>
                                                        <?php endif; ?>
                                                    <?php endif; ?>
                                                </td>
                                            </tr>
                                        <?php endforeach; ?>
                                    </table>
                                    <?php if (!$this->isPopup): ?>
                                        <?php if ($this->getUserAccessLevel('joborders.createAttachment') >= ACCESS_LEVEL_EDIT): ?>
                                            <div class="jobOrderShowSectionActions">
                                                <?php if (isset($this->attachmentLinkHTML)): ?>
                                                    <?php echo($this->attachmentLinkHTML); ?>
                                                <?php else: ?>
                                                    <a class="ui2-button ui2-button--secondary" href="#" onclick="showPopWin('<?php echo(CATSUtility::getIndexName()); ?>?m=joborders&amp;a=createAttachment&amp;jobOrderID=<?php echo($this->jobOrderID); ?>', 400, 125, null); return false;">
                                                        <img src="images/paperclip_add.gif" width="16" height="16" border="0" alt="add attachment" class="absmiddle" />&nbsp;Add Attachment
                                                    </a>
                                                <?php endif; ?>
                                            </div>
                                        <?php endif; ?>
                                    <?php endif; ?>
                                </td>
                            </tr>

                            <tr>
                                <td valign="top" class="vertical">Description:</td>

                                <td class="data" colspan="2">
                                    <?php if($this->data['description'] != ''): ?>
                                    <div id="shortDescription" style="overflow: auto; height:170px; border: #AAA 1px solid; padding:5px;">
                                        <?php echo($this->data['description']); ?>
                                    </div>
                                    <?php endif; ?>
                                </td>

                            </tr>
                
                            <?php for ($i = (intval(count($this->extraFieldRS))/2); $i < (count($this->extraFieldRS)); $i++): ?>
                                <?php if(($this->extraFieldRS[$i]['extraFieldType']) == EXTRA_FIELD_TEXTAREA): ?>
                                    <tr>
                                        <td class="vertical"><?php $this->_($this->extraFieldRS[$i]['fieldName']); ?>:</td>
                                        <td class="data"><?php echo($this->extraFieldRS[$i]['display']); ?></td>
                                    </tr>
                                <?php endif; ?>
                            <?php endfor; ?>

                            <tr>
                                <td valign="top" class="vertical">Internal Notes:</td>

                                <td class="data" style="width:320px;">
                                    <?php if($this->data['notes'] != ''): ?>
                                        <div id="shortDescription" style="overflow: auto; height:240px; border: #AAA 1px solid; padding:5px;">
                                            <?php echo($this->data['notes']); ?>
                                        </div>
                                    <?php endif; ?>
                                </td>

                                <td style="vertical-align:top;">
                                    <?php echo($this->pipelineGraph);  ?>
                                </td>

                            </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </div>

            <div class="ui2-card ui2-card--section" id="jobOrderCommentsSection">
                <div class="ui2-card-header">
                    <div class="ui2-card-title">
                        Team Comments
                        <?php if ((int) $this->jobOrderCommentCount > 0): ?>
                            <span class="jobOrderCommentsBadge"><?php echo((int) $this->jobOrderCommentCount); ?></span>
                        <?php endif; ?>
                    </div>
                    <div class="ui2-card-actions">
                        <?php if (!empty($this->canAddJobOrderComment)): ?>
                            <button
                                type="button"
                                class="ui2-button ui2-button--secondary"
                                onclick="JobOrderComments_openComposer();"
                            >Add Comment</button>
                        <?php endif; ?>
                        <button
                            type="button"
                            class="ui2-button ui2-button--secondary<?php if ((int) $this->jobOrderCommentCount > 0): ?> jobOrderCommentsHasItems<?php endif; ?><?php if (!empty($this->jobOrderCommentsInitiallyOpen) && (int) $this->jobOrderCommentCount > 0): ?> is-open<?php endif; ?>"
                            id="jobOrderCommentsToggleButton"
                            data-has-comments="<?php echo(((int) $this->jobOrderCommentCount > 0) ? '1' : '0'); ?>"
                            onclick="JobOrderComments_toggle();"
                        ><?php if (!empty($this->jobOrderCommentsInitiallyOpen)): ?>Hide<?php else: ?>Show<?php endif; ?> Comments (<?php echo((int) $this->jobOrderCommentCount); ?>)</button>
                    </div>
                </div>
                <?php if (!empty($this->jobOrderCommentFlashMessage)): ?>
                    <div
                        class="ui2-ai-status"
                        style="margin-top: 8px; <?php if (!empty($this->jobOrderCommentFlashIsError)): ?>color: #b00000; border-left-color: #b00000;<?php endif; ?>"
                    >
                        <?php $this->_($this->jobOrderCommentFlashMessage); ?>
                    </div>
                <?php endif; ?>
                <div
                    id="jobOrderCommentsPanel"
                    style="<?php if (empty($this->jobOrderCommentsInitiallyOpen)) echo('display: none;'); ?> margin-top: 8px;"
                >
                    <?php if (!empty($this->canAddJobOrderComment)): ?>
                        <form method="post" action="<?php echo(CATSUtility::getIndexName()); ?>?m=joborders&amp;a=addProfileComment">
                            <input type="hidden" name="jobOrderID" value="<?php echo($this->jobOrderID); ?>" />
                            <input type="hidden" name="securityToken" value="<?php $this->_($this->addCommentToken); ?>" />
                            <table class="detailsInside ui2-details-table" style="margin-bottom: 8px;">
                                <tr>
                                    <td class="vertical" style="width: 130px;">Comment Type:</td>
                                    <td class="data">
                                        <select name="commentCategory" class="ui2-select">
                                            <?php foreach ($this->jobOrderCommentCategories as $commentCategory): ?>
                                                <option value="<?php echo(htmlspecialchars($commentCategory, ENT_QUOTES)); ?>"><?php $this->_($commentCategory); ?></option>
                                            <?php endforeach; ?>
                                        </select>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="vertical">Comment:</td>
                                    <td class="data">
                                        <textarea
                                            name="commentText"
                                            id="jobOrderCommentText"
                                            class="ui2-textarea"
                                            rows="6"
                                            style="width: 100%; min-height: 160px;"
                                            maxlength="4000"
                                            required="required"
                                        ></textarea>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="vertical"></td>
                                    <td class="data">
                                        <button type="submit" class="ui2-button ui2-button--primary">Save Comment</button>
                                    </td>
                                </tr>
                            </table>
                        </form>
                    <?php endif; ?>

                    <table class="ui2-table">
                        <tr>
                            <th align="left" width="150">Date</th>
                            <th align="left" width="140">Entered By</th>
                            <th align="left" width="160">Type</th>
                            <th align="left">Comment</th>
                        </tr>
                        <?php if (!empty($this->jobOrderComments)): ?>
                            <?php foreach ($this->jobOrderComments as $rowNumber => $jobOrderComment): ?>
                                <tr class="<?php TemplateUtility::printAlternatingRowClass($rowNumber); ?>">
                                    <td valign="top"><?php $this->_($jobOrderComment['dateCreated']); ?></td>
                                    <td valign="top"><?php $this->_($jobOrderComment['enteredBy']); ?></td>
                                    <td valign="top"><span class="pipelineClosedTag"><?php $this->_($jobOrderComment['category']); ?></span></td>
                                    <td valign="top"><?php echo($jobOrderComment['commentHTML']); ?></td>
                                </tr>
                            <?php endforeach; ?>
                        <?php else: ?>
                            <tr>
                                <td colspan="4">(No comments yet)</td>
                            </tr>
                        <?php endif; ?>
                    </table>
                </div>
            </div>

            <div class="ui2-card ui2-card--section" id="jobOrderMessagesSection">
                <div class="ui2-card-header">
                    <div class="ui2-card-title">Team Inbox (Internal)</div>
                    <?php if (!empty($this->jobOrderMessagingEnabled)): ?>
                        <div class="ui2-card-actions">
                            <button
                                type="button"
                                class="ui2-button ui2-button--secondary"
                                onclick="JobOrderMessages_openComposer();"
                            >New Message</button>
                            <button
                                type="button"
                                class="ui2-button ui2-button--secondary"
                                id="jobOrderMessagesToggleButton"
                                onclick="JobOrderMessages_toggle();"
                            ><?php if (!empty($this->jobOrderMessagesInitiallyOpen)): ?>Hide<?php else: ?>Show<?php endif; ?> Thread</button>
                            <?php if (!empty($this->jobOrderMessageThreadID) && !empty($this->jobOrderThreadVisibleToCurrentUser)): ?>
                                <a class="ui2-button ui2-button--secondary" href="<?php echo(CATSUtility::getIndexName()); ?>?m=home&amp;a=inbox&amp;threadKey=<?php echo(rawurlencode('joborder:' . (int) $this->jobOrderMessageThreadID)); ?>">
                                    Open My Inbox
                                </a>
                                <?php if ($this->getUserAccessLevel('joborders.edit') >= ACCESS_LEVEL_EDIT): ?>
                                    <form method="post" action="<?php echo(CATSUtility::getIndexName()); ?>?m=joborders&amp;a=deleteMessageThread" style="display:inline;" onsubmit="return confirm('Delete this thread for all users? This cannot be undone. A new thread will start on next message.');">
                                        <input type="hidden" name="jobOrderID" value="<?php echo((int) $this->jobOrderID); ?>" />
                                        <input type="hidden" name="threadID" value="<?php echo((int) $this->jobOrderMessageThreadID); ?>" />
                                        <input type="hidden" name="securityToken" value="<?php $this->_($this->deleteJobOrderMessageThreadToken); ?>" />
                                        <button type="submit" class="ui2-button ui2-button--danger">Delete Thread</button>
                                    </form>
                                <?php endif; ?>
                            <?php else: ?>
                                <a class="ui2-button ui2-button--secondary" href="<?php echo(CATSUtility::getIndexName()); ?>?m=home&amp;a=inbox">
                                    Open My Inbox
                                </a>
                            <?php endif; ?>
                        </div>
                    <?php endif; ?>
                </div>
                <?php if (empty($this->jobOrderMessagingEnabled)): ?>
                    <div class="ui2-ai-status" style="margin-top: 8px; color:#b00000; border-left-color:#b00000;">
                        Messaging tables are missing. Apply schema migrations from Settings -> Schema Migrations.
                    </div>
                <?php else: ?>
                    <?php if (!empty($this->jobOrderMessageFlashMessage)): ?>
                        <div class="ui2-ai-status" style="margin-top: 8px; <?php if (!empty($this->jobOrderMessageFlashIsError)): ?>color:#b00000; border-left-color:#b00000;<?php endif; ?>">
                            <?php $this->_($this->jobOrderMessageFlashMessage); ?>
                        </div>
                    <?php endif; ?>
                    <div
                        id="jobOrderMessagesPanel"
                        style="<?php if (empty($this->jobOrderMessagesInitiallyOpen)) echo('display: none;'); ?> margin-top: 8px;"
                    >
                        <form method="post" action="<?php echo(CATSUtility::getIndexName()); ?>?m=joborders&amp;a=postMessage">
                            <input type="hidden" name="jobOrderID" value="<?php echo((int) $this->jobOrderID); ?>" />
                            <input type="hidden" name="securityToken" value="<?php $this->_($this->postJobOrderMessageToken); ?>" />
                            <table class="detailsInside ui2-details-table" style="margin-bottom: 8px;">
                                <tr>
                                    <td class="vertical" style="width: 130px;">Message:</td>
                                    <td class="data">
                                        <textarea
                                            name="messageBody"
                                            id="jobOrderMessageBody"
                                            class="ui2-textarea"
                                            rows="6"
                                            style="width: 100%; min-height: 160px;"
                                            maxlength="4000"
                                            required="required"
                                            placeholder="Type a message and mention teammates with @First Last."
                                        ></textarea>
                                    </td>
                                </tr>
                                <?php if (!empty($this->jobOrderMessageMentionHintNames)): ?>
                                    <tr>
                                        <td class="vertical">Mention Help:</td>
                                        <td class="data">
                                            <?php foreach ($this->jobOrderMessageMentionHintNames as $hintIndex => $mentionHintName): ?>
                                                <?php if ($hintIndex > 0): ?>, <?php endif; ?>
                                                @<?php $this->_($mentionHintName); ?>
                                            <?php endforeach; ?>
                                        </td>
                                    </tr>
                                <?php endif; ?>
                                <tr>
                                    <td class="vertical"></td>
                                    <td class="data">
                                        <button type="submit" class="ui2-button ui2-button--primary">Send Message</button>
                                    </td>
                                </tr>
                            </table>
                        </form>

                        <?php if (!empty($this->jobOrderMessageThreadID) && empty($this->jobOrderThreadVisibleToCurrentUser)): ?>
                            <div class="ui2-ai-status" style="margin-top: 8px;">
                                You are not part of this thread yet. Send a message and mention teammates to start collaborating.
                            </div>
                        <?php elseif (!empty($this->jobOrderThreadVisibleToCurrentUser)): ?>
                            <table class="ui2-table">
                                <tr>
                                    <th align="left" width="150">Date</th>
                                    <th align="left" width="140">From</th>
                                    <th align="left" width="180">Mentions</th>
                                    <th align="left">Message</th>
                                </tr>
                                <?php if (!empty($this->jobOrderThreadMessages)): ?>
                                    <?php foreach ($this->jobOrderThreadMessages as $rowNumber => $threadMessage): ?>
                                        <tr class="<?php TemplateUtility::printAlternatingRowClass($rowNumber); ?>">
                                            <td valign="top"><?php $this->_($threadMessage['dateCreated']); ?></td>
                                            <td valign="top"><?php $this->_($threadMessage['senderName']); ?></td>
                                            <td valign="top"><?php if (!empty($threadMessage['mentionedUsers'])) $this->_($threadMessage['mentionedUsers']); else echo('--'); ?></td>
                                            <td valign="top"><?php echo($threadMessage['bodyHTML']); ?></td>
                                        </tr>
                                    <?php endforeach; ?>
                                <?php else: ?>
                                    <tr>
                                        <td colspan="4">(No messages yet)</td>
                                    </tr>
                                <?php endif; ?>
                            </table>
                        <?php endif; ?>
                    </div>
                <?php endif; ?>
            </div>

            <div class="ui2-card ui2-card--section">
                <div class="ui2-card-header">
                    <div class="ui2-card-title">Hiring Plan</div>
                            <?php if (!$this->isPopup && $this->getUserAccessLevel('joborders.edit') >= ACCESS_LEVEL_EDIT): ?>
                        <div class="ui2-card-actions">
                            <a class="ui2-button ui2-button--secondary" href="<?php echo($this->hiringPlanLink); ?>">Edit Hiring Plan</a>
                        </div>
                    <?php endif; ?>
                </div>
                <table class="detailsInside ui2-table">
                            <?php if (empty($this->hiringPlanRS)): ?>
                                <tr>
                                    <td class="data">No hiring plan defined.</td>
                                </tr>
                            <?php else: ?>
                                <tr>
                                    <td class="vertical">Start Date</td>
                                    <td class="vertical">End Date</td>
                                    <td class="vertical">Openings</td>
                                    <td class="vertical">Priority</td>
                                    <td class="vertical">Notes</td>
                                </tr>
                                <?php foreach ($this->hiringPlanRS as $planRow): ?>
                                    <tr>
                                        <td class="data"><?php echo($planRow['startDate'] === '' ? '-' : htmlspecialchars($planRow['startDate'])); ?></td>
                                        <td class="data"><?php echo($planRow['endDate'] === '' ? '-' : htmlspecialchars($planRow['endDate'])); ?></td>
                                        <td class="data"><?php echo((int) $planRow['openings']); ?></td>
                                        <td class="data"><?php echo((int) $planRow['priority']); ?></td>
                                        <td class="data"><?php echo($planRow['notes'] === '' ? '-' : htmlspecialchars($planRow['notes'])); ?></td>
                                    </tr>
                                <?php endforeach; ?>
                                <tr>
                                    <td class="data" colspan="5">
                                        Total planned openings: <?php echo((int) $this->hiringPlanTotal); ?>
                                    </td>
                                </tr>
                            <?php endif; ?>
                </table>
            </div>
            <br clear="all" />
            <br />

            <div class="ui2-card ui2-card--section">
                <div class="ui2-card-header">
                    <div class="ui2-card-title">Candidate in Job Order</div>
                    <?php if (!$this->isPopup): ?>
                        <?php if ($this->getUserAccessLevel('joborders.considerCandidateSearch') >= ACCESS_LEVEL_EDIT && !isset($this->frozen)): ?>
                            <div class="ui2-card-actions">
                                <a class="ui2-button ui2-button--secondary" href="#" onclick="showPopWin('<?php echo(CATSUtility::getIndexName()); ?>?m=joborders&amp;a=considerCandidateSearch&amp;jobOrderID=<?php echo($this->jobOrderID); ?>', 1120, 760, null); return false;">
                                    <img src="images/consider.gif" width="16" height="16" class="absmiddle" alt="add candidate" border="0" />&nbsp;Add Candidate to This Job Order
                                </a>
                            </div>
                        <?php endif; ?>
                    <?php endif; ?>
                </div>
            <p id="ajaxPipelineControl" class="jobOrderShowInlineTools">
                Number of visible entries:&nbsp;&nbsp;
                <select id="numberOfEntriesSelect" onchange="PipelineJobOrder_changeLimit(<?php $this->_($this->data['jobOrderID']); ?>, this.value, <?php if ($this->isPopup) echo(1); else echo(0); ?>, 'ajaxPipelineTable', '<?php echo($this->sessionCookie); ?>', 'ajaxPipelineTableIndicator', '<?php echo(CATSUtility::getIndexName()); ?>');" class="selectBox">
                    <option value="15" <?php if ($this->pipelineEntriesPerPage == 15): ?>selected<?php endif; ?>>15 entries</option>
                    <option value="30" <?php if ($this->pipelineEntriesPerPage == 30): ?>selected<?php endif; ?>>30 entries</option>
                    <option value="50" <?php if ($this->pipelineEntriesPerPage == 50): ?>selected<?php endif; ?>>50 entries</option>
                    <option value="99999" <?php if ($this->pipelineEntriesPerPage == 99999): ?>selected<?php endif; ?>>All entries</option>
                </select>&nbsp;
                <label style="margin-left: 10px;">
                    <input type="checkbox" id="pipelineShowClosed" <?php if (!empty($this->showClosedPipeline)) echo('checked="checked"'); ?> onclick="PipelineJobOrder_populate(<?php $this->_($this->data['jobOrderID']); ?>, 0, <?php $this->_($this->pipelineEntriesPerPage); ?>, 'dateCreatedInt', 'desc', <?php if ($this->isPopup) echo(1); else echo(0); ?>, 'ajaxPipelineTable', '<?php echo($this->sessionCookie); ?>', 'ajaxPipelineTableIndicator', '<?php echo(CATSUtility::getIndexName()); ?>', PipelineJobOrder_getIncludeClosed());" />
                    Show Closed
                </label>
                <span id="ajaxPipelineNavigation">
                </span>&nbsp;
                <img src="images/indicator.gif" alt="" id="ajaxPipelineTableIndicator" />
            </p>

            <div id="ajaxPipelineTable"></div>
            <div class="jobOrderShowPipelineFooter">
                <label><input type="checkbox" name="select_all" onclick="selectAll_candidates(this)" title="Select all candidates" /> Select all candidates</label>
                &nbsp;&nbsp;
                <a class="ui2-button ui2-button--secondary" href="javascript:void(0);" onclick="exportFromPipeline()" title="Export selected candidates">Export</a>
            </div>
            <script type="text/javascript">
            	function exportFromPipeline(){
<?php
	$params = array(
			'sortBy' => 'dateModifiedSort',
			'sortDirection' => 'DESC',
	        'filterVisible' => false,
	        'rangeStart' => 0,
	        'maxResults' => 100000000,
	        'exportIDs' => '<dynamic>',
	        'noSaveParameters' => true);

	$instance_name = 'candidates:candidatesListByViewDataGrid';
	$instance_md5 = md5($instance_name);
?>
					var exportArray<?= $instance_md5 ?> = getSelected_candidates();
            		if (exportArray<?= $instance_md5 ?>.length>0) {
                		window.location.href='<?= CATSUtility::getIndexName()?>?m=export&a=exportByDataGrid&i=<?= urlencode($instance_name); ?>&p=<?= urlencode(serialize($params)) ?>&dynamicArgument<?= $instance_md5 ?>=' + urlEncode(serializeArray(exportArray<?= $instance_md5 ?>));
            		} else {
                		alert('No data selected');
            		}
            	}


            </script>
            <script type="text/javascript">
                PipelineJobOrder_populate(<?php $this->_($this->data['jobOrderID']); ?>, 0, <?php $this->_($this->pipelineEntriesPerPage); ?>, 'dateCreatedInt', 'desc', <?php if ($this->isPopup) echo(1); else echo(0); ?>, 'ajaxPipelineTable', '<?php echo($this->sessionCookie); ?>', 'ajaxPipelineTableIndicator', '<?php echo(CATSUtility::getIndexName()); ?>', <?php echo(!empty($this->showClosedPipeline) ? 1 : 0); ?>);
            </script>
            </div>
            </div>
            <script type="text/javascript">
                function JobOrderComments_toggle(forceOpen)
                {
                    var panel = document.getElementById('jobOrderCommentsPanel');
                    var button = document.getElementById('jobOrderCommentsToggleButton');
                    if (!panel || !button)
                    {
                        return;
                    }

                    var shouldOpen = (typeof forceOpen === 'boolean') ? forceOpen : (panel.style.display === 'none');
                    panel.style.display = shouldOpen ? '' : 'none';
                    button.innerHTML = button.innerHTML.replace(/^(Show|Hide)/, shouldOpen ? 'Hide' : 'Show');
                    button.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');

                    if (button.getAttribute('data-has-comments') === '1')
                    {
                        if (shouldOpen)
                        {
                            button.className += (button.className.indexOf(' is-open') === -1) ? ' is-open' : '';
                        }
                        else
                        {
                            button.className = button.className.replace(/\bis-open\b/g, '').replace(/\s{2,}/g, ' ').replace(/^\s+|\s+$/g, '');
                        }
                    }
                }

                function JobOrderComments_openComposer()
                {
                    JobOrderComments_toggle(true);
                    var textArea = document.getElementById('jobOrderCommentText');
                    if (textArea)
                    {
                        textArea.focus();
                    }
                }

                function JobOrderMessages_toggle(forceOpen)
                {
                    var panel = document.getElementById('jobOrderMessagesPanel');
                    var button = document.getElementById('jobOrderMessagesToggleButton');
                    if (!panel || !button)
                    {
                        return;
                    }

                    var shouldOpen = (typeof forceOpen === 'boolean') ? forceOpen : (panel.style.display === 'none');
                    panel.style.display = shouldOpen ? '' : 'none';
                    button.innerHTML = button.innerHTML.replace(/^(Show|Hide)/, shouldOpen ? 'Hide' : 'Show');
                }

                function JobOrderMessages_openComposer()
                {
                    JobOrderMessages_toggle(true);
                    var textArea = document.getElementById('jobOrderMessageBody');
                    if (textArea)
                    {
                        textArea.focus();
                    }
                }

                if (typeof MentionAutocomplete !== 'undefined')
                {
                    MentionAutocomplete.bind(
                        'jobOrderMessageBody',
                        <?php echo json_encode(isset($this->jobOrderMessageMentionAutocompleteValues) ? $this->jobOrderMessageMentionAutocompleteValues : array()); ?>
                    );
                }
            </script>
<?php if (!$this->isPopup): ?>
        </div>
    </div>
<?php endif; ?>
<?php TemplateUtility::printFooter(); ?>

