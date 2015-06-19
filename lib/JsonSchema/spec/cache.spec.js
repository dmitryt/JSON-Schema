var cache = require('../cache');

describe("cache module", function(){
	it("should init cache with custom namespace", function(){
		var _cache = cache.init('my');
		_cache.put('k', 123);
		expect(_cache.get('k')).toBe(123);
		expect(_cache.get('k2')).toBeUndefined();
	});
	it("should clean cache", function(){
		var _cache = cache.init();
		_cache.put('a', 123);
		_cache.put('b', {c: {d: 2}});
		expect(_cache.get('a')).toBeDefined();
		expect(_cache.get('b')).toBeDefined();
		_cache.clean();
		expect(_cache.get('a')).toBeUndefined();
		expect(_cache.get('b')).toBeUndefined();
	});
	it("should clean all created caches", function(){
		var _caches = [],
			tmp,
			results;
		for (var i = 0; i < 10; i++) {
			tmp = cache.init();
			tmp.put("a", 123);
			_caches.push(tmp);
		}
		cache.fullClean();
		results = _caches.map(function(c){
			return c.get("a");
		});
		expect(results).not.toContain(123);
	});
});