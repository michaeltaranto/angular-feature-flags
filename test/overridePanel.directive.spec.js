(function () {
    'use strict';

    describe('Directive: OverridePanel', function() {
        var $scope, container, flags;

        beforeEach(module('feature-flags', function($provide) {
            return $provide.decorator('flags', function($delegate) {
                $delegate.fetch = angular.noop;
                
                return $delegate;
            });
        }));

        beforeEach(inject(function($rootScope, $compile, _flags_) {
            $scope = $rootScope.$new();
            flags = _flags_;
            spyOn(flags, 'isOn');
            spyOn(flags, 'isOverridden');
            spyOn(flags, 'enable');
            spyOn(flags, 'disable');
            spyOn(flags, 'reset');
            spyOn(flags, 'get').andReturn('FLAGS_ARRAY');
            
            container = angular.element('<div override-panel></div>');
            $compile(container)($scope);
        }));

        describe('override panel', function() {
            it('should get the flags', function() {
                expect(flags.get).toHaveBeenCalled();
            });

            it('should set them on scope', function() {
                expect($scope.flags).toBe('FLAGS_ARRAY');
            });
        });

        describe('isOn', function() {
            beforeEach(function() {
                $scope.isOn();
            });
            
            it('should check if a flag is on', function() {
                expect(flags.isOn).toHaveBeenCalled();
            });
        });

        describe('isOverridden', function() {
            beforeEach(function() {
                $scope.isOverridden();
            });

            it('should check if a flag has been overridden', function() {
                expect(flags.isOverridden).toHaveBeenCalled();
            });
        });

        describe('enable', function() {
            beforeEach(function() {
                $scope.enable();
            });

            it('should enable the flag', function() {
                expect(flags.enable).toHaveBeenCalled();
            });
        });

        describe('disable', function() {
            beforeEach(function() {
                $scope.disable();
            });

            it('should disable the flag', function() {
                expect(flags.disable).toHaveBeenCalled();
            });
        });

        describe('reset', function() {
            beforeEach(function() {
                $scope.reset();
            });

            it('should reset the flag override', function() {
                expect(flags.reset).toHaveBeenCalled();
            });
        });
    });
}());
