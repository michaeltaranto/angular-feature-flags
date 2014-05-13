angular.module('feature-flags').directive('featureFlag', function(flags) {
    return {
        restrict: 'A',
        link: function postLink($scope, element, attrs) {
            var placeholder = document.createComment(' featureFlag: ' + attrs.featureFlag + ' '),
                swap = function(oldEl, newEl) {
                    var parent = oldEl.parentNode;
                    if(parent) {
                        parent.replaceChild(newEl, oldEl);
                    }
                };

            $scope.$watch(function() {
                return flags.isOn(attrs.featureFlag);
            }, function(isEnabled) {
                if (isEnabled === false) {
                    swap(element[0], placeholder);
                } else {
                    swap(placeholder, element[0]);
                }
            });
        }
    };
});