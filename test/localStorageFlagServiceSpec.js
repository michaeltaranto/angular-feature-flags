(function () {
    "use strict";

    describe("Service: FlagsService", function() {
        var flagsService,
            FLAG_NAME_1 = "FLAG1",
            FLAG_NAME_2 = "FLAG2",
            FLAGS = [
                { active: null, key: FLAG_NAME_1 },
                { active: null, key: FLAG_NAME_2 }
            ],
            $http;

        beforeEach(module("local-storage-feature-flags"));

        beforeEach(inject(function($injector, FlagsService, FLAG_PREFIX) {
            $http = $injector.get("$httpBackend");
            $http.when("GET", "data/flags.json").respond(FLAGS);

            localStorage.removeItem(FLAG_PREFIX + "." + FLAGS[0].key);
            localStorage.removeItem(FLAG_PREFIX + "." + FLAGS[1].key);

            flagsService = FlagsService;
        }));

        describe("when I retrieve the list of flags", function() {
            beforeEach(function() {
                flagsService.fetch();
                $http.flush();
            });

            afterEach(function() {
                $http.verifyNoOutstandingExpectation();
                $http.verifyNoOutstandingRequest();
            });

            it("should return all available flags", function() {
                expect(flagsService.get()).toEqual(FLAGS);
            });
        });

        describe("when I load the available feature flags", function() {
            var flag1 = FLAGS[0],
                flag2 = FLAGS[1];

            beforeEach(inject(function(FLAG_PREFIX) {
                localStorage.setItem(FLAG_PREFIX + "." + flag1.key, true);

                flagsService.fetch();
                $http.flush();
            }));

            afterEach(inject(function(FLAG_PREFIX) {
                localStorage.removeItem(FLAG_PREFIX + "." + flag1.key);

                flag1.active = null;
                flag2.active = null;

                $http.verifyNoOutstandingExpectation();
                $http.verifyNoOutstandingRequest();
            }));

            it("should set the flag as active on load if there's a flag present", function() {
                expect(flag1.active).toBe(true);
            });

            it("should set the flag as inactive on load if there's no flag present", function() {
                expect(flag2.active).toBe(false);
            });
        });
        
        describe("when I enable a feature flag", function() {
            var flag = FLAGS[0];

            beforeEach(function() {
                flagsService.enable(flag);
            });

            afterEach(inject(function(FLAG_PREFIX) {
                localStorage.removeItem(FLAG_PREFIX + "." + flag.key);
                flag.active = null;
            }));

            it("should set a flag with the correct name", inject(function(FLAG_PREFIX) {
                expect(localStorage.getItem(FLAG_PREFIX + "." + flag.key)).toBeTruthy();
            }));

            it("should set the flag as active", function() {
                expect(flag.active).toBe(true);
            });
        });
        
        describe("when I disable a feature flag", function() {
            var flag = FLAGS[0];

            beforeEach(function() {
                flagsService.disable(flag);
            });

            afterEach(inject(function(FLAG_PREFIX) {
                localStorage.removeItem(FLAG_PREFIX + "." + flag.key);
                flag.active = null;
            }));

            it("should remove the flag", inject(function(FLAG_PREFIX) {
                expect(localStorage.getItem(FLAG_PREFIX + "." + flag.key)).toBeFalsy();
            }));

            it("should set the flag as inactive", function() {
                expect(flag.active).toBe(false);
            });
        });
        
        describe("when I check a feature flags state", function() {
            beforeEach(function() {
                flagsService.enable(FLAGS[0]);
                flagsService.disable(FLAGS[1]);
            });

            afterEach(inject(function(FLAG_PREFIX) {
                localStorage.removeItem(FLAG_PREFIX + "." + FLAGS[0].key);
                FLAGS[0].active = null;
                localStorage.removeItem(FLAG_PREFIX + "." + FLAGS[1].key);
                FLAGS[1].active = null;
            }));

            it("should return true if the feature is enabled", function() {
                expect(flagsService.isOn(FLAGS[0].key)).toBe(true);
            });

            it("should return true if the feature is disabled", function() {
                expect(flagsService.isOn(FLAGS[1].key)).toBe(false);
            });
        });
    });
}());
