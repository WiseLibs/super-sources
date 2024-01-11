'use strict';
const { expect } = require('chai');
const { ErrorBuilder, SourceError, File } = require('..');

describe('ErrorBuilder', function () {
	it('can build complex SourceErrors', function () {
		const file = new File('', 'hello world!\nwelcome!\n');
		const source1 = file.at(0, 5);
		const source2 = file.at(13, 8);
		const result = new ErrorBuilder()
			.warning('foo')
			.error('bar')
			.source(source1)
			.source(source2, 'here')
			.note('cool thing')
			.note('other cool thing')
			.done();

		expect(result).to.be.an.instanceof(SourceError);
		expect(result.message).to.equal('foo');
		expect(result.issues).to.deep.equal([
			{
				message: 'foo',
				isWarning: true,
				sources: [],
			},
			{
				message: 'bar',
				isWarning: false,
				sources: [
					{
						source: source1,
						helperText: '',
						notes: [],
					},
					{
						source: source2,
						helperText: 'here',
						notes: ['cool thing', 'other cool thing'],
					},
				],
			},
		]);
	});
	it('forbids adding sources without an existing issue', function () {
		const file = new File('', 'hello world!\nwelcome!\n');
		const source = file.at(0, 5);
		const builder = new ErrorBuilder();
		expect(() => builder.source(source)).to.throw(TypeError);
		expect(() => builder.source(source, 'here')).to.throw(TypeError);
	});
	it('forbids adding notes without an existing issue', function () {
		const file = new File('', 'hello world!\nwelcome!\n');
		const builder = new ErrorBuilder();
		expect(() => builder.note('hi')).to.throw(TypeError);
		expect(() => builder.note('')).to.throw(TypeError);
	});
	it('forbids adding notes without an existing source', function () {
		const file = new File('', 'hello world!\nwelcome!\n');
		const builder = new ErrorBuilder().error('foo');
		expect(() => builder.note('hi')).to.throw(TypeError);
		expect(() => builder.note('')).to.throw(TypeError);
	});
	it('forbids creating SourceErrors without any issues', function () {
		const file = new File('', 'hello world!\nwelcome!\n');
		const builder = new ErrorBuilder();
		expect(() => builder.done()).to.throw(TypeError);
	});
	it('resets its output after calling done()', function () {
		const file = new File('', 'hello world!\nwelcome!\n');
		const source = file.at(0, 5);
		const builder = new ErrorBuilder()
			.error('foo')
			.source(source, 'here')
			.note('cool thing')
			.note('other cool thing');

		expect(builder.done().issues).to.deep.equal([
			{
				message: 'foo',
				isWarning: false,
				sources: [
					{
						source: source,
						helperText: 'here',
						notes: ['cool thing', 'other cool thing'],
					},
				],
			},
		]);

		expect(() => builder.source(source)).to.throw(TypeError);
		expect(builder.warning('bar').done().issues).to.deep.equal([
			{
				message: 'bar',
				isWarning: true,
				sources: [],
			},
		]);
	});
});
