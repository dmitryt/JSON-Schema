'use strict';
var utils = require('./utils'),
	sUtils = require('./schemaUtils'),
	cache = require('./cache');

var Walker = function(config) {
	var _cache = {
			single: cache.init("single"),
			merged: cache.init("merged")
		},
		_props = {fields: [], enabled: {}, depends: {}, 'extends': {}, shared: {}},
		stringPath = function(pathArr) {
			return pathArr.join('.');
		},
		isObject = function(level) {
			return ['object', 'dynamic_object'].indexOf(level.type) !== -1;
		},
		isPrimitive = function(level) {
			return sUtils.KNOWN_SCHEMA_PRIMITIVE_TYPES.indexOf(level.type) !== -1;
		},
		isComplex = function(level) {
			return sUtils.KNOWN_SCHEMA_COMPLEX_TYPES.indexOf(level.type) !== -1;
		},
		shouldBeScanned = function(name, isRoot) {
			var isAllowed = function(name) {
					return sUtils.ALLOWED_SCHEMA_ROOTS.indexOf(name) !== -1;
				},
				isPrivate = function(name) {
					return sUtils.PRIVATE_LEVELS.indexOf(name) !== -1;
				};
			if (!isRoot) {
				return true;
			}
			return utils.getObject('parseRoot', config) ? !isPrivate(name) : isAllowed(name);
		},
		_collectProp = function(prop, level, pathArr, objProp) {
			var acc = level[prop];
			if (typeof acc !== 'undefined') {
				_props[objProp || prop][stringPath(pathArr)] = acc;
			}
		},
		collectEnabled = function(level, path) {
			_collectProp('enabled', level, path);
		},
		collectDepends = function(level, path) {
			_collectProp('depends', level, path);
		},
		collectExtends = function(level, path) {
			/**
			 * There are 2 types of extends:
			 * == root: whole schemas should be merged into current schema
			 *   (example: extends: ['asset_element_common', 'system'])
			 * == innerExtends: only marked fields from another schemas should be merged into the current schema level
			 *   (example: extends: [{filter: "ordering", ref: "asset_element_common#properties._cm"}].
			 *   So, fields, which are marked with tags 'ordering', should be merged into the current level.)
			 *   Look at 'collectShared' method for more info.
			 **/
			_collectProp('extends', level, path);
		},
		collectShared = function(level, path) {
			/**
			 * Fields, that are shared for merging to another schemas
			 * There is a marker there, which helps to recognize where to merge
			 * For instance, tags: ['ordering'] - it means, that such fields should be merged
			 * into another schemas, which are extended with such marker.
			 * Look at 'collectExtends' method for more info.
			 **/
			_collectProp('tags', level, path, 'shared');
		},
		collectFields = function(path) {
			_props.fields.push(stringPath(path));
		},
		markSchemaOrigin = function(level) {
			var path = ['view', 'schemaOrigin'].join('.');
			if (schemaOrigin && !utils.getObject(path, level)) {
				utils.setObject(path, schemaOrigin, level);
			}
		},
		walk = function(level, args, isRoot) {
			var getSubLevels = function(level) {
					var sublevelId = {
						'array': 'items.properties'
					}[level.type] || 'properties';
					return utils.getObject(sublevelId, level);
				},
				getSubPath = function(name, level) {
					return isComplex(level) ? name + '[]' : name;
				};
			args = args || { path : [] };
			collectEnabled(level, args.path);
			collectExtends(level, args.path);
			if (isObject(level) || isComplex(level)) {
				utils.forEach(getSubLevels(level) || {}, function(subLevel, name){
					if (shouldBeScanned(name, isRoot)) {
						walk(subLevel, {path: args.path.concat(getSubPath(name, subLevel))});
					}
				});
			} else if (isPrimitive(level)) {
				collectFields(args.path);
				collectDepends(level, args.path);
				collectShared(level, args.path);
				markSchemaOrigin(level);
			}
		},
		compile = function(schema, type) {
			type = type || "single";
			schemaOrigin = type === 'single' ? schema._schemaName : null;
			utils.log('debug', 'Walker#compile', type, schema._cacheKey);
			if (!_cache[type].get(schema._cacheKey)) {
				walk(sUtils.getSchemaRoot(schema), null, true);
				gatherDepends();
				_cache[type].put(schema._cacheKey, _props);
			} else {
				utils.log('debug', 'Walker#compile', 'getting from cache');
			}
			_props = _cache[type].get(schema._cacheKey);
			return this;
		},
		get = function(key) {
			return _props[key];
		},
		set = function(key, value) {
			_props[key] = value;
		},
		gatherDepends = function() {
			if (get('dependsList')) {
				return false;
			}
			var depends = get('depends'),
				children = Object.keys(depends),
				parents = children.map(function(c){
					var key = Object.keys(depends[c])[0];
					return depends[c][key];
				}),
				gatherHierarchy = function(child) {
					var result = [child],
						getParent = function(node){
							var index = children.indexOf(node);
							if (index === -1) {
								return null;
							}
							return parents[index];
						},
						p = child;
					while(p = getParent(p)) {
						result.unshift(p);
					}
					return result;
				},
				lastChildren = children.filter(function(c){
					return parents.indexOf(c) === -1;
				});
			set('dependsList', lastChildren.map(gatherHierarchy));
		},
		getFields = function(data) {
			var notEnabled = [];
			utils.forEach(this.get('enabled'), function(value, key){
				var enableResolved = (Array.isArray(value) ? value : [value]).every(function(o){
					if (typeof o !== 'boolean') {
						return utils.getObject(o.path, data) == o.value;
					}
					return o;
				});
				if (!enableResolved) notEnabled.push(key);
			});
			return this.get('fields').filter(function(f){
				return notEnabled.every(function(ne){
					return f.indexOf(ne) !== 0;
				});
			});
		},
		// Get whole hierarchy by part
		getSchemaHierarchy = function(path) {
			return this.get('dependsList').filter(function(hierarchy){
				return hierarchy.indexOf(path) !== -1;
			})[0] || [];
		},
		filterSharedFields = function(extObject) {
			var marker = sUtils.getMarkerFromExtend(extObject),
				shareRoot = sUtils.getShareRootFromExtend(extObject),
				result = [];
			if (!marker) {
				return [];
			}
			utils.forEach(this.get('shared'), function(_markers, path){
				if (_markers.indexOf(marker) !== -1 && path.indexOf(shareRoot) === 0) {
					result.push(path);
				}
			});
			return result;
		},
		schemaOrigin;
	return {
		compile: compile,
		get: get,
		getSchemaHierarchy: getSchemaHierarchy,
		getFields: getFields,
		filterSharedFields: filterSharedFields
	};
};

module.exports = Walker;