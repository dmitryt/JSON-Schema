'use strict';
var xhr = require('./http/xhr'),
	request = require('./http/request'),
	utils = require('./utils');

function transport(method, args) {
	var _transport = utils.isBrowser() ? xhr : request,
		_args = [method].concat([].slice.call(args));
	return _transport.apply(null, _args);
}

function get(src, config) {
	return transport('GET', arguments);
};

function post(src, config, data) {
	return transport('POST', arguments);
};

module.exports = {
	get: get,
	post: post
};