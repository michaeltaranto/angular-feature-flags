(function(angular) {
  'use strict';

  var module = angular.mock.module,
    inject = angular.mock.inject;

  describe('Provider: featureFlags', function() {
    var featureFlags,
      featureFlagsConfig,
      flags = [{
        active: true,
        key: 'FLAG_KEY'
      }, {
        active: false,
        key: 'FLAG_KEY_2'
      }];

    describe('When no flags are set in the config phase', function() {
      beforeEach(module('feature-flags', function(featureFlagConfigProvider) {
        featureFlagConfigProvider.setInitialFlags(null);
        featureFlagConfigProvider.setAppName(null);
      }));

      beforeEach(inject(function(_featureFlagConfig_) {
        featureFlagsConfig = _featureFlagConfig_;
      }));

      it('should return an empty array for current feature flags', function() {
        expect(featureFlagsConfig).not.toBeUndefined();
        expect(featureFlagsConfig.getInitialFlags()).toEqual([]);
        expect(featureFlagsConfig.getAppName()).toEqual('');
      });
    });

    xdescribe('When flags are set in the config phase', function() {
      beforeEach(module('feature-flags', function(featureFlagConfigProvider) {
        featureFlagConfigProvider.setInitialFlags(flags);
        featureFlagConfigProvider.setAppName('myapp');
      }));

      beforeEach(inject(function(_featureFlagConfig_) {
        featureFlagsConfig = _featureFlagConfig_;
      }));

      it('should init the flags with the ones set in the config phase', function() {
        expect(featureFlags.get()).toEqual(flags);
      });
    });
  });
}(window.angular));
