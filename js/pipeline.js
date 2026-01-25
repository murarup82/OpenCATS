/*
 * CATS
 * Pipeline JavaScript Library
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
 * $Id: pipeline.js 1936 2007-02-22 23:35:46Z will $
 */

var _sortBy;
var _sortDirection;
var _includeClosed = 0;

function PipelineDetails_populate(candidateJobOrderID, htmlObjectID, sessionCookie)
{
    var http = AJAX_getXMLHttpObject();

    /* Build HTTP POST data. */
    var POSTData = '&candidateJobOrderID=' + urlEncode(candidateJobOrderID);
    POSTData += '&htmlObjectID=' + urlEncode(htmlObjectID);

    /* Anonymous callback function triggered when HTTP response is received. */
    var callBack = function ()
    {
        if (http.readyState != 4)
        {
            return;
        }

        document.getElementById(htmlObjectID).innerHTML = http.responseText;
    }

    AJAX_callCATSFunction(
        http,
        'getPipelineDetails',
        POSTData,
        callBack,
        0,
        sessionCookie,
        false,
        false
    );
}

function PipelineStatusHistoryEdit(historyID, currentDate, candidateJobOrderID, htmlObjectID, sessionCookie)
{
    var newDate = prompt('New timestamp (YYYY-MM-DD HH:MM:SS):', currentDate);
    if (newDate === null)
    {
        return false;
    }

    newDate = newDate.replace(/^\s+|\s+$/g, '');
    if (newDate === '')
    {
        alert('Timestamp is required.');
        return false;
    }

    var editNote = prompt('Edit note (required):');
    if (editNote === null)
    {
        return false;
    }

    editNote = editNote.replace(/^\s+|\s+$/g, '');
    if (editNote === '')
    {
        alert('Edit note is required.');
        return false;
    }

    var http = AJAX_getXMLHttpObject();
    var POSTData = '&historyID=' + urlEncode(historyID);
    POSTData += '&newDate=' + urlEncode(newDate);
    POSTData += '&editNote=' + urlEncode(editNote);

    var callBack = function ()
    {
        if (http.readyState != 4)
        {
            return;
        }

        if (!http.responseXML)
        {
            alert('An error occurred while receiving a response from the server.');
            return;
        }

        var errorCodeNode = http.responseXML.getElementsByTagName('errorcode').item(0);
        var errorMessageNode = http.responseXML.getElementsByTagName('errormessage').item(0);
        if (!errorCodeNode.firstChild || errorCodeNode.firstChild.nodeValue != '0')
        {
            var errorMessage = 'An error occurred while updating the history timestamp.';
            if (errorMessageNode.firstChild)
            {
                errorMessage += "\n\n" + errorMessageNode.firstChild.nodeValue;
            }
            alert(errorMessage);
            return;
        }

        PipelineDetails_populate(candidateJobOrderID, htmlObjectID, sessionCookie);
    };

    AJAX_callCATSFunction(
        http,
        'editPipelineStatusHistory',
        POSTData,
        callBack,
        0,
        sessionCookie,
        false,
        false
    );

    return false;
}

