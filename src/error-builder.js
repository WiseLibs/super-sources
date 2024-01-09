'use strict';
const Source = require('./source');

/*
	Provides a convenient, builder-style API for building a SourceError.
 */

module.exports = class ErrorBuilder {
	constructor() {
		this._issues = [];
	}

	error(message) {
		if (typeof message !== 'string') {
			throw new TypeError('Expected message to be a string');
		}

		this._issues.push({ message, sources: [], isWarning: false });
		return this;
	}

	warning(message) {
		if (typeof message !== 'string') {
			throw new TypeError('Expected message to be a string');
		}

		this._issues.push({ message, sources: [], isWarning: true });
		return this;
	}

	source(source, helperText = '') {
		if (!(source instanceof Source)) {
			throw new TypeError('Expected source to be a Source object');
		}
		if (typeof helperText !== 'string') {
			throw new TypeError('Expected helperText to be a string');
		}

		const lastIssue = this._issues[this._issues.length - 1];
		if (!lastIssue) {
			throw new TypeError('Source must have an associated error or warning');
		}

		lastIssue.sources.push({ source, helperText, notes: [] });
		return this;
	}

	note(message) {
		if (typeof message !== 'string') {
			throw new TypeError('Expected message to be a string');
		}

		const lastIssue = this._issues[this._issues.length - 1];
		if (!lastIssue) {
			throw new TypeError('Note must have an associated error or warning');
		}

		const lastSource = lastIssue.sources[lastIssue.sources.length - 1];
		if (!lastSource) {
			throw new TypeError('Note must have an associated source');
		}

		lastSource.notes.push(message);
		return this;
	}

	done() {
		if (!this._issues.length) {
			throw new TypeError('SourceError must have at least one error or warning');
		}

		const issues = this._issues.map(cloneIssue);
		const err = new SourceError(issues[0].message, issues);
		Error.captureStackTrace(err, ErrorBuilder.prototype.done);
		return err;
	}

	throw() {
		throw this.done();
	}
};

function cloneIssue({ message, sources, isWarning }) {
	sources = sources.map(cloneSourceRef);
	return { message, sources, isWarning };
}

function cloneSourceRef({ source, helperText, notes }) {
	notes = notes.slice();
	return { source, helperText, notes };
}

// Required here because of circular dependencies.
const SourceError = require('./source-error');
