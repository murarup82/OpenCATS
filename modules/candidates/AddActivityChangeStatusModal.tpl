<?php /* $Id: AddActivityChangeStatusModal.tpl 3799 2007-12-04 17:54:36Z brian $ */ ?>
<?php if ($this->isJobOrdersMode): ?>
    <?php TemplateUtility::printModalHeader('Job Orders', array('modules/candidates/activityvalidator.js', 'js/activity.js'), 'Job Orders: Change Status'); ?>
<?php elseif ($this->onlyScheduleEvent): ?>
    <?php TemplateUtility::printModalHeader('Candidates', array('modules/candidates/activityvalidator.js', 'js/activity.js'), 'Candidates: Schedule Event'); ?>
<?php else: ?>
    <?php TemplateUtility::printModalHeader('Candidates', array('modules/candidates/activityvalidator.js', 'js/activity.js'), 'Candidates: Change Status'); ?>
<?php endif; ?>

<?php
    $forceStatusChange = (!$this->onlyScheduleEvent && $this->selectedJobOrderID != -1);
    $hideActivity = true;
    $hideScheduleEvent = true;
?>

<?php if (!empty($this->refreshParentOnClose)): ?>
<script type="text/javascript">
    window.onunload = function ()
    {
        if (window.parent && window.parent.location)
        {
            window.parent.location.reload();
        }
    };
</script>
<?php endif; ?>

<div class="ui2">

<?php if (!$this->isFinishedMode): ?>

