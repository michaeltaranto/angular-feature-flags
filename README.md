[![Build Status](https://travis-ci.org/mjt01/angular-feature-flags.png?branch=master)](https://travis-ci.org/mjt01/angular-feature-flags)
## angular-feature-flags

An AngularJS module that allows you to control when you release new features in your app by putting them behind feature falgs/switches.


### The idea

Abstracting your application functionality into small chunks and implementing them as loosely coupled directives. This allows you to completely remove sections of your application by simply toggling a single dom element.


### How it works

The basic premise is you write your feature and wrap it up in a directive, then where you implement that directive in your markup you add the **feature-flag** directive to the same element. You can then pass the **key** of the flag to this directive to resolve whether of not this feature should be enabled.

If enabled angular will process the directive as normal, if disabled angular will remove the element from the dom.


### Flag data

The flag data that drives the feature flag service is a json format. Below is an example:
```json
[
    { "key": "...", "name": "...", "description": "..." },
    ...
]
```
<table>
   <tr>
    <td><b>key</b></td>
    <td>Unique key that is used from the markup to resolve whether a flag is active or not.</td>
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


### Configuration

There are three customisable module constants:

While the local storage version has only one customisable module constant:

<table>
  <tr>
    <td><b>FLAG_PREFIX</b></td>
    <td>Allows you to namespace your flag (useful for cookie or local storage usage)</td>
  </tr>
  <tr>
    <td><b>FLAG_STORAGE</b></td>
    <td>Allows you to configure the storage location. Currently <b>local storage</b>, <b>cookies</b> are available but nothing stopping you from adding your own.</td>
  </tr>
  <tr>
    <td><b>FLAGS_URL</b></td>
    <td>A url or relative file path to retrieve the json file containing all the available feature flags</td>
  </tr>
</table>


### Running the demo

Running the demo is easy assuming you have Grunt installed:

- Checkout the project
- Switch to the directory
- Run 'grunt server'

Should launch the demo in your default browser


### Running the unit test

This relies on Grunt also obviously, to run the test suite:

- Checkout the project
- Switch to the directory
- Run 'grunt test'
