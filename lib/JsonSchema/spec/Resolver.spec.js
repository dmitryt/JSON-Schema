var Resolver = require('../Resolver'),
	helpers = require('../../spec/helpers');

describe("Resolver class", function(){
	var resolver;
	beforeEach(function(){
		resolver = new Resolver();
		resolver.load = function(url) {
			return helpers.loadFixture(url);
		};
		resolver.getExtends = function(schema) {
			var EXTENDS_MAP = {
				'tv_order_item': {
					'': ['system', 'market_schema'],
					'_cm.asset': [{ ref: 'asset_element_common#properties._cm', filter: 'ordering' }, { ref: 'asset_element_project_common#properties._cm', filter: 'ordering' } ]
				}
			};
			return EXTENDS_MAP[schema._schemaName] || {};
		};
	});
	afterEach(function(){
		resolver = null;
	});
	it("should load schema with all dependencies", function(){
		spyOn(resolver, 'load').andCallThrough();
		resolver.loadSchema({schemaName: 'tv_order_item'});
		expect(resolver.load).toHaveBeenCalledWith("tv_order_item");
		expect(resolver.load).toHaveBeenCalledWith("system");
		expect(resolver.load).toHaveBeenCalledWith("market_schema");
		expect(resolver.load).toHaveBeenCalledWith("asset_element_common");
		expect(resolver.load).toHaveBeenCalledWith("asset_element_project_common");
	});
	it("should return basic schema and all dependencies", function(){
		var df = resolver.loadSchema({schemaName: 'tv_order_item'}),
			schemas;
		runs(function() {
			df.then(function(_schemas_){
				schemas = _schemas_;
			});
		});

		waitsFor(function() {
			return !!Object.keys(schemas || {}).length;
		}, "Some schemas weren't loaded", 0);

		runs(function() {
			expect(Object.keys(schemas || {})).toEqual(['tv_order_item', 'system', 'market_schema', 'asset_element_common', 'asset_element_project_common']);
		});
	});
});