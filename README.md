## angular-feature-flags

An AngularJS module that allows you to control the release of new features in your app by putting them behind feature flag driven directives.


### The idea

Abstracting your application functionality into chunks and implementing them as loosely coupled directives. This allows you to completely remove sections of your application by simply toggling a single element.


### How it works

Sets a temporary cookie that allow you to preview the feature for a given time frame (customisable), or manually turn it off when you're done.


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
    <td>Unique key that is used to lookup the cookie. It will be namespaced by the COOKIE_PREFIX constant in the feature flag service</td>
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

In Flag Service there are two customisable constants for the module

<table>
   <tr>
    <td><b>COOKIE_PREFIX</b></td>
    <td>Allows you to namespace your cookies</td>
   </tr>
   <tr>
    <td><b>FLAG_TIMEOUT</b></td>
    <td>Automatically expires the cookie after the given number of seconds. Useful to make sure that the experimental feature isn't left on accidentally.</td>
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