(function () {
    'use strict';

    describe('Service: Override', function() {
        var service, appName = '';

        beforeEach(module('feature-flags'));

        beforeEach(inject(function(override) {
            service = override;
        }));

        describe('when I set an override', function() {
            beforeEach(function() {
                spyOn(localStorage, 'setItem');
                service.set('FLAG_KEY', 'VALUE');
            });

            it('should save the value', function() {
                expect(localStorage.setItem).toHaveBeenCalledWith(appName + '.' + 'FLAG_KEY', 'VALUE');
            });
        });

        describe('when I get an override', function() {
            beforeEach(function() {
                spyOn(localStorage, 'getItem');
                service.get('FLAG_KEY');
            });

            it('should get the value', function() {
                expect(localStorage.getItem).toHaveBeenCalledWith(appName + '.' + 'FLAG_KEY');
            });
        });

        describe('when I remove an override', function() {
            beforeEach(function() {
                spyOn(localStorage, 'removeItem');
                service.remove('FLAG_KEY');
            });

            it('should delete the value', function() {
                expect(localStorage.removeItem).toHaveBeenCalledWith(appName + '.' + 'FLAG_KEY');
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
    });
}());
