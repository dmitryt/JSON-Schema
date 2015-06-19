'use strict';
var Q = require('q'),
	extend = require('node.extend'),
	http = require('http'),
	querystring= require('querystring'),
	urlParser = require('url'),
	utils = require('../utils');

function _getArray(obj, key) {
	var v = obj[key];
	return Array.isArray(v) ? v : [v];
}

function _prepareParamsForOrderingOrTraffic(schemaName, args) {
	//Best wishes to guys from backend
	var params = {},
		ids = _getArray(args, 'id');
	_getArray(args, 'type').forEach(function(type, i){
		if (type === 'agency') {
			params[type] = ids[i];
		} else {
			params = extend(params, {type: type, value: ids[i]});
		}
	});
	return params;
}

function __prepareParams(schemaName, args) {
	var params = {},
		ids = _getArray(args, 'id');
	if (schemaName === 'market_schema' || schemaName === 'traffic') {
		return _prepareParamsForOrderingOrTraffic(schemaName, args);
	}
	_getArray(args, 'type').forEach(function(type, i){
		if (schemaName === 'traffic' && type === 'market') {
			return;
		}
		params = extend(params, {type: type, value: ids[i]});
	});
	if (!Object.keys(params)) {
		params = defaultValue || {};
	}
	return params;
}

function _prepareParams(url) {
	var supportedTypes = ['agency', 'market'],
		parsedUrl = urlParser.parse(url, true),
		schemaName = parsedUrl.pathname.split('/').reverse()[0],
		params = parsedUrl.query,
		types = supportedTypes.filter(function(t){
			return !!params[t];
		}),
		ids = types.map(function(t){
			return params[t];
		}),
		query = __prepareParams(schemaName, {type: types, id: ids});
	if (params.uid) {
		query["$id$"] = ['id', params.uid].join('-');
	}
	return {
		pathname: parsedUrl.pathname,
		query: query
	};
}

function transport(method, url, config) {
	var df = Q.defer(),
		options = (function(){
			var options = {
					method: method,
					path: url,
					headers: {
						'Content-Type': 'application/json'
					}
				},
				host = (config.host || "").split(':');
			if (host[0]) {
				options.host = host[0];
			}
			if (host[1]) {
				options.port = host[1];
			}
			return options;
		})(),
		req = http.request(options, function(res) {
			var data = "";
			res.on('data', function (chunk) {
				data += chunk;
			});
			res.on('end', function() {
				var isError = res.statusCode < 200 || res.statusCode > 300;
				if (isError) {
					utils.getErrBack(df)(data);
				} else {
					df.resolve(utils.toJSON(data));
				}
			});
		});
	utils.log('info', 'GET SCHEMA', options.path);
	req.on('error', utils.getErrBack(df));
	req.end();
	return df.promise;
}

module.exports = transport;