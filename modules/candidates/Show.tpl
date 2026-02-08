<?php /* $Id: Show.tpl 3814 2007-12-06 17:54:28Z brian $ */
include_once('./vendor/autoload.php');
use OpenCATS\UI\CandidateQuickActionMenu;
use OpenCATS\UI\CandidateDuplicateQuickActionMenu;
?>
<?php if ($this->isPopup): ?>
    <?php TemplateUtility::printHeader('Candidate - '.$this->data['firstName'].' '.$this->data['lastName'], array( 'js/sorttable.js', 'js/match.js', 'js/lib.js', 'js/pipeline.js', 'js/attachment.js', 'modules/candidates/quickAction-candidates.js', 'modules/candidates/transformCv.js', 'modules/candidates/gdprRequest.js')); ?>
<?php else: ?>
    <?php TemplateUtility::printHeader('Candidate - '.$this->data['firstName'].' '.$this->data['lastName'], array( 'js/sorttable.js', 'js/match.js', 'js/lib.js', 'js/pipeline.js', 'js/attachment.js', 'modules/candidates/quickAction-candidates.js', 'modules/candidates/quickAction-duplicates.js', 'modules/candidates/transformCv.js', 'modules/candidates/gdprRequest.js')); ?>
    
    <?php TemplateUtility::printHeaderBlock(); ?>
    <?php TemplateUtility::printTabs($this->active); ?>
        <div id="main">
            <?php TemplateUtility::printQuickSearch(); ?>
