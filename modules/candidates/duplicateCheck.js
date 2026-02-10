/*
 * CATS
 * Candidate Duplicate Check (Pre-save)
 */

function _dupBannerGetNodes()
{
    return {
        table: document.getElementById('candidateAlreadyInSystemTable'),
        simple: document.getElementById('candidateAlreadyInSystemSimple'),
        dup: document.getElementById('dupCheckBanner'),
        title: document.getElementById('dupCheckTitle'),
        message: document.getElementById('dupCheckMessage')
    };
}

function _dupBannerIsHidden(node)
{
    if (!node)
    {
        return true;
    }
    return (node.style.display === 'none');
}

function _dupBannerEnsureVisible(nodes)
{
    if (!nodes || !nodes.table)
    {
        return;
    }

    var simpleHidden = _dupBannerIsHidden(nodes.simple);
    var dupHidden = _dupBannerIsHidden(nodes.dup);

    if (simpleHidden && dupHidden)
    {
        if (nodes.simple)
        {
            nodes.simple.style.display = '';
        }
        else if (nodes.dup)
        {
            nodes.dup.style.display = '';
        }
    }
}

function _dupBannerTrim(value)
{
    if (value === null || typeof value === 'undefined')
    {
        return '';
    }
    return (value + '').replace(/^\s+|\s+$/g, '');
}

function showSimpleAlreadyInSystemBanner()
{
    var nodes = _dupBannerGetNodes();
    if (nodes.table) nodes.table.style.display = '';
    if (nodes.simple) nodes.simple.style.display = '';
    if (nodes.dup) nodes.dup.style.display = 'none';
    _dupBannerEnsureVisible(nodes);
}

function showDupCheckBanner(fallbackTitle, fallbackMessage)
{
    var nodes = _dupBannerGetNodes();
    if (nodes.table) nodes.table.style.display = '';
    if (nodes.simple) nodes.simple.style.display = 'none';
    if (nodes.dup) nodes.dup.style.display = '';

    if (nodes.title && _dupBannerTrim(nodes.title.innerHTML) === '')
    {
        nodes.title.innerHTML = fallbackTitle || 'Possible duplicate found';
    }
    if (nodes.message && _dupBannerTrim(nodes.message.innerHTML) === '')
    {
        nodes.message.innerHTML = fallbackMessage || 'This profile may already be in the system.';
    }

    _dupBannerEnsureVisible(nodes);
}

function hideAlreadyInSystemBanner()
{
    var nodes = _dupBannerGetNodes();
    if (nodes.table) nodes.table.style.display = 'none';
    if (nodes.simple) nodes.simple.style.display = 'none';
    if (nodes.dup) nodes.dup.style.display = 'none';
}

function _dupGetSubmitButton()
{
    var button = document.getElementById('addCandidateSubmit');
    if (button)
    {
        return button;
    }

    var form = document.getElementById('addCandidateForm');
    if (!form)
    {
        return null;
    }

    var inputs = form.getElementsByTagName('input');
    for (var i = 0; i < inputs.length; i++)
    {
        if (inputs[i].type === 'submit')
        {
            return inputs[i];
        }
    }

    return null;
}

function _dupAddClass(node, className)
{
    if (!node)
    {
        return;
    }
    if (node.classList)
    {
        node.classList.add(className);
        return;
    }
    var current = node.className || '';
    if ((' ' + current + ' ').indexOf(' ' + className + ' ') === -1)
    {
        node.className = (current ? current + ' ' : '') + className;
    }
}

function _dupRemoveClass(node, className)
{
    if (!node)
    {
        return;
    }
    if (node.classList)
    {
        node.classList.remove(className);
        return;
    }
    var current = (' ' + (node.className || '') + ' ');
    var updated = current.replace(' ' + className + ' ', ' ');
    node.className = updated.replace(/^\s+|\s+$/g, '');
}

function blockAddCandidateButton(reasonText)
{
    var button = _dupGetSubmitButton();
    if (!button)
    {
        return;
    }
    _dupAddClass(button, 'ui2-button--blocked');
    button.disabled = true;
    button.title = reasonText || '';
}

function unblockAddCandidateButton()
{
    var button = _dupGetSubmitButton();
    if (!button)
    {
        return;
    }
    _dupRemoveClass(button, 'ui2-button--blocked');
    button.disabled = false;
    button.title = '';
}

