angular.module('feature-flags').service('featureFlagOverrides', function($rootElement) {
    var keyPrefix = '',
        appName = $rootElement.attr('ng-app'),

        prefixedKeyFor = function(flagName) {
            return keyPrefix + flagName;
        },

        isPrefixedKey = function(key) {
            return key.indexOf(keyPrefix) === 0;
        },

        setEnvironment = function(value) {
            keyPrefix = 'featureFlags.' + appName + '.' + value + '.';
        },

        set = function(value, flagName) {
            localStorage.setItem(prefixedKeyFor(flagName), value);
        },

        get = function(flagName) {
            return localStorage.getItem(prefixedKeyFor(flagName));
        },

        remove = function(flagName) {
            localStorage.removeItem(prefixedKeyFor(flagName));
        };

    return {
        isPresent: function(key) {
            return get(key) !== null;
        },
        setEnvironment: setEnvironment,
        get: get,
        set: function(flag, value) {
            if (angular.isObject(flag)) {
                angular.forEach(flag, set);
            } else {
                set(value, flag);
            }
        },
        remove: remove,
        reset: function() {
            var key;
            for (key in localStorage) {
                if (isPrefixedKey(key)) {
                    localStorage.removeItem(key);
                }
            }
        }
    };
});
