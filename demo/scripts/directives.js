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
  .directive('code', function(featureFlags) {
      return {
        restrict: 'E',
        scope: {},
        template: '<div class="panel"><button ng-click="codeCtrl.alert()">Click Me!</button></div>',
        replace: true,
        controllerAs: 'codeCtrl',
        controller: function(){
          var self = this;

          self.alert = function(){
            if(featureFlags.isOn('code')) {
              alert("Hello!");
            }
          };

        }
      };
    })
  .run(function(featureFlags, $http) {
    featureFlags.set($http.get('../data/flags.json'));
  });
