angular.module('feature-flags').service('featureFlags', function($http, featureFlagOverrides) {
        var serverFlagCache = {},
            flags = [],

            get = function() {
                return flags;
            },

            set = function(promise) {
                var method = promise.success || promise.then;

                return method.call(promise, function(response) {
                        response.forEach(function(flag) {
                            serverFlagCache[flag.key] = flag.active;
                            flag.active = isOn(flag.key);
                        });
                        angular.copy(response, flags);
                    });
            },

            enable = function(flag) {
                flag.active = true;
                featureFlagOverrides.set(flag.key, true);
            },

            disable = function(flag) {
                flag.active = false;
                featureFlagOverrides.set(flag.key, false);
            },

            reset = function(flag) {
                flag.active = serverFlagCache[flag.key];
                featureFlagOverrides.remove(flag.key);
            },

            isOverridden = function(key) {
                return featureFlagOverrides.isPresent(key);
            },

            isOn = function(key) {
                return isOverridden(key) ? featureFlagOverrides.get(key) == 'true' : serverFlagCache[key];
            };

        return {
            set: set,
            get: get,
            enable: enable,
            disable: disable,
            reset: reset,
            isOn: isOn,
            isOverridden: isOverridden
        };
    });