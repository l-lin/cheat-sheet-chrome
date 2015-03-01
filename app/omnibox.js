(function (chrome, _) {
    'use strict';

    chrome.omnibox.onInputChanged.addListener(omniboxInputChanged);
    chrome.omnibox.onInputEntered.addListener(omniboxInputEntered);

    function omniboxInputChanged(text, suggest) {
        var sepIndex = text.indexOf(':');
        if (sepIndex === -1) {
            suggest(_getTypes(text));
        } else {
            var type = text.substring(0, sepIndex);
            var searchText = text.substring(sepIndex, text.length);
            suggest(_getResults(type, searchText));
        }
    }

    function omniboxInputEntered(text) {
        console.log('inputEntered: ' + text);
        alert('You just typed "' + text + '"');
    }

    function _getTypes(text) {
        if (localStorage && localStorage.getItem('cheat-sheet-types')) {
            var types = localStorage.getItem('cheat-sheet-types');
            return _filter(types, text);
        }
        return [];
    }

    function _getResults(type, text) {
        if (localStorage && localStorage.getItem('cheat-sheet-' + type)) {
            var results = localStorage.getItem('cheat-sheet-' + type);
            if (results[type] && results[type].length > 0) {
                return _filter(results[type], text);
            }
        }
        return [];
    }

    function _filter(list, text) {
        if (list && list.length > 0) {
            var listJson = JSON.parse(list);
            return _.filter(listJson, function (item) {
                return item.description.indexOf(text) >= 0;
            });
        }
        return [];
    }
})(chrome, _);
