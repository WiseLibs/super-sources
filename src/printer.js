'use strict';
const stringWidth = require('string-width');

/*
	A string builder for making pretty error messages and printing chunks of
	relevant source code.
 */

module.exports = class Printer {
	constructor({
		colors = true,
		filenames = true,
		lineNumbers = true,
		positions = true,
		maxLines = 7,
	} = {}) {
		if (!Number.isInteger(maxLines)) {
			throw new TypeError('Expected options.maxLines to be an integer');
		}
		if (maxLines < 3) {
			throw new RangeError('Expected options.maxLines to be at least 3');
		}

		this._prev = undefined;
		this._indent = ' ';
		this._output = '';
		this._colors = colors ? colorsEnabled : colorsDisabled;
		this._filenames = !!filenames;
		this._lineNumbers = !!lineNumbers;
		this._positions = !!positions;
		this._maxLines = maxLines;
	}

	error(message) {
		if (typeof message !== 'string') {
			throw new TypeError('Expected message to be a string');
		}

		this._indent = ' ';
		this._output += this._colors.red(`Error: ${message}`) + '\n';
		return this;
	}

	warning(message) {
		if (typeof message !== 'string') {
			throw new TypeError('Expected message to be a string');
		}

		this._indent = ' ';
		this._output += this._colors.yellow(`Warning: ${message}`) + '\n';
		return this;
	}

	source(source, helperText = '') {
		if (typeof helperText !== 'string') {
			throw new TypeError('Expected helperText to be a string');
		}

		const { red, blue } = this._colors;
		const { lines: rawLines, lineNumber, x1, x2 } = source.lines();
		const lines = rawLines.map((x, i) => (this._positions && i > 0 ? red('| ') : '  ') + x);
		const indent = this._lineNumbers
			? ' '.repeat(String(lineNumber + lines.length - 1).length)
			: ' ';
		const guides = this._lineNumbers
			? lines.map((_, i) => String(lineNumber + i).padStart(indent.length) + ' | ')
			: lines.map(() => '  | ');
		const header = this._filenames && (!this._prev || this._prev.file !== source.file)
			? blue(`${indent}--> ${source.file.filename}`) + '\n'
			: '';

		if (lines.length > this._maxLines) {
			const skip = this._maxLines === 3 ? 1 : Math.ceil(this._maxLines / 2);
			const erase = lines.length - this._maxLines + 1;
			guides.splice(skip, erase, '.'.repeat(indent.length + 1) + '  ');
			lines.splice(skip, erase, this._positions ? red('| ') : '  ');
		}

		if (this._positions) {
			if (helperText) {
				helperText = ' ' + helperText;
			}

			const w1 = stringWidth(rawLines[0].slice(0, x1));
			const w2 = stringWidth(rawLines[rawLines.length - 1].slice(0, x2)) + (x2 > rawLines[rawLines.length - 1].length ? 1 : 0);
			if (lines.length > 1) {
				guides.splice(1, 0, indent + ' | ');
				lines.splice(1, 0, red(' ' + '_'.repeat(w1 + 1) + '^'));
				lines.push(red('|' + '_'.repeat(w2) + '^' + helperText));
			} else {
				lines.push(red(' '.repeat(w1 + 2) + '^'.repeat(w2 - w1) + helperText));
			}
		} else {
			lines.push('  ');
		}

		guides.push(indent + ' | ');
		guides.unshift(indent + ' | ');
		lines.unshift('  ');

		this._prev = source;
		this._indent = indent;
		this._output += header + lines.map((x, i) => blue(guides[i]) + x).join('\n') + '\n\n';
		return this;
	}

	note(message) {
		if (typeof message !== 'string') {
			throw new TypeError('Expected message to be a string');
		}

		if (this._output.endsWith('\n\n')) this._output = this._output.slice(0, -1);
		this._output += this._colors.blue(`${this._indent} * ${message}`) + '\n\n';
		return this;
	}

	issue(issue) {
		if (issue.isWarning) {
			this.warning(issue.message);
		} else {
			this.error(issue.message);
		}

		for (const sourceRef of issue.sources) {
			this.source(sourceRef.source, sourceRef.helperText);

			for (const note of sourceRef.notes) {
				this.note(note);
			}
		}

		return this;
	}

	done() {
		const output = this._output.slice(0, -1);
		this._output = '';
		return output;
	}
};

const colorsEnabled = {
	red: (x) => `\x1b[31m\x1b[1m${x}\x1b[0m`,
	blue: (x) => `\x1b[34m\x1b[1m${x}\x1b[0m`,
	yellow: (x) => `\x1b[33m\x1b[1m${x}\x1b[0m`,
};

const colorsDisabled = {
	red: (x) => '' + x,
	blue: (x) => '' + x,
	yellow: (x) => '' + x,
};
