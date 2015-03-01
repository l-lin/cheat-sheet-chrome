window.dataParsers = (function() {
    'use strict';
    return {
        text2lowercase: text2lowercase,
        github: github
    };

    function text2lowercase(type, source, list) {
        var data = [];
        if (list && list.length > 0) {
            list.forEach(function(item) {
                if (item && item !== '') {
                    data.push({
                        content: type + ':' + source.name + ':' + item.toLowerCase().replace(/ /g, '-'),
                        description: source.description + ' - ' + item
                    })
                }
            });
        }
        return data;
    }

    function github(type, source, list) {
        var data = [];
        if (list && list.length > 0) {
            list.forEach(function(item) {
                data.push({
                    content: type + ':' + source.name + ':' + item.name,
                    description: source.description + ' - ' + item.name
                });
            });
        }
        return data;
    }
})();
