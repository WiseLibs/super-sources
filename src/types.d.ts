declare namespace SuperSources {
	class File {
		readonly filename: string;
		readonly content: string;

		constructor(filename: string, content: string);
		at(offset: number, length?: number): Source;
		lineNumberAt(offset: number): number;
	}

	class Source {
		readonly file: File;
		readonly start: number;
		readonly end: number;

		constructor(file: File, start: number, end: number);
		to(other: Source): Source;
		string(): string;
		error(message: string, helperText?: string): ErrorBuilder;
		warning(message: string, helperText?: string): ErrorBuilder;
		lines(): DisplayLines;
	}

	class SourceError extends Error {
		readonly message: string;
		public issues: Issue[];

		constructor(message: string, issues?: Issue[]);
		static build(): ErrorBuilder;
		print(options?: PrinterOptions): string;
	}

	class ErrorBuilder {
		error(message: string): this;
		warning(message: string): this;
		source(source: Source, helperText?: string): this;
		note(message: string): this;
		done(): SourceError;
		throw(): never;
	}

	class Printer {
		constructor(options?: PrinterOptions);
		error(message: string): this;
		warning(message: string): this;
		source(source: Source, helperText?: string): this;
		note(message: string): this;
		issue(issue: Issue): this;
		done(): string;
	}

	interface Issue {
		message: string;
		sources: SourceRef[];
		isWarning: boolean;
	}

	interface SourceRef {
		source: Source;
		helperText: string;
		notes: string[];
	}

	interface DisplayLines {
		lines: string[];
		lineNumber: number;
		x1: number;
		x2: number;
	}

	interface PrinterOptions {
		colors?: boolean;
		filenames?: boolean;
		lineNumbers?: boolean;
		positions?: boolean;
		maxLines?: number;
	}
}

export = SuperSources;
