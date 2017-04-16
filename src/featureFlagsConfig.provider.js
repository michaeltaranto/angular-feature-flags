function FeatureFlagConfig(initialFlags, userAppName) {
  var initFlags = [],
    appName = '',

    getInitialFlags = function() {
      return initFlags;
    },
    setInitialFlags = function(value) {
      initFlags = value;
    },
    getAppName = function() {
      return appName;
    },
    setAppName = function(value) {
      appName = value;
    },
    init = function() {
      if (initialFlags) {
        initFlags = initialFlags;
      }
      if (userAppName) {
        appName = userAppName;
      }
    };
  init();

  return {
    getInitialFlags: getInitialFlags,
    setInitialFlags: setInitialFlags,
    getAppName: getAppName,
    setAppName: setAppName
  };
}

angular.module('feature-flags').provider('featureFlagConfig', function() {
  var initialFlags = [],
    appName = '';

  this.setInitialFlags = function(flags) {
    initialFlags = flags;
  };

  this.setAppName = function(name) {
    appName = name;
  };
  this.$get = function() {
    return new FeatureFlagConfig(initialFlags, appName);
  };
});
