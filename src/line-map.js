'use strict';

/*
	LineMap is a data structure that provides quick access to the line number of
	any offset within a file's content. It creates a sorted array of line
	positions, and uses binary search to find which line the given offset falls
	within.
 */

module.exports = class LineMap {
	constructor(content) {
		if (typeof content !== 'string') {
			throw new TypeError('Expected content to be a string');
		}

		const data = [];
		let pos = 0;

		for (;;) {
			data.push(pos);

			const index = content.indexOf('\n', pos);
			if (index >= 0) {
				pos = index + 1;
			} else {
				break;
			}
		}

		this._data = data;
	}

	find(offset) {
		if (!Number.isInteger(offset)) {
			throw new TypeError('Expected offset to be an integer');
		}

		const data = this._data;
		let left = 0;
		let right = data.length - 1;

		while (left < right) {
			const center = Math.ceil((left + right) / 2);
			const guess = data[center];
			if (guess > offset) {
				right = center - 1;
			} else if (guess < offset) {
				left = center;
			} else {
				left = center;
				right = center;
			}
		}

		return left + 1;
	}
};
