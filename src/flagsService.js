angular.module("feature-flags").service("FlagsService", function($http, COOKIE_PREFIX, FLAG_TIMEOUT) {
    var cache = [],

        _setActiveIfCookiePresent = function(flag) {
            flag.active = document.cookie.indexOf(COOKIE_PREFIX + "." + flag.key) > -1;
        },

        get = function() {
            return cache;
        },

        fetch = function() {
            return $http.get("data/flags.json")
                        .success(function(flags) {
                            flags.forEach(_setActiveIfCookiePresent);
                            angular.copy(flags, cache);
                        });
        },

        enable = function(flag) {
            flag.active = true;
            document.cookie = COOKIE_PREFIX + "." + flag.key + "=true;path=/;max-age=" + FLAG_TIMEOUT;
        },

        disable = function(flag) {
            flag.active = false;
            document.cookie = COOKIE_PREFIX + "." + flag.key + "=false;path=/;expires=" + new Date(0);
        };

    return {
        fetch: fetch,
        get: get,
        enable: enable,
        disable: disable
    };
});