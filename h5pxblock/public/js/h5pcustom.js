
/**
 * This file is executed inside iframe of h5p player so code which needs to be executed inside iframe
 * should be places here
 */
getCookie = function (key, value, options) {

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
            options.path ? '; path=' + options.path : '',
            options.domain ? '; domain=' + options.domain : '',
            options.secure ? '; secure' : ''
        ].join(''));
    }

    // key and possibly options given, get cookie...
    options = value || {};
    var decode = options.raw ? function (s) { return s; } : decodeURIComponent;

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
    beforeSend: function (xhr, settings) {
        if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
            xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
        }
    }
});

// Load mathJax library
function loadMathJax(onload) {
    var script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/mathjax/3.2.2/es5/tex-svg-full.min.js';
    script.async = true;
    document.head.appendChild(script);
    script.onload = onload;
}

/***
 * Since the interactive book only loads the first two pages in the begeinning, 
 * need to manually call function MathJax.typeset() after the rest of the page is loaded.
 * Listen to the click event of the navigation buttons to call the typeset function.
 */
function pageNavCallback(event) {
    event.preventDefault();
    event.stopPropagation();
    const classesOfNavBtn = [
        '.h5p-interactive-book-navigation-chapter-button',
        '.h5p-interactive-book-status-arrow'
    ];
    const isNavBtn = event.target.closest(classesOfNavBtn.join(', ')) !== null;
    if (isNavBtn) {
        setTimeout(MathJax.typeset, 0);
    }
}

// Load mathjax when the H5P content is ready
H5P.externalDispatcher.on('domChanged', function (data) {
    loadMathJax(function () {
        document.body.addEventListener('click', pageNavCallback);
    });
});
