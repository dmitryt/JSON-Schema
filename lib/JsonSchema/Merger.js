'use strict';
var utils = require('./utils'),
	sUtils = require('./schemaUtils'),
	cache = require('./cache').init();

function Merger(resolver, config) {
	var getLevel = function(levelName, schema) {
			return sUtils.propSchema(levelName, schema) || {};
		},
		visitLevels = (function(){
			var map = {};
			return function(path, source) {
				if (!path) {
					return false;
				}
				var visit = function(path, source) {
					var propSchema = sUtils.propSchema(path, source);
					propSchema.type = propSchema.type || "object";
					map[path] = true;
				};
				if (!map[path]) {
					visit(path, source);
					visitLevels(sUtils.climbPathUp(path), source);
				}
			}
		})(),
		setSchemaField = function(path, level, to) {
			sUtils.setSchemaField(path, level, to);
			visitLevels(path, to);
		};

	this.mergeWithExtends = function(schema, schemas, acc) {
		var _this = this,
			_mergeRoot = function(from, to) {
				utils.forEach(sUtils.ALLOWED_SCHEMA_ROOTS, function(path) {
					utils.mergeObjects(getLevel(path, from), getLevel(path, to));
				});
			},
			_mergeFields = function(extObject, from, to) {
				var sourceRoot = extObject.sourceRoot,
					sharedRoot = sUtils.getShareRootFromExtend(extObject),
					r = resolver.filterSharedFields(extObject, from);
				utils.forEach(r, function(path){
					var correctPath = function(path){
						return path.replace(sharedRoot, sourceRoot);
					};
					var node = utils.clone(sUtils.propSchema(path, from));
					if (node.depends) {
						var key = Object.keys(node.depends)[0];
						node.depends[key] = correctPath(node.depends[key]);
					}
					setSchemaField(correctPath(path), node, to);
				});
			};

		utils.forEach(resolver.getExtends(schema), function(extObjects, sourceRoot){
			utils.forEach(extObjects, function(extObject){
				var schemaName = sUtils.getSchemaNameFromExtend(extObject);
				var marker = sUtils.getMarkerFromExtend(extObject);
				if (marker) {
					extObject.sourceRoot = sourceRoot;
					_mergeFields(extObject, schemas[schemaName], acc);
				} else {
					_mergeRoot(schemas[schemaName], acc);
				}
				_this.mergeWithExtends(schemas[schemaName], schemas, acc);
			})
		});
		return acc;
	};
}

Merger.prototype.mergeSchema = function(schemaName, schemas) {
	var schema = schemas[schemaName] || {},
		cached = cache.get(schema._cacheKey);
	utils.log('debug', 'Merger#mergeSchema', schema._cacheKey || schemaName);
	if (!cached) {
		cached = this.mergeWithExtends(schema, schemas, utils.clone(schema));
		cache.put(schema._cacheKey || schemaName, cached);
	}
	return cached;
};

module.exports = Merger;