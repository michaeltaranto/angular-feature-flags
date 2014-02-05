angular.module("my-app")
    .directive("activityFeed", function() {
        return {
            restrict: "A",
            scope: {},
            template: '<div class="panel" ng-class="{selected: selected}" ng-click="selected = !selected;">Activity Feed</div>',
            replace: true
        };
    })
    .directive("messaging", function() {
        return {
            restrict: "A",
            scope: {},
            template: '<div class="panel" ng-class="{selected: selected}" ng-click="selected = !selected;">Messaging</div>',
            replace: true
        };
    })
    .directive("userProfile", function() {
        return {
            restrict: "A",
            scope: {},
            template: '<div class="panel" ng-class="{selected: selected}" ng-click="selected = !selected;">User Profile</div>',
            replace: true
        };
    })
    .directive("settings", function() {
        return {
            restrict: "A",
            scope: {},
            template: '<div class="panel" ng-class="{selected: selected}" ng-click="selected = !selected;">Settings</div>',
            replace: true
        };
    })
    .directive("switches", function($timeout, FlagsService) {
        return {
            restrict: "A",
            link: function postLink($scope) {
                var highlightChange;

                $scope.flags = FlagsService.get();

                $scope.toggle = function(flag) {
                    $scope[flag.active ? "featureFlagDisable" : "featureFlagEnable"](flag);

                    $scope.changed = flag;
                    $timeout.cancel(highlightChange);
                    highlightChange = $timeout(function() {
                        $scope.changed = false;
                    }, 3000);
                };
            },
            template: '<div class="flagContainer">' +
                      '    <h1>Experimental Flags</h1>'+
                      '    <div class="flag" ng-repeat="flag in flags" ng-class="{ \'on\': (changed==flag&&flag.active), \'off\': (changed==flag&&!flag.active) }" ng-click="toggle(flag)">'+
                      '        <h2>{{flag.name}}</h2>'+
                      '        <a href="#">{{flag.active ? \'Enabled\' : \'Disabled\'}}</a>'+
                      '        <div class="hint">{{flag.description}}</div>'+
                      '    </div>'+
                      '</div>',
            replace: true
        };
    });