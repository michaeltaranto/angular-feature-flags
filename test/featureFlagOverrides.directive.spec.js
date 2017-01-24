(function(angular) {
  'use strict';

  var module = angular.mock.module,
    inject = angular.mock.inject;

  describe('Directive: featureFlagsOverrides', function() {
    var $scope, container, featureFlags;

    beforeEach(module('feature-flags'));

    beforeEach(inject(function($rootScope, $compile, _featureFlags_) {
      $scope = $rootScope.$new();
      featureFlags = _featureFlags_;
      spyOn(featureFlags, 'isOn');
      spyOn(featureFlags, 'isOverridden');
      spyOn(featureFlags, 'enable');
      spyOn(featureFlags, 'disable');
      spyOn(featureFlags, 'reset');
      spyOn(featureFlags, 'get').and.returnValue('FLAGS_ARRAY');

      container = angular.element('<div feature-flag-overrides></div>');
      $compile(container)($scope);
    }));

    describe('override panel', function() {
      it('should get the flags', function() {
        expect(featureFlags.get).toHaveBeenCalled();
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
        expect(featureFlags.isOn).toHaveBeenCalled();
      });
    });

    describe('isOverridden', function() {
      beforeEach(function() {
        $scope.isOverridden();
      });

      it('should check if a flag has been overridden', function() {
        expect(featureFlags.isOverridden).toHaveBeenCalled();
      });
    });

    describe('enable', function() {
      beforeEach(function() {
        $scope.enable();
      });

      it('should enable the flag', function() {
        expect(featureFlags.enable).toHaveBeenCalled();
      });
    });

    describe('disable', function() {
      beforeEach(function() {
        $scope.disable();
      });

      it('should disable the flag', function() {
        expect(featureFlags.disable).toHaveBeenCalled();
      });
    });

    describe('reset', function() {
      beforeEach(function() {
        $scope.reset();
      });

      it('should reset the flag override', function() {
        expect(featureFlags.reset).toHaveBeenCalled();
      });
    });
  });
}(window.angular));
