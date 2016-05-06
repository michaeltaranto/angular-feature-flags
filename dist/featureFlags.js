/*! Angular Feature Flags v1.1.0 © 2016 Michael Taranto */
/*!
 * Angular Feature Flags v1.1.0
 *
 * © 2016, Michael Taranto
 */

(function(){
angular.module('feature-flags', []);

angular.module('feature-flags').directive('featureFlag', ['featureFlags', '$interpolate', function(featureFlags, $interpolate) {
    return {
        transclude: 'element',
        priority: 599,
        terminal: true,
        restrict: 'A',
        $$tlb: true,
        compile: function featureFlagCompile(tElement, tAttrs) {
            var hasHideAttribute = 'featureFlagHide' in tAttrs;

            tElement[0].textContent = ' featureFlag: ' + tAttrs.featureFlag + ' is ' + (hasHideAttribute ? 'on' : 'off') + ' ';

            return function featureFlagPostLink($scope, element, attrs, ctrl, $transclude) {
                var featureEl, childScope;
                $scope.$watch(function featureFlagWatcher() {
                    var featureFlag = $interpolate(attrs.featureFlag)($scope);
                    return featureFlags.isOn(featureFlag);
                }, function featureFlagChanged(isEnabled) {
                    var showElement = hasHideAttribute ? !isEnabled : isEnabled;

                    if (showElement) {
                        childScope = $scope.$new();
                        $transclude(childScope, function(clone) {
                            featureEl = clone;
                            element.after(featureEl).remove();
                        });
                    } else {
                        if (childScope) {
                            childScope.$destroy();
                            childScope = null;
                        }
                        if (featureEl) {
                            featureEl.after(element).remove();
                            featureEl = null;
                        }
                    }
                });
            };
        }
    };
}]);

angular.module('feature-flags').directive('featureFlagOverrides', ['featureFlags', function(featureFlags) {
    return {
        restrict: 'A',
        link: function postLink($scope) {
            $scope.flags = featureFlags.get();

            $scope.isOn = featureFlags.isOn;
            $scope.isOverridden = featureFlags.isOverridden;
            $scope.enable = featureFlags.enable;
            $scope.disable = featureFlags.disable;
            $scope.reset = featureFlags.reset;
            $scope.isOnByDefault = featureFlags.isOnByDefault;
        },
        template: '<div class="feature-flags">' +
                  '    <h1>Feature Flags</h1>' +
                  '    <div id="feature-flag--{{flag.key}}" class="feature-flags-flag" ng-repeat="flag in flags">' +
                  '        <div class="feature-flags-name">{{flag.name || flag.key}}</div>' +
                  '        <div id="feature-flag--{{flag.key}}--enable" class="feature-flags-switch" ng-click="enable(flag)" ng-class="{\'active\': isOverridden(flag.key) && isOn(flag.key)}">ON</div>' +
                  '        <div id="feature-flag--{{flag.key}}--disable" class="feature-flags-switch" ng-click="disable(flag)" ng-class="{\'active\': isOverridden(flag.key) && !isOn(flag.key)}">OFF</div>' +
                  '        <div id="feature-flag--{{flag.key}}--reset" class="feature-flags-switch" ng-click="reset(flag)" ng-class="{\'active\': !isOverridden(flag.key)}">DEFAULT ({{isOnByDefault(flag.key) ? \'ON\' : \'OFF\'}})</div>' +
                  '        <div class="feature-flags-desc">{{flag.description}}</div>' +
                  '    </div>' +
                  '</div>',
        replace: true
    };
}]);

angular.module('feature-flags').service('featureFlagOverrides', ['$rootElement', function($rootElement) {
    var keyPrefix,
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
}]);

function FeatureFlags($q, featureFlagOverrides, initialFlags, environment) {
    var serverFlagCache = {},
        flags = [],

        getCachedFlag = function (key) {
            return serverFlagCache[environment] && serverFlagCache[environment][key];
        },

        resolve = function (val) {
            var deferred = $q.defer();
            deferred.resolve(val);
            return deferred.promise;
        },

        isOverridden = function (key) {
            return featureFlagOverrides.isPresent(key);
        },

        isOn = function (key) {
            return isOverridden(key) ? featureFlagOverrides.get(key) === 'true' : getCachedFlag(key);
        },

        isOnByDefault = function (key) {
            return getCachedFlag(key);
        },

        updateFlagsAndGetAll = function (newFlags) {
            newFlags.forEach(function (flag) {
                angular.forEach(flag.environments, function (active, env) {
                    if (!serverFlagCache[env])
                        serverFlagCache[env] = {};
                    serverFlagCache[env][flag.key] = active;
                    flag.environments[env] = isOn(flag.key);
                });
            });
            angular.copy(newFlags, flags);

            return flags;
        },

        updateFlagsWithPromise = function (promise) {
            return promise.then(function (value) {
                return updateFlagsAndGetAll(value.data || value);
            });
        },

        get = function () {
            return flags;
        },

        set = function (newFlags) {
            return angular.isArray(newFlags) ? resolve(updateFlagsAndGetAll(newFlags)) : updateFlagsWithPromise(newFlags);
        },

        setEnvironment = function (value) {
            environment = value;
            featureFlagOverrides.setEnvironment(value);
        },

        enable = function (flag) {
            changeEnvironmentVal(flag, true);
            featureFlagOverrides.set(flag.key, true);
        },

        disable = function (flag) {
            changeEnvironmentVal(flag, false);
            featureFlagOverrides.set(flag.key, false);
        },

        reset = function (flag) {
            changeEnvironmentVal(flag, getCachedFlag(flag.key));
            featureFlagOverrides.remove(flag.key);
        },

        init = function () {
            if (initialFlags) {
                set(initialFlags);
            }
        };

    function changeEnvironmentVal(flag, value) {
        Object.keys(flag.environments).forEach(function (env) {
            flag.environments[env] = value;
        })
    }

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
        setEnvironment: setEnvironment
    };
}

angular.module('feature-flags').provider('featureFlags', function () {
    var initialFlags = [];
    var environment = 'prod';

    this.setInitialFlags = function (flags) {
        initialFlags = flags;
    };

    this.setEnvironment = function (env) {
        environment = env;
    };

    this.$get = ['$q', 'featureFlagOverrides', function ($q, featureFlagOverrides) {
        featureFlagOverrides.setEnvironment(environment);
        return new FeatureFlags($q, featureFlagOverrides, initialFlags, environment);
    }];
});

}());