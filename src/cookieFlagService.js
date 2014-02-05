angular.module("cookie-feature-flags", {})
    .constant("COOKIE_PREFIX", "my-app")
    .constant("FLAG_TIMEOUT", 900)
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
    .service("FlagsService", function($http, COOKIE_PREFIX, FLAG_TIMEOUT, FLAGS_URL) {
        var cache = [],

            _setActiveIfCookiePresent = function(flag) {
                flag.active = document.cookie.indexOf(COOKIE_PREFIX + "." + flag.key) > -1;
            },

            get = function() {
                return cache;
            },

            fetch = function() {
                return $http.get(FLAGS_URL)
                            .success(function(flags) {
                                flags.forEach(_setActiveIfCookiePresent);
                                angular.copy(flags, cache);
                            });
            },

            enable = function(flag) {
                flag.active = true;
                document.cookie = COOKIE_PREFIX + "." + flag.key + "=true;path=/;max-age=" + FLAG_TIMEOUT;
            },

            disable = function(flag) {
                flag.active = false;
                document.cookie = COOKIE_PREFIX + "." + flag.key + "=false;path=/;expires=" + new Date(0);
            },

            isOn = function(key) {
                return document.cookie.indexOf(COOKIE_PREFIX + "." + key) > -1;
            };

        return {
            fetch: fetch,
            get: get,
            enable: enable,
            disable: disable,
            isOn: isOn
        };
    });