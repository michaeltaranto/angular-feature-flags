angular.module('feature-flags').service('flags', function($http, FLAGS_URL, override) {
        var serverFlagCache = {},
            flags = [],

            get = function() {
                return flags;
            },

            fetch = function() {
                return $http.get(FLAGS_URL)
                            .success(function(response) {
                                response.forEach(function(flag) {
                                    serverFlagCache[flag.key] = flag.active;
                                    flag.active = isOn(flag.key);
                                });
                                angular.copy(response, flags);
                            });
            },

            enable = function(flag) {
                flag.active = true;
                override.set(flag.key, true);
            },

            disable = function(flag) {
                flag.active = false;
                override.set(flag.key, false);
            },

            reset = function(flag) {
                flag.active = serverFlagCache[flag.key];
                override.remove(flag.key);
            },

            isOverridden = function(key) {
                return override.isPresent(key);
            },

            isOn = function(key) {
                return isOverridden(key) ? override.get(key) == 'true' : serverFlagCache[key];
            };

        return {
            fetch: fetch,
            get: get,
            enable: enable,
            disable: disable,
            reset: reset,
            isOn: isOn,
            isOverridden: isOverridden
        };
    });