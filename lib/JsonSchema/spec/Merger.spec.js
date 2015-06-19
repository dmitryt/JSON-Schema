var Merger = require('../Merger'),
	helpers = require('../../spec/helpers');

describe("Merger class", function(){
	var merger,
		initSchemas = function() {
			var schemas = ['tv_order_item', 'system', 'market_schema', 'asset_element_common', 'asset_element_project_common'],
				r = {};
			schemas.forEach(function(s){
				r[s] = helpers.loadFixture(s);
			});
			return r;
		};
	beforeEach(function(){
		var resolver = {
			getExtends: function(schema) {
				var EXTENDS_MAP = {
					'tv_order_item': {
						'': ['system', 'market_schema'],
						'_cm.asset': [{ ref: 'asset_element_common#properties._cm', filter: 'ordering' }, { ref: 'asset_element_project_common#properties._cm', filter: 'ordering' } ]
					}
				};
				return EXTENDS_MAP[schema._schemaName] || {};
			},
			filterSharedFields: function(extObject, schema) {
				extObject = extObject || {};
				var EXTS_MAP = {
					'asset_element_project_common#properties._cm': [ '_cm.common.Campaign', '_cm.common.advertiser', '_cm.common.brand', '_cm.common.product', '_cm.common.sub_brand' ],
					'asset_element_common#properties._cm': ['_cm.common.isPlayout', '_cm.common.name', '_cm.video.clockNumber']
				};
				return EXTS_MAP[extObject.ref];
			}
		};
		merger = new Merger(resolver);
	});
	afterEach(function(){
		merger = null;
	});
	it("should merge schema with all dependencies correctly", function(){
		var schemas = initSchemas(),
			mergedSchema = merger.mergeSchema('tv_order_item', schemas),
			expectedMergedSchema = helpers.loadFixture('tv_order_item.merged'),
			resultEqualObjects = helpers.equalObjects(mergedSchema, expectedMergedSchema);
		expect(resultEqualObjects.reason).toBe("");
	});
});