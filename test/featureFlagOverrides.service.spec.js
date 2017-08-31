(function(angular) {
    'use strict';

    var module = angular.mock.module,
        inject = angular.mock.inject;

    describe('Service: featureFlagOverrides', function() {
        var service, appName = '';

        beforeEach(module('feature-flags'));

        beforeEach(inject(function(featureFlagOverrides) {
            service = featureFlagOverrides;
        }));

        describe('when I set an override', function() {
            beforeEach(function() {
                spyOn(localStorage, 'setItem');
                service.setEnvironment('prod');
                service.set('FLAG_KEY', 'VALUE');
            });

            it('should save the value', function() {
                expect(localStorage.setItem).toHaveBeenCalledWith('featureFlags.' + appName + '.prod' + '.' + 'FLAG_KEY', 'VALUE');
            });
        });

        describe('when I set a hash of overrides', function() {
            beforeEach(function() {
                spyOn(localStorage, 'setItem');
                service.setEnvironment('prod');
                service.set({
                    'FLAG_KEY_1': 'VALUE_1',
                    'FLAG_KEY_2': 'VALUE_2',
                    'FLAG_KEY_3': 'VALUE_3'
                });
            });

            it('should save the values', function() {
                expect(localStorage.setItem).toHaveBeenCalledWith('featureFlags.' + appName + '.prod' + '.' + 'FLAG_KEY_1', 'VALUE_1');
                expect(localStorage.setItem).toHaveBeenCalledWith('featureFlags.' + appName + '.prod' + '.' + 'FLAG_KEY_2', 'VALUE_2');
                expect(localStorage.setItem).toHaveBeenCalledWith('featureFlags.' + appName + '.prod' + '.' + 'FLAG_KEY_3', 'VALUE_3');
            });
        });

        describe('when I get an override', function() {
            beforeEach(function() {
                spyOn(localStorage, 'getItem');
                service.setEnvironment('prod');
                service.get('FLAG_KEY');
            });

            it('should get the value', function() {
                expect(localStorage.getItem).toHaveBeenCalledWith('featureFlags.' + appName + '.prod' + '.' + 'FLAG_KEY');
            });
        });

        describe('when I remove an override', function() {
            beforeEach(function() {
                spyOn(localStorage, 'removeItem');
                service.setEnvironment('prod');
                service.remove('FLAG_KEY');
            });

            it('should delete the value', function() {
                expect(localStorage.removeItem).toHaveBeenCalledWith('featureFlags.' + appName + '.prod' + '.' + 'FLAG_KEY');
            });
        });

        describe('when I check the state of an override', function() {
            describe('if there one', function() {
                beforeEach(function() {
                    spyOn(localStorage, 'getItem').andReturn('true');
                });

                it('should return true if there is a value', function() {
                    expect(service.isPresent('FLAG_KEY')).toBe(true);
                });
            });

            describe('if there is not one', function() {
                beforeEach(function() {
                    spyOn(localStorage, 'getItem').andReturn(null);
                });

                it('should return false if there is no value', function() {
                    expect(service.isPresent('FLAG_KEY')).toBe(false);
                });
            });
        });

        describe('when I have a series of overrides and then clear them', function() {
            beforeEach(function() {
                spyOn(localStorage, 'removeItem');
                service.setEnvironment('prod');
                localStorage.setItem('someOtherData', '');
                service.set('FLAG_KEY_1', 'VALUE');
                service.set('FLAG_KEY_2', 'VALUE');
                service.set('FLAG_KEY_3', 'VALUE');
                service.reset();
            });

            afterEach(function() {
                localStorage.clear();
            });

            it('should remove all feature flags from local storage', function() {
                expect(localStorage.removeItem).toHaveBeenCalledWith('featureFlags.' + appName + '.prod' + '.' + 'FLAG_KEY_1');
                expect(localStorage.removeItem).toHaveBeenCalledWith('featureFlags.' + appName + '.prod' + '.' + 'FLAG_KEY_2');
                expect(localStorage.removeItem).toHaveBeenCalledWith('featureFlags.' + appName + '.prod' + '.' + 'FLAG_KEY_3');
            });

            it('should not remove unrelated local storage items', function() {
                expect(localStorage.removeItem).not.toHaveBeenCalledWith('someOtherData');
            });
        });
    });
}(window.angular));
