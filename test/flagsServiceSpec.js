(function () {
    "use strict";

    describe("Service: FlagsService", function() {
        var flagsService,
            FLAGS = [
                { active: null, key: "FLAG_KEY" },
                { active: null, key: "FLAG_KEY_2" }
            ];;

        beforeEach(module("feature-flags"));

        beforeEach(inject(function(FlagsService) {
            flagsService = FlagsService;
        }));

        describe("when I retrieve the list of flags", function() {
            var mockStore = {},
                $http;

            beforeEach(inject(function(SettingStore, $httpBackend, FLAG_PREFIX) {
                $http = $httpBackend;
                $http.when("GET", "data/flags.json").respond(FLAGS);

                mockStore[FLAG_PREFIX + "." + FLAGS[0].key] = true;
                mockStore[FLAG_PREFIX + "." + FLAGS[1].key] = false;

                spyOn(SettingStore, "isSet").andCallFake(function(key) {
                    return mockStore[key];
                });

                flagsService.fetch();
                $http.flush();
            }));

            afterEach(function() {
                $http.verifyNoOutstandingExpectation();
                $http.verifyNoOutstandingRequest();
            });

            it("should return all available flags", function() {
                expect(flagsService.get()).toEqual(FLAGS);
            });

            it("should set the flag as active on load if there's a flag set in the store", function() {
                expect(flagsService.isOn(FLAGS[0].key)).toBe(true);
            });

            it("should set the flag as inactive on load if there's no flag set in the store", function() {
                expect(flagsService.isOn(FLAGS[1].key)).toBe(false);
            });
        });

        describe("when I enable a feature flag", function() {
            var flag = { active: null, key: "FLAG_KEY" },
                set;

            beforeEach(inject(function(SettingStore) {
                set = spyOn(SettingStore, "set");

                flagsService.enable(flag);
            }));

            it("should set the flag with the correct name", inject(function(FLAG_PREFIX) {
                expect(set).toHaveBeenCalledWith(FLAG_PREFIX + "." + flag.key);
            }));

            it("should set the flag as active", function() {
                expect(flag.active).toBe(true);
            });
        });
        
        describe("when I disable a feature flag", function() {
            var flag = { active: null, key: "FLAG_KEY" },
                remove;

            beforeEach(inject(function(SettingStore) {
                remove = spyOn(SettingStore, "remove");

                flagsService.disable(flag);
            }));

            it("should remove the flag", inject(function(FLAG_PREFIX) {
                expect(remove).toHaveBeenCalledWith(FLAG_PREFIX + "." + flag.key);
            }));

            it("should set the flag as inactive", function() {
                expect(flag.active).toBe(false);
            });
        });
        
        describe("when I check a feature flags state", function() {
            var flagCheck;

            it("should return true if the feature is enabled", inject(function(SettingStore) {
                flagCheck = spyOn(SettingStore, "isSet").andReturn(true);

                expect(flagsService.isOn("KEY_NAME")).toBe(true);
            }));

            it("should return false if the feature is disabled", inject(function(SettingStore) {
                flagCheck = spyOn(SettingStore, "isSet").andReturn(false);

                expect(flagsService.isOn("KEY_NAME")).toBe(false);
            }));
        });
    });
}());
