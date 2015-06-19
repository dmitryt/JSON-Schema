var Walker = require('../Walker'),
	helpers = require('../../spec/helpers');

describe("Walker class", function(){
	var getSchema = function(name) {
			return helpers.loadFixture(name);
		},
		expectedHierarchies = {
			'tv_order_item.merged': [["_cm.asset.common.advertiser","_cm.asset.common.brand","_cm.asset.common.sub_brand","_cm.asset.common.product"]],
			'asset_element_common': [["_cm.common.mediaType","_cm.common.mediaSubType"]],
			'asset_element_project_common': [["_cm.common.advertiser","_cm.common.brand","_cm.common.sub_brand","_cm.common.product"]]
		},
		extendsMap = {
			'tv_order_item.merged': {
				'': ['system', 'market_schema'],
				'_cm.asset': [{ ref: 'asset_element_common#properties._cm', filter: 'ordering' }, { ref: 'asset_element_project_common#properties._cm', filter: 'ordering' } ]
			},
			'asset_element_common': {},
			'asset_element_project_common': {},
		},
		sharingMap = {
			system: [],
			market_schema: [],
			asset_element_common: [ '_cm.common.isPlayout', '_cm.common.name', '_cm.video.clockNumber' ],
			asset_element_project_common: [ '_cm.common.Campaign', '_cm.common.advertiser', '_cm.common.brand', '_cm.common.product', '_cm.common.sub_brand' ]
		},
		enabledMap = {
			'tv_order_item.merged': {
				'_cm.asset.common.Campaign': true,
  				'_cm.asset.common.advertiser': true,
  				'_cm.asset.common.brand': true,
				'_cm.asset.common.product': true,
				'_cm.asset.common.sub_brand': true,
				'_cm.asset.video': true,
				'_cm.asset.video.clockNumber': [ { path: '_cm.common.mediaType', value: 'video' } ],
				'_cm.common': true,
				'_cm.common.clockNumber': true,
				'_cm.destinations': [ { path: '_cm.common.item_type', value: 'delivery' } ]
			},
			system: {},
			market_schema: {},
			asset_element_common: {
				'_cm.video': [{ path: '_cm.common.mediaType', value: 'video' }],
  				'_cm.video.clockNumber': [{ path: '_cm.common.mediaType', value: 'video' }]
  			},
			asset_element_project_common: {
				'_cm.common.Campaign': true,
  				'_cm.common.advertiser': true,
  				'_cm.common.brand': true,
  				'_cm.common.product': true,
  				'_cm.common.sub_brand': true
  			}
		},
		expectedFields = {
			'tv_order_item.merged': [
				'_cm.asset.common.isPlayout',
				'_cm.asset.common.name',
				'_cm.asset.common.Campaign',
				'_cm.asset.common.advertiser',
				'_cm.asset.common.brand',
				'_cm.asset.common.product',
				'_cm.asset.common.sub_brand',
				'_cm.common.additionalInformation',
				'_cm.common.clockNumber',
				'_cm.common.duration',
				'_cm.common.firstAirDate',
				'_cm.common.format',
				'_cm.common.item_type',
				'_cm.common.title',
				'_cm.common.mediaAgency',
				'_cm.common.creativeAgency',
				'_cm.tv.market',
				'_cm.tv.marketCountry',
				'_cm.tv.marketId',
				'_cm.tv.orderReference',
				'_cm.metadata.subtitlesRequired'
			],
			'asset_element_common': [
				"_cm.common.isPlayout",
				"_cm.common.mediaSubType",
				"_cm.common.mediaType",
				"_cm.common.name",
				"_cm.common.status"
			],
			'asset_element_project_common': [
				"_cm.common.Campaign",
				"_cm.common.advertiser",
				"_cm.common.brand",
				"_cm.common.product",
				"_cm.common.sub_brand"
			]
		},
		iter = function(obj, cb) {
			for (var i in obj) {
				if (obj.hasOwnProperty(i)) {
					cb(obj[i], i);
				}
			}
		};
	it("should find all hierarchies", function(){
		iter(expectedHierarchies, function(v, k){
			var walker = new Walker().compile(getSchema(k)),
				resultEqualObjects = helpers.equalObjects(walker.get('dependsList'), v);
			expect(resultEqualObjects.reason).toBe("");
		});
	});
	it("should find all available fields", function(){
		iter(expectedFields, function(v, k){
			var walker = new Walker().compile(getSchema(k)),
				resultEqualObjects = helpers.equalObjects(walker.getFields({}), v);
			expect(resultEqualObjects.reason).toBe("");
		});
	});
	it("should find fields, which are satisfied conditions in data", function(){
		var walker = new Walker().compile(getSchema('tv_order_item.merged')),
			item = {_cm: {common: {item_type: 'delivery'}}},
			fields = walker.getFields(item);
		expect(fields).toContain('_cm.destinations.items[].actuallyDelivered');
		expect(fields).toContain('_cm.destinations.items[].a4Id');
	});
	it("should find all shared fields by sharing params", function(){
		iter(extendsMap, function(extendsPerSchema){
			iter(extendsPerSchema, function(extObjects){
				extObjects.forEach(function(extObject){
					var schemaName = (extObject.ref || extObject).split("#")[0],
						walker = new Walker().compile(getSchema(schemaName));
					expect(walker.filterSharedFields(extObject)).toEqual(sharingMap[schemaName]);
				});
			});
		});
	});
	it("should find all enabled dependencies", function(){
		iter(enabledMap, function(v, k){
			var walker = new Walker().compile(getSchema(k)),
				resultEqualObjects = helpers.equalObjects(walker.get('enabled'), v);
			expect(resultEqualObjects.reason).toBe("");
		});
	});
});