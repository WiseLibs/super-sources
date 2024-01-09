'use strict';
const LineMap = require('./line-map');
const cachedLineMap = Symbol();

/*
	An object representing an entire source code file.
	The filename is used for display purposes only.
 */

module.exports = class File {
	constructor(filename, content) {
		if (typeof filename !== 'string') {
			throw new TypeError('Expected filename to be a string');
		}
		if (typeof content !== 'string') {
			throw new TypeError('Expected content to be a string');
		}

		Object.defineProperties(this, {
			filename: {
				value: filename,
				enumerable: true,
			},
			content: {
				value: content,
				enumerable: true,
			},
			[cachedLineMap]: {
				value: null,
				writable: true,
			},
		});
	}

	at(offset, length = 1) {
		return new Source(this, offset, offset + length);
	}

	lineNumberAt(offset) {
		let lineMap = this[cachedLineMap];
		if (!lineMap) {
			lineMap = new LineMap(this.content);
			this[cachedLineMap] = lineMap;
		}
		return lineMap.find(offset);
	}
};

// Required here because of circular dependencies.
const Source = require('./source');
