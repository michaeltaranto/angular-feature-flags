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
    { "key": "FeatureId", "name": "Short name of my feature", "description": "A long description of the feature" },
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



### Still to come

A demo.