/*
 * CATS
 * Candidate GDPR Request Actions
 */

var GDPRCandidateRequest = (function ()
{
    var config = {
        sessionCookie: '',
        candidateID: 0,
        buttonId: 'gdprSendRequest',
        statusId: 'gdprCandidateStatus'
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
            return;
        }

        status.innerHTML = escapeHTML(message);
        status.style.display = '';
        status.style.color = isError ? '#b00000' : '#0f5132';
    }

    function sendRequest()
    {
        var button = byId(config.buttonId);
        if (button && button.disabled)
        {
            var reason = button.getAttribute('data-disabled-reason');
            setStatus(reason || 'Action unavailable.', true);
            return;
        }
        if (button)
        {
            var requestStatus = button.getAttribute('data-request-status');
            if (requestStatus && requestStatus.toUpperCase() === 'SENT')
            {
                var confirmed = window.confirm(
                    'A GDPR request is already pending for this candidate and is awaiting feedback.\n\n' +
                    'Do you want to resend the request?'
                );
                if (!confirmed)
                {
                    return;
                }
            }
        }

        var http = AJAX_getXMLHttpObject();
        if (!http)
        {
            setStatus('Browser does not support AJAX.', true);
            return;
        }

        var POSTData = '&action=sendCandidate'
            + '&candidateID=' + urlEncode(config.candidateID);

        var callBack = function ()
        {
            if (http.readyState != 4)
            {
                return;
            }

            if (!http.responseXML)
            {
                setStatus('Request failed.', true);
                if (button)
                {
                    button.disabled = false;
                }
                return;
            }

            var errorCode = getNodeValue(http.responseXML, 'errorcode');
            if (errorCode !== '0')
            {
                var errorMessage = getNodeValue(http.responseXML, 'errormessage');
                setStatus(errorMessage || 'Request failed.', true);
                if (button)
                {
                    button.disabled = false;
                }
                return;
            }

            setStatus('GDPR request sent.', false);
            window.setTimeout(function () {
                var url = window.location.href;
                if (url.indexOf('gdpr=') === -1)
                {
                    url += (url.indexOf('?') === -1 ? '?' : '&') + 'gdpr=sent';
                }
                else
                {
                    url = url.replace(/([?&])gdpr=[^&]*/i, '$1gdpr=sent');
                }
                window.location.href = url;
            }, 700);
        };

        if (button)
        {
            button.disabled = true;
        }
        setStatus('Sending GDPR request...', false);
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

    function bind()
    {
        var button = byId(config.buttonId);
        if (!button)
        {
            return;
        }

        button.onclick = function (event)
        {
            if (event && event.preventDefault)
            {
                event.preventDefault();
            }
            sendRequest();
        };
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

        if (typeof newConfig.candidateID !== 'undefined')
        {
            config.candidateID = newConfig.candidateID;
        }

        if (typeof newConfig.buttonId !== 'undefined')
        {
            config.buttonId = newConfig.buttonId;
        }

        if (typeof newConfig.statusId !== 'undefined')
        {
            config.statusId = newConfig.statusId;
        }
    }

    return {
        configure: configure,
        bind: bind,
        send: sendRequest
    };
})();
