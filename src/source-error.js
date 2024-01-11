'use strict';
const ErrorBuilder = require('./error-builder');
const Printer = require('./printer');

/*
	SourceError is used to represent errors with associated source code
	information, for the purpose of printing pretty error messages.
 */

module.exports = class SourceError extends Error {
	constructor(message, issues = []) {
		if (!Array.isArray(issues)) {
			throw new TypeError('Expected issues to be an array');
		}

		super(message);
		this.issues = issues;
	}

	static build() {
		return new ErrorBuilder();
	}

	print(options) {
		const printer = new Printer(options);

		if (this.issues.length) {
			for (const issue of this.issues) {
				printer.issue(issue);
			}
		} else {
			printer.error(this.message);
		}

		return printer.done();
	}

	get name() {
		return 'SourceError';
	}
};
