
 /**
  * This file is executed inside iframe of h5p player so code which needs to be executed inside iframe
  * should be places here
  */
 getCookie = function(key, value, options) {

    // key and at least value given, set cookie...
    if (arguments.length > 1 && (!/Object/.test(Object.prototype.toString.call(value)) || value === null || value === undefined)) {
        options = $.extend({}, options);

        if (value === null || value === undefined) {
            options.expires = -1;
        }

        if (typeof options.expires === 'number') {
            var days = options.expires, t = options.expires = new Date();
            t.setDate(t.getDate() + days);
        }

        value = String(value);

        return (document.cookie = [
            encodeURIComponent(key), '=', options.raw ? value : encodeURIComponent(value),
            options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
            options.path    ? '; path=' + options.path : '',
            options.domain  ? '; domain=' + options.domain : '',
            options.secure  ? '; secure' : ''
        ].join(''));
    }

    // key and possibly options given, get cookie...
    options = value || {};
    var decode = options.raw ? function(s) { return s; } : decodeURIComponent;

    var pairs = document.cookie.split('; ');
    for (var i = 0, pair; pair = pairs[i] && pairs[i].split('='); i++) {
        if (decode(pair[0]) === key) return decode(pair[1] || ''); // IE saves cookies with empty string as "c; ", e.g. without "=" as opposed to EOMB, thus pair[1] may be undefined
    }
    return null;
};

function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
};

H5P.jQuery.ajaxSetup({
    beforeSend: function(xhr, settings) {
        if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
            xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
        }
    }
});

// Add mathJax library
H5P.externalDispatcher.on('domChanged', function(data) {
    (function () {
        var script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.9/latest.js?config=TeX-AMS-MML_HTMLorMML';
        script.async = true;
        document.head.appendChild(script);
    })();
    /***
     * Since the interactive book only loads the first two pages in the begeinning, 
     * need to manually call function MathJax.Hub.Typeset() after the rest of the page is loaded.
     * Listen to the click event of the next button to call the function.
     */
    document.body.addEventListener('click', function(event) {
        event.preventDefault();
        event.stopPropagation();
        const classesOfNavBtn = ['h5p-interactive-book-status-arrow', 'navigation-button'];
        const isNavBtn = classesOfNavBtn.some(cls => event.target.classList.contains(cls));
        if (isNavBtn) {
            MathJax.Hub.Typeset();
        } 
    });
});
