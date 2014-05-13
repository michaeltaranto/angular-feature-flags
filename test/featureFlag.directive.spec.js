(function () {
    'use strict';

    describe('Directive: FeatureFlag', function() {
        var $scope, container, featureEl, flagCheck;

        beforeEach(module('feature-flags', function($provide) {
            return $provide.decorator('flags', function($delegate) {
                $delegate.fetch = angular.noop;
                
                return $delegate;
            });
        }));

        beforeEach(inject(function($rootScope, $compile, flags) {
            $scope = $rootScope.$new();
            featureEl = angular.element('<div feature-flag="FLAG_NAME"></div>');
            container = angular.element('<div></div>');
            container.append(featureEl);
            flagCheck = spyOn(flags, 'isOn');
            $compile(container)($scope);
        }));

        describe('when the feature flag', function() {
            describe('is on', function() {
                beforeEach(inject(function(flags) {
                    flagCheck.andReturn(true);
                    $scope.$digest();
                }));

                it('should leave the element in the dom', function() {
                    expect(container.children()[0]).toBe(featureEl[0]);
                });
            });

            describe('if off', function() {
                beforeEach(inject(function(flags) {
                    flagCheck.andReturn(false);
                    $scope.$digest();
                }));
                
                it('should swap a placeholder comment into its place', function() {
                    expect(container[0].childNodes.length).toBe(1);
                    expect(container[0].childNodes[0].nodeName).toContain('comment');
                    expect(container[0].childNodes[0].textContent).toContain('FLAG_NAME');
                });
            });
        });        

        describe('when i toggle it off and on again', function() {
            beforeEach(inject(function(flags) {
                flagCheck.andReturn(false);
                $scope.$digest();
                flagCheck.andReturn(true);
                $scope.$digest();
            }));

            it('should replace the placeholder comment with the element', function() {
                expect(container.children().length).toBe(1);
                expect(container.children()[0]).toBe(featureEl[0]);
            });
        });
    });
}());
