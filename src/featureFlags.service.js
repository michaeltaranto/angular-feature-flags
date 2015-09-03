angular.module('feature-flags').service('featureFlags', function($q, featureFlagOverrides) {
        var serverFlagCache = {},
            flags = [],

            resolve = function(val) {
                var deferred = $q.defer();
                deferred.resolve(val);
                return deferred.promise;
            },

            isOverridden = function(key) {
                return featureFlagOverrides.isPresent(key);
            },

            isOn = function(key) {
                return isOverridden(key) ? featureFlagOverrides.get(key) === 'true' : serverFlagCache[key];
            },
            
            isOnByDefault = function(key) {
                return serverFlagCache[key];
            },
            
            updateFlagsAndGetAll = function(newFlags) {
                newFlags.forEach(function(flag) {
                    serverFlagCache[flag.key] = flag.active;
                    flag.active = isOn(flag.key);
                });
                angular.copy(newFlags, flags);

                return flags;
            },

            updateFlagsWithPromise = function(promise) {
                return promise.then(function(value) {
                    return updateFlagsAndGetAll(value.data || value);
                });
            },

            get = function() {
                return flags;
            },

            set = function(newFlags) {
                return angular.isArray(newFlags) ? resolve(updateFlagsAndGetAll(newFlags)) : updateFlagsWithPromise(newFlags);
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
            };

        return {
            set: set,
            get: get,
            enable: enable,
            disable: disable,
            reset: reset,
            isOn: isOn,
            isOnByDefault: isOnByDefault,
            isOverridden: isOverridden
        };
    });
