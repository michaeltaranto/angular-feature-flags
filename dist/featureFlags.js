/*!
 * Angular Feature Flags v0.3.1
 *
 * © 2014, Michael Taranto
 */

(function(){
angular.module('feature-flags', []);
angular.module('feature-flags').directive('featureFlag', function(featureFlags) {
    return {
        transclude: 'element',
        priority: 600,
        terminal: true,
        restrict: 'A',
        $$tlb: true,
        compile: function featureFlagCompile(tElement, attrs) {
            tElement[0].textContent = ' featureFlag: ' + attrs.featureFlag + ' is off ';

            return function featureFlagPostLink($scope, element, attrs, ctrl, $transclude) {
                var featureEl, childScope;
                $scope.$watch(function featureFlagWatcher() {
                        return featureFlags.isOn(attrs.featureFlag);
                }, function featureFlagChanged(isEnabled) {
                    if (isEnabled) {
                        childScope = $scope.$new();
                        $transclude(childScope, function(clone) {
                            featureEl = clone;
                            element.after(featureEl).remove();
                        });
                    } else {
                        if(childScope) {
                            childScope.$destroy();
                            childScope = null;
                        }
                        if(featureEl) {
                            featureEl.after(element).remove();
                            featureEl = null;
                        }
                    }
                });
            };
        }
    };
});
angular.module('feature-flags').directive('featureFlagOverrides', function(featureFlags) {
    return {
        restrict: 'A',
        link: function postLink($scope) {
            $scope.flags = featureFlags.get();

            $scope.isOn = featureFlags.isOn;
            $scope.isOverridden = featureFlags.isOverridden;
            $scope.enable = featureFlags.enable;
            $scope.disable = featureFlags.disable;
            $scope.reset = featureFlags.reset;
        },
        template: '<div class="feature-flags">' +
                  '    <h1>Feature Flags</h1>'+
                  '    <div class="feature-flags-flag" ng-repeat="flag in flags">'+
                  '        <div class="feature-flags-name">{{flag.name}}</div>'+
                  '        <div class="feature-flags-switch" ng-click="enable(flag)" ng-class="{\'active\': isOverridden(flag.key) && isOn(flag.key)}">ON</div>'+
                  '        <div class="feature-flags-switch" ng-click="disable(flag)" ng-class="{\'active\': isOverridden(flag.key) && !isOn(flag.key)}">OFF</div>'+
                  '        <div class="feature-flags-switch" ng-click="reset(flag)" ng-class="{\'active\': !isOverridden(flag.key)}">DEFAULT</div>'+
                  '        <div class="feature-flags-desc">{{flag.description}}</div>'+
                  '    </div>'+
                  '</div>',
        replace: true
    };
});
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
angular.module('feature-flags').service('featureFlags', function($http, featureFlagOverrides) {
        var serverFlagCache = {},
            flags = [],

            get = function() {
                return flags;
            },

            set = function(promise) {
                var method = promise.success || promise.then;

                return method.call(promise, function(response) {
                        response.forEach(function(flag) {
                            serverFlagCache[flag.key] = flag.active;
                            flag.active = isOn(flag.key);
                        });
                        angular.copy(response, flags);
                    });
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
            },

            isOverridden = function(key) {
                return featureFlagOverrides.isPresent(key);
            },

            isOn = function(key) {
                return isOverridden(key) ? featureFlagOverrides.get(key) == 'true' : serverFlagCache[key];
            };

        return {
            set: set,
            get: get,
            enable: enable,
            disable: disable,
            reset: reset,
            isOn: isOn,
            isOverridden: isOverridden
        };
    });
}());