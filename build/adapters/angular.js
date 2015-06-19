var JsonSchema = require('../../lib/index');

var app = angular.module("adstreamJsonSchema", []);

app.factory("JsonSchema", [
  function () {
    return JsonSchema;
  }
]);