'use strict';
var fs = require('fs'),
	path =  require('path'),
	utils = require('../JsonSchema/utils');

function loadFixture(name) {
	var fname = [name, "json"].join("."),
		FIXTURE_PATH = path.join(__dirname, 'fixtures', fname);
	return utils.toJSON(fs.readFileSync(FIXTURE_PATH, "utf8"));
}

function equalObjects(o1, o2) {
	var getEmptyResult = function (msg, o1, o2) {
			return {
				value: true,
				reason: ""
			};
		},
		updateFailedResult = function(result, msg, o1, o2) {
			result.value = false;
			result.reason = [msg, JSON.stringify(o1), '<=>', JSON.stringify(o2)].join(" ");
			return result;
		},
		isObject = function(o) {
			return typeof o === 'object' && o !== null;
		},
		_equal = function(o1, o2, path) {
			if (Array.isArray(o1) && Array.isArray(o2)) {
				return _equalArrays(o1, o2, path);
			} else if (isObject(o1) && isObject(o2)) {
				return _equalObjects(o1, o2, path);
			}
			return _equalDefaults(o1, o2, path);
		},
		_equalArrays = function(arr1, arr2, path) {
			var r = getEmptyResult(),
				tmp;
			if (arr1.length !== arr2.length) {
				return updateFailedResult(r, "Arrays have different length under %s:".replace('%s', path), arr1, arr2);
			}
			for (var i = 0; i < arr1.length; i++) {
				tmp = _equal(arr1[i], arr2[i], [path, i].join('.'));
				if (!tmp.value) {
					return tmp;
				}
			}
			return r;
		},
		_equalObjects = function(levelO1, levelO2, path) {
			var r = getEmptyResult(),
				keysO1 = Object.keys(levelO1),
				keysO2 = Object.keys(levelO2),
				equalArraysResult = _equalArrays(keysO1, keysO2, path),
				tmp;
			if (!equalArraysResult.value) {
				return equalArraysResult;
			}
			for (var i = 0; i < keysO1.length; i++) {
				tmp = _equal(levelO1[keysO1[i]], levelO2[keysO1[i]], [path, keysO1[i]].join('.'));
				if (!tmp.value) {
					return tmp;
				}
			}
			return r;
		},
		_equalDefaults = function(a1, a2, path) {
			var r = getEmptyResult();
			if (a1 !== a2) {
				return updateFailedResult(r, "Items are not equal under %s:".replace('%s', path), a1, a2);
			}
			return r;
		};
	return _equal(o1, o2, '<root>');
}

module.exports = {
	loadFixture: loadFixture,
	equalObjects: equalObjects
};