<script type="text/javascript">
    <?php if ($this->isJobOrdersMode): ?>
        statusesArray = new Array(1);
        jobOrdersArray = new Array(1);
        candidateJobOrderArray = new Array(1);
        statusesArrayString = new Array(1);
        jobOrdersArrayStringTitle = new Array(1);
        jobOrdersArrayStringCompany = new Array(1);
        statusesArray[0] = <?php echo($this->pipelineData['statusID']); ?>;
        statusesArrayString[0] = '<?php echo($this->pipelineData['status']); ?>';
        jobOrdersArray[0] = <?php echo($this->pipelineData['jobOrderID']); ?>;
        candidateJobOrderArray[0] = <?php echo($this->pipelineData['candidateJobOrderID']); ?>;
        jobOrdersArrayStringTitle[0] = '<?php echo(str_replace("'", "\\'", $this->pipelineData['title'])); ?>';
        jobOrdersArrayStringCompany[0] = '<?php echo(str_replace("'", "\\'", $this->pipelineData['companyName'])); ?>';
    <?php else: ?>
        <?php $count = count($this->pipelineRS); ?>
        statusesArray = new Array(<?php echo($count); ?>);
        jobOrdersArray = new Array(<?php echo($count); ?>);
        candidateJobOrderArray = new Array(<?php echo($count); ?>);
        statusesArrayString = new Array(<?php echo($count); ?>);
        jobOrdersArrayStringTitle = new Array(<?php echo($count); ?>);
        jobOrdersArrayStringCompany = new Array(<?php echo($count); ?>);
        <?php for ($i = 0; $i < $count; ++$i): ?>
            statusesArray[<?php echo($i); ?>] = <?php echo($this->pipelineRS[$i]['statusID']); ?>;
            statusesArrayString[<?php echo($i); ?>] = '<?php echo($this->pipelineRS[$i]['status']); ?>';
            jobOrdersArray[<?php echo($i); ?>] = <?php echo($this->pipelineRS[$i]['jobOrderID']); ?>;
            candidateJobOrderArray[<?php echo($i); ?>] = <?php echo($this->pipelineRS[$i]['candidateJobOrderID']); ?>;
            jobOrdersArrayStringTitle[<?php echo($i); ?>] = '<?php echo(str_replace("'", "\\'", $this->pipelineRS[$i]['title'])); ?>';
            jobOrdersArrayStringCompany[<?php echo($i); ?>] = '<?php echo(str_replace("'", "\\'", $this->pipelineRS[$i]['companyName'])); ?>';
        <?php endfor; ?>
    <?php endif; ?>
    statusTriggersEmailArray = {};
    statusOrder = new Array(<?php echo(count($this->statusRS)); ?>);
    statusLabels = {};
    <?php foreach ($this->statusRS as $rowNumber => $statusData): ?>
       statusTriggersEmailArray[<?php echo($statusData['statusID']); ?>] = <?php echo($statusData['triggersEmail']); ?>;
       statusOrder[<?php echo($rowNumber); ?>] = <?php echo($statusData['statusID']); ?>;
       statusLabels[<?php echo($statusData['statusID']); ?>] = '<?php echo(str_replace("'", "\\'", $statusData['status'])); ?>';
    <?php endforeach; ?>
    rejectedStatusID = <?php echo(isset($this->rejectedStatusId) ? (int) $this->rejectedStatusId : 0); ?>;
    rejectionOtherReasonID = <?php echo(isset($this->rejectionOtherReasonId) ? (int) $this->rejectionOtherReasonId : 0); ?>;

    function AS_getCurrentStatusID()
    {
        <?php if ($this->isJobOrdersMode): ?>
            return statusesArray[0];
        <?php else: ?>
            var regardingSelectList = document.getElementById('regardingID');
            if (!regardingSelectList || regardingSelectList.selectedIndex < 0)
            {
                return null;
            }
            var regardingID = regardingSelectList[regardingSelectList.selectedIndex].value;
            if (regardingID == '-1')
            {
                return null;
            }
            var statusIndex = findValueInArray(jobOrdersArray, regardingID);
            if (statusIndex == -1)
            {
                return null;
            }
            return statusesArray[statusIndex];
        <?php endif; ?>
    }

    function AS_rebuildStatusOptions(currentStatusID)
    {
        var statusSelect = document.getElementById('statusID');
        if (!statusSelect || currentStatusID == null)
        {
            return;
        }

        var selectedValue = statusSelect.value;
        while (statusSelect.options.length > 1)
        {
            statusSelect.remove(1);
        }

        var allowed = [];
        var currentIndex = -1;
        for (var i = 0; i < statusOrder.length; i++)
        {
            if (parseInt(statusOrder[i], 10) === parseInt(currentStatusID, 10))
            {
                currentIndex = i;
                break;
            }
        }

        if (currentIndex === -1)
        {
            allowed = statusOrder.slice(0);
        }
        else
        {
            allowed = statusOrder.slice(currentIndex);
        }

        if (rejectedStatusID && allowed.indexOf(rejectedStatusID) === -1)
        {
            allowed.push(rejectedStatusID);
        }

        for (var j = 0; j < allowed.length; j++)
        {
            var statusID = allowed[j];
            var option = document.createElement('option');
            option.value = statusID;
            option.text = statusLabels[statusID] || statusID;
            statusSelect.add(option);
        }

        var desired = selectedValue;
        if (desired === '-1' || allowed.indexOf(parseInt(desired, 10)) === -1)
        {
            desired = currentStatusID;
        }

        if (desired != null)
        {
            for (var k = 0; k < statusSelect.options.length; k++)
            {
                if (parseInt(statusSelect.options[k].value, 10) === parseInt(desired, 10))
                {
                    statusSelect.selectedIndex = k;
                    break;
                }
            }
        }
    }

    function AS_applyStatusFilter()
    {
        var currentStatusID = AS_getCurrentStatusID();
        AS_rebuildStatusOptions(currentStatusID);
    }

    function AS_refreshRejectionUI()
    {
        var changeStatusCheckbox = document.getElementById('changeStatus');
        var statusSelect = document.getElementById('statusID');
        var statusCommentRow = document.getElementById('statusCommentTR');
        var rejectionRow = document.getElementById('rejectionReasonTR');

        var changeActive = (changeStatusCheckbox && changeStatusCheckbox.checked);
        if (statusCommentRow)
        {
            statusCommentRow.style.display = changeActive ? '' : 'none';
        }

        var isRejected = changeActive &&
            statusSelect && statusSelect.value == rejectedStatusID;
        if (rejectionRow)
        {
            rejectionRow.style.display = isRejected ? '' : 'none';
        }

        AS_onRejectionReasonChange();
    }

    function AS_onRejectionReasonChange()
    {
        var otherDiv = document.getElementById('rejectionReasonOtherDiv');
        var otherInput = document.getElementById('rejectionReasonOther');
        if (!otherDiv || !otherInput)
        {
            return;
        }

        var isOtherSelected = false;
        if (rejectionOtherReasonID > 0)
        {
            var reasonChecks = document.getElementsByName('rejectionReasonIDs[]');
            for (var i = 0; i < reasonChecks.length; i++)
            {
                if (reasonChecks[i].checked && reasonChecks[i].value == rejectionOtherReasonID)
                {
                    isOtherSelected = true;
                    break;
                }
            }
        }

        if (isOtherSelected)
        {
            otherDiv.style.display = '';
            otherInput.disabled = false;
        }
        else
        {
            otherDiv.style.display = 'none';
            otherInput.value = '';
            otherInput.disabled = true;
        }
    }

    function AS_getCandidateJobOrderIDForJobOrder(jobOrderID)
    {
        if (typeof jobOrdersArray === 'undefined' || typeof candidateJobOrderArray === 'undefined')
        {
            return '';
        }

        for (var i = 0; i < jobOrdersArray.length; i++)
        {
            if (String(jobOrdersArray[i]) === String(jobOrderID))
            {
                return candidateJobOrderArray[i];
            }
        }

        return '';
    }

    function AS_openPipelineStatusDetails()
    {
        var jobOrderInput = document.getElementById('regardingID');
        var jobOrderID = jobOrderInput ? jobOrderInput.value : '';
        var candidateInput = document.getElementById('candidateID');
        var candidateID = candidateInput ? candidateInput.value : '';
        var pipelineID = '';

        if (jobOrderID === '' || jobOrderID === '-1')
        {
            return false;
        }

        if (jobOrderID !== '')
        {
            pipelineID = AS_getCandidateJobOrderIDForJobOrder(jobOrderID);
        }

        var url = CATSIndexName + '?m=joborders&a=pipelineStatusDetails';
        if (pipelineID)
        {
            url += '&pipelineID=' + encodeURIComponent(pipelineID);
        }
        else if (candidateID !== '' && jobOrderID !== '')
        {
            url += '&candidateID=' + encodeURIComponent(candidateID) +
                '&jobOrderID=' + encodeURIComponent(jobOrderID);
        }
        else
        {
            return false;
        }

        window.open(url, 'pipelineStatusDetails', 'width=900,height=650,scrollbars=yes,resizable=yes');
        return false;
    }
