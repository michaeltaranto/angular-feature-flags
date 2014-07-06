angular.module('feature-flags').service('featureFlagOverrides', function($rootElement) {
    var appName = $rootElement.attr('ng-app');
    return {
        isPresent: function(key) {
            return localStorage.getItem('featureFlags.' + appName + '.' + key) !== null;
        },
        get: function(key) {
            return localStorage.getItem('featureFlags.' + appName + '.' + key);
        },
        set: function(key, value) {
            localStorage.setItem('featureFlags.' + appName + '.' + key, value);
        },
        remove: function(key) {
            localStorage.removeItem('featureFlags.' + appName + '.' + key);
        },
        reset: function() {
            for (var key in localStorage) {
                if (key.indexOf('featureFlags.' + appName + '.') === 0) {
                    localStorage.removeItem(key);
                }
            }
        }
    };
});