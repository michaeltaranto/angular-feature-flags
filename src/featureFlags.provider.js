function FeatureFlags($q, featureFlagOverrides, initialFlags) {
  var serverFlagCache = {},
    flags = [],
    environment = '',
    instance = 0,

    getCachedFlag = function(key) {
      return serverFlagCache[environment] && serverFlagCache[environment][key];
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

    isEnabledForInstance = function(instances) {
      if (!instances) {
        return true;
      }
      return instances.indexOf(instance) !== -1;
    },

    isExpired = function(expiryDate) {
      var now = new Date().toISOString();
      if (!expiryDate) {
        return false;
      }
      return now > expiryDate;
    },

    isDefaultEnabled = function(environmentEnabled, flag) {
      return environmentEnabled && isEnabledForInstance(flag.instances) && !isExpired(flag.expires);
    },

    updateFlagsAndGetAll = function(newFlags) {
      angular.copy(newFlags, flags);
      flags.forEach(function(flag) {
        angular.forEach(flag.environments, function(environmentEnabled, env) {
          if (!serverFlagCache[env]) {
            serverFlagCache[env] = {};
          }
          serverFlagCache[env][flag.key] = isDefaultEnabled(environmentEnabled, flag);
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
      environment = value;
      featureFlagOverrides.setEnvironment(value);
    },

    setAppName = function(value) {
      featureFlagOverrides.setAppName(value);
    },

    setInstance = function(value) {
      instance = value;
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
    setEnvironment: setEnvironment,
    setAppName: setAppName,
    setInstance: setInstance
  };
}

angular.module('feature-flags').provider('featureFlags', function() {
  var initialFlags = [];
  var environment = 'prod';
  var appName = '';

  this.setInitialFlags = function(flags) {
    initialFlags = flags;
  };

  this.setEnvironment = function(env) {
    environment = env;
  };

  this.setAppName = function($appName) {
    appName = $appName;
  };

  this.$get = function($q, featureFlagOverrides) {
    var service = new FeatureFlags($q, featureFlagOverrides, initialFlags);
    if (environment) {
      service.setEnvironment(environment);
    }
    if (appName) {
      service.setAppName(appName);
    }
    return service;
  };
});
