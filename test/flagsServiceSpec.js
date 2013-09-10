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

        beforeEach(module("feature-flags"));

        beforeEach(inject(function($injector, FlagsService) {
            $http = $injector.get("$httpBackend");
            $http.when("GET", "data/flags.json").respond(FLAGS);

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

            beforeEach(inject(function(COOKIE_PREFIX, FLAG_TIMEOUT) {
                document.cookie = COOKIE_PREFIX + "." + flag1.key + "=true;path=/;max-age=" + FLAG_TIMEOUT;

                flagsService.fetch();
                $http.flush();
            }));

            afterEach(inject(function(COOKIE_PREFIX) {
                document.cookie = COOKIE_PREFIX + "." + flag1.key + "=false;path=/;expires=" + new Date(0);

                flag1.active = null;
                flag2.active = null;

                $http.verifyNoOutstandingExpectation();
                $http.verifyNoOutstandingRequest();
            }));

            it("should set the flag as active on load if there's a cookie present", function() {
                expect(flag1.active).toBe(true);
            });

            it("should set the flag as inactive on load if there's no cookie present", function() {
                expect(flag2.active).toBe(false);
            });
        });
        
        describe("when I enable a feature flag", function() {
            var flag = FLAGS[0];

            beforeEach(function() {
                flagsService.enable(flag);
            });

            afterEach(inject(function(COOKIE_PREFIX) {
                document.cookie = COOKIE_PREFIX + "." + flag.key + "=false;path=/;expires=" + new Date(0);
                flag.active = null;
            }));

            it("should set a cookie with the correct name", function() {
                expect(document.cookie.indexOf(flag.key)).toBeGreaterThan(-1);
            });

            it("should set the flag as active", function() {
                expect(flag.active).toBe(true);
            });
        });
        
        describe("when I disable a feature flag", function() {
            var flag = FLAGS[0];

            beforeEach(function() {
                flagsService.disable(flag);
            });

            afterEach(inject(function(COOKIE_PREFIX) {
                document.cookie = COOKIE_PREFIX + "." + flag.key + "=false;path=/;expires=" + new Date(0);
                flag.active = null;
            }));

            it("should remove the cookie", function() {
                expect(document.cookie.indexOf(flag.key)).toBe(-1);
            });

            it("should set the flag as inactive", function() {
                expect(flag.active).toBe(false);
            });
        });
        
        describe("when I check a feature flags state", function() {
            beforeEach(function() {
                flagsService.enable(FLAGS[0]);
                flagsService.disable(FLAGS[1]);
            });

            afterEach(inject(function(COOKIE_PREFIX) {
                document.cookie = COOKIE_PREFIX + "." + FLAGS[0].key + "=false;path=/;expires=" + new Date(0);
                FLAGS[0].active = null;
                document.cookie = COOKIE_PREFIX + "." + FLAGS[1].key + "=false;path=/;expires=" + new Date(0);
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
