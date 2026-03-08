/*
 * CATS
 * GDPR Requests Actions
 */

var GDPRRequests = (function ()
{
    var config = {
        sessionCookie: '',
        statusId: 'gdprRequestsStatus'
    };
    var inFlight = false;

    var actionMessages = {
        resend: {
            confirm: 'Resend this GDPR request now?',
            progress: 'Resending GDPR request...',
            success: 'GDPR request resent.'
        },
        expire: {
            confirm: 'Expire this request now?',
            progress: 'Expiring request...',
            success: 'Request expired.'
        },
        create: {
            confirm: 'Create and send a new GDPR request now?',
            progress: 'Creating new GDPR request...',
            success: 'New GDPR request created.'
        },
        createLegacy: {
            confirm: 'Send a GDPR renewal request? This creates an audited request record and emails the candidate.',
            progress: 'Sending GDPR renewal request...',
            success: 'GDPR renewal request sent.'
        },
        delete: {
            confirm: 'Delete candidate data? This cannot be undone.',
            progress: 'Deleting candidate data...',
            success: 'Candidate data deleted.'
        },
        deleteRequest: {
            confirm: 'Delete this GDPR request row? This is for test cleanup only.',
            progress: 'Deleting GDPR request row...',
            success: 'GDPR request row deleted.'
        },
        scanLegacy: {
            confirm: 'Scan legacy GDPR proofs now? This may take some time.',
            progress: 'Scanning legacy GDPR proofs...',
            success: 'Legacy GDPR proof scan complete.'
        }
    };

    function byId(id)
    {
        return document.getElementById(id);
    }

    function escapeHTML(text)
    {
        var value = text + '';
        value = value.replace(/&/g, '&amp;');
        value = value.replace(/</g, '&lt;');
        value = value.replace(/>/g, '&gt;');
        value = value.replace(/"/g, '&quot;');
        value = value.replace(/'/g, '&#39;');
        return value;
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

    function setStatus(message, isError)
    {
        var status = byId(config.statusId);
        if (!status)
        {
            if (message)
            {
                alert(message);
            }
            return;
        }

        status.innerHTML = escapeHTML(message);
        status.style.display = '';
        if (isError)
        {
            status.style.color = '#b00000';
            status.style.borderLeftColor = '#b00000';
        }
        else
        {
            status.style.color = '#0f5132';
            status.style.borderLeftColor = '#0f5132';
        }
    }

    function getActionMessage(action, key, fallback)
    {
        if (actionMessages[action] && actionMessages[action][key])
        {
            return actionMessages[action][key];
        }

        return fallback;
    }

    function updateActionButtons()
    {
        var buttons = document.querySelectorAll('.gdpr-request-action');
        var i;
        for (i = 0; i < buttons.length; i++)
        {
            buttons[i].disabled = inFlight;
        }

        var scanButton = byId('gdprScanLegacyButton');
        if (scanButton)
        {
            scanButton.disabled = inFlight;
        }
    }

    function requestActionWithParams(action, extraParams, options)
    {
        options = options || {};
        if (inFlight)
        {
            setStatus('Another GDPR action is already running. Please wait.', true);
            return;
        }

        var http = AJAX_getXMLHttpObject();
        if (!http)
        {
            setStatus('Browser does not support AJAX.', true);
            return;
        }

        var POSTData = '&action=' + urlEncode(action);
        if (extraParams)
        {
            POSTData += extraParams;
        }

        var callBack = function ()
        {
            if (http.readyState != 4)
            {
                return;
            }

            if (!http.responseXML)
            {
                inFlight = false;
                updateActionButtons();
                setStatus('Request failed.', true);
                return;
            }

            var errorCode = getNodeValue(http.responseXML, 'errorcode');
            if (errorCode !== '0')
            {
                inFlight = false;
                updateActionButtons();
                var errorMessage = getNodeValue(http.responseXML, 'errormessage');
                setStatus(errorMessage || 'Request failed.', true);
                return;
            }

            var responseMessage = getNodeValue(http.responseXML, 'response');
            var successMessage = options.successMessage || getActionMessage(action, 'success', 'Action completed.');
            if (responseMessage)
            {
                successMessage = responseMessage;
            }
            setStatus(successMessage, false);

            inFlight = false;
            updateActionButtons();
            window.location.reload();
        };

        inFlight = true;
        updateActionButtons();
        setStatus(options.progressMessage || getActionMessage(action, 'progress', 'Working...'), false);
        AJAX_callCATSFunction(
            http,
            'gdpr:requests',
            POSTData,
            callBack,
            0,
            config.sessionCookie,
            false,
            false
        );
    }

    function requestAction(action, requestID)
    {
        requestActionWithParams(action, '&requestID=' + urlEncode(requestID), {});
    }

    function confirmAction(action)
    {
        return confirm(getActionMessage(action, 'confirm', 'Run this GDPR action?'));
    }

    function action(actionName, requestID)
    {
        if (!confirmAction(actionName))
        {
            return;
        }

        requestAction(actionName, requestID);
    }

    function actionCandidate(actionName, candidateID)
    {
        if (!confirmAction(actionName))
        {
            return;
        }

        requestActionWithParams(actionName, '&candidateID=' + urlEncode(candidateID), {});
    }

    function scanLegacy()
    {
        if (!confirmAction('scanLegacy'))
        {
            return;
        }

        requestActionWithParams('scanLegacy', '', {});
    }

    function bind()
    {
        document.addEventListener('click', function (event)
        {
            var trigger = event.target;
            if (!trigger)
            {
                return;
            }

            var actionButton = trigger.closest ? trigger.closest('.gdpr-request-action') : null;
            if (actionButton)
            {
                event.preventDefault();
                var actionName = actionButton.getAttribute('data-gdpr-action') || '';
                var requestID = actionButton.getAttribute('data-gdpr-request-id') || '';
                var candidateID = actionButton.getAttribute('data-gdpr-candidate-id') || '';
                if (actionName === '')
                {
                    return;
                }
                if (candidateID !== '')
                {
                    actionCandidate(actionName, candidateID);
                    return;
                }
                action(actionName, requestID);
                return;
            }

            var scanButton = trigger.closest ? trigger.closest('#gdprScanLegacyButton') : null;
            if (scanButton)
            {
                event.preventDefault();
                scanLegacy();
            }
        });
    }

    function configure(newConfig)
    {
        if (!newConfig)
        {
            return;
        }

        if (typeof newConfig.sessionCookie !== 'undefined')
        {
            config.sessionCookie = newConfig.sessionCookie;
        }

        if (typeof newConfig.statusId !== 'undefined')
        {
            config.statusId = newConfig.statusId;
        }
    }

    return {
        configure: configure,
        bind: bind,
        action: action,
        actionCandidate: actionCandidate,
        scanLegacy: scanLegacy
    };
})();
