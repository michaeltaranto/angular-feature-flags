[![Build Status](https://travis-ci.org/mjt01/angular-feature-flags.png?branch=master)](https://travis-ci.org/mjt01/angular-feature-flags)
[![Coverage Status](https://coveralls.io/repos/mjt01/angular-feature-flags/badge.png)](https://coveralls.io/r/mjt01/angular-feature-flags)
## angular-feature-flags

An AngularJS module that allows you to control when you release new features in your app by putting them behind feature flags/switches. **This module only supports Angular v1.2 and up.**


### The idea

Abstracting your application functionality into small chunks and implementing them as loosely coupled directives. This allows you to completely remove sections of your application by simply toggling a single dom element.


### How it works

The basic premise is you write your feature and wrap it up in a directive, then where you implement that directive in your markup you add the **feature-flag** directive to the same element. You can then pass the **key** of the flag to this directive to resolve whether of not this feature should be enabled.

The module pulls a json file down which defines the feature flags and which ones are active. If enabled angular will process the directive as normal, if disabled angular will remove the element from the dom and not compile or execute any other directives is has.

You can then add the **override** panel to your app and turn individual features on override the server values, saving the override in local storage which is useful in development.


### Flag data

The flag data that drives the feature flag service is a json format. Below is an example:
```json
[
    { "key": "...", "active": "...", "name": "...", "description": "..." },
    ...
]
```
<table>
   <tr>
    <td><b>key</b></td>
    <td>Unique key that is used from the markup to resolve whether a flag is active or not.</td>
   </tr>
   <tr>
    <td><b>active</b></td>
    <td>Boolean value for enabling/disabling the feature</td>
   </tr>
   <tr>
    <td><b>name</b></td>
    <td>A short name of the flag (only visible in the list of flags)</td>
   </tr>
   <tr>
    <td><b>description</b></td>
    <td>A long description of the flag to further explain the feature being toggled (only visible in the list of flags)</td>
   </tr>
</table>


### Setting flag data

Flag data can be set via the `featureFlags` service using the `set` method. This currently accepts either a [HttpPromise](https://docs.angularjs.org/api/ng/service/$http) or a regular [Promise](https://docs.angularjs.org/api/ng/service/$q). The promise must resolve to a valid collection of [flag data](#flag-data).

For example, if you were loading your flag data from a remote JSON file:

```js
myApp.run(function(featureFlags, $http) {
  featureFlags.set($http.get('/data/flags.json'));
});
```

### Setting flag data on config phase (≥ v1.1.0)

From version v1.1.0 you can also initialize the feature flags in the config phase of your application:

```js
myApp.config(function(featureFlagsProvider) {
  featureFlagsProvider.setInitialFlags([
    { "key": "...", "active": "...", "name": "...", "description": "..." },
  ]);
});
```

### Toggling elements

The `feature-flag` directive allows simple toggling of elements based on feature flags, e.g:

```html
<div feature-flag="myFlag">
  I will be visible if 'myFlag' is enabled
</div>
```

If you need to *hide* elements when a flag is enabled, add the `feature-flag-hide` attribute, e.g:

```html
<div feature-flag="myFlag" feature-flag-hide>
  I will *NOT* be visible if 'myFlag' is enabled
</div>
```

### Running the demo

Running the demo is easy assuming you have Gulp installed:

- Checkout the project
- Switch to the directory
- Run 'gulp demo'

Should launch the demo in your default browser


### Running the unit test

This relies on Gulp also obviously, to run the test suite:

- Checkout the project
- Switch to the directory
- Run 'gulp test'


## License

[MIT](http://mjt01.mit-license.org)
