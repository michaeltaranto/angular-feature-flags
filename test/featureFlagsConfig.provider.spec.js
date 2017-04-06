(function (angular) {
  'use strict';

  var module = angular.mock.module,
    inject = angular.mock.inject;

  describe('Provider: featureFlags', function () {
    var appName = 'myapp',
      featureFlagConfig,
      flags = [{
        active: true,
        key: 'FLAG_KEY'
      }, {
        active: false,
        key: 'FLAG_KEY_2'
      }];

    describe('When no flags are set in the config phase', function () {
      beforeEach(module('feature-flags', function (featureFlagConfigProvider) {
        featureFlagConfigProvider.setInitialFlags(null);
        featureFlagConfigProvider.setAppName(null);
      }));

      beforeEach(inject(function (_featureFlagConfig_) {
        featureFlagConfig = _featureFlagConfig_;
      }));

      it('should return an empty array for current feature flags', function () {
        expect(featureFlagConfig).not.toBeUndefined();
        expect(featureFlagConfig.getInitialFlags()).toEqual([]);
        expect(featureFlagConfig.getAppName()).toEqual('');
      });
    });

    describe('When flags are set in the config phase', function () {
      beforeEach(module('feature-flags', function (featureFlagConfigProvider) {
        featureFlagConfigProvider.setInitialFlags(flags);
        featureFlagConfigProvider.setAppName(appName);
      }));

      beforeEach(inject(function (_featureFlagConfig_) {
        featureFlagConfig = _featureFlagConfig_;
      }));

      it('should init the flags with the ones set in the config phase', function () {
        expect(featureFlagConfig).not.toBeUndefined();
        expect(featureFlagConfig.getInitialFlags()).toEqual(flags);
        expect(featureFlagConfig.getAppName()).toEqual(appName);
      });
    });

    describe('When flags are set in the run phase', function () {
      beforeEach(module('feature-flags', function (featureFlagConfigProvider) {
      }));
      beforeEach(inject(function (_featureFlagConfig_) {
        featureFlagConfig = _featureFlagConfig_;
      }));

      it('should init the flags with the ones set in the run phase', function () {
        expect(featureFlagConfig).not.toBeUndefined();
        featureFlagConfig.setInitialFlags(flags);
        featureFlagConfig.setAppName(appName);
        expect(featureFlagConfig.getInitialFlags()).toEqual(flags);
        expect(featureFlagConfig.getAppName()).toEqual(appName);
      });
    });

  });
}(window.angular));
