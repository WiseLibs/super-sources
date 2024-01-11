'use strict';
const { expect } = require('chai');
const { Printer, File } = require('..');

const red ='\x1b[31m\x1b[1m';
const blue ='\x1b[34m\x1b[1m';
const yellow ='\x1b[33m\x1b[1m';
const normal = '\x1b[0m';

describe('Printer', function () {
	specify('stress test (default options)', function () {
		const file1 = new File('info.txt', '\n\n\n\n\nhello!\r\n\n\n\nworld!\nhooray!\r\n');
		const file2 = new File('other.txt', 'small file');
		const printer = new Printer()
			.error('first issue (error)')
			.error('second issue (error)')
			.source(file1.at(5, 8), 'here')
			.note('this says hello')
			.warning('third issue (warning)')
			.source(file1.at(16, 8), 'also here')
			.note('this says world')
			.note('the next one will be a different file')
			.source(file2.at(10), 'and finally here');

		expect(printer.done()).to.equal(
			`${red}Error: first issue (error)${normal}\n` +
			`${red}Error: second issue (error)${normal}\n` +
			`${blue} --> info.txt${normal}\n` +
			`${blue}  | ${normal}  \n` +
			`${blue}6 | ${normal}  hello!\n` +
			`${blue}  | ${normal}${red}  ^^^^^^^ here${normal}\n` +
			`${blue}  * this says hello${normal}\n\n` +
			`${yellow}Warning: third issue (warning)${normal}\n` +
			`${blue}   | ${normal}  \n` +
			`${blue}10 | ${normal}  world!\n` +
			`${blue}   | ${normal}${red} _^${normal}\n` +
			`${blue}11 | ${normal}${red}| ${normal}hooray!\n` +
			`${blue}   | ${normal}${red}|_^ also here${normal}\n` +
			`${blue}   * this says world${normal}\n` +
			`${blue}   * the next one will be a different file${normal}\n\n` +
			`${blue} --> other.txt${normal}\n` +
			`${blue}  | ${normal}  \n` +
			`${blue}1 | ${normal}  small file\n` +
			`${blue}  | ${normal}${red}            ^ and finally here${normal}\n`
		);
	});
	specify('stress test (colors === false)', function () {
		const file1 = new File('info.txt', '\n\n\n\n\nhello!\r\n\n\n\nworld!\nhooray!\r\n');
		const file2 = new File('other.txt', 'small file');
		const printer = new Printer({ colors: false })
			.error('first issue (error)')
			.error('second issue (error)')
			.source(file1.at(5, 8), 'here')
			.note('this says hello')
			.warning('third issue (warning)')
			.source(file1.at(16, 8), 'also here')
			.note('this says world')
			.note('the next one will be a different file')
			.source(file2.at(10), 'and finally here');

		expect(printer.done()).to.equal(
			'Error: first issue (error)\n' +
			'Error: second issue (error)\n' +
			' --> info.txt\n' +
			'  |   \n' +
			'6 |   hello!\n' +
			'  |   ^^^^^^^ here\n' +
			'  * this says hello\n\n' +
			'Warning: third issue (warning)\n' +
			'   |   \n' +
			'10 |   world!\n' +
			'   |  _^\n' +
			'11 | | hooray!\n' +
			'   | |_^ also here\n' +
			'   * this says world\n' +
			'   * the next one will be a different file\n\n' +
			' --> other.txt\n' +
			'  |   \n' +
			'1 |   small file\n' +
			'  |             ^ and finally here\n'
		);
	});
	specify('stress test (filenames === false)', function () {
		const file1 = new File('info.txt', '\n\n\n\n\nhello!\r\n\n\n\nworld!\nhooray!\r\n');
		const file2 = new File('other.txt', 'small file');
		const printer = new Printer({ colors: false, filenames: false })
			.error('first issue (error)')
			.error('second issue (error)')
			.source(file1.at(5, 8), 'here')
			.note('this says hello')
			.warning('third issue (warning)')
			.source(file1.at(16, 8), 'also here')
			.note('this says world')
			.note('the next one will be a different file')
			.source(file2.at(10), 'and finally here');

		expect(printer.done()).to.equal(
			'Error: first issue (error)\n' +
			'Error: second issue (error)\n' +
			'  |   \n' +
			'6 |   hello!\n' +
			'  |   ^^^^^^^ here\n' +
			'  * this says hello\n\n' +
			'Warning: third issue (warning)\n' +
			'   |   \n' +
			'10 |   world!\n' +
			'   |  _^\n' +
			'11 | | hooray!\n' +
			'   | |_^ also here\n' +
			'   * this says world\n' +
			'   * the next one will be a different file\n\n' +
			'  |   \n' +
			'1 |   small file\n' +
			'  |             ^ and finally here\n'
		);
	});
	specify('stress test (lineNumbers === false)', function () {
		const file1 = new File('info.txt', '\n\n\n\n\nhello!\r\n\n\n\nworld!\nhooray!\r\n');
		const file2 = new File('other.txt', 'small file');
		const printer = new Printer({ colors: false, lineNumbers: false })
			.error('first issue (error)')
			.error('second issue (error)')
			.source(file1.at(5, 8), 'here')
			.note('this says hello')
			.issue({
				message: 'third issue (warning)',
				isWarning: true,
				sources: [
					{
						source: file1.at(16, 8),
						helperText: 'also here',
						notes: ['this says world', 'the next one will be a different file'],
					},
					{
						source: file2.at(10),
						helperText: 'and finally here',
						notes: [],
					},
				],
			});

		expect(printer.done()).to.equal(
			'Error: first issue (error)\n' +
			'Error: second issue (error)\n' +
			' --> info.txt\n' +
			'  |   \n' +
			'  |   hello!\n' +
			'  |   ^^^^^^^ here\n' +
			'  * this says hello\n\n' +
			'Warning: third issue (warning)\n' +
			'  |   \n' +
			'  |   world!\n' +
			'  |  _^\n' +
			'  | | hooray!\n' +
			'  | |_^ also here\n' +
			'  * this says world\n' +
			'  * the next one will be a different file\n\n' +
			' --> other.txt\n' +
			'  |   \n' +
			'  |   small file\n' +
			'  |             ^ and finally here\n'
		);
	});
	specify('stress test (positions === false)', function () {
		const file1 = new File('info.txt', '\n\n\n\n\nhello!\r\n\n\n\nworld!\nhooray!\r\n');
		const file2 = new File('other.txt', 'small file');
		const printer = new Printer({ colors: false, positions: false })
			.error('first issue (error)')
			.error('second issue (error)')
			.source(file1.at(5, 8), 'here')
			.note('this says hello')
			.warning('third issue (warning)')
			.source(file1.at(16, 8), 'also here')
			.note('this says world')
			.note('the next one will be a different file')
			.source(file2.at(10), 'and finally here');

		expect(printer.done()).to.equal(
			'Error: first issue (error)\n' +
			'Error: second issue (error)\n' +
			' --> info.txt\n' +
			'  |   \n' +
			'6 |   hello!\n' +
			'  |   \n' +
			'  * this says hello\n\n' +
			'Warning: third issue (warning)\n' +
			'   |   \n' +
			'10 |   world!\n' +
			'11 |   hooray!\n' +
			'   |   \n' +
			'   * this says world\n' +
			'   * the next one will be a different file\n\n' +
			' --> other.txt\n' +
			'  |   \n' +
			'1 |   small file\n' +
			'  |   \n'
		);
	});
	specify('stress test (lineNumbers === false && positions === false)', function () {
		const file1 = new File('info.txt', '\n\n\n\n\nhello!\r\n\n\n\nworld!\nhooray!\r\n');
		const file2 = new File('other.txt', 'small file');
		const printer = new Printer({ colors: false, lineNumbers: false, positions: false })
			.error('first issue (error)')
			.error('second issue (error)')
			.source(file1.at(5, 8), 'here')
			.note('this says hello')
			.warning('third issue (warning)')
			.source(file1.at(16, 8), 'also here')
			.note('this says world')
			.note('the next one will be a different file')
			.source(file2.at(10), 'and finally here');

		expect(printer.done()).to.equal(
			'Error: first issue (error)\n' +
			'Error: second issue (error)\n' +
			' --> info.txt\n' +
			'  |   \n' +
			'  |   hello!\n' +
			'  |   \n' +
			'  * this says hello\n\n' +
			'Warning: third issue (warning)\n' +
			'  |   \n' +
			'  |   world!\n' +
			'  |   hooray!\n' +
			'  |   \n' +
			'  * this says world\n' +
			'  * the next one will be a different file\n\n' +
			' --> other.txt\n' +
			'  |   \n' +
			'  |   small file\n' +
			'  |   \n'
		);
	});
	specify('stress test (maxLines === 3)', function () {
		const file = new File('info.txt', '\n\n\n\n\nhello!\r\n\n\n\nworld!\nhooray!\r\n');
		const printer = new Printer({ colors: false, maxLines: 3 })
			.error('foo')
			.source(file.at(5, 17), 'here')

		expect(printer.done()).to.equal(
			'Error: foo\n' +
			'  --> info.txt\n' +
			'   |   \n' +
			' 6 |   hello!\n' +
			'   |  _^\n' +
			'...  | \n' +
			'10 | | world!\n' +
			'   | |______^ here\n'
		);
	});
	it('resets its output after calling done()', function () {
		const file1 = new File('info.txt', 'first file');
		const file2 = new File('other.txt', 'second file');
		const printer = new Printer({ colors: false })
			.error('foo')
			.source(file1.at(0), 'here')
			.error('bar')
			.source(file1.at(1));

		expect(printer.done()).to.equal(
			'Error: foo\n' +
			' --> info.txt\n' +
			'  |   \n' +
			'1 |   first file\n' +
			'  |   ^ here\n\n' +
			'Error: bar\n' +
			'  |   \n' +
			'1 |   first file\n' +
			'  |    ^\n'
		);

		printer
			.error('baz')
			.source(file1.at(1), 'also here')
			.error('qux')
			.source(file2.at(0));

		expect(printer.done()).to.equal(
			'Error: baz\n' +
			'  |   \n' +
			'1 |   first file\n' +
			'  |    ^ also here\n\n' +
			'Error: qux\n' +
			' --> other.txt\n' +
			'  |   \n' +
			'1 |   second file\n' +
			'  |   ^\n'
		);
	});
});
