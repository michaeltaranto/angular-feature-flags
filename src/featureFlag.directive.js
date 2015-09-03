angular.module('feature-flags').directive('featureFlag', function(featureFlags) {
    return {
        transclude: 'element',
        priority: 599,
        terminal: true,
        restrict: 'A',
        $$tlb: true,
        compile: function featureFlagCompile(tElement, tAttrs) {
            var hasHideAttribute = 'featureFlagHide' in tAttrs;

            tElement[0].textContent = ' featureFlag: ' + tAttrs.featureFlag + ' is ' + (hasHideAttribute ? 'on' : 'off') + ' ';

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
                        if (childScope) {
                            childScope.$destroy();
                            childScope = null;
                        }
                        if (featureEl) {
                            featureEl.after(element).remove();
                            featureEl = null;
                        }
                    }
                });
            };
        }
    };
});
