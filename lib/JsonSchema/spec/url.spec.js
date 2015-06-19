var urlHelper = require('../url');

describe("url module", function(){
	var parse = function(params) {
		return urlHelper.prepare(params, {url: ":schemaName"});
	};
	it("should parse url correctly", function(){
		var params = {
			schemaName: 'market_schema',
			filters: {
				agency: 1,
				market: 2
			}
		};
		expect(parse(params)).toBe('market_schema?agency=1&market=2');
	});
	it("should parse url correctly for schema with only one scope", function(){
		var params = {
			schemaName: 'tv_order',
			filters: {
				agency: 1,
				market: 2
			}
		};
		expect(parse(params)).toBe('tv_order?market=2');
	});
	it("should provide additional GET parameters if it\'s needed", function(){
		var params = {
			schemaName: 'asset',
			filters: {
				agency: 1,
				market: 2
			},
			args: {
				c: 'd',
				e: 123
			}
		};
		expect(parse(params)).toBe('asset?agency=1&c=d&e=123');
	});
});