angular.module('feature-flags').service('featureFlagOverrides', function($rootElement) {
  var ngAttrPrefixes = ['ng-', 'data-ng-', 'ng:', 'x-ng-'],
    appName,
    keyPrefix,

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

  // Need to find the appName for the angular specific prefixes
  angular.forEach(ngAttrPrefixes, function(prefix) {
    var name = prefix + 'app';
    if (!appName && $rootElement.attr(name)) {
      appName = $rootElement.attr(name);
    }
  });

  keyPrefix = 'featureFlags.' + appName + '.';

  return {
    isPresent: function(key) {
      var value = get(key);
      return typeof value !== 'undefined' && value !== null;
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
