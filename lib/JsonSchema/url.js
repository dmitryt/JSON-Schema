'use strict';
var utils = require('./utils'),
	SCHEMA_SCOPES = {
		'tv_order': ['market'],
		'tv_order_item': ['market'],
		'market_schema': ['agency', 'market'],
		'traffic': ['agency', 'market']
	},
	DEFAULT_SCHEMA_SCOPE = 'agency',
	construct = function(args) {
		var result = [],
			url = [];
		if (args.url) {
			url.push(args.url);
		}
		if (Array.isArray(args.params) && args.params.length) {
			url.push(args.params.join('&'));
		}
		if (url.length) {
			result.push(url.join('?'));
		}
		return result.join('');
	};

exports.prepare = function(params, config) {
	config = config || {};
	var schemaName = params.schemaName,
		url = (config['url'] || ':schemaName').replace(":schemaName", schemaName),
		urlArgs = params.args || {},
		urlFilters = params.filters || {},
		urlParams = [];
	utils.forEach(SCHEMA_SCOPES[schemaName] || [DEFAULT_SCHEMA_SCOPE], function(scope){
		var scopeValue = urlFilters[scope],
			q = {};
		if (scopeValue) {
			q[scope] = scopeValue;
			urlParams.push(utils.objectToQuery(q));
		}
	});
	if (Object.keys(urlArgs).length) {
		urlParams.push(utils.objectToQuery(urlArgs));
	}
	return construct({
		url: url,
		params: urlParams
	});
};