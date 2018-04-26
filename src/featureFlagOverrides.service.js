angular.module('feature-flags').service('featureFlagOverrides', function($rootElement) {
  var appName = $rootElement.attr('ng-app'),
    environment = '',
    keyPrefix = 'featureFlags.' + appName + '.',

    localStorageAvailable = (function() {
      try {
        localStorage.setItem('featureFlags.availableTest', 'test');
        localStorage.removeItem('featureFlags.availableTest');
        return true;
      } catch (e) {
        return false;
      }
    }()),

    prefixedKeyFor = function(flagName) {
      return keyPrefix + flagName;
    },

    isPrefixedKey = function(key) {
      return key.indexOf(keyPrefix) === 0;
    },

    getPrefix = function() {
      return 'featureFlags.' + appName + '.' + (environment && environment + '.');
    },

    setEnvironment = function(value) {
      environment = value;
      keyPrefix = getPrefix();
    },

    setAppName = function($appName) {
      appName = $appName;
      keyPrefix = getPrefix();
    },

    set = function(value, flagName) {
      if (localStorageAvailable) {
        localStorage.setItem(prefixedKeyFor(flagName), value);
      }
    },

    get = function(flagName) {
      if (localStorageAvailable) {
        return localStorage.getItem(prefixedKeyFor(flagName));
      }
    },

    remove = function(flagName) {
      if (localStorageAvailable) {
        localStorage.removeItem(prefixedKeyFor(flagName));
      }
    };

  return {
    isPresent: function(key) {
      var value = get(key);
      return typeof value !== 'undefined' && value !== null;
    },
    setEnvironment: setEnvironment,
    setAppName: setAppName,
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
      if (localStorageAvailable) {
        for (key in localStorage) {
          if (isPrefixedKey(key)) {
            localStorage.removeItem(key);
          }
        }
      }
    }
  };
});
