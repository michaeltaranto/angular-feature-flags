angular.module("local-storage-feature-flags", {})
    .constant("FLAG_PREFIX", "my-app")
    .service("FlagsService", function($http, FLAG_PREFIX) {
        var cache = [],

            get = function() {
                return cache;
            },

            fetch = function() {
                return $http.get("data/flags.json")
                            .success(function(flags) {
                                flags.forEach(function(flag) {
                                    flag.active = isOn(flag.key);
                                });
                                angular.copy(flags, cache);
                            });
            },

            enable = function(flag) {
                flag.active = true;
                localStorage.setItem(FLAG_PREFIX + "." + flag.key, true);
            },

            disable = function(flag) {
                flag.active = false;
                localStorage.removeItem(FLAG_PREFIX + "." + flag.key);
            },

            isOn = function(key) {
                return localStorage.getItem(FLAG_PREFIX + "." + key) !== null;
            };

        return {
            fetch: fetch,
            get: get,
            enable: enable,
            disable: disable,
            isOn: isOn
        };
    });