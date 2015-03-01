window.resultConverters = (function(sprintf) {
    'use strict';
    return {
        append2url: append2url
    };

    function append2url(url, search) {
        return sprintf(url, search);
    }
})(sprintf);
