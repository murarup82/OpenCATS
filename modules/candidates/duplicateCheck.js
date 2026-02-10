/*
 * CATS
 * Candidate Duplicate Check (Pre-save)
 */

var CandidateDuplicateCheck = (function ()
{
    var config = {
        sessionCookie: '',
        isAdmin: false,
        formId: 'addCandidateForm',
        overrideId: 'dupCheckOverride',
        overlayId: 'dupCheckOverlay',
        modalId: 'dupCheckModal',
        titleId: 'dupCheckTitle',
        messageId: 'dupCheckMessage',
        tableId: 'dupCheckTable',
        confirmRowId: 'dupCheckConfirmRow',
        confirmId: 'dupCheckConfirm',
        continueId: 'dupCheckContinue',
        openId: 'dupCheckOpenExisting',
        cancelId: 'dupCheckCancel'
    };

    var state = {
        checking: false,
        lastMatches: []
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

    function trimValue(value)
    {
        if (typeof value !== 'string')
        {
            value = value + '';
        }
        return value.replace(/^\s+|\s+$/g, '');
    }

    function getForm()
    {
        return byId(config.formId);
    }

    function getInputValue(id)
    {
        var node = byId(id);
        if (!node)
        {
            return '';
        }
        return trimValue(node.value);
    }

    function isParsingSubmit()
    {
        var loadDocument = byId('loadDocument');
        var parseDocument = byId('parseDocument');
        if (loadDocument && loadDocument.value === 'true')
        {
            return true;
        }
        if (parseDocument && parseDocument.value === 'true')
        {
            return true;
        }
        return false;
    }

    function resetOverride()
    {
        var override = byId(config.overrideId);
        if (override)
        {
            override.value = '0';
        }
    }

    function showModal()
    {
        var overlay = byId(config.overlayId);
        var modal = byId(config.modalId);
        if (overlay) overlay.style.display = '';
        if (modal) modal.style.display = '';
    }

    function hideModal()
    {
        var overlay = byId(config.overlayId);
        var modal = byId(config.modalId);
        if (overlay) overlay.style.display = 'none';
        if (modal) modal.style.display = 'none';
    }

    function renderTable(matches)
    {
        var html = '';
        html += '<table class="ui2-table" style="width: 100%;">';
        html += '<tr>';
        html += '<th></th>';
        html += '<th align="left">Candidate</th>';
        html += '<th align="left">Email</th>';
        html += '<th align="left">Phone</th>';
        html += '<th align="left">Location</th>';
        html += '<th align="left">Status</th>';
        html += '<th align="left">Match Reasons</th>';
        html += '</tr>';

        for (var i = 0; i < matches.length; i++)
        {
            var row = matches[i];
            var candidateID = row.candidate_id;
            var candidateName = (row.name || '--');
            var email = (row.email || '--');
            var phone = (row.phone || '--');
            var location = '';
            if (row.city) location += row.city;
            if (row.country)
            {
                location += (location !== '' ? ', ' : '') + row.country;
            }
            if (location === '') location = '--';

            var reasons = row.matchReasons ? row.matchReasons.join(', ') : '';
            if (reasons === '') reasons = '--';

            var checked = (i === 0) ? ' checked="checked"' : '';
            html += '<tr>';
            html += '<td><input type="radio" name="dupCheckSelect" value="' + escapeHTML(candidateID) + '"' + checked + ' /></td>';
            html += '<td><a href="' + escapeHTML(CATSIndexName + '?m=candidates&a=show&candidateID=' + candidateID) + '" target="_blank">' + escapeHTML(candidateName) + '</a></td>';
            html += '<td>' + escapeHTML(email) + '</td>';
            html += '<td>' + escapeHTML(phone) + '</td>';
            html += '<td>' + escapeHTML(location) + '</td>';
            html += '<td>' + escapeHTML(row.status || '--') + '</td>';
            html += '<td>' + escapeHTML(reasons) + '</td>';
            html += '</tr>';
        }

        html += '</table>';
        return html;
    }

    function getSelectedCandidateID()
    {
        var radios = document.getElementsByName('dupCheckSelect');
        if (!radios)
        {
            return '';
        }
        for (var i = 0; i < radios.length; i++)
        {
            if (radios[i].checked)
            {
                return radios[i].value;
            }
        }
        return '';
    }

    function submitForm()
    {
        var form = getForm();
        if (form)
        {
            form.submit();
        }
    }

    function configureModal(type, matches)
    {
        var titleNode = byId(config.titleId);
        var messageNode = byId(config.messageId);
        var tableNode = byId(config.tableId);
        var confirmRow = byId(config.confirmRowId);
        var confirmBox = byId(config.confirmId);
        var continueButton = byId(config.continueId);
        var openButton = byId(config.openId);

        var isHard = (type === 'hard');
        if (titleNode)
        {
            titleNode.innerHTML = isHard ? 'Possible duplicate found' : 'Similar candidates found';
        }
        if (messageNode)
        {
            messageNode.innerHTML = isHard
                ? 'A candidate with the same email/phone already exists.'
                : 'Similar candidates were found. Review before continuing.';
        }
        if (tableNode)
        {
            tableNode.innerHTML = renderTable(matches);
        }

        if (confirmRow)
        {
            confirmRow.style.display = (isHard && config.isAdmin) ? '' : 'none';
        }

        if (confirmBox)
        {
            confirmBox.checked = false;
        }

        if (continueButton)
        {
            if (isHard)
            {
                continueButton.value = config.isAdmin ? 'Continue anyway' : 'Continue';
                continueButton.style.display = config.isAdmin ? '' : 'none';
                continueButton.disabled = config.isAdmin ? true : false;
            }
            else
            {
                continueButton.value = 'Continue';
                continueButton.style.display = '';
                continueButton.disabled = false;
            }
        }

        if (openButton)
        {
            openButton.style.display = '';
        }
    }

    function showDuplicateModal(type, matches)
    {
        state.lastMatches = matches || [];
        configureModal(type, state.lastMatches);
        showModal();
    }

    function handleResponse(payload)
    {
        state.checking = false;

        if (!payload || payload.success !== 1)
        {
            submitForm();
            return;
        }

        var hardMatches = payload.hardMatches || [];
        var softMatches = payload.softMatches || [];

        if (hardMatches.length > 0)
        {
            showDuplicateModal('hard', hardMatches);
            return;
        }

        if (softMatches.length > 0)
        {
            showDuplicateModal('soft', softMatches);
            return;
        }

        submitForm();
    }

    function bindActions()
    {
        var confirmBox = byId(config.confirmId);
        var continueButton = byId(config.continueId);
        var cancelButton = byId(config.cancelId);
        var openButton = byId(config.openId);

        if (confirmBox && continueButton)
        {
            confirmBox.onclick = function ()
            {
                continueButton.disabled = !confirmBox.checked;
            };
        }

        if (continueButton)
        {
            continueButton.onclick = function ()
            {
                var override = byId(config.overrideId);
                if (override && config.isAdmin)
                {
                    override.value = '1';
                }
                hideModal();
                submitForm();
            };
        }

        if (cancelButton)
        {
            cancelButton.onclick = function ()
            {
                hideModal();
            };
        }

        if (openButton)
        {
            openButton.onclick = function ()
            {
                var selectedID = getSelectedCandidateID();
                if (selectedID !== '')
                {
                    window.open(
                        CATSIndexName + '?m=candidates&a=show&candidateID=' + selectedID,
                        '_blank'
                    );
                }
                hideModal();
            };
        }
    }

    function onSubmit()
    {
        if (state.checking)
        {
            return false;
        }

        if (isParsingSubmit())
        {
            return true;
        }

        if (typeof checkAddForm !== 'undefined')
        {
            var form = getForm();
            if (form && !checkAddForm(form))
            {
                return false;
            }
        }

        resetOverride();

        var firstName = getInputValue('firstName');
        var lastName = getInputValue('lastName');
        var email = getInputValue('email1');
        var phone = getInputValue('phoneCell');
        var city = getInputValue('city');
        var country = getInputValue('country');

        if (firstName === '' && lastName === '' && email === '' && phone === '' && city === '' && country === '')
        {
            return true;
        }

        var http = AJAX_getXMLHttpObject();
        if (!http)
        {
            return true;
        }

        var POSTData = '&firstName=' + urlEncode(firstName)
            + '&lastName=' + urlEncode(lastName)
            + '&email=' + urlEncode(email)
            + '&phone=' + urlEncode(phone)
            + '&city=' + urlEncode(city)
            + '&country=' + urlEncode(country);

        var callBack = function ()
        {
            if (http.readyState != 4)
            {
                return;
            }

            var payload = null;
            try
            {
                payload = JSON.parse(http.responseText);
            }
            catch (e)
            {
                payload = null;
            }

            handleResponse(payload);
        };

        state.checking = true;
        AJAX_callCATSFunction(
            http,
            'candidates:checkDuplicates',
            POSTData,
            callBack,
            0,
            config.sessionCookie,
            true,
            false
        );

        return false;
    }

    function configure(options)
    {
        if (!options)
        {
            return;
        }

        if (options.sessionCookie)
        {
            config.sessionCookie = options.sessionCookie;
        }
        if (typeof options.isAdmin !== 'undefined')
        {
            config.isAdmin = options.isAdmin ? true : false;
        }

        bindActions();
    }

    return {
        configure: configure,
        onSubmit: onSubmit
    };
})();

