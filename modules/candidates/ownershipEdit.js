/*
 * CATS
 * Candidate Ownership Edit (Admin)
 */

var CandidateOwnershipEdit = (function ()
{
    var config = {
        sessionCookie: '',
        candidateID: 0,
        toggleId: 'ownershipEditToggle',
        formId: 'ownershipEditForm',
        createdInputId: 'ownershipCreatedInput',
        ownerSelectId: 'ownershipOwnerSelect',
        reasonId: 'ownershipReason',
        statusId: 'ownershipEditStatus',
        saveId: 'ownershipSave',
        cancelId: 'ownershipCancel',
        createdDisplayId: 'ownershipCreatedDisplay',
        ownerDisplayId: 'ownershipOwnerDisplay'
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
        status.style.color = isError ? '#b00000' : '#0f5132';
    }

    function toggleForm(show)
    {
        var form = byId(config.formId);
        if (!form)
        {
            return;
        }

        if (typeof show === 'undefined')
        {
            show = (form.style.display === 'none' || form.style.display === '');
        }

        form.style.display = show ? '' : 'none';
    }

    function updateDisplay(payload)
    {
        if (payload.created_display)
        {
            var createdDisplay = byId(config.createdDisplayId);
            if (createdDisplay)
            {
                createdDisplay.innerHTML = escapeHTML(payload.created_display);
            }
        }

        if (payload.owner_display)
        {
            var ownerDisplay = byId(config.ownerDisplayId);
            if (ownerDisplay)
            {
                ownerDisplay.innerHTML = escapeHTML(payload.owner_display);
            }
        }

        if (payload.created_input)
        {
            var createdInput = byId(config.createdInputId);
            if (createdInput)
            {
                createdInput.value = payload.created_input;
            }
        }
    }

    function save()
    {
        var createdInput = byId(config.createdInputId);
        var ownerSelect = byId(config.ownerSelectId);
        var reasonInput = byId(config.reasonId);
        var saveButton = byId(config.saveId);

        if (!createdInput || !ownerSelect || !reasonInput)
        {
            setStatus('Form is missing required fields.', true);
            return;
        }

        var createdValue = createdInput.value;
        var ownerValue = ownerSelect.value;
        var reasonValue = reasonInput.value.replace(/^\s+|\s+$/g, '');

        if (createdValue === '')
        {
            setStatus('Created datetime is required.', true);
            return;
        }

        if (ownerValue === '' || ownerValue === '0')
        {
            setStatus('Owner is required.', true);
            return;
        }

        if (reasonValue === '')
        {
            setStatus('Reason is required.', true);
            return;
        }

        var http = AJAX_getXMLHttpObject();
        if (!http)
        {
            setStatus('Browser does not support AJAX.', true);
            return;
        }

        var POSTData = '&action=updateOwnership'
            + '&candidateID=' + urlEncode(config.candidateID)
            + '&createdDateTime=' + urlEncode(createdValue)
            + '&ownerUserID=' + urlEncode(ownerValue)
            + '&reason=' + urlEncode(reasonValue);

        var callBack = function ()
        {
            if (http.readyState != 4)
            {
                return;
            }

            if (!http.responseText)
            {
                setStatus('Request failed.', true);
                if (saveButton) saveButton.disabled = false;
                return;
            }

            var payload = null;
            try
            {
                payload = JSON.parse(http.responseText);
            }
            catch (e)
            {
                setStatus('Request failed.', true);
                if (saveButton) saveButton.disabled = false;
                return;
            }

            if (!payload || payload.success !== 1)
            {
                setStatus((payload && payload.message) ? payload.message : 'Request failed.', true);
                if (saveButton) saveButton.disabled = false;
                return;
            }

            updateDisplay(payload);
            setStatus('Ownership updated.', false);
            reasonInput.value = '';
            toggleForm(false);
            if (saveButton) saveButton.disabled = false;
        };

        if (saveButton)
        {
            saveButton.disabled = true;
        }

        setStatus('Saving...', false);
        AJAX_callCATSFunction(
            http,
            'candidates:ownership',
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
        var toggle = byId(config.toggleId);
        var cancel = byId(config.cancelId);
        var saveButton = byId(config.saveId);

        if (toggle)
        {
            toggle.onclick = function (event)
            {
                if (event && event.preventDefault)
                {
                    event.preventDefault();
                }
                toggleForm();
            };
        }

        if (cancel)
        {
            cancel.onclick = function (event)
            {
                if (event && event.preventDefault)
                {
                    event.preventDefault();
                }
                toggleForm(false);
            };
        }

        if (saveButton)
        {
            saveButton.onclick = function (event)
            {
                if (event && event.preventDefault)
                {
                    event.preventDefault();
                }
                save();
            };
        }
    }

    function configure(newConfig)
    {
        if (!newConfig)
        {
            return;
        }

        for (var key in newConfig)
        {
            if (newConfig.hasOwnProperty(key))
            {
                config[key] = newConfig[key];
            }
        }
    }

    return {
        configure: configure,
        bind: bind
    };
})();
