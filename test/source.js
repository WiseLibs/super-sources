'use strict';
const { expect } = require('chai');
const { Source, File, ErrorBuilder, SourceError } = require('..');

describe('Source', function () {
	it('throws when "file" is not a File object', function () {
		expect(() => new Source(undefined, 0, 1)).to.throw(TypeError);
		expect(() => new Source(null, 0, 1)).to.throw(TypeError);
		expect(() => new Source(123, 0, 1)).to.throw(TypeError);
		expect(() => new Source('foo', 0, 1)).to.throw(TypeError);
		expect(() => new Source({ filename: '', content: '' }, 0, 1)).to.throw(TypeError);
	});
	it('throws when "start" or "end" is not an integer', function () {
		const file = new File('', 'hello world!\nwelcome!\n');
		expect(() => new Source(file, 0, NaN)).to.throw(TypeError);
		expect(() => new Source(file, 0, Infinity)).to.throw(TypeError);
		expect(() => new Source(file, 0, 2.5)).to.throw(TypeError);
		expect(() => new Source(file, 0, '1')).to.throw(TypeError);
		expect(() => new Source(file, NaN, 5)).to.throw(TypeError);
		expect(() => new Source(file, Infinity, 5)).to.throw(TypeError);
		expect(() => new Source(file, 2.5, 5)).to.throw(TypeError);
		expect(() => new Source(file, '0', 5)).to.throw(TypeError);
	});
	it('throws when "start" is negative', function () {
		const file = new File('', 'hello world!\nwelcome!\n');
		expect(() => new Source(file, -1, 1)).to.throw(RangeError);
		expect(() => new Source(file, -2, -1)).to.throw(RangeError);
		expect(() => new Source(file, -2, -3)).to.throw(RangeError);
	});
	it('throws when "end" is not greater than start', function () {
		const file = new File('', 'hello world!\nwelcome!\n');
		expect(() => new Source(file, 0, -1)).to.throw(RangeError);
		expect(() => new Source(file, 0, 0)).to.throw(RangeError);
		expect(() => new Source(file, 5, 4)).to.throw(RangeError);
		expect(() => new Source(file, 5, 5)).to.throw(RangeError);
		expect(() => new Source(file, 22, 22)).to.throw(RangeError);
		expect(() => new Source(file, 23, 23)).to.throw(RangeError);
	});
	it('throws when "end" is greater than content.length + 1', function () {
		const file = new File('', 'hello world!\nwelcome!\n');
		expect(() => new Source(file, 0, 24)).to.throw(RangeError);
		expect(() => new Source(file, 0, 25)).to.throw(RangeError);
		expect(() => new Source(file, 0, 500)).to.throw(RangeError);
	});
	it('can be combined with another Source to create a range', function () {
		const file = new File('', 'hello world!\nwelcome!\n');
		expect(new Source(file, 0, 3).to(new Source(file, 2, 10)))
			.to.deep.equal(new Source(file, 0, 10))
		expect(() => new Source(file, 2, 3).to(new Source(file, 1, 2)))
			.to.throw(RangeError);
	});
	it('cannot be combined with another Source from a different file', function () {
		const file1 = new File('', 'hello world!\nwelcome!\n');
		const file2 = new File('', 'hello world!\nwelcome!\n');
		expect(() => new Source(file1, 0, 3).to(new Source(file2, 2, 10)))
			.to.throw(TypeError);
	});
	it('can return the referenced source substring', function () {
		const file = new File('', 'hello world!\nwelcome!\n');
		expect(new Source(file, 0, 5).string()).to.equal('hello');
		expect(new Source(file, 6, 15).string()).to.equal('world!\nwe');
		expect(new Source(file, 13, 23).string()).to.equal('welcome!\n');
	});
	it('can create an ErrorBuilder() error from itself', function () {
		const file = new File('', 'hello world!\nwelcome!\n');
		const source = new Source(file, 6, 12);
		const builder = source.error('foo', 'here');
		expect(builder).to.be.an.instanceof(ErrorBuilder);
		const err = builder.done();
		expect(err).to.be.an.instanceof(SourceError);
		expect(err.message).to.equal('foo');
		expect(err.issues).to.deep.equal([
			{
				message: 'foo',
				isWarning: false,
				sources: [
					{
						source,
						helperText: 'here',
						notes: [],
					}
				],
			},
		]);
	});
	it('can create an ErrorBuilder() warning from itself', function () {
		const file = new File('', 'hello world!\nwelcome!\n');
		const source = new Source(file, 6, 12);
		const builder = source.warning('foo', 'here');
		expect(builder).to.be.an.instanceof(ErrorBuilder);
		const err = builder.note('hi').done();
		expect(err).to.be.an.instanceof(SourceError);
		expect(err.message).to.equal('foo');
		expect(err.issues).to.deep.equal([
			{
				message: 'foo',
				isWarning: true,
				sources: [
					{
						source,
						helperText: 'here',
						notes: ['hi'],
					}
				],
			},
		]);
	});
	it('can return the referenced source lines, sanitized for display purposes', function () {
		const file = new File('', 'intro!\nhello\tworld!\r\nwelcome\f!\noutro!\n');
		const source = new Source(file, 13, 23);
		expect(source.lines()).to.deep.equal({
			lines: ['hello    world!', 'welcome !'],
			lineNumber: 2,
			x1: 9,
			x2: 2,
		});
	});
});
