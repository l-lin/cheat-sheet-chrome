(function(chrome, _, Q) {
    'use strict';

    var PROVIDER_URL = 'https://raw.githubusercontent.com/l-lin/cheat-sheet-chrome/master';
    //var PROVIDER_URL = 'http://localhost:9000';

    chrome.alarms.create({
        periodInMinutes: 60
    });
    chrome.alarms.onAlarm.addListener(update);

    update();

    function update() {
        localStorage.clear();

        xhr('GET', PROVIDER_URL + '/data/types.json')
            .then(function(response) {
                if (response.status >= 400) {
                    return Q.fcall(function() {
                        return [];
                    });
                }
                localStorage.setItem('cheat-sheet-types', response.responseText);
                var types = JSON.parse(response.responseText);
                var promises = [];
                types.forEach(function(type) {
                    promises.push(_fetchType(type.content.replace(':', '')));
                });
                return Q.all(promises);
            })
            .then(function(responses) {
                responses.forEach(function(response) {
                    updateType(response.type, response.responseText, response.status);
                });
            });
    }

    function updateType(type, responseText, status) {
        if (status >= 400) {
            return;
        }
        localStorage.setItem('cheat-sheet-' + type, responseText);
        var results = JSON.parse(responseText);
        if (results && results.length > 0) {
            var promises = [];
            results.forEach(function(result) {
                if (!result.default) {
                    promises.push(_fetchResults(type, result));
                }
            });

            Q.all(promises).then(function(resultsList) {
                resultsList.forEach(function(results) {
                    updateResult(type, results);
                });
            });
        }
    }

    function updateResult(type, results) {
        var storedResult = JSON.parse(localStorage.getItem('cheat-sheet-' + type + '-results')) || [];
        if (results) {
            results.forEach(function(data) {
                if (!_.find(storedResult, data)) {
                    storedResult.push(data);
                }
            });
        }
        localStorage.setItem('cheat-sheet-' + type + '-results', JSON.stringify(storedResult));
    }

    function xhr(method, url) {
        var xhr = new XMLHttpRequest();
        var defer = Q.defer();
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                defer.resolve({
                    responseText: xhr.responseText,
                    status: xhr.status
                });
            }
        };
        xhr.open(method, url);
        xhr.send();
        return defer.promise;
    };

    function _fetchType(type) {
        var defer = Q.defer();
        var url = PROVIDER_URL + '/data/' + type + '.json';
        xhr('GET', url)
            .then(function(response) {
                if (response.status >= 400) {
                    defer.reject('Status of ' + url + ' is ' + response.status);
                } else {
                    response.type = type;
                    defer.resolve(response);
                }
            });
        return defer.promise;
    }

    function _fetchResults(type, result) {
        var defer = Q.defer();
        if (result.dataUrl) {
            xhr('GET', result.dataUrl).then(function(response) {
                if (response.status >= 400) {
                    defer.reject('Status of ' + result.dataUrl + ' is ' + response.status);
                } else {
                    var list = [];
                    if (_isJsonString(response.responseText)) {
                        list = JSON.parse(response.responseText);
                    } else {
                        list = response.responseText.split('\n');
                    }
                    if (list && list.length > 0) {
                        defer.resolve(window.dataParsers[result.dataParser](type, result, list));
                    } else {
                        defer.resolve([]);
                    }
                }
            });
        } else {
            defer.resolve(result.data || []);
        }
        return defer.promise;
    }

    function _isJsonString(str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }
})(chrome, _, Q);
