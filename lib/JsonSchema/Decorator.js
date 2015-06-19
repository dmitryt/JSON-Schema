'use strict';
var Q = require('q'),
	utils = require('./utils');

var Decorator = function(config) {
	var decorators = [],
		_iter = function(dataEntry, cb){
			utils.forEach(dataEntry.getFields(), function(path){
				(cb || function(){})(dataEntry.propSchema(path), path);
			});
		},
		_findDecorator = function(key, value) {
			var fName = ['decorate', key[0].toUpperCase() + key.slice(1)].join('');
			return handlers[fName];
		},
		handlers = {
			decoratePath: function(node, path){
				var key = 'Path',
					cfgPath = config[key],
					schemaOrigin = utils.getObject('view.schemaOrigin', node),
					getPrefixPath = function() {
						var args = [].slice.call(arguments),
							path = ['prefix'].concat(args).join('.');
						return utils.getObject(path, cfgPath);
					},
					schemaPrefixPath = getPrefixPath('schemas', schemaOrigin),
					prefix = schemaPrefixPath || getPrefixPath('map') || "",
					fieldsMap = cfgPath.fieldsMap || {},
					pattern = fieldsMap[path] || (schemaPrefixPath ? '^' + path : path);
				node[key] = pattern.replace('^', prefix ? prefix + '.' : '');
			}
		},
		decorate = function(dataEntry) {
			if (!decorators.length) {
				return false;
			}
			_iter(dataEntry, function(node, path) {
				var args = arguments;
				utils.forEach(decorators, function(d){
					d.apply(d, args);
				});
			});
			return true;
		};
	utils.forEach(config || {}, function(value, key){
		var d = _findDecorator(key, value);
		if (d) {
			decorators.push(d);
		}
	});
	return {
		decorate: decorate
	};
};

module.exports = Decorator;