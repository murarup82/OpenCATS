/*
 * CATS
 * GDPR Requests Actions
 */

var GDPRRequests = (function ()
{
    var config = {
        sessionCookie: ''
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
        var status = byId('gdprRequestsStatus');
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
        status.style.color = isError ? '#b00000' : '#0f5132';
    }

    function requestAction(action, requestID)
    {
        var http = AJAX_getXMLHttpObject();
        if (!http)
        {
            setStatus('Browser does not support AJAX.', true);
            return;
        }

        var POSTData = '&action=' + urlEncode(action)
            + '&requestID=' + urlEncode(requestID);

        var callBack = function ()
        {
            if (http.readyState != 4)
            {
                return;
            }

            if (!http.responseXML)
            {
                setStatus('Request failed.', true);
                return;
            }

            var errorCode = getNodeValue(http.responseXML, 'errorcode');
            if (errorCode !== '0')
            {
                var errorMessage = getNodeValue(http.responseXML, 'errormessage');
                setStatus(errorMessage || 'Request failed.', true);
                return;
            }

            setStatus('Action completed.', false);
            window.location.reload();
        };

        setStatus('Working...', false);
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

    function confirmAction(action)
    {
        if (action === 'delete')
        {
            return confirm('Delete candidate data? This cannot be undone.');
        }

        if (action === 'expire')
        {
            return confirm('Expire this request now?');
        }

        return true;
    }

    function action(actionName, requestID)
    {
        if (!confirmAction(actionName))
        {
            return;
        }

        requestAction(actionName, requestID);
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
    }

    return {
        configure: configure,
        action: action
    };
})();