</script>

    <form name="changePipelineStatusForm" id="changePipelineStatusForm" action="<?php echo(CATSUtility::getIndexName()); ?>?m=<?php if ($this->isJobOrdersMode): ?>joborders<?php else: ?>candidates<?php endif; ?>&amp;a=addActivityChangeStatus<?php if ($this->onlyScheduleEvent): ?>&amp;onlyScheduleEvent=true<?php endif; ?>" method="post" onsubmit="return checkActivityForm(document.changePipelineStatusForm);" autocomplete="off">
        <input type="hidden" name="postback" id="postback" value="postback" />
        <input type="hidden" id="candidateID" name="candidateID" value="<?php echo($this->candidateID); ?>" />
        <?php if (!empty($this->enforceOwner)): ?>
        <input type="hidden" id="enforceOwner" name="enforceOwner" value="1" />
        <?php endif; ?>
<?php if ($this->isJobOrdersMode): ?>
        <input type="hidden" id="regardingID" name="regardingID" value="<?php echo($this->selectedJobOrderID); ?>" />
<?php endif; ?>

        <div class="ui2-card ui2-card--section" style="width: 560px;">
        <table class="editTable" width="100%">
            <tr id="visibleTR" <?php if ($this->onlyScheduleEvent): ?>style="display:none;"<?php endif; ?>>
                <td class="tdVertical">
                    <label id="regardingIDLabel" for="regardingID">Regarding:</label>
                </td>
                <td class="tdData">
