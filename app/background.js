(function(chrome, _) {
    'use strict';

    var xhr = (function() {
        var xhr = new XMLHttpRequest();
        return function(method, url, callback) {
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    callback(xhr.responseText, xhr.status);
                }
            };
            xhr.open(method, url);
            xhr.send();
        };
    })();

    chrome.alarms.create({
        periodInMinutes: 1
    });
    chrome.alarms.onAlarm.addListener(update);

    function update() {
        xhr('GET', 'https://raw.githubusercontent.com/l-lin/cheat-sheet-chrome/master/data/types.json', function(data, status) {
            if (status >= 400) {
                return [];
            }
            var types = JSON.parse(data);
            if (localStorage) {
                localStorage.setItem('cheat-sheet-types', types);
            }

            types.forEach(function (type) {
                updateType(type);
            });
        });
    }

    function updateType(type) {
        xhr('GET', 'https://raw.githubusercontent.com/l-lin/cheat-sheet-chrome/master/data/' + type + '.json', function(data, status) {
            if (status >= 400) {
                return [];
            }
            var results = JSON.parse(data);

            if (results && results.length > 0) {
                results.forEach(function (result) {
                    if (result.default && localStorage) {
                        localStorage.setItem('cheat-sheet-' + type + '-default', result);
                    } else {
                        updateResult(type, result);
                    }
                });
            }
        });
    }

    function updateResult(type, result) {
        var storedResult = localStorage.getItem('cheat-sheet-' + type) || [];
        var resultToStore = result.data || [];
        if (result.dataUrl) {
            xhr('GET', dataUrl, function(response, status) {
                if (status >= 400) {
                    return [];
                }
                var data = JSON.parse(response);
                if (data && data.length > 0) {
                    resultToStore = window.dataParsers[result.dataParser](data);
                }
            });
        }

        if (resultToStore) {
            resultToStore.forEach(function (data) {
                if (!_.find(storedResult, data)) {
                    storedResult.push(data);
                }
            });
        }
    }
})(chrome, _);
