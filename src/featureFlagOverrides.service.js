angular.module('feature-flags').service('featureFlagOverrides', ['$rootElement', function($rootElement) {
    var appName = $rootElement.attr('ng-app'),
        keyPrefix = 'featureFlags.' + appName + '.',

        prefixedKeyFor = function(flagName) {
            return keyPrefix + flagName;
        },

        isPrefixedKey = function(key) {
            return key.indexOf(keyPrefix) === 0;
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
            for (var key in localStorage) {
                if (isPrefixedKey(key)) {
                    localStorage.removeItem(key);
                }
            }
        }
    };
}]);
