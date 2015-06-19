'use strict';
/**
 * Returns an internal data available by path
 * or null if path does not exist in the context object
 *
 * @TODO: move this method to a separate script and sync it with the
 * one used in angular GetObject service. This method is copypasted
 * from the for speed.
 *
 * @param path {String}
 * @param context {Object}
 * @returns {Object|null}
 */

var logger = require('loglevel'),
	config = require('../config.json');

if (config.LOG_LEVEL) {
	logger.setLevel(config.LOG_LEVEL)
}

function getObject(path, context) {
	var pts = path && path.split('.') || null, splcontainer, symb;
	if (!pts) {
		return false;
	}

	pts = pts.map(function (item) {
		if (!splcontainer && item.match(/^['"]/)) {
			splcontainer = item.substring(1);
			symb = item[0];
			if (item[ item.length - 1 ] === symb) {
				item = splcontainer.substring(0, splcontainer.length - 1);
				splcontainer = null;
				return item;
			}
			return null;
		} else if (splcontainer) {
			if (item[ item.length - 1 ] === symb) {
				item = splcontainer + '.' + item.substring(0, item.length - 1);
				splcontainer = null;
				return item;
			} else {
				splcontainer += '.' + item;
			}
			return null;
		} else {
			return item;
		}
	})
	.filter(function (item) {
		return Boolean(item);
	});

	while (pts.length && context) {
		context = context[pts.shift()];
		if (context === null || context === undefined) {
			return null;
		}
	}

	return context;
}

function setObject(path, value, ctx){
	var pList = path.split('.'),
		len = pList.length;
	if (!ctx) {
		return;
	}
	for(var i = 0; i < len-1; i++) {
			var elem = pList[i];
			if( !ctx[elem] ) ctx[elem] = {}
			ctx = ctx[elem];
	}
	ctx[pList[len-1]] = value;
}

function clone(o, filter) {
	if (!o || 'object' !== typeof o || filter && !filter.call) {
		return o;
	}
	var p, v, c = 'function' === typeof o.pop ? [] : {};
	for (p in o) {
		if (o.hasOwnProperty(p)) {
			v = o[p];
			if (filter && !filter.call(o, v, p)) {
				continue;
			}
			if (v && 'object' === typeof v) {
				c[p] = this.clone(v);
			} else {
				c[p] = v;
			}
		}
	}
	return c;
}

function mergeObjects(from, to) {
	for (var p in from) {
		try {
			if ( from[p].constructor==Object ) {
			to[p] = this.mergeObjects(from[p], to[p]);
			} else {
			to[p] = from[p];
			}
		} catch(e) {
			// property not set, create it and set its value.
			to[p] = this.clone(from[p]);
		}
	}
	return to;
}

/**
 *
 * @param collection {Array|Object}
 * @param cb {Function}
 * @param ctx {Object}
 */
function forEach(collection, cb, ctx) {
	if (Array.isArray(collection)) {
		for (var i = 0; i < collection.length; i++) {
			cb.call(ctx, collection[i], i);
		}
	} else {
		for (var property in collection) {
			if (collection.hasOwnProperty(property)) {
				cb.call(ctx, collection[property], property);
			}
		}
	}
}

function objectToQuery(args) {
	var result = [];
		forEach(args || {}, function(value, key){
			result.push([key, value || ''].join('='));
		});
		return result.join('&');
}

function isBrowser() {
	return typeof window !== 'undefined';
}

function toJSON(str) {
	var result;
	try {
		result = JSON.parse(str);
	} catch (e) {
		result = str;
	}
	return result;
}

function getErrBack(df) {
	return function(err) {
		var _err = typeof err === 'string' ? new Error(err): err;
		df.reject(_err);
	};
}

function log(type) {
	var fn = logger[type],
		args = [].slice.call(arguments);
	if (typeof fn === 'function') {
		args[0] = "[%s]".replace("%s", type);
		fn.apply(logger, args);
	}
}

var utilsAPI = {
	getObject : getObject,
	clone: clone,
	forEach: forEach,
	mergeObjects: mergeObjects,
	setObject: setObject,
	objectToQuery: objectToQuery,
	isBrowser: isBrowser,
	toJSON: toJSON,
	getErrBack: getErrBack,
	log: log
};

module.exports = utilsAPI;