<?php endif; ?>

        <div id="contents"<?php echo TemplateUtility::getUI2WrapperAttribute(); ?>>
            <div class="ui2-page">
                <div class="ui2-header">
                    <div class="ui2-header-title">
                        <table>
                            <tr>
                                <td width="3%">
                                    <img src="images/candidate.gif" width="24" height="24" border="0" alt="Candidates" style="margin-top: 3px;" />&nbsp;
                                </td>
                                <td><h2>Candidates: Candidate Details
                                    <?php if($_SESSION['CATS']->getAccessLevel('candidates.duplicates') >= ACCESS_LEVEL_SA): ?>
                                        <?php if(!empty($this->data['isDuplicate'])): ?>
                                            <img src="images/wf_error.gif" alt="duplicate_warning" width="20" height="20" border="0" title="Possible duplicate" />
                                            <?php foreach($this->data['isDuplicate'] as $item): ?>
                                                <?php echo '<a href='.CATSUtility::getIndexName().'?m=candidates&amp;a=show&amp;candidateID='.$item['duplicateTo'].' target=_blank>Duplicate</a>' ?>
                                                <?php TemplateUtility::printSingleQuickActionMenu(new CandidateDuplicateQuickActionMenu(
                                                    DATA_ITEM_DUPLICATE,
                                                    $this->data['candidateID'],
                                                    $_SESSION['CATS']->getAccessLevel('candidates.duplicates'),
                                                    urlencode(CATSUtility::getIndexName().'?m=candidates&a=merge&oldCandidateID='.$item['duplicateTo'].'&newCandidateID='.$this->data['candidateID']),
                                                    urlencode(CATSUtility::getIndexName().'?m=candidates&a=removeDuplicity&oldCandidateID='.$item['duplicateTo'].'&newCandidateID='.$this->data['candidateID']
                                                ))); ?>
                                            <?php endforeach; ?>
                                        <?php endif; ?>
                                    <?php endif; ?>
                                </h2></td>
                           </tr>
                        </table>
                    </div>
                    <?php if (!$this->isPopup): ?>
                        <?php
                            $showCandidateDangerActions =
                                ($this->getUserAccessLevel('candidates.delete') >= ACCESS_LEVEL_DELETE) ||
                                ($this->getUserAccessLevel('candidates.administrativeHideShow') >= ACCESS_LEVEL_MULTI_SA) ||
                                ($this->getUserAccessLevel('candidates.duplicates') >= ACCESS_LEVEL_SA);
                        ?>
                        <div class="ui2-header-actions">
                            <div class="ui2-action-group">
                                <?php if ($this->getUserAccessLevel('candidates.edit') >= ACCESS_LEVEL_EDIT): ?>
                                    <a id="edit_link" class="ui2-button ui2-button--primary" href="<?php echo(CATSUtility::getIndexName()); ?>?m=candidates&amp;a=edit&amp;candidateID=<?php echo($this->candidateID); ?>">
                                        <img src="images/actions/edit.gif" width="16" height="16" class="absmiddle" alt="edit" border="0" />Edit
                                    </a>
                                <?php endif; ?>
                                <?php if ($this->privledgedUser): ?>
                                    <a id="history_link" class="ui2-button" href="<?php echo(CATSUtility::getIndexName()); ?>?m=settings&amp;a=viewItemHistory&amp;dataItemType=100&amp;dataItemID=<?php echo($this->candidateID); ?>">
                                        <img src="images/icon_clock.gif" width="16" height="16" class="absmiddle"  border="0" />View History
                                    </a>
                                <?php endif; ?>
                                <a id="transform_cv_link" class="ui2-button" href="#" onclick="CandidateTransformCV.open(); return false;">
                                    <img src="images/parser/transfer.gif" width="16" height="16" class="absmiddle" alt="transform" border="0" />Transform CV
                                </a>
                            </div>
                            <?php if ($showCandidateDangerActions): ?>
                                <div class="ui2-action-group ui2-action-group--danger">
                                    <?php if ($this->getUserAccessLevel('candidates.delete') >= ACCESS_LEVEL_DELETE): ?>
                                        <a id="delete_link" class="ui2-button ui2-button--danger" href="<?php echo(CATSUtility::getIndexName()); ?>?m=candidates&amp;a=delete&amp;candidateID=<?php echo($this->candidateID); ?>" onclick="javascript:return confirm('Delete this candidate?');">
                                            <img src="images/actions/delete.gif" width="16" height="16" class="absmiddle" alt="delete" border="0" />Delete
                                        </a>
                                    <?php endif; ?>
                                    <?php if ($this->getUserAccessLevel('candidates.administrativeHideShow') >= ACCESS_LEVEL_MULTI_SA): ?>
                                        <?php if ($this->data['isAdminHidden'] == 1): ?>
                                            <a class="ui2-button ui2-button--danger" href="<?php echo(CATSUtility::getIndexName()); ?>?m=candidates&amp;a=administrativeHideShow&amp;candidateID=<?php echo($this->candidateID); ?>&amp;state=0">
                                                <img src="images/resume_preview_inline.gif" width="16" height="16" class="absmiddle" alt="delete" border="0" />Administrative Show
                                            </a>
                                        <?php else: ?>
                                            <a class="ui2-button ui2-button--danger" href="<?php echo(CATSUtility::getIndexName()); ?>?m=candidates&amp;a=administrativeHideShow&amp;candidateID=<?php echo($this->candidateID); ?>&amp;state=1">
                                                <img src="images/resume_preview_inline.gif" width="16" height="16" class="absmiddle" alt="delete" border="0" />Administrative Hide
                                            </a>
                                        <?php endif; ?>
                                    <?php endif; ?>
                                    <?php if ($this->getUserAccessLevel('candidates.duplicates') >= ACCESS_LEVEL_SA): ?>
                                        <a class="ui2-button ui2-button--danger" href="#" onclick="showPopWin('<?php echo(CATSUtility::getIndexName()); ?>?m=candidates&amp;a=linkDuplicate&amp;candidateID=<?php echo($this->candidateID); ?>', 750, 390, null); return false;">
                                            <img src="images/actions/duplicates.png" width="16" height="16" class="absmiddle" alt="add duplicate" border="0" />Link duplicate
                                        </a>
                                    <?php endif; ?>
                                </div>
                            <?php endif; ?>
                        </div>
                    <?php endif; ?>
                </div>

            <?php if ($this->data['isAdminHidden'] == 1): ?>
                <p class="warning">This Candidate is hidden.  Only CATS Administrators can view it or search for it.  To make it visible by the site users, click <a href="<?php echo(CATSUtility::getIndexName()); ?>?m=candidates&amp;a=administrativeHideShow&amp;candidateID=<?php echo($this->candidateID); ?>&amp;state=0" style="font-weight:bold;">Here.</a></p>
            <?php endif; ?>

            <div class="ui2-grid">
                <div class="ui2-col-main">
                    <div class="ui2-card ui2-card--section">
                        <div class="ui2-card-header">
                            <div class="ui2-card-title">Candidate Details</div>
                        </div>
                        <table class="detailsOutside ui2-details-table">
                <tr style="vertical-align:top;">
                    <?php $profileImage = false; ?>
                    <?php foreach ($this->attachmentsRS as $rowNumber => $attachmentsData): ?>
                         <?php if ($attachmentsData['isProfileImage'] == '1'): ?>
                             <?php $profileImage = true; ?>
                         <?php endif; ?>
                    <?php endforeach; ?>
                    <?php if ($profileImage): ?>
                        <td width="390" height="100%">
                    <?php else: ?>
                        </td><td width="50%" height="100%">
                    <?php endif; ?>
                        <table class="detailsInside ui2-details-table" height="100%">
                            <tr>
                                <td class="vertical">Name:</td>
                                <td class="data">
                                    <span style="font-weight: bold;" class="<?php echo($this->data['titleClass']); ?>">
                                        <?php $this->_($this->data['firstName']); ?>
                                        <?php $this->_($this->data['lastName']); ?>
                                        <?php if ($this->data['isActive'] != 1): ?>
                                            &nbsp;<span style="color:orange;">(INACTIVE)</span>
                                        <?php endif; ?>
                                        <?php TemplateUtility::printSingleQuickActionMenu(new CandidateQuickActionMenu(DATA_ITEM_CANDIDATE, $this->data['candidateID'], $_SESSION['CATS']->getAccessLevel('candidates.edit'))); ?>
                                    </span>
                                </td>
                            </tr>

                            <tr>
                                <td class="vertical">E-Mail:</td>
                                <td class="data">
                                    <a href="mailto:<?php $this->_($this->data['email1']); ?>">
                                        <?php $this->_($this->data['email1']); ?>
                                    </a>
                                </td>
                            </tr>
                            <tr>
                                <td class="vertical">Cell Phone:</td>
                                <td class="data"><?php $this->_($this->data['phoneCell']); ?></td>
                            </tr>

                            <tr>
                                <td class="vertical">Best Time To Call:</td>
                                <td class="data"><?php $this->_($this->data['bestTimeToCall']); ?></td>
                            </tr>
                            <tr>
                                <td class="vertical">Address:</td>
                                <td class="data"><?php echo(nl2br(htmlspecialchars($this->data['address']))); ?></td>
                            </tr>

                            <tr>
                                <td class="vertical">City:</td>
                                <td class="data"><?php $this->_($this->data['city']); ?></td>
                            </tr>
                            <tr>
                                <td class="vertical">Country:</td>
                                <td class="data"><?php $this->_($this->data['country']); ?></td>
                            </tr>

                            <?php for ($i = 0; $i < intval(count($this->extraFieldRS)/2); $i++): ?>
                                <tr>
                                    <td class="vertical"><?php $this->_($this->extraFieldRS[$i]['fieldName']); ?>:</td>
                                    <td class="data"><?php echo($this->extraFieldRS[$i]['display']); ?></td>
                                </tr>
                            <?php endfor; ?>

                            <tr>
                                <td class="vertical"></td>
                                <td class="data"></td>
                            </tr>
                        </table>
                    </td>

                    <?php if ($profileImage): ?>
                        <td width="390" height="100%" valign="top">
                    <?php else: ?>
                        </td><td width="50%" height="100%" valign="top">
                    <?php endif; ?>
                        <table class="detailsInside ui2-details-table" height="100%">
                            <tr>
                                <td class="vertical">Date Available:</td>
                                <td class="data"><?php $this->_($this->data['dateAvailable']); ?></td>
                            </tr>

                            <tr>
                                <td class="vertical">Current Employer:</td>
                                <td class="data"><?php $this->_($this->data['currentEmployer']); ?></td>
                            </tr>

                            <tr>
                                <td class="vertical">Key Skills:</td>
                                <td class="data"><?php $this->_($this->data['keySkills']); ?></td>
                            </tr>

                            <tr>
                                <td class="vertical">Can Relocate:</td>
                                <td class="data"><?php $this->_($this->data['canRelocate']); ?></td>
                            </tr>

                            <tr>
                                <td class="vertical">Current Pay:</td>
                                <td class="data"><?php $this->_($this->data['currentPay']); ?></td>
                            </tr>

                            <tr>
                                <td class="vertical">Desired Pay:</td>
                                <td class="data"><?php $this->_($this->data['desiredPay']); ?></td>
                            </tr>

                            <?php for ($i = (intval(count($this->extraFieldRS))/2); $i < (count($this->extraFieldRS)); $i++): ?>
                                <tr>
                                    <td class="vertical"><?php $this->_($this->extraFieldRS[$i]['fieldName']); ?>:</td>
                                    <td class="data"><?php echo($this->extraFieldRS[$i]['display']); ?></td>
                                </tr>
                            <?php endfor; ?>
                        </table>
                    </td>
                    <?php foreach ($this->attachmentsRS as $rowNumber => $attachmentsData): ?>
                         <?php if ($attachmentsData['isProfileImage'] == '1'): ?>
                            <td width="135" height="100%"  valign="top">
                                <table class="detailsInside">
                                    <tr>
                                        <td style="text-align:center;" class="vertical">
                                            <?php if (!$this->isPopup): ?>
                                                <?php if ($this->getUserAccessLevel('candidates.deleteAttachment') >= ACCESS_LEVEL_DELETE): ?>
                                                    <a href="<?php echo(CATSUtility::getIndexName()); ?>?m=candidates&amp;a=deleteAttachment&amp;candidateID=<?php echo($this->candidateID); ?>&amp;attachmentID=<?php $this->_($attachmentsData['attachmentID']) ?>" class="ui2-button ui2-button--danger" onclick="javascript:return confirm('Delete this attachment?');">
                                                        <img src="images/actions/delete.gif" alt="" width="16" height="16" border="0" title="Delete" />
                                                    </a>
                                                <?php endif; ?>
                                            <?php else: ?>
                                            &nbsp;&nbsp;&nbsp;&nbsp;
                                            <?php endif; ?>&nbsp;&nbsp;
                                            Picture:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                        </td>
                                    </tr>
                                    <tr>
                                        <td class="data">
                                            <a href="attachments/<?php $this->_($attachmentsData['directoryName']) ?>/<?php $this->_($attachmentsData['storedFilename']) ?>">
                                                <img src="attachments/<?php $this->_($attachmentsData['directoryName']) ?>/<?php $this->_($attachmentsData['storedFilename']) ?>" border="0" alt="" width="125" />
                                            </a>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                         <?php endif; ?>
                    <?php endforeach; ?>
                </tr>
            </table>
                    </div>

            <?php if($this->EEOSettingsRS['enabled'] == 1): ?>
                <div class="ui2-card ui2-card--section">
                    <div class="ui2-card-header">
                        <div class="ui2-card-title">EEO Information</div>
                    </div>
                <table class="detailsOutside ui2-details-table">
                    <tr>
                        <td>
                            <table class="detailsInside ui2-details-table">
                                <?php for ($i = 0; $i < intval(count($this->EEOValues)/2); $i++): ?>
                                    <tr>
                                        <td class="vertical"><?php $this->_($this->EEOValues[$i]['fieldName']); ?>:</td>
                                        <?php if($this->EEOSettingsRS['canSeeEEOInfo']): ?>
                                            <td class="data"><?php $this->_($this->EEOValues[$i]['fieldValue']); ?></td>
                                        <?php else: ?>
                                            <td class="data"><i><a href="javascript:void(0);" title="Ask an administrator to see the EEO info, or have permission granted to see it.">(Hidden)</a></i></td>
                                        <?php endif; ?>
                                    </tr>
                                <?php endfor; ?>
                            </table>
                        </td>
                        <?php if ($profileImage): ?>
                            <td width="390" height="100%" valign="top">
                        <?php else: ?>
                            </td><td width="50%" height="100%" valign="top">
                        <?php endif; ?>
                            <table class="detailsInside ui2-details-table">
                                <?php for ($i = (intval(count($this->EEOValues))/2); $i < intval(count($this->EEOValues)); $i++): ?>
                                    <tr>
                                        <td class="vertical"><?php $this->_($this->EEOValues[$i]['fieldName']); ?>:</td>
                                        <?php if($this->EEOSettingsRS['canSeeEEOInfo']): ?>
                                            <td class="data"><?php $this->_($this->EEOValues[$i]['fieldValue']); ?></td>
                                        <?php else: ?>
                                            <td class="data"><i><a href="javascript:void(0);" title="Ask an administrator to see the EEO info, or have permission  granted to see it.">(Hidden)</a></i></td>
                                        <?php endif; ?>
                                    </tr>
                                <?php endfor; ?>
                            </table>
                        </td>
                    </tr>
                </table>
                </div>
            <?php endif; ?>
                    <div class="ui2-card ui2-card--section">
                        <div class="ui2-card-header">
                            <div class="ui2-card-title">Misc Notes</div>
                        </div>
                        <table class="detailsInside ui2-details-table">
                            <tr>
                                <td valign="top" class="vertical">Misc. Notes:</td>
                                <?php if ($this->isShortNotes): ?>
                                    <td id="shortNotes" style="display:block;" class="data">
                                        <?php echo($this->data['shortNotes']); ?><span class="moreText">...</span>&nbsp;
                                        <p><a href="#" class="moreText" onclick="toggleNotes(); return false;">[More]</a></p>
                                    </td>
                                    <td id="fullNotes" style="display:none;" class="data">
                                        <?php echo($this->data['notes']); ?>&nbsp;
                                        <p><a href="#" class="moreText" onclick="toggleNotes(); return false;">[Less]</a></p>
                                    </td>
                                <?php else: ?>
                                    <td id="shortNotes" style="display:block;" class="data">
                                        <?php echo($this->data['notes']); ?>
                                    </td>
                                <?php endif; ?>
                            </tr>

                            <tr>
                                <td valign="top" class="vertical">Upcoming Events:</td>
                                <td id="shortNotes" style="display:block;" class="data">
                                <?php foreach ($this->calendarRS as $rowNumber => $calendarData): ?>
                                    <div>
                                        <a href="<?php echo(CATSUtility::getIndexName()); ?>?m=calendar&amp;view=DAYVIEW&amp;month=<?php echo($calendarData['month']); ?>&amp;year=20<?php echo($calendarData['year']); ?>&amp;day=<?php echo($calendarData['day']); ?>&amp;showEvent=<?php echo($calendarData['eventID']); ?>">
                                            <img src="<?php $this->_($calendarData['typeImage']) ?>" alt="" border="0" />
                                            <?php $this->_($calendarData['dateShow']) ?>:
                                            <?php $this->_($calendarData['title']); ?>
                                        </a>
                                    </div>
                                <?php endforeach; ?>
                                </td>
                            </tr>

                            <?php if (isset($this->questionnaires) && !empty($this->questionnaires)): ?>
                            <tr>
                                <td valign="top" class="vertical" valign="top" align="left">Questionnaires:</td>
                                <td valign="top" class="data" valign="top" align="left">
                                    <table cellpadding="0" cellspacing="0" border="0">
                                    <tr>
                                        <td style="border-bottom: 1px solid #c0c0c0; font-weight: bold; padding-right: 10px;">Title (Internal)</td>
                                        <td style="border-bottom: 1px solid #c0c0c0; font-weight: bold; padding-right: 10px;">Completed</td>
                                        <td style="border-bottom: 1px solid #c0c0c0; font-weight: bold; padding-right: 10px;">Description (Public)</td>
                                    </tr>
                                    <?php foreach ($this->questionnaires as $questionnaire): ?>
                                    <tr>
                                        <td style="padding-right: 10px;" nowrap="nowrap"><a href="<?php echo(CATSUtility::getIndexName()); ?>?m=candidates&amp;a=show_questionnaire&amp;candidateID=<?php echo($this->candidateID); ?>&amp;questionnaireTitle=<?php echo urlencode($questionnaire['questionnaireTitle']); ?>&print=no"><?php echo $questionnaire['questionnaireTitle']; ?></a></td>
                                        <td style="padding-right: 10px;" nowrap="nowrap"><?php echo date('F j. Y', strtotime($questionnaire['questionnaireDate'])); ?></td>
                                        <td style="padding-right: 10px;" nowrap="nowrap"><?php echo $questionnaire['questionnaireDescription']; ?></td>
                                        <td style="padding-right: 10px;" nowrap="nowrap">
                                            <a id="edit_link" href="<?php echo(CATSUtility::getIndexName()); ?>?m=candidates&amp;a=show_questionnaire&amp;candidateID=<?php echo($this->candidateID); ?>&amp;questionnaireTitle=<?php echo urlencode($questionnaire['questionnaireTitle']); ?>&print=no">
                                                <img src="images/actions/view.gif" width="16" height="16" class="absmiddle" alt="view" border="0" />&nbsp;View
                                            </a>
                                            &nbsp;
                                            <a id="edit_link" href="<?php echo(CATSUtility::getIndexName()); ?>?m=candidates&amp;a=show_questionnaire&amp;candidateID=<?php echo($this->candidateID); ?>&amp;questionnaireTitle=<?php echo urlencode($questionnaire['questionnaireTitle']); ?>&print=yes">
                                                <img src="images/actions/print.gif" width="16" height="16" class="absmiddle" alt="print" border="0" />&nbsp;Print
                                            </a>
                                        </td>
                                    </tr>
                                    <?php endforeach; ?>
                                    </table>
                                </td>
                            </tr>
                            <?php endif; ?>

                        </table>
                    </div>

                    <div class="ui2-card ui2-card--section">
                        <div class="ui2-card-header">
                            <div class="ui2-card-title">Attachments</div>
                        </div>
                        <table class="attachmentsTable ui2-attachments-table">
                            <?php foreach ($this->attachmentsRS as $rowNumber => $attachmentsData): ?>
                                <?php if ($attachmentsData['isProfileImage'] != '1'): ?>
                                    <tr>
                                        <td>
                                            <?php echo $attachmentsData['retrievalLink']; ?>
                                                <img src="<?php $this->_($attachmentsData['attachmentIcon']) ?>" alt="" width="16" height="16" border="0" />
                                                &nbsp;
                                                <?php $this->_($attachmentsData['originalFilename']) ?>
                                            </a>
                                        </td>
                                        <td><?php echo($attachmentsData['previewLink']); ?></td>
                                        <td><?php $this->_($attachmentsData['dateCreated']) ?></td>
                                        <td>
                                            <?php if (!$this->isPopup): ?>
                                                <?php if ($this->getUserAccessLevel('candidates.deleteAttachment') >= ACCESS_LEVEL_DELETE): ?>
                                                    <a href="<?php echo(CATSUtility::getIndexName()); ?>?m=candidates&amp;a=deleteAttachment&amp;candidateID=<?php echo($this->candidateID); ?>&amp;attachmentID=<?php $this->_($attachmentsData['attachmentID']) ?>" class="ui2-button ui2-button--danger" onclick="javascript:return confirm('Delete this attachment?');">
                                                        <img src="images/actions/delete.gif" alt="" width="16" height="16" border="0" title="Delete" />
                                                    </a>
                                                <?php endif; ?>
                                            <?php endif; ?>
                                        </td>
                                    </tr>
                                <?php endif; ?>
                            <?php endforeach; ?>
                        </table>
                        <?php if (!$this->isPopup): ?>
                            <?php if ($this->getUserAccessLevel('candidates.createAttachment') >= ACCESS_LEVEL_EDIT): ?>
                                <?php if (isset($this->attachmentLinkHTML)): ?>
                                    <?php echo($this->attachmentLinkHTML); ?>
                                <?php else: ?>
                                    <a href="#" onclick="showPopWin('<?php echo(CATSUtility::getIndexName()); ?>?m=candidates&amp;a=createAttachment&amp;candidateID=<?php echo($this->candidateID); ?>', 400, 125, null); return false;">
                                <?php endif; ?>
                                    <img src="images/paperclip_add.gif" width="16" height="16" border="0" alt="Add Attachment" class="absmiddle" />&nbsp;Add Attachment
                                </a>
                            <?php endif; ?>
                        <?php endif; ?>
                    </div>
                </div>
                <div class="ui2-col-side">
                    <div class="ui2-card ui2-card--section">
                        <div class="ui2-card-header">
                            <div class="ui2-card-title">GDPR</div>
                            <?php if (!$this->isPopup && $this->getUserAccessLevel('settings.administration') >= ACCESS_LEVEL_SA): ?>
                                <div class="ui2-card-actions">
                                    <button
                                        id="gdprSendRequest"
                                        type="button"
                                        class="ui2-button ui2-button--secondary"
                                        <?php if ($this->gdprSendDisabled): ?>disabled="disabled"<?php endif; ?>
                                        <?php if ($this->gdprSendDisabledReason !== ''): ?>data-disabled-reason="<?php echo(htmlspecialchars($this->gdprSendDisabledReason, ENT_QUOTES)); ?>" title="<?php echo(htmlspecialchars($this->gdprSendDisabledReason, ENT_QUOTES)); ?>"<?php endif; ?>
                                    >Send GDPR request</button>
                                </div>
                            <?php endif; ?>
                        </div>
                        <table class="detailsInside ui2-details-table">
                            <tr>
                                <td class="vertical">GDPR Signed:</td>
                                <td class="data"><?php $this->_($this->data['gdprSignedText']); ?></td>
                            </tr>
                            <tr>
                                <td class="vertical">GDPR Expiration Date:</td>
                                <td class="data">
                                    <?php if (!empty($this->data['gdprExpirationDateDisplay'])): ?>
                                        <?php $this->_($this->data['gdprExpirationDateDisplay']); ?>
                                    <?php else: ?>
                                        Not set
                                    <?php endif; ?>
                                </td>
                            </tr>
                            <tr>
                                <td class="vertical">Latest Request Status:</td>
                                <td class="data"><?php $this->_($this->gdprLatestRequest['status']); ?></td>
                            </tr>
                            <tr>
                                <td class="vertical">Request Created:</td>
                                <td class="data"><?php $this->_($this->gdprLatestRequest['createdAt']); ?></td>
                            </tr>
                            <tr>
                                <td class="vertical">Email Sent:</td>
                                <td class="data"><?php $this->_($this->gdprLatestRequest['emailSentAt']); ?></td>
                            </tr>
                            <tr>
                                <td class="vertical">Link Expires:</td>
                                <td class="data"><?php $this->_($this->gdprLatestRequest['expiresAt']); ?></td>
                            </tr>
                            <tr>
                                <td class="vertical">Deleted At:</td>
                                <td class="data"><?php $this->_($this->gdprLatestRequest['deletedAt']); ?></td>
                            </tr>
                        </table>
                        <?php if (!empty($this->gdprDeletionRequired)): ?>
                            <div class="ui2-ai-status" style="margin-top: 8px; color: #b00000; border-left-color: #b00000;">
                                Deletion required (candidate declined).
                            </div>
                        <?php endif; ?>
                        <div id="gdprCandidateStatus" class="ui2-ai-status" style="margin-top: 8px; <?php if (empty($this->gdprFlashMessage)) echo 'display: none;'; ?>">
                            <?php if (!empty($this->gdprFlashMessage)) $this->_($this->gdprFlashMessage); ?>
                        </div>
                    </div>
                    <div class="ui2-card ui2-card--section">
                        <div class="ui2-card-header">
                            <div class="ui2-card-title">Ownership</div>
                        </div>
                        <table class="detailsInside ui2-details-table">
                            <tr>
                                <td class="vertical">Created:</td>
                                <td class="data"><?php $this->_($this->data['dateCreated']); ?> (<?php $this->_($this->data['enteredByFullName']); ?>)</td>
                            </tr>
                            <tr>
                                <td class="vertical">Owner:</td>
                                <td class="data"><?php $this->_($this->data['ownerFullName']); ?></td>
                            </tr>
                        </table>
                    </div>
                    <div class="ui2-card ui2-card--section">
                        <div class="ui2-card-header">
                            <div class="ui2-card-title">Pipeline &amp; Source</div>
                        </div>
                        <table class="detailsInside ui2-details-table">
                            <tr>
                                <td class="vertical">Pipeline:</td>
                                <td class="data"><?php $this->_($this->data['pipeline']); ?></td>
                            </tr>
                            <tr>
                                <td class="vertical">Proposed to Customer:</td>
                                <td class="data"><?php $this->_($this->data['submitted']); ?></td>
                            </tr>
                            <tr>
                                <td class="vertical">Source:</td>
                                <td class="data"><?php $this->_($this->data['source']); ?></td>
                            </tr>
                        </table>
                    </div>
                    <div class="ui2-card ui2-card--section">
                        <div class="ui2-card-header">
                            <div class="ui2-card-title">Tags</div>
                            <?php if (!$this->isPopup){ ?>
                                <?php if ($this->getUserAccessLevel('candidates.addCandidateTags') >= ACCESS_LEVEL_EDIT){ ?>
                                    <div class="ui2-card-actions">
                                        <a class="ui2-button ui2-button--secondary" href="#" onclick="showPopWin('<?php echo(CATSUtility::getIndexName()); ?>?m=candidates&amp;a=addCandidateTags&amp;candidateID=<?php echo($this->candidateID); ?>', 400, 125, null); return false;">
                                            Add/Remove
                                        </a>
                                    </div>
                                <?php } ?>
                            <?php } ?>
                        </div>
                        <div class="ui2-taglist">
                            <?php if (!empty($this->assignedTags)): ?>
                                <?php foreach ($this->assignedTags as $tag): ?>
                                    <span><?php $this->_($tag); ?></span>
                                <?php endforeach; ?>
                            <?php else: ?>
                                <span>None</span>
                            <?php endif; ?>
                        </div>
                    </div>
                </div>
            </div>
            <?php if (!$this->isPopup): ?>
            <div id="transformCvOverlay" style="display: none; position: fixed; left: 0; top: 0; width: 100%; height: 100%; background: #000; opacity: 0.25; z-index: 1000;"></div>
            <div id="transformCvModal" style="display: none; position: fixed; left: 50%; top: 20%; width: 460px; margin-left: -230px; background: #fff; border: 1px solid #666; padding: 12px; z-index: 1001;">
                <div style="font-weight: bold; margin-bottom: 8px;">Transform CV</div>
                <table class="detailsInside">
                    <tr>
                        <td class="vertical" style="width: 120px;">CV Attachment:</td>
                        <td class="data">
                            <select id="transformCvAttachment" style="width: 300px;" <?php if (empty($this->transformAttachments)) echo('disabled="disabled"'); ?>>
                                <?php if (empty($this->transformAttachments)): ?>
                                    <option value="">No eligible attachments</option>
                                <?php else: ?>
                                    <?php foreach ($this->transformAttachments as $attachment): ?>
                                        <option value="<?php echo($attachment['attachmentID']); ?>"><?php $this->_($attachment['originalFilename']); ?></option>
                                    <?php endforeach; ?>
                                <?php endif; ?>
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <td class="vertical">Job Order:</td>
                        <td class="data">
                            <input type="text" id="transformCvJobSearch" style="width: 180px;" onkeyup="CandidateTransformCV.scheduleSearch();" />
                            <div style="margin-top: 4px;">
                                <select id="transformCvJobOrder" style="width: 300px;">
                                    <option value="">Type to search...</option>
                                </select>
                                <input type="button" class="button ui2-button--secondary" id="transformCvNext" value="Next 50" onclick="CandidateTransformCV.loadNext();" style="margin-left: 6px;" />
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td class="vertical">Language:</td>
                        <td class="data">
                            <input type="text" id="transformCvLanguage" value="English" style="width: 100px;" />
                            &nbsp;Role Type:
                            <input type="text" id="transformCvRoleType" value="Technical" style="width: 100px;" />
                        </td>
                    </tr>
                    <tr>
                        <td class="vertical">Save Attachment:</td>
                        <td class="data">
                            <label>
                                <input type="checkbox" id="transformCvStore" />
                                Download &amp; store as attachment
                            </label>
                        </td>
                    </tr>
                </table>
                <div style="margin-top: 10px;">
                    <input type="button" class="button ui2-button--primary" id="transformCvSubmit" value="Submit" onclick="CandidateTransformCV.submit();" />
                    <input type="button" class="button ui2-button--secondary" value="Cancel" onclick="CandidateTransformCV.close();" />
                </div>
                <div id="transformCvStatus" style="margin-top: 8px;"></div>
            </div>
            <script type="text/javascript">
                CandidateTransformCV.configure({
                    candidateID: '<?php echo($this->candidateID); ?>',
                    sessionCookie: '<?php echo($this->sessionCookie); ?>'
                });
            </script>
