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
            var searchText = text.substring(sepIndex + 1, text.length);
            suggest(_getResults(type, searchText));
        }
    }

    function omniboxInputEntered(text) {
        var sepIndex = text.indexOf(':');
        if (sepIndex >= 0) {
            var type = text.substring(0, sepIndex);
            var sourceAndText = text.substring(sepIndex + 1, text.length);
            var sources = JSON.parse(localStorage.getItem('cheat-sheet-' + type));
            sepIndex = sourceAndText.indexOf(':');
            if (sepIndex >= 0) {
                var sourceCode = sourceAndText.substring(0, sepIndex);
                var textToSearch = sourceAndText.substring(sepIndex + 1, sourceAndText.length);
                var source = _.find(sources, function(source) {
                    return source.name === sourceCode;
                });
                var url = window.resultConverters.append2url(source.url, textToSearch);
                chrome.tabs.create({
                    url: url
                });
            } else {
                var defaultSource = _.find(sources, function (source) {
                    return source.default;
                });
                var url = window.resultConverters.append2url(defaultSource.url, sourceAndText);
                chrome.tabs.create({
                    url: url
                });
            }
        }
    }

    function _getTypes(text) {
        if (localStorage.getItem('cheat-sheet-types')) {
            var types = localStorage.getItem('cheat-sheet-types');
            return _filter(types, text);
        }
        return [];
    }

    function _getResults(type, text) {
        var results = localStorage.getItem('cheat-sheet-' + type + '-results');
        if (results) {
            return _filter(results, text);
        }
        return [];
    }

    function _filter(list, text) {
        if (list && list.length > 0) {
            var listJson = JSON.parse(list);
            return _.filter(listJson, function (item) {
                if (text) {
                    return item.description.toLowerCase().indexOf(text.toLowerCase()) >= 0;
                }
                return true;
            });
        }
        return [];
    }
})(chrome, _);
