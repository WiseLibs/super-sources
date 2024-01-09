'use strict';
const File = require('./file');

/*
	An object representing a piece of source code.
 */

module.exports = class Source {
	constructor(file, start, end) {
		if (!(file instanceof File)) {
			throw new TypeError('Expected file to be a File object');
		}
		if (!Number.isInteger(start)) {
			throw new TypeError('Expected start to be an integer');
		}
		if (!Number.isInteger(end)) {
			throw new TypeError('Expected end to be an integer');
		}
		if (start < 0) {
			throw new RangeError('Expected start to be non-negative');
		}
		if (end <= start) {
			throw new RangeError('Expected end to be greater than start');
		}
		if (end > file.content.length + 1) {
			throw new RangeError('Expected end to be less than or equal to the file length + 1');
		}

		this.file = file;
		this.start = start;
		this.end = end;
	}

	to(other) {
		if (!(other instanceof Source)) {
			throw new TypeError('Expected argument to be a Source object');
		}
		if (other.file !== this.file) {
			throw new TypeError('Expected both Source objects to share the same file');
		}
		return new Source(this.file, this.start, other.end);
	}

	string() {
		return this.file.content.slice(this.start, this.end);
	}

	error(message, helperText) {
		if (typeof message !== 'string') {
			throw new TypeError('Expected message to be a string');
		}
		if (typeof helperText !== 'string' && helperText !== undefined) {
			throw new TypeError('Expected helperText to be a string or undefined');
		}
		return new ErrorBuilder().error(message).source(this, helperText);
	}

	warning(message, helperText) {
		if (typeof message !== 'string') {
			throw new TypeError('Expected message to be a string');
		}
		if (typeof helperText !== 'string' && helperText !== undefined) {
			throw new TypeError('Expected helperText to be a string or undefined');
		}
		return new ErrorBuilder().warning(message).source(this, helperText);
	}

	lines() {
		const { file: { content }, file, start, end } = this;
		const printStart = content.lastIndexOf('\n', start - 1) + 1;
		const printEnd = indexOfNextNewline(content, end - 1);
		const printEndLineStart = content.lastIndexOf('\n', printEnd - 1) + 1;
		const lines = content.slice(printStart, printEnd).split(/\r?\n/).map(cleanString);
		const x1 = cleanString(content.slice(printStart, start)).length;
		const x2 = cleanString(content.slice(printEndLineStart, end)).length + (end > content.length ? 1 : 0);
		const lineNumber = file.lineNumberAt(printStart);
		return { lines, lineNumber, x1, x2 };
	}
};

function indexOfNextNewline(content, initialIndex) {
	const index = content.indexOf('\n', initialIndex);
	if (index < 0) return content.length;
	if (content[index - 1] === '\r') return index - 1;
	return index;
}

function cleanString(content) {
	return content
		.replace(/\t/g, '    ')
		.replace(/\p{White_Space}/gu, ' ')
		.replace(/[\p{Cc}\p{Cs}\p{Cn}\p{Co}\p{Noncharacter_Code_Point}\ufeff]/gu, '\ufffd');
}

// Required here because of circular dependencies.
const ErrorBuilder = require('./error-builder');
