'use strict';
var Q = require('q'),
	sUtils = require('./schemaUtils'),
	utils = require('./utils');

function Processor(params) {
	this.params = params;
	this.store = {};
}

Processor.prototype.processSchema = function(dataEntry) {
	this.sectionName = this.params.sectionName || utils.getObject('_cm.common.mediaType', this.params.item);
	this.schemaName = dataEntry.getSchemaName();
	var data = this.params.item,
		widgetMap = {},
		widgetList = [],
		relativePath = sUtils.relativePath,
		getFieldOrder = function(propSchema){
			var path = 'view.e.order';
			if (this.sectionName) path = [path, this.getSectionName()].join('.');
			return utils.getObject(path, propSchema);
		}.bind(this),
		isComplexPath = function(path) {
			return path.indexOf('[]') !== -1;
		},
		groupComplexFields = function(fields) {
			var result = [],
				complexFields = {};
			utils.forEach(fields, function(path){
				if (!isComplexPath(path)) {
					return result.push(path);
				}
				var pair = relativePath.split(path);
				if (!complexFields[pair[0]]) {
					complexFields[pair[0]] = [];
				}
				complexFields[pair[0]].push(pair[1]);
			});
			utils.forEach(complexFields, function(children, path){
				result.push([path, '[%s]'.replace('%s', children.join(','))].join('[]'));
			});
			return result;
		},
		propSchemaComplex = function(path, dataEntry) {
			var pairs = path.split('[]'),
				parentPath = pairs[0],
				parentPropSchema = parsePropSchema(parentPath, dataEntry),
				children = (pairs[1] || "").replace(/\[(.+)\]/, "$1").split(',');
			parentPropSchema.children = children.map(function(path){
				return parsePropSchema(relativePath.join(parentPath, path), dataEntry);
			});
			return parentPropSchema;
		},
		parsePropSchema = function(path, dataEntry) {
			var propSchema = utils.clone(dataEntry.propSchema(path)),
				o = utils.mergeObjects({
					required: !!(utils.getObject('required', propSchema) || utils.getObject('view.required', propSchema)),
					relativePath: relativePath.get(path),
					path: path,
					order: getFieldOrder(propSchema),
					value: utils.getObject(path, data),
					width: utils.getObject('view.e.width', propSchema) || 1
				}, propSchema);
			if (o.type === 'dictionary') {
				o.hierarchy = dataEntry.getSchemaHierarchy(o.path);
			}
			return o;
		},
		putUngroupedFieldsToDefaultGroup = (this.params.config || {}).putUngroupedFieldsToDefaultGroup;
	this.store = {};
	utils.forEach(groupComplexFields(dataEntry.getFields(data)), function(fieldPath) {
		var method = isComplexPath(fieldPath) ? propSchemaComplex : parsePropSchema,
			propSchema = method(fieldPath, dataEntry);

		var groupName = utils.getObject('view.e.group.' + this.getSectionName(), propSchema);
		if (!groupName && putUngroupedFieldsToDefaultGroup) {
			groupName = sUtils.DEFAULT_GROUP_NAME;
		}

		if (groupName) {
			if (!widgetMap[groupName]) {
				widgetMap[groupName] = utils.mergeObjects(dataEntry.getGroupByName(groupName, this.sectionName) || {}, {
					fields: []
				});
			}
			this.store[fieldPath] = propSchema;
			widgetMap[groupName].fields.push(propSchema);
		}
	}, this);

	utils.forEach(widgetMap, function(item) {
		widgetList.push(item);
	});

	return widgetList;
};

Processor.prototype.parseFieldsByGroup = function(/*String*/group) {
	var result = [],
		sectionName = this.getSectionName();
	utils.forEach(this.store, function(field) {
		var _group = utils.getObject('view.e.group', field) || "",
			flag = typeof _group === 'string' ? _group === group : _group[sectionName] === group;
		if (flag) {
			result.push(field);
		}
	});
	return result;
};

Processor.prototype.getField = function(/*String*/path) {
	return this.store[path];
};

Processor.prototype.getSectionName = function() {
	return [this.schemaName, this.sectionName].join("_");
};

module.exports = Processor;