<?php endif; ?>
            <br clear="all" />
            <br />

            <div class="ui2-card ui2-card--section">
                <div class="ui2-card-header">
                    <div class="ui2-card-title">Job Orders for Candidates</div>
                    <?php if (!$this->isPopup): ?>
                        <?php if ($this->getUserAccessLevel('candidates.considerForJobSearch') >= ACCESS_LEVEL_EDIT): ?>
                            <div class="ui2-card-actions">
                                <a href="#" onclick="showPopWin('<?php echo(CATSUtility::getIndexName()); ?>?m=candidates&amp;a=considerForJobSearch&amp;candidateID=<?php echo($this->candidateID); ?>', 750, 390, null); return false;">
                                    <img src="images/consider.gif" width="16" height="16" class="absmiddle" alt="Add to Job Order" border="0" />&nbsp;Add This Candidate to Job Order
                                </a>
                            </div>
                        <?php endif; ?>
                    <?php endif; ?>
                </div>
                <p style="margin: 4px 0 8px 0;">
                    <label>
                        <input type="checkbox" id="pipelineShowClosedCandidate" <?php if (!empty($this->showClosedPipeline)) echo('checked="checked"'); ?>
                            onclick="window.location.href='<?php echo(CATSUtility::getIndexName()); ?>?m=candidates&amp;a=show&amp;candidateID=<?php echo($this->candidateID); ?>&amp;showClosed=' + (this.checked ? 1 : 0);" />
                        Show Closed
                    </label>
                </p>
                <table class="sortablepair ui2-table">
                <tr>
                    <th></th>
                    <th align="left">Match</th>
                    <th align="left">Ref. Number</th>
                    <th align="left">Title</th>
                    <th align="left">Company</th>
                    <th align="left">Owner</th>
                    <th align="left">Added</th>
                    <th align="left">Entered By</th>
                    <th align="left">Status</th>