<?php if ($this->isJobOrdersMode): ?>
                    <span><?php $this->_($this->pipelineData['title']); ?></span>
<?php else: ?>
                    <select id="regardingID" name="regardingID" class="inputbox ui2-input" style="width: 150px;" onchange="AS_onRegardingChange(statusesArray, jobOrdersArray, 'regardingID', 'statusID', 'statusTR', 'sendEmailCheckTR', 'triggerEmail', 'triggerEmailSpan', 'changeStatus', 'changeStatusSpanA', 'changeStatusSpanB'); AS_applyStatusFilter();">
                        <option value="-1">General</option>

                        <?php foreach ($this->pipelineRS as $rowNumber => $pipelinesData): ?>
                            <?php if ($this->selectedJobOrderID == $pipelinesData['jobOrderID']): ?>
                                <option selected="selected" value="<?php $this->_($pipelinesData['jobOrderID']) ?>"><?php $this->_($pipelinesData['title']) ?></option>
                            <?php else: ?>
                                <option value="<?php $this->_($pipelinesData['jobOrderID']) ?>"><?php $this->_($pipelinesData['title']) ?> (<?php $this->_($pipelinesData['companyName']) ?>)</option>
                            <?php endif; ?>
                        <?php endforeach; ?>
                    </select>
<?php endif; ?>
                </td>
            </tr>

            <tr id="statusTR" <?php if ($this->onlyScheduleEvent): ?>style="display:none;"<?php endif; ?>>
                <td class="tdVertical">
                    <label id="statusIDLabel" for="statusID">Status:</label>
                </td>
                <td class="tdData">
                    <input type="checkbox" name="changeStatus" id="changeStatus" style="margin-left: 0px" onclick="AS_onChangeStatusChange('changeStatus', 'statusID', 'changeStatusSpanB');"<?php if ($this->selectedJobOrderID == -1 || $this->onlyScheduleEvent): ?> disabled<?php endif; ?><?php if ($forceStatusChange): ?> checked="checked"<?php endif; ?> />
                    <span id="changeStatusSpanA"<?php if ($this->selectedJobOrderID == -1): ?> style="color: #aaaaaa;"<?php endif;?>>Change Status</span><br />

                    <div id="changeStatusDiv" style="margin-top: 4px;">
                        <select id="statusID" name="statusID" class="inputbox ui2-input" style="width: 150px;" onchange="AS_onStatusChange(statusesArray, jobOrdersArray, 'regardingID', 'statusID', 'sendEmailCheckTR', 'triggerEmailSpan', 'activityNote', 'activityTypeID', <?php if ($this->isJobOrdersMode): echo $this->selectedJobOrderID; else: ?>null<?php endif; ?>, 'customMessage', 'origionalCustomMessage', 'triggerEmail', statusesArrayString, jobOrdersArrayStringTitle, jobOrdersArrayStringCompany, statusTriggersEmailArray, 'emailIsDisabled');"<?php if ($this->selectedJobOrderID == -1 || $this->onlyScheduleEvent || !$forceStatusChange): ?> disabled<?php endif; ?>>
                            <option value="-1">(Select a Status)</option>

                            <?php if ($this->selectedStatusID == -1): ?>
                                <?php foreach ($this->statusRS as $rowNumber => $statusData): ?>
                                    <option value="<?php $this->_($statusData['statusID']) ?>"><?php $this->_($statusData['status']) ?></option>
                                <?php endforeach; ?>
                            <?php else: ?>
                                <?php foreach ($this->statusRS as $rowNumber => $statusData): ?>
                                    <option <?php if ($this->selectedStatusID == $statusData['statusID']): ?>selected <?php endif; ?>value="<?php $this->_($statusData['statusID']) ?>"><?php $this->_($statusData['status']) ?></option>
                                <?php endforeach; ?>
                            <?php endif; ?>
                        </select>
                        <span id="changeStatusSpanB" style="color: <?php echo($forceStatusChange ? '#000' : '#aaaaaa'); ?>;">&nbsp;*</span>&nbsp;&nbsp;
                        <span id="triggerEmailSpan" style="display: none;"><input type="checkbox" name="triggerEmail" id="triggerEmail" onclick="AS_onSendEmailChange('triggerEmail', 'sendEmailCheckTR', 'visibleTR');" />Send E-Mail Notification to Candidate</span>
                    </div>
                </td>
            </tr>
            <tr id="autoFillTR" <?php if ($this->onlyScheduleEvent): ?>style="display:none;"<?php endif; ?>>
                <td class="tdVertical">
                    <label for="autoFillStages">Auto-fill:</label>
                </td>
                <td class="tdData">
                    <label>
                        <input type="checkbox" name="autoFillStages" id="autoFillStages" value="1" checked="checked" />
                        Auto-fill intermediate stages
                    </label>
                </td>
            </tr>

            <tr id="sendEmailCheckTR" style="display: none;">
                <td class="tdVertical">
                    <label id="triggerEmailLabel" for="triggerEmail">E-Mail:</label>
                </td>
                <td class="tdData">
                    Custom Message<br />
                    <input type="hidden" id="origionalCustomMessage" value="<?php $this->_($this->statusChangeTemplate); ?>" />
                    <input type="hidden" id="emailIsDisabled" value="<?php echo($this->emailDisabled); ?>" />
                    <textarea style="height:135px; width:375px;" name="customMessage" id="customMessage" cols="50" class="inputbox ui2-input"></textarea>
                </td>
            </tr>
            <tr id="statusCommentTR" style="display: none;">
                <td class="tdVertical">
                    <label id="statusCommentLabel" for="statusComment">Status Comment:</label>
                </td>
                <td class="tdData">
                    <textarea name="statusComment" id="statusComment" cols="50" style="width:375px;" class="inputbox ui2-input"></textarea>
                </td>
            </tr>
            <?php if (!empty($this->rejectionReasons)): ?>
            <tr id="rejectionReasonTR" style="display: none;">
                <td class="tdVertical">
                    <label id="rejectionReasonLabel">Rejection Reasons:</label>
                </td>
                <td class="tdData">
                    <div style="margin-bottom: 4px;">
                        <?php foreach ($this->rejectionReasons as $reason): ?>
                            <label>
                                <input type="checkbox" name="rejectionReasonIDs[]" value="<?php echo($reason['reasonID']); ?>" onclick="AS_onRejectionReasonChange();" />
                                <?php $this->_($reason['label']); ?>
                            </label><br />
                        <?php endforeach; ?>
                    </div>
                    <div id="rejectionReasonOtherDiv" style="display: none;">
                        <label id="rejectionReasonOtherLabel" for="rejectionReasonOther">Other Reason:</label><br />
                        <input type="text" name="rejectionReasonOther" id="rejectionReasonOther" class="inputbox" style="width:360px;" disabled="disabled" />
                    </div>
                </td>
            </tr>
            <?php endif; ?>
           <tr id="addActivityTR" <?php if ($this->onlyScheduleEvent || $hideActivity): ?>style="display:none;"<?php endif; ?>>
                <td class="tdVertical">
                    <label id="addActivityLabel" for="addActivity">Activity:</label>
                </td>
                <td class="tdData">
                    <input type="checkbox" name="addActivity" id="addActivity" style="margin-left: 0px;"<?php if (!$this->onlyScheduleEvent && !$hideActivity): ?> checked="checked"<?php endif; ?><?php if ($hideActivity): ?> disabled="disabled"<?php endif; ?> onclick="AS_onAddActivityChange('addActivity', 'activityTypeID', 'activityNote', 'addActivitySpanA', 'addActivitySpanB');" />Log an Activity<br />
                    <div id="activityNoteDiv" style="margin-top: 4px;">
                        <span id="addActivitySpanA">Activity Type</span><br />
                        <select id="activityTypeID" name="activityTypeID" class="inputbox" style="width: 150px; margin-bottom: 4px;"<?php if ($hideActivity): ?> disabled="disabled"<?php endif; ?>>
                            <?php
                                $isFirstActivityType = true;
                                foreach ($this->activityTypes as $activityType):
                            ?>
                                <option value="<?php $this->_($activityType['typeID']); ?>" <?php if ($isFirstActivityType): ?>selected="selected"<?php $isFirstActivityType = false; endif; ?>>
                                    <?php $this->_($activityType['type']); ?>
                                </option>
                            <?php endforeach; ?>
                        </select><br />
                        <span id="addActivitySpanB">Activity Notes</span><br />
                        <textarea name="activityNote" id="activityNote" cols="50" style="margin-bottom: 4px;" class="inputbox"<?php if ($hideActivity): ?> disabled="disabled"<?php endif; ?>></textarea>
                    </div>
                </td>
            </tr>

            <tr id="scheduleEventTR" <?php if ($hideScheduleEvent): ?>style="display:none;"<?php endif; ?>>
                <td class="tdVertical">
                    <label id="scheduleEventLabel" for="scheduleEvent">Schedule Event:</label>
                </td>
                <td class="tdData">
                    <input type="checkbox" name="scheduleEvent" id="scheduleEvent" style="margin-left: 0px; <?php if ($this->onlyScheduleEvent): ?>display:none;<?php endif; ?>" onclick="AS_onScheduleEventChange('scheduleEvent', 'scheduleEventDiv');"<?php if ($this->onlyScheduleEvent): ?> checked="checked"<?php endif; ?><?php if ($hideScheduleEvent): ?> disabled="disabled"<?php endif; ?> /><?php if (!$this->onlyScheduleEvent): ?>Schedule Event<?php endif; ?>
                    <div id="scheduleEventDiv" <?php if (!$this->onlyScheduleEvent): ?>style="display:none;"<?php endif; ?>>
                        <table style="border: none; margin: 0px; padding: 0px;">
                            <tr>
                                <td valign="top">
                                    <div style="margin-bottom: 4px;">
                                        <select id="eventTypeID" name="eventTypeID" class="inputbox" style="width: 150px;">
                                            <?php foreach ($this->calendarEventTypes as $eventType): ?>
                                                <option <?php if ($eventType['typeID'] == CALENDAR_EVENT_INTERVIEW): ?>selected="selected" <?php endif; ?>value="<?php echo($eventType['typeID']); ?>"><?php $this->_($eventType['description']); ?></option>
                                            <?php endforeach; ?>
                                        </select>
                                    </div>

                                    <div style="margin-bottom: 4px;">
                                        <script type="text/javascript">DateInput('dateAdd', true, 'MM-DD-YY', '', -1);</script>
                                    </div>

                                    <div style="margin-bottom: 4px;">
                                        <input type="radio" name="allDay" id="allDay0" value="0" style="margin-left: 0px" checked="checked" onchange="AS_onEventAllDayChange('allDay1');" />
                                        <select id="hour" name="hour" class="inputbox" style="width: 40px;">
                                            <?php for ($i = 1; $i <= 12; ++$i): ?>
                                                <option value="<?php echo($i); ?>"><?php echo(sprintf('%02d', $i)); ?></option>
                                            <?php endfor; ?>
                                        </select>&nbsp;
                                        <select id="minute" name="minute" class="inputbox" style="width: 40px;">
                                            <?php for ($i = 0; $i <= 45; $i = $i + 15): ?>
                                                <option value="<?php echo(sprintf('%02d', $i)); ?>">
                                                    <?php echo(sprintf('%02d', $i)); ?>
                                                </option>
                                            <?php endfor; ?>
                                        </select>&nbsp;
                                        <select id="meridiem" name="meridiem" class="inputbox" style="width: 45px;">
                                            <option value="AM">AM</option>
                                            <option value="PM">PM</option>
                                        </select>
                                    </div>

                                    <div style="margin-bottom: 4px;">
                                        <input type="radio" name="allDay" id="allDay1" value="1" style="margin-left: 0px" onchange="AS_onEventAllDayChange('allDay1');" />All Day / No Specific Time<br />
                                    </div>

                                    <div style="margin-bottom: 4px;">
                                        <input type="checkBox" name="publicEntry" id="publicEntry" style="margin-left: 0px" />Public Entry
                                    </div>
                                </td>

                                <td valign="top">
                                    <div style="margin-bottom: 4px;">
                                        <label id="titleLabel" for="title">Title&nbsp;*</label><br />
                                        <input type="text" class="inputbox" name="title" id="title" style="width: 180px;" />
                                    </div>

                                    <div style="margin-bottom: 4px;">
                                        <label id="durationLabel" for="duration">Length:</label>
                                        <br />
                                        <select id="duration" name="duration" class="inputbox" style="width: 180px;">
                                            <option value="15">15 minutes</option>
                                            <option value="30">30 minutes</option>
                                            <option value="45">45 minutes</option>
                                            <option value="60" selected="selected">1 hour</option>
                                            <option value="90">1.5 hours</option>
                                            <option value="120">2 hours</option>
                                            <option value="180">3 hours</option>
                                            <option value="240">4 hours</option>
                                            <option value="300">More than 4 hours</option>
                                        </select>
                                    </div>
                                    
                                    <div style="margin-bottom: 4px;">
                                        <label id="descriptionLabel" for="description">Description</label><br />
                                        <textarea name="description" id="description" cols="20" class="inputbox" style="width: 180px; height:60px;"></textarea>
                                    </div>

                                    <div <?php if (!$this->allowEventReminders): ?>style="display:none;"<?php endif; ?>>
                                        <input type="checkbox" name="reminderToggle" onclick="if (this.checked) document.getElementById('reminderArea').style.display = ''; else document.getElementById('reminderArea').style.display = '';">&nbsp;<label>Set Reminder</label><br />
                                    </div>
                                    
                                    <div style="display:none;" id="reminderArea">
                                        <div>
                                            <label>E-Mail To:</label><br />
                                            <input type="text" id="sendEmail" name="sendEmail" class="inputbox" style="width: 150px" value="<?php $this->_($this->userEmail); ?>" />
                                        </div>
                                        <div>
                                            <label>Time:</label><br />
                                            <select id="reminderTime" name="reminderTime" style="width: 150px">
                                                <option value="15">15 min early</option>
                                                <option value="30">30 min early</option>
                                                <option value="45">45 min early</option>
                                                <option value="60">1 hour early</option>
                                                <option value="120">2 hours early</option>
                                                <option value="1440">1 day early</option>
                                            </select>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        </table>
                    </div>
                </td>
            </tr>

        </table>
        <input type="button" class="button ui2-button ui2-button--secondary" name="details" id="details" value="Details" onclick="AS_openPipelineStatusDetails();" />&nbsp;
        <input type="submit" class="button ui2-button ui2-button--primary" name="submit" id="submit" value="Save" />&nbsp;
