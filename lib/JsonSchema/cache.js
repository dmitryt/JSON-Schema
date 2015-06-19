'use strict';

var store = [];

function Cache(namespace) {
	var _cache = {},
		_namespace = namespace || 'default';
	_cache[_namespace] = {};
	return {
		get: function(key) {
			var ns = _cache[_namespace];
			return key !== null ? ns[key] : ns;
		},
		put: function(key, value) {
			_cache[_namespace][key] = value;
		},
		clean: function() {
			_cache[_namespace] = {};
		}
	};
}

function init(namespace) {
	var c = new Cache(namespace);
	store.push(c);
	return c;
}

function fullClean() {
	store.forEach(function(c){
		c.clean();
	});
}

exports.init = init;
exports.fullClean = fullClean;