<?php if (!$this->isPopup): ?>
                    <th align="center">Action</th>
<?php endif; ?>
                </tr>

                <?php foreach ($this->pipelinesRS as $rowNumber => $pipelinesData): ?>
                    <tr class="<?php TemplateUtility::printAlternatingRowClass($rowNumber); ?><?php if ((int) $pipelinesData['isActive'] === 0) echo(' pipelineClosedRow'); ?>" id="pipelineRow<?php echo($rowNumber); ?>">
                        <td valign="top">
                            <span id="pipelineOpen<?php echo($rowNumber); ?>">
                                <a href="javascript:void(0);" onclick="document.getElementById('pipelineDetails<?php echo($rowNumber); ?>').style.display=''; document.getElementById('pipelineClose<?php echo($rowNumber); ?>').style.display = ''; document.getElementById('pipelineOpen<?php echo($rowNumber); ?>').style.display = 'none'; PipelineDetails_populate(<?php echo($pipelinesData['candidateJobOrderID']); ?>, 'pipelineInner<?php echo($rowNumber); ?>', '<?php echo($this->sessionCookie); ?>');">
                                    <img src="images/arrow_next.png" alt="" border="0" title="Show History" />
                                </a>
                            </span>
                            <span id="pipelineClose<?php echo($rowNumber); ?>" style="display: none;">
                                <a href="javascript:void(0);" onclick="document.getElementById('pipelineDetails<?php echo($rowNumber); ?>').style.display = 'none'; document.getElementById('pipelineClose<?php echo($rowNumber); ?>').style.display = 'none'; document.getElementById('pipelineOpen<?php echo($rowNumber); ?>').style.display = '';">
                                    <img src="images/arrow_down.png" alt="" border="0" title="Hide History" />
                                </a>
                            </span>
                        </td>
                        <td valign="top">
                            <?php echo($pipelinesData['ratingLine']); ?>
                        </td>
                        <td valign="top">
                            <?php $this->_($pipelinesData['clientJobID']) ?>
                        </td>
                        <td valign="top">
                            <a href="<?php echo(CATSUtility::getIndexName()); ?>?m=joborders&amp;a=show&amp;jobOrderID=<?php echo($pipelinesData['jobOrderID']); ?>" class="<?php $this->_($pipelinesData['linkClass']) ?>">
                                <?php $this->_($pipelinesData['title']) ?>
                            </a>
                        </td>
                        <td valign="top">
                            <a href="<?php echo(CATSUtility::getIndexName()); ?>?m=companies&amp;companyID=<?php echo($pipelinesData['companyID']); ?>&amp;a=show">
                                <?php $this->_($pipelinesData['companyName']) ?>
                            </a>
                        </td>
                        <td valign="top"><?php $this->_($pipelinesData['ownerAbbrName']) ?></td>
                        <td valign="top"><?php $this->_($pipelinesData['dateCreated']) ?></td>
                        <td valign="top"><?php $this->_($pipelinesData['addedByAbbrName']) ?></td>
                        <td valign="top" nowrap="nowrap">
                            <?php $this->_($pipelinesData['status']) ?>
                            <?php if ((int) $pipelinesData['isActive'] === 0): ?>
                                <span class="pipelineClosedTag">Closed</span>
                            <?php endif; ?>
                        </td>
