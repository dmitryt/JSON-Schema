var Processor = require('../Processor'),
	sUtils = require('../schemaUtils'),
	helpers = require('../../spec/helpers');

describe("Processor class", function(){
	var processor,
		dataEntry;
	beforeEach(function(){
		dataEntry = {
			schema: helpers.loadFixture('tv_order_item.merged'),
			propSchema: function(path) {
				return sUtils.propSchema(path, this.schema);
			},
			getSchemaName: function() {
				return "tv_order_item";
			},
			getGroupByName: function() {
				return {
					group : '_default',
					description: '',
					order : 0,
					fields: []
				};
			},
			getSchemaHierarchy: function(path) {
				var hierarchies = [
					['_cm.asset.common.advertiser', '_cm.asset.common.brand', '_cm.asset.common.sub_brand', '_cm.asset.common.product']
				];
				for (var i = 0; i < hierarchies.length; i++) {
					if (hierarchies[i].indexOf(path) !== -1) {
						return hierarchies[i];
					}
				}
				return null;
			},
			getFields: function() {
				return [
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
					'_cm.destinations.items[].a4Id',
					'_cm.destinations.items[].actuallyDelivered',
					'_cm.tv.market',
					'_cm.tv.marketCountry',
					'_cm.tv.marketId',
					'_cm.metadata.subtitlesRequired'
				];
			}
		};
		processor = new Processor({
			item: helpers.loadFixture('item'),
			config: {}
		});
	});
	afterEach(function(){
		processor = null;
	});
	it("should process schema correctly", function(){
		processor.params.config.putUngroupedFieldsToDefaultGroup = true;

		var processedSchema = processor.processSchema(dataEntry),
			expectedProcessedSchema = helpers.loadFixture('tv_order_item.processed'),
			resultEqualObjects = helpers.equalObjects(processedSchema, expectedProcessedSchema);
		expect(resultEqualObjects.reason).toBe("");
	});
});