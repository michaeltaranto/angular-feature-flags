## angular-feature-flags

An AngularJS module that allows you to control the release of new features in your app by putting them behind feature flag driven directives.


### The idea

Abstracting your application functionality into chunks and implementing them as loosely coupled directives. This allows you to completely remove sections of your application by simply toggling a single element.


### How it works

The module deals with toggling flags letting you to try out the new feature, but then you turn it off when you're done. There are two versions under the src folder, one that uses cookies and another that uses local storage. So depending on what browsers you support you can choose.


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
    <td>Unique key that is used to name the item in local storage. It will be namespaced by the FLAG_PREFIX constant in the feature flag service</td>
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

In the cookie version there are two customisable module constants:

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

While the local storage version has only one customisable module constant:

<table>
  <tr>
    <td><b>FLAG_PREFIX</b></td>
    <td>Allows you to namespace your flag</td>
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