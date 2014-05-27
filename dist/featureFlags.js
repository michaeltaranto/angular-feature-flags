/*!
 * Angular Feature Flags v0.3.0
 *
 * Copyright 2014, Michael Taranto
 */

(function(){
angular.module('feature-flags', []);
angular.module('feature-flags').directive('featureFlag', function(flags) {
    return {
        restrict: 'A',
        link: function postLink($scope, element, attrs) {
            var placeholder = document.createComment(' featureFlag: ' + attrs.featureFlag + ' '),
                swap = function(oldEl, newEl) {
                    var parent = oldEl.parentNode;
                    if(parent) {
                        parent.replaceChild(newEl, oldEl);
                    }
                };

            $scope.$watch(function() {
                return flags.isOn(attrs.featureFlag);
            }, function(isEnabled) {
                if (isEnabled === false) {
                    swap(element[0], placeholder);
                } else {
                    swap(placeholder, element[0]);
                }
            });
        }
    };
});
angular.module('feature-flags').service('flags', function($http, override) {
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
                override.set(flag.key, true);
            },

            disable = function(flag) {
                flag.active = false;
                override.set(flag.key, false);
            },

            reset = function(flag) {
                flag.active = serverFlagCache[flag.key];
                override.remove(flag.key);
            },

            isOverridden = function(key) {
                return override.isPresent(key);
            },

            isOn = function(key) {
                return isOverridden(key) ? override.get(key) == 'true' : serverFlagCache[key];
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
angular.module('feature-flags').service('override', function($rootElement) {
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
angular.module('feature-flags').directive('overridePanel', function(flags) {
    return {
        restrict: 'A',
        link: function postLink($scope) {
            $scope.flags = flags.get();

            $scope.isOn = flags.isOn;
            $scope.isOverridden = flags.isOverridden;
            $scope.enable = flags.enable;
            $scope.disable = flags.disable;
            $scope.reset = flags.reset;
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
}());