<?php if (!$this->isPopup): ?>
                        <td align="center" nowrap="nowrap">
                            <?php eval(Hooks::get('CANDIDATE_TEMPLATE_SHOW_PIPELINE_ACTION')); ?>
                            <?php if ($this->getUserAccessLevel('pipelines.screening') >= ACCESS_LEVEL_EDIT && !$_SESSION['CATS']->hasUserCategory('sourcer')): ?>
                                <?php if ($pipelinesData['ratingValue'] < 0): ?>
                                    <a href="#" id="screenLink<?php echo($pipelinesData['candidateJobOrderID']); ?>" onclick="moImageValue<?php echo($pipelinesData['candidateJobOrderID']); ?> = 0; setRating(<?php echo($pipelinesData['candidateJobOrderID']); ?>, 0, 'moImage<?php echo($pipelinesData['candidateJobOrderID']); ?>', '<?php echo($_SESSION['CATS']->getCookie()); ?> '); return false;">
                                        <img id="screenImage<?php echo($pipelinesData['candidateJobOrderID']); ?>" src="images/actions/screen.gif" width="16" height="16" class="absmiddle" alt="" border="0" title="Mark as Delivery Validated" />
                                    </a>
                                <?php else: ?>
                                    <img src="images/actions/blank.gif" width="16" height="16" class="absmiddle" alt="" border="0" />
                                <?php endif; ?>
                            <?php endif; ?>
                            <?php if ($this->getUserAccessLevel('pipelines.addActivityChangeStatus') >= ACCESS_LEVEL_EDIT): ?>
                                <a href="#" onclick="showPopWin('<?php echo(CATSUtility::getIndexName()); ?>?m=candidates&amp;a=addActivityChangeStatus&amp;candidateID=<?php echo($this->candidateID); ?>&amp;jobOrderID=<?php echo($pipelinesData['jobOrderID']); ?>', 600, 480, null); return false;" >
                                    <img src="images/actions/edit.gif" width="16" height="16" class="absmiddle" alt="" border="0" title="Change Status"/>
                                </a>
                            <?php endif; ?>
                            <?php if ($this->getUserAccessLevel('pipelines.removeFromPipeline') >= ACCESS_LEVEL_DELETE): ?>
                                <a href="<?php echo(CATSUtility::getIndexName()); ?>?m=candidates&amp;a=removeFromPipeline&amp;candidateID=<?php echo($this->candidateID); ?>&amp;jobOrderID=<?php echo($pipelinesData['jobOrderID']); ?>" class="ui2-button ui2-button--danger" onclick="return PipelinePromptRemove('<?php echo(CATSUtility::getIndexName()); ?>?m=candidates&amp;a=removeFromPipeline&amp;candidateID=<?php echo($this->candidateID); ?>&amp;jobOrderID=<?php echo($pipelinesData['jobOrderID']); ?>');">
                                    <img src="images/actions/delete.gif" width="16" height="16" class="absmiddle" alt="" border="0" title="Reject from Job Order"/>
                                </a>
                            <?php endif; ?>
                        </td>
