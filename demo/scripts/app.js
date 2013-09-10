angular.module("my-app", [ "feature-flags" ])
    .controller("MyCtrl", function($scope, FeatureFlagService) {
        $scope.isEnabled = function(flagKey) {
            return FeatureFlagService.isOn(flagKey);
        };
    });