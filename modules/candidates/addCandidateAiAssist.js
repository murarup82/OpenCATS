/*
 * CATS
 * Add Candidate - AI Prefill (TalentFitFlow)
 */

var AddCandidateAiAssist = (function ()
{
    var pollTimer = null;
    var pollDelay = 2000;
    var maxDelay = 10000;
    var currentJobId = '';
    var undoStore = {};
    var undoMeta = {};
    var config = {
        sessionCookie: '',
        actor: ''
    };

    function byId(id)
    {
        return document.getElementById(id);
    }

    function safeTrim(text)
    {
        if (typeof trim === 'function')
        {
            return trim(text + '');
        }

        return (text + '').replace(/^\s*|\s*$/g, '');
    }

    function isArray(value)
    {
        return Object.prototype.toString.call(value) === '[object Array]';
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
        var status = byId('aiPrefillStatus');
        if (!status)
        {
            return;
        }

        status.innerHTML = escapeHTML(message);
        status.style.color = isError ? '#b00000' : '#000000';
    }

    function setButtonDisabled(disabled)
    {
        var button = byId('aiPrefillButton');
        if (button)
        {
            button.disabled = disabled;
        }
    }

    function setUndoVisible(visible)
    {
        var button = byId('aiPrefillUndo');
        if (button)
        {
            button.style.display = visible ? '' : 'none';
        }
    }

    function resetUndo()
    {
        undoStore = {};
        undoMeta = {};
        setUndoVisible(false);
    }

    function storeUndo(el)
    {
        if (!el || !el.id)
        {
            return;
        }

        if (!undoStore.hasOwnProperty(el.id))
        {
            undoStore[el.id] = el.value;
            undoMeta[el.id] = {
                placeholder: el.placeholder,
                title: el.title
            };
        }
    }

    function isFieldEmpty(el)
    {
        if (!el)
        {
            return true;
        }

        return safeTrim(el.value) === '';
    }

    function applyValue(el, value)
    {
        storeUndo(el);
        el.value = value;
        el.setAttribute('data-ai-prefilled', '1');
    }

    function applySuggestion(el, value, confidence)
    {
        if (!el)
        {
            return;
        }

        storeUndo(el);
        if (isFieldEmpty(el))
        {
            el.placeholder = 'Suggested: ' + value;
        }
        el.title = 'AI suggestion (confidence: ' + confidence + ')';
        el.setAttribute('data-ai-suggested', '1');
    }

    function parseJson(jsonText)
    {
        if (jsonText === '')
        {
            return null;
        }

        if (window.JSON && typeof window.JSON.parse === 'function')
        {
            try
            {
                return window.JSON.parse(jsonText);
            }
            catch (e)
            {
                return null;
            }
        }

        try
        {
            return eval('(' + jsonText + ')');
        }
        catch (e2)
        {
            return null;
        }
    }

    function buildConsentJson(actor)
    {
        var payload = {
            consent_given: true,
            timestamp: new Date().toISOString(),
            actor: actor || ''
        };

        if (window.JSON && typeof window.JSON.stringify === 'function')
        {
            try
            {
                return window.JSON.stringify(payload);
            }
            catch (e)
            {
            }
        }

        var safeActor = (payload.actor + '').replace(/\\/g, '\\\\').replace(/"/g, '\\"');
        return '{"consent_given":true,"timestamp":"' + payload.timestamp + '","actor":"' + safeActor + '"}';
    }

    function coerceValue(value)
    {
        if (value === null || typeof value === 'undefined')
        {
            return '';
        }

        if (typeof value === 'string' || typeof value === 'number')
        {
            return String(value);
        }

        if (isArray(value))
        {
            if (value.length === 0)
            {
                return '';
            }

            var first = value[0];
            if (first && typeof first === 'object' && typeof first.value !== 'undefined')
            {
                return coerceValue(first.value);
            }
            return String(first);
        }

        if (typeof value === 'object')
        {
            if (typeof value.value !== 'undefined')
            {
                return coerceValue(value.value);
            }
            if (typeof value.name !== 'undefined')
            {
                return String(value.name);
            }
        }

        return '';
    }

    function applyCandidateValue(fieldId, value, confidence, label, suggestions)
    {
        var el = byId(fieldId);
        if (!el)
        {
            return false;
        }

        if (value === '')
        {
            return false;
        }

        var numericConfidence = parseFloat(confidence);
        if (isNaN(numericConfidence))
        {
            numericConfidence = 0;
        }

        if (numericConfidence >= 0.85 && isFieldEmpty(el))
        {
            applyValue(el, value);
            return true;
        }

        if (isFieldEmpty(el))
        {
            applySuggestion(el, value, numericConfidence.toFixed(2));
        }

        suggestions.push(label + ': ' + value + ' (confidence ' + numericConfidence.toFixed(2) + ')');
        return false;
    }

    function applyCandidateData(candidate, status, warnings)
    {
        var suggestions = [];
        var changed = false;
        var formattedWarnings = [];

        if (warnings && warnings.length)
        {
            for (var w = 0; w < warnings.length; w++)
            {
                var warning = warnings[w];
                if (!warning)
                {
                    continue;
                }

                if (typeof warning === 'string')
                {
                    formattedWarnings.push(warning);
                    continue;
                }

                if (typeof warning === 'object')
                {
                    var code = warning.code ? String(warning.code) : '';
                    var message = warning.message ? String(warning.message) : '';
                    if (code !== '' && message !== '')
                    {
                        formattedWarnings.push(code + ': ' + message);
                    }
                    else if (message !== '')
                    {
                        formattedWarnings.push(message);
                    }
                    else if (code !== '')
                    {
                        formattedWarnings.push(code);
                    }
                }
            }
        }

        if (!candidate)
        {
            if (formattedWarnings.length)
            {
                setStatus('AI Prefill completed, but no data was returned. Warnings: ' + formattedWarnings.join(' | '), false);
            }
            else
            {
                setStatus('AI Prefill completed, but no data was returned.', false);
            }
            return;
        }

        if (candidate.first_name)
        {
            changed = applyCandidateValue(
                'firstName',
                coerceValue(candidate.first_name.value),
                candidate.first_name.confidence,
                'First Name',
                suggestions
            ) || changed;
        }
        if (candidate.last_name)
        {
            changed = applyCandidateValue(
                'lastName',
                coerceValue(candidate.last_name.value),
                candidate.last_name.confidence,
                'Last Name',
                suggestions
            ) || changed;
        }
        if (candidate.email)
        {
            changed = applyCandidateValue(
                'email1',
                coerceValue(candidate.email.value),
                candidate.email.confidence,
                'E-Mail',
                suggestions
            ) || changed;
        }
        if (candidate.phone)
        {
            changed = applyCandidateValue(
                'phoneCell',
                coerceValue(candidate.phone.value),
                candidate.phone.confidence,
                'Cell Phone',
                suggestions
            ) || changed;
        }

        if (candidate.location && typeof candidate.location.value !== 'undefined')
        {
            var locationValue = candidate.location.value;
            var locationConfidence = candidate.location.confidence;

            if (typeof locationValue === 'string')
            {
                changed = applyCandidateValue(
                    'address',
                    locationValue,
                    locationConfidence,
                    'Address',
                    suggestions
                ) || changed;
            }
            else if (typeof locationValue === 'object' && locationValue !== null)
            {
                if (locationValue.address)
                {
                    changed = applyCandidateValue(
                        'address',
                        coerceValue(locationValue.address),
                        locationConfidence,
                        'Address',
                        suggestions
                    ) || changed;
                }
                if (locationValue.city)
                {
                    changed = applyCandidateValue(
                        'city',
                        coerceValue(locationValue.city),
                        locationConfidence,
                        'City',
                        suggestions
                    ) || changed;
                }
                if (locationValue.country)
                {
                    changed = applyCandidateValue(
                        'country',
                        coerceValue(locationValue.country),
                        locationConfidence,
                        'Country',
                        suggestions
                    ) || changed;
                }
            }
        }

        if (candidate.skills && isArray(candidate.skills))
        {
            var skillValues = [];
            var skillSuggestions = [];
            for (var i = 0; i < candidate.skills.length; i++)
            {
                var skill = candidate.skills[i];
                if (!skill)
                {
                    continue;
                }

                var skillName = coerceValue(skill.name);
                if (skillName === '')
                {
                    continue;
                }

                var skillConfidence = parseFloat(skill.confidence);
                if (isNaN(skillConfidence))
                {
                    skillConfidence = 0;
                }

                if (skillConfidence >= 0.85)
                {
                    skillValues.push(skillName);
                }
                else
                {
                    skillSuggestions.push(skillName + ' (' + skillConfidence.toFixed(2) + ')');
                }
            }

            if (skillValues.length > 0)
            {
                changed = applyCandidateValue(
                    'keySkills',
                    skillValues.join(', '),
                    0.85,
                    'Key Skills',
                    suggestions
                ) || changed;
            }
            else if (skillSuggestions.length > 0)
            {
                suggestions.push('Key Skills: ' + skillSuggestions.join(', '));
            }
        }

        if (candidate.summary)
        {
            var summaryValue = coerceValue(candidate.summary.value);
            var summaryConfidence = candidate.summary.confidence;
            var notesEl = byId('notes');
            if (notesEl && summaryValue !== '')
            {
                var numericSummary = parseFloat(summaryConfidence);
                if (isNaN(numericSummary))
                {
                    numericSummary = 0;
                }

                if (numericSummary >= 0.85 && isFieldEmpty(notesEl))
                {
                    applyValue(notesEl, summaryValue);
                    changed = true;
                }
                else
                {
                    if (isFieldEmpty(notesEl))
                    {
                        applySuggestion(notesEl, summaryValue, numericSummary.toFixed(2));
                    }
                    suggestions.push('Summary: ' + summaryValue + ' (confidence ' + numericSummary.toFixed(2) + ')');
                }
            }
        }

        var warningMessage = '';
        if (formattedWarnings.length)
        {
            warningMessage = 'Warnings: ' + formattedWarnings.join(' | ');
        }

        var statusLabel = (status === 'PARTIAL') ? 'AI Prefill completed (partial).' : 'AI Prefill completed.';
        if (suggestions.length)
        {
            statusLabel += ' Suggestions: ' + suggestions.join(' | ');
        }
        if (warningMessage !== '')
        {
            statusLabel += ' ' + warningMessage;
        }

        setStatus(statusLabel, false);
        if (changed || suggestions.length)
        {
            setUndoVisible(true);
        }
    }

    function startPolling()
    {
        stopPolling();
        pollDelay = 2000;
        pollStatus();
    }

    function stopPolling()
    {
        if (pollTimer)
        {
            clearTimeout(pollTimer);
            pollTimer = null;
        }
    }

    function scheduleNextPoll()
    {
        pollDelay = Math.min(maxDelay, pollDelay * 2);
        pollTimer = setTimeout(pollStatus, pollDelay);
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
            setButtonDisabled(false);
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
                setStatus('Error checking AI status.', true);
                setButtonDisabled(false);
                stopPolling();
                return;
            }

            var errorCode = getNodeValue(http.responseXML, 'errorcode');
            if (errorCode !== '0')
            {
                var errorMessage = getNodeValue(http.responseXML, 'errormessage');
                setStatus(errorMessage || 'Status check failed.', true);
                setButtonDisabled(false);
                stopPolling();
                return;
            }

            var status = getNodeValue(http.responseXML, 'status');
            if (status === 'PENDING' || status === 'RUNNING')
            {
                setStatus('Status: ' + status + '...', false);
                scheduleNextPoll();
                return;
            }

            var errorMessage = getNodeValue(http.responseXML, 'error_message');
            var errorCode = getNodeValue(http.responseXML, 'error_code');
            if (status === 'FAILED' || status === 'NOT_FOUND' || errorCode === 'NOT_FOUND')
            {
                if (errorCode === 'NOT_FOUND' || status === 'NOT_FOUND')
                {
                    setStatus('Job expired or not found; please retry.', true);
                }
                else
                {
                    setStatus(errorMessage || 'AI Prefill failed.', true);
                }
                setButtonDisabled(false);
                stopPolling();
                return;
            }

            if (status !== 'COMPLETED' && status !== 'PARTIAL')
            {
                setStatus('Unexpected status: ' + status, true);
                setButtonDisabled(false);
                stopPolling();
                return;
            }

            var candidateJson = getNodeValue(http.responseXML, 'candidate_json');
            var warningsJson = getNodeValue(http.responseXML, 'warnings_json');
            var candidate = parseJson(candidateJson);
            var warnings = parseJson(warningsJson);
            if (!warnings || !isArray(warnings))
            {
                warnings = [];
            }

            applyCandidateData(candidate, status, warnings);
            setButtonDisabled(false);
            stopPolling();
        };

        AJAX_callCATSFunction(
            http,
            'talentFitFlowCandidateParse',
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
        var tempFile = byId('documentTempFile');
        if (!tempFile || safeTrim(tempFile.value) === '')
        {
            setStatus('Upload a resume first.', true);
            return;
        }

        var consentCheckbox = byId('aiPrefillConsent');
        if (consentCheckbox && !consentCheckbox.checked)
        {
            setStatus('Consent is required to run AI Prefill.', true);
            return;
        }

        resetUndo();
        setButtonDisabled(true);
        setStatus('Submitting AI Prefill request...', false);

        var http = AJAX_getXMLHttpObject();
        if (!http)
        {
            setStatus('Browser does not support AJAX.', true);
            setButtonDisabled(false);
            return;
        }

        var consentJson = buildConsentJson(config.actor);
        var requestedFields = '["first_name","last_name","email","phone","location","skills","summary"]';
        var idempotencyKey = safeTrim(tempFile.value);

        var POSTData = '&action=create'
            + '&documentTempFile=' + urlEncode(tempFile.value)
            + '&consent=' + urlEncode(consentJson)
            + '&requested_fields=' + urlEncode(requestedFields)
            + '&idempotency_key=' + urlEncode(idempotencyKey);

        var callBack = function ()
        {
            if (http.readyState != 4)
            {
                return;
            }

            if (!http.responseXML)
            {
                setStatus('Error submitting AI Prefill request.', true);
                setButtonDisabled(false);
                return;
            }

            var errorCode = getNodeValue(http.responseXML, 'errorcode');
            if (errorCode !== '0')
            {
                var errorMessage = getNodeValue(http.responseXML, 'errormessage');
                setStatus(errorMessage || 'Request failed.', true);
                setButtonDisabled(false);
                return;
            }

            var jobId = getNodeValue(http.responseXML, 'jobid');
            var status = getNodeValue(http.responseXML, 'status');
            if (jobId === '')
            {
                setStatus('Missing job id from server.', true);
                setButtonDisabled(false);
                return;
            }

            currentJobId = jobId;
            setStatus('Status: ' + status, false);
            startPolling();
        };

        AJAX_callCATSFunction(
            http,
            'talentFitFlowCandidateParse',
            POSTData,
            callBack,
            0,
            config.sessionCookie,
            false,
            false
        );
    }

    function undo()
    {
        var key;
        for (key in undoStore)
        {
            if (!undoStore.hasOwnProperty(key))
            {
                continue;
            }

            var el = byId(key);
            if (!el)
            {
                continue;
            }

            el.value = undoStore[key];
            if (undoMeta[key])
            {
                el.placeholder = undoMeta[key].placeholder;
                el.title = undoMeta[key].title;
            }
            el.removeAttribute('data-ai-prefilled');
            el.removeAttribute('data-ai-suggested');
        }

        setStatus('AI Prefill undone.', false);
        resetUndo();
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
        if (typeof newConfig.actor !== 'undefined')
        {
            config.actor = newConfig.actor;
        }
    }

    return {
        submit: submit,
        undo: undo,
        configure: configure
    };
})();
