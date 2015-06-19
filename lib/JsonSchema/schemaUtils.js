'use strict';

var utils = require('./utils'),
	extend = require('node.extend'),
	constants = {
		ROOT_SCHEMA_PATH: 'schema',
		ALLOWED_SCHEMA_ROOTS: ['_cm', 'metadata', 'deliverables'],
		KNOWN_SCHEMA_PRIMITIVE_TYPES: ['string', 'text', 'custom_code', 'dictionary', 'date', 'email', 'boolean', 'image', 'integer'],
		KNOWN_SCHEMA_COMPLEX_TYPES: ['array'],
		PRIVATE_LEVELS: ['_private'],
		DEFAULT_GROUP_NAME: '_default'
	};

function propSchema(path, schema) {
	var propSchemaPath = clearSchemaPath(path).split('.').map(function(p){
			return ['properties', p.replace('[]', '.items')].join('.');
		});
	return _getSchemaPath(propSchemaPath, schema);
};

function _getSchemaPath(/*Array*/path, schema) {
	var _path = [constants.ROOT_SCHEMA_PATH];
	if (Array.isArray(path)) _path = _path.concat(path);
	return utils.getObject(_path.join('.'), schema);
}

function getSchemaRoot(schema) {
	return utils.getObject(constants.ROOT_SCHEMA_PATH, schema);
}

function getSchemaName(schema) {
	return String(schema.group);
}

function setSchemaField(path, field, schema) {
	var propSchemaPath = clearSchemaPath(path).split('.').map(function(p){
			return ['properties', p].join('.');
		});
	propSchemaPath = [constants.ROOT_SCHEMA_PATH].concat(propSchemaPath).join('.');
	utils.setObject(propSchemaPath, field, schema);
}

function clearSchemaPath(path) {
	return (path || "").replace(/(^|(\.))properties\./g, '$2');
}

function getSchemaNameFromExtend(extObject) {
	return (extObject.ref || extObject).split('#')[0];
}

function getShareRootFromExtend(extObject) {
	return clearSchemaPath((extObject.ref || "").split('#')[1]);
}

function getMarkerFromExtend(extObject) {
	return extObject.filter;
}

function climbPathUp(path) {
	if (typeof path !== 'string') {
		return path;
	}
	return path.split('.').slice(0, -1).join('.');
}

var relativePath = (function(){
	var dm = '[].',
		isString = function(path) {
			return typeof path === 'string';
		};
	return {
		get: function(path) {
			return isString(path) ? path.split(dm).slice(-1)[0] : path;
		},
		join: function() {
			return [].slice.call(arguments).join(dm);
		},
		split: function(path) {
			return isString(path) ? path.split(dm): path;
		}
	};
})()

module.exports = extend({
	propSchema: propSchema,
	getSchemaRoot: getSchemaRoot,
	getSchemaName: getSchemaName,
	clearSchemaPath: clearSchemaPath,
	setSchemaField: setSchemaField,
	getMarkerFromExtend: getMarkerFromExtend,
	getShareRootFromExtend: getShareRootFromExtend,
	getSchemaNameFromExtend: getSchemaNameFromExtend,
	climbPathUp: climbPathUp,
	relativePath: relativePath
}, constants);