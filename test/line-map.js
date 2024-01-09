'use strict';
const { expect } = require('chai');
const LineMap = require('../src/line-map');

describe('LineMap', function () {
	it('throws if "content" is not a string', function () {
		expect(() => new LineMap(undefined)).to.throw(TypeError);
		expect(() => new LineMap(null)).to.throw(TypeError);
		expect(() => new LineMap(123)).to.throw(TypeError);
		expect(() => new LineMap(new String('foo'))).to.throw(TypeError);
	});
	it('throws if "offset" is not an integer', function () {
		const lineMap = new LineMap('hello world!\r\nwelcome!\n');
		expect(() => lineMap.find(undefined)).to.throw(TypeError);
		expect(() => lineMap.find(null)).to.throw(TypeError);
		expect(() => lineMap.find(NaN)).to.throw(TypeError);
		expect(() => lineMap.find(Infinity)).to.throw(TypeError);
		expect(() => lineMap.find(123.5)).to.throw(TypeError);
		expect(() => lineMap.find('123')).to.throw(TypeError);
	});
	it('provides the correct line number for negative offsets', function () {
		const lineMap = new LineMap('hello world!\r\nwelcome!\n');
		expect(lineMap.find(-1)).to.equal(1);
		expect(lineMap.find(-2)).to.equal(1);
		expect(lineMap.find(-30)).to.equal(1);
	});
	it('provides the correct line number for an offset of zero', function () {
		let lineMap = new LineMap('hello world!\r\nwelcome!\n');
		expect(lineMap.find(0)).to.equal(1);
		lineMap = new LineMap('\nhello world!\r\nwelcome!\n');
		expect(lineMap.find(0)).to.equal(1);
	});
	it('provides the correct line number for offsets within bounds', function () {
		let lineMap = new LineMap('hello world!\r\nwelcome!\n');
		expect(lineMap.find(5)).to.equal(1);
		expect(lineMap.find(12)).to.equal(1);
		expect(lineMap.find(13)).to.equal(1);
		expect(lineMap.find(14)).to.equal(2);
		expect(lineMap.find(22)).to.equal(2);
		lineMap = new LineMap('\nhello world!\r\nwelcome!');
		expect(lineMap.find(1)).to.equal(2);
		expect(lineMap.find(6)).to.equal(2);
		expect(lineMap.find(13)).to.equal(2);
		expect(lineMap.find(14)).to.equal(2);
		expect(lineMap.find(15)).to.equal(3);
		expect(lineMap.find(22)).to.equal(3);
	});
	it('provides the correct line number for an offset equal to the length', function () {
		let lineMap = new LineMap('hello world!\r\nwelcome!');
		expect(lineMap.find(22)).to.equal(2);
		lineMap = new LineMap('hello world!\r\nwelcome!\n');
		expect(lineMap.find(23)).to.equal(3);
	});
	it('provides the correct line number for offsets greater than the length', function () {
		const lineMap = new LineMap('hello world!\r\nwelcome!\n');
		expect(lineMap.find(24)).to.equal(3);
		expect(lineMap.find(25)).to.equal(3);
		expect(lineMap.find(500)).to.equal(3);
	});
	it('provides the correct line number when the content is one line', function () {
		const lineMap = new LineMap('hello world!');
		expect(lineMap.find(-1)).to.equal(1);
		expect(lineMap.find(0)).to.equal(1);
		expect(lineMap.find(5)).to.equal(1);
		expect(lineMap.find(11)).to.equal(1);
		expect(lineMap.find(12)).to.equal(1);
		expect(lineMap.find(500)).to.equal(1);
	});
	it('provides the correct line number when the content is empty', function () {
		const lineMap = new LineMap('');
		expect(lineMap.find(-1)).to.equal(1);
		expect(lineMap.find(0)).to.equal(1);
		expect(lineMap.find(5)).to.equal(1);
		expect(lineMap.find(11)).to.equal(1);
		expect(lineMap.find(12)).to.equal(1);
		expect(lineMap.find(500)).to.equal(1);
	});
	it('provides the correct line number when querying between adjacent newlines', function () {
		const lineMap = new LineMap('\n\r\n\n\n\r\n\r\n');
		expect(lineMap.find(0)).to.equal(1);
		expect(lineMap.find(1)).to.equal(2);
		expect(lineMap.find(3)).to.equal(3);
		expect(lineMap.find(4)).to.equal(4);
		expect(lineMap.find(5)).to.equal(5);
		expect(lineMap.find(7)).to.equal(6);
		expect(lineMap.find(9)).to.equal(7);
	});
});
