(function (angular) {
  'use strict';

  var module = angular.mock.module,
    inject = angular.mock.inject;

  describe('Provider: featureFlagsConfig', function () {
    var featureFlags,
      flags = [{
        active: true,
        key: 'FLAG_KEY'
      }, {
        active: false,
        key: 'FLAG_KEY_2'
      }],
      appName='myapp';

    describe('When no flags are set in the config phase', function () {
      beforeEach(module('feature-flags', function ($provide) {
        $provide.provider('featureFlagConfig', function () {
          this.$get = function () {
            return {
              getInitialFlags: function () {
                return [];
              },
              getAppName : function(){
                  return appName;
              }
            };
          }
        });
      }));

      beforeEach(inject(function (_featureFlags_) {
        featureFlags = _featureFlags_;
      }));

      it('should return an empty array for current feature flags', function () {
        expect(featureFlags.get()).toEqual([]);
      });
    });

    describe('When flags are set in the config phase', function () {
      beforeEach(module('feature-flags', function ($provide) {
        $provide.provider('featureFlagConfig', function () {
          this.$get = function () {
            return {
              getInitialFlags: function () {
                return flags;
              },
              getAppName : function(){
                  return appName;
              }
            };
          }
        });
      }));

      beforeEach(inject(function (_featureFlags_) {
        featureFlags = _featureFlags_;
      }));

      it('should init the flags with the ones set in the config phase', function () {
        expect(featureFlags.get()).toEqual(flags);
      });
    });
  });

}(window.angular));