<?php if ($this->isJobOrdersMode): ?>
        <input type="button" class="button ui2-button ui2-button--secondary" name="close" value="Cancel" onclick="parentGoToURL('<?php echo(CATSUtility::getIndexName()); ?>?m=joborders&amp;a=show&amp;jobOrderID=<?php echo($this->selectedJobOrderID); ?>');" />
<?php else: ?>
        <input type="button" class="button ui2-button ui2-button--secondary" name="close" value="Cancel" onclick="parentGoToURL('<?php echo(CATSUtility::getIndexName()); ?>?m=candidates&amp;a=show&amp;candidateID=<?php echo($this->candidateID); ?>');" />
<?php endif; ?>
        </div>

<script type="text/javascript">
    if (<?php echo($forceStatusChange ? 'true' : 'false'); ?>)
    {
        AS_onChangeStatusChange('changeStatus', 'statusID', 'changeStatusSpanB');
    }

    if (typeof AS_applyStatusFilter === 'function')
    {
        AS_applyStatusFilter();
    }

    if (typeof AS_refreshRejectionUI === 'function')
    {
        AS_refreshRejectionUI();
    }
</script>
    </form>

    <script type="text/javascript">
        var changeStatus = document.getElementById('changeStatus');
        if (changeStatus && changeStatus.checked)
        {
            var statusComment = document.getElementById('statusComment');
            if (statusComment)
            {
                statusComment.focus();
            }
        }
    </script>

