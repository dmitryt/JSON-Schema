## JSON Schema Parser
### Description
#### Frontend implementation of [Json Schema](https://github.com/kriszyp/json-schema)

### Installation
```bash
>$ git clone git@git.adstream.com:dmitriy.tselinko/adstream-json-schema.git
```
*or*
```bash
>$ npm install git+https://git@git.adstream.com/dmitriy.tselinko/adstream-json-schema.git --save
```

### Usage with Angular.js
Insert that script into your application
```
<script type="text/javascript" src="<path-to-scripts>/adstream-json-schema/build/adstream-json-schema.angular.js"></script>
```
Inside *your-module.js* add dependency:
```javascript
angular.module('my-module', [
    'adstreamJsonSchema'
]);
```
Into your service:
```javascript
angular.module('my-module')
 .service("my-service",
    [
    'JsonSchema',
    function(JsonSchema){
        var params = {
            schemaName: 'traffic',
            filters: {
              agency: "<agency-id>",
              market: "<market-id>"
            },
            args: {
              uid: "<uid>"
            }
          },
          config = {
            host: "http://10.20.30.40:3000",
            decorate: {
              Path: {
                prefix: "some.prefix",
                fieldsMap: {
                  "_cm.fieldA": "^fieldA.path", // some.prefix.fieldA.path
                  "_cm.fieldB": "fieldB", // fieldB
                  ...
                }
              }
            }
          };
          jsonSchema = new JsonSchema(params, config);
        jsonSchema.ready(function(schema){
          // Here you can work with schema
        });
    }
    ]
);
```
### Usage with Node.js
Test Express.js application.

```javascript
var express = require('express'),
  JsonSchema = require('adstream-json-schema'),
  app = express();

app.get('/test-schema', function (req, res) {
  var params = {
    schemaName: 'traffic',
    filters: {
        agency: "<agency-id>",
        market: "<market-id>"
    },
    args: {
      uid: "<uid>"
    }
  },
  jsonSchema = new JsonSchema(params, {
    parseRoot: true,
    host: "10.0.26.5:8080"
  });
  jsonSchema.ready(function(schema){
    res.send(schema);
  });
});

var server = app.listen(3000, function () {
  console.log('Example app listening at http://%s:%s', server.address().address, server.address().port);
});
```
### Changelog
#### 0.0.2
 - improved error handling(it's critical for Node.js version, because it was difficult to debug errors earlier);
 - implemented [logger](https://github.com/pimterry/loglevel);
 - implemented tests (used [jasmine-node](https://github.com/mhevery/jasmine-node) for it);
 - supported parsing of fields with type 'array';
 - implemented caching (and it's possible to clean it, if it's needed);

#### 0.0.1
Basic implementation of schema parser .