var CandidateDuplicateCheck = (function ()
{
    var config = {
        sessionCookie: '',
        formId: 'addCandidateForm',
        hardOverrideId: 'dupCheckOverride',
        softOverrideId: 'dupSoftOverride',
        bannerTableId: 'candidateAlreadyInSystemTable',
        simpleBannerId: 'candidateAlreadyInSystemSimple',
        bannerId: 'dupCheckBanner',
        titleId: 'dupCheckTitle',
        messageId: 'dupCheckMessage',
        tableId: 'dupCheckTable',
        reviewId: 'dupCheckReview',
        continueId: 'dupCheckContinue',
        openId: 'dupCheckOpenExisting',
        cancelId: 'dupCheckCancel'
    };

    var state = {
        checking: false,
        lastMatches: [],
        lastType: ''
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

    function resetHardOverride()
    {
        var override = byId(config.hardOverrideId);
        if (override)
        {
            override.value = '0';
        }
    }

    function getSoftOverride()
    {
        var override = byId(config.softOverrideId);
        if (!override)
        {
            return false;
        }
        return (override.value === '1');
    }

    function setSoftOverride(enabled)
    {
        var override = byId(config.softOverrideId);
        if (override)
        {
            override.value = enabled ? '1' : '0';
        }
    }

    function showBanner()
    {
        showDupCheckBanner();
    }

    function restoreSimpleBanner()
    {
        if (typeof candidateIsAlreadyInSystem !== 'undefined' && candidateIsAlreadyInSystem)
        {
            showSimpleAlreadyInSystemBanner();
        }
        else
        {
            hideAlreadyInSystemBanner();
        }
    }

    function hideBanner()
    {
        hideAlreadyInSystemBanner();
    }

    function renderTable(matches, selectable)
    {
        var html = '';
        html += '<table class="ui2-table" style="width: 100%;">';
        html += '<tr>';
        if (selectable)
        {
            html += '<th></th>';
        }
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
            if (selectable)
            {
                html += '<td><input type="radio" name="dupCheckSelect" value="' + escapeHTML(candidateID) + '"' + checked + ' /></td>';
            }
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

    function configureBanner(type, matches)
    {
        var titleNode = byId(config.titleId);
        var messageNode = byId(config.messageId);
        var tableNode = byId(config.tableId);
        var reviewButton = byId(config.reviewId);
        var continueButton = byId(config.continueId);
        var openButton = byId(config.openId);

        var isHard = (type === 'hard');
        if (titleNode)
        {
            titleNode.innerHTML = isHard ? 'Possible duplicate found' : 'Similar candidate profiles found';
        }
        if (messageNode)
        {
            messageNode.innerHTML = isHard
                ? 'A candidate with the same email/phone already exists. Please open the existing profile.'
                : 'Similar candidate profiles were found. Please review before creating a duplicate.';
        }
        if (tableNode)
        {
            tableNode.innerHTML = renderTable(matches, isHard);
            tableNode.style.display = isHard ? '' : 'none';
        }

        if (reviewButton)
        {
            reviewButton.style.display = isHard ? 'none' : '';
        }

        if (continueButton)
        {
            continueButton.style.display = isHard ? 'none' : '';
            continueButton.disabled = false;
        }

        if (openButton)
        {
            openButton.style.display = isHard ? '' : 'none';
        }
    }

    function showDuplicateBanner(type, matches)
    {
        state.lastMatches = matches || [];
        state.lastType = type;
        configureBanner(type, state.lastMatches);
        var fallbackTitle = (type === 'hard')
            ? 'Possible duplicate found'
            : 'Similar candidate profiles found';
        var fallbackMessage = (type === 'hard')
            ? 'A candidate with the same email/phone already exists. Please open the existing profile.'
            : 'Similar candidate profiles were found. Please review before creating a duplicate.';
        if (type === 'hard')
        {
            blockAddCandidateButton('Duplicate candidate detected. Please open the existing profile.');
        }
        else
        {
            unblockAddCandidateButton();
        }
        showDupCheckBanner(fallbackTitle, fallbackMessage);
    }

    function handleResponse(payload)
    {
        state.checking = false;

        if (!payload || payload.success !== 1)
        {
            unblockAddCandidateButton();
            submitForm();
            return;
        }

        var hardMatches = payload.hardMatches || [];
        var softMatches = payload.softMatches || [];
        var softOverride = getSoftOverride();

        if (hardMatches.length > 0)
        {
            showDuplicateBanner('hard', hardMatches);
            return;
        }

        if (softMatches.length > 0 && !softOverride)
        {
            showDuplicateBanner('soft', softMatches);
            return;
        }

        unblockAddCandidateButton();
        submitForm();
    }

    function showMatches()
    {
        var tableNode = byId(config.tableId);
        if (tableNode)
        {
            tableNode.style.display = '';
            if (tableNode.scrollIntoView)
            {
                try
                {
                    tableNode.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
                catch (e)
                {
                    tableNode.scrollIntoView();
                }
            }
        }
    }

    function bindFieldChangeReset()
    {
        var fieldIds = ['email1', 'phoneCell', 'firstName', 'lastName'];
        var handler = function ()
        {
            hideAlreadyInSystemBanner();
            unblockAddCandidateButton();
        };

        for (var i = 0; i < fieldIds.length; i++)
        {
            var node = byId(fieldIds[i]);
            if (!node)
            {
                continue;
            }
            if (node.addEventListener)
            {
                node.addEventListener('input', handler, false);
                node.addEventListener('change', handler, false);
            }
            else
            {
                node.onkeyup = handler;
                node.onchange = handler;
            }
        }
    }

    function bindActions()
    {
        var reviewButton = byId(config.reviewId);
        var continueButton = byId(config.continueId);
        var cancelButton = byId(config.cancelId);
        var openButton = byId(config.openId);

        if (reviewButton)
        {
            reviewButton.onclick = function ()
            {
                showMatches();
            };
        }

        if (continueButton)
        {
            continueButton.onclick = function ()
            {
                setSoftOverride(true);
                unblockAddCandidateButton();
                hideBanner();
                submitForm();
            };
        }

        if (cancelButton)
        {
            cancelButton.onclick = function ()
            {
                hideBanner();
                if (state.lastType !== 'hard')
                {
                    unblockAddCandidateButton();
                }
            };
        }

        if (openButton)
        {
            openButton.onclick = function ()
            {
                var selectedID = getSelectedCandidateID();
                if (selectedID === '' && state.lastMatches.length > 0)
                {
                    selectedID = state.lastMatches[0].candidate_id;
                }
                if (selectedID !== '')
                {
                    window.open(
                        CATSIndexName + '?m=candidates&a=show&candidateID=' + selectedID,
                        '_blank'
                    );
                }
                hideBanner();
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

        hideBanner();
        resetHardOverride();

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

        bindActions();
        bindFieldChangeReset();
    }

    return {
        configure: configure,
        onSubmit: onSubmit
    };
})();


