/*
 * Lightweight @mention autocomplete for textareas.
 */
(function (window, document) {
    'use strict';

    function normalizeSuggestions(suggestions) {
        var unique = {};
        var normalized = [];
        if (!suggestions || !suggestions.length) {
            return normalized;
        }

        for (var i = 0; i < suggestions.length; i++) {
            var value = String(suggestions[i] || '').replace(/^\s+|\s+$/g, '');
            if (value === '') {
                continue;
            }
            var key = value.toLowerCase();
            if (unique[key]) {
                continue;
            }
            unique[key] = true;
            normalized.push(value);
        }

        return normalized;
    }

    function createDropdown(hostElement) {
        var dropdown = document.createElement('div');
        dropdown.style.position = 'absolute';
        dropdown.style.left = '0';
        dropdown.style.right = '0';
        dropdown.style.top = '100%';
        dropdown.style.marginTop = '4px';
        dropdown.style.background = '#fff';
        dropdown.style.border = '1px solid #cbd5df';
        dropdown.style.borderRadius = '4px';
        dropdown.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.12)';
        dropdown.style.maxHeight = '180px';
        dropdown.style.overflowY = 'auto';
        dropdown.style.zIndex = '1500';
        dropdown.style.display = 'none';
        hostElement.appendChild(dropdown);
        return dropdown;
    }

    function getMentionContext(textarea) {
        if (typeof textarea.selectionStart !== 'number') {
            return null;
        }

        var caret = textarea.selectionStart;
        var beforeCaret = textarea.value.substring(0, caret);
        var match = beforeCaret.match(/(^|[\s(\[{])@([^\s.,;:!?)\]}]*)$/);
        if (!match) {
            return null;
        }

        var mentionQuery = match[2] || '';
        return {
            query: mentionQuery.toLowerCase(),
            start: caret - mentionQuery.length - 1,
            end: caret
        };
    }

    function bind(textareaId, suggestions) {
        var textarea = document.getElementById(textareaId);
        if (!textarea) {
            return;
        }

        var values = normalizeSuggestions(suggestions);
        if (!values.length) {
            return;
        }

        var host = textarea.parentNode;
        if (!host) {
            return;
        }
        if (!host.style.position || host.style.position === 'static') {
            host.style.position = 'relative';
        }

        var dropdown = createDropdown(host);
        var state = {
            open: false,
            items: [],
            activeIndex: -1,
            mentionStart: -1,
            mentionEnd: -1
        };

        function closeDropdown() {
            state.open = false;
            state.items = [];
            state.activeIndex = -1;
            state.mentionStart = -1;
            state.mentionEnd = -1;
            dropdown.style.display = 'none';
            dropdown.innerHTML = '';
        }

        function setActiveIndex(nextIndex) {
            if (!state.open || !state.items.length) {
                return;
            }
            if (nextIndex < 0) {
                nextIndex = state.items.length - 1;
            }
            if (nextIndex >= state.items.length) {
                nextIndex = 0;
            }
            state.activeIndex = nextIndex;

            var children = dropdown.children;
            for (var i = 0; i < children.length; i++) {
                children[i].style.background = (i === state.activeIndex) ? '#eef6ff' : '#fff';
            }
        }

        function applySelection(index) {
            if (!state.open || index < 0 || index >= state.items.length) {
                return false;
            }

            var selected = state.items[index];
            var currentValue = textarea.value;
            var newValue = currentValue.substring(0, state.mentionStart) +
                '@' + selected + ' ' +
                currentValue.substring(state.mentionEnd);
            textarea.value = newValue;

            var newCaret = state.mentionStart + selected.length + 2;
            textarea.focus();
            textarea.setSelectionRange(newCaret, newCaret);
            closeDropdown();
            return true;
        }

        function buildDropdown(items) {
            dropdown.innerHTML = '';
            for (var i = 0; i < items.length; i++) {
                (function (itemIndex) {
                    var option = document.createElement('div');
                    option.appendChild(document.createTextNode('@' + items[itemIndex]));
                    option.style.padding = '6px 8px';
                    option.style.cursor = 'pointer';
                    option.style.fontSize = '12px';
                    option.style.borderBottom = '1px solid #eef2f6';
                    option.onmouseenter = function () {
                        setActiveIndex(itemIndex);
                    };
                    option.onmousedown = function (evt) {
                        if (evt && evt.preventDefault) {
                            evt.preventDefault();
                        }
                        applySelection(itemIndex);
                    };
                    dropdown.appendChild(option);
                })(i);
            }
            if (dropdown.lastChild) {
                dropdown.lastChild.style.borderBottom = 'none';
            }
        }

        function refreshDropdown() {
            var mentionContext = getMentionContext(textarea);
            if (!mentionContext) {
                closeDropdown();
                return;
            }

            var filtered = [];
            for (var i = 0; i < values.length; i++) {
                var candidate = values[i];
                var candidateLower = candidate.toLowerCase();
                if (
                    mentionContext.query === '' ||
                    candidateLower.indexOf(mentionContext.query) === 0 ||
                    candidateLower.indexOf(' ' + mentionContext.query) !== -1
                ) {
                    filtered.push(candidate);
                }
                if (filtered.length >= 8) {
                    break;
                }
            }

            if (!filtered.length) {
                closeDropdown();
                return;
            }

            state.open = true;
            state.items = filtered;
            state.mentionStart = mentionContext.start;
            state.mentionEnd = mentionContext.end;
            buildDropdown(filtered);
            dropdown.style.display = '';
            setActiveIndex(0);
        }

        textarea.addEventListener('input', refreshDropdown);
        textarea.addEventListener('click', refreshDropdown);
        textarea.addEventListener('keyup', function (evt) {
            var key = evt.key || evt.keyCode;
            if (key === 'ArrowDown' || key === 'ArrowUp' || key === 'Enter' || key === 'Tab' || key === 'Escape' ||
                key === 40 || key === 38 || key === 13 || key === 9 || key === 27) {
                return;
            }
            refreshDropdown();
        });

        textarea.addEventListener('keydown', function (evt) {
            if (!state.open) {
                return;
            }

            var key = evt.key || evt.keyCode;
            if (key === 'ArrowDown' || key === 40) {
                evt.preventDefault();
                setActiveIndex(state.activeIndex + 1);
                return;
            }
            if (key === 'ArrowUp' || key === 38) {
                evt.preventDefault();
                setActiveIndex(state.activeIndex - 1);
                return;
            }
            if (key === 'Enter' || key === 13 || key === 'Tab' || key === 9) {
                evt.preventDefault();
                applySelection(state.activeIndex);
                return;
            }
            if (key === 'Escape' || key === 27) {
                evt.preventDefault();
                closeDropdown();
            }
        });

        document.addEventListener('click', function (evt) {
            if (!state.open) {
                return;
            }
            if (evt.target === textarea || dropdown.contains(evt.target)) {
                return;
            }
            closeDropdown();
        });
    }

    window.MentionAutocomplete = {
        bind: bind
    };
})(window, document);