function PipelineHistoryPurge(candidateJobOrderID, htmlObjectID, sessionCookie)
{
    if (!confirm('This will permanently delete this pipeline entry and its status history. Continue?'))
    {
        return false;
    }

    var http = AJAX_getXMLHttpObject();
    var POSTData = '&candidateJobOrderID=' + urlEncode(candidateJobOrderID);

    var callBack = function ()
    {
        if (http.readyState != 4)
        {
            return;
        }

        if (!http.responseXML)
        {
            alert('An error occurred while receiving a response from the server.');
            return;
        }

        var errorCodeNode = http.responseXML.getElementsByTagName('errorcode').item(0);
        var errorMessageNode = http.responseXML.getElementsByTagName('errormessage').item(0);
        if (!errorCodeNode.firstChild || errorCodeNode.firstChild.nodeValue != '0')
        {
            var errorMessage = 'An error occurred while purging the pipeline entry.';
            if (errorMessageNode.firstChild)
            {
                errorMessage += "\n\n" + errorMessageNode.firstChild.nodeValue;
            }
            alert(errorMessage);
            return;
        }

        var detailsContainer = document.getElementById(htmlObjectID);
        var rowNumber = htmlObjectID.replace(/[^0-9]/g, '');
        var removed = false;
        if (rowNumber !== '')
        {
            var row = document.getElementById('pipelineRow' + rowNumber);
            var detailsRow = document.getElementById('pipelineDetails' + rowNumber);
            if (row && row.parentNode)
            {
                row.parentNode.removeChild(row);
                removed = true;
            }
            if (detailsRow && detailsRow.parentNode)
            {
                detailsRow.parentNode.removeChild(detailsRow);
                removed = true;
            }
        }

        if (!removed && detailsContainer)
        {
            PipelineDetails_populate(candidateJobOrderID, htmlObjectID, sessionCookie);
        }
    };

    AJAX_callCATSFunction(
        http,
        'purgePipelineHistory',
        POSTData,
        callBack,
        0,
        sessionCookie,
        false,
        false
    );

    return false;
}

function PipelineJobOrder_setLimitDefaultVars(sortBy, sortDirection, includeClosed)
{
    _sortBy = sortBy;
    _sortDirection = sortDirection;
    if (typeof includeClosed !== 'undefined')
    {
        _includeClosed = includeClosed;
    }
}

function PipelineJobOrder_getIncludeClosed()
{
    var checkbox = document.getElementById('pipelineShowClosed');
    if (checkbox)
    {
        _includeClosed = checkbox.checked ? 1 : 0;
    }

    return _includeClosed;
}

function PipelineJobOrder_changeLimit(joborderID, entriesPerPage, isPopup, htmlObjectID, sessionCookie, indicatorID, indexFile)
{
    PipelineJobOrder_populate(joborderID, 0, entriesPerPage, _sortBy, _sortDirection, isPopup, htmlObjectID, sessionCookie, indicatorID, indexFile, PipelineJobOrder_getIncludeClosed());
}

function PipelineJobOrder_populate(joborderID, page, entriesPerPage, sortBy,
    sortDirection, isPopup, htmlObjectID, sessionCookie, indicatorID, indexFile, includeClosed)
{
    var http = AJAX_getXMLHttpObject();
    if (typeof includeClosed === 'undefined')
    {
        includeClosed = PipelineJobOrder_getIncludeClosed();
    }

    /* Build HTTP POST data. */
    var POSTData = '&joborderID=' + joborderID;
    POSTData += '&page=' + page;
    POSTData += '&entriesPerPage=' + entriesPerPage;
    POSTData += '&sortBy=' + urlEncode(sortBy);
    POSTData += '&sortDirection=' + urlEncode(sortDirection);
    POSTData += '&indexFile=' + urlEncode(indexFile);
    POSTData += '&isPopup=' + urlEncode(isPopup);
    POSTData += '&includeClosed=' + urlEncode(includeClosed);

    document.getElementById(indicatorID).style.display = '';

    /* Anonymous callback function triggered when HTTP response is received. */
    var callBack = function ()
    {
        if (http.readyState != 4)
        {
            return;
        }

        document.getElementById(indicatorID).style.display = 'none';

        document.getElementById(htmlObjectID).innerHTML = http.responseText;

        execJS(http.responseText);
    }

    AJAX_callCATSFunction(
        http,
        'getPipelineJobOrder',
        POSTData,
        callBack,
        55000,
        sessionCookie,
        false,
        false
    );
}


function selectAll_candidates(el){
	var pipeline=document.getElementsByName('checked');
	for(var i=0;i<pipeline.length;i++){
		pipeline[i].checked=el.checked;
	}
}

function getSelected_candidates(){
	var exportArray=[];
	var pipeline=document.getElementsByName('checked');

	for(var i=0;i<pipeline.length;i++){
		if (pipeline[i].checked){
			exportArray.push(pipeline[i].value);
		}
	}
	return exportArray;
}

function PipelinePromptRemove(url)
{
    showPopWin(url + '&display=popup', 520, 260, null);
    return false;
}
