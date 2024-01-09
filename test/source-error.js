'use strict';
const { expect } = require('chai');
const { SourceError, File } = require('..');

describe('SourceError', function () {
	it('throws if "issues" is not an array', function () {
		expect(() => new SourceError('foo', null)).to.throw(TypeError);
		expect(() => new SourceError('foo', 123)).to.throw(TypeError);
		expect(() => new SourceError('foo', 'foo')).to.throw(TypeError);
		expect(() => new SourceError('foo', { length: 1, 0: {} })).to.throw(TypeError);
		expect(() => new SourceError('foo', Object.create(Array.prototype))).to.throw(TypeError);
	});
	it('is a subclass of Error', function () {
		const err = new SourceError('foo');
		expect(err instanceof Error);
		expect(err instanceof SourceError);
		expect(Object.getPrototypeOf(SourceError) === Error);
		expect(err.message).to.equal('foo');
		expect(err.name).to.equal('SourceError');
		expect(err.issues).to.deep.equal([]);
	});
	it('prints an empty array of issues', function () {
		expect(new SourceError('foo').print({ colors: false })).to.equal('Error: foo');
		expect(new SourceError('foo', []).print({ colors: false })).to.equal('Error: foo');
	});
	it('prints a complex array of issues', function () {
		const file = new File('info.txt', 'hello world!\nwelcome!\n');
		const source1 = file.at(0, 5);
		const source2 = file.at(13, 8);
		const issues = [
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
		];

		expect(new SourceError('ignored message', issues).print({ colors: false })).to.equal(
			'Warning: foo\n' +
			'Error: bar\n' +
			' --> info.txt\n' +
			'  |   \n' +
			'1 |   hello world!\n' +
			'  |   ^^^^^\n\n' +
			'  |   \n' +
			'2 |   welcome!\n' +
			'  |   ^^^^^^^^ here\n' +
			'  * cool thing\n' +
			'  * other cool thing\n'
		);
	});
});