<?php endif; ?>
                    </tr>
                    <tr class="<?php TemplateUtility::printAlternatingRowClass($rowNumber); ?>" id="pipelineDetails<?php echo($rowNumber); ?>" style="display:none;">
                        <td colspan="11" align="center">
                            <table width="98%" border="1" class="detailsOutside" style="margin: 5px;">
                                <tr>
                                    <td align="left" style="padding: 6px 6px 6px 6px; background-color: white; clear: both;">
                                        <div style="overflow: auto; height: 200px;" id="pipelineInner<?php echo($rowNumber); ?>">
                                            <img src="images/indicator.gif" alt="" />&nbsp;&nbsp;Loading pipeline details...
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                <?php endforeach; ?>
            </table>
            </div>
            <br clear="all" />
            <br />

            <p class="note">Lists</p>

            <table id="listsTable" class="sortable">
                <tr>
                    <th align="left" width="250">Name</th>
                </tr>
                <?php foreach($this->lists as $rowNumber => $list): ?>
                    <tr class="<?php TemplateUtility::printAlternatingRowClass($rowNumber); ?>">
                        <td>
                            <a href="index.php?m=lists&a=showList&savedListID=<?php echo $list['listID']; ?>"><?php echo $list['name']; ?></a>
                        </td>
                    </tr>
                <?php endforeach; ?>
            </table>
            </div>

<?php if (!$this->isPopup): ?>
        </div>
    </div>

    <script type="text/javascript">
        if (typeof GDPRCandidateRequest !== 'undefined')
        {
            GDPRCandidateRequest.configure({
                sessionCookie: '<?php echo($this->sessionCookie); ?>',
                candidateID: '<?php echo($this->candidateID); ?>'
            });
            GDPRCandidateRequest.bind();
        }
        <?php if (!empty($this->gdprFlashMessage)): ?>
        if (window.history && typeof window.history.replaceState === 'function')
        {
            var url = window.location.href;
            if (url.indexOf('gdpr=') !== -1)
            {
                url = url.replace(/([?&])gdpr=[^&]*&?/i, '$1');
                url = url.replace(/[?&]$/, '');
                url = url.replace('?&', '?');
                window.history.replaceState(null, document.title, url);
            }
        }
        <?php endif; ?>
    </script>

<?php endif; ?>
	
<?php TemplateUtility::printFooter(); ?>

