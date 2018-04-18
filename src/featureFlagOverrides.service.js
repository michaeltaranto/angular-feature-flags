angular.module('feature-flags').service('featureFlagOverrides', function($rootElement) {
  var keyPrefix = '',
    appName = $rootElement.attr('ng-app'),

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

    setEnvironment = function(value) {
      keyPrefix = 'featureFlags.' + appName + '.' + value + '.';
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
