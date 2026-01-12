/*
 * CATS
 * Candidate Transform CV Modal
 */

var CandidateTransformCV = (function ()
{
    var pollTimer = null;
    var searchTimer = null;
    var currentJobId = '';
    var currentAttachmentId = '';
    var currentJobOrderId = '';
    var jobOrderOffset = 0;
    var jobOrderLimit = 50;
    var storeAttachment = false;
    var defaultLanguage = 'English';
    var defaultRoleType = 'Technical';
    var config = {
        candidateID: '',
        sessionCookie: ''
    };

    function byId(id)
    {
        return document.getElementById(id);
    }

    function getNodeValue(xml, tagName)
    {
        if (!xml)
        {
            return '';
        }

        var node = xml.getElementsByTagName(tagName).item(0);
        if (!node || !node.firstChild)
        {
            return '';
        }

        return node.firstChild.nodeValue;
    }

    function escapeHTML(text)
    {
        var div = document.createElement('div');
        div.appendChild(document.createTextNode(text));
        return div.innerHTML;
    }

    function setDefaults()
    {
        var languageInput = byId('transformCvLanguage');
        if (languageInput)
        {
            languageInput.value = defaultLanguage;
        }

        var roleInput = byId('transformCvRoleType');
        if (roleInput)
        {
            roleInput.value = defaultRoleType;
        }

        var storeInput = byId('transformCvStore');
        if (storeInput)
        {
            storeInput.checked = false;
        }
    }

    function clearOptions(select)
    {
        while (select.options.length > 0)
        {
            select.remove(0);
        }
    }

    function addOption(select, value, label)
    {
        var option = document.createElement('option');
        option.value = value;
        option.text = label;
        select.options.add(option);
    }

    function setStatus(message, isError)
    {
        var status = byId('transformCvStatus');
        if (!status)
        {
            return;
        }

        status.innerHTML = message;
        status.style.color = isError ? '#b00000' : '#000000';
    }

    function disableSubmit(disabled)
    {
        var button = byId('transformCvSubmit');
        if (button)
        {
            button.disabled = disabled;
        }
    }

    function setPagingVisible(visible)
    {
        var button = byId('transformCvNext');
        if (button)
        {
            button.style.display = visible ? '' : 'none';
        }
    }

    function open()
    {
        var modal = byId('transformCvModal');
        var overlay = byId('transformCvOverlay');

        if (modal)
        {
            modal.style.display = 'block';
        }
        if (overlay)
        {
            overlay.style.display = 'block';
        }

        setStatus('', false);
        disableSubmit(false);
        setDefaults();
        currentJobId = '';
        currentAttachmentId = '';
        currentJobOrderId = '';
        storeAttachment = false;

        var jobSearch = byId('transformCvJobSearch');
        if (jobSearch)
        {
            jobSearch.value = '';
            jobSearch.focus();
        }

        var attachmentSelect = byId('transformCvAttachment');
        if (attachmentSelect && attachmentSelect.disabled)
        {
            setStatus('No eligible attachments available.', true);
            disableSubmit(true);
            setPagingVisible(false);
        }
        else
        {
            loadInitialJobOrders();
        }
    }

    function close()
    {
        var modal = byId('transformCvModal');
        var overlay = byId('transformCvOverlay');

        if (modal)
        {
            modal.style.display = 'none';
        }
        if (overlay)
        {
            overlay.style.display = 'none';
        }

        stopPolling();
    }

    function scheduleSearch()
    {
        if (searchTimer)
        {
            clearTimeout(searchTimer);
        }

        searchTimer = setTimeout(searchJobOrders, 300);
    }

    function searchJobOrders()
    {
        var jobSearch = byId('transformCvJobSearch');
        if (!jobSearch)
        {
            return;
        }

        var query = trim(jobSearch.value);
        if (query === '')
        {
            loadInitialJobOrders();
            return;
        }

        loadJobOrders(query, 0, false);
    }

    function loadInitialJobOrders()
    {
        jobOrderOffset = 0;
        loadJobOrders('', jobOrderOffset, false);
    }

    function loadNextJobOrders()
    {
        jobOrderOffset += jobOrderLimit;
        loadJobOrders('', jobOrderOffset, true);
    }

    function loadJobOrders(query, offset, append)
    {
        var jobSelect = byId('transformCvJobOrder');
        if (!jobSelect)
        {
            return;
        }

        setPagingVisible(query === '');
        setStatus(query === '' ? 'Loading job orders...' : 'Searching...', false);

        var http = AJAX_getXMLHttpObject();
        if (!http)
        {
            setStatus('Browser does not support AJAX.', true);
            return;
        }

        var POSTData = '&query=' + urlEncode(query)
            + '&maxResults=' + jobOrderLimit
            + '&offset=' + offset;

        var callBack = function ()
        {
            if (http.readyState != 4)
            {
                return;
            }

            if (!http.responseXML)
            {
                setStatus('Error searching job orders.', true);
                return;
            }

            var errorCode = getNodeValue(http.responseXML, 'errorcode');
            if (errorCode !== '0')
            {
                var errorMessage = getNodeValue(http.responseXML, 'errormessage');
                setStatus(errorMessage || 'Search failed.', true);
                return;
            }

            if (!append)
            {
                clearOptions(jobSelect);
                if (query === '')
                {
                    addOption(jobSelect, '', 'Select a job order...');
                }
            }

            var nodes = http.responseXML.getElementsByTagName('joborder');
            if (!nodes || nodes.length === 0)
            {
                if (!append)
                {
                    addOption(jobSelect, '', query === '' ? 'No job orders found' : 'No results');
                }
                else
                {
                    jobOrderOffset = Math.max(0, jobOrderOffset - jobOrderLimit);
                }

                var nextButton = byId('transformCvNext');
                if (nextButton)
                {
                    nextButton.disabled = true;
                }

                setStatus('', false);
                return;
            }

            for (var i = 0; i < nodes.length; i++)
            {
                var jobId = getNodeValue(nodes.item(i), 'id');
                var title = getNodeValue(nodes.item(i), 'title');
                var company = getNodeValue(nodes.item(i), 'companyname');
                var label = title;
                if (company !== '')
                {
                    label = title + ' (' + company + ')';
                }
                addOption(jobSelect, jobId, label);
            }

            var nextButton = byId('transformCvNext');
            if (nextButton)
            {
                nextButton.disabled = (query !== '' || nodes.length < jobOrderLimit);
            }

            setStatus('', false);
        };

        AJAX_callCATSFunction(
            http,
            'searchJobOrders',
            POSTData,
            callBack,
            0,
            config.sessionCookie,
            false,
            false
        );
    }

    function submit()
    {
        var attachmentSelect = byId('transformCvAttachment');
        var jobSelect = byId('transformCvJobOrder');
        if (!attachmentSelect || !jobSelect)
        {
            return;
        }

        var attachmentId = attachmentSelect.value;
        var jobOrderId = jobSelect.value;

        if (attachmentId === '')
        {
            setStatus('Select a CV attachment.', true);
            return;
        }
        if (jobOrderId === '')
        {
            setStatus('Select a job order.', true);
            return;
        }

        currentAttachmentId = attachmentId;
        currentJobOrderId = jobOrderId;
        currentJobId = '';

        var storeInput = byId('transformCvStore');
        storeAttachment = (storeInput && storeInput.checked);

        var language = '';
        var roleType = '';
        var languageInput = byId('transformCvLanguage');
        var roleInput = byId('transformCvRoleType');
        if (languageInput)
        {
            language = trim(languageInput.value);
        }
        if (roleInput)
        {
            roleType = trim(roleInput.value);
        }

        disableSubmit(true);
        setStatus('Submitting...', false);

        var http = AJAX_getXMLHttpObject();
        if (!http)
        {
            setStatus('Browser does not support AJAX.', true);
            disableSubmit(false);
            return;
        }

        var POSTData = '&action=create'
            + '&candidateID=' + urlEncode(config.candidateID)
            + '&attachmentID=' + urlEncode(attachmentId)
            + '&jobOrderID=' + urlEncode(jobOrderId);

        if (language !== '')
        {
            POSTData += '&language=' + urlEncode(language);
        }
        if (roleType !== '')
        {
            POSTData += '&roleType=' + urlEncode(roleType);
        }

        var callBack = function ()
        {
            if (http.readyState != 4)
            {
                return;
            }

            if (!http.responseXML)
            {
                setStatus('Error submitting request.', true);
                disableSubmit(false);
                return;
            }

            var errorCode = getNodeValue(http.responseXML, 'errorcode');
            if (errorCode !== '0')
            {
                var errorMessage = getNodeValue(http.responseXML, 'errormessage');
                setStatus(errorMessage || 'Request failed.', true);
                disableSubmit(false);
                return;
            }

            var jobId = getNodeValue(http.responseXML, 'jobid');
            var status = getNodeValue(http.responseXML, 'status');
            if (jobId === '')
            {
                setStatus('Missing job id from server.', true);
                disableSubmit(false);
                return;
            }

            currentJobId = jobId;
            setStatus('Status: ' + status, false);
            startPolling();
        };

        AJAX_callCATSFunction(
            http,
            'talentFitFlowTransform',
            POSTData,
            callBack,
            0,
            config.sessionCookie,
            false,
            false
        );
    }

    function startPolling()
    {
        stopPolling();
        pollTimer = setInterval(pollStatus, 7000);
        pollStatus();
    }

    function stopPolling()
    {
        if (pollTimer)
        {
            clearInterval(pollTimer);
            pollTimer = null;
        }
    }

    function pollStatus()
    {
        if (currentJobId === '')
        {
            return;
        }

        var http = AJAX_getXMLHttpObject();
        if (!http)
        {
            setStatus('Browser does not support AJAX.', true);
            disableSubmit(false);
            stopPolling();
            return;
        }

        var POSTData = '&action=status&jobId=' + urlEncode(currentJobId);

        var callBack = function ()
        {
            if (http.readyState != 4)
            {
                return;
            }

            if (!http.responseXML)
            {
                setStatus('Error checking status.', true);
                disableSubmit(false);
                stopPolling();
                return;
            }

            var errorCode = getNodeValue(http.responseXML, 'errorcode');
            if (errorCode !== '0')
            {
                var errorMessage = getNodeValue(http.responseXML, 'errormessage');
                setStatus(errorMessage || 'Status check failed.', true);
                disableSubmit(false);
                stopPolling();
                return;
            }

            var status = getNodeValue(http.responseXML, 'status');
            if (status === 'COMPLETED')
            {
                var url = getNodeValue(http.responseXML, 'cv_download_url');
                var downloadLink = '';
                if (url !== '')
                {
                    var safeUrl = url.replace(/"/g, '&quot;');
                    downloadLink = '<a href="' + safeUrl + '" target="_blank">Download CV</a>';
                }
                stopPolling();

                if (storeAttachment)
                {
                    setStatus('Saving attachment...', false);
                    storeTransformedAttachment(downloadLink);
                    return;
                }

                if (downloadLink !== '')
                {
                    setStatus('Download available: ' + downloadLink, false);
                }
                else
                {
                    setStatus('Completed.', false);
                }
                disableSubmit(false);
                return;
            }

            if (status === 'FAILED')
            {
                var errorCodeText = getNodeValue(http.responseXML, 'error_code');
                var errorMessageText = getNodeValue(http.responseXML, 'error_message');
                var message = 'Failed.';
                if (errorMessageText !== '')
                {
                    message = 'Failed: ' + errorMessageText;
                }
                else if (errorCodeText !== '')
                {
                    message = 'Failed: ' + errorCodeText;
                }
                setStatus(message, true);
                disableSubmit(false);
                stopPolling();
                return;
            }

            setStatus('Status: ' + status, false);
        };

        AJAX_callCATSFunction(
            http,
            'talentFitFlowTransform',
            POSTData,
            callBack,
            0,
            config.sessionCookie,
            false,
            false
        );
    }

    function storeTransformedAttachment(downloadLink)
    {
        if (currentJobId === '' || currentAttachmentId === '' || currentJobOrderId === '')
        {
            setStatus('Save failed: missing selection.', true);
            disableSubmit(false);
            return;
        }

        var http = AJAX_getXMLHttpObject();
        if (!http)
        {
            setStatus('Save failed: browser does not support AJAX.', true);
            disableSubmit(false);
            return;
        }

        var POSTData = '&action=store'
            + '&candidateID=' + urlEncode(config.candidateID)
            + '&attachmentID=' + urlEncode(currentAttachmentId)
            + '&jobOrderID=' + urlEncode(currentJobOrderId)
            + '&jobId=' + urlEncode(currentJobId);

        var callBack = function ()
        {
            if (http.readyState != 4)
            {
                return;
            }

            if (!http.responseXML)
            {
                setStatus('Save failed.', true);
                disableSubmit(false);
                return;
            }

            var errorCode = getNodeValue(http.responseXML, 'errorcode');
            if (errorCode !== '0')
            {
                var errorMessage = getNodeValue(http.responseXML, 'errormessage');
                var safeMessage = (errorMessage !== '') ? escapeHTML(errorMessage) : 'Save failed.';
                setStatus(safeMessage, true);
                disableSubmit(false);
                return;
            }

            var attachmentName = getNodeValue(http.responseXML, 'attachment_filename');
            var retrievalUrl = getNodeValue(http.responseXML, 'retrieval_url');
            var message = '';
            if (downloadLink !== '')
            {
                message = 'Download available: ' + downloadLink + '. ';
            }
            message += 'Attachment saved';
            if (attachmentName !== '')
            {
                message += ' as ' + escapeHTML(attachmentName);
            }
            if (retrievalUrl !== '')
            {
                var safeRetrievalUrl = retrievalUrl.replace(/"/g, '&quot;');
                message += ' (<a href="' + safeRetrievalUrl + '" target="_blank">View attachment</a>)';
            }

            setStatus(message, false);
            disableSubmit(false);
            setTimeout(function ()
            {
                close();
                window.location.reload();
            }, 300);
        };

        AJAX_callCATSFunction(
            http,
            'talentFitFlowTransform',
            POSTData,
            callBack,
            0,
            config.sessionCookie,
            false,
            false
        );
    }

    function configure(newConfig)
    {
        if (!newConfig)
        {
            return;
        }

        if (typeof newConfig.candidateID !== 'undefined')
        {
            config.candidateID = newConfig.candidateID;
        }
        if (typeof newConfig.sessionCookie !== 'undefined')
        {
            config.sessionCookie = newConfig.sessionCookie;
        }
    }

    return {
        open: open,
        close: close,
        submit: submit,
        scheduleSearch: scheduleSearch,
        loadNext: loadNextJobOrders,
        configure: configure
    };
})();
