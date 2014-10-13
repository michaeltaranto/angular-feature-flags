angular.module('feature-flags').directive('featureFlag', ['featureFlags', function(featureFlags) {
    return {
        transclude: 'element',
        priority: 600,
        terminal: true,
        restrict: 'A',
        $$tlb: true,
        compile: function featureFlagCompile(tElement, attrs) {
            var hasHideAttribute = 'featureFlagHide' in attrs;

            tElement[0].textContent = ' featureFlag: ' + attrs.featureFlag + ' is ' + (hasHideAttribute ? 'on' : 'off') + ' ';

            return function featureFlagPostLink($scope, element, attrs, ctrl, $transclude) {
                var featureEl, childScope;
                $scope.$watch(function featureFlagWatcher() {
                        return featureFlags.isOn(attrs.featureFlag);
                }, function featureFlagChanged(isEnabled) {
                    var showElement = hasHideAttribute ? !isEnabled : isEnabled;

                    if (showElement) {
                        childScope = $scope.$new();
                        $transclude(childScope, function(clone) {
                            featureEl = clone;
                            element.after(featureEl).remove();
                        });
                    } else {
                        if(childScope) {
                            childScope.$destroy();
                            childScope = null;
                        }
                        if(featureEl) {
                            featureEl.after(element).remove();
                            featureEl = null;
                        }
                    }
                });
            };
        }
    };
}]);
