angular.module("my-app", [ "feature-flags" ])
    .controller("MyCtrl", function($scope, FlagsService) {
        $scope.isEnabled = function(flagKey) {
            return FlagsService.isOn(flagKey);
        };
    });