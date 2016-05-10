function FeatureFlags($q, featureFlagOverrides, initialFlags, environment) {
    var serverFlagCache = {},
        flags = [],
        envir = environment,

        getCachedFlag = function(key) {
            return serverFlagCache[envir] && serverFlagCache[envir][key];
        },

        resolve = function(val) {
            var deferred = $q.defer();
            deferred.resolve(val);
            return deferred.promise;
        },

        isOverridden = function(key) {
            return featureFlagOverrides.isPresent(key);
        },

        isOn = function(key) {
            return isOverridden(key) ? featureFlagOverrides.get(key) === 'true' : getCachedFlag(key);
        },

        isOnByDefault = function(key) {
            return getCachedFlag(key);
        },

        updateFlagsAndGetAll = function(newFlags) {
            angular.copy(newFlags, flags);
            flags.forEach(function(flag) {
                angular.forEach(flag.environments, function(active, env) {
                    if (!serverFlagCache[env]) {
                        serverFlagCache[env] = {};
                    }
                    serverFlagCache[env][flag.key] = active;
                    flag.environments[env] = isOn(flag.key);
                });
            });
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

        setEnvironment = function(value) {
            envir = value;
            featureFlagOverrides.setEnvironment(value);
        },

        enable = function(flag) {
            featureFlagOverrides.set(flag, true);
        },

        disable = function(flag) {
            featureFlagOverrides.set(flag, false);
        },

        reset = function(flag) {
            featureFlagOverrides.remove(flag);
        },

        init = function() {
            if (initialFlags) {
                set(initialFlags);
            }
        };

    init();

    return {
        set: set,
        get: get,
        enable: enable,
        disable: disable,
        reset: reset,
        isOn: isOn,
        isOnByDefault: isOnByDefault,
        isOverridden: isOverridden,
        setEnvironment: setEnvironment
    };
}

angular.module('feature-flags').provider('featureFlags', function() {
    var initialFlags = [];
    var environment = 'prod';

    this.setInitialFlags = function(flags) {
        initialFlags = flags;
    };

    this.setEnvironment = function(env) {
        environment = env;
    };

    this.$get = function($q, featureFlagOverrides) {
        featureFlagOverrides.setEnvironment(environment);
        return new FeatureFlags($q, featureFlagOverrides, initialFlags, environment);
    };
});
