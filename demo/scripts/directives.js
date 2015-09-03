angular.module('my-app')
    .directive('activityFeed', function() {
        return {
            restrict: 'A',
            scope: {},
            template: '<div class="panel" ng-class="{selected: selected}" ng-click="selected = !selected;">Activity Feed</div>',
            replace: true
        };
    })
    .directive('messaging', function() {
        return {
            restrict: 'A',
            scope: {},
            template: '<div class="panel" ng-class="{selected: selected}" ng-click="selected = !selected;">Messaging</div>',
            replace: true
        };
    })
    .directive('userProfile', function() {
        return {
            restrict: 'A',
            scope: {},
            template: '<div class="panel" ng-class="{selected: selected}" ng-click="selected = !selected;">User Profile</div>',
            replace: true
        };
    })
    .directive('settings', function() {
        return {
            restrict: 'A',
            scope: {},
            template: '<div class="panel" ng-class="{selected: selected}" ng-click="selected = !selected;">Settings</div>',
            replace: true
        };
    })
    .run(function(featureFlags, $http) {
        featureFlags.set($http.get('../data/flags.json'));
    });
