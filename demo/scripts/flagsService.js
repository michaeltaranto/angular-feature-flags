angular.module("feature-flags", {})
    .constant("FLAG_PREFIX", "my-app")
    .constant("FLAGS_URL", "data/flags.json")
    .run(function($rootScope, FlagsService) {
        $rootScope.featureFlagEnable = FlagsService.enable;
        $rootScope.featureFlagDisable = FlagsService.disable;

        FlagsService.fetch();
    })
    .directive("featureFlag", function(FlagsService) {
        return {
            restrict: "A",
            link: function postLink($scope, element, attrs) {
                $scope.$watch(function() {
                    return FlagsService.isOn(attrs.featureFlag);
                }, function(isEnabled) {
                    if (isEnabled === false) {
                        element.remove();
                    }
                });
            }
        };
    })
    .service("FlagsService", function($http, FLAG_PREFIX, FLAGS_URL) {
        var cache = [],

            get = function() {
                return cache;
            },

            fetch = function() {
                return $http.get(FLAGS_URL)
                            .success(function(flags) {
                                flags.forEach(function(flag) {
                                    flag.active = isOn(flag.key);
                                });
                                angular.copy(flags, cache);
                            });
            },

            enable = function(flag) {
                flag.active = true;
                localStorage.setItem(FLAG_PREFIX + "." + flag.key, true);
            },

            disable = function(flag) {
                flag.active = false;
                localStorage.removeItem(FLAG_PREFIX + "." + flag.key);
            },

            isOn = function(key) {
                return localStorage.getItem(FLAG_PREFIX + "." + key) !== null;
            };

        return {
            fetch: fetch,
            get: get,
            enable: enable,
            disable: disable,
            isOn: isOn
        };
    });