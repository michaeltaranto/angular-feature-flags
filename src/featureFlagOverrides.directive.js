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
            $scope.isOnByDefault = featureFlags.isOnByDefault;
        },
        template: '<div class="feature-flags">' +
                  '    <h2 class="feature-flags-heading">Feature Flags</h2>' +
                  '    <div id="feature-flag--{{flag.key}}" class="feature-flags-flag" ng-repeat="flag in flags">' +
                  '        <div class="feature-flags-name">{{flag.name || flag.key}}</div>' +
                  '        <div id="feature-flag--{{flag.key}}--enable" class="feature-flags-switch" ng-click="enable(flag.key)" ng-class="{\'active\': isOverridden(flag.key) && isOn(flag.key)}">ON</div>' +
                  '        <div id="feature-flag--{{flag.key}}--disable" class="feature-flags-switch" ng-click="disable(flag.key)" ng-class="{\'active\': isOverridden(flag.key) && !isOn(flag.key)}">OFF</div>' +
                  '        <div id="feature-flag--{{flag.key}}--reset" class="feature-flags-switch" ng-click="reset(flag.key)" ng-class="{\'active\': !isOverridden(flag.key)}">DEFAULT ({{isOnByDefault(flag.key) ? \'ON\' : \'OFF\'}})</div>' +
                  '        <div class="feature-flags-desc">{{flag.description}}</div>' +
                  '    </div>' +
                  '</div>',
        replace: true
    };
});
