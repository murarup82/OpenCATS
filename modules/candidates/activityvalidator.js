/*
 * CATS
 * Candidates Form Validation
 *
 * Copyright (C) 2005 - 2007 Cognizo Technologies, Inc.
 * All rights reserved.
 *
 * $Id: activityvalidator.js 2336 2007-04-14 22:01:51Z will $
 */

function checkActivityForm(form)
{
    var errorMessage = '';

    errorMessage += checkEventTitle();
    errorMessage += checkStatusComment();
    errorMessage += checkRejectionReasons();
    errorMessage += checkTransitionDate();

    if (errorMessage != '')
    {
        alert("Form Error:\n" + errorMessage);
        return false;
    }

    return true;
}

function checkEventTitle()
{
    var errorMessage = '';

    scheduleEvent = document.getElementById('scheduleEvent').checked;
    if (!scheduleEvent)
    {
        return '';
    }

    fieldValue = document.getElementById('title').value;
    fieldLabel = document.getElementById('titleLabel');
    if (fieldValue == '')
    {
        errorMessage = "    - You must enter an event title.\n";

        fieldLabel.style.color = '#ff0000';
    }
    else
    {
        fieldLabel.style.color = '#000';
    }

    return errorMessage;
}

function checkStatusComment()
{
    var changeStatus = document.getElementById('changeStatus');
    var statusComment = document.getElementById('statusComment');
    var statusCommentLabel = document.getElementById('statusCommentLabel');
    if (!changeStatus || !statusComment || !statusCommentLabel)
    {
        return '';
    }

    if (!changeStatus.checked)
    {
        statusCommentLabel.style.color = '#000';
        return '';
    }

    if (statusComment.value.replace(/^\s+|\s+$/g, '') === '')
    {
        statusCommentLabel.style.color = '#ff0000';
        return "    - You must enter a status comment.\n";
    }

    statusCommentLabel.style.color = '#000';
    return '';
}

function checkRejectionReasons()
{
    if (typeof rejectedStatusID === 'undefined')
    {
        return '';
    }

    var changeStatus = document.getElementById('changeStatus');
    var statusSelect = document.getElementById('statusID');
    var reasonLabel = document.getElementById('rejectionReasonLabel');

    if (!changeStatus || !statusSelect || !reasonLabel)
    {
        return '';
    }

    if (!changeStatus.checked || statusSelect.value != rejectedStatusID)
    {
        reasonLabel.style.color = '#000';
        return '';
    }

    var reasonChecks = document.getElementsByName('rejectionReasonIDs[]');
    var anyChecked = false;
    var otherChecked = false;
    for (var i = 0; i < reasonChecks.length; i++)
    {
        if (reasonChecks[i].checked)
        {
            anyChecked = true;
            if (typeof rejectionOtherReasonID !== 'undefined' &&
                reasonChecks[i].value == rejectionOtherReasonID)
            {
                otherChecked = true;
            }
        }
    }

    var errorMessage = '';
    if (!anyChecked)
    {
        reasonLabel.style.color = '#ff0000';
        errorMessage += "    - You must select at least one rejection reason.\n";
    }
    else
    {
        reasonLabel.style.color = '#000';
    }

    if (otherChecked)
    {
        var otherInput = document.getElementById('rejectionReasonOther');
        var otherLabel = document.getElementById('rejectionReasonOtherLabel');
        if (otherInput && otherLabel)
        {
            if (otherInput.value.replace(/^\s+|\s+$/g, '') === '')
            {
                otherLabel.style.color = '#ff0000';
                errorMessage += "    - You must enter the other rejection reason.\n";
            }
            else
            {
                otherLabel.style.color = '#000';
            }
        }
    }

    return errorMessage;
}

function checkTransitionDate()
{
    if (typeof allocatedStatusID === 'undefined')
    {
        return '';
    }

    var changeStatus = document.getElementById('changeStatus');
    var statusSelect = document.getElementById('statusID');
    var dateField = document.getElementById('transitionDate');
    var dateLabel = document.getElementById('transitionDateLabel');

    if (!changeStatus || !statusSelect || !dateField || !dateLabel)
    {
        return '';
    }

    var selectedStatusID = parseInt(statusSelect.value, 10);
    var allocatedStatus = parseInt(allocatedStatusID, 10);
    if (
        !changeStatus.checked ||
        isNaN(selectedStatusID) ||
        selectedStatusID <= 0 ||
        selectedStatusID === allocatedStatus
    )
    {
        dateLabel.style.color = '#000';
        return '';
    }

    var value = dateField.value.replace(/^\s+|\s+$/g, '');
    var datePattern = /^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])-\d{2}$/;

    if (!datePattern.test(value))
    {
        dateLabel.style.color = '#ff0000';
        return "    - You must enter a valid transition date.\n";
    }

    dateLabel.style.color = '#000';
    return '';
}

function checkRejectionDate()
{
    return checkTransitionDate();
}
