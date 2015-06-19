var utils = require('../utils');

describe("utils module", function(){
	describe("utils#getObject", function(){
		var ctx = {
			a: {b: 1},
			b: {c: [1,2,3]},
			c: {d: {e: {f: {a: 1}}}},
			d: null,
			e: undefined
		};
		it("should parse simple path correctly", function(){
			expect(utils.getObject("a.b", ctx)).toBe(1);
		});
		it("should parse arrays", function(){
			expect(JSON.stringify(utils.getObject("b.c", ctx))).toBe("[1,2,3]");
		});
		it("should parse objects", function(){
			expect(JSON.stringify(utils.getObject("c.d.e", ctx))).toBe('{"f":{"a":1}}');
		});
		it("should parse null", function(){
			expect(utils.getObject("d", ctx)).toBeNull();
		});
		it("should parse undefined", function(){
			expect(utils.getObject("e", ctx)).toBeNull();
		});
		it("should parse not existing path", function(){
			expect(utils.getObject("e.f.g.h.j.a", ctx)).toBeNull();
		});
		it("shouldn't parse empty object", function(){
			expect(utils.getObject("a", null)).toBeNull();
		});
	});

	describe("utils#setObject", function(){
		it("should set simple path correctly", function(){
			var o = {c: {d: 1}};
			utils.setObject("a.b", 2, o);
			expect(JSON.stringify(o)).toBe('{"c":{"d":1},"a":{"b":2}}');
		});
		it("should work with undefined context", function(){
			var a;
			utils.setObject("a.b", 2, a);
			expect(a).toBe(a);
		});
	});

	describe("utils#clone", function(){
		it("should clone object correctly and not by reference", function(){
			var o = {c: {d: 1}},
				r = utils.clone(o);
			expect(JSON.stringify(o)).toBe(JSON.stringify(r));
			r.e = 23;
			expect(JSON.stringify(o)).not.toBe(JSON.stringify(r));
		});
	});

	describe("utils#mergeObjects", function(){
		it("should merge objects correctly", function(){
			var a,
				b,
				reset = function() {
					a = {c: {d: 1}};
					b = {d: {e: {f: 'g'}}};
				};
			reset();
			expect(JSON.stringify(utils.mergeObjects(a, b))).toBe(JSON.stringify({d: {e: {f: 'g'}}, c: {d: 1}}));
			reset();
			expect(JSON.stringify(utils.mergeObjects(b, a))).toBe(JSON.stringify({c: {d: 1}, d: {e: {f: 'g'}}}));
		});
	});

	describe("utils#objectToQuery", function(){
		it("should parse queries correctly", function(){
			expect(utils.objectToQuery({a: 1, b: 2, c: "abc"})).toBe('a=1&b=2&c=abc');
		});
	});
});