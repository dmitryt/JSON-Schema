'use strict';
var Q = require('q'),
	utils = require('../utils');

function _xhr(type, url, config, data) {
	/* global ActiveXObject */
	var XHR = window.XMLHttpRequest || ActiveXObject,
		request = new XHR('MSXML2.XMLHTTP.3.0'),
		df = Q.defer(),
		_url = [config.host || '', url].join('');
	request.open(type, _url, true);
	utils.forEach(utils.getObject('cors.headers', config) || {}, function(value, key){
		request.setRequestHeader(key, value);
	});
	request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
	request.onreadystatechange = function () {
		var method = request.status >= 200 && request.status < 300 ? 'resolve' : 'reject';
		if (request.readyState === 4) {
			df[method].apply(df, [utils.toJSON(request.responseText), request]);
		}
	};
	request.send(data);
	return df.promise;
};

module.exports = _xhr;