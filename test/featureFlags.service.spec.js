(function(angular) {
  'use strict';

  var module = angular.mock.module,
    inject = angular.mock.inject;

  describe('Service: featureFlags', function() {
    var featureFlags,
      featureFlagOverrides,
      $rootScope,
      $q,
      $http,
      $httpBackend;

    beforeEach(module('feature-flags'));

    beforeEach(inject(function(_featureFlags_, _featureFlagOverrides_, _$rootScope_, _$q_, _$http_, _$httpBackend_) {
      featureFlags = _featureFlags_;
      featureFlagOverrides = _featureFlagOverrides_;
      $rootScope = _$rootScope_;
      $q = _$q_;
      $http = _$http_;
      $httpBackend = _$httpBackend_;
    }));

    describe('when I set the list of flags using an HttpPromise', function() {
      var flags = [{
          active: true,
          key: 'FLAG_KEY'
        }, {
          active: false,
          key: 'FLAG_KEY_2'
        }],
        promise;

      beforeEach(function() {
        $httpBackend.when('GET', 'data/flags.json').respond(flags);
        promise = featureFlags.set($http.get('data/flags.json'));
        $httpBackend.flush();
      });

      afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
      });

      it('should return a promise that resolves to the flags', function() {
        promise.then(function(value) {
          expect(value).toEqual(flags);
        });
        $rootScope.$digest();
      });

      it('should save the flags', function() {
        expect(featureFlags.get()).toEqual(flags);
      });
    });

    describe('when I set the list of flags using a regular promise', function() {
      var flags = [{
          active: true,
          key: 'FLAG_KEY'
        }, {
          active: false,
          key: 'FLAG_KEY_2'
        }],
        promise;

      beforeEach(function() {
        var deferred = $q.defer();
        deferred.resolve(flags);
        promise = featureFlags.set(deferred.promise);
        $rootScope.$digest();
      });

      it('should return a promise that resolves to the flags', function() {
        promise.then(function(value) {
          expect(value).toEqual(flags);
        });
        $rootScope.$digest();
      });

      it('should save the flags', function() {
        expect(featureFlags.get()).toEqual(flags);
      });
    });

    describe('when I manually provide an array of flags', function() {
      var flags = [{
          active: true,
          key: 'FLAG_KEY'
        }, {
          active: false,
          key: 'FLAG_KEY_2'
        }],
        promise;

      beforeEach(function() {
        promise = featureFlags.set(flags);
      });

      it('should return a promise that resolves to the flags', function() {
        promise.then(function(value) {
          expect(value).toEqual(flags);
        });
        $rootScope.$digest();
      });

      it('should save the flags', function() {
        expect(featureFlags.get()).toEqual(flags);
      });
    });

    describe('when I enable a feature flag override', function() {
      var flag = {
        active: null,
        key: 'FLAG_KEY'
      };

      beforeEach(function() {
        spyOn(featureFlagOverrides, 'set');
        featureFlags.enable(flag);
      });

      it('should set the flag with the correct name and value', function() {
        expect(featureFlagOverrides.set).toHaveBeenCalledWith(flag.key, true);
      });

      it('should set the flag as active', function() {
        expect(flag.active).toBe(true);
      });
    });

    describe('when I disable a feature flag override', function() {
      var flag = {
        active: null,
        key: 'FLAG_KEY'
      };

      beforeEach(function() {
        spyOn(featureFlagOverrides, 'set');
        featureFlags.disable(flag);
      });

      it('should set the flag with the correct name and value', function() {
        expect(featureFlagOverrides.set).toHaveBeenCalledWith(flag.key, false);
      });

      it('should set the flag as inactive', function() {
        expect(flag.active).toBe(false);
      });
    });

    describe('when I reset a feature flag to default', function() {
      var originalFlagValue = true,
        flag = {
          active: originalFlagValue,
          key: 'FLAG_KEY'
        };

      beforeEach(function() {
        $httpBackend.when('GET', 'data/flags.json').respond([flag]);
        featureFlags.set($http.get('data/flags.json'));
        $httpBackend.flush();

        spyOn(featureFlagOverrides, 'set');
        featureFlags.disable(flag);

        spyOn(featureFlagOverrides, 'remove');
        featureFlags.reset(flag);
      });

      it('should remove the flag', function() {
        expect(featureFlagOverrides.remove).toHaveBeenCalledWith(flag.key);
      });

      it('should reset the flag to the default value', function() {
        expect(flag.active).toBe(originalFlagValue);
      });
    });

    describe('when I check if there is an local override', function() {
      var flag = {
        active: null,
        key: 'FLAG_KEY'
      };

      describe('if there is', function() {
        beforeEach(function() {
          spyOn(featureFlagOverrides, 'isPresent').andReturn(true);
        });

        it('should return true when there is', function() {
          expect(featureFlags.isOverridden(flag.key)).toBe(true);
        });
      });

      describe('if there is not', function() {
        beforeEach(function() {
          spyOn(featureFlagOverrides, 'isPresent').andReturn(false);
        });

        it('should return true when there is', function() {
          expect(featureFlags.isOverridden(flag.key)).toBe(false);
        });
      });
    });

    describe('when I check a feature flag default state', function() {
      var onFlag = {
        active: true,
        key: 'FLAG_KEY_ON'
      };
      var offFlag = {
        active: false,
        key: 'FLAG_KEY_OFF'
      };
      var onFlagOverridden = {
        active: true,
        key: 'FLAG_KEY_ON_OVERRIDDEN'
      };
      var offFlagOverridden = {
        active: false,
        key: 'FLAG_KEY_OFF_OVERRRIDDEN'
      };
      var undefinedFlag = {
        key: 'FLAG_UNDEFINED'
      };
      var undefinedFlagOverridden = {
        key: 'FLAG_UNDEFINED_OVERRIDDEN'
      };

      beforeEach(function(done) {
        var flagsToLoad = [onFlag, offFlag, onFlagOverridden, offFlagOverridden];
        $httpBackend.when('GET', 'data/flags.json').respond(flagsToLoad);
        featureFlags.set($http.get('data/flags.json')).finally(done);
        $httpBackend.flush();
      });

      beforeEach(function() {
        featureFlags.disable(onFlagOverridden.key);
        featureFlags.enable(offFlagOverridden.key);
        featureFlags.enable(undefinedFlagOverridden.key);
      });

      afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
      });

      it('should report feature is on by default when it is', function() {
        expect(featureFlags.isOnByDefault(onFlag.key)).toBe(true);
      });

      it('should report feature is off by default when it is', function() {
        expect(featureFlags.isOnByDefault(offFlag.key)).toBe(false);
      });

      it('should return undefined if the key was not loaded by set()', function() {
        expect(typeof featureFlags.isOnByDefault(undefinedFlag.key)).toBe('undefined');
      });

      it('should report feature is on by default when it is even when disabled', function() {
        expect(featureFlags.isOnByDefault(onFlagOverridden.key)).toBe(true);
      });

      it('should report feature is off by default when it is even when enabled', function() {
        expect(featureFlags.isOnByDefault(offFlagOverridden.key)).toBe(false);
      });

      it('should return undefined if the key was not loaded by set() even when enabled', function() {
        expect(typeof featureFlags.isOnByDefault(undefinedFlagOverridden.key)).toBe('undefined');
      });
    });

    describe('when I check a feature flags state', function() {
      describe('if the feature is disabled on the server', function() {
        var flag = {
          active: false,
          key: 'FLAG_KEY'
        };

        beforeEach(function() {
          $httpBackend.when('GET', 'data/flags.json').respond([flag]);
          featureFlags.set($http.get('data/flags.json'));
          $httpBackend.flush();
        });

        afterEach(function() {
          $httpBackend.verifyNoOutstandingExpectation();
          $httpBackend.verifyNoOutstandingRequest();
        });

        describe('and there is a local override to turn it on', function() {
          beforeEach(function() {
            spyOn(featureFlagOverrides, 'isPresent').andReturn(true);
            spyOn(featureFlagOverrides, 'get').andReturn('true');
          });

          it('should report the feature as being on', function() {
            expect(featureFlags.isOn(flag.key)).toBe(true);
          });
        });

        describe('and there is no local override to turn it on', function() {
          beforeEach(function() {
            spyOn(featureFlagOverrides, 'isPresent').andReturn(false);
          });

          it('should report the feature as being off', function() {
            expect(featureFlags.isOn(flag.key)).toBe(flag.active);
          });
        });
      });

      describe('if the feature is enabled on the server', function() {
        var flag = {
          active: true,
          key: 'FLAG_KEY'
        };

        beforeEach(function() {
          $httpBackend.when('GET', 'data/flags.json').respond([flag]);
          featureFlags.set($http.get('data/flags.json'));
          $httpBackend.flush();
        });

        afterEach(function() {
          $httpBackend.verifyNoOutstandingExpectation();
          $httpBackend.verifyNoOutstandingRequest();
        });

        describe('and there is a local override to turn it off', function() {
          beforeEach(function() {
            spyOn(featureFlagOverrides, 'isPresent').andReturn(true);
            spyOn(featureFlagOverrides, 'get').andReturn('false');
          });

          it('should report the feature as being off', function() {
            expect(featureFlags.isOn(flag.key)).toBe(false);
          });
        });

        describe('and there is no local override to turn it off', function() {
          beforeEach(function() {
            spyOn(featureFlagOverrides, 'isPresent').andReturn(false);
          });

          it('should report the feature as being on', function() {
            expect(featureFlags.isOn(flag.key)).toBe(true);
          });
        });
      });
    });
  });

  describe('Service with provider config: featureFlags', function() {
    var featureFlags,
      flags = [{
        active: true,
        key: 'FLAG_KEY'
      }, {
        active: false,
        key: 'FLAG_KEY_2'
      }],
      appName = 'myapp';

    describe('When no flags are set in the config phase', function() {
      beforeEach(module('feature-flags', function($provide) {
        $provide.provider('featureFlagConfig', function() {
          return {
            $get: function() {
              return {
                getInitialFlags: function() {
                  return null;
                },
                getAppName: function() {
                  return appName;
                }
              };
            }
          };
        });
      }));

      beforeEach(inject(function(_featureFlags_) {
        featureFlags = _featureFlags_;
      }));

      it('should return an empty array for current feature flags', function() {
        expect(featureFlags.get()).toEqual([]);
      });
    });

    describe('When flags are set in the config phase', function() {
      beforeEach(module('feature-flags', function($provide) {
        $provide.provider('featureFlagConfig', function() {
          return {
            $get: function() {
              return {
                getInitialFlags: function() {
                  return flags;
                },
                getAppName: function() {
                  return appName;
                }
              };
            }
          };
        });
      }));

      beforeEach(inject(function(_featureFlags_) {
        featureFlags = _featureFlags_;
      }));

      it('should init the flags with the ones set in the config phase', function() {
        expect(featureFlags.get()).toEqual(flags);
      });
    });
  });
}(window.angular));
