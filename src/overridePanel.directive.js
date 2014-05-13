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