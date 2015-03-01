window.dataParsers = (function() {
    'use strict';
    return {
        text2lowercase: text2lowercase,
        github: github
    };

    function text2lowercase(list) {
        var data = [];
        if (list && list.length > 0) {
            list.forEach(function (item) {
                data.push(item.toLowerCase().replace(/ /g, '-'))
            });
        }
        return data;
    }

    function github(list) {
        var data = [];
        if (list && list.length > 0) {
            list.forEach(function (item) {
                data.push(item.name);
            });
        }
        return data;
    }
})();
