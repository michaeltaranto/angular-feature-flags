function FeatureFlags($q, featureFlagOverrides, initialFlags, environment) {
    var serverFlagCache = {},
        flags = [],

        getCachedFlag = function (key) {
            return serverFlagCache[environment] && serverFlagCache[environment][key];
        },

        resolve = function (val) {
            var deferred = $q.defer();
            deferred.resolve(val);
            return deferred.promise;
        },

        isOverridden = function (key) {
            return featureFlagOverrides.isPresent(key);
        },

        isOn = function (key) {
            return isOverridden(key) ? featureFlagOverrides.get(key) === 'true' : getCachedFlag(key);
        },

        isOnByDefault = function (key) {
            return getCachedFlag(key);
        },

        updateFlagsAndGetAll = function (newFlags) {
            newFlags.forEach(function (flag) {
                angular.forEach(flag.environments, function (active, env) {
                    if (!serverFlagCache[env])
                        serverFlagCache[env] = {};
                    serverFlagCache[env][flag.key] = active;
                    flag.environments[env] = isOn(flag.key);
                });
            });
            angular.copy(newFlags, flags);

            return flags;
        },

        updateFlagsWithPromise = function (promise) {
            return promise.then(function (value) {
                return updateFlagsAndGetAll(value.data || value);
            });
        },

        get = function () {
            return flags;
        },

        set = function (newFlags) {
            return angular.isArray(newFlags) ? resolve(updateFlagsAndGetAll(newFlags)) : updateFlagsWithPromise(newFlags);
        },

        setEnvironment = function (value) {
            environment = value;
            featureFlagOverrides.setEnvironment(value);
        },

        enable = function (flag) {
            changeEnvironmentVal(flag, true);
            featureFlagOverrides.set(flag.key, true);
        },

        disable = function (flag) {
            changeEnvironmentVal(flag, false);
            featureFlagOverrides.set(flag.key, false);
        },

        reset = function (flag) {
            changeEnvironmentVal(flag, getCachedFlag(flag.key));
            featureFlagOverrides.remove(flag.key);
        },

        init = function () {
            if (initialFlags) {
                set(initialFlags);
            }
        };

    function changeEnvironmentVal(flag, value) {
        Object.keys(flag.environments).forEach(function (env) {
            flag.environments[env] = value;
        })
    }

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

angular.module('feature-flags').provider('featureFlags', function () {
    var initialFlags = [];
    var environment = 'prod';

    this.setInitialFlags = function (flags) {
        initialFlags = flags;
    };

    this.setEnvironment = function (env) {
        environment = env;
    };

    this.$get = function ($q, featureFlagOverrides) {
        featureFlagOverrides.setEnvironment(environment);
        return new FeatureFlags($q, featureFlagOverrides, initialFlags, environment);
    };
});
