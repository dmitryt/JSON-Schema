var schemaUtils = require('../schemaUtils'),
	helpers = require('../../spec/helpers');

describe("schemaUtils module", function(){
	var tvOrderItemSchema;

	beforeEach(function() {
		tvOrderItemSchema = helpers.loadFixture('tv_order_item');
  	});

	describe("schemaUtils#propSchema", function(){
		var existingFieldPath = "_cm.common.duration",
			complexFieldPath = "_cm.destinations.items[].a4Id",
			notExistingFieldPath = "_cm.common.duration2";
		it("should find basic field by name", function(){
			var field = schemaUtils.propSchema(existingFieldPath, tvOrderItemSchema) || {};
			expect(field.description).toBe("Duration");
		});
		it("should find complex field by name", function(){
			var field = schemaUtils.propSchema(complexFieldPath, tvOrderItemSchema);
			expect(field).not.toBeNull();
		});
		it("shouldn't find not existing field", function(){
			var field = schemaUtils.propSchema(notExistingFieldPath, tvOrderItemSchema);
			expect(field).toBeNull();
		});
	});

	describe("schemaUtils#getSchemaRoot", function(){
		it("should return the root node of schema", function(){
			var rootNode = schemaUtils.getSchemaRoot(tvOrderItemSchema) || {};
			expect(rootNode.properties).toBeDefined();
		});
	});

	describe("schemaUtils#getSchemaName", function(){
		it("should return schema name", function(){
			expect(schemaUtils.getSchemaName(tvOrderItemSchema)).toBe("tv_order_item");
		});
	});

	describe("schemaUtils#getSchemaNameFromExtend", function(){
		it("should return schema name from root extends", function(){
			var rootNode = schemaUtils.getSchemaRoot(tvOrderItemSchema) || {},
				_extends = rootNode['extends'] || [],
				schemaName = schemaUtils.getSchemaNameFromExtend(_extends[0]);
			expect(schemaName).toBe("system");
		});

		it("should return schema name from local extends", function(){
			var assetNode = schemaUtils.propSchema('_cm.asset', tvOrderItemSchema) || {},
				_extends = assetNode['extends'] || [],
				schemaName = schemaUtils.getSchemaNameFromExtend(_extends[0]);
			expect(schemaName).toContain("asset_element_common");
		});
	});

	describe("schemaUtils#getShareRootFromExtend", function(){
		it("should return schema target node from local extends", function(){
			var assetNode = schemaUtils.propSchema('_cm.asset', tvOrderItemSchema) || {},
				_extends = assetNode['extends'] || [],
				schemaName = schemaUtils.getShareRootFromExtend(_extends[0]);
			expect(schemaName).toBe("_cm");
		});
	});

	describe("schemaUtils#getMarkerFromExtend", function(){
		it("should return marker from local extends", function(){
			var assetNode = schemaUtils.propSchema('_cm.asset', tvOrderItemSchema) || {},
				_extends = assetNode['extends'] || [],
				marker = schemaUtils.getMarkerFromExtend(_extends[0] || {});
			expect(marker).toBe("ordering");
		});
	});

	describe("schemaUtils#climbPathUp", function(){
		it("should calculate parent path correctly", function(){
			var path = "_cm.common.clockNumber";
			expect(schemaUtils.climbPathUp(path)).toBe("_cm.common");
		});
	});

	describe("schemaUtils#relativePath", function(){
		var rp = schemaUtils.relativePath;
		it("should calculate relative path correctly", function(){
			var path = "_cm.destinations.items[].a.b";
			expect(rp.get(path)).toBe("a.b");
		});
		it("should join complex path correctly", function(){
			var path = "_cm.destinations.items[].a.b";
			expect(rp.join("_cm.destinations.items", "a.b")).toBe(path);
		});
		it("should split complex path correctly", function(){
			var path = "_cm.destinations.items[].a.b";
			expect(rp.split(path)).toEqual(["_cm.destinations.items", "a.b"]);
		});
	});

	describe("schemaUtils#clearSchemaPath", function(){
		it("should clear schema path correctly", function(){
			var paths = ["_cm.properties.common.properties.clockNumber", "properties._cm.properties.common", "_cm.properties.browser_properties.properties.c"],
				expectedPaths = ["_cm.common.clockNumber", "_cm.common", "_cm.browser_properties.c"];
			expect(paths.map(schemaUtils.clearSchemaPath)).toEqual(expectedPaths);
		});
	});
});