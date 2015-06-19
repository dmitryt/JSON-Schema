'use strict';
var Q = require('q'),
	extend = require('node.extend'),
	utils = require('./utils'),
	sUtils = require('./schemaUtils'),
	urlHelper = require('./url'),
	Walker = require('./Walker'),
	cache = require('./cache').init(),
	http = require('./http');

function Resolver(config) {
	this.config = config || {};
	this.getWalker = function(schema) {
		return new Walker(this.config).compile(schema);
	};
}

Resolver.prototype.loadExtends = function(params, schemaObject) {
	var df = Q.defer(),
		_this = this,
		dflist = [];
	utils.forEach(this.getExtends(schemaObject), function(extendsPerPath){
		var _extendsLogs = JSON.stringify(extendsPerPath.map(sUtils.getSchemaNameFromExtend));
		utils.log('debug', 'Resolver#loadExtends', schemaObject._schemaName, _extendsLogs);
		utils.forEach(extendsPerPath, function(extObject){
			var _params = utils.clone(params);
			_params.schemaName = sUtils.getSchemaNameFromExtend(extObject);
			dflist.push(_this.loadSchema(_params));
		});
	});
	if (dflist.length === 0) {
		df.resolve([]);
		return df.promise;
	}
	return Q.all(dflist);
};

Resolver.prototype.load = function(url) {
	return http.get(url, this.config);
};

Resolver.prototype.loadSchema = function(params) {
	params = params || {};
	var cacheKey = urlHelper.prepare(params, this.config),
		convertResult = function(cache) {
			var r = {};
			utils.forEach(cache, function(schema){
				if (schema._schemaName) {
					r[schema._schemaName] = schema;
				}
			});
			return r;
		},
		_exec = function(schemaObject){
			var _schemaObject = extend(schemaObject, {_cacheKey: cacheKey, _schemaName: params.schemaName});
			this.loadExtends(params, _schemaObject)
				.then(function(){
					cache.put(cacheKey, _schemaObject);
					df.resolve(convertResult(cache.get(null)));
				})
				.catch(utils.getErrBack(df));
		}.bind(this),
		df = Q.defer();
	if (!cache.get(cacheKey)) {
		cache.put(cacheKey, this.load(cacheKey));
	}
	if (typeof cache.get(cacheKey).then === 'function') {
		cache.get(cacheKey)
			.then(_exec)
			.catch(utils.getErrBack(df));
	} else {
		_exec(cache.get(cacheKey));
	}
	return df.promise;
};

Resolver.prototype.getExtends = function(schema) {
	return this.getWalker(schema).get('extends');
};

Resolver.prototype.filterSharedFields = function(extObject, schema) {
	return this.getWalker(schema).filterSharedFields(extObject);
};

module.exports = Resolver;