angular.module('feature-flags', [])
    .value('FLAGS_URL', 'data/flags.json')
    .run(function(flags) {
        flags.fetch();
    });