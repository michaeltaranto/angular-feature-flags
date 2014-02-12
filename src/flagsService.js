angular.module("feature-flags", [])
    .constant("FLAG_PREFIX", "my-app")
    .constant("FLAG_STORAGE", "LOCAL_STORAGE") // (LOCAL_STORAGE / COOKIE / REMOTE)
    .constant("FLAGS_URL", "data/flags.json")
    .config(function($provide) {
        return $provide.provider("SettingStore", function(FLAG_STORAGE) {
            return {
                $get: function() {
                    return {
                        LOCAL_STORAGE: {
                            isSet: function(key) {
                                return localStorage.getItem(key) !== null;
                            },
                            set: function(key) {
                                localStorage.setItem(key, true);
                            },
                            remove: function(key) {
                                localStorage.removeItem(key);
                            }
                        },
                        COOKIE: {
                            isSet: function(key) {
                                return document.cookie.indexOf(key) > -1;
                            },
                            set: function(key) {
                                document.cookie = key + "=true;path=/;";
                            },
                            remove: function(key) {
                                document.cookie = key + "=false;path=/;expires=" + new Date(0);
                            }
                        }
                    }[FLAG_STORAGE];
                }
            };
        });
    })
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
    .service("FlagsService", function($http, FLAG_PREFIX, FLAGS_URL, SettingStore) {
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
                SettingStore.set(FLAG_PREFIX + "." + flag.key);
            },

            disable = function(flag) {
                flag.active = false;
                SettingStore.remove(FLAG_PREFIX + "." + flag.key);
            },

            isOn = function(key) {
                return SettingStore.isSet(FLAG_PREFIX + "." + key);
            };

        return {
            fetch: fetch,
            get: get,
            enable: enable,
            disable: disable,
            isOn: isOn
        };
    })