angular.module('feature-flags').service('featureFlagOverrides', function($rootElement) {
    var appName = $rootElement.attr('ng-app');
    return {
        isPresent: function(key) {
            return localStorage.getItem(appName + '.' + key) !== null;
        },
        get: function(key) {
            return localStorage.getItem(appName + '.' + key);
        },
        set: function(key, value) {
            localStorage.setItem(appName + '.' + key, value);
        },
        remove: function(key) {
            localStorage.removeItem(appName + '.' + key);
        }
    };
});