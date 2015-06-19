'use strict';
var Q = require('q'),
	extend = require('node.extend'),
	utils = require('./JsonSchema/utils'),
	sUtils = require('./JsonSchema/schemaUtils'),
	Resolver = require('./JsonSchema/Resolver'),
	Walker = require('./JsonSchema/Walker'),
	Processor = require('./JsonSchema/Processor'),
	Decorator = require('./JsonSchema/Decorator'),
	Merger = require('./JsonSchema/Merger'),
	cache = require('./JsonSchema/cache'),
	defaultConfig = require('./config.json');

var JsonSchema = function (params, config) {
	var _schema = null,
		df = Q.defer(),
		checkProcessor = function() {
			if (!processor) {
				utils.log('warn', 'JsonSchema#parseFields', "Processor is not defined, please process schema at first");
			}
			return !!processor;
		},
		ctx = {
			ready: function(cb, errback) {
				return df.promise
					.then(cb || function(){}, errback || function(){})
			},
			getGroupByName: function(name, mediaType) {
				var groups;

				if (mediaType && mediaType !== 'other') {
				var path = ['view', 'groups', mediaType].join('.');
					groups = utils.getObject(path, sUtils.getSchemaRoot(this.getSchema()));
				} else {
					groups = {
						_default : {
							group : sUtils.DEFAULT_GROUP_NAME,
							description: '',
							order : 0,
							fields: []
						}
					};
				}

				return (groups || {})[name || sUtils.DEFAULT_GROUP_NAME] || null;
			},
			propSchema: function(path) {
				return sUtils.propSchema(path, this.getSchema());
			},
			getSchema: function() {
				return _schema;
			},
			getSchemaName: function() {
				return sUtils.getSchemaName(this.getSchema());
			},
			getFields: function(data) {
				return walker.getFields(data);
			},
			// Get whole hierarchy by part
			getSchemaHierarchy: function(path) {
				return walker.getSchemaHierarchy(path);
			},
			processSchema: function(params) {
				processor = new Processor(params);
				return processor.processSchema(this);
			},
			parseFieldsByGroup: function(group) {
				return checkProcessor() ? processor.parseFieldsByGroup(group) : null;
			},
			getField: function(path) {
				return checkProcessor() ? processor.getField(path) : null;
			}
		},
		_config = extend(defaultConfig, config || {}),
		walker = new Walker(_config),
		resolver = new Resolver(_config),
		merger = new Merger(resolver, _config),
		processor;

	resolver.loadSchema(params)
		.then(function(schemas){
			utils.log('debug', 'JsonSchema#onLoadSchema', params.schemaName, Object.keys(schemas || {}));
			var mergedSchema = merger.mergeSchema(params.schemaName, schemas);
			walker.compile((_schema = mergedSchema), "merged");
			if (_config.decorate) {
				new Decorator(_config.decorate).decorate(ctx);
			}
			if (_config.cache === false) {
				cache.fullClean();
			}
			utils.log('debug', 'JsonSchema#getFields', JSON.stringify(ctx.getFields(params.data)));
			df.resolve(ctx.getSchema());
		})
		.catch(function(err) {
			utils.log('error', err);
			utils.getErrBack(df)(err);
		})
		.done();

	return ctx;
};

module.exports = JsonSchema;