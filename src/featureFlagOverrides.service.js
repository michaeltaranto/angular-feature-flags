var localStorageAvailable = (function() {
    try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        return true;
    } catch (e) {
        return false;
    }
}());

angular.module('feature-flags').service('featureFlagOverrides', function($rootElement) {
    var appName = $rootElement.attr('ng-app'),
        keyPrefix = 'featureFlags.' + appName + '.',

        prefixedKeyFor = function(flagName) {
            return keyPrefix + flagName;
        },

        isPrefixedKey = function(key) {
            return key.indexOf(keyPrefix) === 0;
        },

        set = function(value, flagName) {
            if (!localStorageAvailable) {
                return;
            }

            localStorage.setItem(prefixedKeyFor(flagName), value);
        },

        get = function(flagName) {
            if (!localStorageAvailable) {
                return null;
            }

            return localStorage.getItem(prefixedKeyFor(flagName));
        },

        remove = function(flagName) {
            if (!localStorageAvailable) {
                return;
            }

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
            var key;
            if (!localStorageAvailable) {
                return;
            }

            for (key in localStorage) {
                if (isPrefixedKey(key)) {
                    localStorage.removeItem(key);
                }
            }
        }
    };
});
