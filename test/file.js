'use strict';
const { expect } = require('chai');
const { File, Source } = require('..');

describe('File', function () {
	it('throws if "filename" is not a string', function () {
		expect(() => new File(undefined, '')).to.throw(TypeError);
		expect(() => new File(null, '')).to.throw(TypeError);
		expect(() => new File(123, '')).to.throw(TypeError);
		expect(() => new File(new String('foo'), '')).to.throw(TypeError);
	});
	it('throws if "content" is not a string', function () {
		expect(() => new File('', undefined)).to.throw(TypeError);
		expect(() => new File('', null)).to.throw(TypeError);
		expect(() => new File('', 123)).to.throw(TypeError);
		expect(() => new File('', new String('foo'))).to.throw(TypeError);
	});
	it('accepts an empty string filename and content', function () {
		const file = new File('', '');
		expect(file.filename).to.equal('');
		expect(file.content).to.equal('');
	});
	it('can create Source objects at various offsets', function () {
		const file = new File('', 'hello world!');
		const source1 = file.at(0);
		expect(source1).to.be.an.instanceof(Source);
		expect(source1.file).to.equal(file);
		expect(source1.start).to.equal(0);
		expect(source1.end).to.equal(1);
		const source2 = file.at(6, 5);
		expect(source2).to.be.an.instanceof(Source);
		expect(source2.file).to.equal(file);
		expect(source2.start).to.equal(6);
		expect(source2.end).to.equal(11);
	});
	it('can look up the line number of various offsets', function () {
		const file = new File('', 'hello world!\r\nwelcome!\n');
		expect(file.lineNumberAt(0)).to.equal(1);
		expect(file.lineNumberAt(12)).to.equal(1);
		expect(file.lineNumberAt(13)).to.equal(1);
		expect(file.lineNumberAt(14)).to.equal(2);
		expect(file.lineNumberAt(22)).to.equal(2);
		expect(file.lineNumberAt(23)).to.equal(3);
	});
});
