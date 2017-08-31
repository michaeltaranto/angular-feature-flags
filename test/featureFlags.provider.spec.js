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
            var flags = [
                    { key: 'FLAG_KEY' },
                    { key: 'FLAG_KEY_2' }
                ],
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
            var flags = [
                    { key: 'FLAG_KEY' },
                    { key: 'FLAG_KEY_2' }
                ],
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
            var flags = [
                    { key: 'FLAG_KEY' },
                    { key: 'FLAG_KEY_2' }
                ],
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

        describe('when I enable a feature flag override in the beta environment', function() {
            var flag = { key: 'FLAG_KEY', environments: { beta: false, prod: false } };

            beforeEach(function() {
                spyOn(featureFlagOverrides, 'set');
                featureFlags.setEnvironment('beta');
                featureFlags.enable(flag.key);
            });

            it('should set the flag with the correct name and value', function() {
                expect(featureFlagOverrides.set).toHaveBeenCalledWith(flag.key, true);
            });
        });

        describe('when I disable a feature flag override  in the beta environment', function() {
            var flag = { key: 'FLAG_KEY', environments: { beta: true, prod: true } };

            beforeEach(function() {
                spyOn(featureFlagOverrides, 'set');
                featureFlags.setEnvironment('beta');
                featureFlags.disable(flag.key);
            });

            it('should set the flag with the correct name and value', function() {
                expect(featureFlagOverrides.set).toHaveBeenCalledWith(flag.key, false);
            });
        });

        describe('when I reset a feature flag to default', function() {
            var originalFlagValue = true,
                flag = { key: 'FLAG_KEY', environments: { beta: originalFlagValue, prod: true } };

            beforeEach(function() {
                $httpBackend.when('GET', 'data/flags.json').respond([ flag ]);
                featureFlags.set($http.get('data/flags.json'));
                $httpBackend.flush();
                featureFlags.setEnvironment('beta');

                spyOn(featureFlagOverrides, 'set');
                featureFlags.disable(flag.key);

                spyOn(featureFlagOverrides, 'remove');
                featureFlags.reset(flag.key);
            });

            it('should remove the flag', function() {
                expect(featureFlagOverrides.remove).toHaveBeenCalledWith(flag.key);
            });
        });

        describe('when I check if there is an local override', function() {
            var flag = { key: 'FLAG_KEY' };

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
            var today = new Date();
            var future = new Date();
            var onFlag = { key: 'FLAG_KEY_ON', environments: { beta: true } };
            var offFlag = { key: 'FLAG_KEY_OFF', environments: { beta: false } };
            var onFlagOverridden = { key: 'FLAG_KEY_ON_OVERRIDDEN', environments: { beta: true } };
            var offFlagOverridden = { key: 'FLAG_KEY_OFF_OVERRRIDDEN', environments: { beta: false } };
            var undefinedFlag = { key: 'FLAG_UNDEFINED', environments: { beta: false } };
            var undefinedFlagOverridden = { key: 'FLAG_UNDEFINED_OVERRIDDEN', environments: { beta: false } };
            var invalidInstanceFlag = { key: 'FLAG_KEY_ON_INSTANCE_INVALID', instances: [543], environments: { beta: true } };
            var validInstanceFlag = { key: 'FLAG_KEY_ON_INSTANCE_VALID', instances: [218, 517], environments: { beta: true } };
            var onFlagThatHasExpired = { key: 'FLAG_KEY_EXPIRED', expires: '2017-08-30T00:05:54Z', environments: { beta: true } };
            var onFlagFutureExpiry = { key: 'FLAG_KEY_FUTURE_EXPIRY', expires: future.setDate(today.getHours() + 1), environments: { beta: true } };

            beforeEach(function(done) {
                var flagsToLoad = [onFlag, offFlag, onFlagOverridden, offFlagOverridden, invalidInstanceFlag, validInstanceFlag, onFlagThatHasExpired, onFlagFutureExpiry];
                featureFlags.setEnvironment('beta');
                featureFlags.setInstance(218);
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

            it('should report feature is off by default when provided instances for flag do not match current instance', function() {
                expect(featureFlags.isOnByDefault(invalidInstanceFlag.key)).toBe(false);
            });

            it('should report feature is on by default when provided instances for flag match current instance', function() {
                expect(featureFlags.isOnByDefault(validInstanceFlag.key)).toBe(true);
            });

            it('should report feature is off by default when default is on but has expired', function() {
                expect(featureFlags.isOnByDefault(onFlagThatHasExpired.key)).toBe(false);
            });

            it('should report feature is on by default when default is on and has not yet expired', function() {
                expect(featureFlags.isOnByDefault(onFlagFutureExpiry.key)).toBe(true);
            });
        });

        describe('when I check a feature flags state', function() {
            describe('if the feature is disabled on the server', function() {
                var flag = { key: 'FLAG_KEY', environments: { beta: true, prod: false } };

                beforeEach(function() {
                    $httpBackend.when('GET', 'data/flags.json').respond([ flag ]);
                    featureFlags.setEnvironment('beta');
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
                        expect(featureFlags.isOn(flag.key)).toBe(flag.environments.beta);
                    });
                });
            });

            describe('if the feature is enabled on the server', function() {
                var flag = { key: 'FLAG_KEY', environments: { beta: true, prod: false } };

                beforeEach(function() {
                    $httpBackend.when('GET', 'data/flags.json').respond([ flag ]);
                    featureFlags.setEnvironment('beta');
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

    describe('Provider: featureFlags', function() {
        var featureFlags,
            flags = [
                { active: true, key: 'FLAG_KEY' },
                { active: false, key: 'FLAG_KEY_2' }
            ];

        describe('When no flags are set in the config phase', function() {
            beforeEach(module('feature-flags', function(featureFlagsProvider) {
                featureFlagsProvider.setInitialFlags(null);
            }));

            beforeEach(inject(function(_featureFlags_) {
                featureFlags = _featureFlags_;
            }));

            it('should return an empty array for current feature flags', function() {
                expect(featureFlags.get()).toEqual([]);
            });
        });

        describe('When flags are set in the config phase', function() {
            beforeEach(module('feature-flags', function(featureFlagsProvider) {
                featureFlagsProvider.setInitialFlags(flags);
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