<?php else: ?>
    <?php if (!empty($this->refreshParentOnClose)): ?>
        <script type="text/javascript">
            if (parent && parent.hidePopWinRefresh)
            {
                parent.hidePopWinRefresh(false);
            }
            else if (parent && parent.hidePopWin)
            {
                parent.hidePopWin(false);
                parent.location.reload();
            }
            else
            {
                if (window.opener)
                {
                    window.opener.location.reload();
                }
                window.close();
            }
        </script>
    <?php endif; ?>
    <?php if (!$this->changesMade): ?>
        <p>No changes have been made.</p>
    <?php else: ?>
         <?php if (!$this->onlyScheduleEvent): ?>
            <?php //FIXME: E-mail stuff. ?>
            <?php if ($this->statusChanged): ?>
                <p>The candidate's status has been changed from <span class="bold"><?php $this->_($this->oldStatusDescription); ?></span> to <span class="bold"><?php $this->_($this->newStatusDescription); ?></span>.</p>
            <?php else: ?>
                <p>The candidate's status has not been changed.</p>
            <?php endif; ?>

            <?php if ($this->activityAdded): ?>
                <?php if (!empty($this->activityDescription)): ?>
                    <p>An activity entry of type <span class="bold"><?php $this->_($this->activityType); ?></span> has been added with the following note: &quot;<?php echo($this->activityDescription); ?>&quot;.</p>
                <?php else: ?>
                    <p>An activity entry of type <span class="bold"><?php $this->_($this->activityType); ?></span> has been added with no notes.</p>
                <?php endif; ?>
            <?php else: ?>
                <p>No activity entries have been added.</p>
            <?php endif; ?>
        <?php endif; ?>
    <?php endif; ?>

    <?php echo($this->eventHTML); ?>

    <?php echo($this->notificationHTML); ?>

    <form>
<?php if ($this->isJobOrdersMode): ?>
        <input type="button" name="close" class="button ui2-button ui2-button--secondary" value="Close" onclick="parentGoToURL('<?php echo(CATSUtility::getIndexName()); ?>?m=joborders&amp;a=show&amp;jobOrderID=<?php echo($this->regardingID); ?>');" />
<?php else: ?>
        <input type="button" name="close" class="button ui2-button ui2-button--secondary" value="Close" onclick="parentGoToURL('<?php echo(CATSUtility::getIndexName()); ?>?m=candidates&amp;a=show&amp;candidateID=<?php echo($this->candidateID); ?>');" />
<?php endif; ?>
    </form>
<?php endif; ?>

    </div>
    </body>
</html>
