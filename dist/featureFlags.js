/*!
 * Angular Feature Flags v1.0.0
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
            var key;
            for (key in localStorage) {
                if (isPrefixedKey(key)) {
                    localStorage.removeItem(key);
                }
            }
        }
    };
}]);

angular.module('feature-flags').service('featureFlags', ['$q', 'featureFlagOverrides', function($q, featureFlagOverrides) {
    var serverFlagCache = {},
        flags = [],

        resolve = function(val) {
            var deferred = $q.defer();
            deferred.resolve(val);
            return deferred.promise;
        },

        isOverridden = function(key) {
            return featureFlagOverrides.isPresent(key);
        },

        isOn = function(key) {
            return isOverridden(key) ? featureFlagOverrides.get(key) === 'true' : serverFlagCache[key];
        },

        isOnByDefault = function(key) {
            return serverFlagCache[key];
        },

        updateFlagsAndGetAll = function(newFlags) {
            newFlags.forEach(function(flag) {
                serverFlagCache[flag.key] = flag.active;
                flag.active = isOn(flag.key);
            });
            angular.copy(newFlags, flags);

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

        enable = function(flag) {
            flag.active = true;
            featureFlagOverrides.set(flag.key, true);
        },

        disable = function(flag) {
            flag.active = false;
            featureFlagOverrides.set(flag.key, false);
        },

        reset = function(flag) {
            flag.active = serverFlagCache[flag.key];
            featureFlagOverrides.remove(flag.key);
        };

    return {
        set: set,
        get: get,
        enable: enable,
        disable: disable,
        reset: reset,
        isOn: isOn,
        isOnByDefault: isOnByDefault,
        isOverridden: isOverridden
    };
}]);

}());