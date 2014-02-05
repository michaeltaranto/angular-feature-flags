(function () {
    "use strict";

    describe("Directive: FeatureFlag", function() {
        var $scope, container;

        beforeEach(module('local-storage-feature-flags', function($provide) {
            return $provide.decorator('FlagsService', function($delegate) {
                $delegate.fetch = angular.noop;
                
                return $delegate;
            });
        }));

        beforeEach(inject(function($rootScope, $compile) {
            $scope = $rootScope.$new();
            container = angular.element('<div><div feature-flag="FLAG_NAME"></div></div>');
            $compile(container)($scope);
        }));

        describe('when the feature flag', function() {
            describe('is on', function() {
                beforeEach(inject(function(FlagsService) {
                    spyOn(FlagsService, 'isOn').andReturn(true);
                    $scope.$digest();
                }));

                it('should leave the element in the dom', function() {
                    expect(container.children().length).toBe(1);
                });
            });

            describe('if off', function() {
                beforeEach(inject(function(FlagsService) {
                    spyOn(FlagsService, 'isOn').andReturn(false);
                    $scope.$digest();
                }));
                
                it('should remove the element from the dom', function() {
                    expect(container.children().length).toBe(0);
                });
            });
        });
    });
}());
